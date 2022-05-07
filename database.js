const Pool = require('pg').Pool
const { config } = require('./config');

console.log(config, 'Config....')

const pool = new Pool(config.db);

const query = async (query, params) => {
    const {rows, fields} = await pool.query(query, params);

    return rows;
}

module.exports = {
    query
}
