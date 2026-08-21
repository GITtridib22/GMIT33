const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Donation = require('../models/Donation');

dotenv.config();

const testV3 = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const donation = new Donation({
      donorName: "Grand Celebration Banquet",
      donorPhone: "+91 98765 43210",
      foodCategory: "Cooked Meals",
      exactFoodItems: ["Paneer Butter Masala", "Jeera Rice", "Dal Makhani", "Gulab Jamun"],
      quantityServings: 180,
      containerDetails: {
        size: "Extra Large",
        quantity: 2
      },
      dietaryType: ["Veg", "Jain"],
      address: "Sector V, Salt Lake, Kolkata",
      location: {
        type: "Point",
        coordinates: [88.4330, 22.5740]
      },
      shelfLifeHours: 4,
      expiresAt: new Date(Date.now() + 4 * 3600 * 1000)
    });

    await donation.save();
    console.log('Successfully inserted a V3 Donation into MongoDB!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

testV3();
