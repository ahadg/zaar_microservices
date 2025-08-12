const Policy = require('./../models/policyModel');
const { v4: uuidv4 } = require('uuid');


const deletePolicy = async (req, res) => {
  try {
    const { policy_id } = req.params;

    if (!policy_id) {
      return res.status(400).json({ message: 'Policy ID is required' });
    }

    const policy = await Policy.findOneAndUpdate(
      { policy_id },
      { status: 'inactive' },
      { new: true }
    );

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    res.status(200).json({
      message: 'Policy soft deleted successfully',
      data: policy
    });
  } catch (error) {
    console.error('Error in soft deleting policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


/**
 * Create a new policy
 * POST /policies
 */
const createPolicy = async (req, res) => {
  try {
    const { vendor_id, policy, comments, no_of_days } = req.body;

    // Basic validation
    if (!vendor_id || !policy || !no_of_days) {
      return res.status(400).json({ message: 'vendor_id, policy, and no_of_days are required' });
    }
    const now = new Date();
    const dateOnly = now.toISOString().split('T')[0];


    // Create new policy object
    const newPolicy = new Policy({
      vendor_id,
      policy_id: `POLICY_${uuidv4().slice(0, 8)}`, // or use uuidv4() alone if preferred
      date:dateOnly,
      policy,
      comments,
      no_of_days,
      created_at: now,
      status: 'active',
      history: [] 
    });

    // Save to DB
    const savedPolicy = await newPolicy.save();

    res.status(201).json({
      message: 'Policy created successfully',
      status: 'active',
    });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
/**
 * GET /policies?vendor_id=VND12345
 */
const getActivePolicies = async (req, res) => {
  try {
    const { vendor_id, page = 1, limit = 10 } = req.query;

    if (!vendor_id) {
      return res.status(400).json({ message: 'vendor_id is required' });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [policies, total] = await Promise.all([
      Policy.find({ vendor_id, status: 'active' })
        .skip(skip)
        .limit(limitNum),
      Policy.countDocuments({ vendor_id, status: 'active' })
    ]);

    res.status(200).json({
      data: policies,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    console.error('Error fetching policies:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const { policy_id, policy, reason } = req.body;

    if (!policy_id || !policy || !reason) {
      return res.status(400).json({ message: 'policy_id, policy, and reason are required' });
    }

    const existingPolicy = await Policy.findOne({ policy_id });

    if (!existingPolicy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    const now = new Date();
    const dateOnly = now.toISOString().split('T')[0];
    const toDate = new Date(dateOnly);                   // also a string
    const durationInDays = Math.floor((now - toDate) / (1000 * 60 * 60 * 24));
    // const dateOnly1 = durationInDays.toISOString().split('T')[0];
    // Add to h.toISOString().split('T')[0];istory
    existingPolicy.history.push({
      from_date: existingPolicy.date,
      to_date: dateOnly,
      duration: durationInDays,
      reason,
      updated_by: req.user ? req.user._id : 'system'
    });

    // Update fields
    existingPolicy.policy = policy;
    existingPolicy.date = dateOnly;

    await existingPolicy.save();

    res.status(200).json({ message: 'Policy updated successfully', data: existingPolicy });
  } catch (err) {
    console.error('Error updating policy:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  deletePolicy, createPolicy, getActivePolicies, updatePolicy
};
