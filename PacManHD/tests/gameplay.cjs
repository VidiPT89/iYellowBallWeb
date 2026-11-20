// Run the actual game engine without a browser. Rendering/audio are inert adapters.
const { readFileSync, existsSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const noop = () => {};
const context2d = new Proxy({}, { get: () => noop, set: () => true });
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    width: 560, height: 560, style: {}, dataset: {}, textContent: '', innerHTML: '',
    classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
    getContext: () => context2d, addEventListener: noop, setAttribute: noop,
    focus: noop, appendChild: noop, setPointerCapture: noop,
  });
  return elements.get(id);
}
const sandbox = {
  console: { log: noop }, Math, performance: { now: () => 0 },
  navigator: { language: 'pt' }, localStorage: { getItem: () => null, setItem: noop },
  document: { getElementById: element, createElement: () => element(Symbol()), querySelectorAll: () => [], addEventListener: noop, documentElement: {}, body: element("body") },
  window: { addEventListener: noop },
  requestAnimationFrame: noop, setTimeout: noop, clearTimeout: noop,
};
vm.createContext(sandbox);
vm.runInContext(readFileSync(`${__dirname}/../script.js`, 'utf8'), sandbox);
const run = code => vm.runInContext(code, sandbox);
let passed = 0;
function test(name, code) { run('newGame("normal"); state.soundOn = false; introOpen = false;'); assert.equal(run('{'+code+'}'), true, name); console.log(`PASS ${name}`); passed++; }
test('Immediate reversal between tile centers', `pacman.x = 287; pacman.dir = {x:1,y:0}; pressDir('left',-1,0); pacman.dir.x === -1 && pacman.x === 287`);
test('Frightened mode suspends phase clock', `state.phaseTimer = 6990; triggerFrightened(); updatePhase(40); state.phaseIndex === 0 && state.phaseTimer === 6990`);
test('Phase resumes after frightened mode', `state.phaseTimer = 6990; state.frightenedTimer = 0; updatePhase(40); state.phaseIndex === 1`);
test('New game cancels death and pending level transition', `state.dying = true; levelComplete(); newGame(); update(2000); !state.dying && state.level === 1 && state.lives === 3 && !transitionAction`);
test('Pause freezes level transition', `state.running = true; levelComplete(); pauseGame(); update(2000); state.level === 1 && transitionRemaining === 1600`);
test('Resume finishes level transition once', `state.running = true; levelComplete(); pauseGame(); update(2000); resumeGame(); update(1600); state.level === 2 && !transitionAction && !state.transitioning`);
test('Respawn resets phase schedule', `state.phaseIndex=4; state.phaseTimer=3000; respawnPositions(); state.phaseIndex === 0 && state.phaseTimer === 0`);
test('Tunnel collision wraps across seam', `pacman.x=0; pacman.y=260; ghosts=ghosts.slice(0,1); ghosts[0].x=559; ghosts[0].y=260; ghosts[0].state='chase'; checkGhostCollisions(); state.dying`);
test('Tunnel slows live ghosts but not eyes', `const g=ghosts[0]; g.row=13; g.x=0; g.state='chase'; const slow=ghostSpeedFor(g); g.x=200; slow < ghostSpeedFor(g)`);
test('Ghost leaving house respects active power pellet', `const g=ghosts[0]; g.state='leaving'; g.x=260; g.y=200; triggerFrightened(); isFrightened(g) && (updateGhost(g,16), g.state === 'frightened')`);
test('Revived ghost is not frightened again by the same pellet', `const g=ghosts[0]; g.state='chase'; triggerFrightened(); eatGhost(g); g.state='leaving'; g.x=260; g.y=200; updateGhost(g,16); !isFrightened(g) && g.state !== 'frightened'`);
test('Returning eyes glide into the house without teleporting', `const g=ghosts[1]; g.state='eaten'; g.col=13;g.row=12;g.x=260;g.y=240; g.dir={x:0,y:1}; updateGhost(g,1); const jump=Math.abs(g.x-260); for(let i=0;i<40;i++)updateGhost(g,16); jump<=2 && g.state==='house' && g.x===g.home.col*CELL`);
test('Frightened time shortens with level but keeps a floor', `const l1=frightenedDuration(); state.level=50; const l50=frightenedDuration(); l1===cfg.frightenedMs && l50===Math.round(cfg.frightenedMs*0.4)`);
test('Every pellet is reachable without entering ghost house', `const seen=new Set(); const queue=[[PAC_HOME.col,PAC_HOME.row]]; while(queue.length) {const [c,r]=queue.shift();const key=idx(c,r);if(seen.has(key))continue;seen.add(key);for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){const nc=(c+dx+COLS)%COLS,nr=r+dy;if(nr>=0&&nr<ROWS&&!pacBlocked(nc,nr)&&!seen.has(idx(nc,nr)))queue.push([nc,nr]);}} MAZE.every((v,i)=>v!==0&&v!==3||seen.has(i))`);

test('Eaten ghost can return from every walkable tile', `let failures=[]; for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(pacBlocked(c,r))continue; const g=buildGhosts()[0]; g.state='eaten'; g.col=c;g.row=r;g.x=c*CELL;g.y=r*CELL; for(let i=0;i<3000 && g.state==='eaten';i++)updateGhost(g,16); if(g.state==='eaten')failures.push([c,r]);} if(failures.length) console.log(failures); failures.length===0`);
test('Tap buffers a turn then consumes it at a junction', `pacman.x=230;pacman.y=100;pacman.dir={x:1,y:0};pressDir('up',0,-1);releaseDir('up');stepEntity(pacman,0.13,100,pickPacDir); pacman.dir.y===-1 && pacman.queuedDir.y===0`);
test('Unusable tap expires instead of steering forever', `state.running=true;pressDir('up',0,-1);releaseDir('up');for(let i=0;i<13;i++)update(16);pacman.turnBufferMs===0 && pacman.queuedDir.y===0`);
test('Frightened ghost combo and extra life awarded once', `state.score=9900;for(const g of ghosts){g.state='frightened';eatGhost(g);} checkExtraLife(); state.score===12900&&state.lives===4`);
test('Death removes one life and respawns', `state.running=true;startDeathSequence();for(let i=0;i<100;i++)update(16);state.lives===2&&!state.dying&&!state.transitioning&&state.invulnerableTimer>0`);
test('Last life opens game over; menu allows a new game', `state.running=true;state.lives=1;startDeathSequence();for(let i=0;i<60;i++)update(16);const ended=state.over;goToMenu();ended&&!state.over&&state.lives===3`);
test('Unsupported audio never prevents start', `audioCtx=null;tryStart();state.running`);
test('Long ghost simulation never enters a wall', `let valid=true;for(let i=0;i<10000;i++){for(const g of ghosts){updateGhost(g,16);if(rawTile(g.col,g.row)===1)valid=false;}}valid`);
// Check native/web maze parity to keep both platforms on the same game board.
const nativePath = `${__dirname}/../../iPacManHD/iPacManHD/Maze.swift`;
if (existsSync(nativePath)) {
  const swift = readFileSync(nativePath, 'utf8');
  const nativeMaze = swift.match(/static let maze: \[Int\] = \[([\s\S]*?)\n    \]/)[1].match(/\d+/g).map(Number);
  assert.deepEqual(JSON.parse(run('JSON.stringify(MAZE)')), nativeMaze, 'Apple/web maze parity');
  console.log('PASS Apple/web maze parity');
}
console.log(`${passed} gameplay regressions passed`);
