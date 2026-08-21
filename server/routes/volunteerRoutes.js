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

router.post('/claim', claimDonation);
router.post('/deliver', deliverDonation);

module.exports = router;
