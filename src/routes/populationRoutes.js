const express = require('express');
const router = express.Router();

const populationController = require('../controllers/populationController');

// Define routes for population data
router.get('/state/:state/city/:city', populationController.getPopulation);
router.put('/state/:state/city/:city', populationController.updatePopulation);

module.exports = router;
