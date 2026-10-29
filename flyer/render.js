const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/flyer.html',{waitUntil:'networkidle',timeout:20000}).catch(()=>{});
await p.waitForTimeout(800);
console.log(await p.evaluate(()=>document.fonts.check('16px Inter')));
await p.screenshot({path:__dirname+'/AI-Agents-SDLC-Flyer.png'});await b.close();})();
