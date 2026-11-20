/* iYellowBall (web). Same rules, maze generator and daily seed as the iOS app. */

/* ==================== i18n ==================== */
const TRANSLATIONS = {
  pt: {
    introTitle: "iYellowBall",
    introText: "Um labirinto novo em cada nível. Rola a bola amarela, apanha todas as gemas e congela os cubos antes que te apanhem.",
    introSkipBtn: "Saltar",
    eyebrow: "LABIRINTOS GERADOS",
    title1: "Rola. Congela.",
    title2: "Parte os cubos.",
    tagline: "Cada nível é um labirinto novo, simétrico e sem becos sem saída. Apanha todas as gemas, foge de quatro cubos rabugentos e usa os orbes de gelo para os congelar e partir.",
    diffEasy: "Fácil", diffEasyMeta: "4 vidas",
    diffNormal: "Normal", diffNormalMeta: "3 vidas",
    diffHard: "Difícil", diffHardMeta: "2 vidas",
    dailyBtn: "Desafio do dia", dailyMeta: "labirinto novo hoje",
    scoreLabel: "Pontos", levelLabel: "Nível", livesLabel: "Vidas", bestLabel: "Melhor",
    pressStartKicker: "TOCA OU PRIME",
    pressStart: "ESPAÇO PARA COMEÇAR",
    pausedTitle: "PAUSA",
    pausedSub: "Prime P ou toca para retomar",
    resumeBtn: "Retomar", menuBtn: "Menu inicial",
    controlsHint: "⌨️ Setas ou WASD para mover · P para pausar",
    footerBy: "Desenvolvido por",
    playAgainBtn: "Jogar Novamente", closeBtn: "Fechar",
    levelClear: (n) => `NÍVEL ${n} CONCLUÍDO`,
    levelIncoming: (n) => `NÍVEL ${n}`,
    lifeLostToast: "APANHADA!",
    extraLifeToast: "VIDA EXTRA!",
    freezeToast: "CONGELADOS!",
    loseTitle: "Fim de Jogo",
    textCaught: (lvl) => `Os cubos apanharam a bola no nível ${lvl}.`,
    textDaily: (lvl) => `Desafio do dia: chegaste ao nível ${lvl}. Volta amanhã para um labirinto novo.`,
    statScore: "Pontos", statLevel: "Nível", statBest: "Recorde",
    newBest: "Novo recorde!",
    docTitle: "iYellowBall: rola, congela e parte cubos",
    soundAria: "Ligar ou desligar o som",
    langAria: "Mudar idioma",
    difficultyAria: "Modo de jogo",
    canvasAria: "Labirinto do jogo",
    upAria: "Cima", downAria: "Baixo", leftAria: "Esquerda", rightAria: "Direita", pauseAria: "Pausa",
  },
  en: {
    introTitle: "iYellowBall",
    introText: "A new maze every level. Roll the yellow ball, grab every gem and freeze the cubes before they catch you.",
    introSkipBtn: "Skip",
    eyebrow: "GENERATED MAZES",
    title1: "Roll. Freeze.",
    title2: "Smash the cubes.",
    tagline: "Every level is a new maze, symmetric and with no dead ends. Grab every gem, keep away from four grumpy cubes and use the ice orbs to freeze and smash them.",
    diffEasy: "Easy", diffEasyMeta: "4 lives",
    diffNormal: "Normal", diffNormalMeta: "3 lives",
    diffHard: "Hard", diffHardMeta: "2 lives",
    dailyBtn: "Daily maze", dailyMeta: "a new maze today",
    scoreLabel: "Score", levelLabel: "Level", livesLabel: "Lives", bestLabel: "Best",
    pressStartKicker: "TAP OR PRESS",
    pressStart: "SPACE TO START",
    pausedTitle: "PAUSED",
    pausedSub: "Press P or tap to resume",
    resumeBtn: "Resume", menuBtn: "Main Menu",
    controlsHint: "⌨️ Arrows or WASD to move · P to pause",
    footerBy: "Developed by",
    playAgainBtn: "Play Again", closeBtn: "Close",
    levelClear: (n) => `LEVEL ${n} CLEARED`,
    levelIncoming: (n) => `LEVEL ${n}`,
    lifeLostToast: "CAUGHT!",
    extraLifeToast: "EXTRA LIFE!",
    freezeToast: "FROZEN!",
    loseTitle: "Game Over",
    textCaught: (lvl) => `The cubes caught the ball on level ${lvl}.`,
    textDaily: (lvl) => `Daily maze: you reached level ${lvl}. Come back tomorrow for a new one.`,
    statScore: "Score", statLevel: "Level", statBest: "Best",
    newBest: "New record!",
    docTitle: "iYellowBall: roll, freeze, smash the maze",
    soundAria: "Toggle sound",
    langAria: "Change language",
    difficultyAria: "Game mode",
    canvasAria: "Game maze",
    upAria: "Up", downAria: "Down", leftAria: "Left", rightAria: "Right", pauseAria: "Pause",
  },
};

/* ==================== Config (mirrors Config.swift) ==================== */
const DIFFICULTIES = {
  easy: { lives: 4, ballSpeedMul: 0.85, enemySpeedMul: 0.70, freezeMs: 8000, releaseDelays: [600, 2600, 5200, 8000], extraLifeScore: 6000 },
  normal: { lives: 3, ballSpeedMul: 0.95, enemySpeedMul: 0.82, freezeMs: 6500, releaseDelays: [500, 2000, 4200, 6500], extraLifeScore: 8000 },
  hard: { lives: 2, ballSpeedMul: 1.05, enemySpeedMul: 0.95, freezeMs: 5000, releaseDelays: [400, 1300, 2800, 4500], extraLifeScore: 10000 },
};

const COLS = 27;
const ROWS = 27;
const CELL = 20;
const TUNNEL_ROW = 13;
const BALL_HOME = { col: 13, row: 21 };
const PLAZA_CENTER = { col: 13, row: 13 };

const BASE_BALL_SPEED = 0.125; // px/ms
const BASE_ENEMY_SPEED = 0.115;
const POP_ANIM_MS = 900;
const READY_PAUSE_MS = 650;
const CALM_MS = 4000;
const REFORM_MS = 3000;
const SMASH_VALUES = [100, 200, 400, 800];

const ENEMY_DEFS = [
  { kind: "hunter", color: "#ff4d5e", spawn: { col: 12, row: 12 } },
  { kind: "cutter", color: "#3ee07a", spawn: { col: 14, row: 12 } },
  { kind: "drifter", color: "#b06bff", spawn: { col: 12, row: 14 } },
  { kind: "guard", color: "#ff9d2e", spawn: { col: 14, row: 14 } },
];
const WALL_THEMES = ["#1fc8b8", "#8a5cff", "#3ccf6e", "#ff5fa2"];
const ICE = "#bfefff";
const ICE_EDGE = "#5cc8ff";

// Tie-break order when enemies pick a corridor: up, left, down, right.
const ALL_DIRS = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }];
const ZERO = { x: 0, y: 0 };
const isZero = (d) => d.x === 0 && d.y === 0;
const sameDir = (a, b) => a.x === b.x && a.y === b.y;

const STORAGE_LANG = "iyellowball:lang";
const STORAGE_SOUND = "iyellowball:sound";

// Storage is optional (private browsing, disabled cookies or exhausted quota).
function readStorage(key) { try { return localStorage.getItem(key); } catch { return null; } }
function writeStorage(key, value) { try { localStorage.setItem(key, value); } catch { /* keep playing */ } }

function idx(col, row) { return row * COLS + col; }

/* ==================== Maze generator (mirrors MazeGenerator.swift) ====================
   Uses the same 64-bit SplitMix generator and the same draws as Swift's
   randomElement / Double.random, so a seed gives the same maze on iOS and web. */
const MASK64 = (1n << 64n) - 1n;

class SplitMix64 {
  constructor(seed) { this.state = BigInt.asUintN(64, seed); }
  next() {
    this.state = (this.state + 0x9E3779B97F4A7C15n) & MASK64;
    let z = this.state;
    z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
    z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
    return z ^ (z >> 31n);
  }
  // Swift's next(upperBound:) (Lemire's multiply-and-reject).
  below(n) {
    const bound = BigInt(n);
    let m = this.next() * bound;
    if ((m & MASK64) < bound) {
      const threshold = ((MASK64 + 1n) - bound) % bound;
      while ((m & MASK64) < threshold) m = this.next() * bound;
    }
    return Number(m >> 64n);
  }
  pick(list) { return list.length ? list[this.below(list.length)] : undefined; }
  unit() { return Number(this.next() & ((1n << 53n) - 1n)) / 2 ** 53; }
}

function levelSeed(level, base = 0xC0FFEEn) {
  return BigInt.asUintN(64, base + BigInt(level) * 0x2545F4914F6CDD1Dn);
}

function makeMaze(seed) {
  const rng = new SplitMix64(seed);
  const mid = Math.floor(COLS / 2);
  const t = new Array(COLS * ROWS).fill(1);
  const open = (c, r, v = 0) => { t[idx(c, r)] = v; t[idx(COLS - 1 - c, r)] = v; };
  const isOpen = (c, r) => c >= 0 && c < COLS && r >= 0 && r < ROWS && t[idx(c, r)] !== 1;
  const isCell = (c, r) => c % 2 === 1 && r % 2 === 1 && c > 0 && r > 0 && c < COLS - 1 && r < ROWS - 1;

  // 1. Spanning tree on the left half.
  const visited = new Set([idx(1, 1)]);
  const stack = [{ col: 1, row: 1 }];
  open(1, 1);
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const next = ALL_DIRS.map((d) => ({ col: cur.col + d.x * 2, row: cur.row + d.y * 2 }))
      .filter((p) => isCell(p.col, p.row) && p.col <= mid && !visited.has(idx(p.col, p.row)));
    const pick = rng.pick(next);
    if (!pick) { stack.pop(); continue; }
    open((cur.col + pick.col) / 2, (cur.row + pick.row) / 2);
    open(pick.col, pick.row);
    visited.add(idx(pick.col, pick.row));
    stack.push(pick);
  }

  // 2. A few extra openings for alternative routes.
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c <= mid; c++) {
      if ((c + r) % 2 !== 1 || t[idx(c, r)] !== 1) continue;
      const horizontal = c % 2 === 0;
      const a = horizontal ? [c - 1, r] : [c, r - 1];
      const b = horizontal ? [c + 1, r] : [c, r + 1];
      if (!isCell(a[0], a[1]) || !isCell(b[0], b[1])) continue;
      if (rng.unit() < 0.09) open(c, r);
    }
  }

  // 3. Central plaza and side tunnel.
  for (let r = 11; r <= 15; r++) for (let c = 11; c <= 15; c++) open(c, r, 4);
  open(0, TUNNEL_ROW, 4);

  // 4. Knock every dead end through to another cell.
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 1; r < ROWS - 1; r += 2) {
      for (let c = 1; c < COLS - 1; c += 2) {
        if (!isOpen(c, r)) continue;
        const exits = ALL_DIRS.filter((d) => isOpen(c + d.x, r + d.y));
        if (exits.length > 1) continue;
        const candidates = ALL_DIRS.filter((d) => !isOpen(c + d.x, r + d.y) && isCell(c + d.x * 2, r + d.y * 2));
        const d = rng.pick(candidates);
        if (!d) continue;
        open(c + d.x, r + d.y);
        changed = true;
      }
    }
  }

  // 5. Clear the start tile and add the four ice orbs.
  t[idx(BALL_HOME.col, BALL_HOME.row)] = 4;
  for (const [c, r] of [[1, 3], [COLS - 2, 3], [1, ROWS - 4], [COLS - 2, ROWS - 4]]) {
    if (t[idx(c, r)] !== 1) t[idx(c, r)] = 3;
  }
  return t;
}

/* ==================== DOM refs ==================== */
const el = (id) => document.getElementById(id);
const canvas = el("game-canvas");
const ctx = canvas.getContext("2d");
const CW = COLS * CELL;
const CH = ROWS * CELL;

const scoreValueEl = el("score-value");
const levelValueEl = el("level-value");
const bestValueEl = el("best-value");
const livesTrack = el("lives-track");
const startOverlay = el("start-overlay");
const pauseOverlay = el("pause-overlay");
const waveToast = el("wave-toast");
const modalOverlay = el("modal-overlay");
const modalTitle = el("modal-title");
const modalText = el("modal-text");
const modalStats = el("modal-stats");

/* ==================== State ==================== */
const state = {
  lang: (["pt", "en"].includes(readStorage(STORAGE_LANG)) ? readStorage(STORAGE_LANG) : null) || (navigator.language?.startsWith("pt") ? "pt" : "en"),
  soundOn: readStorage(STORAGE_SOUND) !== "off",
  difficulty: "normal",
  mode: { kind: "classic" },
  score: 0,
  level: 1,
  lives: 3,
  running: false,
  paused: false,
  over: false,
  transitioning: false,
  popping: false,
  popTimer: 0,
  invulnerableTimer: 0,
  freezeTimer: 0,
  calmTimer: 0,
  smashStreak: 0,
  extraLifeAwarded: false,
  gemToggle: false,
};

let cfg = DIFFICULTIES.normal;
let maze = [];
let collect = [];
let remaining = 0;
let ball;
let enemies = [];
let lastResult = null;

function dailyMode(date = new Date()) {
  const key = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return { kind: "daily", seed: BigInt(key), key };
}

function bestKey() {
  return state.mode.kind === "daily" ? `iyellowball:best:daily:${state.mode.key}` : `iyellowball:best:${state.difficulty}`;
}
function bestScore() { const v = Number(readStorage(bestKey())); return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0; }

function tile(col, row) {
  if (row < 0 || row >= ROWS) return 1;
  let c = col;
  if (c < 0) c += COLS;
  if (c >= COLS) c -= COLS;
  return maze[idx(c, row)];
}
const isWall = (c, r) => tile(c, r) === 1;
const openNeighbours = (c, r) => ALL_DIRS.filter((d) => !isWall(c + d.x, r + d.y)).length;

function t(key, ...args) {
  const value = TRANSLATIONS[state.lang][key];
  return typeof value === "function" ? value(...args) : value;
}

function applyTranslations() {
  document.documentElement.lang = state.lang === "pt" ? "pt-PT" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = TRANSLATIONS[state.lang][node.getAttribute("data-i18n")];
    if (typeof value === "string") node.textContent = value;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    const label = t(node.getAttribute("data-i18n-aria"));
    node.setAttribute("aria-label", label);
    if (node.hasAttribute("title")) node.setAttribute("title", label);
  });
  document.title = t("docTitle");
  el("lang-label").textContent = state.lang.toUpperCase();
  el("lang-flag").textContent = state.lang === "pt" ? "🇵🇹" : "🇬🇧";
  updateBestDisplay();
  if (state.over && lastResult) renderGameOver();
}

function setLang(lang) {
  state.lang = lang;
  writeStorage(STORAGE_LANG, lang);
  applyTranslations();
}

el("lang-toggle").addEventListener("click", () => {
  setLang(state.lang === "pt" ? "en" : "pt");
  playTone(520, 0.05);
});

/* ==================== Sound (mirrors SoundEngine.swift) ==================== */
let audioCtx = null;
function ensureAudio() {
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return null;
    audioCtx = audioCtx || new Audio();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  } catch { return null; }
  return audioCtx;
}

function playTone(freq, duration, type = "square", gainValue = 0.05, delay = 0) {
  if (!state.soundOn) return;
  try {
    const ac = ensureAudio();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain).connect(ac.destination);
    const startAt = ac.currentTime + delay;
    gain.gain.setValueAtTime(gainValue, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  } catch { /* audio unsupported */ }
}

function playSequence(notes) {
  notes.forEach(([freq, delay, duration, type, gain]) => playTone(freq, duration, type || "square", gain || 0.05, delay / 1000));
}

el("sound-toggle").addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  writeStorage(STORAGE_SOUND, state.soundOn ? "on" : "off");
  el("sound-icon").textContent = state.soundOn ? "🔊" : "🔇";
  if (state.soundOn) playTone(440, 0.08);
});

const playGem = () => { state.gemToggle = !state.gemToggle; playTone(state.gemToggle ? 1320 : 1175, 0.035, "square", 0.03); };
const playFreeze = () => playSequence([[1568, 0, 0.08], [1319, 50, 0.08], [1047, 100, 0.08], [784, 150, 0.2]]);
const playSmash = () => playSequence([[180, 0, 0.08, "sawtooth", 0.07], [1400, 30, 0.05], [1800, 70, 0.07]]);
const playPop = () => playSequence([[880, 0, 0.08], [440, 70, 0.1, "sawtooth"], [220, 160, 0.16, "sawtooth"], [110, 300, 0.3, "sawtooth"]]);
const playLevelClear = () => playSequence([[587, 0, 0.12], [740, 90, 0.12], [880, 180, 0.12], [1175, 300, 0.12], [880, 400, 0.1], [1175, 480, 0.3]]);
const playExtraLife = () => playSequence([[784, 0, 0.1], [988, 80, 0.1], [1319, 160, 0.2]]);

/* ==================== Mode picker ==================== */
function markActive(btn) {
  document.querySelectorAll(".diff-btn").forEach((b) => {
    b.classList.toggle("is-active", b === btn);
    b.setAttribute("aria-checked", b === btn ? "true" : "false");
  });
}
document.querySelectorAll(".diff-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    markActive(btn);
    if (btn.dataset.mode === "daily") newGame("normal", dailyMode());
    else newGame(btn.dataset.diff, { kind: "classic" });
    playTone(360, 0.08);
  });
});

/* ==================== Entities ==================== */
function makeBall() {
  return {
    col: BALL_HOME.col, row: BALL_HOME.row, x: BALL_HOME.col * CELL, y: BALL_HOME.row * CELL,
    dir: ZERO, queuedDir: ZERO, lastDir: { x: -1, y: 0 }, turnBufferMs: 0, roll: 0,
  };
}

function makeEnemies() {
  return ENEMY_DEFS.map((def, i) => ({
    kind: def.kind, color: def.color, spawn: def.spawn,
    col: def.spawn.col, row: def.spawn.row, x: def.spawn.col * CELL, y: def.spawn.row * CELL,
    dir: ZERO, state: "dormant", frozen: false, timer: 0,
    releaseDelay: cfg.releaseDelays[i], wobble: Math.random() * Math.PI * 2,
  }));
}

/* ==================== Movement core ==================== */
function stepEntity(e, speed, dt, pickDir, onEnter) {
  let remainingDist = speed * dt;
  let guard = 0;
  while (remainingDist > 0.001 && guard < 6) {
    guard++;
    const modX = ((e.x % CELL) + CELL) % CELL;
    const modY = ((e.y % CELL) + CELL) % CELL;
    if (modX < 0.05 && modY < 0.05) {
      let c = Math.round(e.x / CELL);
      if (c < 0) c += COLS;
      if (c >= COLS) c -= COLS;
      const r = Math.round(e.y / CELL);
      e.col = c; e.row = r;
      e.x = c * CELL; e.y = r * CELL;
      if (onEnter) onEnter(c, r);
      e.dir = pickDir(e, c, r);
    }
    if (isZero(e.dir)) break;
    const axisDir = e.dir.x !== 0 ? e.dir.x : e.dir.y;
    const axisPos = e.dir.x !== 0 ? e.x : e.y;
    const modPos = ((axisPos % CELL) + CELL) % CELL;
    const distToBoundary = modPos < 0.05 ? CELL : (axisDir > 0 ? CELL - modPos : modPos);
    const move = Math.min(remainingDist, distToBoundary);
    e.x += e.dir.x * move;
    e.y += e.dir.y * move;
    remainingDist -= move;
    if (e.x < -0.01) e.x += CW;
    if (e.x >= CW - 0.01) e.x -= CW;
  }
}

/* ---- Ball steering ---- */
let autopilot = false; // test/demo helper: heads for the nearest gem

function pickBallDir(e, col, row) {
  if (autopilot) return autopilotDir(col, row);
  const q = ball.queuedDir;
  if (!isZero(q) && !isWall(col + q.x, row + q.y)) {
    ball.lastDir = q;
    if (!heldDirs.length) { ball.queuedDir = ZERO; ball.turnBufferMs = 0; }
    return q;
  }
  if (!isZero(e.dir) && !isWall(col + e.dir.x, row + e.dir.y)) return e.dir;
  // Follow a plain bend on its own (only one way on); at a real junction the
  // player chooses, so the ball waits there.
  if (!isZero(e.dir)) {
    const reverse = { x: -e.dir.x, y: -e.dir.y };
    const options = ALL_DIRS.filter((d) => !sameDir(d, reverse) && !isWall(col + d.x, row + d.y));
    if (options.length === 1) { ball.lastDir = options[0]; return options[0]; }
  }
  return ZERO;
}

function autopilotDir(col, row) {
  const start = idx(col, row);
  const prev = new Map();
  const queue = [{ col, row }];
  let goal = null;
  for (let head = 0; head < queue.length; head++) {
    const p = queue[head];
    if (idx(p.col, p.row) !== start && collect[idx(p.col, p.row)] > 0) { goal = p; break; }
    for (const d of ALL_DIRS) {
      if (isWall(p.col + d.x, p.row + d.y)) continue;
      const n = { col: (p.col + d.x + COLS) % COLS, row: p.row + d.y };
      const k = idx(n.col, n.row);
      if (!prev.has(k) && k !== start) { prev.set(k, p); queue.push(n); }
    }
  }
  if (!goal) return ZERO;
  let step = goal;
  while (prev.has(idx(step.col, step.row)) && idx(prev.get(idx(step.col, step.row)).col, prev.get(idx(step.col, step.row)).row) !== start) {
    step = prev.get(idx(step.col, step.row));
  }
  let dx = step.col - col;
  if (dx > 1) dx = -1; else if (dx < -1) dx = 1;
  const d = { x: dx, y: step.row - row };
  ball.lastDir = d;
  return d;
}

/* ---- Enemy AI ---- */
const distSq = (a, b) => (a.col - b.col) ** 2 + (a.row - b.row) ** 2;

function nextJunctionAhead() {
  const d = isZero(ball.dir) ? ball.lastDir : ball.dir;
  let c = ball.col, r = ball.row;
  for (let i = 0; i < 10; i++) {
    if (isWall(c + d.x, r + d.y)) return { col: c, row: r };
    c = (c + d.x + COLS) % COLS;
    r += d.y;
    if (openNeighbours(c, r) >= 3) return { col: c, row: r };
  }
  return { col: c, row: r };
}

// Where an enemy wants to go, or null to wander at random.
function enemyTarget(enemy) {
  if (state.calmTimer > 0) return null;
  const b = { col: ball.col, row: ball.row };
  switch (enemy.kind) {
    case "hunter": return b;
    case "cutter": return nextJunctionAhead();
    case "drifter": return Math.hypot(enemy.col - b.col, enemy.row - b.row) <= 7 ? b : null;
    default: { // guard: the remaining ice orb nearest the ball
      let best = null;
      collect.forEach((v, i) => {
        if (v !== 2) return;
        const p = { col: i % COLS, row: Math.floor(i / COLS) };
        if (!best || distSq(p, b) < distSq(best, b)) best = p;
      });
      return best || b;
    }
  }
}

function pickEnemyDir(enemy, col, row) {
  let options = ALL_DIRS.filter((d) => !isWall(col + d.x, row + d.y));
  if (options.length > 1) options = options.filter((d) => !(d.x === -enemy.dir.x && d.y === -enemy.dir.y));
  if (!options.length) return ZERO;
  const target = enemyTarget(enemy);
  if (!target) return options[Math.floor(Math.random() * options.length)];
  let best = options[0];
  for (const d of options) {
    if (distSq({ col: col + d.x, row: row + d.y }, target) < distSq({ col: col + best.x, row: row + best.y }, target)) best = d;
  }
  return best;
}

function enemySpeed() {
  const levelBonus = Math.min(0.3, (state.level - 1) * 0.03);
  const calm = state.calmTimer > 0 ? 0.75 : 1;
  return BASE_ENEMY_SPEED * cfg.enemySpeedMul * (1 + levelBonus) * calm;
}

function updateEnemy(enemy, dt) {
  enemy.wobble += dt * 0.006;
  if (enemy.frozen) return;
  if (enemy.state === "dormant") {
    enemy.timer += dt;
    if (enemy.timer >= enemy.releaseDelay) { enemy.state = "roaming"; enemy.dir = { x: 0, y: -1 }; }
  } else if (enemy.state === "reforming") {
    enemy.timer += dt;
    if (enemy.timer >= REFORM_MS) { enemy.state = "dormant"; enemy.timer = 0; enemy.releaseDelay = 500; }
  } else {
    stepEntity(enemy, enemySpeed(), dt, (e, c, r) => pickEnemyDir(e, c, r));
  }
}

/* ==================== Gameplay events ==================== */
function updateScoreUI() { scoreValueEl.textContent = String(state.score); }
function updateLevelUI() { levelValueEl.textContent = String(state.level); }
function updateBestDisplay() { bestValueEl.textContent = String(bestScore()); }

function renderLives() {
  livesTrack.innerHTML = "";
  for (let i = 0; i < state.lives; i++) {
    const span = document.createElement("span");
    span.className = "life-icon";
    livesTrack.appendChild(span);
  }
}

function flashToast(text) {
  waveToast.textContent = text;
  waveToast.classList.add("is-visible");
  clearTimeout(flashToast._t);
  flashToast._t = setTimeout(() => waveToast.classList.remove("is-visible"), 1300);
}

function collectTile(col, row) {
  const i = idx(col, row);
  if (collect[i] === 1) {
    collect[i] = 0; remaining--;
    gemsDirty = true;
    state.score += 10;
    updateScoreUI();
    playGem();
    checkExtraLife();
  } else if (collect[i] === 2) {
    collect[i] = 0; remaining--;
    state.score += 50;
    updateScoreUI();
    triggerFreeze();
    playFreeze();
    spawnPopup(col * CELL + CELL / 2, row * CELL, "+50");
    checkExtraLife();
  }
  if (remaining <= 0 && !state.transitioning) levelComplete();
}

function checkExtraLife() {
  if (!state.extraLifeAwarded && state.score >= cfg.extraLifeScore) {
    state.extraLifeAwarded = true;
    state.lives++;
    renderLives();
    flashToast(t("extraLifeToast"));
    playExtraLife();
  }
}

// Freeze time shortens 0.5 s per level, never below 40 % of the preset.
function freezeDuration() {
  return Math.max(cfg.freezeMs * 0.4, cfg.freezeMs - (state.level - 1) * 500);
}

function triggerFreeze() {
  state.smashStreak = 0;
  state.freezeTimer = freezeDuration();
  enemies.forEach((e) => { if (e.state !== "reforming") e.frozen = true; });
  flashToast(t("freezeToast"));
}

function updateFreeze(dt) {
  if (state.freezeTimer <= 0) return;
  state.freezeTimer -= dt;
  if (state.freezeTimer <= 0) {
    state.freezeTimer = 0;
    enemies.forEach((e) => { e.frozen = false; });
  }
}

function smash(e) {
  state.smashStreak++;
  const value = SMASH_VALUES[Math.min(state.smashStreak - 1, SMASH_VALUES.length - 1)];
  state.score += value;
  updateScoreUI();
  spawnShards(e.x + CELL / 2, e.y + CELL / 2, ICE, 8);
  spawnPopup(e.x + CELL / 2, e.y, `+${value}`);
  e.frozen = false;
  e.state = "reforming";
  e.timer = 0;
  e.dir = ZERO;
  e.col = PLAZA_CENTER.col; e.row = PLAZA_CENTER.row;
  e.x = e.col * CELL; e.y = e.row * CELL;
  playSmash();
  checkExtraLife();
}

let transitionRemaining = 0;
let transitionAction = null;
function scheduleTransition(ms, action) { transitionRemaining = ms; transitionAction = action; }

function startPop() {
  state.popping = true;
  state.popTimer = 0;
  state.transitioning = true;
  ball.dir = ZERO;
  ball.queuedDir = ZERO;
  spawnShards(ball.x + CELL / 2, ball.y + CELL / 2, "#ffd21f", 12);
  playPop();
}

function finishPop() {
  state.popping = false;
  state.lives--;
  renderLives();
  if (state.lives <= 0) {
    state.transitioning = false;
    endGame();
    return;
  }
  respawnPositions();
  flashToast(t("lifeLostToast"));
  scheduleTransition(READY_PAUSE_MS, () => {
    state.transitioning = false;
    state.invulnerableTimer = 1600;
  });
}

function respawnPositions() {
  Object.assign(ball, {
    col: BALL_HOME.col, row: BALL_HOME.row, x: BALL_HOME.col * CELL, y: BALL_HOME.row * CELL,
    dir: ZERO, queuedDir: ZERO, turnBufferMs: 0,
  });
  heldDirs.length = 0;
  enemies.forEach((e, i) => Object.assign(e, {
    col: e.spawn.col, row: e.spawn.row, x: e.spawn.col * CELL, y: e.spawn.row * CELL,
    dir: ZERO, state: "dormant", frozen: false, timer: 0, releaseDelay: cfg.releaseDelays[i],
  }));
  state.freezeTimer = 0;
  state.calmTimer = CALM_MS;
}

function loadLevelMaze() {
  const seed = state.mode.kind === "daily" ? levelSeed(state.level, state.mode.seed) : levelSeed(state.level);
  maze = makeMaze(seed);
  collect = maze.map((v) => (v === 0 ? 1 : v === 3 ? 2 : 0));
  remaining = collect.filter((v) => v > 0).length;
  wallsDirty = true;
  gemsDirty = true;
}

function levelComplete() {
  state.transitioning = true;
  flashToast(t("levelClear", state.level));
  playLevelClear();
  scheduleTransition(1600, () => {
    state.level++;
    updateLevelUI();
    loadLevelMaze();
    respawnPositions();
    state.transitioning = false;
    flashToast(t("levelIncoming", state.level));
  });
}

function endGame() {
  state.over = true;
  state.running = false;
  const best = bestScore();
  const isNewBest = state.score > best;
  if (isNewBest) writeStorage(bestKey(), String(state.score));
  lastResult = { score: state.score, level: state.level, best, isNewBest, daily: state.mode.kind === "daily" };
  renderGameOver();
  updateBestDisplay();
  openModal();
}

// Kept separate so switching language while the modal is open re-renders it.
function renderGameOver() {
  const { score, level, best, isNewBest, daily } = lastResult;
  modalTitle.textContent = t("loseTitle");
  modalText.textContent = daily ? t("textDaily", level) : t("textCaught", level);
  const stat = (value, label) => `
    <div class="m-stat">
      <span class="m-stat-value">${value}</span>
      <span class="m-stat-label">${t(label)}</span>
    </div>`;
  modalStats.innerHTML = stat(score, "statScore") + stat(level, "statLevel") + stat(isNewBest ? t("newBest") : best, "statBest");
}

/* ==================== Collisions ==================== */
function checkEnemyCollisions() {
  for (const e of enemies) {
    if (e.state === "reforming") continue;
    const dx = Math.abs(e.x - ball.x);
    const dist = Math.hypot(Math.min(dx, CW - dx), e.y - ball.y);
    if (dist >= CELL * 0.6) continue;
    if (e.frozen) smash(e);
    else if (state.invulnerableTimer <= 0 && !autopilot) { startPop(); break; }
  }
}

/* ==================== Game setup ==================== */
function newGame(difficulty = state.difficulty, mode = state.mode) {
  document.body.classList.remove("is-playing");
  transitionAction = null;
  transitionRemaining = 0;
  heldDirs.length = 0;
  clearTimeout(flashToast._t);
  waveToast.classList.remove("is-visible");
  document.querySelectorAll(".is-pressed").forEach((b) => b.classList.remove("is-pressed"));
  pauseOverlay.classList.add("is-hidden");
  cfg = DIFFICULTIES[difficulty];
  Object.assign(state, {
    difficulty, mode, score: 0, level: 1, lives: cfg.lives,
    running: false, paused: false, over: false, transitioning: false,
    popping: false, popTimer: 0, invulnerableTimer: 0, smashStreak: 0, extraLifeAwarded: false,
  });
  particles.length = 0;
  loadLevelMaze();
  ball = makeBall();
  enemies = makeEnemies();
  respawnPositions();
  updateScoreUI();
  updateLevelUI();
  renderLives();
  updateBestDisplay();
  closeModal();
  showStartOverlay();
}

/* ==================== Intro splash ==================== */
const INTRO_DURATION = 3200;
let introOpen = true;
let introTimer = null;
const introOverlay = el("intro-overlay");
const introProgressFill = el("intro-progress-fill");

function startIntroTimer() {
  introProgressFill.classList.add("is-running");
  introTimer = setTimeout(closeIntro, INTRO_DURATION);
}
function closeIntro() {
  if (!introOpen) return;
  introOpen = false;
  clearTimeout(introTimer);
  introOverlay.classList.remove("is-open");
  playTone(440, 0.07);
}
el("intro-play").addEventListener("click", closeIntro);
introOverlay.addEventListener("click", (e) => { if (e.target === introOverlay) closeIntro(); });
startIntroTimer();

/* ==================== Input ==================== */
function showStartOverlay() {
  startOverlay.classList.remove("is-hidden");
  pauseOverlay.classList.add("is-hidden");
}
function hideStartOverlay() { startOverlay.classList.add("is-hidden"); }

function tryStart() {
  if (introOpen || state.over) return;
  if (!state.running) {
    state.running = true;
    document.body.classList.add("is-playing");
    hideStartOverlay();
    canvas.focus({ preventScroll: true });
    ensureAudio();
  } else if (state.paused) {
    resumeGame();
  }
}
function pauseGame() {
  if (!state.running || state.over) return;
  heldDirs.length = 0;
  ball.queuedDir = ZERO;
  ball.turnBufferMs = 0;
  document.querySelectorAll(".is-pressed").forEach((b) => b.classList.remove("is-pressed"));
  state.paused = true;
  pauseOverlay.classList.remove("is-hidden");
}
function resumeGame() {
  state.paused = false;
  pauseOverlay.classList.add("is-hidden");
}
function togglePause() {
  if (!state.running || state.over) return;
  if (state.paused) resumeGame(); else pauseGame();
}
function goToMenu() { newGame(state.difficulty, state.mode); }

// Held directions in press order, so releasing the latest falls back to one
// still held and key auto-repeat can never override a fresh turn.
const heldDirs = [];

function pressDir(id, x, y) {
  if (introOpen || state.over || state.transitioning) return;
  ball.turnBufferMs = 0;
  if (!heldDirs.some((h) => h.id === id)) heldDirs.push({ id, x, y });
  ball.queuedDir = { x, y };
  if ((x || y) && x === -ball.dir.x && y === -ball.dir.y) {
    ball.dir = { x, y };
    ball.lastDir = { x, y };
  }
  tryStart();
}

function releaseDir(id) {
  const i = heldDirs.findIndex((h) => h.id === id);
  if (i !== -1) heldDirs.splice(i, 1);
  if (heldDirs.length > 0) {
    const last = heldDirs[heldDirs.length - 1];
    ball.queuedDir = { x: last.x, y: last.y };
  } else {
    // A short tap survives until the next nearby junction, then is consumed.
    ball.turnBufferMs = 180;
  }
}

const DIR_KEYS = {
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
};

document.addEventListener("keydown", (e) => {
  if (e.repeat && ["p", "P", "Escape", " "].includes(e.key)) return;
  if (e.target?.matches?.("button, a") && [" ", "Enter"].includes(e.key)) return;
  if (state.over && e.key === "Escape") { goToMenu(); return; }
  if (DIR_KEYS[e.key] || [" ", "p", "P"].includes(e.key)) e.preventDefault();
  if (introOpen) {
    if (e.key === " " || e.key === "Enter") closeIntro();
    return;
  }
  const dir = DIR_KEYS[e.key];
  if (dir && !e.repeat) pressDir(e.key, dir.x, dir.y);
  else if (e.key === " ") tryStart();
  if (e.key === "p" || e.key === "P" || e.key === "Escape") togglePause();
});

document.addEventListener("keyup", (e) => { if (DIR_KEYS[e.key]) releaseDir(e.key); });

startOverlay.addEventListener("click", tryStart);
pauseOverlay.addEventListener("click", resumeGame);

function bindDpad(button, dx, dy, id) {
  const down = (e) => { e.preventDefault(); button.setPointerCapture(e.pointerId); button.classList.add("is-pressed"); pressDir(id, dx, dy); };
  const up = (e) => { if (e) e.preventDefault(); button.classList.remove("is-pressed"); releaseDir(id); };
  button.addEventListener("pointerdown", down);
  button.addEventListener("pointerup", up);
  button.addEventListener("lostpointercapture", up);
  button.addEventListener("pointercancel", up);
}
bindDpad(el("btn-up"), 0, -1, "touch-up");
bindDpad(el("btn-down"), 0, 1, "touch-down");
bindDpad(el("btn-left"), -1, 0, "touch-left");
bindDpad(el("btn-right"), 1, 0, "touch-right");

// Swipe on the maze steers like a held D-pad direction until the finger lifts.
let swipe = null;
const SWIPE_MIN_PX = 14;
canvas.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse") return;
  swipe = { x: e.clientX, y: e.clientY, dir: null };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", (e) => {
  if (!swipe) return;
  const dx = e.clientX - swipe.x, dy = e.clientY - swipe.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_PX) return;
  const dir = Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
  swipe.x = e.clientX; swipe.y = e.clientY;
  if (swipe.dir && sameDir(swipe.dir, dir)) return;
  if (swipe.dir) releaseDir("swipe");
  swipe.dir = dir;
  pressDir("swipe", dir.x, dir.y);
});
const endSwipe = () => { if (swipe?.dir) releaseDir("swipe"); swipe = null; };
canvas.addEventListener("pointerup", endSwipe);
canvas.addEventListener("pointercancel", endSwipe);
canvas.addEventListener("lostpointercapture", endSwipe);
el("btn-pause").addEventListener("click", (e) => { e.preventDefault(); togglePause(); });
el("btn-resume").addEventListener("click", (e) => { e.stopPropagation(); resumeGame(); });
el("btn-menu").addEventListener("click", (e) => { e.stopPropagation(); goToMenu(); });

window.addEventListener("blur", pauseGame);
document.addEventListener("visibilitychange", () => { if (document.hidden) pauseGame(); });

/* ==================== Update loop ==================== */
function update(dt) {
  if (state.paused || state.over) return;

  if (transitionAction) {
    transitionRemaining -= dt;
    if (transitionRemaining <= 0) {
      const action = transitionAction;
      transitionAction = null;
      action();
    }
    return;
  }

  if (state.popping) {
    state.popTimer += dt;
    if (state.popTimer >= POP_ANIM_MS) finishPop();
    return;
  }

  if (!state.running || state.transitioning) return;

  stepEntity(ball, BASE_BALL_SPEED * cfg.ballSpeedMul, dt, pickBallDir, collectTile);
  if (state.transitioning) return;
  if (ball.turnBufferMs > 0) {
    ball.turnBufferMs = Math.max(0, ball.turnBufferMs - dt);
    if (!ball.turnBufferMs) ball.queuedDir = ZERO;
  }
  if (!isZero(ball.dir)) ball.roll += dt * 0.012;

  enemies.forEach((e) => updateEnemy(e, dt));

  if (state.calmTimer > 0) state.calmTimer -= dt;
  updateFreeze(dt);
  if (state.invulnerableTimer > 0) state.invulnerableTimer -= dt;

  checkEnemyCollisions();
}

/* ==================== Draw ====================
   Walls never change during a level and gems only when one is taken, so both
   are baked onto offscreen canvases instead of being redrawn every frame. */
const wallLayer = document.createElement("canvas");
wallLayer.width = CW; wallLayer.height = CH;
const wallCtx = wallLayer.getContext("2d");
const gemLayer = document.createElement("canvas");
gemLayer.width = CW; gemLayer.height = CH;
const gemCtx = gemLayer.getContext("2d");
let wallsDirty = true;
let gemsDirty = true;

const center = (c, r) => [c * CELL + CELL / 2, r * CELL + CELL / 2];
const wallColor = () => WALL_THEMES[(state.level - 1) % WALL_THEMES.length];

function renderWallLayer() {
  const c = wallCtx;
  c.clearRect(0, 0, CW, CH);
  c.fillStyle = "#05060c";
  c.fillRect(0, 0, CW, CH);
  const wall = (col, row) => col >= 0 && col < COLS && row >= 0 && row < ROWS && maze[idx(col, row)] === 1;
  const pipes = new Path2D();
  const pillars = [];
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      if (!wall(col, r)) continue;
      const [x, y] = center(col, r);
      let joined = false;
      for (const [dc, dr] of [[1, 0], [0, 1]]) {
        if (!wall(col + dc, r + dr)) continue;
        pipes.moveTo(x, y);
        pipes.lineTo(x + dc * CELL, y + dr * CELL);
        joined = true;
      }
      if (!joined && !wall(col - 1, r) && !wall(col, r - 1)) pillars.push([x, y]);
    }
  }
  const color = wallColor();
  c.lineCap = "round";
  c.lineJoin = "round";
  c.strokeStyle = color; c.globalAlpha = 0.18; c.lineWidth = 11; c.stroke(pipes);
  c.globalAlpha = 1; c.lineWidth = 7; c.stroke(pipes);
  // Lone wall blocks are squares so they never read as something to collect.
  c.fillStyle = color;
  for (const [x, y] of pillars) {
    c.beginPath();
    c.roundRect ? c.roundRect(x - 4.5, y - 4.5, 9, 9, 2) : c.rect(x - 4.5, y - 4.5, 9, 9);
    c.fill();
  }
  c.strokeStyle = "rgba(255,255,255,0.35)"; c.lineWidth = 1.5; c.stroke(pipes);
  wallsDirty = false;
}

function renderGemLayer() {
  const c = gemCtx;
  c.clearRect(0, 0, CW, CH);
  c.fillStyle = "#d8f6ff";
  for (let i = 0; i < collect.length; i++) {
    if (collect[i] !== 1) continue;
    const [x, y] = center(i % COLS, Math.floor(i / COLS));
    c.beginPath();
    c.moveTo(x, y - 2.6); c.lineTo(x + 2.6, y); c.lineTo(x, y + 2.6); c.lineTo(x - 2.6, y);
    c.closePath();
    c.fill();
  }
  gemsDirty = false;
}

function drawOrbs(now) {
  const pulse = 1.075 + Math.sin(now / 160) * 0.175;
  const spin = (now / 2400) * Math.PI;
  for (let i = 0; i < collect.length; i++) {
    if (collect[i] !== 2) continue;
    const [x, y] = center(i % COLS, Math.floor(i / COLS));
    ctx.fillStyle = "rgba(92,200,255,0.25)";
    ctx.beginPath(); ctx.arc(x, y, 6.5 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.strokeStyle = "#e8faff";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI) / 3;
      ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5);
      ctx.lineTo(-Math.cos(a) * 5, -Math.sin(a) * 5);
    }
    ctx.stroke();
    ctx.restore();
  }
}

function drawBall(now) {
  const [cx, cy] = [ball.x + CELL / 2, ball.y + CELL / 2];
  const r = CELL * 0.45;
  let scale = 1, alpha = 1, eyes = true;
  if (state.popping) {
    const p = Math.min(1, state.popTimer / POP_ANIM_MS);
    scale = 1 + p * 0.8; alpha = 1 - p; eyes = false;
  } else if (state.invulnerableTimer > 0 && Math.floor(now / 100) % 2 === 0) {
    return;
  }
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  // The ball may straddle the tunnel seam: draw a wrapped copy as well.
  for (const off of ball.x > CW - CELL ? [0, -CW] : [0]) {
    ctx.save();
    ctx.translate(off, 0);
    ctx.fillStyle = "#ffd21f";
    ctx.strokeStyle = "#ffb300";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // The shine circles the ball as it rolls.
    const sr = CELL * 0.22;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.beginPath();
    ctx.arc(-sr * 0.6 + Math.cos(ball.roll) * sr * 0.25, -(sr * 0.7 + Math.sin(ball.roll) * sr * 0.2), CELL * 0.11, 0, Math.PI * 2);
    ctx.fill();
    if (eyes) {
      const d = isZero(ball.dir) ? ball.lastDir : ball.dir;
      ctx.fillStyle = "#1a1300";
      for (const side of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(side * 3.2 + d.x * 2.6, -1.5 + d.y * 2.6, 1.7, 2.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  ctx.restore();
}

function roundedSquare(c, size, radius) {
  const h = size / 2;
  c.beginPath();
  if (c.roundRect) c.roundRect(-h, -h, size, size, radius);
  else c.rect(-h, -h, size, size);
}

function drawEnemy(e, now) {
  const size = CELL * 0.98;
  let [cx, cy] = [e.x + CELL / 2, e.y + CELL / 2];
  if (e.state === "dormant" && !e.frozen) cy -= Math.sin(e.wobble) * 1.5;
  ctx.save();
  ctx.translate(cx, cy);
  if (e.state === "reforming") {
    const p = Math.min(1, e.timer / REFORM_MS);
    ctx.globalAlpha = 0.3 + 0.7 * p;
    ctx.scale(0.4 + 0.6 * p, 0.4 + 0.6 * p);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 1.2;
    roundedSquare(ctx, size, size * 0.22);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const thawing = e.frozen && state.freezeTimer < 2000;
  if (thawing) ctx.rotate(Math.sin(now / 25) * 0.08);
  if (e.state === "dormant" && !e.frozen) ctx.globalAlpha = 0.85;
  roundedSquare(ctx, size, size * 0.22);
  if (e.frozen) {
    ctx.fillStyle = thawing && Math.floor(now / 150) % 2 === 0 ? e.color + "99" : ICE;
    ctx.strokeStyle = ICE_EDGE;
  } else {
    ctx.fillStyle = e.color;
    ctx.strokeStyle = e.color;
  }
  ctx.lineWidth = 1.2;
  ctx.fill();
  ctx.stroke();
  // Shade along the bottom.
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-size * 0.4, size * 0.2, size * 0.8, size * 0.22, size * 0.1);
  else ctx.rect(-size * 0.4, size * 0.2, size * 0.8, size * 0.22);
  ctx.fill();
  // Eyes; pupils look where the cube is heading unless frozen.
  const d = e.frozen ? ZERO : (isZero(e.dir) ? { x: 0, y: 1 } : e.dir);
  const er = size * 0.15;
  for (const side of [-1, 1]) {
    const ex = side * size * 0.2, ey = -size * 0.04;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#14101e";
    ctx.beginPath(); ctx.arc(ex + d.x * er * 0.5, ey + d.y * er * 0.5, er * 0.55, 0, Math.PI * 2); ctx.fill();
  }
  ctx.lineCap = "round";
  if (e.frozen) {
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.32); ctx.lineTo(-size * 0.05, -size * 0.05);
    ctx.lineTo(-size * 0.15, size * 0.12); ctx.lineTo(size * 0.18, size * 0.34);
    ctx.stroke();
  } else {
    ctx.strokeStyle = "#14101e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.36, -size * 0.3); ctx.lineTo(-size * 0.08, -size * 0.2);
    ctx.moveTo(size * 0.36, -size * 0.3); ctx.lineTo(size * 0.08, -size * 0.2);
    ctx.stroke();
  }
  ctx.restore();
}

/* ---- Effects: shards and score popups ---- */
const particles = [];
function spawnShards(x, y, color, count) {
  const now = performance.now();
  for (let k = 0; k < count; k++) {
    const angle = (k / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.6;
    particles.push({ kind: "shard", x, y, color, angle, dist: 10 + Math.random() * 10, born: now, life: 450 });
  }
}
function spawnPopup(x, y, text) {
  particles.push({ kind: "text", x, y, text, born: performance.now(), life: 600 });
}
function drawParticles(now) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    const k = (now - p.born) / p.life;
    if (k >= 1) { particles.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = 1 - k;
    if (p.kind === "shard") {
      ctx.translate(p.x + Math.cos(p.angle) * p.dist * k, p.y + Math.sin(p.angle) * p.dist * k);
      ctx.rotate(k * Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fillRect(-1.5, -1.5, 3, 3);
    } else {
      ctx.fillStyle = "#ffe28a";
      ctx.font = "bold 12px 'JetBrains Mono', Menlo, monospace";
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y - 14 * k);
    }
    ctx.restore();
  }
}

function draw() {
  const now = performance.now();
  if (wallsDirty) renderWallLayer();
  if (gemsDirty) renderGemLayer();
  ctx.drawImage(wallLayer, 0, 0);
  ctx.drawImage(gemLayer, 0, 0);
  drawOrbs(now);
  enemies.forEach((e) => drawEnemy(e, now));
  drawBall(now);
  drawParticles(now);
}

/* ==================== Main loop ==================== */
let lastTime = 0;
function loop(ts) {
  const dt = Math.min(40, ts - lastTime || 16);
  lastTime = ts;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

/* ==================== Modal ==================== */
el("modal-replay").addEventListener("click", () => { newGame(); tryStart(); });
el("modal-close").addEventListener("click", goToMenu);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) goToMenu(); });
function openModal() { modalOverlay.classList.add("is-open"); el("modal-replay").focus({ preventScroll: true }); }
function closeModal() { modalOverlay.classList.remove("is-open"); }

/* ==================== Init ==================== */
el("sound-icon").textContent = state.soundOn ? "🔊" : "🔇";
canvas.width = CW;
canvas.height = CH;
applyTranslations();
newGame(state.difficulty);
requestAnimationFrame(loop);
