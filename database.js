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
  stmt.run("id1", "student", "Mith", "pass");
  stmt.run("id2", "student", "Kim", "pan");
  stmt.run("id3", "teacher", "Anna", "tr3");
  stmt.run("admin", "admin", "Mat", "admin");
  stmt.finalize();
});

module.exports = db;
