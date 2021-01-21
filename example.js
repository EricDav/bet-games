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
    const url = 'https://web.bet9ja.com/Sport/Odds?EventID=567161';
     
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url, {waitUntil: 'networkidle2'});

   const data = [{match: 'Z.Arsenal - Z.Brighton', index: 0, outcome: '1'}, {match: 'Z.Arsenal - Z.Brighton', index: 3, outcome: 'Over 1.5'}, {match: 'Z.Chelsea - Z.Aston Villa', index: 1, outcome: 'GG'}];

    const main = [];
    const gg = [];
    const over1 = [];

    data.forEach(function(item) {
        if (item.outcome == 'GG' || item.outcome == 'NG') {
            gg.push(item);
        } else if (item.outcome == 'Over 1.5') {
            over1.push(item);
        } else {
            main.push(item)
        }
    });

    const dataStr = JSON.stringify(data);

    await page.exposeFunction('play', (e) => {
         return main;
    });

    await page.exposeFunction('playG', (e) => {
        return gg;
    });

    await page.exposeFunction('playOver1', (e) => {
        return over1;
    });

    if (main.length > 0) {
        await page.evaluate(async () => {
            const f = {
                1: 0,
                // '1': 0,
                'X':1,
                2:2,
                // '2': 2,
                '1X':3,
                '12':4,
                'X2':5,
                'Over 2.5':6,
                'Under 2.5': 7
            }

            const elements = document.querySelectorAll('.odd');
            const main = await window.play();
            for (let i = 0; i < main.length; i++) {
                obj = main[i];
              //  setTimeout(function() {
                elements[(obj.index*8) + f[obj.outcome]].click();
              //  }, 3000);
            }

            return main.length;
        });

       // console.log(r);
    }

    /**
     * Section for playing Goal Goal
     */
    if (gg.length > 0) {
        await page.click('.CQ > li:nth-child(2)');
        await page.waitFor(3000);

        await page.evaluate(async () => {
            const elements = document.querySelectorAll('.odd');
            const g = {
                'GG': 0,
                'NG': 1,
            };
            let obj;
            const gg = await window.playG();
            for (let i = 0; i < gg.length; i++) {
                obj = gg[i];
                elements[(obj.index*2) + g[obj.outcome]].click();
            }
        });
    }

    if (over1.length > 0) {
        await page.evaluate(() => {
            document.querySelectorAll('.itm2 > span')[0].click();
            document.querySelectorAll('.CQ')[1].children[0].click();
        });

        await page.waitFor(3000);

        await page.evaluate(async () => {
            const elements = document.querySelectorAll('.odd');
            const over1 = {
                'Over 1.5': 0,
            };
            let obj;
            const gg = await window.playOver1();
            for (let i = 0; i < gg.length; i++) {
                obj = gg[i];
                elements[(obj.index*2) + over1[obj.outcome]].click();
            }
        });
    }


   await page.waitFor(3000);

   await page.click('#s_w_PC_cCoupon_lnkAvanti');
   // await page.waitFor(4000);

   const frame = await page.frames().find(frame => frame.name() === 'iframePrenotatoreSco');
   await frame.waitForSelector('.rep');

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
 
   const dates = [];
   const fixtures = [];
   const outcomes = [];
   const originalDate = [];
 
   optionsResult.forEach(function(item) {
     const itemArr = item.split('==');
     const dt = itemArr[1];
     dates.push(dt);
     originalDate.push(itemArr[1]);
     fixtures.push(itemArr[2]);
     outcomes.push(itemArr[4]);
   });
 
   const ans = {
       dates: dates,
       fixtures: fixtures,
       outcomes: outcomes
   }

    let bookingCode = await frame.$$eval('#bookHead > .number', (options) => {
    const result = options.map(option => option.innerText);
    return result;
  });

    bookingCode = bookingCode[0].split(':')[1];
    ans.bookingCode = bookingCode;
    await browser.close();

    console.log(ans);
})();

 