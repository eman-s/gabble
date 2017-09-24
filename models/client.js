const {Client} = require('pg');

const client = new Client({
  username: '36chambers',
  host: 'localhost',
  database: 'stackledb',
  password: '',
  port: 5432
})

client.connect();

module.exports = client;
