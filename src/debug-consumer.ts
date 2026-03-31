import { Kafka } from "kafkajs";
import { kafkaConfig, topic, consumerGroup } from "./kafkaConfig";

/**
 * Debug consumer - runs for a limited time and shows exactly what happens
 */
async function debugConsume() {
  console.log("=== DEBUG CONSUMER ===");
  console.log(`Topic: ${topic}`);
  console.log(`Consumer Group: ${consumerGroup}`);
  console.log("");

  const kafka = new Kafka(kafkaConfig);
  const admin = kafka.admin();
  
  // First, check current state
  await admin.connect();
  
  const topicOffsets = await admin.fetchTopicOffsets(topic);
  console.log("Topic offsets (latest messages):", topicOffsets);
  
  try {
    const groupOffsets = await admin.fetchOffsets({ groupId: consumerGroup, topics: [topic] });
    console.log("Consumer group offsets:", JSON.stringify(groupOffsets, null, 2));
  } catch (e: any) {
    console.log("Consumer group not found - will start fresh");
  }
  
  await admin.disconnect();
  
  // Now consume
  console.log("\n--- Starting consumer ---\n");
  
  const consumer = kafka.consumer({ groupId: consumerGroup });
  await consumer.connect();
  console.log("Connected!");

  await consumer.subscribe({ topic, fromBeginning: false });
  console.log("Subscribed (fromBeginning: false - only new messages after last commit)");

  let count = 0;
  const maxWait = 10000; // 10 seconds
  const startTime = Date.now();

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      count++;
      console.log(`\n>>> MESSAGE RECEIVED <<<`);
      console.log(`Partition: ${partition}, Offset: ${message.offset}`);
      console.log(`Value: ${message.value?.toString()}`);
    }
  });

  // Wait for messages
  await new Promise<void>((resolve) => {
    const check = setInterval(() => {
      if (Date.now() - startTime > maxWait) {
        clearInterval(check);
        resolve();
      }
    }, 1000);
  });

  console.log(`\n--- Finished: ${count} messages received ---`);
  await consumer.disconnect();
  process.exit(0);
}

debugConsume().catch(console.error);

