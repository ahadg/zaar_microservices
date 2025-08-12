const mongoose = require('mongoose');

const PaymentHistorySchema = new mongoose.Schema({
  inv_id: {
    type: String,
    required: true,
    index: true
  },
  order_number: {
    type: Number,
    required: true
  },
  payment: {
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
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  collection: 'paymenthistories'
});

// Index for better query performance
PaymentHistorySchema.index({ inv_id: 1, order_number: 1 });

module.exports = mongoose.model('PaymentHistory', PaymentHistorySchema);
