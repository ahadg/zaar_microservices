const Invoice = require('./../models/invModel');

/**
 * GET /invoices?vendor_id=1232131&status=unpaid&page=1&limit=10
 */
const getInvoicesByVendorAndStatus = async (req, res) => {
  try {
    const { vendor_id, status, page = 1, limit = 10 } = req.query;
    console.log('Fetching invoices for vendor:', vendor_id, 'with status:', status, 'on page:', page, 'with limit:', limit);
    // Validate inputs
    if (!vendor_id || !status) {
      return res.status(400).json({ message: 'vendor_id and status are required' });
    }

    // Convert page and limit to integers
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;

    // Query filter
    const filter = {
      vendor_id: vendor_id,
      status: status
    };

    // Fetch filtered and paginated invoices
    const [invoices, total] = await Promise.all([
      Invoice.find(filter).skip(skip).limit(limitInt),
      Invoice.countDocuments(filter)
    ]);
    console.log(`Found ${invoices.length} invoices for vendor ${vendor_id} with status ${status}`);
    // Respond with paginated data
    res.status(200).json({
      data: invoices,
      total,
      page: pageInt,
      totalPages: Math.ceil(total / limitInt)
    });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getInvoicesByVendorAndStatus
};
