import { Kafka } from "kafkajs";
import { kafkaConfig, topic } from "./kafkaConfig";

async function run() {
  const kafka = new Kafka(kafkaConfig);
  const producer = kafka.producer();

  await producer.connect();

  console.log("Sending messages...");

  await producer.send({
    topic,
    messages: [
      {
        key: "1",
        value: JSON.stringify({ message: "Hello from KafkaJS" })
      },
      {
        key: "2",
        value: JSON.stringify({ message: "Another event" })
      }
    ]
  });

  console.log("Messages sent");

  await producer.disconnect();
}

run().catch(console.error);