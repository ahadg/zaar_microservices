const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  lineId : {
    type: String,
    required: true,
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
  quantity: {
    type: String,
    required: false,
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
  total_amount: {
    type: String,
    required: false,
  },
  additionalDetails: {
    type: String,
    required: false,
  },
  order_number: {
    type: String,
    required: true,
    index: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: false,
  },
});
module.exports = mongoose.model("zarr-lineitems", schema);
