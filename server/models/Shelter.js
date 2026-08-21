const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPhone: { type: String, required: true },
  maxCapacityServings: { type: Number, required: true },
  currentDemandServings: { type: Number, required: true },
  acceptedDietary: [{ type: String }],
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  operatingHours: {
    open: { type: String }, // e.g., '08:00'
    close: { type: String } // e.g., '22:00'
  }
}, { timestamps: true });

// GeoJSON 2dsphere index
shelterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Shelter', shelterSchema);
