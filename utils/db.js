const fs = require('fs');
const { Pool } = require('pg');

// PostgreSQL
let pool = new Pool();
const SCHEMA_FILE_PATH = 'schema_postgres.sql';
let run_type = process.env.RUN_TYPE || 'dev';

if (run_type === 'compose') {
    pool = new Pool({
        user: process.env.POSTGRES_USER,
        host: 'db',
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
    });
    
} else if (run_type === 'prod') {
    const ca_file = fs.readFileSync('/home/ca-certificate.crt');
    const connectionstring_data = fs.readFileSync('/home/db_connectionstring.json', 'utf-8');
    const connectionstring = JSON.parse(connectionstring_data);
    connectionstring.ssl = { ca: ca_file };
    
    pool = new Pool(connectionstring);

} else if (run_type === 'dev') {
    // IMPLEMENT ME
    throw new Error('Not implemented');
}

pool.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

// Function to initialize the database tables
async function init_DB() {
    const schema = fs.readFileSync(SCHEMA_FILE_PATH, 'utf-8');
    await pool.query(schema);
}

const query = async (sql, params = [], one = false) => {
    try {
        const result = await pool.query(sql, params);
        if (result.rows.length > 0 && one) {
            return result.rows[0];
        } else {
            return result.rows;
        }
    } catch (error) {
        console.error(error);
    }
}

const execute = async (sql, params = []) => {
    try {
        await pool.query(sql, params);
    } catch (error) {
        console.error(error);
    }
}

const get_user_id = async (username) => {
    const user = await query('SELECT user_id FROM account WHERE username = $1', [username], true);
    return user ? user.user_id : null;
};



module.exports = { pool, init_DB, query, execute, get_user_id };
