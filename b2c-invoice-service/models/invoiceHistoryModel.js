const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  address1: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  country: { type: String, required: true },
  zip: { type: String, required: true }
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  default_address: { type: AddressSchema, required: true }
}, { _id: false });

const InvoiceDetailSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  variant_title: { type: String },
  quantity: { type: Number, required: true },
  price: { type: String, required: true },
  tax_amount: { type: String, required: true },
  tax_rate: { type: Number, required: true },
  sku: { type: String },
  product_id: { type: Number, required: true }
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  inv_id: { type: String, required: true },
  order_number: { type: Number, required: true },
  create_date: { type: Date, required: true },
  due_date: { type: Date, required: true },
  created_at: { type: Date, required: true },
  status: { type: String, required: true },
  currency: { type: String, required: true },
  total_price: { type: String, required: true },
  subtotal_price: { type: String, required: true },
  total_tax: { type: String, required: true },
  vendor_id: { type: String, required: true },
  vendor: { type: String, required: true },
  customer: { type: CustomerSchema, required: true },
  inv_details: { type: [InvoiceDetailSchema], required: true },
  shipping_address: { type: AddressSchema, required: true },
  billing_address: { type: AddressSchema, required: true },
  source: { type: String, required: true },
  action: { type: String, default: 'Created' },

  updated_at: { type: Date, required: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('invoiceHistory', InvoiceSchema);
