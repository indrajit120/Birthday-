import puppeteer from 'puppeteer';

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Check activeScenes and state if possible, but let's just click through
    // Or we can evaluate
    const appState = await page.evaluate(() => {
       return window.__REACT_DEVTOOLS_GLOBAL_HOOK__ ? "React DevTools present" : "No React DevTools";
    });
    console.log(appState);
    
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
