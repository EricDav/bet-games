const express = require('express');
const helper = require('./Helper');
const bodyParser = require('body-parser');
const cors = require('cors')
const cron = require('node-cron');

const app = express();

const port = 4000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

app.use(cors())

cron.schedule('*/6 * * * *', () => {
    try {
        console.log('Cron started......');
        helper.fetchBabyFixtures(null);
        helper.fetchBabyResult(null);
        console.log('Cron ended......');
    } catch(e) {
        console.log(e, 'Error occured')
    }
});

app.get('/health', (req, res) => {
    try {
        res.send({message: 'Server is healthy hurray!', success: true});
    } catch (e) {
        res.send({message: 'Server not healthy sad!', success: false});
    }
});

app.get('/bet9ja/:bookingCode', (req, res) => {
    try {
        helper.getGameFromBet9jaBookingCode(req.params.bookingCode, res);
    } catch (e) {
        res.send({});
    }
});

app.get('/soccer24/live-score', (req, res) => {
    try {
        helper.getLiveScoresFromSoccer24(res);
    } catch (e) {
        res.send({});
    }
});

app.get('/soccer24/live-score/:matchId', (req, res) => {
    try {
        helper.getMatchDetails(req.params.matchId, res);
    } catch (e) {
        res.send({});
    }
});

app.get('/gen-booking-code/:betslip', (req, res) => {
    try {
        helper.getBookingCodeFromBetslip(req.params.betslip, res);
    } catch (e) {
        res.send({});
    }
});

app.get('/riskless', (req, res) => {
    try {
        helper.getRiskless(req.query.competition_id,req.query.amount, res);
    } catch (e) {
        res.send({});
    }
});

app.get('/zoom-fixtures', (req, res) => {
    try {
        helper.getZoomFixtures(res, req.query.country);
    } catch (e) {
        res.send({success: false, data: {}});
    }
});

app.get('/zoom-scores', (req, res) => {
    try {
        helper.getZoomScores(res, req.query.country);
    } catch (e) {
        res.send({success: false, data: {}});
    }
});

app.post('/play-code/:country', (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        helper.getPlayedBookingCode(data, res, req.params.country);
    } catch (e) {
        console.log(e);
        res.send({success: false, data: {}});
    }
});

app.get('/play', (req, res) => {
    try {
        const bookingNumber = req.query.bookingCode;
        const username = req.query.username;
        const password = req.query.password;
        const amount = req.query.amount;

        helper.playBookingCode(bookingNumber, username, password, amount, res);
    } catch (e) {
        return res.send({success: false, data: {}});
    }
});

app.get('/baby/fixtures', (req, res) => {
    try {
        helper.fetchBabyFixtures(res);
    } catch (e) {
        console.log(e);
        res.send({success: false, data: {}});
    }
});


app.get('/baby/results', (req, res) => {
    try {
        helper.fetchBabyResult(res);
    } catch (e) {
        console.log(e);
        res.send({success: false, data: {}});
    }
});

app.listen(process.env.PORT || port, () => console.log(`Hello world app listening on port ${port}!`));
