const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const SCHEMA_FILE_PATH = 'schema.sql';

// Function to connect to the database
function connect_DB() {
    return new sqlite3.Database("/tmp/minitwit.db"); // put either /tmp/minitwit.db or ./minitwit.db to run temporary db or db saved from flask app
}

// Function to initialize the database tables
function init_DB() {
    try {
        let db = connect_DB();
        const schema = fs.readFileSync('schema.sql', 'utf-8');
        db.exec(schema);
        db.close();
    } catch (error) {
        console.log(error);
    }
}

// Function to query data from database
const query = (sql, params = [], one = false) => {
    return new Promise((resolve, reject) => {
        let db = connect_DB();
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                db.close();
            } else {
                if (rows.length > 0 && one) {
                    // Then return only first result
                    resolve(rows[0]);
                    db.close();
                } else {
                    resolve(rows);
                    db.close();
                }
            }
        });
    });
};

// Function to execute/add data to the database
const execute = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        let db = connect_DB();
        db.run(sql, params, (err) => {
            if (err) {
                reject(err);
                db.close();
            } else {
                resolve();
                db.close();
            }
        });
    });
};

const get_user_id = async (username) => {
    const user = await query('SELECT user_id FROM user WHERE username = ?', [username], true);
    return user ? user.user_id : null;
  };
  


module.exports = { connect_DB, init_DB, query, execute, get_user_id };
