package main

import (
	"context"
	"log"
	"time"

	// "github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// Mongo-related variables
var (
	mongoClient     *mongo.Client
	orderCollection *mongo.Collection
	logsCollection  *mongo.Collection
	dbName          string
)

// ConnectToMongo initializes the MongoDB connection
func ConnectToMongo() {
	// env := godotenv.Load()
	mongoURI := getEnv("MONGO_URI", "mongodb://localhost:27017")
	dbName = getEnv("MONGO_DB", "webhookdb")
	log.Printf("Connecting to MongoDB at %s", mongoURI)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)

	if err != nil {
		log.Fatalf("MongoDB connection failed: %v", err)
	}

	if err := client.Ping(ctx, nil); err != nil {
		log.Fatalf("MongoDB ping failed: %v", err)
	}

	mongoClient = client
	orderCollection = client.Database(dbName).Collection("orders")
	logsCollection = client.Database(dbName).Collection("zaarlogs")

	log.Println("Connected to MongoDB, database:", dbName)
}

// SaveToMongo saves the webhook payload and a log entry
func SaveOrderToMongo(data map[string]interface{}, targetTopic string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	data["source"] = "zaar-platform"
	data["status"] = "unprocessed"
	data["delivery_status"] = "pending"

	res, err := orderCollection.InsertOne(ctx, data)
	if err != nil {
		log.Printf("Failed to insert webhook: %v", err)
		return
	}
	log.Println("Webhook stored in MongoDB with ID:", res.InsertedID)

}

func SaveLogsToMongo(data map[string]interface{}, targetTopic string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	logDoc := map[string]interface{}{
		"logtime":      time.Now(),
		"title":        "Order Placed log",
		"topic":        targetTopic,
		"source":       "invoicex-object-handler",
		"payload":      data,
		"order_number": data["order_number"],
		"customer_email": func() interface{} {
			if cust, ok := data["customer"].(map[string]interface{}); ok {
				return cust["email"]
			}
			return nil
		}(),
	}

	_, err := logsCollection.InsertOne(ctx, logDoc)
	if err != nil {
		log.Printf("Failed to insert log: %v", err)
	} else {
		log.Println("Log stored in MongoDB")
	}
}

// func getKeys(data map[string]interface{}) []string {
// 	keys := make([]string, 0, len(data))
// 	for k := range data {
// 		keys = append(keys, k)
// 	}
// 	return keys
// }
