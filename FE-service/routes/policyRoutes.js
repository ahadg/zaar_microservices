// routes/policy.routes.js

const express = require('express');
const router = express.Router();

const {
  deletePolicy,
  createPolicy,
  getActivePolicies,
  updatePolicy
} = require('../controller/policyController');

// Create a new policy
router.post('/policies', createPolicy);

// Soft delete a policy by policy_id
router.delete('/policies/:policy_id', deletePolicy);

// Get all active policies by vendor_id
router.get('/policies', getActivePolicies);

// Update an existing policy
router.put('/policies', updatePolicy);

module.exports = router;
