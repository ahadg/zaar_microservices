package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/segmentio/kafka-go"
)

var (
	topic string
)

func main() {
	// Kafka broker address from env or default
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found or couldn't be loaded")
	}
	topic = getEnv("KAFKA_TOPIC", "webhook-events")
	// Initialize Kafka writer
	// kafkaWriter = &kafka.Writer{
	// 	Addr:         kafka.TCP(broker),
	// 	Topic:        topic,
	// 	Balancer:     &kafka.LeastBytes{},
	// 	RequiredAcks: kafka.RequireAll,
	// }

	// Setup HTTP server
	ConnectToMongo()
	http.HandleFunc("/invoicex", webhookHandler)
	port := getEnv("PORT", "4000")
	log.Printf("Starting server on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func webhookHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST allowed", http.StatusMethodNotAllowed)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read body", http.StatusBadRequest)
		return
	}
	// log.Printf("Received webhook: %s", string(body))
	requestedTopic := r.URL.Query().Get("topic")
	if requestedTopic == "" {
		requestedTopic = topic // fallback to default
	}
	log.Printf("Publishing to Kafka topic and saving to mongoDB: %s", requestedTopic)
	var jsonData map[string]interface{}
	if err := json.Unmarshal(body, &jsonData); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}
	orderNum, _ := json.Marshal(jsonData["order_number"])
	switch requestedTopic {
	case "order-placed":
		go SaveOrderToMongo(jsonData, requestedTopic)
		go SaveLogsToMongo(jsonData, requestedTopic)
		go publishToKafka(requestedTopic, string(orderNum))
	case "order-delivered":
		// No payload expected
		go SaveLogsToMongo(jsonData, requestedTopic)
		go publishToKafka(requestedTopic, string(orderNum))
	case "order-cancelled":
		// No payload expected
		go SaveLogsToMongo(jsonData, requestedTopic)
		go publishToKafka(requestedTopic, string(orderNum))

	default:
		log.Printf("Unhandled topic: %s", requestedTopic)
	}

	w.WriteHeader(http.StatusAccepted)
	fmt.Fprintf(w, "Event received\n")
}

func publishToKafka(targetTopic, message string) {
	// Create a new writer for the target topic
	broker := getEnv("KAFKA_BROKER", "localhost:9092")
	writer := &kafka.Writer{
		Addr:         kafka.TCP(broker),
		Topic:        targetTopic,
		Balancer:     &kafka.LeastBytes{},
		RequiredAcks: kafka.RequireAll,
	}
	defer writer.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	log.Printf("Publishing to Kafka topic %s: %s", targetTopic, message)
	payload := map[string]string{
		"object_number": message,
	}
	// Encode to JSON
	jsonValue, _ := json.Marshal(payload)

	err := writer.WriteMessages(ctx,
		kafka.Message{
			Key:   []byte(fmt.Sprintf("key-%d", time.Now().UnixNano())),
			Value: jsonValue,
		},
	)

	if err != nil {
		log.Printf("Failed to publish to Kafka topic %s: %v", targetTopic, err)
	} else {
		log.Printf("Published to Kafka topic %s: %s", targetTopic, message)
	}
}
func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
