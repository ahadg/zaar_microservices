const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'processor-service',
  brokers: [process.env.KAFKA_BROKER]
});

module.exports = kafka;
