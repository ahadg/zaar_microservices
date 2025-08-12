const express = require('express');
const router = express.Router();
const {
  getItemsByCategory,
  softDeleteItem,
  updateItemCommission
} = require('../controller/itemController');

// GET /api/items?categoryId=123&page=1&limit=10
// Get items by category with pagination
router.get('/items', getItemsByCategory);

// DELETE /api/items/:itemCode
// Soft delete an item (set status to inactive)
router.delete('/items/:itemCode', softDeleteItem);

// PUT /api/items/commission
// Update item commission rate and save history
router.put('/items/commission', updateItemCommission);

module.exports = router;
