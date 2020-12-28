const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
    });

    const page = await browser.newPage();
 
    await page.setDefaultNavigationTimeout(0);
 
    await page.goto('https://zoomapi.bet9ja.com/zoom/results/premier-zoom?clientId=202&notMobile=1&offset=3600000', {waitUntil: 'networkidle2'});
    await page.waitFor('.zoom-wrap');
    //const teams = [];
    const t = await page.evaluate(() => {

    });

    console.log(t);

    await browser.close();
})();
