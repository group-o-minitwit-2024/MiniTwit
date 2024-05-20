const fs = require('fs');
const { Pool } = require('pg');

// Import the sequlize functionality
const { Account, Message, Follower } = require('./sequilize');
const { Sequelize } = require('sequelize');


// PostgreSQL
let pool = new Pool();
const SCHEMA_FILE_PATH = 'src/utils/schema_postgres.sql';
const dbConnectionType = process.env.DB_CONNECTION_TYPE;

if (dbConnectionType === 'dev_db') {
  pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
  });
    
} else if (dbConnectionType === 'prod') {
  const ca_file = fs.readFileSync('/express-docker/secrets/ca-certificate.crt');
  const connectionstring_data = fs.readFileSync('/express-docker/secrets/db_connectionstring.json', 'utf-8');
  const connectionstring = JSON.parse(connectionstring_data);
  connectionstring.ssl = { ca: ca_file };
    
  pool = new Pool(connectionstring);
}

let attempt = 0;
const maxAttempts = 5;

function connectWithRetry() {
  pool.connect(function (err, client, done) {
    if (err) {
      if (attempt < maxAttempts) {
        attempt++;
        console.log(`Connection attempt ${attempt} failed. Retrying...`);
        return setTimeout(connectWithRetry, 1000); // Retry after 1 second
      }
      throw err;
    }

    console.log('Connected!');
    // Release the connection when done (assuming 'done' is a callback)
    done();
    // Your code using the client goes here
  });
}

connectWithRetry();


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
};

const execute = async (sql, params = []) => {
  try {
    await pool.query(sql, params);
  } catch (error) {
    console.error(error);
  }
};

const get_user_id = async (username) => {
    const user = await Account.findOne({
        attributes: ['user_id'],
        where: {
          username: username
        }
      });
    return user ? user.user_id : null;
};



module.exports = { pool, init_DB, query, execute, get_user_id };
