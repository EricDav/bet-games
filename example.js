const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        ignoreDefaultArgs: ['--disable-extensions'],
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
          ],
    });

    const urls = {
        spain: 'https://web.bet9ja.com/Sport/Odds?EventID=567119',
        england: 'https://web.bet9ja.com/Sport/Odds?EventID=567161',
        germany: 'https://web.bet9ja.com/Sport/Odds?EventID=567120',
        italy: 'https://web.bet9ja.com/Sport/Odds?EventID=567136',
        france: 'https://web.bet9ja.com/Sport/Odds?EventID=567138'
    };

    const url = 'https://web.bet9ja.com/Sport/Odds?EventID=567161';

    const page = await browser.newPage();
 
    await page.setDefaultNavigationTimeout(0);
 
    await page.goto(url, {waitUntil: 'networkidle2'});
    await page.waitFor('#MainContent');

    const t = await page.evaluate(() => {
        const fixtures = [];
        const odds = [];
        let odd = {};

        const time = document.querySelectorAll('.Time')[0].textContent.trim().substring(0, 5)

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
        return {fixtures: fixtures, time: time};
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

        document.querySelectorAll('.itm2 > span')[0].click();
        document.querySelectorAll('.CQ')[1].children[0].click();


        return odds;

    });


    await page.waitFor(4000);

    const overUnder1 = await page.evaluate(() => {
        const odds = []
        oddsElem = document.querySelectorAll('.odd');
        let over1Str;
        let under1Str;

        oddsElem.forEach(function(item, index) {
            if (index%2 == 1) {
                over1Str = oddsElem[index-1].textContent;
                under1Str = item.textContent;
                odds.push({over1: over1Str.substring(4, over1Str.length - 3), 
                    under1: under1Str.substring(5, under1Str.length - 3)});
            }
        });

        document.querySelectorAll('.CQ')[1].children[1].click();
        return odds;
    });

    await page.waitFor(3000);

    const overUnder3 = await page.evaluate(() => {
        const odds = []
        oddsElem = document.querySelectorAll('.odd');
        let over3Str;
        let under3Str;

        oddsElem.forEach(function(item, index) {
            if (index%2 == 1) {
                over3Str = oddsElem[index-1].textContent;
                under3Str = item.textContent;
                odds.push({over3: over3Str.substring(4, over3Str.length - 3), 
                    under3: under3Str.substring(5, under3Str.length - 3)});
            }
        });
        return odds;
    });

    t.fixtures.forEach(function(item, index) {
        item.odds.GG = g[index].GG;
        item.odds.NG = g[index].NG;
        item.odds.over1 = overUnder1[index].over1;
        item.odds.under1 = overUnder1[index].under1;
        item.odds.over3 = overUnder3[index].over3;
        item.odds.under3 = overUnder3[index].under3;
    });

    await browser.close();
})();

 