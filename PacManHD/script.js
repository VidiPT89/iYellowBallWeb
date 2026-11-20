/* ==================== i18n ==================== */
const TRANSLATIONS = {
  pt: {
    introTitle: "Pac-Man HD",
    introText: "Um remake moderno do clássico arcade de 1980. Engole o labirinto, foge dos fantasmas e persegue o recorde.",
    introSkipBtn: "Saltar",
    eyebrow: "LABIRINTO CLÁSSICO",
    title1: "Foge. Persegue.",
    title2: "Come tudo.",
    tagline: "Guia o Pac-Man pelo labirinto, engole todos os pontos e as pastilhas de poder, e foge dos quatro fantasmas — cada um com a sua própria personalidade — antes que te apanhem.",
    diffEasy: "Fácil",
    diffEasyMeta: "4 vidas",
    diffNormal: "Normal",
    diffNormalMeta: "3 vidas",
    diffHard: "Difícil",
    diffHardMeta: "2 vidas",
    scoreLabel: "Pontos",
    levelLabel: "Nível",
    livesLabel: "Vidas",
    bestLabel: "Melhor",
    pressStartKicker: "TOCA OU PRIME",
    pressStart: "ESPAÇO PARA COMEÇAR",
    pausedTitle: "PAUSA",
    pausedSub: "Prime P ou toca para retomar",
    resumeBtn: "Retomar",
    menuBtn: "Menu inicial",
    controlsHint: "⌨️ Setas ou WASD para mover · P para pausar",
    footerBy: "Desenvolvido por",
    playAgainBtn: "Jogar Novamente",
    closeBtn: "Fechar",
    levelClear: (n) => `NÍVEL ${n} CONCLUÍDO`,
    levelIncoming: (n) => `NÍVEL ${n}`,
    lifeLostToast: "PAC-MAN APANHADO",
    extraLifeToast: "🎉 VIDA EXTRA!",
    loseTitle: "Fim de Jogo",
    textCaught: (lvl) => `Foste apanhado pelos fantasmas no nível ${lvl}.`,
    statScore: "Pontos",
    statLevel: "Nível",
    statBest: "Recorde",
    newBest: "🏆 Novo recorde!",
    ghostEatToast: (n) => `+${n}`,
  },
  en: {
    introTitle: "Pac-Man HD",
    introText: "A modern remake of the 1980 arcade classic. Gobble the maze, dodge the ghosts and chase the high score.",
    introSkipBtn: "Skip",
    eyebrow: "CLASSIC MAZE",
    title1: "Run. Chase.",
    title2: "Eat it all.",
    tagline: "Guide Pac-Man through the maze, gobble every dot and power pellet, and outrun four ghosts — each with its own personality — before they catch you.",
    diffEasy: "Easy",
    diffEasyMeta: "4 lives",
    diffNormal: "Normal",
    diffNormalMeta: "3 lives",
    diffHard: "Hard",
    diffHardMeta: "2 lives",
    scoreLabel: "Score",
    levelLabel: "Level",
    livesLabel: "Lives",
    bestLabel: "Best",
    pressStartKicker: "TAP OR PRESS",
    pressStart: "SPACE TO START",
    pausedTitle: "PAUSED",
    pausedSub: "Press P or tap to resume",
    resumeBtn: "Resume",
    menuBtn: "Main Menu",
    controlsHint: "⌨️ Arrows or WASD to move · P to pause",
    footerBy: "Developed by",
    playAgainBtn: "Play Again",
    closeBtn: "Close",
    levelClear: (n) => `LEVEL ${n} CLEARED`,
    levelIncoming: (n) => `LEVEL ${n}`,
    lifeLostToast: "PAC-MAN CAUGHT",
    extraLifeToast: "🎉 EXTRA LIFE!",
    loseTitle: "Game Over",
    textCaught: (lvl) => `You were caught by the ghosts on level ${lvl}.`,
    statScore: "Score",
    statLevel: "Level",
    statBest: "Best",
    newBest: "🏆 New record!",
    ghostEatToast: (n) => `+${n}`,
  },
};

const DIFFICULTIES = {
  easy: { lives: 4, pacSpeedMul: 0.85, ghostSpeedMul: 0.72, frightenedMs: 9000, releaseDelays: [150, 2200, 6000, 10000], extraLifeScore: 8000 },
  normal: { lives: 3, pacSpeedMul: 0.95, ghostSpeedMul: 0.85, frightenedMs: 7000, releaseDelays: [150, 2000, 5500, 9000], extraLifeScore: 10000 },
  hard: { lives: 2, pacSpeedMul: 1.05, ghostSpeedMul: 0.98, frightenedMs: 5000, releaseDelays: [150, 1200, 3800, 6500], extraLifeScore: 12000 },
};

const STORAGE_LANG = "pacmanhd:lang";
const STORAGE_SOUND = "pacmanhd:sound";
const bestKey = (diff) => `pacmanhd:best:${diff}`;

// Storage is optional (private browsing, disabled cookies or exhausted quota).
function readStorage(key) { try { return localStorage.getItem(key); } catch { return null; } }
function writeStorage(key, value) { try { localStorage.setItem(key, value); } catch { /* Keep playing without persistence. */ } }
function bestScore() { const value = Number(readStorage(bestKey(state.difficulty))); return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0; }

/* ==================== Maze ====================
   0 = dot, 1 = wall, 2 = ghost house, 3 = power pellet, 4 = empty path */
const COLS = 28;
const ROWS = 28;
const CELL = 20;

const MAZE = [
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
  1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1,
  1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,
  1,0,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,
  1,1,1,1,1,1,0,1,1,4,4,4,4,4,4,4,4,4,4,1,1,0,1,1,1,1,1,1,
  1,1,1,1,1,1,0,1,1,4,1,1,1,2,2,1,1,1,4,1,1,0,1,1,1,1,1,1,
  1,1,1,1,1,1,0,1,1,4,1,2,2,2,2,2,2,1,4,1,1,0,1,1,1,1,1,1,
  4,4,4,4,4,4,0,0,0,4,1,2,2,2,2,2,2,1,4,0,0,0,4,4,4,4,4,4,
  1,1,1,1,1,1,0,1,1,4,1,2,2,2,2,2,2,1,4,1,1,0,1,1,1,1,1,1,
  1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1,
  1,1,1,1,1,1,0,1,1,4,1,1,1,1,1,1,1,1,4,1,1,0,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,1,
  1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
  1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,
  1,3,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,3,1,
  1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,
  1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1,
  1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1,
  1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,
  1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
];

const PAC_HOME = { col: 14, row: 17 };
const DOOR_EXIT = { col: 13, row: 10 };
const HOUSE_ENTRY = { col: 13, row: 12 };

const GHOST_DEFS = [
  { name: "blinky", color: "#ff2e6c", home: { col: 12, row: 12 }, scatter: { col: 26, row: 0 } },
  { name: "pinky", color: "#ff8fd0", home: { col: 12, row: 13 }, scatter: { col: 1, row: 0 } },
  { name: "inky", color: "#33e0ff", home: { col: 15, row: 12 }, scatter: { col: 26, row: 27 } },
  { name: "clyde", color: "#ffb347", home: { col: 15, row: 13 }, scatter: { col: 1, row: 27 } },
];

const PHASES = [
  { mode: "scatter", dur: 7000 },
  { mode: "chase", dur: 20000 },
  { mode: "scatter", dur: 7000 },
  { mode: "chase", dur: 20000 },
  { mode: "scatter", dur: 5000 },
  { mode: "chase", dur: 999999 },
];

const BASE_PAC_SPEED = 0.130; // px/ms
const BASE_GHOST_SPEED = 0.120; // px/ms
const DEATH_ANIM_MS = 900;
const READY_PAUSE_MS = 650;

function idx(col, row) { return row * COLS + col; }

function rawTile(col, row) {
  if (row < 0 || row >= ROWS) return 1;
  let c = col;
  if (c < 0) c += COLS;
  if (c >= COLS) c -= COLS;
  return MAZE[idx(c, row)];
}

let collect = [];
let remaining = 0;
let dotsLayerDirty = true;

function resetCollectibles() {
  collect = MAZE.map((v) => (v === 0 ? 1 : v === 3 ? 2 : 0));
  remaining = collect.filter((v) => v > 0).length;
  dotsLayerDirty = true;
}

/* ==================== DOM refs ==================== */
const el = (id) => document.getElementById(id);
const canvas = el("game-canvas");
const ctx = canvas.getContext("2d");
const CW = canvas.width;
const CH = canvas.height;

const scoreValueEl = el("score-value");
const levelValueEl = el("level-value");
const bestValueEl = el("best-value");
const livesTrack = el("lives-track");
const startOverlay = el("start-overlay");
const pauseOverlay = el("pause-overlay");
const waveToast = el("wave-toast");
const modalOverlay = el("modal-overlay");
const modalIcon = el("modal-icon");
const modalTitle = el("modal-title");
const modalText = el("modal-text");
const modalStats = el("modal-stats");

/* ==================== State ==================== */
const state = {
  lang: (["pt", "en"].includes(readStorage(STORAGE_LANG)) ? readStorage(STORAGE_LANG) : null) || (navigator.language?.startsWith("pt") ? "pt" : "en"),
  soundOn: readStorage(STORAGE_SOUND) !== "off",
  difficulty: "normal",
  score: 0,
  level: 1,
  lives: 3,
  running: false,
  paused: false,
  over: false,
  transitioning: false,
  dying: false,
  dyingTimer: 0,
  invulnerableTimer: 0,
  frightenedTimer: 0,
  ghostEatStreak: 0,
  extraLifeAwarded: false,
  phaseIndex: 0,
  phaseTimer: 0,
  chompToggle: false,
};

function t(key, ...args) {
  const value = TRANSLATIONS[state.lang][key];
  return typeof value === "function" ? value(...args) : value;
}

function applyTranslations() {
  document.documentElement.lang = state.lang === "pt" ? "pt-PT" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    const value = TRANSLATIONS[state.lang][key];
    if (typeof value === "string") node.textContent = value;
  });
  el("lang-label").textContent = state.lang.toUpperCase();
  el("lang-flag").textContent = state.lang === "pt" ? "🇵🇹" : "🇬🇧";
  updateBestDisplay();
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

/* ==================== Sound ==================== */
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
    gain.gain.value = gainValue;
    osc.connect(gain).connect(ac.destination);
    const startAt = ac.currentTime + delay;
    osc.start(startAt);
    gain.gain.setValueAtTime(gainValue, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.stop(startAt + duration + 0.02);
  } catch (e) {
    /* audio unsupported */
  }
}

function playSequence(notes) {
  notes.forEach(([freq, delay, duration, type, gain]) => {
    playTone(freq, duration || 0.15, type || "square", gain || 0.05, delay / 1000);
  });
}

el("sound-toggle").addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  writeStorage(STORAGE_SOUND, state.soundOn ? "on" : "off");
  el("sound-icon").textContent = state.soundOn ? "🔊" : "🔇";
  if (state.soundOn) playTone(440, 0.08);
});

function playChomp() {
  state.chompToggle = !state.chompToggle;
  playTone(state.chompToggle ? 240 : 200, 0.045, "square", 0.045);
}
function playPowerTone() {
  playSequence([[330, 0, 0.09], [415, 60, 0.09], [523, 120, 0.14]]);
}
function playEatGhostTone() {
  playSequence([[600, 0, 0.06], [900, 50, 0.06], [1300, 100, 0.1]]);
}
function playDeathSequence() {
  playSequence([[300, 0, 0.14, "sawtooth"], [230, 140, 0.16, "sawtooth"], [170, 300, 0.2, "sawtooth"], [110, 480, 0.4, "sawtooth"]]);
}
function playLevelClearFanfare() {
  playSequence([[523, 0], [659, 110], [784, 220], [1047, 360, 0.3]]);
}
function playExtraLifeChime() {
  playSequence([[660, 0, 0.1], [880, 90, 0.1], [1100, 180, 0.18]]);
}

/* ==================== Difficulty picker ==================== */
document.querySelectorAll(".diff-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".diff-btn").forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-checked", "false");
    });
    btn.classList.add("is-active");
    btn.setAttribute("aria-checked", "true");
    newGame(btn.dataset.diff);
    playTone(360, 0.08);
  });
});

/* ==================== Entities ==================== */
let cfg = DIFFICULTIES.normal;
let pacman;
let ghosts = [];

function makePacman() {
  return {
    col: PAC_HOME.col, row: PAC_HOME.row,
    x: PAC_HOME.col * CELL, y: PAC_HOME.row * CELL,
    dir: { x: 0, y: 0 }, queuedDir: { x: 0, y: 0 }, lastDir: { x: -1, y: 0 },
    mouthPhase: 0, turnBufferMs: 0,
  };
}

function buildGhosts() {
  return GHOST_DEFS.map((def, i) => ({
    name: def.name,
    color: def.color,
    home: def.home,
    scatter: def.scatter,
    col: def.home.col, row: def.home.row,
    x: def.home.col * CELL, y: def.home.row * CELL,
    dir: { x: 0, y: 0 },
    state: "house",
    houseTimer: 0,
    releaseDelay: cfg.releaseDelays[i],
    bouncePhase: Math.random() * Math.PI * 2,
  }));
}

function normalizePos(e) {
  const W = COLS * CELL;
  if (e.x < -0.01) e.x += W;
  if (e.x >= W - 0.01) e.x -= W;
}

/* ==================== Movement core ==================== */
function stepEntity(e, speed, dt, pickDirFn, onEnter) {
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
      e.dir = pickDirFn(e, c, r);
    }
    if (e.dir.x === 0 && e.dir.y === 0) { remainingDist = 0; break; }
    const axisDir = e.dir.x !== 0 ? e.dir.x : e.dir.y;
    const axisPos = e.dir.x !== 0 ? e.x : e.y;
    const modPos = ((axisPos % CELL) + CELL) % CELL;
    let distToBoundary;
    if (modPos < 0.05) distToBoundary = CELL;
    else distToBoundary = axisDir > 0 ? CELL - modPos : modPos;
    const move = Math.min(remainingDist, distToBoundary);
    e.x += e.dir.x * move;
    e.y += e.dir.y * move;
    remainingDist -= move;
    normalizePos(e);
  }
}

/* ---- Pac-Man direction ---- */
function pacBlocked(col, row) {
  const v = rawTile(col, row);
  return v === 1 || v === 2;
}
function pickPacDir(e, col, row) {
  const q = pacman.queuedDir;
  if ((q.x || q.y) && !pacBlocked(col + q.x, row + q.y)) {
    pacman.lastDir = q;
    if (!heldDirs.length) { pacman.queuedDir = { x: 0, y: 0 }; pacman.turnBufferMs = 0; }
    return q;
  }
  if ((e.dir.x || e.dir.y) && !pacBlocked(col + e.dir.x, row + e.dir.y)) return e.dir;
  // Pac-Man never idles through a plain corridor bend (exactly one non-reverse way
  // to continue: not a real choice, just the shape of the corridor). At a genuine
  // intersection (two or more non-reverse options) turning must be manual, so if
  // the player hasn't queued a valid direction there, he waits — same as a true
  // dead end, or before his very first move. This also avoids an infinite loop:
  // auto-picking a branch at a real intersection could otherwise trap him circling
  // the same handful of cells forever while a direction stays held.
  if (e.dir.x || e.dir.y) {
    const reverse = { x: -e.dir.x, y: -e.dir.y };
    const options = ALL_DIRS.filter(
      (d) => !(d.x === reverse.x && d.y === reverse.y) && !pacBlocked(col + d.x, row + d.y)
    );
    if (options.length === 1) {
      pacman.lastDir = options[0];
      return options[0];
    }
    // A true dead end (no non-reverse way out): back out on his own instead of
    // freezing against the wall. Clearing the queued direction here is what keeps
    // this safe — without it, a direction still held on the D-pad would just walk
    // him straight back in next frame, producing the exact infinite bounce we
    // fixed before. A real intersection (2+ options) still needs a manual turn.
    if (options.length === 0 && !pacBlocked(col + reverse.x, row + reverse.y)) {
      pacman.queuedDir = { x: 0, y: 0 };
      pacman.lastDir = reverse;
      return reverse;
    }
  }
  return { x: 0, y: 0 };
}

/* ---- Ghost direction / AI ---- */
// Order matters for tie-breaks: matches the original arcade priority (up, left, down, right).
const ALL_DIRS = [{ x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }];

function ghostBlocked(ghost, col, row) {
  const v = rawTile(col, row);
  if (v === 1) return true;
  if (v === 2) return !(ghost.state === "leaving" || ghost.state === "eaten" || ghost.state === "house");
  return false;
}

function currentPhaseMode() { return PHASES[state.phaseIndex].mode; }

function getGhostTarget(ghost) {
  if (ghost.state === "leaving") return DOOR_EXIT;
  if (ghost.state === "eaten") return HOUSE_ENTRY;
  if (ghost.state === "scatter") return ghost.scatter;
  // chase
  const p = { col: pacman.col, row: pacman.row };
  const pdir = (pacman.dir.x || pacman.dir.y) ? pacman.dir : pacman.lastDir;
  switch (ghost.name) {
    case "blinky":
      return p;
    case "pinky":
      return { col: p.col + pdir.x * 4, row: p.row + pdir.y * 4 };
    case "inky": {
      const pivot = { col: p.col + pdir.x * 2, row: p.row + pdir.y * 2 };
      const blinky = ghosts.find((g) => g.name === "blinky");
      const bc = blinky ? blinky.col : p.col;
      const br = blinky ? blinky.row : p.row;
      return { col: pivot.col + (pivot.col - bc), row: pivot.row + (pivot.row - br) };
    }
    case "clyde": {
      const dist = Math.hypot(ghost.col - p.col, ghost.row - p.row);
      return dist > 8 ? p : ghost.scatter;
    }
    default:
      return p;
  }
}

function pickGhostDir(ghost, col, row) {
  const reverse = { x: -ghost.dir.x, y: -ghost.dir.y };
  let options = ALL_DIRS.filter((d) => !ghostBlocked(ghost, col + d.x, row + d.y));
  if (options.length > 1) {
    options = options.filter((d) => !(d.x === reverse.x && d.y === reverse.y));
  }
  if (options.length === 0) return { x: 0, y: 0 };
  if (ghost.state === "frightened") {
    return options[Math.floor(Math.random() * options.length)];
  }
  const target = getGhostTarget(ghost);
  let best = options[0];
  let bestDist = Infinity;
  for (const d of options) {
    const nc = col + d.x, nr = row + d.y;
    const dist = (nc - target.col) ** 2 + (nr - target.row) ** 2;
    if (dist < bestDist - 1e-6) { bestDist = dist; best = d; }
  }
  return best;
}

function ghostSpeedFor(ghost) {
  const levelBonus = Math.min(0.3, (state.level - 1) * 0.03);
  let mul = cfg.ghostSpeedMul * (1 + levelBonus);
  if (ghost.state === "frightened") mul *= 0.55;
  else if (ghost.state === "eaten") mul *= 1.9;
  if (ghost.row === 13 && (ghost.x < 5 * CELL || ghost.x > 22 * CELL) && ghost.state !== "eaten") mul *= 0.65;
  return BASE_GHOST_SPEED * mul;
}

function updateGhost(ghost, dt) {
  if (ghost.state === "house") {
    ghost.houseTimer += dt;
    ghost.bouncePhase += dt * 0.006;
    ghost.y = ghost.home.row * CELL + Math.sin(ghost.bouncePhase) * 8;
    ghost.x = ghost.home.col * CELL;
    if (ghost.houseTimer >= ghost.releaseDelay) {
      ghost.state = "leaving";
      ghost.col = ghost.home.col; ghost.row = ghost.home.row;
      ghost.x = ghost.col * CELL; ghost.y = ghost.row * CELL;
      ghost.dir = { x: 0, y: -1 };
    }
    return;
  }
  stepEntity(ghost, ghostSpeedFor(ghost), dt, (e, c, r) => pickGhostDir(ghost, c, r), (c, r) => {
    if (ghost.state === "leaving" && r <= 10) {
      ghost.state = state.frightenedTimer > 0 ? "frightened" : currentPhaseMode();
    }
    if (ghost.state === "eaten" && r >= 12 && r <= 13 && c >= 11 && c <= 16) {
      ghost.state = "house";
      ghost.houseTimer = 0;
      ghost.releaseDelay = 1200;
    }
  });
}

/* ==================== Gameplay events ==================== */
function updateScoreUI() { scoreValueEl.textContent = String(state.score); }
function updateLevelUI() { levelValueEl.textContent = String(state.level); }

function renderLives() {
  livesTrack.innerHTML = "";
  for (let i = 0; i < state.lives; i++) {
    const span = document.createElement("span");
    span.className = "life-icon";
    span.textContent = "🟡";
    livesTrack.appendChild(span);
  }
}

function updateBestDisplay() {
  bestValueEl.textContent = String(bestScore());
}

function flashToast(text) {
  waveToast.textContent = text;
  waveToast.classList.add("is-visible");
  clearTimeout(flashToast._t);
  flashToast._t = setTimeout(() => waveToast.classList.remove("is-visible"), 1300);
}

function handleDotConsumption(col, row) {
  const i = idx(col, row);
  const v = collect[i];
  if (v === 1) {
    collect[i] = 0; remaining--;
    dotsLayerDirty = true;
    state.score += 10;
    updateScoreUI();
    playChomp();
    checkExtraLife();
  } else if (v === 2) {
    collect[i] = 0; remaining--;
    dotsLayerDirty = true;
    state.score += 50;
    updateScoreUI();
    triggerFrightened();
    playPowerTone();
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
    playExtraLifeChime();
  }
}

function triggerFrightened() {
  state.ghostEatStreak = 0;
  state.frightenedTimer = cfg.frightenedMs;
  ghosts.forEach((g) => {
    if (g.state === "scatter" || g.state === "chase" || g.state === "frightened") {
      if (g.state !== "frightened") g.dir = { x: -g.dir.x, y: -g.dir.y };
      g.state = "frightened";
    }
  });
}

function eatGhost(g) {
  state.ghostEatStreak++;
  const value = [200, 400, 800, 1600][Math.min(state.ghostEatStreak - 1, 3)];
  state.score += value;
  updateScoreUI();
  flashToast(t("ghostEatToast", value));
  g.state = "eaten";
  playEatGhostTone();
  checkExtraLife();
}

function startDeathSequence() {
  state.dying = true;
  state.dyingTimer = 0;
  state.transitioning = true;
  pacman.dir = { x: 0, y: 0 };
  pacman.queuedDir = { x: 0, y: 0 };
  playDeathSequence();
}

let transitionRemaining = 0;
let transitionAction = null;
function scheduleTransition(ms, action) {
  transitionRemaining = ms;
  transitionAction = action;
}

function finishDeathSequence() {
  state.dying = false;
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
  state.phaseIndex = 0;
  state.phaseTimer = 0;
  pacman.col = PAC_HOME.col; pacman.row = PAC_HOME.row;
  pacman.x = PAC_HOME.col * CELL; pacman.y = PAC_HOME.row * CELL;
  pacman.dir = { x: 0, y: 0 }; pacman.queuedDir = { x: 0, y: 0 };
  pacman.turnBufferMs = 0;
  heldDirs.length = 0;
  ghosts.forEach((g, i) => {
    g.col = g.home.col; g.row = g.home.row;
    g.x = g.home.col * CELL; g.y = g.home.row * CELL;
    g.dir = { x: 0, y: 0 };
    g.state = "house";
    g.houseTimer = 0;
    g.releaseDelay = cfg.releaseDelays[i];
  });
  state.frightenedTimer = 0;
}

function levelComplete() {
  state.transitioning = true;
  flashToast(t("levelClear", state.level));
  playLevelClearFanfare();
  scheduleTransition(1600, () => {
    state.level++;
    updateLevelUI();
    resetCollectibles();
    respawnPositions();
    state.transitioning = false;
    flashToast(t("levelIncoming", state.level));
  });
}

function endGame() {
  state.over = true;
  state.running = false;
  const best = bestScore();
  let isNewBest = false;
  if (state.score > best) {
    writeStorage(bestKey(state.difficulty), String(state.score));
    isNewBest = true;
  }
  modalIcon.textContent = "👻";
  modalTitle.textContent = t("loseTitle");
  modalText.textContent = t("textCaught", state.level);
  modalStats.innerHTML = `
    <div class="m-stat">
      <span class="m-stat-value">${state.score}</span>
      <span class="m-stat-label">${t("statScore")}</span>
    </div>
    <div class="m-stat">
      <span class="m-stat-value">${state.level}</span>
      <span class="m-stat-label">${t("statLevel")}</span>
    </div>
    <div class="m-stat">
      <span class="m-stat-value">${isNewBest ? t("newBest") : best}</span>
      <span class="m-stat-label">${t("statBest")}</span>
    </div>
  `;
  updateBestDisplay();
  openModal();
}

/* ==================== Phase / frightened timers ==================== */
function updatePhase(dt) {
  if (state.frightenedTimer > 0) return;
  state.phaseTimer += dt;
  const phase = PHASES[state.phaseIndex];
  if (state.phaseTimer >= phase.dur && state.phaseIndex < PHASES.length - 1) {
    state.phaseIndex++;
    state.phaseTimer = 0;
    ghosts.forEach((g) => {
      if (g.state === "scatter" || g.state === "chase") {
        g.dir = { x: -g.dir.x, y: -g.dir.y };
        g.state = currentPhaseMode();
      }
    });
  }
}

function updateFrightened(dt) {
  if (state.frightenedTimer > 0) {
    state.frightenedTimer -= dt;
    if (state.frightenedTimer <= 0) {
      state.frightenedTimer = 0;
      ghosts.forEach((g) => { if (g.state === "frightened") g.state = currentPhaseMode(); });
    }
  }
}

/* ==================== Collisions ==================== */
function checkGhostCollisions() {
  for (const g of ghosts) {
    if (g.state === "house") continue;
    const dx = Math.abs(g.x - pacman.x);
    const dist = Math.hypot(Math.min(dx, CW - dx), g.y - pacman.y);
    if (dist < CELL * 0.55) {
      if (g.state === "frightened") { eatGhost(g); }
      else if (g.state !== "eaten") {
        if (state.invulnerableTimer > 0) continue;
        startDeathSequence();
        break;
      }
    }
  }
}

/* ==================== Game setup ==================== */
function newGame(difficulty = state.difficulty) {
  document.body.classList.remove("is-playing");
  transitionAction = null;
  transitionRemaining = 0;
  state.dying = false;
  state.dyingTimer = 0;
  heldDirs.length = 0;
  clearTimeout(flashToast._t);
  waveToast.classList.remove("is-visible");
  document.querySelectorAll(".is-pressed").forEach(b => b.classList.remove("is-pressed"));
  pauseOverlay.classList.add("is-hidden");
  cfg = DIFFICULTIES[difficulty];
  state.difficulty = difficulty;
  state.score = 0;
  state.level = 1;
  state.lives = cfg.lives;
  state.running = false;
  state.paused = false;
  state.over = false;
  state.transitioning = false;
  state.invulnerableTimer = 0;
  state.frightenedTimer = 0;
  state.ghostEatStreak = 0;
  state.extraLifeAwarded = false;
  state.phaseIndex = 0;
  state.phaseTimer = 0;

  resetCollectibles();
  pacman = makePacman();
  ghosts = buildGhosts();

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
  ensureAudio();
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
  pacman.queuedDir = { x: 0, y: 0 };
  pacman.turnBufferMs = 0;
  document.querySelectorAll(".is-pressed").forEach(button => button.classList.remove("is-pressed"));
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
function goToMenu() {
  newGame(state.difficulty);
}

// Tracks which direction keys/buttons are currently held, in press order,
// so releasing the most recent one correctly falls back to whichever
// direction is still held — and so the OS's key-repeat on a held key can
// never clobber a turn that was just queued for a different direction.
const heldDirs = [];

function pressDir(id, x, y) {
  if (introOpen || state.over || state.transitioning) return;
  pacman.turnBufferMs = 0;
  if (!heldDirs.some((h) => h.id === id)) heldDirs.push({ id, x, y });
  pacman.queuedDir = { x, y };
  if ((x || y) && x === -pacman.dir.x && y === -pacman.dir.y) {
    pacman.dir = { x, y };
    pacman.lastDir = { x, y };
  }
  tryStart();
}

function releaseDir(id) {
  const idx = heldDirs.findIndex((h) => h.id === id);
  if (idx !== -1) heldDirs.splice(idx, 1);
  if (heldDirs.length > 0) {
    const last = heldDirs[heldDirs.length - 1];
    pacman.queuedDir = { x: last.x, y: last.y };
  } else {
    // A short tap survives until the next nearby junction, then is consumed.
    pacman.turnBufferMs = 180;
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
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "A", "D", "w", "W", "s", "S", "p", "P"].includes(e.key)) {
    e.preventDefault();
  }
  if (introOpen) {
    if (e.key === " " || e.key === "Enter") closeIntro();
    return;
  }
  const dir = DIR_KEYS[e.key];
  // ignore the browser's auto-repeat keydowns for a key that's already held,
  // so holding one direction can't keep re-asserting itself over a new turn
  if (dir && !e.repeat) pressDir(e.key, dir.x, dir.y);
  else if (e.key === " ") tryStart();
  if (e.key === "p" || e.key === "P" || e.key === "Escape") togglePause();
});

document.addEventListener("keyup", (e) => {
  if (DIR_KEYS[e.key]) releaseDir(e.key);
});

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

  if (state.dying) {
    state.dyingTimer += dt;

    if (state.dyingTimer >= DEATH_ANIM_MS) finishDeathSequence();
    return;
  }

  if (!state.running || state.transitioning) {

    return;
  }

  stepEntity(pacman, BASE_PAC_SPEED * cfg.pacSpeedMul, dt, pickPacDir, handleDotConsumption);
  if (state.transitioning) return;
  if (pacman.turnBufferMs > 0) {
    pacman.turnBufferMs = Math.max(0, pacman.turnBufferMs - dt);
    if (!pacman.turnBufferMs) pacman.queuedDir = { x: 0, y: 0 };
  }
  pacman.mouthPhase += (pacman.dir.x || pacman.dir.y) ? dt * 0.012 : 0;

  ghosts.forEach((g) => updateGhost(g, dt));

  updatePhase(dt);
  updateFrightened(dt);

  if (state.invulnerableTimer > 0) state.invulnerableTimer -= dt;

  checkGhostCollisions();
}

/* ==================== Draw ====================
   The maze walls never change and the small dots only change once in a
   while (when eaten), so both are pre-rendered onto offscreen canvases
   instead of being redrawn tile-by-tile (with expensive shadowBlur) on
   every single animation frame — that per-frame cost was the source of
   the stutter/slowdown. Only the pulsing power pellets stay "live". */
const wallLayer = document.createElement("canvas");
wallLayer.width = CW; wallLayer.height = CH;
const wallLayerCtx = wallLayer.getContext("2d");

const dotsLayer = document.createElement("canvas");
dotsLayer.width = CW; dotsLayer.height = CH;
const dotsLayerCtx = dotsLayer.getContext("2d");

function renderWallLayer() {
  const c = wallLayerCtx;
  c.fillStyle = "#010102";
  c.fillRect(0, 0, CW, CH);
  const wall = (x, y) => x >= 0 && x < COLS && y >= 0 && y < ROWS && MAZE[idx(x, y)] === 1;
  // Outline connected wall regions, avoiding a visible seam at every tile.
  c.beginPath();
  for (let r = 0; r < ROWS; r++) {
    for (let col = 0; col < COLS; col++) {
      if (!wall(col, r)) continue;
      const x = col * CELL, y = r * CELL;
      if (!wall(col, r - 1)) { c.moveTo(x, y); c.lineTo(x + CELL, y); }
      if (!wall(col, r + 1)) { c.moveTo(x, y + CELL); c.lineTo(x + CELL, y + CELL); }
      if (!wall(col - 1, r)) { c.moveTo(x, y); c.lineTo(x, y + CELL); }
      if (!wall(col + 1, r)) { c.moveTo(x + CELL, y); c.lineTo(x + CELL, y + CELL); }
    }
  }
  c.lineJoin = "round";
  c.strokeStyle = "#1637b7"; c.lineWidth = 5; c.stroke();
  c.strokeStyle = "#557dff"; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = "#ffb8de";
  c.fillRect(13 * CELL, 11 * CELL + 3, 2 * CELL, 3);
}

function renderDotsLayer() {
  const c = dotsLayerCtx;
  c.clearRect(0, 0, CW, CH);
  c.fillStyle = "#ffe28a";
  c.shadowColor = "rgba(255, 212, 0, 0.6)";
  c.shadowBlur = 4;
  for (let i = 0; i < collect.length; i++) {
    if (collect[i] !== 1) continue;
    const col = i % COLS, r = Math.floor(i / COLS);
    const cx = col * CELL + CELL / 2, cy = r * CELL + CELL / 2;
    c.beginPath();
    c.arc(cx, cy, 2.1, 0, Math.PI * 2);
    c.fill();
  }
  dotsLayerDirty = false;
}

function drawMaze() {
  ctx.drawImage(wallLayer, 0, 0);
  if (dotsLayerDirty) renderDotsLayer();
  ctx.drawImage(dotsLayer, 0, 0);

  const pulse = 0.75 + Math.sin(performance.now() / 220) * 0.25;
  for (let i = 0; i < collect.length; i++) {
    if (collect[i] !== 2) continue;
    const c = i % COLS, r = Math.floor(i / COLS);
    const cx = c * CELL + CELL / 2, cy = r * CELL + CELL / 2;
    ctx.save();
    ctx.fillStyle = "#ffe28a";
    ctx.shadowColor = "rgba(255, 212, 0, 0.85)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(cx, cy, 5.5 * pulse + 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawPacman() {
  const blinking = state.invulnerableTimer > 0 && Math.floor(performance.now() / 100) % 2 === 0;
  if (blinking) return;
  const cx = pacman.x + CELL / 2, cy = pacman.y + CELL / 2;
  const r = CELL * 0.46;
  const dir = (pacman.dir.x || pacman.dir.y) ? pacman.dir : pacman.lastDir;
  const angle = Math.atan2(dir.y, dir.x);
  const mouth = Math.abs(Math.sin(pacman.mouthPhase)) * 0.26 * Math.PI + 0.02;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r, mouth, Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fillStyle = "#ffd400";
  ctx.shadowColor = "rgba(255, 212, 0, 0.75)";
  ctx.shadowBlur = 2;
  ctx.fill();
  ctx.restore();
}

function drawPacmanDying() {
  const cx = pacman.x + CELL / 2, cy = pacman.y + CELL / 2;
  const progress = Math.min(1, state.dyingTimer / DEATH_ANIM_MS);
  const r = CELL * 0.46 * (1 - Math.max(0, progress - 0.75) / 0.25);
  const mouth = progress * Math.PI * 0.97;
  const spin = progress * Math.PI * 1.4;
  ctx.save();
  ctx.globalAlpha = 1 - Math.max(0, progress - 0.8) / 0.2;
  ctx.translate(cx, cy);
  ctx.rotate(spin);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, Math.max(0, r), mouth, Math.PI * 2 - mouth);
  ctx.closePath();
  ctx.fillStyle = "#ffd400";
  ctx.shadowColor = "rgba(255, 212, 0, 0.75)";
  ctx.shadowBlur = 2;
  ctx.fill();
  ctx.restore();
}

function drawGhostShape(x, y, size, color) {
  const r = size / 2;
  ctx.beginPath();
  ctx.moveTo(x - r, y + r * 0.9);
  ctx.arc(x, y, r, Math.PI, 0, false);
  const waves = 4;
  const waveW = (2 * r) / waves;
  ctx.lineTo(x + r, y + r * 0.9);
  for (let i = 0; i < waves; i++) {
    const sx = x + r - waveW * i;
    const mx = sx - waveW / 2;
    const ex = sx - waveW;
    const dip = i % 2 === 0 ? r * 0.55 : r * 0.9;
    ctx.quadraticCurveTo(mx, y + dip, ex, y + r * 0.9);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawEyes(x, y, size, dir) {
  const r = size * 0.15;
  const offsetX = size * 0.19, offsetY = -size * 0.08;
  [-1, 1].forEach((s) => {
    const ex = x + s * offsetX, ey = y + offsetY;
    ctx.beginPath();
    ctx.fillStyle = "#f4f8ff";
    ctx.arc(ex, ey, r, 0, Math.PI * 2);
    ctx.fill();
    const px = ex + dir.x * r * 0.55, py = ey + dir.y * r * 0.55;
    ctx.beginPath();
    ctx.fillStyle = "#141428";
    ctx.arc(px, py, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawGhost(g) {
  const cx = g.x + CELL / 2, cy = g.y + CELL / 2;
  const size = CELL * 1.05;
  const dir = (g.dir.x || g.dir.y) ? g.dir : { x: 0, y: 1 };
  if (g.state === "eaten") {
    drawEyes(cx, cy, size, dir);
    return;
  }
  let color = g.color;
  if (g.state === "frightened") {
    const flashing = state.frightenedTimer < 2000 && Math.floor(performance.now() / 150) % 2 === 0;
    color = flashing ? "#eef2ff" : "#2b3fe0";
  }
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 1;
  drawGhostShape(cx, cy, size, color);
  ctx.restore();
  if (g.state === "frightened") {
    ctx.save();
    ctx.strokeStyle = color === "#eef2ff" ? "#d92e38" : "#eef2ff";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx - size * 0.16, cy + size * 0.05, size * 0.07, 0, Math.PI * 2);
    ctx.arc(cx + size * 0.16, cy + size * 0.05, size * 0.07, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const x = cx - size * 0.3 + i * size * 0.1;
      const y = cy + size * (i % 2 ? 0.3 : 0.22);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  } else {
    drawEyes(cx, cy, size, dir);
  }
}

function draw() {
  drawMaze();
  if (state.dying) {
    drawPacmanDying();
  } else {
    ghosts.forEach(drawGhost);
    drawPacman();
  }

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
el("modal-replay").addEventListener("click", () => newGame());
el("modal-close").addEventListener("click", goToMenu);
modalOverlay.addEventListener("click", (e) => { if (e.target === modalOverlay) goToMenu(); });
function openModal() { modalOverlay.classList.add("is-open"); el("modal-replay").focus({ preventScroll: true }); }
function closeModal() { modalOverlay.classList.remove("is-open"); }

/* ==================== Init ==================== */
el("sound-icon").textContent = state.soundOn ? "🔊" : "🔇";
applyTranslations();
renderWallLayer();
newGame(state.difficulty);
requestAnimationFrame(loop);
