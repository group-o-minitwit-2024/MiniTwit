var createError = require('http-errors');
const express = require('express');
const fs = require('fs');
const { pool, init_DB, query, execute } = require('../utils/db');
const bcrypt = require('bcrypt');

// Configuration
const DEBUG = true;

fs.unlink("./API/latest_processed_sim_action_id.txt", (err) => {
    if (err && err.code !== 'ENOENT') {
        console.error('Error deleting latest processed file:', err);
    }
});

//init_DB();

// Create our little application :)
const app = express();



// Setup
app.use(express.json()); // allows json in http request
app.use(express.urlencoded({ extended: false })); // same


function not_req_from_simulator(req) {
    const fromSimulator = req.headers.authorization;
    if (fromSimulator !== "Basic c2ltdWxhdG9yOnN1cGVyX3NhZmUh") {
        const error = "You are not authorized to use this resource!";
        return error;
    }
    return null;
}

async function update_latest(request) {
    const parsed_command_id = request.query.latest;
    if (parsed_command_id !== -1) {
        fs.writeFile("./API/latest_processed_sim_action_id.txt", parsed_command_id.toString(), (err) => {
            if (err) {
                console.error('Error writing file:', err);
            }
        });
    }
}

// --------------- Routes ------------------_

// Get the latest value
app.get('/latest', async (req, res) => {
    fs.readFile('./API/latest_processed_sim_action_id.txt', 'utf8', (err, content) => {
        if (err) {
            res.json({ latest: -1 });
        } else {
            res.json({ latest: parseInt(content) });
        }
    });
});

// ------- Route to register a user ----------
app.post('/register', async (req, res) => {
    await update_latest(req);
    const request_data = req.body;

    let error = null;
    if (!request_data.username) {
        error = "You have to enter a username";
    } else if (!request_data.email || !request_data.email.includes('@')) {
        error = "You have to enter a valid email address";
    } else if (!request_data.pwd) {
        error = "You have to enter a password";
    } else {
        const hash_password = bcrypt.hashSync(request_data.pwd, 10)
        await execute(`INSERT INTO account (username, email, pw_hash) VALUES ($1, $2, $3)`, [
            request_data.username,
            request_data.email,
            hash_password,
        ]);
    }
    if (error) {
        res.status(400).json({ status: 400, error_msg: error });
    } else {
        res.sendStatus(204);
    }

});

// ---------- route to get messages by user -------------
app.get('/msgs/:username', async (req, res) => {
    await update_latest(req);

    const not_from_sim_response = not_req_from_simulator(req);
    if (not_from_sim_response) {
        return res.send(not_from_sim_response);
    }

    const username = req.params.username;
    const no_msgs = parseInt(req.query.no) || 100; // Default to 100 if 'no' parameter is not provided

    const user = await query("SELECT user_id FROM account where username = $1", [username], true);

    const sql = `SELECT message.*, account.* FROM message JOIN account 
                ON account.user_id = message.author_id 
                WHERE account.user_id = $1 
                ORDER BY message.pub_date DESC 
                LIMIT $2`;


    const messages = await query(sql, [user.user_id, no_msgs]);
    const filtered_msgs = messages.map(msg => ({
        content: msg.text,
        pub_date: msg.pub_date,
        user: msg.username
    }));
    res.json(filtered_msgs);
});

// ------------ Route to post a message by a given user --------------
app.post('/msgs/:username', async (req, res) => {
    await update_latest(req);

    const not_from_sim_response = not_req_from_simulator(req);
    if (not_from_sim_response) {
        return res.send(not_from_sim_response);
    }

    const username = req.params.username;
    const { content } = req.body;

    const user = await query("SELECT user_id FROM account where username = $1", [username], true);

    const sql = `INSERT INTO message (author_id, text, pub_date, flagged) VALUES ($1, $2, $3, 0)`;

    await execute(sql, [user.user_id, content, Math.floor(Date.now() / 1000)]);
    res.sendStatus(204);
})

// ------------ Route to get all messages in Database ----------------
app.get('/msgs', async (req, res) => {
    await update_latest(req);

    const not_from_sim_response = not_req_from_simulator(req);
    if (not_from_sim_response) {
        return res.status(403).json({ error: not_from_sim_response });
    }

    const no_msgs = parseInt(req.query.no, 10) || 100;

    // Query the database to get messages
    const messages = await query(`
        SELECT message.*, account.* FROM message
        INNER JOIN account ON message.author_id = account.user_id
        WHERE message.flagged = 0
        ORDER BY message.pub_date DESC
        LIMIT $1
    `, [no_msgs]);

    const filtered_msgs = messages.map(msg => ({
        content: msg.text,
        pub_date: msg.pub_date,
        user: msg.username
    }));

    return res.json(filtered_msgs);

});


// -------------- Route to get the followers of a given user ------------------
app.get('/fllws/:username', async (req, res) => {
    await update_latest(req);

    const not_from_sim_response = not_req_from_simulator(req);
    if (not_from_sim_response) {
        return res.send(not_from_sim_response);
    }

    const username = req.params.username;
    const user = await query("SELECT user_id FROM account where username = ?", [username], true);
    if (!user) {
        return res.status(404);
    }

    const no_followers = req.query.no || 100;

    const sql = `
            SELECT account.username
            FROM account
            INNER JOIN follower ON follower.whom_id = account.user_id
            WHERE follower.who_id = $1
            LIMIT $2`;


    const followers = await query(sql, [user.user_id, no_followers]);
    const follower_names = followers.map(follower => follower.username);

    return res.json({ follows: follower_names });
});


// ------------ Route to add/delete a follower --------------
app.post('/fllws/:username', async (req, res) => {
    await update_latest(req);

    const not_from_sim_response = not_req_from_simulator(req);
    if (not_from_sim_response) {
        return res.send(not_from_sim_response);
    }

    const username = req.params.username;
    const user = await query("SELECT user_id FROM account where username = $1", [username], true);
    if (!user) {
        return res.status(404);
    }

    const { follow, unfollow } = req.body;

    // ------------ CASE FOLLOW USER ------------------
    if (follow) {
        const follows_user = await query("SELECT user_id FROM account where username = $1", [follow], true);
        if (!follows_user) {
            return res.status(404).send('User to follow not found');
        }

        const sql = `INSERT INTO follower (who_id, whom_id) VALUES ($1, $2)`;
        await execute(sql, [user.user_id, follows_user.user_id]);
        return res.sendStatus(204);

        // ------------ CASE UNFOLLOW USER ------------------
    } else if (unfollow) {
        const unfollows_user = await query("SELECT user_id FROM account where username = $1", [unfollow], true);
        if (!unfollows_user) {
            return res.status(404).send('User to unfollow not found');
        }

        const sql = `DELETE FROM follower WHERE who_id = $1 AND whom_id = $2`;
        await execute(sql, [user.user_id, unfollows_user.user_id]);
        return res.sendStatus(204);


    } else {
        return res.status(400).send('Invalid request');
    }
})



app.listen(5001, () => {
    console.log('Listening on port 5001')
})