const express = require('express');
const router = express.Router();
const { createShelter, getShelters } = require('../controllers/shelterController');

router.route('/')
  .post(createShelter)
  .get(getShelters);

module.exports = router;
