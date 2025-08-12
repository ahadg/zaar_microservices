require('dotenv').config();
const connectDB = require('./config/db');
const kafka = require('./config/kafka');
const processorService = require('./services/processorService');

// const { processTriggeredByMessage } = require('./services/processService');

const consumer = kafka.consumer({ groupId: 'b2c-invoice-group' });
const producer = kafka.producer();

const initKafkaConsumer = async () => {
  await consumer.connect();
  await producer.connect();
  // Subscribe to multiple topics
  console.log('Subscribing to topics...', process.env.ORDER_CREATED, process.env.ORDER_DELIVERED, process.env.ORDER_CANCELLED);
  await consumer.subscribe({ topic: process.env.ORDER_CREATED, fromBeginning: true });
  await consumer.subscribe({ topic: process.env.ORDER_DELIVERED, fromBeginning: true });
  await consumer.subscribe({ topic: process.env.ORDER_CANCELLED, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const key = message.key ? message.key.toString() : null;
        const value = message.value ? message.value.toString() : null;
        const data = JSON.parse(value);

        if (topic === process.env.ORDER_CREATED) {
          // Flow for ORDER_CREATED
          console.log('Received message value:', data);
          const results = await processorService.processOrder(data);
          // for (const result of results) {
          console.log('Processing order with message value after order:', results);
          await producer.send({
            topic: process.env.INVOICE_CREATED,
            messages: [{ value: JSON.stringify(results.invoiceIds) }],
          });
          console.log('Processed and emitted result:', results);
        // }

        } else if (topic === process.env.ORDER_DELIVERED) {
          // Refactored: call processorService for ORDER_DELIVERED flow
          const results = await processorService.processOrderDelivered(value);
          // Emit message after processing
          await producer.send({
            topic: process.env.INVOICE_DELIVERED,
            messages: [{ value: JSON.stringify(results.updatedInvoiceIds) }],
          });

        } else if (topic === process.env.ORDER_CANCELLED) {
          // Flow for ORDER_CANCELLED
          await processorService.processCancelledOrder(value);
        }
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
