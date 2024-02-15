var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// Refactored packages
const flash = require('express-flash');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
var expressLayouts = require('express-ejs-layouts');
const bcrypt = require('bcrypt');
const { connectDB, initDB } = require('./dbUtils');

// Configuration
const DATABASE = './minitwit.db';
const PER_PAGE = 30;
const SECRET_KEY = 'development key';

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Session
app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

// Setup
app.use(expressLayouts);
app.set('layout', 'layout.ejs');
app.use(logger('dev'));
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Refactor
const db = connectDB(DATABASE);
app.locals.user = null; // just forces layout.ejs to render. Should be refactored properly.

// initDB(DATABASE) // Calling this function deletes the database to start from a scratch, so be sure to specify proper file path

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
  });
};

const get_user_id = async (username) => {
  const rows = await query('SELECT user_id FROM user WHERE username = ?', [username]);
  return rows.length ? rows[0].user_id : null;
};

const format_datetime = (timestamp) => {
  return new Date(timestamp * 1000).toISOString().replace(/T/, ' ').replace(/\..+/, '');
};

// Add datetimeformat function to locals object, so it can be called in .ejs views
app.locals.format_datetime = format_datetime;


// Routes
app.get('/', async (req, res) => {
  // Implement your logic here
  try {
    console.log("We got a visitor from: ", req.socket.remoteAddress);

    // Implement your logic here
    let user = null;
    if (req.session && req.session.user) {
      user = await query('SELECT * FROM user WHERE user_id = ?', [req.session.user.user_id]);
    }

    if (!user) {
      return res.redirect('/public');
    }

    const offset = req.query.offset || 0;
    const messages = await query(`
        SELECT message.*, user.* FROM message
        INNER JOIN user ON message.author_id = user.user_id
        WHERE message.flagged = 0 AND (
            user.user_id = ? OR
            user.user_id IN (SELECT whom_id FROM follower WHERE who_id = ?)
        )
        ORDER BY message.pub_date DESC
        LIMIT ?
    `, [req.session.user.user_id, req.session.user.user_id, PER_PAGE]);

    res.render('timeline.ejs', { user: req.session.user, messages, title: "My Timeline", flashes: req.flash('success'), endpoint: "user_timline" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/public', async (req, res) => {
  // Implement your logic here
  try {
    // Implement your logic here
    const messages = await query(`
        SELECT message.*, user.* FROM message
        INNER JOIN user ON message.author_id = user.user_id
        WHERE message.flagged = 0
        ORDER BY message.pub_date DESC
        LIMIT ?
    `, [PER_PAGE]);

    res.render('timeline.ejs', { user: req.session.user, messages, title: "Public Timeline", flashes: req.flash('success'), endpoint: '' });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/register', async (req, res) => {
  if (req.session.user) {
    return res.redirect('/timeline');
  }
  res.render('register.ejs', { error: null, flashes: req.flash('success') });
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password, password2 } = req.body;

    if (!username || !email || !password || !password2) {
      return res.render('register.ejs', { error: 'All fields are required', flashes: req.flash('success') });
    }

    if (password !== password2) {
      return res.render('register.ejs', { error: 'The two passwords do not match', flashes: req.flash('success') });
    }

    // Check if username is already taken
    const existingUser = await query('SELECT * FROM user WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.render('register.ejs', { error: 'The username is already taken', flashes: req.flash('success') });
    }

    // Check if email is valid
    if (!email.includes('@')) {
      return res.render('register.ejs', { error: 'You have to enter a valid email address', flashes: req.flash('success') });
    }

    // Insert user into the database
    const hashedPassword = await bcrypt.hashSync(password, 10);
    //const userId = uuidv4(); // Generate a unique user ID
    await execute('INSERT INTO user (username, email, pw_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]);

    req.flash('success', 'You were successfully registered and can login now');
    res.redirect('/login');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/timeline');
  }
  res.render('login.ejs', { user: req.session.user, error: null, flashes: req.flash('success') });
});

app.post('/login', async (req, res) => {
  // Implement your logic here
  try {
    const { username, password } = req.body;

    // Query the user from the database
    const user = await query('SELECT * FROM user WHERE username = ?', [username]);

    if (!user) {
      return res.render('login.ejs', { error: 'Invalid username', flashes: req.flash('success') });
    }

    // Check if password matches
    const passwordMatch = await bcrypt.compareSync(password, user[0].pw_hash);

    if (!passwordMatch) {
      return res.render('login.ejs', { error: 'Invalid password', flashes: req.flash('success') });
    }

    // Set user session
    req.session.user = user[0];
    req.session.save();

    req.flash('success', 'You were logged in');
    res.redirect('/');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/logout', async (req, res) => {
  req.flash('success', 'You were logged out');
  delete req.session.user;
  res.redirect('/public');
});

app.post('/add_message', async (req, res) => {
  // Check if user is authenticated
  if (!req.session.user) {
    res.status(401).send('Unauthorized');
    return;
  }

  const text = req.body.text;

  if (!text) {
    res.status(400).send('Bad Request');
    return;
  }
  try {
    // Insert message into the database
    const result = await execute(
      'INSERT INTO message (author_id, text, pub_date, flagged) VALUES (?, ?, ?, 0)',
      [req.session.user.user_id, text, Math.floor(Date.now() / 1000)]
    );

    req.flash('success', 'Your message was recorded');
    res.redirect('/');
  } catch (error) {
    console.error('Error inserting message:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/:username', async (req, res) => {
  try {
    // Retrieve the profile user from the database
    let profile_user = await query(
      'SELECT * FROM user WHERE username = ?',
      [req.params.username]
    );

    // If profile_user is not found, return 404
    if (!profile_user) {
      res.status(404).send('User not found');
      return;
    }
    profile_user = profile_user[0];
    let followed = false;

    // Check if the logged-in user follows the profile user
    if (req.session.user) {
      const follower = await query(
        'SELECT 1 FROM follower WHERE who_id = ? AND whom_id = ?',
        [req.session.user.user_id, profile_user.user_id]
      );

      followed = follower.length > 0 ? true : false;
    }

    // Fetch messages for the profile user
    const messages = await query(
      `SELECT message.*, user.* FROM message JOIN user 
       ON user.user_id = message.author_id 
       WHERE user.user_id = ? 
       ORDER BY message.pub_date DESC 
       LIMIT ?`,
      [profile_user.user_id, PER_PAGE]
    );

    // Render the timeline template with messages and other data
    res.render('timeline.ejs', {
      messages: messages,
      followed: followed,
      user: req.session.user,
      profile_user: profile_user,
      title: profile_user.username + "'s Timeline",
      flashes: req.flash('success'),
      endpoint: 'user_timeline'
    });
  } catch (error) {
    console.error('Error fetching user timeline:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/:username/follow', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).send('Unauthorized');
    }

    // Get whom_id from the database
    const username = req.params.username;
    const whom_id = await get_user_id(username);
    if (!whom_id) {
      return res.status(404).send('User not found');
    }

    // Insert into follower table
    await execute('insert into follower (who_id, whom_id) values (?, ?)', [req.session.user.user_id, whom_id]);
    req.flash('success', `You are now following "${username}"`);
    res.redirect(`/${username}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/:username/unfollow', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.user) {
      return res.status(401).send('Unauthorized');
    }

    // Get whom_id from the database
    const username = req.params.username;
    const whom_id = await get_user_id(username);
    if (!whom_id) {
      return res.status(404).send('User not found');
    }

    // Delete from follower table
    await execute('delete from follower where who_id=? and whom_id=?', [req.session.user.user_id, whom_id]);
    req.flash('success', `You are no longer following "${username}"`);
    res.redirect(`/${username}`);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(5000, () => {
  console.log('Minitwit running at port :5000')
})


module.exports = app;


