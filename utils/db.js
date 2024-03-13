const fs = require('fs');
const { Pool } = require('pg');

// PostgreSQL

const ca_file = fs.readFileSync('utils/ca-certificate.crt');
const SCHEMA_FILE_PATH = 'schema_postgres.sql';
const connectionstring_data = fs.readFileSync('utils/db_connectionstring.json', 'utf-8');
const connectionstring = JSON.parse(connectionstring_data);
connectionstring.ssl = { ca: ca_file };

const pool = new Pool(connectionstring);
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
