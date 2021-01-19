const puppeteer = require('puppeteer');
    (async () => {
        const browser = await puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
              ],
        });

        const bookingNumber = 'PZM66B';

        const page = await browser.newPage();
        const url = 'https://web.bet9ja.com/Sport/Default.aspx';
         
        await page.setDefaultNavigationTimeout(0);
        await page.goto(url, {waitUntil: 'networkidle2'});

        const username = 'pythagoras1';
        const password = 'Iloveodunayo123';
        const amount = '100';

        await page.type('#h_w_cLogin_ctrlLogin_Username', username);
        await page.type('#h_w_cLogin_ctrlLogin_Password', password); 
        await page.click('#h_w_cLogin_ctrlLogin_lnkBtnLogin');
        await page.waitForSelector('#hl_w_PC_cCoupon_txtPrenotatore');
        await page.type('#hl_w_PC_cCoupon_txtPrenotatore', bookingNumber);
        await page.click('#hl_w_PC_cCoupon_lnkLoadPrenotazione');
        await page.waitFor(3000);

        await page.type('#hl_w_PC_cCoupon_txtImporto', amount);
        await page.click('#hl_w_PC_cCoupon_lnkAvanti');
        await page.pdf({path: 'output.pdf', format: 'A4'}); //

        await page.waitForSelector('#hl_w_PC_cCoupon_lnkConferma');
        await page.click('#hl_w_PC_cCoupon_lnkConferma');

        await page.waitForSelector('#hl_w_PC_cCoupon_lblMsgScoAccettata');
        const ans = await page.evaluate(() => {
            return document.querySelector('#hl_w_PC_cCoupon_lblMsgScoAccettata').textContent;
        });

        await browser.close();

        
    })();


