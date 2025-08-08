const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  billing_address1: { type: String, required: true },
  billing_city: { type: String, required: true },
  billing_country: { type: String, required: true },
  billing_province: { type: String, required: true },
  billing_zip: { type: Number, required: true },

  create_date: { type: Date, required: true },
  created_at: { type: Date, required: true },

  currency: { type: String, required: true },

  customer_address1: { type: String, required: true },
  customer_city: { type: String, required: true },
  customer_country: { type: String, required: true },
  customer_email: { type: String, required: true },
  customer_first_name: { type: String, required: true },
  customer_id: { type: Number, required: true },
  customer_last_name: { type: String, required: true },
  customer_phone: { type: String, required: true },
  customer_province: { type: String, required: true },
  customer_zip: { type: Number, required: true },

  due_date: { type: Date, required: true },

  fulfillment_status: { type: String, required: true },
  id: { type: Number, required: true },
  inv_id: { type: String, required: true },
  order_number: { type: Number, required: true },

  product_id: { type: Number, required: true },
  product_price: { type: Number, required: true },
  product_quantity: { type: Number, required: true },
  product_sku: { type: String, required: true },
  product_tax_amount: { type: Number, required: true },
  product_tax_rate: { type: Number, required: true },
  product_title: { type: String, required: true },
  product_variant: { type: String, required: true },

  shipping_address1: { type: String, required: true },
  shipping_city: { type: String, required: true },
  shipping_country: { type: String, required: true },
  shipping_province: { type: String, required: true },
  shipping_zip: { type: Number, required: true },

  status: { type: String, required: true },

  subtotal_price: { type: Number, required: true },
  total_price: { type: Number, required: true },
  total_tax: { type: Number, required: true },

  vendor: { type: String, required: true },
  vendor_id: { type: String, required: true }
});

const Invoice = mongoose.model('b2cinvoice', invoiceSchema);

module.exports = Invoice;
