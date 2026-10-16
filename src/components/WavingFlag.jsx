import { useEffect, useRef } from "react";
import * as THREE from "three";

// After https://codepen.io/okada-web/pen/OJydGzy: the cloth is a lit plane
// whose depth follows a travelling sine wave, growing with distance from the
// pole. Lengths are in the pen's units, where the flag is 30 wide.
const SIZE_W = 30;
const SEG_W = 30;
// Share of the resting brightness from ambient light; the rest comes from the
// directional light, so the flat flag matches the original artwork
const AMBIENT = 0.45;
// How much depth shows as vertical shift, as if seen from slightly above.
// Shading barely shows on dark cloth, so this is what makes the edges ripple.
const TILT = 0.35;

// Fills its parent with `image` as a flag attached to a pole on the left.
// `pad`: how far the canvas overhangs the box on each side (fraction of its
// size), so the waving cloth isn't cut off.
export const WavingFlag = ({
  image,
  horizontal = 0.5,
  vertical = 0.3,
  swing = 0.2,
  speed = 0.5,
  pad = 0.2,
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = canvas.parentElement;
    const aspect = box.clientWidth / box.clientHeight || 1;
    const sizeH = SIZE_W / aspect;
    const segH = Math.max(2, Math.round(SEG_W / aspect));

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();

    // As in the pen, 40 away from a flag 30 wide
    const distance = (SIZE_W * 4) / 3;
    const camera = new THREE.PerspectiveCamera(
      THREE.MathUtils.radToDeg(
        2 * Math.atan((sizeH * (1 + 2 * pad)) / 2 / distance),
      ),
      aspect,
      distance / 10,
      distance * 10,
    );
    camera.position.z = distance;

    const light = new THREE.DirectionalLight();
    light.position.set(10, 50, 100);
    const facing = light.position.clone().normalize().z;
    // Physical light units: a Lambert surface reflects intensity / PI
    light.intensity = ((1 - AMBIENT) / facing) * Math.PI;
    scene.add(light, new THREE.AmbientLight(0xffffff, AMBIENT * Math.PI));

    const geometry = new THREE.PlaneGeometry(SIZE_W, sizeH, SEG_W, segH);
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
      // Rasterise at a high resolution so the SVG stays sharp
      const source = document.createElement("canvas");
      source.width = 1024;
      source.height = Math.round(1024 / aspect);
      source.getContext("2d").drawImage(img, 0, 0, source.width, source.height);
      texture = new THREE.CanvasTexture(source);
      texture.colorSpace = THREE.SRGBColorSpace;
      material.map = texture;
      material.needsUpdate = true;
      flag.visible = true;
    };
    img.src = image;

    const wave = (time) => {
      // The pen's Date.now() * speed / 50
      const t = (time / 1000) * speed * 20;
      for (let i = 0; i < position.count; i++) {
        const x = rest[i * 3] + SIZE_W / 2; // distance from the pole
        const y = sizeH / 2 - rest[i * 3 + 1]; // distance from the top
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
  }, [image, horizontal, vertical, swing, speed, pad]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: `${-pad * 100}%`,
          left: `${-pad * 100}%`,
          width: `${(1 + 2 * pad) * 100}%`,
          height: `${(1 + 2 * pad) * 100}%`,
        }}
      />
    </div>
  );
};
