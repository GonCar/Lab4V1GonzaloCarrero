// Import the sqlite3 module and enable verbose mode for detailed debugging
const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database in memory. This will create a temporary database
// that is only available during the runtime of the application.
const db = new sqlite3.Database(':memory:');

// Use the serialize method to ensure that the following database operations
// are executed in a sequential manner.
db.serialize(() => {
  // Create the Users table if it does not already exist.
  // The table has four columns: userID (primary key), role, name, and password.
  db.run(`CREATE TABLE Users (
    userID TEXT PRIMARY KEY,
    role TEXT,
    name TEXT,
    password TEXT
  )`);

  // Prepare an SQL statement for inserting new rows into the Users table.
  const stmt = db.prepare("INSERT INTO Users VALUES (?, ?, ?, ?)");
  
  // Insert sample data into the Users table. Each call to stmt.run() adds a new row.
  stmt.run("id1", "student", "Mith", "pass");
  stmt.run("id2", "student", "Kim", "pan");
  stmt.run("id3", "teacher", "Anna", "tr3");
  stmt.run("admin", "admin", "Mat", "admin");
  
  // Finalize the statement to free up resources.
  stmt.finalize();
});

// Export the database object so it can be used in other modules.
module.exports = db;
