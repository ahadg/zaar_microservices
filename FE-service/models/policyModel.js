const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  vendor_id: {
    type: String,
    required: true
  },
  policy_id: {
    type: String,
    required: true,
    unique: true // Ensures each policy_id is unique
  },
  date: {
    type: String,
    required: true
  },
  policy: {
    type: String,
    required: true
  },
  comments: {
    type: String
  },
  no_of_days: {
    type: Number,
    required: true
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
      duration: { type: Number },
      updated_by:{type: String} // Duration in days
    }
  ],
}
);

module.exports = mongoose.model('policy', PolicySchema);
