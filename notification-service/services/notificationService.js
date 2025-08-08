// File: services/notificationService.js
require("dotenv").config();
const Invoice = require("../models/b2cInvoiceModel");
const EmailTemplate = require("../models/emailTemplates");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // port 465 requires secure: true
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready to take messages");
  }
});

const sendNotification = async (eventType, data) => {
  try {
    // 1. Fetch invoice
    const invoice = await Invoice.findOne({ invoiceId: data.invoiceId });
    if (!invoice) {
      console.error("Invoice not found for object_number:", data.invoiceId);
      return { success: false, error: "Invoice not found" };
    }
    console.log("invoice",invoice)

    // 2. Fetch email template by eventType
    console.log("objjj",{ name: eventType, active: true })
    const template = await EmailTemplate.findOne({ name: eventType, active: true });
    if (!template) {
      console.error(`No active email template found for eventType: ${eventType}`);
      return { success: false, error: "Email template not found" };
    }

    // 3. Extract required data
    const customerName = `${invoice.clientFirstName} ${invoice.clientLastName}`;
    const customerEmail = invoice.clientEmail;
    const invoiceAmount = invoice.totalAmt;
    const invoiceNumber = data.invoiceId;
    const invoiceStatus = invoice.status;
    const dueDate = invoice.dueDate;

    // 4. Manual placeholder replacement
    let htmlContent = template.templateBody;
    htmlContent = htmlContent.replace(/{{customerName}}/g, customerName);
    htmlContent = htmlContent.replace(/{{customerEmail}}/g, customerEmail);
    htmlContent = htmlContent.replace(/{{invoiceAmount}}/g, invoiceAmount);
    htmlContent = htmlContent.replace(/{{invoiceNumber}}/g, invoiceNumber);
    htmlContent = htmlContent.replace(/{{invoice.status}}/g, invoiceStatus);
    htmlContent = htmlContent.replace(/{{dueDate}}/g, dueDate || "");

    // 5. Send email
    const mailOptions = {
      from: `"InvoiceX" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `Invoice #${invoiceNumber}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice_${invoiceNumber}.pdf`,
          path: `public/pdfs/INV_8.pdf`, // Assumes filename matches invoiceId
          contentType: 'application/pdf',
        },
      ],
    };
    

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);

    return { success: true, eventType };
  } catch (err) {
    console.error("Error in sendNotification:", err);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendNotification,
};
