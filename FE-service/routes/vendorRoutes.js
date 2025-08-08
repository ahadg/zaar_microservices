const express = require('express');
const router = express.Router();
const { getAllVendors } = require('../controller/vendorController');

router.get('/vendors', getAllVendors); // Route: GET /vendors

module.exports = router;
