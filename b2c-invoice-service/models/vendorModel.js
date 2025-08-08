const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendor_id: {
    type: String,
    required: true,
    unique: true
  },
  business_name: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    long: {
      type: Number,
      required: true
    }
  },
  joining_date: {
    type: Date,
    required: true
  },
  country: {
    type: String,
  },
  city: {
    type: String,
  },
  business_type: {
    type: String,
  },
  tax_number: {
    type: String,
    required: true
  },
  reference_contact_info: {
    name: {
      type: String,
      required: true
    },
    number: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    relation: {
      type: String,
      required: true
    }
  },
  description: {
    type: String
  }
});

const Vendor = mongoose.model('vendor', vendorSchema);

module.exports = Vendor;
