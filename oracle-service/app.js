// File: app.js
const kafka = require("./config/kafka");
require("dotenv").config({ path: "./.env" });

const connectDB = require("./config/db");
const { pushInvoiceToOracle } = require("./services/oracleInvoiceService");

// Listen only to this topic (env override optional)
const INVOICE_PROCESSED = process.env.INVOICE_PROCESSED || "invoice-processed";

const consumer = kafka.consumer({ groupId: "oracle-group" });

const initKafkaConsumer = async () => {
  await consumer.connect();
  console.log(`Subscribing to topic: ${INVOICE_PROCESSED}`);
  await consumer.subscribe({ topic: INVOICE_PROCESSED, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        const value = message.value?.toString() || "{}";
        const data = JSON.parse(value); // expected: { "invoiceId": "INV-001" }
        console.log("Kafka message recieved",{ data })
        if (topic !== INVOICE_PROCESSED) return;
        
        if (!data?.invoiceId) {
          console.error("Missing invoiceId in message payload:", value);
          return;
        }

        const result = await pushInvoiceToOracle(data.invoiceId);
        if (result.success) {
          console.log(`✅ SOAP push success for invoice ${data.invoiceId}`);
        } else {
          console.error(`❌ SOAP push failed for invoice ${data.invoiceId}:`, result.error);
        }
      } catch (err) {
        console.error("eachMessage handler error:", err);
      }
    },
  });
};

// Start after DB
connectDB().then(() => {
  initKafkaConsumer();
});
