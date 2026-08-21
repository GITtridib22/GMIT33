const Volunteer = require('../models/Volunteer');
const Donation = require('../models/Donation');
const Shelter = require('../models/Shelter');

// GET /api/volunteers
const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find({});
    res.json(volunteers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/volunteers
const createVolunteer = async (req, res) => {
  try {
    const volunteer = new Volunteer(req.body);
    const createdVolunteer = await volunteer.save();
    res.status(201).json(createdVolunteer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/volunteers/claim
// Volunteer claims a matched donation
const claimDonation = async (req, res) => {
  try {
    const { volunteerId, donationId } = req.body;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    if (volunteer.status === 'BUSY') {
      return res.status(400).json({ message: 'Volunteer is already busy' });
    }

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    
    if (donation.status !== 'MATCHED') {
      return res.status(400).json({ message: `Donation cannot be claimed. Current status: ${donation.status}` });
    }

    // Update Donation
    donation.status = 'IN_TRANSIT';
    donation.assignedVolunteer = volunteer._id;
    await donation.save();

    // Update Volunteer
    volunteer.status = 'BUSY';
    volunteer.activeDonation = donation._id;
    await volunteer.save();

    req.io.emit('donation:claimed', { donation, volunteer });

    res.json({ message: 'Donation claimed successfully', donation, volunteer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/volunteers/deliver
// Volunteer delivers the donation
const deliverDonation = async (req, res) => {
  try {
    const { volunteerId, donationId } = req.body;
    
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'IN_TRANSIT') {
      return res.status(400).json({ message: 'Donation is not in transit' });
    }

    const shelter = await Shelter.findById(donation.matchedShelter);
    if (!shelter) {
      return res.status(404).json({ message: 'Matched shelter not found' });
    }

    // Update Shelter capacity (decrease demand by the quantity delivered)
    shelter.currentDemandServings = Math.max(0, shelter.currentDemandServings - donation.quantityServings);
    await shelter.save();

    // Update Donation
    donation.status = 'DELIVERED';
    await donation.save();

    // Update Volunteer
    const volunteer = await Volunteer.findById(volunteerId || donation.assignedVolunteer);
    if (volunteer) {
      volunteer.status = 'IDLE';
      volunteer.activeDonation = null;
      await volunteer.save();
    }

    req.io.emit('donation:delivered', { donation, shelter, volunteer });

    res.json({ message: 'Donation delivered successfully', donation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVolunteers,
  createVolunteer,
  claimDonation,
  deliverDonation
};
