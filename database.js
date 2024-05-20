// database.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`CREATE TABLE Users (
    userID TEXT PRIMARY KEY,
    role TEXT,
    name TEXT,
    password TEXT
  )`);

  const stmt = db.prepare("INSERT INTO Users VALUES (?, ?, ?, ?)");
  stmt.run("id1", "student", "user1", "password");
  stmt.run("id2", "student", "user2", "password2");
  stmt.run("id3", "teacher", "user3", "password3");
  stmt.run("admin", "admin", "admin", "admin");
  stmt.finalize();
});

module.exports = db;
