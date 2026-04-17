import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Wait to ensure R3F mounts
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    // Attempt to access scene globally if possible, or we just write a quick component modification to dump tree.
    // Let's dispatch a custom event to dump the scene
    window.dispatchEvent(new CustomEvent('dump-scene'));
  });
  
  await new Promise(r => setTimeout(r, 1000));
  await browser.close();
})();
