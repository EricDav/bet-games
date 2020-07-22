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
                  
                    optionsResult.forEach(function(item) {
                      const itemArr = item.split('==');
                      const dt = Helper.getDateTimeStrInUTC(itemArr[1]);
                     // console.log(dt);
                      dates.push(dt);
                      fixtures.push(itemArr[2]);
                      outcomes.push(itemArr[4]);
                    });
                  
                    const ans = {
                        dates: dates,
                        fixtures: fixtures,
                        outcomes: outcomes
                    }
                  
                    await page.pdf({path: 'hn.pdf', format: 'A4'});
                  
                    await browser.close();
                    res.send({data: ans, success: true});
                    
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
            ' ' + Helper.format(newDate.getUTCHours()) +
            ':' + Helper.format(newDate.getUTCMinutes());
        
        // console.log(utcDate);
        return utcDate;
    }
}

module.exports = Helper;
