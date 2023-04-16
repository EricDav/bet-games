require('dotenv').config()

const env = process.env;
const config = {
    db: { 
      host: env.PG_HOST,
      port: env.PG_PORT,
      user: env.PG_USER,
      password: env.PG_PASSWORD,
      database: env.PG_DATABASE,
      ssl: { rejectUnauthorized: false },
    },
};

module.exports =  {
  config
}
