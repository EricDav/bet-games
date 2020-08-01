const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://shop.bet9ja.com/sport/default.aspx');

  await page.type('#h_w_PC_ctl05_txtCodiceCoupon', 'B93TETSRZPAPP-7704684');
  await page.click('#h_w_PC_ctl05_lnkCheckCoupon');

  const frame = await page.frames().find(frame => frame.name() === 'iframeCC');
  await frame.waitForSelector('#popUp_PC_btnRebet');

  await frame.click('#popUp_PC_btnRebet');

  await page.waitForSelector('#s_w_PC_cCoupon_lnkAvanti');
  await page.click('#s_w_PC_cCoupon_lnkAvanti');

  const frame2 = await page.frames().find(frame => frame.name() === 'iframePrenotatoreSco');
  await frame2.waitForSelector('.rep');

  const bookingCode = await frame2.$$eval('#bookHead > .number', (options) => {
    const result = options.map(option => option.innerText);
    return result;
  });

  bookingCode[0].split(':')[1];

  await page.pdf({path: 'hn.pdf', format: 'A4'});

  // close brower when we are done
  await browser.close();
})();
