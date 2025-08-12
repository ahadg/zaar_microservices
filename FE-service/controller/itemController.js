const Item = require('./../models/itemModel');

const getItemsByCategory = async (req, res) => {
  try {
    const { categoryId, page = 1, limit = 10 } = req.query;

    if (!categoryId) {
      return res.status(400).json({ message: 'categoryId is required' });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find({ categoryId, status: 'active' })
        .skip(skip)
        .limit(limitNum),
      Item.countDocuments({ categoryId, status: 'active' })
    ]);

    res.status(200).json({
      message: 'Items retrieved successfully',
      data: items,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const softDeleteItem = async (req, res) => {
  try {
    const { itemCode } = req.params;

    if (!itemCode) {
      return res.status(400).json({ message: 'itemCode is required' });
    }

    const item = await Item.findOneAndUpdate(
      { itemCode },
      { status: 'inactive' },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json({
      message: 'Item soft deleted (status set to inactive)',
      status: "inactive"
    });
  } catch (error) {
    console.error('Error soft deleting item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateItemCommission = async (req, res) => {
  try {
    const { itemCode, commission_rate, reason } = req.body;

    if (!itemCode || !commission_rate || !reason) {
      return res.status(400).json({ message: 'itemCode, commission_rate, and reason are required' });
    }

    const item = await Item.findOne({ itemCode });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Get the last update date from history, or use created_at if no history exists
    const lastUpdateDate = item.history.length > 0 
      ? item.history[item.history.length - 1].to_date 
      : (item.created_at ? item.created_at.toISOString().split('T')[0] : today);

    // Add current commission rate to history
    item.history.push({
      from_date: lastUpdateDate,
      to_date: today,
      reason,
      commision_value: parseFloat(item.commission_rate || 0),
      updated_by: req.user ? req.user._id : 'system'
    });

    // Update item's commission rate
    item.commission_rate = commission_rate;

    await item.save();

    res.status(200).json({ 
      message: 'Item commission updated successfully', 
      data: item
    });
  } catch (error) {
    console.error('Error updating item commission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getItemsByCategory,
  softDeleteItem,
  updateItemCommission
};
