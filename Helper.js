const puppeteer = require('puppeteer');

 class Helper {
    static format(d) {
        d = d.toString();
        return d.length == 2 ? d : '0' + d;
    }

    static getGameFromBet9jaBookingCode(bookingCode, res) {
            (async () => {
                const browser = await puppeteer.launch({
                    ignoreDefaultArgs: ['--disable-extensions'],
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                      ],
                });
                const page = await browser.newPage();
                await page.goto('https://shop.bet9ja.com/Sport/OddsAsync.aspx?IDLingua=2', {waitUntil: 'networkidle2'});
              
                await page.type('#s_w_PC_cCoupon_txtPrenotatore', bookingCode);
                await page.click('#s_w_PC_cCoupon_lnkLoadPrenotazione');
                await page
                .waitForSelector('#s_w_PC_cCoupon_pnlMexLoadPrenotazione');
                
                try {
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
                      console.log(itemArr[1]);
                      const dt = Helper.getDateTimeStrInUTC(itemArr[1]);
                      console.log(dt);
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
                  
                   // await page.pdf({path: 'hn.pdf', format: 'A4'});
                  
                    await browser.close();
                    res.send({data: ans, original: originalDate, success: true});
                    
                } catch(e) {
                    const val = page.$('#s_w_PC_cCoupon_pnlMexLoadPrenotazione');

                    if (val) {
                        return res.send({success: false, message: 'game has ended'});
                    }

                }
              })();
    }
    static getDateTimeStrInUTC(date) {
        let dateTimeArr = date.split(' ');

        const dateArr = dateTimeArr[0].split('/');
        const timeArr = dateTimeArr[1].split(':');

        // console.log(dateArr, timeArr);

        const newDate = new Date(dateArr[2], dateArr[1], dateArr[0], timeArr[0], timeArr[1]);

       // console.log(newDate);
        var utcDate = (newDate.getUTCFullYear()).toString() +
            '-' + Helper.format(newDate.getUTCMonth()) +
            '-' + Helper.format(newDate.getUTCDate()) +
            ' ' + Helper.format(newDate.getHours() - 1) +
            ':' + Helper.format(newDate.getUTCMinutes());
        
        // console.log(utcDate);
        return utcDate;
    }

    static getLiveScoresFromSoccer24(res) {
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
        
            var data = [];
            let match;
            text.forEach(function(item, index) {
                match = {}
                if (item[0] == 'Finished' || !isNaN(item[0].trim()) || item[0] == 'Half Time') {
                    match.time = item[0];
                    match.home_name = item[1];
                    match.away_name = item[2];
                    match.score  = item[3] + item[4] + item[5];
                    data.push(match);
                } else if (item[0] == 'Cancelled' || item[0] == 'Postponed') {
                    match.time = item[0];
                    match.home_name = item[1];
                    match.away_name = item[2];
                    data.push(match);
                }
            });
        
            await browser.close();
        
          
              return res.send({data: data, success: true});
          })();          
    }

    static getBookingCodeFromBetslip(betslip, res) {
        (async () => {
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });

            const page = await browser.newPage();
          
            await page.goto('https://shop.bet9ja.com/sport/default.aspx');
          
            await page.type('#h_w_PC_ctl05_txtCodiceCoupon', betslip);

            try {
                await page.click('#h_w_PC_ctl05_lnkCheckCoupon');
            } catch(e) {
                return res.send({success: false, message: 'It seems betslip is not valid'});
            }
            
          
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
          
            await page.pdf({path: 'hn.pdf', format: 'A4'});
          
            // close brower when we are done
            await browser.close();

            return res.send({success: true, bookingCode: bookingCode[0].split(':')[1]});
          })();
    }
}

module.exports = Helper;
