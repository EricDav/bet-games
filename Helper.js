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
            //const teams = [];
            const t = await page.evaluate(() => {
                const matches = [];
                const winOdds = [];
                const lostOdds = [];
                const drawOdds = [];
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
            
                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds
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
            await page.waitForSelector('#eventListHeaderMarketList1');
            //const teams = [];
            const t = await page.evaluate(() => {
                const matches = [];
                const winOdds = [];
                const lostOdds = [];
                const drawOdds = [];
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

                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds
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
            //const teams = [];
            const t = await page.evaluate(() => {
                const matches = [];
                const winOdds = [];
                const lostOdds = [];
                const drawOdds = [];
            
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

                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds
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
            
                document.querySelectorAll('.Event').forEach(function(item) {
                    matches.push(item.textContent.trim());
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
                    lostOdds: lostOdds
                }

                console.log(data);
        
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
                headless:false,
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                  ],
            });
        
            const page = await browser.newPage();
         
            await page.setDefaultNavigationTimeout(0);
         
            await page.goto(url, {waitUntil: 'networkidle2'});
            await page.waitFor(3000);

            const t = await page.evaluate(() => {
                const matches = [];
                const winOdds = [];
                const lostOdds = [];
                const drawOdds = [];
                let odds;
                let count;
            
                document.querySelectorAll('.c-events__teams').forEach(function(item) {
                    matches.push(item.title);
                });
            
                document.querySelectorAll('.c-bets').forEach(function(item, index) {
                    if (index != 0) {
                    
                    count = 0
                    odds = item.textContent.trim().split("\n");
            
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

                data = {
                    matches: matches,
                    winOdds: winOdds,
                    drawOdds: drawOdds,
                    lostOdds: lostOdds
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
    

    static getRiskless(competitionId, amount, res) {
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
                        'xbet': 'https://1xbet.ng/en/line/Football/88637-England-Premier-League',
                        'nairabet': 'https://nairabet.com/categories/18871',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/england/eng-premier-league/0/0',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:1/sr:tournament:17'
                    },
                    6: {
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=167856',
                        'xbet': 'https://1xbet.ng/en/line/Football/110163-Italy-Serie-A/',
                        'nairabet': 'https://nairabet.com/categories/18767',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/italy/ita-serie-a/0/0',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:31/sr:tournament:23'   
                    },
                    2: {
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=180928',
                        'xbet': 'https://1xbet.ng/en/line/Football/127733-Spain-La-Liga/',
                        'nairabet': 'https://nairabet.com/categories/18726',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/spain/esp-laliga/0/0',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:32/sr:tournament:8'  
                    },
                    4: {
                        'xbet': 'https://1xbet.ng/en/line/Football/12821-France-Ligue-1/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:7/sr:tournament:34' ,
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=950503',
                        'nairabet': 'https://nairabet.com/categories/18883',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/france/fra-ligue-1/0/0',
                    },
                    3: {
                        'xbet': 'https://1xbet.ng/en/line/Football/96463-Germany-Bundesliga/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:30/sr:tournament:35',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=180923',
                        'nairabet': 'https://nairabet.com/categories/18767',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/germany/ger-bundesliga/0/0',
                    },
                    5: {
                        'xbet': 'https://1xbet.ng/en/line/Football/118663-Portugal-Primeira-Liga/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:44/sr:tournament:238',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=180967',
                        'nairabet': 'https://nairabet.com/categories/18955',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/portugal/por-primeira-liga/0/0',
                    },
                    7: {
                        'xbet': 'https://1xbet.ng/en/line/Football/212425-Sweden-Allsvenskan/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:9/sr:tournament:40',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=817651',
                        'nairabet': 'https://nairabet.com/categories/18875',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/sweden/swe-allsvenskan/0/0',
                    },

                    8: {
                        'xbet': 'https://1xbet.ng/en/line/Football/2018750-Netherlands-Eredivisie/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:35/sr:tournament:370', 
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=1016657',
                        'nairabet': 'https://nairabet.com/categories/18732',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/netherlands/ned-eredivisie/0/0',
                    },
                10: {
                        'xbet': 'https://1xbet.ng/en/line/Football/1793471-Norway-Eliteserien/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:5/sr:tournament:20',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=817648',
                        'nairabet': 'https://nairabet.com/categories/18927',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/norway/nor-eliteserien/0/0'
                    },
                    9: {
                        'xbet': 'https://1xbet.ng/en/line/Football/118587-UEFA-Champions-League/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:top/sr:tournament:7',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=1062457',
                        'nairabet': 'https://nairabet.com/categories/18727',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/champions-l/uefa-champions-league/0/0'
                    },
                    11: {
                        'xbet': 'https://1xbet.ng/en/line/Football/118593-UEFA-Europa-League/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:top/sr:tournament:679',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=1062916',
                        'nairabet': 'https://nairabet.com/categories/18749',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/europa-l/uefa-europa-league/0/0'
                    },
                
                    12: {
                        'xbet': 'https://1xbet.ng/en/line/Football/105759-England-Championship/',
                        'sportybet': 'https://www.sportybet.com/ng/sport/football/sr:category:1/sr:tournament:18',
                        'bet9ja': 'https://web.bet9ja.com/Sport/Odds?EventID=170881',
                        'nairabet': 'https://www.nairabet.com/categories/18935',
                        'betking': 'https://www.betking.com/sports/s/event/p/soccer/england/eng-championship/0/0'
                    }
                }

                const urls = URLS[competitionId];
                const xbetUrl = urls['xbet']
                const sportybetUrl = urls['sportybet']
                const bet9jaUrl = urls['bet9ja']
                const nairabetUrl = urls['nairabet'];
                const betKingUrl = urls['betking'];
            
            
                try {
                    let allGames = await Promise.all(
                        [
                            Helper.getBet9jaData(bet9jaUrl),
                            Helper.get1xbetData(xbetUrl),
                            Helper.getSportybetData(sportybetUrl),
                            Helper.getNairabetData(nairabetUrl),
                            Helper.getBetkingData(betKingUrl)
                        ]
                    );

                    allGames = {
                        bet9ja: allGames[0],
                        xbet: allGames[1],
                        sportybet: allGames[2],
                        nairabet: allGames[3],
                        betking: allGames[4]
                    };

                    console.log(allGames)

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
}

module.exports = Helper;
