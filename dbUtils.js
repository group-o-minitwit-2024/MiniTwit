const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const SCHEMA_FILE_PATH = 'schema.sql';

function connectDB(database_file_path) {
    return new sqlite3.Database(database_file_path);
}

function initDB(database_file_path) {
    const db = connectDB(database_file_path);
    // Read the schema file
    const schema = fs.readFileSync(SCHEMA_FILE_PATH, 'utf-8');

    // Execute the schema script
    db.serialize(() => {
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error executing schema:', err.message);
            } else {
                console.log('Database tables deleted and created successfully.');
            }
        });
    });

    // Close the database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        }
    });
}



// ------------------------ REFACTORED VERSION ----------------------

// Function to connect to the database
function connect_DB() {
    return new sqlite3.Database("/tmp/minitwit.db");
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

const query = (sql, params = [], one = false) => {
    return new Promise((resolve, reject) => {
        let db = connect_DB();
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                if (rows.length > 0 && one) {
                    // Then return only first result
                    resolve(rows[0]);
                } else {
                    resolve(rows);
                }
            }
        });
    });
};

const get_user_id = async (username) => {
    const user_id = await query("select user_id from user where username = ?", [username], true)
    return user_id ? user_id : null;
}





module.exports = { connect_DB, init_DB, query, get_user_id, connectDB, initDB };
