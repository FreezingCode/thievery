const Pool = require("pg").Pool;

const pool = new Pool({
    user: 'dkensjgiypvatb',
    password: '',
    database: 'drs7kroi3abf8',
    host: 'ec2-3-227-15-75.compute-1.amazonaws.com',
    port: 5432
});

module.exports = pool;