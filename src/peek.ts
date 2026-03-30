import { Kafka } from "kafkajs";
import { kafkaConfig, topic } from "./kafkaConfig";

/**
 * Peek at all messages in the topic from the beginning.
 * Uses a random group ID so it doesn't affect your actual consumer offsets.
 */
async function peek() {
  const kafka = new Kafka(kafkaConfig);
  
  // Use a unique group ID so we don't interfere with actual consumers
  const peekGroupId = `peek-${Date.now()}`;
  const consumer = kafka.consumer({ groupId: peekGroupId });

  await consumer.connect();
  console.log(`Connected. Peeking at topic: ${topic}`);

  await consumer.subscribe({ topic, fromBeginning: true });

  let messageCount = 0;
  const timeout = setTimeout(async () => {
    console.log(`\n--- Finished: ${messageCount} messages found ---`);
    await consumer.disconnect();
    process.exit(0);
  }, 5000); // Exit after 5 seconds of no new messages

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      messageCount++;
      console.log({
        partition,
        offset: message.offset,
        key: message.key?.toString(),
        value: message.value?.toString(),
        timestamp: message.timestamp
      });
      
      // Reset timeout on each message
      timeout.refresh();
    }
  });
}

peek().catch(console.error);

