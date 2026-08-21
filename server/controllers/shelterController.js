const Shelter = require('../models/Shelter');

// GET /api/shelters
// Get all shelters
const getShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find({});
    res.json(shelters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/shelters
// Create a new shelter
const createShelter = async (req, res) => {
  try {
    const { name, contactPhone, maxCapacityServings, currentDemandServings, acceptedDietary, address, location, operatingHours } = req.body;
    
    const shelter = new Shelter({
      name,
      contactPhone,
      maxCapacityServings,
      currentDemandServings,
      acceptedDietary,
      address,
      location,
      operatingHours
    });

    const createdShelter = await shelter.save();
    res.status(201).json(createdShelter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getShelters,
  createShelter
};
