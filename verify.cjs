// Local browser QA (Playwright supplied by the workspace runtime).
const {chromium} = require('playwright');
const fs = require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:"msedge"});
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const checks=[];
 fs.mkdirSync('qa',{recursive:true});
 for(const width of [1440,1024,768,390,320]){
  await page.setViewportSize({width,height:width>800?900:844});
  await page.goto('http://127.0.0.1:4173');
  await page.screenshot({path:`qa/top-${width}.png`,fullPage:true});
  checks.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,hero:document.querySelector('.hero').getBoundingClientRect().height,h1:document.querySelector('h1').getBoundingClientRect().toJSON()})));
 }
 await page.locator('.menu-toggle').click();
 checks.push({menuOpened:await page.locator('#mobile-nav').isVisible(),backgroundInert:await page.locator('main').evaluate(el=>el.inert)});
 await page.keyboard.press('Escape');
 checks.push({menuClosed:!await page.locator('#mobile-nav').isVisible(),focusRestored:await page.locator('.menu-toggle').evaluate(el=>el===document.activeElement)});
 const links=await page.locator('a').evaluateAll(as=>[...new Set(as.map(a=>a.getAttribute('href')).filter(h=>h&&!h.startsWith('#')))]);
 for(const href of links){const response=await page.goto('http://127.0.0.1:4173/'+href);const hash=new URL(page.url()).hash;checks.push({href,status:response?.status() ?? 200,anchor:!hash||await page.locator(hash).count()>0,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)});}
 for(const file of ['index','service','works','company','recruit','contact']){await page.goto(`http://127.0.0.1:4173/${file}.html`);checks.push({page:file,h1:await page.locator('h1').count(),title:await page.title()});}
 fs.writeFileSync('qa/results.json',JSON.stringify({checks,errors},null,2));
 console.log(JSON.stringify({checks,errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});


