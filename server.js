const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./database'); // Import the database module

dotenv.config();

const PORT = 8080;
const SECRET_KEY = process.env.TOKEN;

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Default route to redirect to identify
app.get('/', (req, res) => {
    res.redirect('/identify');
});

// Render identify page
app.get('/identify', (req, res) => {
    res.render('identify.ejs');
});

// Authenticate user
app.post('/identify', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM Users WHERE name = ? AND password = ?", [username, password], (err, user) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        if (!user) {
            return res.redirect('/identify');
        }

        const token = jwt.sign({ userID: user.userID, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/granted');
    });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/identify');
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.redirect('/identify');
        }

        req.user = user;
        next();
    });
}

// Middleware to authorize role
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.redirect('/identify');
        }
        next();
    };
}

// Render start page if authenticated
app.get('/granted', authenticateToken, (req, res) => {
    res.render("start.ejs");
});

// Render admin page if authenticated and authorized
app.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
    db.all("SELECT * FROM Users", [], (err, users) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }
        res.render('admin.ejs', { users });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server active on port: http://localhost:${PORT}/`);
});
