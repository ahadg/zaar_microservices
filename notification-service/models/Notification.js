// models/Notification.js
const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  eventType: String,
  payload: mongoose.Schema.Types.Mixed,
  status: { type: String, default: "pending" },
  sentAt: Date,
  channel: String,
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
