const Comission = require('./../models/comissionModel');
const Item = require('./../models/itemModel');

const getCommissionsByVendor = async (req, res) => {
  try {
    const { vendor_id, page = 1, limit = 10 } = req.query;

    if (!vendor_id) {
      return res.status(400).json({ message: 'vendor_id is required' });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [comissions, total] = await Promise.all([
      Comission.find({ vendor_id, status: 'active' })
        .skip(skip)
        .limit(limitNum),
      Comission.countDocuments({ vendor_id, status: 'active' })
    ]);

    res.status(200).json({
      message: 'Commission comissions retrieved successfully',
      data: comissions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching commission policies:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const softDeleteCommission = async (req, res) => {
  try {
    const { commission_id } = req.params;

    if (!commission_id) {
      return res.status(400).json({ message: 'commission_id is required' });
    }

    const comission = await Comission.findOneAndUpdate(
      { commission_id },
      { status: 'inactive' },
      { new: true }
    );

    if (!comission) {
      return res.status(404).json({ message: 'Commission comission not found' });
    }

    res.status(200).json({
      message: 'Commission comission soft deleted (status set to inactive)',
      status:"inactive"
    });
  } catch (error) {
    console.error('Error soft deleting commission:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const updateCommissionPolicy = async (req, res) => {
  try {
    const { commission_id, commision_value, reason } = req.body;

    if (!commission_id || !commision_value || !reason) {
      return res.status(400).json({ message: 'commission_id, commision_value, and reason are required' });
    }

    const commision = await Comission.findOne({ commission_id });

    if (!commision) {
      return res.status(404).json({ message: 'Commission commision not found' });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Add current value to history
    commision.history.push({
      from_date: commision.start_date,
      to_date: today,
      reason,
      commision_value: commision.commision_value,
      updated_by: req.user ? req.user._id : 'system'
    });

    // Update commission value and start date
    commision.commision_value = commision_value;
    commision.start_date = today;

    await commision.save();

    // Find all items with the same categoryId as the commission
    const items = await Item.find({ 
      categoryId: commision.category_id,
      status: 'active'
    });

    console.log(`Found ${items.length} items with categoryId: ${commision.category_id}`);

    // Update each item's commission rate and add to history
    const itemUpdatePromises = items.map(async (item) => {
      // Add current commission rate to item history
      item.history.push({
        from_date: item.created_at ? item.created_at.toISOString().split('T')[0] : today,
        to_date: today,
        reason,
        commision_value: parseFloat(item.commission_rate || 0),
        updated_by: req.user ? req.user._id : 'system'
      });

      // Update item's commission rate
      item.commission_rate = commision_value;
      
      return item.save();
    });

    // Wait for all item updates to complete
    await Promise.all(itemUpdatePromises);

    console.log(`Updated commission rate for ${items.length} items`);

    res.status(200).json({ 
      message: 'Commission policy updated successfully', 
      data: commision,
      itemsUpdated: items.length
    });
  } catch (error) {
    console.error('Error updating commission commision:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getCommissionsByVendor,
  softDeleteCommission,
  updateCommissionPolicy
};
