// Runs the real game engine without a browser. Rendering/audio are inert adapters.
const { readFileSync, existsSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const noop = () => {};
const context2d = new Proxy({}, { get: () => noop, set: () => true });
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    width: 540, height: 540, style: {}, dataset: {}, textContent: '', innerHTML: '',
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    getContext: () => context2d, addEventListener: noop, setAttribute: noop,
    focus: noop, appendChild: noop, setPointerCapture: noop,
  });
  return elements.get(id);
}
const sandbox = {
  console: { log: noop }, Math, BigInt, Path2D: class { moveTo() {} lineTo() {} }, performance: { now: () => 0 },
  navigator: { language: 'pt' }, localStorage: { getItem: () => null, setItem: noop },
  document: { getElementById: element, createElement: () => element(Symbol()), querySelectorAll: () => [], addEventListener: noop, documentElement: {}, body: element('body') },
  window: { addEventListener: noop },
  requestAnimationFrame: noop, setTimeout: noop, clearTimeout: noop,
};
vm.createContext(sandbox);
vm.runInContext(readFileSync(`${__dirname}/../script.js`, 'utf8'), sandbox);
const run = (code) => vm.runInContext(code, sandbox);
let passed = 0;
function test(name, code) {
  run('newGame("normal", {kind:"classic"}); state.soundOn = false; introOpen = false; autopilot = false;');
  assert.equal(run('{' + code + '}'), true, name);
  console.log(`PASS ${name}`);
  passed++;
}

// Generator: deterministic, symmetric, fully connected, no dead ends, four orbs.
run(`function mazeOk(t){
  const at=(c,r)=>r<0||r>=ROWS?1:t[idx((c+COLS)%COLS,r)];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){
    if(t[idx(c,r)]!==t[idx(COLS-1-c,r)]) return 'asymmetric';
    if(at(c,r)!==1 && ALL_DIRS.filter(d=>at(c+d.x,r+d.y)!==1).length<2) return 'dead end';
  }
  const seen=new Set([idx(BALL_HOME.col,BALL_HOME.row)]); const q=[BALL_HOME];
  while(q.length){const p=q.pop(); for(const d of ALL_DIRS){ if(at(p.col+d.x,p.row+d.y)===1) continue; const n={col:(p.col+d.x+COLS)%COLS,row:p.row+d.y}; const k=idx(n.col,n.row); if(!seen.has(k)){seen.add(k);q.push(n);} }}
  if(!t.every((v,i)=>v===1||seen.has(i))) return 'unreachable';
  if(t.filter(v=>v===3).length!==4) return 'orbs';
  return 'ok';
}`);
for (let level = 1; level <= 30; level++) {
  const res = run(`(()=>{const a=makeMaze(levelSeed(${level})),b=makeMaze(levelSeed(${level}));return a.join()===b.join()?mazeOk(a):'nondeterministic';})()`);
  assert.equal(res, 'ok', `Maze ${level}`);
}
console.log('PASS Mazes 1-30: deterministic, symmetric, reachable, no dead ends, four orbs');
passed++;

test('Each level gets a different maze', `makeMaze(levelSeed(1)).join() !== makeMaze(levelSeed(2)).join()`);
test('Daily maze is the same all day and differs from classic', `const d=dailyMode(new Date(2026,10,20,9)), e=dailyMode(new Date(2026,10,20,22)); d.key==='20261120' && makeMaze(levelSeed(1,d.seed)).join()===makeMaze(levelSeed(1,e.seed)).join() && makeMaze(levelSeed(1,d.seed)).join()!==makeMaze(levelSeed(1)).join()`);
test('Daily mode keeps its own record', `newGame('normal', dailyMode(new Date(2026,10,20))); bestKey()==='iyellowball:best:daily:20261120'`);
test('Immediate reversal between tile centers', `ball.x = BALL_HOME.col*CELL + 7; ball.dir = {x:1,y:0}; pressDir('left',-1,0); ball.dir.x === -1 && ball.x === BALL_HOME.col*CELL + 7`);
test('Freeze reaches every enemy, including dormant ones', `state.running=true; enemies[0].state='roaming'; triggerFreeze(); enemies.every(e=>e.frozen)`);
test('Frozen enemy is smashed and reforms in the plaza', `state.running=true; triggerFreeze(); enemies[0].x=ball.x; enemies[0].y=ball.y; checkEnemyCollisions(); enemies[0].state==='reforming' && !state.popping && state.score===100 && enemies[0].col===PLAZA_CENTER.col`);
test('Freeze wears off', `triggerFreeze(); state.freezeTimer=1; updateFreeze(16); enemies.every(e=>!e.frozen)`);
test('Smashed enemy reforms unfrozen', `triggerFreeze(); smash(enemies[0]); for(let i=0;i<Math.ceil(REFORM_MS/16)+2;i++) updateEnemy(enemies[0],16); enemies[0].state==='dormant' && !enemies[0].frozen`);
test('Roaming enemy pops the ball, which respawns', `state.running=true; state.calmTimer=0; enemies[0].state='roaming'; enemies[0].x=ball.x; enemies[0].y=ball.y; checkEnemyCollisions(); const popped=state.popping; for(let i=0;i<100;i++) update(16); popped && state.lives===2 && !state.popping && !state.transitioning && state.invulnerableTimer>0`);
test('Calm period: enemies wander after a respawn', `state.calmTimer=CALM_MS; enemyTarget(enemies[0])===null`);
test('Pause freezes level transition', `state.running=true; levelComplete(); pauseGame(); update(2000); state.level===1 && transitionRemaining===1600`);
test('Next level loads a new maze', `state.running=true; const before=maze.join(); levelComplete(); update(1600); state.level===2 && !transitionAction && !state.transitioning && maze.join()!==before`);
test('Smash combo and a single extra life', `state.score=7900; enemies.forEach(e=>{e.frozen=true; smash(e);}); state.score===7900+1500 && state.lives===4`);
test('Freeze time floor', `state.level=50; freezeDuration()===cfg.freezeMs*0.4`);
test('Tap buffers a turn then expires', `state.running=true; pressDir('up',0,-1); releaseDir('up'); for(let i=0;i<13;i++) update(16); ball.turnBufferMs===0 && ball.queuedDir.y===0`);
test('Last life opens game over; menu allows a new game', `state.running=true; state.lives=1; startPop(); for(let i=0;i<60;i++) update(16); const ended=state.over; goToMenu(); ended && !state.over && state.lives===3`);
test('Unsupported audio never prevents start', `audioCtx=null; tryStart(); state.running`);
test('Autopilot clears level 1 and nobody walks through walls', `state.running=true; autopilot=true; let ok=true; for(let f=0; f<60*300 && state.level===1; f++){ update(16); if(isWall(ball.col,ball.row)||enemies.some(e=>isWall(e.col,e.row))) ok=false; } autopilot=false; state.level===2 && ok`);

// iOS parity: the web generator must produce exactly the mazes the Swift app does.
const swiftDir = `${__dirname}/../../iYellowBall/iYellowBall`;
if (process.env.PARITY === '1' && existsSync(`${swiftDir}/MazeGenerator.swift`)) {
  const os = require('node:os'); const path = require('node:path'); const fs = require('node:fs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'iyb-parity-'));
  fs.writeFileSync(`${dir}/main.swift`, 'for l in 1...5 { print(MazeGenerator.make(seed: MazeGenerator.seed(forLevel: l)).tiles.map(String.init).joined()) }\nprint(MazeGenerator.make(seed: MazeGenerator.seed(forLevel: 2, base: 20261120)).tiles.map(String.init).joined())\n');
  execFileSync('swiftc', [`${swiftDir}/Config.swift`, `${swiftDir}/MazeGenerator.swift`, `${dir}/main.swift`, '-o', `${dir}/dump`]);
  const swift = execFileSync(`${dir}/dump`, { encoding: 'utf8' }).trim();
  const js = run(`[1,2,3,4,5].map(l=>makeMaze(levelSeed(l)).join('')).concat([makeMaze(levelSeed(2,20261120n)).join('')]).join('\\n')`);
  assert.equal(js, swift, 'iOS/web maze parity');
  console.log('PASS iOS/web maze parity');
  passed++;
}
console.log(`${passed} gameplay checks passed`);
