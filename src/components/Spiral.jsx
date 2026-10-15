import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import ace from "../assets/Brands/Card - Front/Ace.svg";
import spade from "../assets/Brands/Card - Front/Spade.svg";
import heart from "../assets/Brands/Card - Front/Heart.svg";
import diamonds from "../assets/Brands/Card - Front/Diamonds.svg";
import cardBack from "../assets/Brands/Card - Back.svg";

const CARDS = [
  { src: ace, alt: "Ace card" },
  { src: spade, alt: "Spade card" },
  { src: heart, alt: "Heart card" },
  { src: diamonds, alt: "Diamonds card" },
];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const modulo = (value, divisor) => ((value % divisor) + divisor) % divisor;
const smoothstep = (min, max, value) => {
  const x = clamp((value - min) / (max - min || 1), 0, 1);
  return x * x * (3 - 2 * x);
};

// Card textures are drawn at this width, with a transparent margin that
// gives the mipmap blur room to soften the card edges
const TEXTURE_WIDTH = 600;
const TEXTURE_PADDING = 96;

const vertexShader = /* glsl */ `
  uniform float uShear;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    p.y += uShear * p.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

// Blur comes from sampling smaller mip levels; textures are premultiplied
const fragmentShader = /* glsl */ `
  uniform sampler2D uFront;
  uniform sampler2D uBack;
  uniform float uBlur;
  uniform float uDim;
  uniform float uOpacity;
  uniform float uGrayscale;
  varying vec2 vUv;

  void main() {
    vec4 color = gl_FrontFacing
      ? texture2D(uFront, vUv, uBlur)
      : texture2D(uBack, vec2(1.0 - vUv.x, vUv.y), uBlur);
    float luma = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    color.rgb = mix(color.rgb, vec3(luma), uGrayscale) * uDim;
    gl_FragColor = color * uOpacity;
  }
`;

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

const drawCardTexture = (image, { aspect, radius, fit, anisotropy }) => {
  const width = TEXTURE_WIDTH;
  const height = Math.round(TEXTURE_WIDTH * aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width + TEXTURE_PADDING * 2;
  canvas.height = height + TEXTURE_PADDING * 2;
  const ctx = canvas.getContext("2d");

  const sourceWidth = image.naturalWidth || width;
  const sourceHeight = image.naturalHeight || height;
  const scale = (fit === "contain" ? Math.min : Math.max)(
    width / sourceWidth,
    height / sourceHeight,
  );
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;

  ctx.beginPath();
  ctx.roundRect(TEXTURE_PADDING, TEXTURE_PADDING, width, height, radius);
  ctx.clip();
  ctx.drawImage(
    image,
    TEXTURE_PADDING + (width - drawWidth) / 2,
    TEXTURE_PADDING + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.premultiplyAlpha = true;
  texture.anisotropy = anisotropy;
  return texture;
};

// A card wrapped onto the helix cylinder, centred on its own origin, so every
// card shares the spiral's curve instead of bending around its own centre
const createCardGeometry = (width, height, radius) => {
  const geometry = new THREE.PlaneGeometry(width, height, 64, 1);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const angle = position.getX(i) / radius;
    position.setX(i, Math.sin(angle) * radius);
    position.setZ(i, Math.cos(angle) * radius - radius);
  }
  geometry.computeBoundingSphere();
  return geometry;
};

const Spiral = ({
  items = CARDS,
  backImage = cardBack,
  // Copies of `items` placed on the helix so it reads as a continuous strand
  repeat = 4,
  speed = 0.3,
  direction = "down",
  animationMode = "auto",
  radius = 320,
  cardWidth = 240,
  cardHeight = 336,
  verticalSpacing = 80,
  perspective = 4000,
  cardsPerTurn = 8,
  rotation = 0,
  // Slant of cards on the far side of the helix, following the strand
  cardTilt = 25,
  cardRadius = 1,
  centerScale = 0.9,
  edgeFade = 0.5,
  edgeBlur = 10,
  // How much cards on the far side are darkened, from 0 to 1
  depthDim = 0.5,
  pauseOnHover = false,
  imageFit = "cover",
  grayscale = 0,
  className = "",
}) => {
  const rootRef = useRef(null);
  const canvasHostRef = useRef(null);
  const meshesRef = useRef([]);
  const cameraRef = useRef(null);
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const autoSpeedRef = useRef(0);
  const hoveredRef = useRef(false);
  const visibleRef = useRef(true);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);

  const normalizedItems = useMemo(
    () =>
      items.map((item, index) =>
        typeof item === "string"
          ? { src: item, alt: `Spiral card ${index + 1}` }
          : { alt: `Spiral card ${index + 1}`, ...item },
      ),
    [items],
  );

  const spiralItems = useMemo(
    () =>
      Array.from({ length: Math.max(repeat, 1) }, () => normalizedItems).flat(),
    [normalizedItems, repeat],
  );

  // Scene, textures and geometry: rebuilt only when the cards themselves change
  useEffect(() => {
    const root = rootRef.current;
    const host = canvasHostRef.current;
    if (!root || !host || spiralItems.length === 0) return;

    let disposed = false;
    let frameId;
    let previousTime = performance.now();
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "block size-full";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 1, 20000);
    cameraRef.current = camera;

    const aspect = cardHeight / cardWidth;
    const paddingScale = cardWidth / TEXTURE_WIDTH;
    const geometry = createCardGeometry(
      cardWidth + TEXTURE_PADDING * 2 * paddingScale,
      cardHeight + TEXTURE_PADDING * 2 * paddingScale,
      radius,
    );

    const textureOptions = {
      aspect,
      radius: cardRadius / paddingScale,
      fit: imageFit,
      anisotropy: renderer.capabilities.getMaxAnisotropy(),
    };
    const textures = new Map();
    const getTexture = (src) => {
      if (!textures.has(src)) {
        textures.set(
          src,
          loadImage(src).then((image) =>
            disposed ? null : drawCardTexture(image, textureOptions),
          ),
        );
      }
      return textures.get(src);
    };

    const meshes = spiralItems.map((item) => {
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uFront: { value: null },
          uBack: { value: null },
          uShear: { value: 0 },
          uBlur: { value: 0 },
          uDim: { value: 1 },
          uOpacity: { value: 1 },
          uGrayscale: { value: 0 },
        },
        side: THREE.DoubleSide,
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      mesh.userData.item = item;
      scene.add(mesh);

      Promise.all([getTexture(item.src), getTexture(backImage)])
        .then(([front, back]) => {
          if (disposed || !front || !back) return;
          material.uniforms.uFront.value = front;
          material.uniforms.uBack.value = back;
          mesh.userData.ready = true;
        })
        .catch(() => {});
      return mesh;
    });
    meshesRef.current = meshes;

    const resize = () => {
      const { width, height } = root.getBoundingClientRect();
      const w = Math.max(width, 1);
      const h = Math.max(height, 1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // Match CSS perspective: one world unit is one pixel on the z = 0 plane
      camera.fov = (2 * Math.atan(h / 2 / perspective) * 180) / Math.PI;
      camera.position.set(0, 0, perspective);
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(root);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    intersectionObserver.observe(root);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scrollEnabled = animationMode === "scroll" || animationMode === "all";
    const scrollSpeedMultiplier = Math.max(speed, 0) / 0.12;
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const scrollDelta = nextScrollY - lastScrollY;
      lastScrollY = nextScrollY;
      if (!scrollEnabled || !visibleRef.current || scrollDelta === 0) return;
      targetProgressRef.current += clamp(
        (scrollDelta * scrollSpeedMultiplier) /
          Math.max(verticalSpacing * 2, 1),
        -1.5,
        1.5,
      );
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const shearLimit = Math.tan((cardTilt * Math.PI) / 180);

    const render = (time) => {
      frameId = requestAnimationFrame(render);
      const delta = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      if (!visibleRef.current) return;

      const autoEnabled = animationMode === "auto" || animationMode === "all";
      const motionPaused =
        draggingRef.current || (pauseOnHover && hoveredRef.current);
      const directionMultiplier = direction === "up" ? -1 : 1;
      const desiredAutoSpeed =
        autoEnabled && !reducedMotion.matches && !motionPaused
          ? speed * directionMultiplier
          : 0;
      const speedBlend = 1 - Math.exp(-delta * 7);
      autoSpeedRef.current +=
        (desiredAutoSpeed - autoSpeedRef.current) * speedBlend;
      targetProgressRef.current += autoSpeedRef.current * delta;

      const followBlend =
        1 - Math.exp(-delta * (draggingRef.current ? 22 : 11));
      progressRef.current +=
        (targetProgressRef.current - progressRef.current) * followBlend;

      const count = meshes.length;
      const half = count / 2;
      const fadeStart = clamp(1 - edgeFade, 0, 0.98);
      const turnSize = Math.max(cardsPerTurn, 1);
      const step = (Math.PI * 2) / turnSize;

      meshes.forEach((mesh, index) => {
        // Positive offsets are still to come: they wait at the top and back,
        // swing round the front from left to right, then sink away below
        const offset = modulo(index - progressRef.current + half, count) - half;
        const angle = -offset * step + (rotation * Math.PI) / 180;
        const cos = Math.cos(angle);
        const back = (1 - cos) / 2;
        const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
        const opacity = 1 - smoothstep(fadeStart, 1, edge);
        const focus = 1 - Math.min(Math.abs(offset) / (turnSize * 0.5), 1);
        const blur = edgeBlur * smoothstep(0.3, 1, back);

        mesh.visible = Boolean(mesh.userData.ready) && opacity > 0.005;
        mesh.position.set(
          Math.sin(angle) * radius,
          offset * verticalSpacing,
          cos * radius,
        );
        mesh.rotation.y = angle;
        mesh.scale.setScalar(1 + (centerScale - 1) * focus);

        const uniforms = mesh.material.uniforms;
        uniforms.uShear.value = -shearLimit * back;
        // Each mip level halves the texture, so blur in px maps to a log bias
        uniforms.uBlur.value = Math.log2(1 + blur * 1.6);
        uniforms.uDim.value = 1 - depthDim * smoothstep(0.2, 1, back);
        uniforms.uOpacity.value = opacity;
        uniforms.uGrayscale.value = clamp(grayscale, 0, 1);
      });

      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      meshes.forEach((mesh) => mesh.material.dispose());
      geometry.dispose();
      textures.forEach((promise) =>
        promise.then((texture) => texture?.dispose()).catch(() => {}),
      );
      renderer.dispose();
      renderer.domElement.remove();
      meshesRef.current = [];
      cameraRef.current = null;
    };
  }, [
    spiralItems,
    backImage,
    speed,
    direction,
    animationMode,
    radius,
    cardWidth,
    cardHeight,
    verticalSpacing,
    perspective,
    cardsPerTurn,
    rotation,
    cardTilt,
    cardRadius,
    centerScale,
    edgeFade,
    edgeBlur,
    depthDim,
    pauseOnHover,
    imageFit,
    grayscale,
  ]);

  const dragEnabled = animationMode === "drag" || animationMode === "all";

  const stopDragging = (event) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    event.currentTarget.style.cursor = dragEnabled ? "grab" : "default";
  };

  // Cards are drawn on a canvas, so links are found by raycasting the click
  const openCardAt = (event) => {
    const camera = cameraRef.current;
    if (!camera) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);
    const [hit] = raycaster.intersectObjects(
      meshesRef.current.filter((mesh) => mesh.visible),
    );
    const item = hit?.object.userData.item;
    if (!item?.href) return;
    if (item.target === "_blank") {
      window.open(item.href, "_blank", "noreferrer");
    } else {
      window.location.assign(item.href);
    }
  };

  return (
    <section
      ref={rootRef}
      className={`relative isolate h-svh min-h-80 w-full overflow-hidden bg-white ${className}`}
      style={{
        cursor: dragEnabled ? "grab" : "default",
        touchAction: dragEnabled ? "none" : "auto",
        userSelect: dragEnabled ? "none" : "auto",
      }}
      onMouseEnter={() => {
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        hoveredRef.current = false;
      }}
      onPointerDown={(event) => {
        if (!dragEnabled || event.button !== 0) return;
        draggingRef.current = true;
        dragMovedRef.current = false;
        lastPointerRef.current = { x: event.clientX, y: event.clientY };
        targetProgressRef.current = progressRef.current;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.style.cursor = "grabbing";
      }}
      onPointerMove={(event) => {
        if (!draggingRef.current) return;
        const dx = event.clientX - lastPointerRef.current.x;
        const dy = event.clientY - lastPointerRef.current.y;
        lastPointerRef.current = { x: event.clientX, y: event.clientY };
        if (Math.abs(dx) + Math.abs(dy) > 0.5) dragMovedRef.current = true;
        // Front cards travel right and down, so both directions move the strand
        targetProgressRef.current +=
          (dx * 0.6 + dy) / Math.max(verticalSpacing * 2.5, 1);
      }}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onClick={(event) => {
        if (dragMovedRef.current) {
          dragMovedRef.current = false;
          return;
        }
        openCardAt(event);
      }}
    >
      <div
        ref={canvasHostRef}
        className="absolute inset-0"
        aria-hidden="true"
      />

      <ul className="sr-only" aria-label="Spiral card gallery">
        {normalizedItems.map((item, index) => (
          <li key={item.id ?? `${item.src}-${index}`}>
            {item.href ? (
              <a
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noreferrer" : undefined}
              >
                {item.label ?? item.alt}
              </a>
            ) : (
              (item.label ?? item.alt)
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export { Spiral };
export default Spiral;
