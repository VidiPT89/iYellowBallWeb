// Optional integration suite: PLAYWRIGHT_MODULE=/path/to/playwright node tests/browser.cjs
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    for (const viewport of [{width:1280,height:1000},{width:390,height:844},{width:844,height:390}]) {
      const page = await browser.newPage({viewport});
      const errors=[]; page.on('pageerror',e=>errors.push(e.message));
      await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
      await page.locator('#intro-play').click();
      await page.locator('#start-overlay').click();
      await page.keyboard.down('ArrowLeft');
      await page.waitForTimeout(1500);
      await page.keyboard.up('ArrowLeft');
      assert(await page.evaluate(()=>state.score>0),'Movement collects dots');
      await page.keyboard.press('p');
      assert(await page.evaluate(()=>state.paused),'Keyboard pause');
      const before=await page.evaluate(()=>pacman.x);
      await page.waitForTimeout(250);
      assert.equal(await page.evaluate(()=>pacman.x),before,'Paused position');
      await page.locator('#btn-menu').click();
      assert(await page.evaluate(()=>!state.running&&state.score===0),'Menu resets');
      await page.locator('[data-diff="hard"]').click();
      assert(await page.evaluate(()=>state.lives===2),'Difficulty applies');
      await page.locator('#lang-toggle').click();
      assert(['pt-PT','en'].includes(await page.locator('html').getAttribute('lang')));
      await page.evaluate(()=>{state.score=12345;endGame();});
      await page.locator('#modal-close').click();
      assert(await page.evaluate(()=>!state.over&&!state.running),'Close returns to menu');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
      await page.locator('#start-overlay').click();
      await page.keyboard.press('p');
      await page.waitForTimeout(350);
      assert(await page.evaluate(()=>document.querySelector('#game-canvas').getBoundingClientRect().bottom <= innerHeight), 'Board visible without scrolling');
      await page.screenshot({path:path.join(os.tmpdir(),`pacman-web-${viewport.width}.png`),fullPage:true});
      await page.locator('#btn-resume').click();
      await page.waitForTimeout(350);
      await page.screenshot({path:path.join(os.tmpdir(),`pacman-web-play-${viewport.width}.png`),fullPage:true});
      assert.deepEqual(errors,[],'No runtime errors');
      console.log(`PASS browser ${viewport.width}x${viewport.height}: start, movement, pause, menu, difficulty, language, game over, layout`);
      await page.close();
    }
    {
      const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
      const page=await context.newPage();
      const errors=[]; page.on('pageerror',e=>errors.push(e.message));
      await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
      await page.locator('#intro-play').click();
      await page.locator('#start-overlay').click();
      const box=await page.locator('#game-canvas').boundingBox();
      const cdp=await context.newCDPSession(page);
      const at=(dx)=>[{x:box.x+box.width/2+dx,y:box.y+box.height/2}];
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:at(0)});
      for(const dx of [-10,-20,-30,-40]) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:at(dx)});
      await page.waitForTimeout(900);
      assert(await page.evaluate(()=>pacman.lastDir.x===-1&&pacman.x<PAC_HOME.col*CELL),'Swipe steers Pac-Man');
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      assert(await page.evaluate(()=>heldDirs.length===0),'Lifting the finger releases the swipe');
      await page.evaluate(()=>{state.score=500;endGame();});
      const before=await page.locator('#modal-title').textContent();
      await page.evaluate(()=>setLang(state.lang==='pt'?'en':'pt'));
      assert.notEqual(await page.locator('#modal-title').textContent(),before,'Game over modal follows language');
      assert.equal(await page.locator('#btn-up').getAttribute('aria-label'),await page.evaluate(()=>t('upAria')),'Accessible labels translated');
      assert.deepEqual(errors,[],'No runtime errors');
      console.log('PASS browser touch: swipe steering, translated game over and labels');
      await context.close();
    }
    const page=await browser.newPage();
    await page.addInitScript(()=>{
      Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage disabled');}});
      window.AudioContext=undefined;window.webkitAudioContext=undefined;
    });
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
    await page.locator('#intro-play').click();await page.locator('#start-overlay').click();
    await page.evaluate(()=>{state.score=10;endGame();});
    assert(await page.evaluate(()=>state.over),'Playable without storage/audio');
    console.log('PASS browser without storage or audio');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
