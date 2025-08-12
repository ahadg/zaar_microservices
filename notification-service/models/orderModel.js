const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  address1: String,
  city: String,
  province: String,
  country: String,
  zip: String
}, { _id: false });

const CustomerSchema = new mongoose.Schema({
  id: Number,
  first_name: String,
  last_name: String,
  email: String,
  phone: String,
  default_address: AddressSchema
}, { _id: false });

const LineItemSchema = new mongoose.Schema({
  id: Number,
  title: String,
  variant_title: String,
  quantity: Number,
  price: String,
  tax_amount: String,
  tax_rate: Number,
  vendor: String,
  sku: String,
  product_id: Number,
  vendor_id: String
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  method: String,
  status: String,
  paid: Boolean,
  transaction_id: { type: String, default: null },
  payment_gateway: { type: String, default: null },
  payment_reference: { type: String, default: null },
  payment_date: { type: Date, default: null },
  amount_paid: Number,
  currency: String,
  payment_note: { type: String, default: null }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: Number,
  order_number: Number,
  created_at: Date,
  financial_status: String,
  fulfillment_status: String,
  currency: String,
  total_price: String,
  subtotal_price: String,
  total_tax: String,
  source: String,
  status: String,
  delivery_status:String,
  customer: CustomerSchema,
  line_items: [LineItemSchema],
  shipping_address: AddressSchema,
  billing_address: AddressSchema,
  payment: PaymentSchema,
  order_status_url: String
});

module.exports = mongoose.model('order', OrderSchema);
