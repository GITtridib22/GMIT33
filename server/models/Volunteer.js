const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['IDLE', 'BUSY'], 
    default: 'IDLE' 
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  }
}, { timestamps: true });

// GeoJSON 2dsphere index
volunteerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Volunteer', volunteerSchema);
