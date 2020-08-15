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

  await page.goto('https://www.soccer24.com/match/rcPFzuRE/#match-summary', {waitUntil: 'networkidle2'});

  const htFt = await page.$$eval('.detailMS__headerScore', (options) => {
      const result = options.map(option => option.innerText.split("\n"));
      return result;
  });

    const text = await page.$$eval('.detailMS__incidentRow', (options) => {
      const result = options.map(option => option.innerText.split("\n"));
      return result;
  });

  const text2 = await page.$$eval('.detailMS__incidentRow', (options) => {
    const result = options.map(option => option.getAttribute("class"));
    return result;
  });

  const icons = await page.$$eval('.icon-box ', (options) => {
    const result = options.map(option => option.getAttribute("class"));
    return result;
  });


  var data = [];
  let event;
  var index = 0;
  text.forEach(function(item, index) {
      event = {}
      event.time = item[0];
      event.player = item[2].includes('(') ? item[3] : item[2];
      event.type = text2[index].includes('away') ? 'away' : 'home';
      event.action = getAction(icons[index]);
      data.push(event);
  });


  var statistics = [];
  await page.click('#a-match-statistics');
  await page.waitForSelector('#tab-statistics-0-statistic');

  const stats = await page.$$eval('#tab-statistics-0-statistic > .statRow', (options) => {
    const result = options.map(option => option.innerText.split("\n"));
    return result;
  });

  stat = {}

  stats.forEach(function(item, index) {
    stat = {};
    stat.home_val = item[0];
    stat.name = item[1];
    stat.away_val = item[2];
    statistics.push(stat);
  });

  await browser.close();
  // return res.send({data: data, success: true});
})();

