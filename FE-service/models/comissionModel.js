const mongoose = require('mongoose');

const ComissionSchema = new mongoose.Schema({
  vendor_id: {
    type: String,
    required: true
  },
  commission_id: {
    type: String,
    required: true,
    unique: true
  },
  commision_value: {
    type: Number,
    required: true
  },
  start_date: {
    type: String,
    required: true
  },
  category_id: {
    type: String,
    required: true
  },
  category_name: {
    type: String,
    required: true
  },
  comments: {
    type: String
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
}
);

module.exports = mongoose.model('comission', ComissionSchema);
