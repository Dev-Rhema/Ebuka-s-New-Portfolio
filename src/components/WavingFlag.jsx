import { useEffect, useRef } from "react";
import * as THREE from "three";
import { flagStaff as staff } from "../Data";

const STAFF_W = 94;
const STAFF_H = 48;
const PENNANT = { x: 4.91, y: 15.744, w: 88.85, h: 13.25, notch: 79.498 };
const ASPECT = PENNANT.w / PENNANT.h;
const CLOTH = "black";
const TEXTURE_W = 1024;

const SIZE_W = 30;
const SIZE_H = SIZE_W / ASPECT;
const SEG_W = 30;
const SEG_H = Math.max(2, Math.round(SEG_W / ASPECT));
const AMBIENT = 0.45;
const TILT = 0.35;

const paintPennant = (logo) => {
  const { w, h, notch } = PENNANT;
  const scale = TEXTURE_W / w;
  const canvas = document.createElement("canvas");
  canvas.width = TEXTURE_W;
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  ctx.fillStyle = CLOTH;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(notch, h / 2);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  const { naturalWidth: logoW, naturalHeight: logoH } = logo;
  ctx.drawImage(logo, (notch - logoW) / 2, (h - logoH) / 2, logoW, logoH);

  return canvas;
};

const percent = (value, total) => `${(value / total) * 100}%`;

export const WavingFlag = ({
  logo,
  className = "",
  horizontal = 0.5,
  vertical = 0.3,
  swing = 0.2,
  speed = 0.3,
  pad = 0.2,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();

    const distance = (SIZE_W * 4) / 3;
    const camera = new THREE.PerspectiveCamera(
      THREE.MathUtils.radToDeg(
        2 * Math.atan((SIZE_H * (1 + 2 * pad)) / 2 / distance),
      ),
      ASPECT,
      distance / 10,
      distance * 10,
    );
    camera.position.z = distance;

    const light = new THREE.DirectionalLight();
    light.position.set(10, 50, 100);
    const facing = light.position.clone().normalize().z;
    light.intensity = ((1 - AMBIENT) / facing) * Math.PI;
    scene.add(light, new THREE.AmbientLight(0xffffff, AMBIENT * Math.PI));

    const geometry = new THREE.PlaneGeometry(SIZE_W, SIZE_H, SEG_W, SEG_H);
    const position = geometry.attributes.position;
    const rest = position.array.slice();
    const material = new THREE.MeshLambertMaterial({
      transparent: true,
      side: THREE.DoubleSide,
    });
    const flag = new THREE.Mesh(geometry, material);
    flag.visible = false;
    scene.add(flag);

    let disposed = false;
    let texture = null;
    const img = new Image();
    img.onload = () => {
      if (disposed) return;
      texture = new THREE.CanvasTexture(paintPennant(img));
      texture.colorSpace = THREE.SRGBColorSpace;
      material.map = texture;
      material.needsUpdate = true;
      flag.visible = true;
      renderer.render(scene, camera);
    };
    img.src = logo;

    const wave = (time) => {
      const t = (time / 1000) * speed * 20;
      for (let i = 0; i < position.count; i++) {
        const x = rest[i * 3] + SIZE_W / 2;
        const y = SIZE_H / 2 - rest[i * 3 + 1];
        const z = (Math.sin(horizontal * x + vertical * y - t) * swing * x) / 4;
        position.setY(i, rest[i * 3 + 1] + z * TILT);
        position.setZ(i, z);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
    };

    const resize = () => {
      const w = Math.max(canvas.clientWidth, 1);
      const h = Math.max(canvas.clientHeight, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    let visible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    intersectionObserver.observe(canvas);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frameId;
    const render = (time) => {
      frameId = requestAnimationFrame(render);
      if (!visible) return;
      if (!reducedMotion.matches) wave(time);
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      geometry.dispose();
      material.dispose();
      texture?.dispose();
      renderer.dispose();
    };
  }, [logo, horizontal, vertical, swing, speed, pad]);

  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute"
        style={{
          top: percent(PENNANT.y, STAFF_H),
          left: percent(PENNANT.x, STAFF_W),
          width: percent(PENNANT.w, STAFF_W),
          height: percent(PENNANT.h, STAFF_H),
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute"
          style={{
            top: `${-pad * 100}%`,
            left: `${-pad * 100}%`,
            width: `${(1 + 2 * pad) * 100}%`,
            height: `${(1 + 2 * pad) * 100}%`,
          }}
        />
      </div>
      <img
        loading="lazy"
        src={staff}
        alt=""
        className="pointer-events-none relative size-full"
      />
    </div>
  );
};
