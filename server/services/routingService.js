const axios = require('axios');

/**
 * Fetches driving route from OSRM public API.
 * @param {Array} originCoords - [longitude, latitude]
 * @param {Array} destCoords - [longitude, latitude]
 * @returns {Object} { distanceMeters, durationSeconds, geometry }
 */
const getDrivingRoute = async (originCoords, destCoords) => {
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=full&geometries=geojson`;
    const response = await axios.get(osrmUrl);
    
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distanceMeters: route.distance,
        durationSeconds: route.duration,
        geometry: route.geometry
      };
    } else {
      throw new Error('No route found from OSRM');
    }
  } catch (error) {
    console.error('Error fetching route from OSRM:', error.message);
    // Graceful fallback or re-throw depending on requirements
    throw new Error('Routing service unavailable');
  }
};

module.exports = {
  getDrivingRoute
};
