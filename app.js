const express = require('express');
const sqlite3 = require('sqlite3');
const cookieParser = require('cookie-parser');
//const csvParser = require('csv-parser');
const fs = require('fs').promises;

const populationService = require('./src/services/populationService');
const populationRoutes = require('./src/routes/populationRoutes');

const port = 5555;

const app = express();

const db = new sqlite3.Database('./data/populations.db', sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error('1. Error opening database:', err.message);
    } else {
      console.log('1. Connected to the database');
    }
});

// Create a table to store population data if it doesn't exist
db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS population (
        state TEXT,
        city TEXT,
        population INTEGER,
        PRIMARY KEY (state, city)
      )
    `);
  });

// Load CSV data on startup (if not already loaded)
populationService.loadPopulationData();

app.use(express.text());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/population', populationRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;