const express = require('express');
const router = express.Router();
const {
  getCommissionsByVendor,
  softDeleteCommission,
  updateCommissionPolicy
} = require('../controller/comissionController');

router.get('/commissions', getCommissionsByVendor);
router.delete('/commissions/:commission_id', softDeleteCommission);
router.put('/commissions', updateCommissionPolicy);

module.exports = router;
