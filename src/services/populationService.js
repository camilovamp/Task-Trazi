const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

const CSVFilePath = path.join(__dirname, '../../data/city_populations.csv');
const dbFilePath = path.join(__dirname, '../../data/populations.db');


const db = new sqlite3.Database(dbFilePath, sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the database');
    }
});

// Service function to get population data by state and city
function getPopulationByStateAndCity(state, city) {
  return new Promise((resolve, reject) => {
    const stateKey = state.toLowerCase();
    const cityKey = city.toLowerCase();

    db.get('SELECT population FROM population WHERE state = ? AND city = ?', [stateKey, cityKey], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error('Population data not found'));
      } else {
        resolve(row.population);
      }
    });
  });
}

function updatePopulationByStateAndCity(state, city, population) {
  return new Promise((resolve, reject) => {
    const stateKey = state.toLowerCase();
    const cityKey = city.toLowerCase();

    // Check if data exists for the given state and city
    db.get(
      'SELECT population FROM population WHERE state = ? AND city = ?',
      [stateKey, cityKey],
      (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        if (row) {
          // Data exists, update it
          db.run(
            'UPDATE population SET population = ? WHERE state = ? AND city = ?',
            [population, stateKey, cityKey],
            (updateErr) => {
              if (updateErr) {
                reject(updateErr);
              } else {
                resolve(200); // Data updated
              }
            }
          );
        } else {
          // Data does not exist, insert it
          db.run(
            'INSERT INTO population (state, city, population) VALUES (?, ?, ?)',
            [stateKey, cityKey, population],
            (insertErr) => {
              if (insertErr) {
                reject(insertErr);
              } else {
                resolve(201); // Data created
              }
            }
          );
        }
      }
    );
  });
}


async function loadPopulationData() {

    const rowCount = await new Promise((resolve) => {
      db.get('SELECT COUNT(*) AS count FROM population', (err, row) => {
        if (err) {
          console.error(err);
          resolve(0);
        } else {
          resolve(row.count);
        }
      });
    });
    if (rowCount === 0) {
      // Import data from CSV file
      const csvData = await fs.readFile(CSVFilePath, 'utf8');
      csvData
        .split('\n')
        .forEach((line) => {
          const [city, state, population] = line.split(',');
          const stateKey = state.trim().toLowerCase();
          const cityKey = city.trim().toLowerCase();
  
          db.run('INSERT INTO population (state, city, population) VALUES (?, ?, ?)', [stateKey, cityKey, population]);
        });
    }
  }

module.exports = {
    loadPopulationData,
    getPopulationByStateAndCity,
    updatePopulationByStateAndCity,
};
