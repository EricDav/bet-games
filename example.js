const puppeteer = require('puppeteer');
const sleep = require('sleep');
    (async () => {
        const browser = await puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
              ],
        });
    
    
        const url = 'https://web.bet9ja.com/Sport/Odds?EventID=567161';
    
        const page = await browser.newPage();
     
        await page.setDefaultNavigationTimeout(0);
     
        await page.goto(url, {waitUntil: 'networkidle2'});
        await page.waitFor('#MainContent');
    
        const t = await page.evaluate(() => {
            const fixtures = [];
            const odds = [];
            let odd = {};
    
            document.querySelectorAll('.Event').forEach(function(item) {
                const homeAway = item.textContent.split('-');
                fixtures.push({home: homeAway[0].trim(), away: homeAway[1].trim()});
            });
    
            document.querySelectorAll('.odd').forEach(function(item, index) {
                if (index == 0 || (index != 0 && index%8 == 0)) {
                    if (index != 0 && index%8 == 0) {
                        odds.push(odd);
                        odd = {};
                    }
    
                    odd['1'] = item.textContent.replace('1', '');
                }
    
                if (index%8 == 1) {
                    odd['X'] = item.textContent.replace('X', '')
                }
    
                if (index%8 == 2) {
                    odd['2'] = item.textContent.replace('2', '');
                }
    
                if (index%8 == 3) {
                    odd['1X'] = item.textContent.replace('1X', '');
                }
    
                if (index%8 == 4) {
                    odd['12'] = item.textContent.replace('12', '');
                }
    
                if (index%8 == 5) {
                    odd['X2'] = item.textContent.replace('X2', '')
                }
    
                if (index%8 == 6) {
                    let val = item.textContent.replace('Over', '');
                    val = val.replace('2.5', '');
                    odd['Over 2.5'] = val;
                }
    
                if (index%8 == 7) {
                    let val = item.textContent.replace('Under', '');
                    val = val.replace('2.5', '');
                    odd['Under 2.5'] = val;
                }
    
                if (index == 79) {
                    odds.push(odd);
                }
            });
    
            fixtures.forEach(function(item, index) {
                item.odds = odds[index]
            })
            return fixtures;
        });

        await page.click('.CQ > li:nth-child(2)');
        await page.waitFor(3000);
    
        const g = await page.evaluate(() => {
            const odds = []

            oddsElem = document.querySelectorAll('.odd');
            oddsElem.forEach(function(item, index) {
                if (index%2 == 1) {
                    odds.push({GG: oddsElem[index-1].textContent.substring(2), NG: item.textContent.substring(2)});
                }
            });

    
            return odds;
    
        });

        // await page.click('.CGQ > li:nth-child(2) > span');
        // await page.waitFor(3000);
        // await page.click('.CQ > li:nth-child(1)');
        // await page.waitFor(2000);

        // const v2 = await page.evaluate(() => {
        //     const odds = []

        //     oddsElem = document.querySelectorAll('.odd');
        //     oddsElem.forEach(function(item, index) {
        //         if (index%2 == 1) {
        //             odds.push({Over1: oddsElem[index-1].textContent.substring(2), Under1: item.textContent.substring(2)});
        //         }
        //     });

    
        //     return odds;
    
        // });

      //  console.log(v2);

        t.forEach(function(item, index) {
            item.odds.GG = g[index].GG;
            item.odds.NG = g[index].NG;
        });
    
       // console.log(t);
    })();

