const puppeteer = require('puppeteer');
const axios = require('axios');
require('dotenv').config();
const db = require('./database');
const OVER_2_POINT_5 = 'Over 2.5';
const UNDER_2_POINT_5 = 'Under 2.5';

class Baby {
    browser = null;
    constructor() {
        this.setBrowser();
    }

    async closeBrowser() {
        if (this.browser) {
            this.browser.close();
            this.browser = null;
        }
    }

    async setBrowser() {
        const browser = await puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        }); 
        this.browser = browser;
    }

    async getBrowser() {
        if (this.browser) {
            return this.browser
        }
        const browser = await puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });

        this.browser = browser;
        return browser;
    }

    async getUser(userId) {
        try {
            const users = await db.query(
                'SELECT * from users WHERE id = $1 LIMIT $2',
                [userId, 1]
            );

            if (users.length > 0) return users[0];

            return null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    async getBabyUsers() {
        try {
            const users = await db.query(
                'SELECT users.play, users.amount, configs.password, configs.username from users INNER JOIN configs WHERE users.configId = configs.id',
            );
            console.log(users, 'Users..')
            return users;
        } catch (err) {
            console.log(err.message);
            return [];
        }
    }

    async updateBabyUser(userId, data) {
        try {
            const user = await this.getUser(userId);

            if (user) {
                const play = data.play ? data.play : user.play;
                const balance = data.balance ? data.balance : user.balance;
                const amount = data.amount ? data.amount : user.amount;

                await db.query(
                    'UPDATE users SET amount = $1, play = $2, balance = $3 WHERE id = $4',
                    [amount, play, balance, userId]
                );

                return {
                    success: true
                }
            }
        } catch (err) {
            console.log(err);
            return {
                success: false,
                message: err.message
            }
        }
    }

    async fetchBabyFixtures(res) {
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        const url = 'https://vsagent.bet9ja.com/bet9ja-cashier-league/login/';

        await page.setDefaultNavigationTimeout(0);
        await page.goto(url, { waitUntil: 'networkidle2' });

        const username = 'pythagoras1';
        const password = 'Iloveodunayo123';

        await page.type('#inputUser', username);
        await page.type('#inputPass', password);

        await page.click('.btn-danger');
        await page.waitFor(20000);


        let ans;
        let count = 0;

        while (!ans && count < 5) {
            try {
                if (count > 0) {
                    await page.goto(url, { waitUntil: 'networkidle2' });
                    const username = 'pythagoras1';
                    const password = 'Iloveodunayo123';

                    await page.type('#inputUser', username);
                    await page.type('#inputPass', password);

                    await page.click('.btn-danger');
                }
                await page.waitForSelector('#gamebets-wrapper');
                ans = await saveFixtures(); 
            } catch (err) {
                ans = undefined; // when there ia an error while loggin in
                count += 1;
            }
        }

        async function saveFixtures(res) {
            ans = await page.evaluate(() => {
                async function getFixtures() {
                    const data = {};
                    const fixtures = [];
                    const docRow = document.querySelectorAll('.row-matches-bets');
                    for (let i = 0; i < 10; i++) {
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

                        datum.over2 = docRow[i].querySelectorAll('.mainMarketsOdds')[3].querySelectorAll('.col-xs')[0].textContent.replace(/ /g, '').replace(/\n/g, '');
                        datum.under2 = docRow[i].querySelectorAll('.mainMarketsOdds')[3].querySelectorAll('.col-xs')[1].textContent.replace(/ /g, '').replace(/\n/g, '');

                        fixtures.push(datum);
                    }

                    data.fixtures = fixtures

                    return data;
                }
                return getFixtures();
            });

            return ans;
        }

        const env = process.env;
        const [users, predictions] = await Promise.all([
            this.getBabyUsers(),
            this.getPredictions(ans.fixtures)
        ]);

        for await (const user of users) {
            await Promise.all(predictions.map(pre => this.playBaby(ans.fixtures, user, [pre], browser)));
        }

        await this.closeBrowser();
        console.log('Cron details log start for fixtures ==>>>>>>>>>>');
        try {
            const result = await axios({
                method: 'post',
                url: env.BASE_URL + '/fixtures',
                data: ans
            });
            console.log(result.data)
        } catch(err) {
            console.log(err.message)
        }
        console.log('Cron details log end for fixtures ==>>>>>>>>>>');
        if (res) {
            res.send({ data: ans, success: true });
        }
    }

    async getPredictions(fixtures) {
        try {
            const query = `SELECT * FROM predictions where average_percentage_win > 0.2 ORDER BY percentage_win DESC`

            const predictions = await db.query(query);
            const predicts = [];
            for await (const fix of fixtures) {
                predictions.forEach((p) => {
                    if (p.home === fix.homeTeam && p.away === fix.awayTeam) {
                        let preType = p.type;
                        if (preType === OVER_2_POINT_5) {
                            preType = 'over2'
                        } else if (preType === UNDER_2_POINT_5) {
                            preType = 'under2';
                        }
                        predicts.push({
                            homeTeam: p.home,
                            awayTeam: p.away,
                            prediction: preType 
                        })
                    }
                });
            }
            return predicts;
        } catch(err) {
            console.log(err.message)
        }
    }

    async playBaby(fixtures, user, predicts, count = 0, browser) {
        if (!user.play) {
            console.log('Skipping for this user ' + user.name + ' Playing turned off');
            return;
        }

        console.log('<<<=======Begining of Playing baby  =======>>>', user.name);
        // Inputs ----
        const price = user.amount;
        // Inputs end ---

        const page = await browser.newPage();
        const url = 'https://vsagent.bet9ja.com/bet9ja-cashier-league/login/';

        await page.setDefaultNavigationTimeout(0);
        await page.goto(url, { waitUntil: 'networkidle2' });

        try {
            await page.type('#inputUser', user.username);
            await page.type('#inputPass', user.password);

            await page.click('.btn-danger');
            await page.waitForSelector('#gamebets-wrapper');
        } catch (e) {
            console.log(e.message);
            // retry 3 times 

            if (count < 3) {
                const val = await this.playBaby(fixtures, user, predicts, count + 1, browser);
                return val;
            }

            return {
                success: false,
                message: 'An error occured logging in'
            }
        }

        let ans;
        const ruleToPlay = [];
        const rules = {
            1: {
                section: 0,
                item: 0
            },
            'X': {
                section: 0,
                item: 1,
            },
            2: {
                section: 0,
                item: 2,
            },
            '1X': {
                section: 1,
                item: 0,
            },
            '12': {
                section: 1,
                item: 1,
            },
            'X2': {
                section: 1,
                item: 2,
            },
            'GG': {
                section: 2,
                item: 0,
            },
            'NG': {
                section: 2,
                item: 1,
            },
            'over2': {
                section: 3,
                item: 0,
            },
            'under2': {
                section: 3,
                item: 1,
            }
        }

        predicts.forEach((pred) => {
            for (let i = 0; i < fixtures.length; i++) {
                let fix = fixtures[i];
                if (pred.homeTeam == fix.homeTeam && pred.awayTeam == fix.awayTeam) {
                    const r = rules[pred.prediction];
                    ruleToPlay.push({
                        row: i,
                        section: r.section,
                        item: r.item
                    })
                }
            }
        });


        try {
            await page.exposeFunction('play', (e) => {
                return ruleToPlay;
            });

            await page.exposeFunction('getPrice', (e) => {
                return price;
            });

            ans = await page.evaluate(async () => {
                const main = await window.play();
                const price = await window.getPrice();
                for (let i = 0; i < main.length; i++) {
                    obj = main[i];
                    document.querySelectorAll('.row-matches-bets')[obj.row].querySelectorAll('.mainMarketsOdds')[obj.section].querySelectorAll('.col-xs')[obj.item].querySelector('.btn-odd').click();
                }

                if (price == 200) {
                    document.querySelectorAll('.chipStake-container')[1].querySelector('.chipStake').click();
                } else if (price == 500) {
                    document.querySelectorAll('.chipStake-container')[3].querySelector('.chipStake').click();
                } else if (price == 1000) {
                    document.querySelectorAll('.chipStake-container')[3].querySelector('.chipStake').click();
                    document.querySelectorAll('.chipStake-container')[3].querySelector('.chipStake').click();
                } else {
                    // default to 200
                    document.querySelectorAll('.chipStake-container')[1].querySelector('.chipStake').click();
                }

                return document.querySelectorAll('.event-countdown-text')[0].textContent;
            });
        } catch (e) {
            console.log(e.message);
            return {
                success: false,
                message: 'Error occured in evaluation function'
            }
        }

        try {
            await page.waitFor(3000);
            await page.click('#button-placebet');

            await page.waitFor(8000);
        } catch (e) {
            console.log(e);
            return {
                success: false,
                message: 'Could not click on the play button'
            }
        }

        // const balanceBefore = ans.replace(/\D/g, '');
        // const balance = await this.confirmPlay(user.username, user.password, user.amount, ans.replace(/\D/g, ''));

        // if (balance && (balanceBefore - balance) == user.amount) {
        //     await this.updateBabyUser(user.id, {balance});

        //     const data = {
        //         predictions: JSON.stringify(predicts),
        //         userId: user.id
        //     }

        //     let result;
        //     const env = process.env;
        //     try {
        //         result = await axios({
        //             method: 'post',
        //             url: env.BASE_URL + '/games',
        //             data
        //         });
        //     } catch (e) {
        //         console.log(e)
        //         await browser.close();
        //         return {
        //             success: false,
        //             message: 'Server error from axios'
        //         }
        //     }

        //     console.log(result.data, 'Result');

        //     await browser.close();
        //     if (result.success) {
        //         return {
        //             success: true,
        //             message: 'Game played and data inserted'
        //         }
        //     }

        //     return {
        //         success: true,
        //         message: 'Game played, but data not inserted'
        //     }
        // } else {
        //     return {
        //         success: false,
        //         message: 'Game not played'
        //     }
        // }
    }

    async fetchBabyResult(res) {
        console.log('Result.........')
        const browser = await puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        }); 

        // const bookingNumber = 'PZM66B';
        const page = await browser.newPage();

        await page.setDefaultNavigationTimeout(0);

        await page.goto('https://vsagent-ab.bet9ja.com/viewer-1.94.99/themes/?t=bet9ja_league_sat&timeToShowWinnersLL=20&layout=_base&monitor=0&vMode=livescore&_tickerLastResults=true&serverHost=vsagent-proxy-viewer.bet9ja.com&display=0&liveViewerId=0&vMode=livescore', { waitUntil: 'networkidle2' });
        await page.waitFor(20000);
        let data = 'Fuck u';

        const defaults = ['Fuck u', 'Live scores running...', 'Week number not available', 'No table'];
        let count = 0;
        while (defaults.includes(data) && count < 84) {
            count += 1;
            await page.waitFor(5000);
            data = await page.evaluate(() => {
                // return 'Data';
                function isNumeric(str) {
                    if (typeof str != "string") return false // we only process strings!  
                    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
                        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
                }

                function getResultData() {
                    const numWeeksDoc = document.querySelector('#header-right-area-left-hour-week');
                    const resultRow = document.querySelectorAll('.match-cell');
                    if (numWeeksDoc && numWeeksDoc.children[1]) {
                        if (document.querySelectorAll('.pijamaElement-league-table').length > 0) {
                            setTable();
                        }
                        if (localStorage.getItem('__weekNum') === numWeeksDoc.children[1].textContent) {
                            return 'Week number not available';
                        }

                    }

                    if (numWeeksDoc && !numWeeksDoc.children[1]) {
                        return 'Live scores running...';
                        // return defaultVal;
                    }

                    const table = JSON.parse(localStorage.getItem('__table'))
                    if (!resultRow || resultRow.length == 0) {
                        return 'No table'
                    }
                    const bigResult = {
                        weekNum: localStorage.getItem('numWeeksDoc'),
                        leagueNum: localStorage.getItem('leagueNum'),
                    }
                    const results = [];

                    for (let i = 0; i < 10; i++) {
                        let datum = {}
                        let tableData;

                        let rs = resultRow[i].textContent.replace(/\n/g, '').replace(/ /g, '');
                        datum.home = rs.substring(0, 3);
                        tableData = table.find(element => element.team == datum.home);

                        datum.homeForm = tableData.form;
                        datum.homePos = tableData.pos;
                        datum.homePoint = tableData.point;
                        datum.homeScore = rs[3];
                        datum.awayScore = rs[5];
                        datum.away = rs.substring(6, 9);
                        tableData = table.find(element => element.team == datum.away);
                        datum.awayForm = tableData.form;
                        datum.awayPos = tableData.pos;
                        datum.awayPoint = tableData.point;
                        results.push(datum);
                    }
                    bigResult.results = results;

                    bigResult.weekNum = document.querySelector('.event-countdown').textContent.trim().split(' ')[2];
                    //   $.ajax({
                    //       type: "POST",
                    //       url: 'https://baby.correctionweb.com/results',
                    //       data: bigResult,
                    //       success: function(bigResult) {
                    //           localStorage.setItem('__weekNum', localStorage.getItem('numWeeksDoc'));
                    //           console.log(bigResult);
                    //       },
                    //     });

                    return bigResult;
                }

                function setTable() {
                    const leagueNum = document.querySelector('#header-right-area-left-hour-league').children[1].textContent;
                    const numWeeksDoc = document.querySelector('#header-right-area-left-hour-week').children[1].textContent;
                    const table = [];
                    const tableRow = document.querySelectorAll('.pijamaElement-league-table');
                    for (let j = 0; j < 20; j++) {
                        let d = {};
                        const strLen = tableRow[j].textContent.replace(/\n/g, '').replace(/ /g, '').length
                        let str;
                        if (j < 9) {
                            str = tableRow[j].textContent.replace(/\n/g, '').replace(/ /g, '').substring(2, strLen);
                        } else {
                            str = tableRow[j].textContent.replace(/\n/g, '').replace(/ /g, '').substring(3, strLen);
                        }

                        d.pos = j + 1;
                        d.team = str.substring(0, 3);
                        str = str.replace(d.team, '');

                        let point = '';
                        let form = '';
                        for (let counter = 0; counter < str.length; counter++) {
                            if (isNumeric(str[counter])) {
                                point += str[counter];
                            } else {
                                form += str[counter];
                            }
                        }
                        d.point = point;
                        d.form = form;

                        table.push(d);
                    }
                    localStorage.setItem('__table', JSON.stringify(table));
                    localStorage.setItem('leagueNum', leagueNum);
                    localStorage.setItem('numWeeksDoc', numWeeksDoc);
                }
                return getResultData();
            })
        }

        await browser.close();
        const env = process.env;
        try {
            await axios({
                method: 'post',
                url: env.BASE_URL + '/results',
                data
            });
            return {
                data,
                success: true
            }
        }  catch(err) {
            return { data: err.message, success: false }
        }
    }
}

module.exports = Baby;
