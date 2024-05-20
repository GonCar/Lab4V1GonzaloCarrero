// Import necessary modules
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const db = require('./database'); // Import the database module

// Load environment variables from .env file
dotenv.config();

// Define constants for the server port and JWT secret key
const PORT = 8080;
const SECRET_KEY = process.env.TOKEN;

// Middleware setup
app.set('view engine', 'ejs'); // Set EJS as the template engine
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies
app.use(cookieParser()); // Parse Cookie header and populate req.cookies

// Default route to redirect to identify
app.get('/', (req, res) => {
    res.redirect('/identify'); // Redirect to the login page
});

// Render identify (login) page
app.get('/identify', (req, res) => {
    res.render('identify.ejs'); // Render the identify.ejs view
});

// Handle user authentication
app.post('/identify', (req, res) => {
    const { username, password } = req.body; // Extract username and password from the request body

    // Query the database for the user with the provided username and password
    db.get("SELECT * FROM Users WHERE name = ? AND password = ?", [username, password], (err, user) => {
        if (err) {
            return res.status(500).send('Internal Server Error'); // Handle database errors
        }
        if (!user) {
            return res.redirect('/identify'); // Redirect to login page if user not found
        }

        // Create a JWT token with the user's ID and role
        const token = jwt.sign({ userID: user.userID, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true }); // Set the token as an HTTP-only cookie
        res.redirect('/granted'); // Redirect to the granted page
    });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.cookies.token; // Get the token from cookies

    if (!token) {
        return res.redirect('/identify'); // Redirect to login page if no token
    }

    // Verify the token
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.redirect('/identify'); // Redirect to login page if token is invalid
        }

        req.user = user; // Attach the user information to the request object
        next(); // Proceed to the next middleware or route handler
    });
}

// Middleware to authorize role
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.redirect('/identify'); // Redirect to login page if role does not match
        }
        next(); // Proceed to the next middleware or route handler
    };
}

// Render start page if authenticated
app.get('/granted', authenticateToken, (req, res) => {
    const role = req.user.role; // Get the role of the authenticated user

    // Redirect to the appropriate page based on the user's role
    if (role === 'admin') {
        res.redirect('/admin');
    } else if (role === 'student') {
        if (req.user.userID === 'id1') {
            res.render('student1.ejs');
        } else if (req.user.userID === 'id2') {
            res.render('student2.ejs');
        }
    } else if (role === 'teacher') {
        res.render('teacher.ejs');
    } else {
        res.redirect('/identify');
    }
});

// Render admin page if authenticated and authorized
app.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
    // Query the database for all users
    db.all("SELECT * FROM Users", [], (err, users) => {
        if (err) {
            return res.status(500).send('Internal Server Error'); // Handle database errors
        }
        res.render('admin.ejs', { users }); // Render the admin.ejs view with the list of users
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server active on port: http://localhost:${PORT}/`); // Log server start message
});
