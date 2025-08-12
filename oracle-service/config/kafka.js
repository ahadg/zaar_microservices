// config/kafka.js
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "oracle-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:9092"], // e.g. 'localhost:9092'
});

module.exports = kafka;
