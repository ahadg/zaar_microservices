
// Import required models
const OrderModel = require('../models/orderModel');
const B2CInvoiceModel = require('../models/b2cInvoiceModel');
const PaymentHistoryModel = require('../models/paymentHistoryModel');
const InvoiceHistoryModel = require('../models/invoiceHistoryModel');
const ZarrItemsModel = require('../models/lineitemsModel');

// This function processes an order delivered event
async function processOrder(messageValue) {
  // Parse the message value (assume it's a JSON string)
  let orderInfo;
  try {
    orderInfo = typeof messageValue === 'string' ? JSON.parse(messageValue) : messageValue;
  } catch (err) {
    throw new Error('Invalid message value for order details');
  }
    console.log('Processing order with message value:', orderInfo);

  // Fetch order details from database using order_number
  const order = await OrderModel.findOne({ order_number: orderInfo.object_number });
  
  if (!order) {
    throw new Error(`Order not found with object_number: ${orderInfo.object_number}`);
  }

  const invoiceResult = await createInvoice(order);
  console.log(`Created ${invoiceResult.totalInvoices} invoices:`, invoiceResult.invoiceIds);

  // Store payment object in PaymentHistory collection for each created invoice
  if (order.payment && invoiceResult.invoiceIds) {
    for (const invoiceId of invoiceResult.invoiceIds) {
      const paymentHistory = new PaymentHistoryModel({
        inv_id: invoiceId,
        order_number: order.order_number,
        payment: order.payment,
        action: 'Created',
      });
      
      await paymentHistory.save();
    }
  }
  
  console.log('Payment history saved for invoices:', invoiceResult.invoiceIds);
  console.log('Invoices saved to both B2CInvoice and InvoiceHistory collections');
  
  return {
    invoiceIds: invoiceResult.invoiceIds,
    totalInvoices: invoiceResult.totalInvoices,
  };
}

async function processOrderDelivered(messageValue) {
  // Parse the message value (assume it's a JSON string)
  let orderInfo;
  try {
    orderInfo = typeof messageValue === 'string' ? JSON.parse(messageValue) : messageValue;
  } catch (err) {
    throw new Error('Invalid message value for order delivered');
  }
  console.log('Processing order delivered with message value:', orderInfo);

//   // 1. Retrieve invoice based on order_number from message data
//   const order = await OrderModel.findOne({ order_number: orderInfo.order_number });
  
//   if (!order) {
//     throw new Error(`Order not found with order_number: ${orderInfo.order_number}`);
//   }

  // Find all existing invoices for this order (since we now create multiple invoices per order)
  const existingInvoices = await B2CInvoiceModel.find({ 
    order_number: orderInfo.object_number
  });

  if (!existingInvoices || existingInvoices.length === 0) {
    throw new Error(`No invoices found for object_number: ${orderInfo.object_number}`);
  }

  console.log(`Found ${existingInvoices.length} invoices for order ${orderInfo.object_number}`);

  // Update all invoices for this order to paid status
  const updateResults = [];
  for (const invoice of existingInvoices) {
    invoice.status = 'paid';
    invoice.payment_status = 'completed';
    invoice.updated_at = new Date(); // Update the timestamp
    await invoice.save();
    updateResults.push(invoice.inv_id);
    console.log(`Updated invoice ${invoice.inv_id} to paid status`);
  }
  // Save updated invoices to InvoiceHistories collection
  for (const invoice of existingInvoices) {
    const invoiceHistory = new InvoiceHistoryModel({
      ...invoice.toObject(),
      _id: undefined, // Remove the original _id to create a new document
      action: 'Delivered',
      updated_at: new Date()
    });
    
    await invoiceHistory.save();
  }

  console.log(`Updated ${updateResults.length} invoices to paid status and saved to history:`, updateResults);
  
  
  return {
    updatedInvoiceIds: updateResults,
    totalUpdatedInvoices: updateResults.length
  };
}

async function processCancelledOrder(messageValue) {
  // Parse the message value (assume it's a JSON string)
  let orderInfo;
  try {
    orderInfo = typeof messageValue === 'string' ? JSON.parse(messageValue) : messageValue;
  } catch (err) {
    throw new Error('Invalid message value for order cancelled');
  }
  console.log('Processing order cancelled with message value:', orderInfo);

  // 1. Retrieve invoice based on order_number from message data
//   const order = await OrderModel.findOne({ order_number: orderInfo.order_number });
  
//   if (!order) {
//     throw new Error(`Order not found with order_number: ${orderInfo.order_number}`);
//   }

  // Find all existing invoices for this order (since we now create multiple invoices per order)
  const existingInvoices = await B2CInvoiceModel.find({ 
    order_number: orderInfo.object_number
  });

  if (!existingInvoices || existingInvoices.length === 0) {
    throw new Error(`No invoices found for order_number: ${orderInfo.object_number}`);
  }

  console.log(`Found ${existingInvoices.length} invoices for order ${orderInfo.object_number}`);

  // Update all invoices for this order to cancelled status
  const updateResults = [];
  for (const invoice of existingInvoices) {
    invoice.status = 'cancelled';
    invoice.payment_status = 'cancelled';
    invoice.updated_at = new Date(); // Update the timestamp
    await invoice.save();
    updateResults.push(invoice.inv_id);
    console.log(`Updated invoice ${invoice.inv_id} to cancelled status`);
  }

  // Save updated invoices to InvoiceHistories collection
  for (const invoice of existingInvoices) {
    const invoiceHistory = new InvoiceHistoryModel({
      ...invoice.toObject(),
      _id: undefined, // Remove the original _id to create a new document
      action: 'Cancelled',
      updated_at: new Date()
    });
    
    await invoiceHistory.save();
  }

  console.log(`Updated ${updateResults.length} invoices to cancelled status and saved to history:`, updateResults);
  
  // Return the updated invoice ids
  return {
    updatedInvoiceIds: updateResults,
    totalUpdatedInvoices: updateResults.length,
  };
}

module.exports = {
  processOrder,
  processOrderDelivered,
  processCancelledOrder,
};


async function createInvoice(order){
  try {
    console.log('Creating invoice for order:', order.order_number);
    
    // Store all line items in zarr-items table
    const zarrItems = [];
    for (const lineItem of order.line_items) {
      const itemTotal = parseFloat(lineItem.price) * parseInt(lineItem.quantity);
      const zarrItem = new ZarrItemsModel({
        order_number: order.order_number,
        vendorId: lineItem.vendor_id || 'unknown',
        vendor: lineItem.vendor || 'Unknown Vendor',
        title: lineItem.title,
        unit_price: lineItem.price,
        quantity: lineItem.quantity.toString(),
        discount: lineItem.discount_amount || '0',
        tax: lineItem.tax_amount || '0',
        amount: lineItem.price,
        total_amount: itemTotal.toString(),
        additionalDetails: lineItem.variant_title || ''
      });
      
      zarrItems.push(zarrItem);
    }
    
    // Save all zarr items to database
    await ZarrItemsModel.insertMany(zarrItems);
    console.log(`Saved ${zarrItems.length} zarr items for order ${order.order_number}`);
    
    // Group line items by vendor
    const vendorGroups = {};

    order.line_items.forEach(lineItem => {

      const vendorId = lineItem.vendor_id || 'unknown';
      const vendorName = lineItem.vendor || 'Unknown Vendor';
      
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendorId: vendorId,
          vendor_name: vendorName,
          line_items: [],
          total_amount: 0,
          tax_amount: 0,
          discount_amount: 0
        };
      }
      
      vendorGroups[vendorId].line_items.push(lineItem);
      vendorGroups[vendorId].total_amount += parseFloat(lineItem.price) * parseInt(lineItem.quantity);
      vendorGroups[vendorId].tax_amount += parseFloat(lineItem.tax_amount || 0);
    });
    
    // Create separate B2C invoice for each vendor
    const invoices = [];
    let invoiceCounter = 1;
    
    for (const [vendorId, vendorGroup] of Object.entries(vendorGroups)) {
      // Calculate vendor-specific discount (proportional to vendor's subtotal)
      const vendorSubtotal = vendorGroup.total_amount;
      const orderSubtotal = order.line_items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
      const discountProportion = orderSubtotal > 0 ? vendorSubtotal / orderSubtotal : 0;
      vendorGroup.discount_amount = parseFloat(order.total_discounts || 0) * discountProportion;
      
      // Calculate final total for vendor
      const finalTotal = vendorGroup.total_amount + vendorGroup.tax_amount - vendorGroup.discount_amount;
      
      // Generate unique invoice ID for this vendor
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const invoiceId = `INV_${timestamp}_${randomNum}_V${invoiceCounter}`;
      
      const currentDate = new Date();
      const dueDate = new Date(currentDate.getTime() + (process.env.INVOICE_DUE_DAYS * 24 * 60 * 60 * 1000));
      console.log(vendorGroup);
      // Create B2C invoice for this vendor
      const orderObject = order.toObject();
      delete orderObject._id; // Remove the original _id to avoid duplicate key error
      
      const b2cInvoice = new B2CInvoiceModel({
        ...orderObject,
        inv_id: invoiceId,
        invoiceRef: invoiceId,
        vendor: vendorGroup.vendor_name,
        vendor_id: vendorGroup.vendorId,
        create_date: currentDate,
        due_date: dueDate,
        // Override totals with vendor-specific calculations
        subtotal_price: vendorGroup.total_amount,
        total_tax: vendorGroup.tax_amount,
        total_discounts: vendorGroup.discount_amount,
        total_price: finalTotal,
        line_items: vendorGroup.line_items

      });
      
      await b2cInvoice.save();
      invoices.push(b2cInvoice);
      console.log(`Created invoice ${invoiceId} for vendor ${vendorGroup.vendor_name} with total: ${finalTotal}`);
      
      // Also save to InvoiceHistories collection
      const orderObjectForHistory = order.toObject();
      delete orderObjectForHistory._id; // Remove the original _id to avoid duplicate key error
      
      const invoiceHistory = new InvoiceHistoryModel({
        ...orderObjectForHistory,
        inv_id: invoiceId,
        invoiceRef: invoiceId,
        vendor: vendorGroup.vendor_name,
        vendor_id: vendorGroup.vendorId,
        create_date: currentDate,
        due_date: dueDate,
        subtotal_price: vendorGroup.total_amount,
        total_tax: vendorGroup.tax_amount,
        total_discounts: vendorGroup.discount_amount,
        total_price: finalTotal,
        line_items: vendorGroup.line_items
      });
      
      await invoiceHistory.save();
      
      // Update zarr items with invoice ID
      await ZarrItemsModel.updateMany(
        { 
          order_number: order.order_number,
          vendorId: vendorId
        },
        { inv_id: invoiceId }
      );
      
      invoiceCounter++;
    }
    
    console.log(`Created ${invoices.length} invoices for ${Object.keys(vendorGroups).length} vendors`);
    
    // Return the first invoice's ID for compatibility (or you could return all IDs)
    return {
      totalInvoices: invoices.length,
      invoiceIds: invoices.map(inv => inv.inv_id)
    };
    
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}