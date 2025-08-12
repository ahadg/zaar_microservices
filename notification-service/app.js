// File: app.js
const kafka = require("./config/kafka");
const { sendNotification, sendorderdUpdatedNotification } = require("./services/notificationService");
const { handleCancelledOrder } = require("./services/cancelledOrderService");
const Notification = require("./models/Notification");
require("dotenv").config({path: "./.env" });

const connectDB = require("./config/db");


// init kafka
const topics = [
  process.env.B2C_INVOICE_CREATED,
  process.env.B2C_INVOICE_DELIVERED,
  process.env.ORDER_CANCELLED,
  // "b2b-invoice-created",
  // "PaymentReceived",
  // "CreditNoteIssued",
  // "ReturnApproved",
];

const consumer = kafka.consumer({ groupId: "notification-group" });

const initKafkaConsumer = async () => {
  await consumer.connect();
  for (const topic of topics) {
    console.log(`Subscribing to topic: ${topic} from ${topics}`);
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const value = message.value.toString();
      const data = JSON.parse(value)
      console.log("data",data)
      // {"invoiceId" : "INV-001"}
      if (topic === process.env.B2C_INVOICE_CREATED) {
        // Handle B2C invoice created event
        const result = await sendNotification("placed", data);

      }
      else if (topic === "order-cancelled") {
        // Handle B2C invoice delivered event
        const result = await sendorderdUpdatedNotification("ORDER_UPDATED", data);

      } else if (topic === process.env.ORDER_CANCELLED) {
        // Handle order cancelled event
        const cancelledResult = await handleCancelledOrder(data);
        
        if (cancelledResult.success) {
          console.log(`Processing ${cancelledResult.totalInvoices} invoices for cancelled order`);
          const result = await sendNotification("cancelled", cancelledResult.invoiceIds);
          // console.log('Cancelled order notification result:', result);
        } else {
          console.error('Failed to process cancelled order:', cancelledResult.error);
        }

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




