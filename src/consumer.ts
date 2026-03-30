import { Kafka } from "kafkajs";
import { kafkaConfig, topic, consumerGroup } from "./kafkaConfig";

async function run() {
  const kafka = new Kafka(kafkaConfig);

  const consumer = kafka.consumer({
    groupId: consumerGroup
  });

  await consumer.connect();

  await consumer.subscribe({
    topic,
    fromBeginning: true // replay all messages on first run
  });

  console.log(`Consumer listening (group: ${consumerGroup})...`);

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