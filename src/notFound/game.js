import grassUrl from "../assets/Knight/Grass.svg";
import knightUrl from "../assets/Knight/knight-game.webp";
import knightIdleAvif from "../assets/Knight/knight-idle.avif";
import knightIdleUrl from "../assets/Knight/knight-idle.webp";
import bigRockUrl from "../assets/gameImages/bigRock.webp";
import smallRockUrl from "../assets/gameImages/smallRock.webp";
import { ditherProgram } from "../components/Dither";
import { facts } from "./facts";
import sheet from "./knightGame.json";

const SIZE = 0.53;
const KNIGHT = SIZE / sheet.scale;
const UNIT = SIZE / 0.26;
const VIEW_H = 680;
const GROUND = 3;
const GRASS = { w: 1439, h: 40, scale: 0.7 };
const RIDE_IN = 0.8;
const REAR_FPS = 16;
const GALLOP_FPS = 24;
const JUMP = { from: 2, gather: 0.1, air: 0.75, land: 0.08, lift: 165 };
const LANDS_AT = JUMP.gather + JUMP.air;
const JUMP_TIME = LANDS_AT + JUMP.land;
const SPEED = { start: 320 * UNIT, max: 760 * UNIT, gain: 9 * UNIT };
const SPEED_UP = { after: 20, factor: 2 };
const SPEED_STEP = { every: 100, by: 0.1 };
const ROCK_GAPS = { spread: 1.2, tightest: 0.25, over: 60 };
const ROCKS = [
  { url: bigRockUrl, w: 120 * UNIT, sink: 22 },
  { url: smallRockUrl, w: 62 * UNIT, sink: 26 },
];
const SCORE_PER_PX = 1 / (40 * UNIT);
const CHECKPOINT = { every: 1000, shield: 10, clear: 2 };
const SHIELD = {
  r: 278,
  rise: 184,
  open: 0.35,
  rim: 4,
  fill: "#ecfeff",
  edge: "#3f97a6",
};
const BEST_KEY = "knight-best";
const NARROW = window.matchMedia("(max-width: 767px)");
const TOUCH = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
const PRESS = TOUCH ? "Tap" : "Press Spacebar";
const OVER = {
  title: "You fell, warlock",
  subtitle: "It is in falling we learn to rise",
  hint: `${PRESS} to restart`,
};

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });

const raster = (image, w, h) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w);
  canvas.height = Math.round(h);
  canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const topEdge = (canvas) => {
  const { width, height } = canvas;
  const alpha = canvas.getContext("2d").getImageData(0, 0, width, height).data;
  return Array.from({ length: width }, (_, x) => {
    for (let y = 0; y < height; y++) {
      if (alpha[(y * width + x) * 4 + 3] > 128) return y;
    }
    return height;
  });
};

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const saveBest = (score) => {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {
    return;
  }
};

const pad = (n) => String(n).padStart(4, "0");
const ease = (t) => 1 - (1 - t) ** 3;

const shuffle = (items) => {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export async function startGame(root, { onStart, onEnd } = {}) {
  const canvas = root.querySelector("[data-game]");
  const introEl = root.querySelector("[data-intro]");
  const titleEl = root.querySelector("[data-title]");
  const subtitleEl = root.querySelector("[data-subtitle]");
  const hintEl = root.querySelector("[data-hint]");
  const marginEl = root.querySelector("[data-margin]");
  const hudEl = root.querySelector("[data-hud]");
  const scoreEl = root.querySelector("[data-score]");
  const bestEl = root.querySelector("[data-best]");
  const bannerEl = root.querySelector("[data-banner]");
  const factEl = root.querySelector("[data-fact]");
  const expiresEl = root.querySelector("[data-expires]");
  const sheetEl = root.querySelector("[data-sheet]");
  hintEl.textContent = TOUCH
    ? "Tap anywhere to begin"
    : `${PRESS} to test yourself`;

  const [knightImage, idleImage, grassImage, ...rockImages] = await Promise.all(
    [
      loadImage(knightUrl),
      // AVIF is a third smaller; browsers without it fall back to the WebP.
      loadImage(knightIdleAvif).catch(() => loadImage(knightIdleUrl)),
      loadImage(grassUrl),
      ...ROCKS.map((rock) => loadImage(rock.url)),
    ],
  );
  const grass = raster(
    grassImage,
    GRASS.w * GRASS.scale,
    GRASS.h * GRASS.scale,
  );
  const rockKinds = ROCKS.map((rock, i) => {
    const image = rockImages[i];
    const art = raster(image, rock.w, (rock.w * image.height) / image.width);
    return { art, top: topEdge(art), sink: rock.sink };
  });

  const scene = document.createElement("canvas");
  const ctx = scene.getContext("2d");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true });
  const dither = gl && ditherProgram(gl);
  if (!dither) {
    scene.className = canvas.className;
    canvas.replaceWith(scene);
  }

  const [canvasW, canvasH] = sheet.canvas;
  const knightW = canvasW * KNIGHT;
  const knightH = canvasH * KNIGHT;
  const bin = sheet.bin * KNIGHT;
  const footGap =
    (canvasH - Math.max(...sheet.under[sheet.intro.start])) * KNIGHT;
  const hoofHeight = (i) =>
    canvasH - Math.max(...sheet.under[sheet.jump.start + i]);
  const jumpFrames = [...Array(sheet.jump.count).keys()];
  const takeoff = jumpFrames.find((i) => hoofHeight(i) > hoofHeight(0) + 3);
  const touchdown = jumpFrames.find(
    (i) => i > takeoff && hoofHeight(i) <= hoofHeight(0) + 1,
  );
  let width = 0;
  let height = 0;
  let groundY = 0;
  let homeX = 0;
  let playX = 0;
  let slide = 0;
  let idleFrame = 0;
  let idleFrom = 0;

  let best = readBest();
  let state;
  const reset = () => {
    state = {
      status: "ready",
      cruise: SPEED.start,
      speed: SPEED.start,
      time: 0,
      distance: 0,
      rocks: [],
      nextRock: 0,
      rear: 0,
      run: 0,
      jump: null,
      queued: false,
      endedAt: 0,
      facts: shuffle(facts),
      nextCheckpoint: CHECKPOINT.every,
      shield: 0,
    };
  };
  reset();

  const knightX = () =>
    Math.round(homeX + (Math.min(playX, homeX) - homeX) * ease(slide));

  const jumpPose = () => {
    const t = state.jump;
    const along = (from, to, u) =>
      from + Math.min(to - from - 1, Math.floor(u * (to - from)));
    if (t < JUMP.gather) {
      return { i: along(JUMP.from, takeoff, t / JUMP.gather), lift: 0 };
    }
    if (t < LANDS_AT) {
      const u = (t - JUMP.gather) / JUMP.air;
      return {
        i: along(takeoff, touchdown, u),
        lift: JUMP.lift * 4 * u * (1 - u),
      };
    }
    return { i: touchdown, lift: 0 };
  };
  const frame = () => {
    if (state.status === "ready") return sheet.intro.start;
    if (state.status === "rearing") {
      return sheet.intro.start + Math.floor(state.rear * REAR_FPS);
    }
    if (state.jump !== null) return sheet.jump.start + jumpPose().i;
    return sheet.gallop.start + (Math.floor(state.run) % sheet.gallop.count);
  };
  const sprite = () =>
    state.status === "ready"
      ? [idleImage, sheet.idle.frames[idleFrame]]
      : [knightImage, sheet.frames[frame()]];
  const lift = () => (state.jump === null ? 0 : jumpPose().lift);
  const landing = () => state.jump !== null && state.jump >= LANDS_AT;
  const knightTop = () => groundY - knightH + footGap - lift();
  const score = () => Math.floor(state.distance * SCORE_PER_PX);

  const hits = () => {
    const under = sheet.under[frame()];
    const top = knightTop();
    const left = knightX();
    for (const rock of state.rocks) {
      const { art, top: edge, sink } = rockKinds[rock.kind];
      const rockTop = groundY - art.height + sink;
      if (rock.x > left + knightW || rock.x + art.width < left) continue;
      for (let b = 0; b < under.length; b++) {
        if (under[b] < 0) continue;
        const y = top + under[b] * KNIGHT;
        const x0 = Math.max(0, Math.floor(left + b * bin - rock.x));
        const x1 = Math.min(
          art.width,
          Math.ceil(left + (b + 1) * bin - rock.x),
        );
        for (let x = x0; x < x1; x++) {
          if (y > rockTop + edge[x] + 1.5 * UNIT) return true;
        }
      }
    }
    return false;
  };

  const drawShield = () => {
    const age = CHECKPOINT.shield - state.shield;
    const r =
      SHIELD.r *
      ease(Math.min(1, age / SHIELD.open, state.shield / SHIELD.open));
    const x = knightX() + sheet.home * KNIGHT;
    const y = groundY - SHIELD.rise;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = SHIELD.edge;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.fillStyle = SHIELD.fill;
    ctx.beginPath();
    ctx.arc(x - SHIELD.rim, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    if (state.shield > 0) drawShield();
    for (const rock of state.rocks) {
      const { art, sink } = rockKinds[rock.kind];
      ctx.drawImage(art, Math.round(rock.x), groundY - art.height + sink);
    }
    const [image, [x, y, w, h, offsetX, offsetY]] = sprite();
    ctx.drawImage(
      image,
      x,
      y,
      w,
      h,
      knightX() + offsetX * KNIGHT,
      Math.round(knightTop() + offsetY * KNIGHT),
      w * KNIGHT,
      h * KNIGHT,
    );
    const offset = state.distance % grass.width;
    for (let x = -Math.round(offset); x < width; x += grass.width) {
      ctx.drawImage(grass, x, height - grass.height);
    }
    if (dither) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        scene,
      );
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };

  const showScore = () => {
    scoreEl.textContent = pad(score());
    bestEl.textContent = `${pad(best)} Highest Score`;
    if (state.shield > 0) {
      const left = Math.ceil(state.shield);
      expiresEl.textContent = `Expires in ${left} second${left === 1 ? "" : "s"}`;
    }
  };

  const checkpoint = () => {
    const fact = state.facts.pop();
    factEl.textContent = fact ?? "";
    bannerEl.hidden = !fact;
    state.shield = CHECKPOINT.shield;
    root.dataset.checkpoint = "";
  };

  const dropShield = () => {
    const left = knightX();
    state.rocks = state.rocks.filter(
      (rock) =>
        rock.x > left + knightW ||
        rock.x + rockKinds[rock.kind].art.width < left,
    );
    delete root.dataset.checkpoint;
  };

  const step = (dt) => {
    if (state.status === "rearing") {
      state.rear += dt;
      if (state.rear * REAR_FPS >= sheet.intro.count) {
        state.status = "running";
        state.run = sheet.intro.next;
        state.nextRock = width * 0.6;
      }
      return;
    }
    slide = Math.min(1, slide + dt / RIDE_IN);
    state.time += dt;
    const gain =
      SPEED.gain * (state.time > SPEED_UP.after ? SPEED_UP.factor : 1);
    state.cruise = Math.min(SPEED.max, state.cruise + gain * dt);
    const steps = Math.floor(score() / SPEED_STEP.every);
    state.speed = state.cruise * (1 + SPEED_STEP.by * steps);
    const travel = state.speed * dt;
    state.distance += travel;

    if (score() >= state.nextCheckpoint) {
      state.nextCheckpoint += CHECKPOINT.every;
      checkpoint();
    } else if (state.shield > 0) {
      state.shield = Math.max(0, state.shield - dt);
      if (!state.shield) dropShield();
    }

    const pace = Math.min(
      1.5,
      (state.speed - SPEED.start) / (SPEED.max - SPEED.start),
    );
    state.run += dt * GALLOP_FPS * (1 + 0.4 * pace);

    if (state.jump !== null) {
      state.jump += dt;
      if (state.jump >= JUMP_TIME) {
        state.jump = null;
        state.run = sheet.jump.resume;
      } else if (state.queued && landing()) {
        state.jump = 0;
        state.queued = false;
      }
    }

    for (const rock of state.rocks) rock.x -= travel;
    state.rocks = state.rocks.filter(
      (rock) => rock.x + rockKinds[rock.kind].art.width > -10,
    );
    state.nextRock -= travel;
    const clearing = state.shield > 0 && state.shield < CHECKPOINT.clear;
    if (state.nextRock <= 0 && !clearing) {
      state.rocks.push({ kind: Math.random() < 0.45 ? 0 : 1, x: width + 20 });
      const room = state.speed * (LANDS_AT + 0.35) + 120 * UNIT;
      const tighten = Math.min(1, state.time / ROCK_GAPS.over);
      const spread =
        ROCK_GAPS.spread - (ROCK_GAPS.spread - ROCK_GAPS.tightest) * tighten;
      state.nextRock = room * (1 + Math.random() * spread);
    }
  };

  const idle = (now) => {
    if (state.status !== "ready") return;
    idleFrom ||= now;
    const i =
      Math.floor(((now - idleFrom) / 1000) * sheet.idle.fps) %
      sheet.idle.frames.length;
    if (i !== idleFrame) {
      idleFrame = i;
      draw();
    }
    requestAnimationFrame(idle);
  };

  let last = 0;
  const tick = (now) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    if (sheetEl.open) {
      requestAnimationFrame(tick);
      return;
    }
    step(dt);
    if (!state.shield && hits()) {
      end();
    } else {
      requestAnimationFrame(tick);
    }
    draw();
    showScore();
  };

  const start = () => {
    reset();
    delete root.dataset.checkpoint;
    state.status = "rearing";
    introEl.style.visibility = "hidden";
    hudEl.style.visibility = "visible";
    last = 0;
    onStart?.();
    requestAnimationFrame(tick);
  };

  const end = () => {
    state.status = "over";
    state.endedAt = performance.now();
    if (score() > best) {
      best = score();
      saveBest(best);
    }
    titleEl.textContent = OVER.title;
    subtitleEl.textContent = OVER.subtitle;
    hintEl.textContent = OVER.hint;
    hudEl.style.visibility = "";
    introEl.style.visibility = "";
    onEnd?.(score());
  };

  const jump = () => {
    if (sheetEl.open) return;
    if (state.status === "ready") return start();
    if (state.status === "over") {
      if (performance.now() - state.endedAt > 500) start();
      return;
    }
    if (state.status === "rearing") return;
    if (state.jump === null || landing()) state.jump = 0;
    else if (state.jump > LANDS_AT - 0.15) state.queued = true;
  };

  const resize = () => {
    const target = dither ? canvas : scene;
    const scale = VIEW_H / target.clientHeight;
    width = Math.max(1, Math.round(target.clientWidth * scale));
    height = VIEW_H;
    scene.width = width;
    scene.height = height;
    if (dither) {
      canvas.width = width;
      canvas.height = height;
    }
    groundY = height - GROUND;
    playX = Math.round(marginEl.offsetLeft * scale);
    homeX = NARROW.matches
      ? playX
      : Math.round(width / 2 - sheet.home * KNIGHT);
    draw();
  };
  new ResizeObserver(resize).observe(dither ? canvas : scene);

  window.addEventListener("keydown", (event) => {
    if (!["Space", "ArrowUp", "KeyW"].includes(event.code)) return;
    if (event.target.closest?.("input")) return;
    if (event.code === "Space" && event.target.closest?.("a, button")) return;
    event.preventDefault();
    if (!event.repeat) jump();
  });
  root.addEventListener("pointerdown", (event) => {
    if (event.target.closest("a, button, form")) return;
    jump();
  });

  showScore();
  requestAnimationFrame(idle);
}
