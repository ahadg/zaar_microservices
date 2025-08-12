const express = require('express');
const router = express.Router();
const { getInvoicesByVendorAndStatus,getInvoiceById } = require('../controller/invController');

router.get('/invoices', getInvoicesByVendorAndStatus); // Route: GET /vendors
router.get('/invoices/:invoice_id', getInvoiceById);
module.exports = router;
