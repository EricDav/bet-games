const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        ignoreDefaultArgs: ['--disable-extensions'],
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
    });

    // const bookingNumber = 'PZM66B';

    const page = await browser.newPage();
    const url = 'https://vsagent.bet9ja.com/bet9ja-cashier-league/login/';
     
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url, {waitUntil: 'networkidle2'});

    const username = 'cashier39091-06';
    const password = 'David199';

    // const amount = '100';
    console.log("Here");
    await page.type('#inputUser', username);
    await page.type('#inputPass', password); 

    await page.click('.btn-danger');

    
    let ans;
    count = 0;

    while (!ans &&  count < 5) {
        try {
            console.log(count, 'count.....');
            if (count > 0) {
                await page.goto(url, {waitUntil: 'networkidle2'});

                const username = 'cashier39091-06';
                const password = 'David199';
            
                // const amount = '100';
                console.log("Here");
                await page.type('#inputUser', username);
                await page.type('#inputPass', password); 
            
                await page.click('.btn-danger');
            }
            await page.waitForSelector('#gamebets-wrapper');
            console.log('See waiting...');
            ans = await saveFixtures();
            console.log(ans, 'Answer....');
        } catch (err) {
            ans = undefined; // when there ia an error while loggin in
            count+=1;
        }
    }

    async function saveFixtures() {
        ans = await page.evaluate(() => {
            async function getFixtures() {
                const data = {};
                const fixtures = [];
                const docRow = document.querySelectorAll('.row-matches-bets');
                for(let i = 0; i < 10; i++) {
                    let datum = {};
                    datum.homeTeam = docRow[i].querySelectorAll('.team-name')[0].textContent
                    datum.awayTeam = docRow[i].querySelectorAll('.team-name')[1].textContent
                
                    datum.home = docRow[i].querySelectorAll('.mainMarketsOdds')[0].querySelectorAll('.col-xs')[0].textContent.replace(/ /g, '').replace(/\n/g, '');
                    datum.draw = docRow[i].querySelectorAll('.mainMarketsOdds')[0].querySelectorAll('.col-xs')[1].textContent.replace(/ /g, '').replace(/\n/g, '');
                    datum.away = docRow[i].querySelectorAll('.mainMarketsOdds')[0].querySelectorAll('.col-xs')[2].textContent.replace(/ /g, '').replace(/\n/g, '');
                
                    datum.homeDraw = docRow[i].querySelectorAll('.mainMarketsOdds')[1].querySelectorAll('.col-xs')[0].textContent.replace(/ /g, '').replace(/\n/g, '');
                    datum.homeAway = docRow[i].querySelectorAll('.mainMarketsOdds')[1].querySelectorAll('.col-xs')[1].textContent.replace(/ /g, '').replace(/\n/g, '');
                    datum.awayDraw = docRow[i].querySelectorAll('.mainMarketsOdds')[1].querySelectorAll('.col-xs')[2].textContent.replace(/ /g, '').replace(/\n/g, '');
                
                    datum.GG = docRow[i].querySelectorAll('.mainMarketsOdds')[2].querySelectorAll('.col-xs')[0].textContent.replace(/ /g, '').replace(/\n/g, '');
                    datum.NG = docRow[i].querySelectorAll('.mainMarketsOdds')[2].querySelectorAll('.col-xs')[1].textContent.replace(/ /g, '').replace(/\n/g, '');
                
                    datum.over2 = docRow[i].querySelectorAll('.mainMarketsOdds')[2].querySelectorAll('.col-xs')[0].textContent.replace(/ /g, '').replace(/\n/g, '');
                    datum.under2 = docRow[i].querySelectorAll('.mainMarketsOdds')[2].querySelectorAll('.col-xs')[1].textContent.replace(/ /g, '').replace(/\n/g, '');
                
                    fixtures.push(datum);
                }
            
                data.fixtures = fixtures
                
                $.ajax({
                    type: "POST",
                    url: 'http://localhost:8888/fixtures',
                    data: data,
                    success: function(result) {
                        console.log(result)
                    },
                });

                return data;
            }
            return getFixtures();
        });

        return ans;
  }

    console.log(ans, '======>>>>>>>');

    await browser.close();
})();
