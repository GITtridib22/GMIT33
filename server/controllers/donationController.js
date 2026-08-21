const Donation = require('../models/Donation');
const Shelter = require('../models/Shelter');
const { getDrivingRoute } = require('../services/routingService');

// Default shelf life: 2 hours if not provided
const DEFAULT_SHELF_LIFE_HOURS = 2;
const MAX_SEARCH_RADIUS_METERS = 8000; // 8km

// POST /api/donations
// Creates donation, matches optimal shelter based on constraints
const createDonation = async (req, res) => {
  try {
    const { donorName, foodCategory, quantityServings, dietaryType, address, location, shelfLifeHours } = req.body;

    const hours = shelfLifeHours || DEFAULT_SHELF_LIFE_HOURS;
    const expiresAt = new Date(Date.now() + hours * 3600 * 1000);

    const donation = new Donation({
      donorName,
      foodCategory,
      quantityServings,
      dietaryType,
      address,
      location,
      expiresAt,
      status: 'AVAILABLE'
    });

    // Save initially (in case matching takes time or fails, we have it recorded)
    await donation.save();

    // Find eligible shelters
    const eligibleShelters = await Shelter.find({
      location: {
        $near: {
          $geometry: donation.location,
          $maxDistance: MAX_SEARCH_RADIUS_METERS
        }
      },
      currentDemandServings: { $gt: 0 },
      acceptedDietary: { $in: [dietaryType, 'Any'] }
    });

    if (eligibleShelters.length === 0) {
      req.io.emit('donation:new', { donation, message: 'No eligible shelters found within radius.' });
      return res.status(201).json({ message: 'Donation created, but no eligible shelters found currently.', donation });
    }

    let bestMatch = null;
    let bestRoute = null;

    // Remaining time in seconds before it spoils
    const remainingTimeToSpoil = (expiresAt.getTime() - Date.now()) / 1000;
    
    // Evaluate shelters
    for (const shelter of eligibleShelters) {
      try {
        const routeInfo = await getDrivingRoute(donation.location.coordinates, shelter.location.coordinates);
        
        // Time safety condition: route duration must be less than 60% of remaining shelf life
        if (routeInfo.durationSeconds < (remainingTimeToSpoil * 0.6)) {
          bestMatch = shelter;
          bestRoute = routeInfo;
          break; // Since $near sorts by distance, the first one satisfying time is generally optimal
        }
      } catch (err) {
        console.error(`Skipping shelter ${shelter.name} due to routing error:`, err.message);
        continue;
      }
    }

    if (bestMatch && bestRoute) {
      donation.status = 'MATCHED';
      donation.matchedShelter = bestMatch._id;
      donation.routeGeometry = bestRoute.geometry;
      await donation.save();

      req.io.emit('donation:new', { donation, shelter: bestMatch, route: bestRoute });
      return res.status(201).json({ message: 'Donation matched successfully', donation, shelter: bestMatch });
    } else {
      req.io.emit('donation:new', { donation, message: 'Shelters found, but none met the time-safety constraint.' });
      return res.status(201).json({ message: 'Donation created, but no shelters met the time constraints.', donation });
    }

  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/donations
const getDonations = async (req, res) => {
  try {
    const donations = await Donation.find({}).populate('matchedShelter').populate('assignedVolunteer');
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDonation,
  getDonations
};
