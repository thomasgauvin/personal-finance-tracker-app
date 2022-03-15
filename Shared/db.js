const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

async function openDb () {
    const db = await sqlite.open({
      filename: './db.sqlite3',
      driver: sqlite3.Database
    })

    // uncomment when creating the database and first time use
    // commented out to improve the performance for benchmarking
    db.exec(`create table if not exists accounts (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL
            );
            
            create table if not exists account_statements (
                id INTEGER PRIMARY KEY,
                date TEXT NOT NULL,
                amount REAL NOT NULL,
                account_id INTEGER NOT NULL,
                FOREIGN KEY(account_id) REFERENCES accounts(id)
            );`)


    return db;
}

module.exports = openDb;