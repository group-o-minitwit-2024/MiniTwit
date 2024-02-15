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

module.exports = { connectDB, initDB };
