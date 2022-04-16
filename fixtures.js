function initFixtures() {
    setInterval(getFixtures, 20000);
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

initFixtures()
