// File: app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const passport = require("passport");
const path = require("path");
const kafka = require("./config/kafka");
const { sendNotification } = require("./services/notificationService");
const Notification = require("./models/Notification");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json({ extended: true, limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

// Static folders
const staticFolders = [
  "accounts",
  "uploads",
  "invoices-pdf",
  "assets",
  "BankStatement",
  "last3invoices",
  "template",
];

staticFolders.forEach((folder) => {
  app.use(`/${folder}`, express.static(path.join(__dirname, folder)));
});

// Cookie session
app.use(
  cookieSession({
    name: "session-auth",
    keys: ["key1", "key2"],
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());


// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/auth", authRoutes);

// Base route
app.get("/", (req, res) => {
  return res.send("PLEASE LEAVE! You are NOT AUTHORIZED to access this link.");
});

// init kafka
const topics = [
  "b2c-invoice-created",
  "B2BInvoiceCreated",
  "PaymentReceived",
  "CreditNoteIssued",
  "ReturnApproved",
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

      const data = JSON.parse(value) || 
      {
        "B2C_pdf_location": "https://example.com/invoice.pdf",
        "customer_email": "customer@example.com",
        "customer_name": "John Doe",
        "customer_number": "1234567890",
        "emailTemplate": "<html><body><h1>Your Invoice</h1></body></html>"
      };
      // {"inv_id" : "INV_01"}
      console.log(`📨 ${topic} Event:`, data);
      

      const result = await sendNotification(topic, data);

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
console.log("process.env.PORT",process.env.PORT)
// Start consumer after DB
connectDB().then(() => {
  app.listen(port, () => {
    console.log(new Date(Date.now()).toJSON());
    console.log(`MongoDB connected & Server listening on http://localhost:${port}`);
  });

  initKafkaConsumer(); // Add this line
});




