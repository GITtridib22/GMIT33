const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  donorPhone: { type: String, required: true },
  foodCategory: { 
    type: String, 
    enum: ['Cooked Meals', 'Bakery', 'Packaged', 'Raw Produce'],
    required: true 
  },
  exactFoodItems: [{ type: String }],
  quantityServings: { type: Number, required: true },
  containerDetails: {
    size: { type: String, enum: ['Extra Large', 'Large', 'Medium', 'Small'] },
    quantity: { type: Number }
  },
  dietaryType: [{ 
    type: String, 
    enum: ['Veg', 'Non-Veg', 'Vegan', 'Halal', 'Jain', 'Any'],
  }],
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  shelfLifeHours: { type: Number },
  preparedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['AVAILABLE', 'MATCHED', 'IN_TRANSIT', 'DELIVERED', 'EXPIRED'], 
    default: 'AVAILABLE' 
  },
  matchedShelter: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' },
  assignedVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
  routeGeometry: { type: Object } // GeoJSON LineString
}, { timestamps: true });

// GeoJSON 2dsphere index for location-based queries
donationSchema.index({ location: '2dsphere' });
// Native TTL index: Document expires and is removed at the time specified in expiresAt
donationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Donation', donationSchema);
