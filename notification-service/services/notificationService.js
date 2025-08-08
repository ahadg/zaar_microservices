// File: services/notificationService.js

const Invoice = require("../models/b2cInvoiceModel");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP__HOST,
  port: parseInt(process.env.SMTP__PORT),
  secure: process.env.SMTP__SECURE === "true", // true if using SSL (port 465 or 456)
  auth: {
    user: process.env.SMTP__USER,
    pass: process.env.SMTP__PASS,
  },
});

console.log("process.env.SMTP__HOST",{
  host: process.env.SMTP__HOST,
  port: parseInt(process.env.SMTP__PORT),
  secure: process.env.SMTP__SECURE === "true", // true if using SSL (port 465 or 456)
  auth: {
    user: process.env.SMTP__USER,
    pass: process.env.SMTP__PASS,
  },
})

const sendNotification = async (eventType, data) => {
  try {
    console.log(`🔔 Event Received: ${eventType}`);
    console.log("📦 Payload:", data);

    if (!data.inv_id) {
      console.error("❌ Missing inv_id in payload");
      return { success: false, error: "Missing inv_id in payload" };
    }

    // 1. Fetch invoice from MongoDB
    const invoice = await Invoice.findOne({ inv_id: data.inv_id });
    console.log("invoice",invoice)
    if (!invoice) {
      console.error("❌ Invoice not found for inv_id:", data.inv_id);
      return { success: false, error: "Invoice not found" };
    }

    const customerName = `${invoice.customer_first_name} ${invoice.customer_last_name}`;
    const customerEmail = invoice.customer_email;
    const invoiceAmount = invoice.total_price;
    const invoiceNumber = invoice.order_number;

    // 2. Generate HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${customerName},</h2>
        <p>Thanks for your order. Here's your invoice summary:</p>
        <table style="border-collapse: collapse;">
          <tr><td><strong>Invoice #:</strong></td><td>${invoiceNumber}</td></tr>
          <tr><td><strong>Total:</strong></td><td>$${invoiceAmount.toFixed(2)}</td></tr>
          <tr><td><strong>Status:</strong></td><td>${invoice.status}</td></tr>
        </table>
        <br>
        <p>We're here if you have any questions.</p>
        <p>– InvoiceX Team</p>
      </div>
    `;

    // 3. Send email
    const mailOptions = {
      from: `"InvoiceX" <${process.env.SMTP__USER}>`,
      to: customerEmail,
      subject: `Invoice #${invoiceNumber}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);

    // 4. Simulate other channels
    console.log(`📱 Simulated SMS to ${invoice.customer_phone}`);
    console.log(`💬 Simulated WhatsApp to ${data.customer_whatsapp || invoice.customer_phone}`);

    return { success: true, eventType };
  } catch (err) {
    console.error("🔥 Error in sendNotification:", err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendNotification,
};
