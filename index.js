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

  await page.goto('https://www.soccer24.com/', {waitUntil: 'networkidle2'});

  const text = await page.$$eval('.event__match', (options) => {
      const result = options.map(option => option.innerText.split("\n"));
      return result;
  });

  const text2 = await page.$$eval('.event__match', (options) => {
    const f = options.map(option => option.getAttribute('id'));
    return f;
  });

  var data = [];
  let match;
  var index = 0;
  text.forEach(function(item, index) {
      match = {}
      if (item[0] == 'Finished' || !isNaN(item[0].trim()) || item[0] == 'Half Time') {
          match.time = item[0];
          match.home_name = item[1];
          match.away_name = item[2];
          match.score  = item[3] + item[4] + item[5];
          match.match_id = text2[index].split('_')[2];
          data.push(match);
      } else if (item[0] == 'Cancelled' || item[0] == 'Postponed') {
          match.time = item[0];
          match.home_name = item[1];
          match.away_name = item[2];
          match.match_id = text2[index].split('_')[2];
          data.push(match);
      }
      index +=1;
  });


  await browser.close();


    return res.send({data: data, success: true});
})(); 