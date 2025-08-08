const Vendor = require('../models/vendorModel'); // Adjust path as needed

// GET /vendors - Get all vendors
const getAllVendors = async (req, res) => {
  try {
    const { name, email, number, country, vendor_id } = req.query;

    // Build dynamic filter object
    const filter = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' }; // case-insensitive partial match
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }
    if (number) {
      filter.number = { $regex: number, $options: 'i' };
    }
    if (country) {
          filter.country = { $regex: country, $options: 'i' };
    }
    if (vendor_id) {
          filter.vendor_id = vendor_id // Exact match for vendor_id
    }
    const vendors = await Vendor.find(filter); // Will return all if filter is empty
    res.status(200).json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Failed to retrieve vendors' });
  }
};


module.exports = {
  getAllVendors
};
