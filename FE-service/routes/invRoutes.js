const express = require('express');
const router = express.Router();
const { getInvoicesByVendorAndStatus } = require('../controller/invController');

router.get('/invoices', getInvoicesByVendorAndStatus); // Route: GET /vendors

module.exports = router;
