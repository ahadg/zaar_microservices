const { createInvoice } = require('./services/processorService');

// Mock order data for testing
const mockOrder = {
  id: 12345,
  order_number: 'ORD-2025-001',
  created_at: new Date(),
  currency: 'USD',
  email: 'customer@example.com',
  customer: {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'customer@example.com',
    phone: '+1234567890'
  },
  billing_address: {
    first_name: 'John',
    last_name: 'Doe',
    address1: '123 Main St',
    city: 'New York',
    province: 'NY',
    country: 'USA',
    zip: '10001',
    phone: '+1234567890'
  },
  shipping_address: {
    first_name: 'John',
    last_name: 'Doe',
    address1: '123 Main St',
    city: 'New York',
    province: 'NY',
    country: 'USA',
    zip: '10001'
  },
  line_items: [
    {
      id: 1,
      title: 'Product 1',
      variant_title: 'Red',
      quantity: 2,
      price: '10.00',
      tax_amount: '1.00',
      tax_rate: 0.1,
      sku: 'PROD1-RED',
      product_id: 101,
      vendor_id: 'vendor1',
      vendor: 'Vendor A'
    },
    {
      id: 2,
      title: 'Product 2',
      variant_title: 'Blue',
      quantity: 1,
      price: '20.00',
      tax_amount: '2.00',
      tax_rate: 0.1,
      sku: 'PROD2-BLUE',
      product_id: 102,
      vendor_id: 'vendor2',
      vendor: 'Vendor B'
    }
  ],
  total_discounts: '5.00',
  financial_status: 'pending',
  toObject: function() { return this; }
};

console.log('Mock order data created for testing multi-vendor invoice processing');
console.log('Order has', mockOrder.line_items.length, 'items from', 
  [...new Set(mockOrder.line_items.map(item => item.vendor))].length, 'vendors');
