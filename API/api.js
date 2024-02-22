const express = require('express');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const {init_DB, connect_DB, query, get_user_id } = require('../dbUtils');

// Configuration
const DEBUG = true;

const app = express();






//@before_request
app.use((req, res, next) => {
    req.db = connect_DB(); // Attach database connection to request object
    // TODO: add more
    next();
});

//@after_request
app.use((req, res, next) => {
    res.on('finish', () => {
        req.db.close();
    });
    next();
});




function not_req_from_simulator(req, res, next) {
    const fromSimulator = req.headers.authorization;
    if (fromSimulator !== "Basic c2ltdWxhdG9yOnN1cGVyX3NhZmUh") {
        const error = "You are not authorized to use this resource!";
        return res.status(403).json({ status: 403, error_msg: error });
    }
    next();
}

// Example route
app.get('/example', (req, res) => {
    // Access database connection using req.db
    req.db.serialize(() => {
        req.db.run('CREATE TABLE lorem (info TEXT)')
        const stmt = req.db.prepare('INSERT INTO lorem VALUES (?)')

        for (let i = 0; i < 10; i++) {
          stmt.run(`Ipsum ${i}`)
        }
      
        stmt.finalize()
      
        req.db.each('SELECT rowid AS id, info FROM lorem', (err, row) => {
          console.log(`${row.id}: ${row.info}`)
        })
    });
    res.send('Response');
});



app.listen(5001, () => {
    console.log('Listening on port 5001')
  })