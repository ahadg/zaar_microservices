require("dotenv").config();
const axios = require("axios").default;
const Invoice = require("../models/b2cInvoiceModel");

const {
  ORACLE_SOAP_ENDPOINT,
  ORACLE_SOAP_ACTION,
  ORACLE_SOAP_NAMESPACE,
  ORACLE_USER,
  ORACLE_PASS,
} = process.env;

const escapeXml = (str = "") =>
  String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/**
 * Builds a SOAP 1.1 envelope. Adjust names to match your Oracle service WSDL.
 */
const buildSoapEnvelope = ({ invoiceId, invoiceUrl }) => {
  const ns = ORACLE_SOAP_NAMESPACE || "http://example.com";
  const op = ORACLE_SOAP_ACTION || "UploadInvoice";

  return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="${ns}">
      <soapenv:Header/>
      <soapenv:Body>
        <ns:${op}Request>
          <ns:InvoiceId>${escapeXml(invoiceId)}</ns:InvoiceId>
          <ns:InvoiceUrl>${escapeXml(invoiceUrl)}</ns:InvoiceUrl>
        </ns:${op}Request>
      </soapenv:Body>
    </soapenv:Envelope>
  `.trim();
};

/**
 * Sends SOAP request to Oracle.
 * @param {string} xml SOAP envelope XML
 */
const sendSoapToOracle = async (xml) => {
  const headers = {
    "Content-Type": "text/xml;charset=UTF-8",
    SOAPAction: ORACLE_SOAP_ACTION || "UploadInvoice",
  };

  const auth =
    ORACLE_USER && ORACLE_PASS
      ? { username: ORACLE_USER, password: ORACLE_PASS }
      : undefined;

  const { data: soapResponse } = await axios.post(ORACLE_SOAP_ENDPOINT, xml, {
    headers,
    auth,
    timeout: 30000,
    validateStatus: () => true, // handle SOAP faults in body
  });

  const isFault = /<soapenv:Fault>|<Fault>/i.test(soapResponse);
  return {
    success: !isFault,
    response: soapResponse,
    ...(isFault && { error: "SOAP Fault returned by Oracle" }),
  };
};

module.exports = {
    buildSoapEnvelope,
    sendSoapToOracle,
  };