// File: app.js
const kafka = require("./config/kafka");
const { sendNotification } = require("./services/notificationService");
const Notification = require("./models/Notification");
require("dotenv").config();

const connectDB = require("./config/db");


// init kafka
const topics = [
  "B2B_INVOICE_CREATED",
  "B2B_INVOICE_DELIVERED",
  "ORDER_CANCELLED",
  // "b2b-invoice-created",
  // "PaymentReceived",
  // "CreditNoteIssued",
  // "ReturnApproved",
];

const consumer = kafka.consumer({ groupId: "notification-group" });

const initKafkaConsumer = async () => {
  await consumer.connect();
  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const value = message.value.toString();
      const data = JSON.parse(value)
      // {"invoiceId" : "INV-001"}
      if (topic === "B2B_INVOICE_CREATED") {
        // Handle B2B invoice created event
        const result = await sendNotification(topic, data);

      }
      else if (topic === "B2B_INVOICE_DELIVERED") {
        // Handle B2B_INVOICE_CREATED Event invoice delivered event
        const result = await sendNotification(topic, data);

      } else if (topic === "ORDER_CANCELLED") {
        // Handle order cancelled event
        const result = await sendNotification(topic, data);

      }


      // await Notification.create({
      //   eventType: topic,
      //   payload: data,
      //   status: result.success ? "sent" : "failed",
      //   sentAt: result.success ? new Date() : null,
      //   channel: "email", // Example, you can customize per topic
      // });
    
    },
  });
};

// Start server
const port = process.env.PORT || 5000;

// Start consumer after DB
connectDB().then(() => {
 
  initKafkaConsumer(); // Add this line
});




