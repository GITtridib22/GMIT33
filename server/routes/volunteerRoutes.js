const express = require('express');
const router = express.Router();
const { 
  createVolunteer, 
  getVolunteers, 
  claimDonation, 
  deliverDonation 
} = require('../controllers/volunteerController');

router.route('/')
  .post(createVolunteer)
  .get(getVolunteers);

router.post('/donations/:id/claim', claimDonation);
router.post('/donations/:id/deliver', deliverDonation);

module.exports = router;
