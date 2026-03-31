import { Kafka } from "kafkajs";
import { kafkaConfig, topic, consumerGroup } from "./kafkaConfig";

async function run() {
  const kafka = new Kafka(kafkaConfig);

  const consumer = kafka.consumer({
    groupId: consumerGroup
  });

  await consumer.connect();
  console.log(`Connected to Kafka`);

  await consumer.subscribe({
    topic,
    fromBeginning: true // only affects first run of this consumer group
  });
  console.log(`Subscribed to topic: ${topic}`);
  console.log(`Consumer group: ${consumerGroup}`);
  console.log(`Waiting for messages...\n`);

  let messageCount = 0;

  await consumer.run({
    eachMessage: async ({ partition, message, heartbeat }) => {
      messageCount++;
      const timestamp = new Date(parseInt(message.timestamp)).toISOString();
      
      console.log(`\n========== MESSAGE #${messageCount} ==========`);
      console.log(`Partition: ${partition}`);
      console.log(`Offset: ${message.offset}`);
      console.log(`Key: ${message.key?.toString() ?? "(none)"}`);
      console.log(`Timestamp: ${timestamp}`);
      console.log(`Value:`);
      console.log(message.value?.toString());
      console.log(`=====================================\n`);
      
      await heartbeat();
    }
  });
}

run().catch(console.error);