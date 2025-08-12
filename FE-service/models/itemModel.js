const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  itemCode: {
    type: String,
    required: true,
    max: 255,
  },
  vendorId: {
    type: String,
    required: true,
    max: 255,
  },
  vendor: {
    type: String,
    required: false,
    max: 255,
  },
  title: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  unit_price: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    required: false,
    default: 0,
  },
  tax: {
    type: String,
    required: false,
    default: 0,
  },
  amount: {
    type: String,
    required: false,
  },
  additionalDetails: {
    type: String,
    required: false,
  },
  commission_rate: {
    type: String,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    required: false,
  },
  categoryId: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now
  },status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
  },
  history: [
    {
      from_date: { type: String },
      to_date: { type: String },
      reason: { type: String },
      commision_value: { type: Number },
      updated_by:{type: String} 
    }
  ],
});
module.exports = mongoose.model("Zarr-Items", schema);
