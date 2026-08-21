const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  vehicleType: { 
    type: String, 
    enum: ['Bike', 'Scooter', 'Car', 'Van'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['IDLE', 'BUSY'], 
    default: 'IDLE' 
  },
  activeDonation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
}, { timestamps: true });

// GeoJSON 2dsphere index
volunteerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Volunteer', volunteerSchema);
