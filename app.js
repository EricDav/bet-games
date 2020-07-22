const express = require('express');
const helper = require('./Helper');
const bodyParser = require('body-parser');

const app = express();

const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/bet9ja/:bookingCode', (req, res) => {
    // console.log(req.params.bookingCode);
    try {
        helper.getGameFromBet9jaBookingCode(req.params.bookingCode, res);
    } catch (e) {
        res.send({});
    }
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));


