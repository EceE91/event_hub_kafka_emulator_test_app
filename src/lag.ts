import { Kafka } from "kafkajs";
import { kafkaConfig, topic, consumerGroup } from "./kafkaConfig";

/**
 * Shows consumer group lag - the number of messages not yet consumed
 * by your actual consumer group.
 */
async function checkLag() {
  const kafka = new Kafka(kafkaConfig);
  const admin = kafka.admin();

  await admin.connect();
  console.log(`Checking lag for consumer group: ${consumerGroup}\n`);

  try {
    // Get the current offsets for the consumer group
    const groupOffsets = await admin.fetchOffsets({ groupId: consumerGroup, topics: [topic] });
    
    // Get the latest offsets for the topic (high watermark)
    const topicOffsets = await admin.fetchTopicOffsets(topic);


    console.log("Partition | Latest | Committed | Lag (unconsumed)");
    console.log("----------|--------|-----------|------------------");

    let totalLag = 0;

    for (const partition of topicOffsets) {
      const partitionId = partition.partition;
      const latestOffset = parseInt(partition.offset);
      
      // Find committed offset for this partition
      const groupPartition = groupOffsets[0]?.partitions.find(p => p.partition === partitionId);
      const committedOffset = groupPartition ? parseInt(groupPartition.offset) : 0;
      
      // Lag = latest - committed (if committed is -1, consumer hasn't started)
      const lag = committedOffset < 0 ? latestOffset : Math.max(0, latestOffset - committedOffset);
      totalLag += lag;

      console.log(`    ${partitionId}     |   ${latestOffset.toString().padStart(4)}  |    ${committedOffset.toString().padStart(4)}    |       ${lag}`);
    }

    console.log("----------|--------|-----------|------------------");
    console.log(`                     Total Lag: ${totalLag} messages`);

  } catch (error: any) {
    if (error.message?.includes("The group id does not exist")) {
      console.log("Consumer group hasn't consumed any messages yet.");
      console.log("All messages in the topic are unconsumed.");
    } else {
      throw error;
    }
  }

  await admin.disconnect();
}

checkLag().catch(console.error);