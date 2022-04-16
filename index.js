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
  
  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);

  await page.goto('https://vsagent-ab.bet9ja.com/viewer-1.94.99/themes/?t=bet9ja_league_sat&timeToShowWinnersLL=20&layout=_base&monitor=0&vMode=livescore&_tickerLastResults=true&serverHost=vsagent-proxy-viewer.bet9ja.com&display=0&liveViewerId=0&vMode=livescore', {waitUntil: 'networkidle2'});
  await page.waitFor(20000);
  let data = 'Fuck u';

  const defaults = ['Fuck u', 'Live scores running...', 'Week number not available', 'No table']; 
  count = 0;
  while (defaults.includes(data) && count < 60) {
    count +=1;
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
            if (localStorage.getItem('__weekNum') === numWeeksDoc.children[1]?.textContent) {
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
            console.log(rs, 'Rs......')
            datum.home = rs.substring(0, 3);
            tableData = table.find(element => element.team == datum.home);
            console.log(tableData, 'Table datat....');

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
    
        bigResult.weekNum = document.querySelector('.event-countdown')?.textContent.trim().split(' ')[2];
        $.ajax({
            type: "POST",
            url: 'http://localhost:8888/results',
            data: bigResult,
            success: function(bigResult) {
                localStorage.setItem('__weekNum', localStorage.getItem('numWeeksDoc'));
                console.log(bigResult);
            },
          });
        
        return bigResult;
    }
    
    function setTable() {
        const leagueNum = document.querySelector('#header-right-area-left-hour-league').children[1]?.textContent;
        const numWeeksDoc = document.querySelector('#header-right-area-left-hour-week').children[1]?.textContent;
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
    return getResultData();
    })
  }


  await page.waitFor(6000);
  console.log(data, '========>>>>>');

  await browser.close();
  // return res.send({data: data, success: true});
})();

