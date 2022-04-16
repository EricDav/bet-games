const puppeteer = require('puppeteer');
const axios = require('axios');

 class Helper {
    static format(d) {
        d = d.toString();
        return d.length == 2 ? d : '0' + d;
    }

    static fetchBabyResult(res) {
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
          
            await page.goto('https://vsagent-ab.bet9ja.com/viewer-1.94.99/themes/?t=bet9ja_league_sat&timeToShowWinnersLL=20&layout=_base&monitor=0&vMode=livescore&_tickerLastResults=true&serverHost=vsagent-proxy-viewer.bet9ja.com&display=0&liveViewerId=0&vMode=livescore', {waitUntil: 'networkidle2'});
            await page.waitFor(20000);
            let data = 'Fuck u';
          
            const defaults = ['Fuck u', 'Live scores running...', 'Week number not available', 'No table']; 
            let count = 0;
            while (defaults.includes(data) && count < 84) {
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
          
            const result = await axios({
                method: 'post',
                url: 'https://baby.correctionweb.com/results',
                data
            });
          
            await browser.close();
            if (res) {
                return res.send({data, success: true});
            }
          })();          
    }

    static fetchBabyFixtures(res) { 
        (async () => {
            const browser = await puppeteer.launch({
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
        
            const username = 'pythagoras1';
            const password = 'Iloveodunayo123';
        
            await page.type('#inputUser', username);
            await page.type('#inputPass', password); 
        
            await page.click('.btn-danger');
        
            
            let ans;
            let count = 0;
        
            while (!ans &&  count < 5) {
                try {
                    if (count > 0) {
                        await page.goto(url, {waitUntil: 'networkidle2'});
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
                    count+=1;
                }
            }
        
            async function saveFixtures(res) {
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
        
                        return data;
                    }
                    return getFixtures();
                });
        
                return ans;
          }
        const result = await axios({
            method: 'post',
            url: 'https://baby.correctionweb.com/fixtures',
            data: ans
          });

          await browser.close();
          if (res) {
            res.send({data: ans, success: true});
          }
        })();
        
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
                      const dt = Helper.getDateTimeStrInUTC(itemArr[1]);
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
        
            const text2 = await page.$$eval('.event__match', (options) => {
                const f = options.map(option => option.getAttribute('id'));
                return f;
              });
            
              var data = [];
              let match;
              var index = 0;
              text.forEach(function(item, index) {
                  match = {}
                  if (item[0] == 'Finished' || !isNaN(item[0].trim()) || item[0] == 'Half Time') {
                      match.time = item[0];
                      match.home_name = item[1];
                      match.away_name = item[2];
                      match.score  = item[3] + item[4] + item[5];
                      match.match_id = text2[index].split('_')[2];
                      data.push(match);
                  } else if (item[0] == 'Cancelled' || item[0] == 'Postponed') {
                      match.time = item[0];
                      match.home_name = item[1];
                      match.away_name = item[2];
                      match.match_id = text2[index].split('_')[2];
                      data.push(match);
                  }
                  index +=1;
              });
        
            await browser.close();
        
          
              return res.send({data: data, success: true});
          })();          
    }

    static getMatchDetails(matchId, res) {
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

        await page.setDefaultNavigationTimeout(0);

        await page.goto('https://www.soccer24.com/match/' + matchId + '/#match-summary', {waitUntil: 'networkidle2'});

        const htFt = await page.$$eval('.detailMS__headerScore', (options) => {
            const result = options.map(option => option.innerText.split("\n"));
            return result;
        });

        const text = await page.$$eval('.detailMS__incidentRow', (options) => {
            const result = options.map(option => option.innerText.split("\n"));
            return result;
        });

        const text2 = await page.$$eval('.detailMS__incidentRow', (options) => {
            const result = options.map(option => option.getAttribute("class"));
            return result;
        });

        const icons = await page.$$eval('.icon-box ', (options) => {
            const result = options.map(option => option.getAttribute("class"));
            return result;
        });


        var data = [];
        let event;
        var index = 0;
        text.forEach(function(item, index) {
            event = {}
            event.time = item[0];
            event.player = item[2].includes('(') ? item[3] : item[2];
            event.type = text2[index].includes('away') ? 'away' : 'home';
            event.action = Helper.getAction(icons[index]);
            data.push(event);
        });

        var statistics = [];
        await page.click('#a-match-statistics');
        await page.waitForSelector('#tab-statistics-0-statistic');

        const stats = await page.$$eval('#tab-statistics-0-statistic > .statRow', (options) => {
            const result = options.map(option => option.innerText.split("\n"));
            return result;
        });

        var stat = {}

        stats.forEach(function(item, index) {
            stat = {};
            stat.home_val = item[0];
            stat.name = item[1];
            stat.away_val = item[2];
            statistics.push(stat);
        });

        var result = {
            statistics : statistics,
            events: data,
            firstHalfScore: htFt[0],
            secondHalfScore: htFt[1]
        };

        await browser.close();
        return res.send({data: result, success: true});

        })();
    }

    static getAction(iconStr) {
        if (iconStr.includes('soccer-ball')) {
          return 'goal';
        }
      
        if (iconStr.includes('y-card')) {
          return 'yellow card';
        }
      
        if (iconStr.includes('r-card')) {
          return 'yellow card';
        }
      
        if (iconStr.includes('yr-card')) {
          return 'yellow red card';
        }
    }

    static  getBookingCodeFromBetslip(betslip, res) {
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

    static async  getSportybetData(url) {
        const promise = (async () => {
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });
        
            const page = await browser.newPage();
         
            await page.setDefaultNavigationTimeout(0);
         
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.waitForSelector('#importMatch');
            const t = await page.evaluate(() => {
                const matches = [];
                const winOdds = [];
                const lostOdds = [];
                const drawOdds = [];
                const dates = [];
                const datesArr = []
                
                let items;
            
                awayTeam = document.querySelectorAll('.away-team')
                document.querySelectorAll('.home-team').forEach(function(item, index) {
                    matches.push(item.textContent.trim() + ' - ' + awayTeam[index].textContent.trim());
                });

                document.querySelectorAll('.market-cell').forEach(function(item) {
                    items = item.textContent.trim().split(' ');
            
                    if (items.length < 3) {
                        winOdds.push('-');
                        drawOdds.push('-');
                        lostOdds.push('-');
                    } else {
                        winOdds.push(items[0]);
                        drawOdds.push(items[1]);
                        lostOdds.push(retrieveLostOdds(items[2]));
                    }
                    // console.log(items);
            
                })

                let latestDate = '';
                document.querySelectorAll('.match-table .m-table-row').forEach((item) => {
                    if (item.children.length == 4) {
                        latestDate = item.textContent.split(' ')[0];
                    } else {
                        datesArr.push(latestDate);
                    }
                });
            
                function retrieveLostOdds(mixOdds) {
                    let odd = '';
                    let startCount = false;
                    let countAfterDot = 0;
                    for(i = 0; i < mixOdds.length; i++) {
                        if (countAfterDot == 2)
                            break;
                        
                        odd+=mixOdds[i];
                        if (startCount) {
                            countAfterDot+=1;
                        }
                        if (mixOdds[i] == '.') {
                            startCount = true;
                        }
                    }
            
                    return odd;
                }


                document.querySelectorAll('.clock-time').forEach((item, index) => {
                    dates.push(datesArr[index].replace('/', ' ') + ' ' + item.textContent.trim());
                });
            
                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds,
                    dates: dates,
                }
        
                return data;
            });
        
            await browser.close();

            return t;
        })();

        return promise;
    }

    static async  getNairabetData(url) {
        const promise = (async () => {
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });
        
            const page = await browser.newPage();
         
            await page.setDefaultNavigationTimeout(0);
         
            await page.goto(url, {waitUntil: 'networkidle2'});
            // await page.waitForSelector('#eventListHeaderMarketList1');
            //const teams = [];
            const t = await page.evaluate(() => {
                const matches = [];
                const winOdds = [];
                const lostOdds = [];
                const drawOdds = [];
                const dates = [];

                let items;
            
                document.querySelectorAll('.event-name').forEach(function(item) {
                    matches.push(item.textContent.trim());
                });
            
                document.querySelectorAll('.game').forEach(function(item,index) {
                    if (index%2 == 0) {
                        items = item.textContent.trim().replace(/  +/g, ' ').split(' ');
                        winOdds.push(items[0]);
                        drawOdds.push(items[1]);
                        lostOdds.push(items[2]);
                    }
                });

                const time = document.querySelectorAll('.date-time .time');
                document.querySelectorAll('.date-time .date').forEach(function(item, index) {
                    dates.push(item.textContent.replace('.', ' ') + ' ' + time[index].textContent)
                });

                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds,
                    dates: dates
                }
        
                return data;
            });
        
            await browser.close();

            return t;
        })();

        return promise;
        
    }

    static async  getBetkingData(url) {
        const promise = (async () => {
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });
        
            const page = await browser.newPage();
         
            await page.setDefaultNavigationTimeout(0);
         
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.waitForSelector('#eventsWrapper');
            const datesToNum = {
                'jan': 1,
                'feb': 2,
                'mar': 3,
                'apr': 4,
                'may': 5,
                'jun': 6,
                'jul': 7,
                'aug': 8,
                'sep': 9,
                'oct': 10,
                'nov': 11,
                'dec': 12,
            };
            const t = await page.evaluate(() => {
                const matches = [];
                const winOdds = [];
                const lostOdds = [];
                const drawOdds = [];
                const dates = [];
            
                document.querySelectorAll('.matchName').forEach(function(item) {
                    matches.push(item.textContent.trim());
                })
            
                document.querySelectorAll('.eventOdd-0').forEach(function(item) {
                    winOdds.push(item.textContent.trim());
                })
            
                document.querySelectorAll('.eventOdd-1').forEach(function(item) {
                    drawOdds.push(item.textContent.trim());
                })

                document.querySelectorAll('.eventOdd-2').forEach(function(item) {
                    lostOdds.push(item.textContent.trim());
                });

                const monthDayArr = document.querySelectorAll('.dateRow');
                let d;
                document.querySelectorAll('tbody').forEach(function(item, i) {
                    d = monthDayArr[i].textContent.split(' ');
                    item.querySelectorAll('.matchName').forEach(function(dt) {
                        dates.push(d[1] + ' ' + datesToNum[d[2].substring(0, 3).toLowerCase()]);
                    });
                });

                document.querySelectorAll('.eventDate').forEach((item, index) => {
                    dates[index] = dates[index] + ' ' + item.textContent;
                });

                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds,
                    dates: dates
                }
        
                return data;
            });
        
            await browser.close();

            return t;
        })();

        return promise;
    }

    static async getBet9jaData(url) {
        const promise = (async () => {
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });
        
            const page = await browser.newPage();
         
            await page.setDefaultNavigationTimeout(0);
         
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.waitForSelector('#MainContent');
            //const teams = [];
            const t = await page.evaluate(() => {
                const matches = [];
                const winOdds = [];
                const lostOdds = [];
                const drawOdds = [];
                const dates = [];
                const datesToNum = {
                    'jan': 1,
                    'feb': 2,
                    'mar': 3,
                    'apr': 4,
                    'may': 5,
                    'jun': 6,
                    'jul': 7,
                    'aug': 8,
                    'sep': 9,
                    'oct': 10,
                    'nov': 11,
                    'dec': 12,
                };
                const datesArr = document.querySelectorAll('.Time');
                let dateObj;
                document.querySelectorAll('.Event').forEach(function(item, index) {
                    matches.push(item.textContent.trim());
                    dateObj = datesArr[index].textContent.trim().replace(/  +/g, ' ').replace(/(\r\n|\n|\r)/gm,"").split(' ');
                    dates.push(dateObj[1] + ' ' + datesToNum[dateObj[2].toLowerCase()] + ' ' + dateObj[0]);
                })
            
                document.querySelectorAll('.odd').forEach(function(item, index) {
                    if (index%8 == 0) {
                        winOdds.push(item.textContent.trim().substring(1))
                    } else if (index%8 == 1) {
                        drawOdds.push(item.textContent.trim().substring(1))
                    } else if (index%8 == 2) {
                        lostOdds.push(item.textContent.trim().substring(1))
                    }
                });

                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds,
                    dates: dates
                }
        
                return data;
            });
        
            await browser.close();

            return t;
        })();

        return promise;
    }

    static async  get1xbetData(url) {
        const promise = (async () => {
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });
        
            const page = await browser.newPage();
         
            await page.setDefaultNavigationTimeout(0);
         
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.waitForSelector('#maincontent');
            // const image = await page.screenshot({fullPage : true});

            // return image;

            const t = await page.evaluate(() => {
                const matches = [];
                const winOdds = [];
                const lostOdds = [];
                const drawOdds = [];
                const dates = []

                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds
                }
                
                let odds;
                let count;
            
                document.querySelectorAll('.c-events__teams').forEach(function(item) {
                    matches.push(item.title);
                });
            
                document.querySelectorAll('.c-bets').forEach(function(item, index) {
                    if (index != 0) {
                    
                    // count = 0
                    winOdds.push(item.children[0].textContent);
                    drawOdds.push(item.children[1].textContent);
                    lostOdds.push(item.children[2].textContent);
            
                    for(i = 0; i < odds.length; i++) {
                        if (odds[i].trim()) {
                            if (count == 0) {
                                winOdds.push(odds[i].trim());
                            }
                            if (count == 1) {
                                drawOdds.push(odds[i].trim());
                            }
                            if (count == 2) {
                                lostOdds.push(odds[i].trim());
                            }
                            count+=1;
                        }
                    }
                 }
                });

                document.querySelectorAll('.c-events__time-info').forEach((item) => {
                    const date = item.textContent.trim().split(' ');
                    dates.push(date[0].replace('.', ' ') + date[1]);
                });

                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds,
                    dates: dates,
                }
        
                return data;
            });
        
            await browser.close();

            return t
        })();

        return promise;
    }

    static splitOddMoney(w,d,l,amount) {
        const fractionOfD = w/d;
        const fractionOfL = w/l;
        
        let wAmount = amount/(fractionOfD + fractionOfL + 1);
        let dAmount = wAmount * fractionOfD;
        let lAmount = wAmount * fractionOfL;

        wAmount = Math.round(wAmount);
        dAmount = Math.round(dAmount);
        lAmount = Math.round(lAmount);

        if ((wAmount + dAmount + lAmount ) > amount) {
            if ((wAmount*w) > (dAmount*d) && (wAmount*w) > (lAmount*l))  {
                wAmount-=1;
            } else if ((dAmount*d) > (wAmount*w) && (dAmount*d) > (lAmount*l)) {
                dAmount-=1;
            } else if ((lAmount*l) > (wAmount*w) && (lAmount*l) > (dAmount*d)) {
                lAmount-=1;
            }
        }

        if ((wAmount + dAmount + lAmount ) < amount) {
            if ((wAmount*w) < (dAmount*d) && (wAmount*w) < (lAmount*l))  {
                wAmount+=1;
            } else if ((dAmount*d) < (wAmount*w) && (dAmount*d) < (lAmount*l)) {
                dAmount+=1;
            } else if ((lAmount*l) < (wAmount*w) && (lAmount*l) < (dAmount*d)) {
                lAmount+=1;
            }
        }

        let awAmount = wAmount*w;
        let adAmount = dAmount*d;
        let alAmount = lAmount*l;

        
        return {'amount_to_play': [wAmount, dAmount, lAmount], 
                'amount_to_win' : [Number.parseFloat(awAmount.toFixed(2)), Number.parseFloat(adAmount.toFixed(2)), Number.parseFloat(alAmount.toFixed(2))]};
    }

    static determineHighestOdds(platformObj) {
        const maxWinOdd = {oddValue: 0};
        const maxDrawOdd = {oddValue: 0};
        const maxLostOdd = {oddValue: 0};
    
        platformObj.platformOdds.forEach(function(platformOdd) {
            if (platformOdd['odds'][0] != '-' && parseFloat(platformOdd['odds'][0]) > maxWinOdd.oddValue) {
                maxWinOdd.oddValue = parseFloat(platformOdd['odds'][0]);
                maxWinOdd['platform'] = platformOdd['platform'];
            }
    
            if (platformOdd['odds'][1] != '-' &&  parseFloat(platformOdd['odds'][1]) > maxDrawOdd['oddValue']) {
                maxDrawOdd['oddValue'] = parseFloat(platformOdd['odds'][1])
                maxDrawOdd['platform'] = platformOdd['platform']
            }
            
            if (platformOdd['odds'][2] != '-' &&  parseFloat(platformOdd['odds'][2]) > maxLostOdd['oddValue']) {
                maxLostOdd['oddValue'] = parseFloat(platformOdd['odds'][2])
                maxLostOdd['platform']= platformOdd['platform']
            }
        });
    
        return {
            'match':   platformObj.match,
            'win':  maxWinOdd,
            'draw': maxDrawOdd,
            'lost': maxLostOdd,
        }
    }

    static isMatch(matchA, matchB) {
        matchA = matchA.toLowerCase().replace('.', '').trim().replace('—', '-');
        matchB = matchB.toLowerCase().replace('.', '').trim().replace('—', '-');
        matchA = matchA.replace('Man', 'Manchester');
        matchB = matchB.replace('Man', 'Manchester');

        if (matchA == matchB)
            return true;

        let matchAHomeAway = matchA.split("-");
        let matchBHomeAway = matchB.split("-");

        let matchAHome = matchAHomeAway[0].trim();
        let matchAAway = matchAHomeAway[1].trim();

        let matchBHome = matchBHomeAway[0].trim();
        let matchBAway = matchBHomeAway[1].trim();

        if (matchAHome == matchBHome && matchAAway == matchBAway) {
            return true;
        }

        if ((matchBHome.includes(matchAHome) || matchAHome.includes(matchBHome)) && (matchBAway.includes(matchAAway) || matchAAway.includes(matchBAway))) {
            return true;
        }

        return Helper.isMatchTeam(matchAHome, matchBHome) && Helper.isMatchTeam(matchAAway, matchBAway)
    }


    static isMatchTeam(teamA, teamB) {
        const teamAr = teamA.split(' ');
        const teamBr = teamB.split(' ');

        if (teamAr.length == 1 && teamBr.length == 1) {
            return teamAr[0] == teamBr[0];
        }


        if (teamAr.length == 1 || teamBr.length == 1) {
            return teamB.includes(teamA) || teamA.includes(teamB);
        }

        for(let i = 0; i < teamAr.length; i++) {
            let a = teamAr[i];
            for(let j = 0; j < teamBr.length; j++) {
                let b = teamBr[j];
                if ( (a.length > 2 && b.length > 2) && (!['city', 'united', 'fc', 'cd', 'cf'].includes(a.toLowerCase()) && !['city', 'united', 'fc', 'cd', 'cf'].includes(b.toLowerCase())) && 
                    (a.includes(b) || b.includes(a)) ) {
                        return true;
                }
            }
        }

        return false;
        
    }
    

    static getRiskless(competitionId, amount, res, platforms=null) {
        (async () => {
            const PREMIER_LEAGUE = 1
            const LALIGA = 2
            const BUNDESLIGA = 3
            const FRANCE_LEAGUE = 4
            const PORTUGAL_PREMIER_LIGA = 5
            const SERIE_A = 6
            const SWEDEN_ALLSVENSKAN = 7
            const NETHERLANDS_EREDIVISIE = 8
            const CHAMPIONS_LEAGUE = 9
            const NORWAY_ELITESERIEN = 10
            const EUROPE_LEAGUE = 11
            const CHAMPIONSHIP = 12;
                
            const URLS = {
                    1: {
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=170880',
                        'xbet': 'https://1xbet.com/en/line/Football/88637-England-Premier-League',
                        'nairabet': 'https://nairabet.com/categories/18871',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/england/eng-premier-league/0/0',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:1/sr:tournament:17'
                    },
                    6: {
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=167856',
                        'xbet': 'https://1xbet.com/en/line/Football/110163-Italy-Serie-A/',
                        'nairabet': 'https://nairabet.com/categories/18767',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/italy/ita-serie-a/0/0',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:31/sr:tournament:23'   
                    },
                    2: {
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=180928',
                        'xbet': 'https://1xbet.com/en/line/Football/127733-Spain-La-Liga/',
                        'nairabet': 'https://nairabet.com/categories/18726',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/spain/esp-laliga/0/0',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:32/sr:tournament:8'  
                    },
                    4: {
                        'xbet': 'https://1xbet.com/en/line/Football/12821-France-Ligue-1/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:7/sr:tournament:34' ,
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=950503',
                        'nairabet': 'https://nairabet.com/categories/18883',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/france/fra-ligue-1/0/0',
                    },
                    3: {
                        'xbet': 'https://1xbet.com/en/line/Football/96463-Germany-Bundesliga/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:30/sr:tournament:35',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=180923',
                        'nairabet': 'https://nairabet.com/categories/18767',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/germany/ger-bundesliga/0/0',
                    },
                    5: {
                        'xbet': 'https://1xbet.com/en/line/Football/118663-Portugal-Primeira-Liga/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:44/sr:tournament:238',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=180967',
                        'nairabet': 'https://nairabet.com/categories/18955',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/portugal/por-primeira-liga/0/0',
                    },
                    7: {
                        'xbet': 'https://1xbet.com/en/line/Football/212425-Sweden-Allsvenskan/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:9/sr:tournament:40',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=817651',
                        'nairabet': 'https://nairabet.com/categories/18875',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/sweden/swe-allsvenskan/0/0',
                    },

                    8: {
                        'xbet': 'https://1xbet.com/en/line/Football/2018750-Netherlands-Eredivisie/',
                        'sportybet': 'https://www.sportybet.comcom/sport/football/sr:category:35/sr:tournament:370', 
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=1016657',
                        'nairabet': 'https://nairabet.com/categories/18732',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/netherlands/ned-eredivisie/0/0',
                    },
                10: {
                        'xbet': 'https://1xbet.com/en/line/Football/1793471-Norway-Eliteserien/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:5/sr:tournament:20',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=817648',
                        'nairabet': 'https://nairabet.com/categories/18927',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/norway/nor-eliteserien/0/0'
                    },
                    9: {
                        'xbet': 'https://1xbet.com/en/line/Football/118587-UEFA-Champions-League/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:top/sr:tournament:7',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=1062457',
                        'nairabet': 'https://nairabet.com/categories/18727',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/champions-l/uefa-champions-league/0/0'
                    },
                    11: {
                        'xbet': 'https://1xbet.com/en/line/Football/118593-UEFA-Europa-League/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:top/sr:tournament:679',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=1062916',
                        'nairabet': 'https://nairabet.com/categories/18749',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/europa-l/uefa-europa-league/0/0'
                    },
                
                    12: {
                        'xbet': 'https://1xbet.com/en/line/Football/105759-England-Championship/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:1/sr:tournament:18',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=170881',
                        'nairabet': 'https://www.nairabet.com/categories/18935',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/england/eng-championship/0/0'
                    }
                }

                function getAllGames(allGames, platform) {
                    allGames = {};
                    let game;
                    let key;
                    for (let i = 0; i < 0; i++) {
                        game = allGames[i];
                        key = Object.keys(game)[0];
                        allGames[key] = game[key];
                    }

                    return allGames;
                }

                const urls = URLS[competitionId];
                const xbetUrl = urls['xbet']
                const sportybetUrl = urls['sportybet']
                const bet9jaUrl = urls['bet9ja']
                const nairabetUrl = urls['nairabet'];
                const betKingUrl = urls['betking'];
                const allSupportedPlatforms = ['xbet', 'sportybet', 'bet9ja', 'nairabet'];
                const platformsObj = []; // the platforms we want to fetch or scrape their data

                if (!platforms) {
                    platformsObj = allSupportedPlatforms;
                } else {
                    platforms.forEach((platform, index) => {
                        if (allSupportedPlatforms.includes(platform.toLowerCase()) && !platformsObj.includes(platform.toLowerCase())) {
                            platformsObj.push(platform.toLowerCase());
                        }
                    });
                }



               // const s = await Helper.get1xbetData(xbetUrl);
                // res.set('Content-Type', 'image/png');
                // return res.send(s);
            
            
                try {
                    let platformsData = await Promise.all(
                        [
                            ... (platformsObj.includes('bet9ja') ? [{bet9ja: Helper.getBet9jaData(bet9jaUrl)}] : []),
                            ... (platformsObj.includes('xbet') ? [{xbet: Helper.get1xbetData(xbetUrl)}] : []),
                            ... (platformsObj.includes('sportybet') ? [{sportybet: Helper.getSportybetData(sportybetUrl)}] : []),
                            ... (platformsObj.includes('nairabet') ? [{nairabet: Helper.getNairabetData(nairabetUrl)}] : []),
                            ... (platformsObj.includes('betking') ? [{betking: Helper.getBetkingData(betKingUrl)}] : []),
                        ]
                    );

                    allGames = getAllGames(platformsData);


                    const results = [];
                    const stats = {
                        'bet9ja': {'num_games_retrieved': allGames['bet9ja']['matches'].length, 'unmatched_matches': []},
                        'betking': {'num_games_retrieved': allGames['betking'].length, 'unmatched_matches': []},
                        'sportybet': {'num_games_retrieved': allGames['sportybet'].length, 'unmatched_matches': []},
                        'nairabet': {'num_games_retrieved': allGames['nairabet'].length, 'unmatched_matches': []},
                        'xbet': {'num_games_retrieved': allGames['xbet'].length, 'unmatched_matches': []}
                    }
                    let isxbetMatch = false
                    let isbet9jaMatch = false;
                    let isNairabetMatch = false;
                    let isSportybetMatch = false;
    
                    for(let i = 0; i < allGames.betking.matches.length; i++) {
                        let match = allGames['betking']['matches'][i];
                        let winOdd = allGames['betking']['winOdds'][i];
                        let drawOdd = allGames['betking']['drawOdds'][i];
                        let lostOdd = allGames['betking']['lostOdds'][i];
                        let obj = {
                            'match': match,
                            'platformOdds': [{'platform': 'betking', 'odds': [winOdd, drawOdd, lostOdd]}]
                        };
    
                        for(let j = 0; j < allGames.bet9ja.matches.length; j++) {
                            let bet9jaMatch = allGames['bet9ja']['matches'][j]
                            isbet9jaMatch = false
                            if (Helper.isMatch(match, bet9jaMatch)) {
                                let bet9jaWinOdd = allGames['bet9ja']['winOdds'][j];
                                let bet9jaDrawOdd = allGames['bet9ja']['drawOdds'][j];
                                let bet9jaLostOdd = allGames['bet9ja']['lostOdds'][j];
                                obj['platformOdds'].push({'platform': 'bet9ja', 'odds': [bet9jaWinOdd, bet9jaDrawOdd, bet9jaLostOdd]});
                                isbet9jaMatch = true;
                                break;
                            }
                        }
    
                        for(let k = 0; k < allGames.sportybet.matches.length; k++) {
                            let sportybetMatch = allGames['sportybet']['matches'][k]
                            isSportybetMatch = false
                            if (Helper.isMatch(match, sportybetMatch)) {
                                let sportybetWinOdd = allGames['sportybet']['winOdds'][k];
                                let sportybetDrawOdd = allGames['sportybet']['drawOdds'][k];
                                let sportybetLostOdd = allGames['sportybet']['lostOdds'][k];
                                obj['platformOdds'].push({'platform': 'sportybet', 'odds': [sportybetWinOdd, sportybetDrawOdd, sportybetLostOdd]});
                                isSportybetMatch = true;
                                break;
                            }
                        }
    
                        for(let m = 0; m < allGames.nairabet.matches.length; m++) {
                            let nairabetMatch = allGames['nairabet']['matches'][m]
                            isNairabetMatch = false
                            if (Helper.isMatch(match, nairabetMatch)) {
                                let nairabetWinOdd = allGames['nairabet']['winOdds'][m];
                                let nairabetDrawOdd = allGames['nairabet']['drawOdds'][m];
                                let nairabetLostOdd = allGames['nairabet']['lostOdds'][m];
                                obj['platformOdds'].push({'platform': 'nairabet', 'odds': [nairabetWinOdd, nairabetDrawOdd, nairabetLostOdd]});
                                isNairabetMatch = true;
                                break;
                            }
                        }
    
                        for(let n = 0; n < allGames.xbet.matches.length; n++) {
                            let xbetMatch = allGames['xbet']['matches'][n]
                            isxbetMatch = false
                            if (Helper.isMatch(match, xbetMatch)) {
                                let xbetWinOdd = allGames['xbet']['winOdds'][n];
                                let xbetDrawOdd = allGames['xbet']['drawOdds'][n];
                                let xbetLostOdd = allGames['xbet']['lostOdds'][n];
                                obj['platformOdds'].push({'platform': 'xbet', 'odds': [xbetWinOdd, xbetDrawOdd, xbetLostOdd]});
                                isxbetMatch = true;
                                break;
                            }
                        }
    
                        if (!isbet9jaMatch)
                            stats['bet9ja']['unmatched_matches'].push(match)
    
                        if (!isSportybetMatch)
                            stats['sportybet']['unmatched_matches'].push(match)
    
                        if (!isNairabetMatch)
                            stats['nairabet']['unmatched_matches'].push(match)
    
                        if (!isxbetMatch)
                            stats['xbet']['unmatched_matches'].push(match)
                        results.push(obj)
                    }
    
                    const resultData = Helper.determineRsiklessGames(results, amount);
    
                    return res.send({success: true, data: {result: resultData, stat: stats, urls: urls }});
                } catch(e) {
                    console.log(e);
                    return res.send({success: false, data: []});
                }

               // console.log(allGames);
        })();
    }

    static getZoomFixtures(res, country) {
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
                france: 'https://web.bet9ja.com/Sport/Odds?EventID=567138',
                portugal: 'https://web.bet9ja.com/Sport/Odds?EventID=567145',
                netherlands: 'https://web.bet9ja.com/Sport/Odds?EventID=607994'
            };

            const url = urls[country];

            console.log(url);
        
            const page = await browser.newPage();
         
            await page.setDefaultNavigationTimeout(0);
         
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.waitFor('#MainContent');
            await page.waitFor(4000);
            let t;
            let g;
            let overUnder1;
            let overUnder3;

            try {
                t = await page.evaluate(() => {
                    const fixtures = [];
                    const odds = [];
                    let odd = {};
    
                    const time = document.querySelectorAll('.Time')[0].textContent.trim().substring(0, 5)
                    const dateTime = document.querySelectorAll('.Time')[0].textContent.trim().replace(/  +/g, ' ').replace(/(\r\n|\n|\r)/gm,"").split(' ');
                    dateTimeObj= {
                        time: dateTime[0],
                        day: dateTime[1],
                        month: dateTime[2]
                    };
            
                    document.querySelectorAll('.Event').forEach(function(item) {
                        const homeAway = item.textContent.split('-');
                        fixtures.push({home: homeAway[0].trim(), away: homeAway[1].trim()});
                    });

                    const oddsDoc = document.querySelectorAll('.odd');
            
                    oddsDoc.forEach(function(item, index) {
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
            
                        if (index == oddsDoc.length - 1) {
                            odds.push(odd);
                        }
                    });
            
                    fixtures.forEach(function(item, index) {
                        item.odds = odds[index]
                    });
                    document.querySelectorAll('.CQ')[0].children[3].click();
                    return {fixtures: fixtures, time: time, timeObj: dateTimeObj};
                });
            } catch(e) {
                return res.send({success: false, message: 'There is an error while generating main fixtures'});
            }
         
            await page.waitFor(3000);
        
            try {
                g = await page.evaluate(() => {
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
            } catch(e) {
                return res.send({success: false, message: 'There is an error while generating fixtures for GG and NG'});
            }
            await page.waitFor(4000);
        
            try {
                overUnder1 = await page.evaluate(() => {
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
            } catch(e) {
                return res.send({success: false, message: 'There is an error while generating fixtures for over1 and under1'});
            }
        
            await page.waitFor(3000);
        
            try {
                overUnder3 = await page.evaluate(() => {
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
            } catch(e) {
                return res.send({success: false, message: 'There is an error while generating fixtures for over3 and under3'});
            }

            console.log(g, 'GGGG')
            console.log(t.fixtures, 'Fixtures==>>')
        
            t.fixtures.forEach(function(item, index) {
                item.odds.GG = g[index].GG;
                item.odds.NG = g[index].NG;
                item.odds.over1 = overUnder1[index].over1;
                item.odds.under1 = overUnder1[index].under1;
                item.odds.over3 = overUnder3[index].over3;
                item.odds.under3 = overUnder3[index].under3;
            });

            await browser.close();
        
            return res.send({success: true, data: t.fixtures, time: t.time, dateTimeObj: t.timeObj});
        })();
    }

    static getZoomScores(res, country) {
        (async () => {
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });

            const urls = {
                spain: 'https://zoomapi.bet9ja.com/zoom/results/liga-zoom?clientId=202&notMobile=1&offset=3600000',
                england: 'https://zoomapi.bet9ja.com/zoom/results/premier-zoom?clientId=202&notMobile=1&offset=3600000',
                germany: 'https://zoomapi.bet9ja.com/zoom/results/bundes-zoom?clientId=202&notMobile=1&offset=3600000',
                italy: 'https://zoomapi.bet9ja.com/zoom/results/seriea-zoom?clientId=202&notMobile=1&offset=3600000',
                france: 'https://zoomapi.bet9ja.com/zoom/results/ligue1-zoom?clientId=202&notMobile=1&offset=3600000',
                portugal: 'https://zoomapi.bet9ja.com/zoom/results/primeira-zoom?clientId=202&notMobile=1&offset=3600000',
                netherlands: 'https://zoomapi.bet9ja.com/zoom/results/eredivisie-zoom?clientId=202&notMobile=1&offset=3600000',
            };

            // document.querySelectorAll('.form')[19].textContent
            // document.querySelectorAll('.l-table__team-name')[0].textContent

            const url = urls[country];
            const page = await browser.newPage();
         
            await page.setDefaultNavigationTimeout(0);
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.waitForSelector('.content-wrap');
            await page.waitFor(3000);
            let t;
            let tableInfo;

            try {
                t = await page.evaluate(() => {
                    const teams = [];
    
                    const homeElem = document.querySelectorAll('tbody tr .text-right');
                    const awayElem = document.querySelectorAll('tbody tr .text-left');
                    const scoreElem = document.querySelectorAll('tbody tr .txt-y');
                    
                    homeElem.forEach(function(item, index) {
                        if (index%2 == 0) {
                            teams.push({home: item.textContent, away: awayElem[index].textContent, 
                            score: scoreElem[index].textContent, 
                            htScore: scoreElem[index+ 1].textContent.replace('HT', '')});
                        }
                    });
                
                    return teams
                });
            } catch(e) {
                return res.send({success: false, message: 'There is an error while generating scores'});
            }

            await page.waitFor(3000);

            await page.evaluate(() => {
                document.querySelector('.top-nav__list-item').click();
            });

            await page.waitFor(5000);

            try {
                tableInfo = await page.evaluate(() => {
                    const forms = document.querySelectorAll('.form');
                    const positions = document.querySelectorAll('.l-table__team-name');
                    f = [];
                    p = [];
    
                    forms.forEach((item, index) => {
                        f.push(item.textContent);
                        p.push(positions[index].textContent);
                    });
    
                    return {forms: f, positions: p};
    
                });
            } catch(e) {
                return res.send({success: false, message: 'There is an error while generating forms'});
            }

            await browser.close();

            return res.send({success: true, data: t, forms: tableInfo.forms, positions: tableInfo.positions});
        })();
    }

    static determineRsiklessGames(data, amount) {
        const maxGames = [];
        const risklessGames = [];

        data.forEach(function(mData) {
            let hOdd = Helper.determineHighestOdds(mData);
            let splitMoneyOdd = Helper.splitOddMoney(hOdd['win']['oddValue'], hOdd['draw']['oddValue'], hOdd['lost']['oddValue'], amount);
            hOdd['eval'] = splitMoneyOdd;
            maxGames.push(hOdd);
            if (splitMoneyOdd['amount_to_win'][0] > amount) {
                risklessGames.push(hOdd);
            }
        });

        return {'all': maxGames, 'won': risklessGames}
    }

    static getPlayedBookingCode(data, res, country) {
        (async () => {
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });
    
            const page = await browser.newPage();
            const urls = {
                spain: 'https://web.bet9ja.com/Sport/Odds?EventID=567119',
                england: 'https://web.bet9ja.com/Sport/Odds?EventID=567161',
                germany: 'https://web.bet9ja.com/Sport/Odds?EventID=567120',
                italy: 'https://web.bet9ja.com/Sport/Odds?EventID=567136',
                france: 'https://web.bet9ja.com/Sport/Odds?EventID=567138',
                portugal: 'https://web.bet9ja.com/Sport/Odds?EventID=567145',
                netherlands: 'https://web.bet9ja.com/Sport/Odds?EventID=607994'
            };

            console.log(country);
            
            const url = urls[country];
            console.log(url, 'URL....');
             
            await page.setDefaultNavigationTimeout(0);
            await page.goto(url, {waitUntil: 'networkidle2'});
    
           // const data = [{match: 'Z.Arsenal - Z.Brighton', index: 0, outcome: '1'}, {match: 'Z.Arsenal - Z.Brighton', index: 3, outcome: '1'}, {match: 'Z.Chelsea - Z.Aston Villa', index: 1, outcome: 'GG'}];
    
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
                        'X':1,
                        2:2,
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
                        elements[(obj.index*8) + f[obj.outcome]].click();
                    }
    
                    return main.length;
                });
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
    
           await page.click('#s_w_PC_cCouponISBets_lnkAvanti');
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
             const dt = Helper.getDateTimeStrInUTC(itemArr[1]);
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

            return res.send({success: true, data: ans});
        })();
    }

    static playBookingCode(bookingNumber, username, password, amount, res) {
        (async () => {
            const browser = await puppeteer.launch({
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });
    
            // const bookingNumber = 'PZM66B';
    
            const page = await browser.newPage();
            const url = 'https://web.bet9ja.com/Sport/Default.aspx';
             
            await page.setDefaultNavigationTimeout(0);
            await page.goto(url, {waitUntil: 'networkidle2'});
    
            // const username = 'pythagoras1';
            // const password = 'Iloveodunayo123';
            // const amount = '100';
            await page.type('#h_w_cLogin_ctrlLogin_Username', username);
            await page.type('#h_w_cLogin_ctrlLogin_Password', password); 
            await page.click('#h_w_cLogin_ctrlLogin_lnkBtnLogin');
            await page.waitForSelector('#hl_w_PC_cCouponISBets_txtPrenotatore');
            await page.type('#hl_w_PC_cCouponISBets_txtPrenotatore', bookingNumber);
            await page.click('#hl_w_PC_cCouponISBets_lnkLoadPrenotazione');
            await page.waitFor(3000);
    
            await page.type('#hl_w_PC_cCouponISBets_txtImporto', amount);
            await page.click('#hl_w_PC_cCouponISBets_lnkAvanti');
            await page.pdf({path: 'output.pdf', format: 'A4'}); //
    
            await page.waitForSelector('#hl_w_PC_cCouponISBets_lnkConferma');
            await page.click('#hl_w_PC_cCouponISBets_lnkConferma');
    
            await page.waitForSelector('#hl_w_PC_cCouponISBets_lblMsgScoAccettata');
            const ans = await page.evaluate(() => {
                return document.querySelector('#hl_w_PC_cCouponISBets_lblMsgScoAccettata').textContent;
            });
    
            await browser.close();

            if (ans) {
                const betslip = ans.split(':')[1].trim();
                return res.send({success: true, data: betslip});
            } else {
                return res.send({success: false, message: 'Check balance'});
            }
        })();
    }

}

module.exports = Helper;
