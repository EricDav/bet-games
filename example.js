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


function initFixtures() {
    setInterval(getFixtures, 60000);
}
function getFixtures() {
    const data = {};
    const fixtures = [];
    const docRow = document.querySelectorAll('.row-matches-bets');
    for(let i = 0; i < 10; i++) {
        let datum = {};
        datum.homeTeam = docRow[i].querySelectorAll('.team-name')[0].textContent
        datum.awayTeam = docRow[i].querySelectorAll('.team-name')[1].textContent
    
        datum.home = docRow[i].querySelectorAll('.mainMarketsOdds')[0].querySelectorAll('.col-xs')[0].textContent.replaceAll(' ', '').replaceAll('\n', '');
        datum.draw = docRow[i].querySelectorAll('.mainMarketsOdds')[0].querySelectorAll('.col-xs')[1].textContent.replaceAll(' ', '').replaceAll('\n', '');
        datum.away = docRow[i].querySelectorAll('.mainMarketsOdds')[0].querySelectorAll('.col-xs')[2].textContent.replaceAll(' ', '').replaceAll('\n', '');
    
        datum.homeDraw = docRow[i].querySelectorAll('.mainMarketsOdds')[1].querySelectorAll('.col-xs')[0].textContent.replaceAll(' ', '').replaceAll('\n', '');
        datum.homeAway = docRow[i].querySelectorAll('.mainMarketsOdds')[1].querySelectorAll('.col-xs')[1].textContent.replaceAll(' ', '').replaceAll('\n', '');
        datum.awayDraw = docRow[i].querySelectorAll('.mainMarketsOdds')[1].querySelectorAll('.col-xs')[2].textContent.replaceAll(' ', '').replaceAll('\n', '');
    
        datum.GG = docRow[i].querySelectorAll('.mainMarketsOdds')[2].querySelectorAll('.col-xs')[0].textContent.replaceAll(' ', '').replaceAll('\n', '');
        datum.NG = docRow[i].querySelectorAll('.mainMarketsOdds')[2].querySelectorAll('.col-xs')[1].textContent.replaceAll(' ', '').replaceAll('\n', '');
    
        datum.over2 = docRow[i].querySelectorAll('.mainMarketsOdds')[2].querySelectorAll('.col-xs')[0].textContent.replaceAll(' ', '').replaceAll('\n', '');
        datum.under2 = docRow[i].querySelectorAll('.mainMarketsOdds')[2].querySelectorAll('.col-xs')[1].textContent.replaceAll(' ', '').replaceAll('\n', '');
    
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
}

table = [];
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }
function Babyinit() {
    setInterval(getResultData, 5000);
}
function getResultData() {
    console.log('I fucking get here.......');
    // Fetch results
    const numWeeksDoc = document.querySelector('#header-right-area-left-hour-week');
    console.log(numWeeksDoc, 'Weeks doc...');
    const resultRow = document.querySelectorAll('.match-cell');
    if (numWeeksDoc && numWeeksDoc.children[1]) {
        console.log(document.querySelectorAll('.pijamaElement-league-table'), 'Fucking tables...')
        if (document.querySelectorAll('.pijamaElement-league-table').length > 0) {
            setTable();
        }
        if (localStorage.getItem('__weekNum') === numWeeksDoc.children[1].textContent) return;

    }

    if (numWeeksDoc && !numWeeksDoc.children[1]) {
        console.log('Live scores running...');
        return;
    }

    console.log('Got in outside')
    const table = JSON.parse(localStorage.getItem('__table'))
    if (!resultRow || resultRow.length == 0) return;
    const bigResult = {
        weekNum: localStorage.getItem('numWeeksDoc'),
        leagueNum: localStorage.getItem('leagueNum'),
    }
    const results = [];
    
    console.log(resultRow, 'Result rows........');
    if (!resultRow || resultRow.length == 0) return;

    for (let i = 0; i < 10; i++) {
        let datum = {}
        let tableData;

        let rs = resultRow[i].textContent.replaceAll('\n', '').replaceAll(' ', '')
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

    console.log(bigResult, 'Big result');
    bigResult.weekNum = document.querySelector('.event-countdown').textContent.trim().split(' ')[2];
    $.ajax({
        type: "POST",
        url: 'http://localhost:8888/results',
        data: bigResult,
        success: function(bigResult) {
            localStorage.setItem('__weekNum', localStorage.getItem('numWeeksDoc'));
            console.log(bigResult)
        },
      });
    
    return bigResult;
}

function setTable() {
    console.log('Fetching tables.........');
    const leagueNum = document.querySelector('#header-right-area-left-hour-league').children[1].textContent;
    const numWeeksDoc = document.querySelector('#header-right-area-left-hour-week').children[1].textContent;
    const table = [];
    const tableRow = document.querySelectorAll('.pijamaElement-league-table');
    for (let j = 0; j < 20; j++) {
        let d = {};
        const strLen = tableRow[j].textContent.replaceAll('\n', '').replaceAll(' ', '').length
        let str;
        if (j < 9) {
            str = tableRow[j].textContent.replaceAll('\n', '').replaceAll(' ', '').substring(2, strLen);
        } else {
            str = tableRow[j].textContent.replaceAll('\n', '').replaceAll(' ', '').substring(3, strLen);
        }

        d.pos = j + 1;
        d.team = str.substring(0, 3);
        str = str.replace(d.team, '');

        let point = '';
        let form = '';
        for (let counter = 0; counter < str.length; counter++) {
            if (isNumeric(str[counter])) {
                point +=str[counter];
            } else {
                form+=str[counter];
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
Babyinit();
const table = [];
const tableRow = document.querySelectorAll('.pijamaElement-league-table');
for (let j = 0; j < 20; j++) {
    let d = {};
    const strLen = tableRow[j].textContent.replaceAll('\n', '').replaceAll(' ', '').length
    let str;
    if (j < 9) {
        str = tableRow[j].textContent.replaceAll('\n', '').replaceAll(' ', '').substring(2, strLen);
    } else {
        str = tableRow[j].textContent.replaceAll('\n', '').replaceAll(' ', '').substring(3, strLen);
    }

    d.pos = j + 1;
    d.team = str.substring(0, 3);
    // if (str.length == 9) {
    //     d.pos = j + 1;
    //     d.team = str.substring(0, 3);
    // } else {

    // }
    str = str.replace(d.team, '');

    let point = '';
    let form = '';
    for (let counter = 0; counter < str.length; counter++) {
        if (isNumeric(str[counter])) {
            point +=str[counter];
        } else {
            form+=str[counter];
        }
    }
    d.point = point;
    d.form = form;

    table.push(d);
}

console.log(table);
document.querySelectorAll('.pijamaElement-league-table')[14].textContent.replaceAll('\n', '').replaceAll(' ', '');
console.log(data)
 