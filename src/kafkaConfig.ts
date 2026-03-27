import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Helper function to get required env variable
function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const connectionString = getEnv("EVENT_HUB_CONNECTION_STRING");

export const kafkaConfig = {
  clientId: getEnv("KAFKA_CLIENT_ID", "local-app"),
  brokers: getEnv("KAFKA_BROKERS", "localhost:9092").split(","),

  ssl: getEnv("KAFKA_SSL", "false") === "true",
  sasl: {
    mechanism: "plain" as const,
    username: "$ConnectionString",
    password: connectionString
  }
};

export const topic = getEnv("KAFKA_TOPIC", "eh1");
export const consumerGroup = getEnv("KAFKA_CONSUMER_GROUP", "cg1");
