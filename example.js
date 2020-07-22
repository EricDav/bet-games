const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://shop.bet9ja.com/Sport/OddsAsync.aspx?IDLingua=2', {waitUntil: 'networkidle2'});

  await page.type('#s_w_PC_cCoupon_txtPrenotatore', 'ZLNBHQ6');
  await page.click('#s_w_PC_cCoupon_lnkLoadPrenotazione');
  await page
  .waitForSelector('#s_w_PC_cCoupon_pnlMexLoadPrenotazione');


  await page.click('#s_w_PC_cCoupon_lnkAvanti');
  await page.waitFor(4000);

  const frame = await page.frames().find(frame => frame.name() === 'iframePrenotatoreSco');

  const optionsResult = await frame.$$eval('.rep > .item', (options) => {
    const result = options.map(option => option.innerText);

    const f = [];

    for(let i = 0; i < result.length; i++) {
        if (i == 0)
            continue;
        
        f.push(result[i].replace(/(\r\n|\n|\r)/gm, "=="));
    }

    return f;
  });

  dates = [];
  fixtures = [];
  outcomes = [];

  optionsResult.forEach(function(item) {
    itemArr = item.split('==');
    dates.push(itemArr[1]);
    fixtures.push(itemArr[2]);
    outcomes.push(itemArr[4]);
  });

  ans = {
      dates: dates,
      fixtures: fixtures,
      outcomes: outcomes
  }

  console.log(ans);


    console.log(optionsResult);

//   await page
//   .waitForSelector('#prenSco');
  await page.pdf({path: 'hn.pdf', format: 'A4'});

  await browser.close();
})();
