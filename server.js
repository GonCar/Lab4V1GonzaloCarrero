const express = require('express');
const app = express();
const jwt = require('jswonwebtoken');
require('dotenv').config();

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.json());

var currentKey = "";
var currentPassword = "";

const PORT = 8080;
const SECRET_KEY = process.env.TOKEN;

app.get('/', (req, res) =>{
    res.redirect("/identify");
});

app.post('/identify', (req, res) => {
    //authenticate
    const username = req.body.password;
    const token = jwt.sign(username, SECRET_KEY);
    currentKey = token;
    currentPassword = username;
    res.redirect("/granted");
})

function authenticateToken(req, res, next){
    if(currentKey == ""){
        res.redirect("/identify");
    }else if(jwt.verify(currentKey, SECRET_KEY)){
        next();
    }else{
        res.redirect('/identify');
    }
}

app.get('/granted', (req, res) => {
    res.render("start.ejs");
})

app.listen(PORT, () => {
    console.log(`Server active on port: http://localhost:${PORT}/`);
});