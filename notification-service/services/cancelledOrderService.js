// File: services/cancelledOrderService.js

const Invoice = require("../models/b2cInvoiceModel");

const handleCancelledOrder = async (data) => {
  try {
    console.log('Processing cancelled order with data:', data);
    
    // Extract object_number from the data
    const objectNumber = data.object_number;
    
    if (!objectNumber) {
      console.error('No object_number found in cancelled order data');
      return { success: false, error: 'object_number is required' };
    }
    
    // Find all invoices for this order
    const invoices = await Invoice.find({ 
      order_number: objectNumber 
    });
    
    if (!invoices || invoices.length === 0) {
      console.error(`No invoices found for order number: ${objectNumber}`);
      return { success: false, error: 'No invoices found for this order' };
    }
    
    console.log(`Found ${invoices.length} invoices for order ${objectNumber}`);
    
    // Extract invoice IDs
    const invoiceIds = invoices.map(invoice => invoice.inv_id);
    
    console.log('Invoice IDs to process:', invoiceIds);
    
    return {
      success: true,
      invoiceIds: invoiceIds,
      totalInvoices: invoices.length
    };
    
  } catch (error) {
    console.error('Error in handleCancelledOrder:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  handleCancelledOrder,
};
