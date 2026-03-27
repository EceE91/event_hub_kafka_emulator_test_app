import { Kafka } from "kafkajs";
import { kafkaConfig, topic } from "./kafkaConfig";

async function run() {
  const kafka = new Kafka(kafkaConfig);

  // DEBUG VIEWER GROUP
  const consumer = kafka.consumer({
    groupId: "debug-viewer"
  });

  await consumer.connect();

  await consumer.subscribe({
    topic,
    fromBeginning: true // replay all messages
  });

  console.log("Debug consumer listening...");

  await consumer.run({
    eachMessage: async ({ partition, message }) => {
      console.log(
        `Partition ${partition}:`,
        message.value?.toString()
      );
    }
  });
}

run().catch(console.error);