require("dotenv").config();
const Invoice = require("../models/b2cInvoiceModel");
const { buildSoapEnvelope } = require("../utils/oracle");


const pushInvoiceToOracle = async (invoiceId) => {
  try {
    const invoice = await Invoice.findOne({
      inv_id : invoiceId,
      BA_verified: true,
      Vendor_ack: true,
    });

    // insert row into another table
    //await InvoicesAcknowledge.insertOne(invoice)

    if (!invoice) {
      return {
        success: false,
        error: `Invoice not found or not verified/acknowledged: ${invoiceId}`,
      };
    }

    const invoiceUrl = invoice.invoiceUrl || invoice.pdfUrl || invoice.url;
    if (!invoiceUrl) {
      return { success: false, error: `Invoice URL missing on invoice ${invoiceId}` };
    }

    const xml = buildSoapEnvelope({ invoiceId, invoiceUrl });
    const result = await sendSoapToOracle(xml);

    if (!result.success) {
      return { success: false, error: result.error, detail: result.response };
    }

    return { success: true, oracleResponse: result.response };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = {
  pushInvoiceToOracle,
};