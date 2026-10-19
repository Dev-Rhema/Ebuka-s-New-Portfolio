import { useEffect, useRef, useState } from "react";

// Figma's effects on the footer knight and grass, drawn live in WebGL
// (matched against a Figma export of the design):
// - Monotone noise: black, 25%, size 1.5
// - Dither: Bayer 16×16, size 1, 2 levels, brightness 100%, contrast 0.9
const CONTRAST = 0.9;
const DOT = 1; // design px (of the 1440-wide layout)
const GRAIN = 1.5; // design px
const GRAIN_STRENGTH = 0.25;

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
  // monotone noise: black grain
  rgb *= 1.0 - ${GRAIN_STRENGTH.toFixed(2)} * hash(floor(gl_FragCoord.xy / grain));
  // ordered dither to 2 levels per channel
  vec2 cell = mod(floor(gl_FragCoord.xy / dotSize), 16.0);
  float threshold = (texture2D(bayer, (cell + 0.5) / 16.0).r * 255.0 + 0.5) / 256.0;
  rgb = clamp(floor(rgb + threshold), 0.0, 1.0);
  gl_FragColor = vec4(rgb * c.a, c.a);
}`;

// Bayer 16×16 thresholds, 0..255
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

// Draws the <img> in `imageRef` dithered into the returned canvas. With
// `sprite` ({ cols, count, fps, cell: [w, h], gap }) the image is a sheet of
// frames, played in a loop while the canvas is on screen. `active` turns
// false if WebGL can't run, so the caller shows the plain image instead.
export function useDither(imageRef, sprite) {
  const canvasRef = useRef(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true });
    if (!gl) {
      setActive(false);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (import.meta.env.DEV) {
        console.warn("Dither: shader failed", gl.getProgramInfoLog(program));
      }
      setActive(false);
      return;
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
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, 16, 16, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bayerMatrix());
    texture(0, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.uniform1i(uniform("source"), 0);
    gl.uniform1i(uniform("bayer"), 1);
    gl.uniform2f(uniform("cellOffset"), 0, 0);
    gl.uniform2f(uniform("cellScale"), 1, 1);

    // A sprite sheet goes up once; any other image (an SVG) is drawn at the
    // canvas's size first, so it stays sharp, and again on each resize
    const raster = document.createElement("canvas");
    let uploaded = false;
    const upload = () => {
      if (!image.complete || !image.naturalWidth || !canvas.width) return;
      if (sprite) {
        if (uploaded) return;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      } else {
        raster.width = canvas.width;
        raster.height = canvas.height;
        raster.getContext("2d").drawImage(image, 0, 0, raster.width, raster.height);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, raster);
      }
      uploaded = true;
    };

    let frame = 0;
    const draw = () => {
      if (!uploaded) return;
      if (sprite) {
        const [w, h] = sprite.cell;
        const col = frame % sprite.cols;
        const row = Math.floor(frame / sprite.cols);
        const { naturalWidth: sw, naturalHeight: sh } = image;
        gl.uniform2f(uniform("cellOffset"), (col * (w + sprite.gap)) / sw, (row * (h + sprite.gap)) / sh);
        gl.uniform2f(uniform("cellScale"), w / sw, h / sh);
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const resize = () => {
      // Like Figma, the effect is worked out at the design's resolution (the
      // 1440-wide layout's px) and the browser scales the canvas up
      // smoothly, which softens the dots into Figma's texture
      const scale = 1440 / document.documentElement.clientWidth;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale));
      gl.uniform1f(uniform("dotSize"), DOT);
      gl.uniform1f(uniform("grain"), GRAIN);
      if (!sprite) uploaded = false;
      upload();
      draw();
    };
    const onLoad = () => {
      upload();
      draw();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    image.addEventListener("load", onLoad);

    // Play the sprite, only while the canvas is on screen
    let frameId;
    let visible = false;
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    if (sprite && !reducedMotion()) {
      intersection.observe(canvas);
      let start;
      const tick = (time) => {
        frameId = requestAnimationFrame(tick);
        start ??= time;
        if (!visible) return;
        const next = Math.floor(((time - start) / 1000) * sprite.fps) % sprite.count;
        if (next === frame) return;
        frame = next;
        draw();
      };
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(frameId);
      intersection.disconnect();
      resizeObserver.disconnect();
      image.removeEventListener("load", onLoad);
      // The context is left alive: a remount (React's StrictMode does one)
      // gets this same canvas's context back, and a lost one can't draw
    };
  }, [imageRef, sprite]);

  return { canvasRef, active };
}
