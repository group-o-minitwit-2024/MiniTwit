const createError = require('http-errors');
const express = require('express');
const fs = require('fs');
const { pool, init_DB, query, execute } = require('../utils/db');
const bcrypt = require('bcrypt');

// Configuration
const DEBUG = true;

// Import the sequlize functionality
const { Account, Message, Follower } = require('../sequilize.js');
const { Sequelize } = require('sequelize');


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

// Prometheus tracking
const { prometheus, prometheusMiddleware } = require('../utils/prometheus');
app.use(prometheusMiddleware);
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    const metrics = await prometheus.register.metrics();
    res.end(metrics);
});


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
        await Account.create({
            username: request_data.username,
            email: request_data.email,
            pw_hash: hash_password
          });
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

    const user = await Account.findOne({
        attributes: ['user_id'],
        where: {
          username: username
        }
      });


    // Refactored using Sequelize
    const messages = await Message.findAll({
        attributes: ['message_id', 'author_id', 'text', 'pub_date'],
        include: [{
        model: Account,
        attributes: ['user_id', 'username', 'email']
        }],
        where: {
        '$Account.user_id$': user.user_id
        },
        order: [['pub_date', 'DESC']],
        limit: no_msgs,
        raw: true
    });
    
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

    const user = await Account.findOne({
        attributes: ['user_id'],
        where: {
          username: username
        }
      });
      const newMessage = await Message.create({
        author_id: user.user_id,
        text: content,
        pub_date: Math.floor(Date.now() / 1000),
        flagged: 0
      });
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
    const messages = await Message.findAll({
        attributes: [
          'message_id',
          'author_id',
          'text',
          'pub_date',
          [Sequelize.literal('"Account"."user_id"'), 'user_id'],
          [Sequelize.literal('"Account"."username"'), 'username'],
          [Sequelize.literal('"Account"."email"'), 'email']
        ],
        include: [{
          model: Account,
          attributes: [], // Don't fetch any additional attributes from the Account model
        }],
        where: { flagged: 0 },
        order: [['pub_date', 'DESC']],
        limit: no_msgs,
        raw: true
      });

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
    const user = await Account.findOne({
        attributes: ['user_id'],
        where: {
          username: username
        }
    });
    if (!user) {
        return res.status(404).send("User not found");
    }

    const no_followers = req.query.no || 100;

    try {
        const followers = await Follower.findAll({
            attributes: [],
            where: {
                who_id: user.user_id
            },
            include: [{
                model: Account,
                attributes: ['username'],
                as: 'Follower',
                through: { attributes: [] } // Exclude the join table attributes
            }],
            limit: no_followers
        });

        const follower_names = followers.map(follower => follower.Follower.username);

        return res.json({ follows: follower_names });
    } catch (error) {
        console.error('Error fetching followers:', error);
        return res.status(500).send('Internal Server Error');
    }
});

// ------------ Route to add/delete a follower --------------
app.post('/fllws/:username', async (req, res) => {
    await update_latest(req);

    const not_from_sim_response = not_req_from_simulator(req);
    if (not_from_sim_response) {
        return res.send(not_from_sim_response);
    }

    const username = req.params.username;
    const user = await Account.findOne({
        attributes: ['user_id'],
        where: {
          username: username
        }
    });
    if (!user) {
        return res.status(404).send('User not found');
    }

    const { follow, unfollow } = req.body;

    try {
        // ------------ CASE FOLLOW USER ------------------
        if (follow) {
            const follows_user = await Account.findOne({
                attributes: ['user_id'],
                where: {
                    username: follow
                }
            });
            if (!follows_user) {
                return res.status(404).send('User to follow not found');
            }

            await Follower.create({
                who_id: user.user_id,
                whom_id: follows_user.user_id
            });
            return res.sendStatus(204);

        // ------------ CASE UNFOLLOW USER ------------------
        } else if (unfollow) {
            const unfollows_user = await Account.findOne({
                attributes: ['user_id'],
                where: {
                    username: unfollow
                }
            });
            if (!unfollows_user) {
                return res.status(404).send('User to unfollow not found');
            }

            await Follower.destroy({
                where: {
                    who_id: user.user_id,
                    whom_id: unfollows_user.user_id
                }
            });
            return res.sendStatus(204);
        } else {
            return res.status(400).send('Invalid request');
        }
    } catch (error) {
        console.error('Error processing follow/unfollow request:', error);
        return res.status(500).send('Internal Server Error');
    }
});


app.listen(5001, () => {
    console.log('Listening on port 5001')
})