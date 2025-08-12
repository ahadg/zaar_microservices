const Invoice = require('./../models/invModel');

/**
 * GET /invoices?vendor_id=1232131&status=unpaid,paid&page=1&limit=10
 */
const getInvoicesByVendorAndStatus = async (req, res) => {
  try {
    const { vendor_id, status, page = 1, limit = 10 } = req.query;
    console.log('Fetching invoices for vendor:', vendor_id, 'with status:', status, 'on page:', page, 'with limit:', limit);

    // Validate vendor_id
    if (!vendor_id) {
      return res.status(400).json({ message: 'vendor_id is required' });
    }

    // Convert status to array if it's a comma-separated string
    const statusArray = status
      ? status.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [];

    if (statusArray.length === 0) {
      return res.status(400).json({ message: 'At least one status is required' });
    }

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;
    if (status == "order"){
      statusArray = ["paid", "unpaid"];
    }
    const filter = {
      vendor_id: vendor_id,
      status: { $in: statusArray }
    };

    const [invoices, total] = await Promise.all([
      Invoice.find(filter).skip(skip).limit(limitInt),
      Invoice.countDocuments(filter)
    ]);

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

const getInvoiceById = async (req, res) => {
  try {
    const { invoice_id } = req.params;
    console.log('Fetching invoice with ID:', invoice_id);

    // Validate invoice_id
    if (!invoice_id) {
      return res.status(400).json({ message: 'invoice_id is required' });
    }

    // Fetch the invoice
    const invoice = await Invoice.find({"inv_id": invoice_id});

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json({ data: invoice });
  } catch (err) {
    console.error('Error fetching invoice by ID:', err);

    // Handle invalid ObjectId errors from Mongoose
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid invoice_id format' });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getInvoicesByVendorAndStatus, getInvoiceById
};
