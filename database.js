const mysql = require('mysql');
const { config } = require('./config');
const util = require('util');
const connection = mysql.createPool({
  connectionLimit: 100, //important
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database
});


const query = util.promisify(connection.query).bind(connection);

module.exports = {
    query
}