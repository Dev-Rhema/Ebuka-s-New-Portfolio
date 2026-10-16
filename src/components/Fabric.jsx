import { useEffect, useRef } from "react";

const VERTEX = `
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
uniform float uTime;
uniform vec2 uMousePosition;
uniform float uMouseStrength;
uniform vec2 uScale;
uniform vec2 uCanvas;
uniform float uF;
uniform float uD;
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
void main() {
  vec3 vertexPosition = aVertexPosition;
  float distanceFromMouse = distance(uMousePosition, vertexPosition.xy);
  float rippleEffect = cos(6.0 * (distanceFromMouse - (uTime / 120.0)));
  float distortionEffect = rippleEffect * uMouseStrength;
  vertexPosition += distortionEffect / 30.0;
  vec3 world = vec3(vertexPosition.x * uScale.x, vertexPosition.y * uScale.y, vertexPosition.z * uScale.x);
  float w = uD - world.z;
  gl_Position = vec4(world.x * uF / (uCanvas.x / uCanvas.y), world.y * uF, 0.0, w);
  vTextureCoord = aTextureCoord;
  vVertexPosition = vertexPosition;
}`;

const FRAGMENT = `
precision mediump float;
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
uniform sampler2D uSampler0;
void main() {
  vec4 finalColor = texture2D(uSampler0, vTextureCoord);
  finalColor.rgb -= clamp(-vVertexPosition.z * 5.0, 0.0, 1.0);
  finalColor.rgb += clamp(vVertexPosition.z * 1.5, 0.0, 1.0);
  finalColor = vec4(finalColor.rgb * finalColor.a, finalColor.a);
  gl_FragColor = finalColor;
}`;

const SEGMENTS = 20;
const FOV_F = 1 / Math.tan((35 * Math.PI) / 180 / 2);

// Fills its parent with `image`, which ripples out from the cursor.
export const Fabric = ({ image, style }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const pos = [];
    const uvs = [];
    const idx = [];
    for (let j = 0; j <= SEGMENTS; j++) {
      for (let i = 0; i <= SEGMENTS; i++) {
        const x = (i / SEGMENTS) * 2 - 1;
        const y = (j / SEGMENTS) * 2 - 1;
        pos.push(x, y, 0);
        uvs.push((x + 1) / 2, (y + 1) / 2);
      }
    }
    for (let r = 0; r < SEGMENTS; r++) {
      for (let q = 0; q < SEGMENTS; q++) {
        const a = r * (SEGMENTS + 1) + q;
        const b = a + 1;
        const d = a + SEGMENTS + 1;
        const e = d + 1;
        idx.push(a, b, d, b, e, d);
      }
    }

    const bindAttrib = (data, name, size) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    };
    bindAttrib(pos, "aVertexPosition", 3);
    bindAttrib(uvs, "aTextureCoord", 2);

    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(idx),
      gl.STATIC_DRAW,
    );

    const U = {};
    [
      "uTime",
      "uMousePosition",
      "uMouseStrength",
      "uScale",
      "uCanvas",
      "uF",
      "uD",
      "uSampler0",
    ].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

    const tex = gl.createTexture();
    let dpr = 1;
    let halfW = 1;
    let halfH = 1;
    let img = null;

    const buildTexture = () => {
      const tw = Math.round(halfW * 2);
      const th = Math.round(halfH * 2);
      const t2d = document.createElement("canvas");
      t2d.width = tw;
      t2d.height = th;
      const ctx = t2d.getContext("2d");
      if (img) {
        // object-fit: cover
        const s = Math.max(tw / img.naturalWidth, th / img.naturalHeight);
        const dw = img.naturalWidth * s;
        const dh = img.naturalHeight * s;
        ctx.drawImage(img, (tw - dw) / 2, (th - dh) / 2, dw, dh);
      }
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, t2d);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(canvas.clientWidth, 240);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(Math.max(canvas.clientHeight, 1) * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      // Slight overscan so the ripple doesn't pull the edges into view.
      halfW = canvas.width * 0.52;
      halfH = canvas.height * 0.52;
      buildTexture();
    };

    let cancelled = false;
    const el = new Image();
    el.onload = () => {
      if (cancelled) return;
      img = el;
      buildTexture();
    };
    el.src = image;

    let mousePos = [0, 0];
    let strength = 1;
    let time = 0;
    let raf = 0;

    const handleMove = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect();
      const px = (clientX - r.left) * dpr;
      const py = (clientY - r.top) * dpr;
      mousePos = [
        (px - canvas.width / 2) / halfW,
        -(py - canvas.height / 2) / halfH,
      ];
      strength = 1;
    };
    const onMouse = (e) => handleMove(e.clientX, e.clientY);
    const onTouch = (e) =>
      handleMove(e.touches[0].clientX, e.touches[0].clientY);

    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const frame = () => {
      time += 1;
      strength = Math.max(0, strength - 0.0075);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(U.uTime, time);
      gl.uniform2f(U.uMousePosition, mousePos[0], mousePos[1]);
      gl.uniform1f(U.uMouseStrength, strength);
      gl.uniform2f(U.uScale, halfW, halfH);
      gl.uniform2f(U.uCanvas, canvas.width, canvas.height);
      gl.uniform1f(U.uF, FOV_F);
      gl.uniform1f(U.uD, (FOV_F * canvas.height) / 2);
      gl.uniform1i(U.uSampler0, 0);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchmove", onTouch);
      ro.disconnect();
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
    };
  }, [image]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        cursor: "cell",
        ...style,
      }}
    />
  );
};
