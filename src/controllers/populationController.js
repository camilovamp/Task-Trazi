const populationService = require('../services/populationService');

// Controller function to get population data by state and city
async function getPopulation(req, res) {
  const { state, city } = req.params;
  try {
    const population = await populationService.getPopulationByStateAndCity(state, city);
    res.status(200).json({ population });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Controller function to update population data
async function updatePopulation(req, res) {
  const { state, city } = req.params;
  const population = req.body; 
 
try {
  
  const populationNumber = parseInt(population);
  
  if (isNaN(populationNumber)) {
    throw new Error('Invalid population value');
  }
  
  const statusCode = await populationService.updatePopulationByStateAndCity(
    state,
    city,
    populationNumber
  );
  res.status(statusCode).json({ message: 'Population data updated' });
} catch (error) {
  res.status(400).json({ error: error.message });
}
}

module.exports = {
  getPopulation,
  updatePopulation,
};
