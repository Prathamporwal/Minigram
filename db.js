const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "instagram_mini",
});

db.connect((err) => {
  if (err) {
    console.log("db error");
  } else {
    console.log("db connected");
  }
});

module.exports = db;
