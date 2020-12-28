const express = require('express');
const helper = require('./Helper');
const bodyParser = require('body-parser');

const app = express();

const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
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
        console.log(req.query);
        helper.getRiskless(req.query.competition_id,req.query.amount, res);
    } catch (e) {
        console.log(e);
        res.send({});
    }
});

app.listen(process.env.PORT || port, () => console.log(`Hello world app listening on port ${port}!`));
