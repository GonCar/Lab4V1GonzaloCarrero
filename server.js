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
    const username = req.body.username;
    const password = req.body.password;
  
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