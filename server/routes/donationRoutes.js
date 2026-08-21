const express = require('express');
const router = express.Router();
const { createDonation, getDonations } = require('../controllers/donationController');

router.route('/')
  .post(createDonation)
  .get(getDonations);

module.exports = router;
