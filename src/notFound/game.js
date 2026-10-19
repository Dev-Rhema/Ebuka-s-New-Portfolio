import grassUrl from "../assets/Knight/Grass.svg";
import knightUrl from "../assets/Knight/knight-game.webp";
import bigRockUrl from "../assets/gameImages/bigRock.webp";
import smallRockUrl from "../assets/gameImages/smallRock.webp";
import { ditherProgram } from "../components/Dither";
import sheet from "./knightGame.json";

const SIZE = 0.53;
const KNIGHT = SIZE / sheet.scale;
const UNIT = SIZE / 0.26;
const VIEW_H = 680;
const GROUND = 4;
const GRASS = { w: 1439, h: 40 };
const PLAY_X = 80;
const RIDE_IN = 0.8;
const JUMP_TIME = 0.9;
const JUMP_LIFT = 70 * UNIT;
const SPEED = { start: 320 * UNIT, max: 760 * UNIT, gain: 9 * UNIT };
const ROCKS = [
  { url: bigRockUrl, w: 100 * UNIT },
  { url: smallRockUrl, w: 44 * UNIT },
];
const SCORE_PER_PX = 1 / (40 * UNIT);
const BEST_KEY = "knight-best";
const TOUCH = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
const HINT = {
  ready: TOUCH ? "Tap to test yourself" : "Press Spacebar to test yourself",
  over: "You don try, dey go your house!",
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

const pad = (n) => String(n).padStart(5, "0");
const ease = (t) => 1 - (1 - t) ** 3;

export async function startGame(root) {
  const canvas = root.querySelector("[data-game]");
  const promptEl = root.querySelector("[data-prompt]");
  const hintEl = root.querySelector("[data-hint]");
  const scoreEl = root.querySelector("[data-score]");
  hintEl.textContent = HINT.ready;

  const [knightImage, grassImage, ...rockImages] = await Promise.all([
    loadImage(knightUrl),
    loadImage(grassUrl),
    ...ROCKS.map((rock) => loadImage(rock.url)),
  ]);
  const grass = raster(grassImage, GRASS.w, GRASS.h);
  const rockKinds = ROCKS.map((rock, i) => {
    const image = rockImages[i];
    const art = raster(image, rock.w, (rock.w * image.height) / image.width);
    return { art, top: topEdge(art) };
  });

  const scene = document.createElement("canvas");
  const ctx = scene.getContext("2d");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true });
  const dither = gl && ditherProgram(gl);
  if (!dither) {
    scene.className = canvas.className;
    canvas.replaceWith(scene);
  }

  const [cellW, cellH] = sheet.cell;
  const knightW = cellW * KNIGHT;
  const knightH = cellH * KNIGHT;
  const bin = sheet.bin * KNIGHT;
  let width = 0;
  let height = 0;
  let groundY = 0;
  let homeX = 0;
  let slide = 0;

  let best = readBest();
  let state;
  const reset = () => {
    state = {
      status: "ready",
      speed: SPEED.start,
      distance: 0,
      rocks: [],
      nextRock: 0,
      run: 0,
      jump: null,
      queued: false,
      endedAt: 0,
    };
  };
  reset();

  const knightX = () =>
    Math.round(homeX + (Math.min(PLAY_X, homeX) - homeX) * ease(slide));

  const frame = () => {
    if (state.jump !== null) {
      const { start, count } = sheet.jump;
      return start + Math.min(count - 1, Math.floor(state.jump * count));
    }
    return sheet.walk.start + (Math.floor(state.run) % sheet.walk.count);
  };
  const lift = () =>
    state.jump === null ? 0 : JUMP_LIFT * 4 * state.jump * (1 - state.jump);

  const hits = () => {
    const under = sheet.under[frame()];
    const top = groundY - knightH - lift();
    const left = knightX();
    for (const rock of state.rocks) {
      const { art, top: edge } = rockKinds[rock.kind];
      const rockTop = groundY - art.height;
      if (rock.x > left + knightW || rock.x + art.width < left) continue;
      for (let b = 0; b < under.length; b++) {
        if (under[b] < 0) continue;
        const y = top + under[b] * KNIGHT;
        const x0 = Math.max(0, Math.floor(left + b * bin - rock.x));
        const x1 = Math.min(art.width, Math.ceil(left + (b + 1) * bin - rock.x));
        for (let x = x0; x < x1; x++) {
          if (y > rockTop + edge[x] + 1.5 * UNIT) return true;
        }
      }
    }
    return false;
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    for (const rock of state.rocks) {
      const { art } = rockKinds[rock.kind];
      ctx.drawImage(art, Math.round(rock.x), groundY - art.height);
    }
    const i = frame();
    const col = i % sheet.cols;
    const row = Math.floor(i / sheet.cols);
    ctx.drawImage(
      knightImage,
      col * (cellW + sheet.gap),
      row * (cellH + sheet.gap),
      cellW,
      cellH,
      knightX(),
      Math.round(groundY - knightH - lift()),
      knightW,
      knightH,
    );
    const offset = state.distance % GRASS.w;
    for (let x = -Math.round(offset); x < width; x += GRASS.w) {
      ctx.drawImage(grass, x, height - GRASS.h);
    }
    if (dither) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };

  const showScore = () => {
    const score = Math.floor(state.distance * SCORE_PER_PX);
    const parts = [];
    if (best) parts.push(`HI ${pad(best)}`);
    if (state.status !== "ready") parts.push(pad(score));
    scoreEl.textContent = parts.join("  ");
  };

  const step = (dt) => {
    slide = Math.min(1, slide + dt / RIDE_IN);
    state.speed = Math.min(SPEED.max, state.speed + SPEED.gain * dt);
    const travel = state.speed * dt;
    state.distance += travel;

    const pace = (state.speed - SPEED.start) / (SPEED.max - SPEED.start);
    state.run += dt * 24 * (1.8 + 1.2 * pace);

    if (state.jump !== null) {
      state.jump += dt / JUMP_TIME;
      if (state.jump >= 1) {
        state.jump = state.queued ? 0 : null;
        state.queued = false;
        state.run = sheet.jump.resume;
      }
    }

    for (const rock of state.rocks) rock.x -= travel;
    state.rocks = state.rocks.filter(
      (rock) => rock.x + rockKinds[rock.kind].art.width > -10,
    );
    state.nextRock -= travel;
    if (state.nextRock <= 0) {
      state.rocks.push({ kind: Math.random() < 0.45 ? 0 : 1, x: width + 20 });
      const room = state.speed * (JUMP_TIME + 0.35) + 120 * UNIT;
      state.nextRock = room * (1 + Math.random() * 1.2);
    }
  };

  let last = 0;
  const tick = (now) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    step(dt);
    if (hits()) {
      end();
    } else {
      requestAnimationFrame(tick);
    }
    draw();
    showScore();
  };

  const start = () => {
    reset();
    state.status = "running";
    state.nextRock = width * 0.6;
    promptEl.style.visibility = "hidden";
    last = 0;
    requestAnimationFrame(tick);
  };

  const end = () => {
    state.status = "over";
    state.endedAt = performance.now();
    const score = Math.floor(state.distance * SCORE_PER_PX);
    if (score > best) {
      best = score;
      saveBest(best);
    }
    hintEl.textContent = HINT.over;
    promptEl.style.visibility = "";
  };

  const jump = () => {
    if (state.status === "ready") return start();
    if (state.status === "over") {
      if (performance.now() - state.endedAt > 500) start();
      return;
    }
    if (state.jump === null) state.jump = 0;
    else if (state.jump > 1 - 0.15 / JUMP_TIME) state.queued = true;
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
    homeX = Math.round(width / 2 - sheet.home * KNIGHT);
    draw();
  };
  new ResizeObserver(resize).observe(dither ? canvas : scene);

  window.addEventListener("keydown", (event) => {
    if (!["Space", "ArrowUp", "KeyW"].includes(event.code)) return;
    if (event.code === "Space" && event.target.closest?.("a, button")) return;
    event.preventDefault();
    if (!event.repeat) jump();
  });
  root.addEventListener("pointerdown", (event) => {
    if (event.target.closest("a, button")) return;
    jump();
  });

  showScore();
}
