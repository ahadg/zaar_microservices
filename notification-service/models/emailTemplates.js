// models/NotificationTemplate.js
const mongoose = require("mongoose");

const NotificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: null
  },
  templateBody: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ["placed", "delivered", "cancelled"]
  },
  active: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("emailtemplates", NotificationTemplateSchema);
