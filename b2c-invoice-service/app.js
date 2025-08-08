// invoice-service
require('dotenv').config();
const connectDB = require('./config/db');
const kafka = require('./config/kafka');
require("dotenv").config();
// const { processTriggeredByMessage } = require('./services/processService');

const consumer = kafka.consumer({ groupId: 'b2c-invoice-group' });
const producer = kafka.producer();

const initKafkaConsumer = async () => {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: process.env.ORDER_TOPIC, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        console.log("New Order received with order_number:", message)
        const key = message.key ? message.key.toString() : null;
        const value = message.value ? message.value.toString() : null;

        console.log('Received message key:', key);
        console.log('Received message value:', value);
        // const results = await processTriggeredByMessage(message.value.toString());
        // for (const result of results) {
          await producer.send({
            topic: process.env.INVOICE_TOPIC,
            messages: [{ value:value }],
          });
          console.log('Processed and emitted result:', value);
        // }
      } catch (err) {
        console.error('Processing error:', err);
      }
    }
  });
};




// Start app
(async () => {
  await connectDB();
  initKafkaConsumer();
})();
