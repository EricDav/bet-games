const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://shop.bet9ja.com/Sport/OddsAsync.aspx?IDLingua=2');

  // console.log(page);

  // example: get innerHTML of an element s_w_PC_cCoupon_txtPrenotatore
  const someContent = await page.$eval('#s_w_PC_cCoupon_txtPrenotatore', el => el.innerHTML);

  console.log(someContent);

  // Use Promise.all to wait for two actions (navigation and click)
  await Promise.all([
    // page.waitForNavigation(), // wait for navigation to happen
    page.type('#s_w_PC_cCoupon_txtPrenotatore', 'ZLQ5THB'),
    page.click('#s_w_PC_cCoupon_lnkLoadPrenotazione'), // click link to cause navigation
  ]);

  // another example, this time using the evaluate function to return innerText of body
  const moreContent = await page.evaluate(() => document.body.innerText);
  console.log(moreContent);

  // click another button
  // await page.click('#button');

  // close brower when we are done
  await browser.close();
})();
