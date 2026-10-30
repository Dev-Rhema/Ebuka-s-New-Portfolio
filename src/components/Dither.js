import { useEffect, useRef } from "react";

const CONTRAST = 0.9;
const DOT = 1;
const GRAIN = 1.5;
const GRAIN_STRENGTH = 0.25;
const SPRITE_STRIPS = 16;

const VERTEX = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = vec2(p.x * 0.5 + 0.5, 0.5 - p.y * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAGMENT = `
precision mediump float;
varying vec2 uv;
uniform sampler2D source;
uniform sampler2D bayer;
uniform vec2 cellOffset;
uniform vec2 cellScale;
uniform float dotSize;
uniform float grain;
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
  vec4 c = texture2D(source, cellOffset + uv * cellScale);
  if (c.a < 0.004) {
    gl_FragColor = vec4(0.0);
    return;
  }
  vec3 rgb = (c.rgb - 0.5) * ${CONTRAST.toFixed(2)} + 0.5;
  rgb *= 1.0 - ${GRAIN_STRENGTH.toFixed(2)} * hash(floor(gl_FragCoord.xy / grain));
  vec2 cell = mod(floor(gl_FragCoord.xy / dotSize), 16.0);
  float threshold = (texture2D(bayer, (cell + 0.5) / 16.0).r * 255.0 + 0.5) / 256.0;
  rgb = clamp(floor(rgb + threshold), 0.0, 1.0);
  gl_FragColor = vec4(rgb * c.a, c.a);
}`;

const bayerMatrix = () => {
  let m = [[0]];
  while (m.length < 16) {
    const n = m.length;
    const next = Array.from({ length: n * 2 }, () => []);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = m[y][x] * 4;
        next[y][x] = v;
        next[y][x + n] = v + 2;
        next[y + n][x] = v + 3;
        next[y + n][x + n] = v + 1;
      }
    }
    m = next;
  }
  return new Uint8Array(m.flat());
};

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
};

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ditherProgram(gl) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (import.meta.env.DEV) {
      console.warn("Dither: shader failed", gl.getProgramInfoLog(program));
    }
    return null;
  }
  gl.useProgram(program);
  const uniform = (name) => gl.getUniformLocation(program, name);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const p = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(p);
  gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

  const texture = (unit, filter) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  texture(1, gl.NEAREST);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    16,
    16,
    0,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    bayerMatrix(),
  );
  texture(0, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.uniform1i(uniform("source"), 0);
  gl.uniform1i(uniform("bayer"), 1);
  gl.uniform2f(uniform("cellOffset"), 0, 0);
  gl.uniform2f(uniform("cellScale"), 1, 1);
  gl.uniform1f(uniform("dotSize"), DOT);
  gl.uniform1f(uniform("grain"), GRAIN);
  return uniform;
}

// One WebGL context dithers every image on the page. Each image draws into its own
// 2D canvas, so the page never holds more than one context however many images it has.
let shared;
const sharedRenderer = () => {
  if (shared !== undefined) return shared;
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true });
  const uniform = gl && ditherProgram(gl);
  if (!uniform) return (shared = null);
  shared = {
    gl,
    canvas,
    cellOffset: uniform("cellOffset"),
    cellScale: uniform("cellScale"),
  };
  return shared;
};

const createTexture = (gl) => {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return texture;
};

// The <img> already downloaded the file, so read it from the HTTP cache rather than the network.
const decodeImage = (src, options) =>
  fetch(src, { cache: "force-cache" })
    .then((response) => response.blob())
    .then((blob) => createImageBitmap(blob, options));

// Sprite sheets are large, so each one is decoded and uploaded once and shared by
// every image showing it. The upload runs in strips, one per frame, to avoid a long stall.
const sprites = new Map();

const acquireSprite = (src) => {
  let entry = sprites.get(src);
  if (!entry) {
    const { gl } = shared;
    entry = { texture: createTexture(gl), users: 0, deleted: false };
    entry.ready = decodeImage(src, { premultiplyAlpha: "none" }).then(
      (bitmap) =>
        new Promise((resolve, reject) => {
          const { width, height } = bitmap;
          const strip = Math.ceil(height / SPRITE_STRIPS);
          gl.bindTexture(gl.TEXTURE_2D, entry.texture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            width,
            height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
          );
          const next = (y) => {
            if (entry.deleted) return bitmap.close();
            const h = Math.min(strip, height - y);
            createImageBitmap(bitmap, 0, y, width, h, {
              premultiplyAlpha: "none",
            }).then((part) => {
              if (!entry.deleted) {
                gl.bindTexture(gl.TEXTURE_2D, entry.texture);
                gl.texSubImage2D(
                  gl.TEXTURE_2D,
                  0,
                  0,
                  y,
                  gl.RGBA,
                  gl.UNSIGNED_BYTE,
                  part,
                );
              }
              part.close();
              if (y + h < height)
                return requestAnimationFrame(() => next(y + h));
              bitmap.close();
              resolve();
            }, reject);
          };
          next(0);
        }),
    );
    sprites.set(src, entry);
  }
  entry.users++;
  return entry;
};

const releaseSprite = (src) => {
  const entry = sprites.get(src);
  if (--entry.users > 0) return;
  entry.deleted = true;
  shared.gl.deleteTexture(entry.texture);
  sprites.delete(src);
};

export function useDither(imageRef, sprite, watchRef) {
  const canvasRef = useRef(null);
  // Without WebGL the plain image shows instead.
  const active = sharedRenderer() !== null;

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    const renderer = sharedRenderer();
    if (!renderer) return;
    const { gl } = renderer;
    const ctx = canvas.getContext("2d");

    let disposed = false;
    let source = null;
    let texture = null;
    let frame = 0;

    // Dithers the current frame in the shared context, then copies it into this canvas.
    const draw = () => {
      if (!texture || !canvas.width) return;
      const { width: w, height: h } = canvas;
      const target = renderer.canvas;
      if (target.width < w || target.height < h) {
        target.width = Math.max(target.width, w);
        target.height = Math.max(target.height, h);
      }
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (sprite) {
        const [cw, ch] = sprite.cell;
        const col = frame % sprite.cols;
        const row = Math.floor(frame / sprite.cols);
        const { naturalWidth: sw, naturalHeight: sh } = image;
        gl.uniform2f(
          renderer.cellOffset,
          (col * (cw + sprite.gap)) / sw,
          (row * (ch + sprite.gap)) / sh,
        );
        gl.uniform2f(renderer.cellScale, cw / sw, ch / sh);
      } else {
        gl.uniform2f(renderer.cellOffset, 0, 0);
        gl.uniform2f(renderer.cellScale, 1, 1);
      }
      gl.viewport(0, target.height - h, w, h);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(target, 0, 0, w, h, 0, 0, w, h);
    };

    // Still images are resampled to the canvas size before dithering, so they upload on every resize.
    const raster = document.createElement("canvas");
    const uploadStill = () => {
      if (!source || !canvas.width) return;
      raster.width = canvas.width;
      raster.height = canvas.height;
      raster
        .getContext("2d")
        .drawImage(source, 0, 0, raster.width, raster.height);
      texture ??= createTexture(gl);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        raster,
      );
    };

    let spriteSrc = null;
    const load = () => {
      if (spriteSrc || source || !image.complete || !image.naturalWidth) return;
      if (sprite) {
        spriteSrc = image.currentSrc;
        const entry = acquireSprite(spriteSrc);
        entry.ready.then(
          () => {
            if (disposed) return;
            texture = entry.texture;
            draw();
          },
          () => {},
        );
        return;
      }
      decodeImage(image.currentSrc).then(
        (bitmap) => {
          if (disposed) return bitmap.close();
          source = bitmap;
          uploadStill();
          draw();
        },
        () => {},
      );
    };

    const resize = () => {
      const scale = 1440 / document.documentElement.clientWidth;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (!sprite) uploadStill();
      draw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    image.addEventListener("load", load);
    load();

    // Sprites animate only while on screen; the loop stops entirely when they scroll away.
    // A moving sprite can pass a fixed element to watch, so it is already on the right
    // frame when it comes back into view. The page clock keeps every copy in step.
    let frameId = 0;
    const tick = (time) => {
      frameId = requestAnimationFrame(tick);
      const next = Math.floor((time / 1000) * sprite.fps) % sprite.count;
      if (next === frame) return;
      frame = next;
      draw();
    };
    const intersection = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frameId);
      if (entry.isIntersecting) frameId = requestAnimationFrame(tick);
    });
    if (sprite && !reducedMotion()) {
      intersection.observe(watchRef?.current ?? canvas);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      intersection.disconnect();
      resizeObserver.disconnect();
      image.removeEventListener("load", load);
      source?.close();
      if (spriteSrc) releaseSprite(spriteSrc);
      else if (texture) gl.deleteTexture(texture);
    };
  }, [imageRef, sprite, watchRef]);

  return { canvasRef, active };
}
