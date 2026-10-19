import grassUrl from "../assets/Knight/Grass.svg";
import knightUrl from "../assets/Knight/knight-game.webp";
import bigRockUrl from "../assets/gameImages/bigRock.webp";
import smallRockUrl from "../assets/gameImages/smallRock.webp";
import { ditherProgram } from "../components/Dither";
import sheet from "./knightGame.json";

const WORLD_H = 340;
const GROUND = 4;
const GRASS = { w: 1439, h: 40 };
const KNIGHT = 0.26 / sheet.scale;
const JUMP_TIME = 0.9;
const JUMP_LIFT = 70;
const SPEED = { start: 320, max: 760, gain: 9 };
const ROCKS = [
  { url: bigRockUrl, w: 100 },
  { url: smallRockUrl, w: 44 },
];
const SCORE_PER_UNIT = 1 / 40;
const BEST_KEY = "knight-best";

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

export async function startGame(root) {
  const canvas = root.querySelector("[data-game]");
  const scoreEl = root.querySelector("[data-score]");
  const bestEl = root.querySelector("[data-best]");
  const hintEl = root.querySelector("[data-hint]");

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
  const groundY = WORLD_H - GROUND;
  let worldW = 0;
  let knightX = 0;

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
    for (const rock of state.rocks) {
      const { art, top: edge } = rockKinds[rock.kind];
      const rockTop = groundY - art.height;
      if (rock.x > knightX + knightW || rock.x + art.width < knightX) continue;
      for (let b = 0; b < under.length; b++) {
        if (under[b] < 0) continue;
        const y = top + under[b] * KNIGHT;
        const x0 = Math.max(0, Math.floor(knightX + b * bin - rock.x));
        const x1 = Math.min(
          art.width,
          Math.ceil(knightX + (b + 1) * bin - rock.x),
        );
        for (let x = x0; x < x1; x++) {
          if (y > rockTop + edge[x] + 1.5) return true;
        }
      }
    }
    return false;
  };

  const draw = () => {
    ctx.clearRect(0, 0, worldW, WORLD_H);
    const offset = state.distance % GRASS.w;
    for (let x = -Math.round(offset); x < worldW; x += GRASS.w) {
      ctx.drawImage(grass, x, WORLD_H - GRASS.h);
    }
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
      knightX,
      Math.round(groundY - knightH - lift()),
      knightW,
      knightH,
    );
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
    scoreEl.textContent = pad(Math.floor(state.distance * SCORE_PER_UNIT));
    bestEl.textContent = best ? `HI ${pad(best)}` : "";
  };

  const step = (dt) => {
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
      state.rocks.push({
        kind: Math.random() < 0.45 ? 0 : 1,
        x: worldW + 20,
      });
      const room = state.speed * (JUMP_TIME + 0.35) + 120;
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
    state.nextRock = worldW * 0.7;
    hintEl.textContent = "";
    last = 0;
    requestAnimationFrame(tick);
  };

  const end = () => {
    state.status = "over";
    state.endedAt = performance.now();
    const score = Math.floor(state.distance * SCORE_PER_UNIT);
    if (score > best) {
      best = score;
      saveBest(best);
    }
    hintEl.textContent = "You don try, dey go your house!";
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
    const scale = WORLD_H / target.clientHeight;
    worldW = Math.max(1, Math.round(target.clientWidth * scale));
    scene.width = worldW;
    scene.height = WORLD_H;
    if (dither) {
      canvas.width = worldW;
      canvas.height = WORLD_H;
    }
    knightX = Math.round(Math.min(140, Math.max(24, worldW * 0.08)));
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
  hintEl.textContent = "Press space or tap to ride";
}
