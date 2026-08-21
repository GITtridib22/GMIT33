const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Donation = require('../models/Donation');
const Shelter = require('../models/Shelter');
const Volunteer = require('../models/Volunteer');

// Load env vars
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    await Donation.deleteMany();
    await Shelter.deleteMany();
    await Volunteer.deleteMany();

    console.log('Database cleared!');

    // Note: Coordinates are [longitude, latitude]
    
    // Create Shelters
    const shelters = await Shelter.insertMany([
      {
        name: 'Downtown Community Kitchen',
        contactPhone: '555-0101',
        maxCapacityServings: 500,
        currentDemandServings: 150,
        acceptedDietary: ['Any', 'Veg', 'Non-Veg'],
        address: '100 Main St, Cityville',
        location: { type: 'Point', coordinates: [-73.935242, 40.730610] }, // NY approx
        operatingHours: { open: '06:00', close: '20:00' }
      },
      {
        name: 'Uptown Safe Haven',
        contactPhone: '555-0202',
        maxCapacityServings: 200,
        currentDemandServings: 50,
        acceptedDietary: ['Veg'],
        address: '200 High St, Cityville',
        location: { type: 'Point', coordinates: [-73.950000, 40.800000] },
        operatingHours: { open: '08:00', close: '22:00' }
      },
      {
        name: 'Riverside Shelter',
        contactPhone: '555-0303',
        maxCapacityServings: 300,
        currentDemandServings: 100,
        acceptedDietary: ['Any'],
        address: '300 River Rd, Cityville',
        location: { type: 'Point', coordinates: [-74.000000, 40.750000] },
        operatingHours: { open: '00:00', close: '23:59' }
      }
    ]);
    console.log('Shelters inserted!');

    // Create Volunteers
    const volunteers = await Volunteer.insertMany([
      {
        name: 'Alice Smith',
        phone: '555-1001',
        status: 'IDLE',
        location: { type: 'Point', coordinates: [-73.940000, 40.740000] }
      },
      {
        name: 'Bob Jones',
        phone: '555-1002',
        status: 'IDLE',
        location: { type: 'Point', coordinates: [-73.990000, 40.720000] }
      }
    ]);
    console.log('Volunteers inserted!');

    // Not seeding donations as they should be created via the API to trigger matching logic

    console.log('Data seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
