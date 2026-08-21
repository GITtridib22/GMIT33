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

    // Create Shelters (Kolkata Coordinates)
    await Shelter.insertMany([
      {
        name: 'Missionaries of Charity',
        contactPerson: 'Sister Mary',
        contactPhone: '033-2249-7115',
        maxCapacityServings: 500,
        currentDemandServings: 150,
        acceptedDietary: ['Any', 'Veg', 'Non-Veg'],
        address: '54A, Acharya Jagadish Chandra Bose Rd, Kolkata',
        location: { type: 'Point', coordinates: [88.3752, 22.5414] },
        operatingHours: { open: '06:00', close: '20:00' }
      },
      {
        name: 'Salt Lake Community Hall',
        contactPerson: 'Rahul Das',
        contactPhone: '033-2334-0000',
        maxCapacityServings: 200,
        currentDemandServings: 50,
        acceptedDietary: ['Veg'],
        address: 'Sector III, Salt Lake, Kolkata',
        location: { type: 'Point', coordinates: [88.4120, 22.5850] },
        operatingHours: { open: '08:00', close: '22:00' }
      },
      {
        name: 'Newtown Hope Center',
        contactPerson: 'Anita Sen',
        contactPhone: '033-2324-1111',
        maxCapacityServings: 300,
        currentDemandServings: 100,
        acceptedDietary: ['Any'],
        address: 'Action Area I, Newtown, Kolkata',
        location: { type: 'Point', coordinates: [88.4680, 22.5780] },
        operatingHours: { open: '00:00', close: '23:59' }
      }
    ]);
    console.log('Shelters inserted!');

    // Create Volunteers (Kolkata Coordinates)
    await Volunteer.insertMany([
      {
        name: 'Alice Smith',
        phone: '9876543210',
        vehicleType: 'Bike',
        status: 'IDLE',
        location: { type: 'Point', coordinates: [88.4312, 22.5726] } // Sector V
      },
      {
        name: 'Bob Jones',
        phone: '8765432109',
        vehicleType: 'Van',
        status: 'IDLE',
        location: { type: 'Point', coordinates: [88.3639, 22.5535] } // Park Street
      }
    ]);
    console.log('Volunteers inserted!');

    console.log('Data seeding completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
