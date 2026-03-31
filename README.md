# 🧪 Azure Event Hub (Kafka) Emulator – Local Setup Guide

This guide walks you through setting up and running the Azure Event Hub Kafka Emulator locally using Docker and WSL, plus testing it with a simple KafkaJS app.

---

## 📦 Prerequisites

Make sure you have:

- Docker Desktop
- WSL (Windows Subsystem for Linux)
- Git
- Node.js + npm

---

## 🚀 Step 1: Clone the Emulator Repo

Open PowerShell and run:

```bash
git clone https://github.com/Azure/azure-event-hubs-emulator-installer.git
cd azure-event-hubs-emulator-installer
wsl
```

---

## ▶️ Step 2: Launch the Emulator

Inside WSL:

```bash
./LaunchEmulator.sh
```

This starts two containers:

- eventhubs-emulator
- azurite (Azure Storage emulator)

### ❗ If Script Not Found

```bash
ls
find . -name "LaunchEmulator.sh"
cd EventHub-Emulator/Scripts/Common
chmod +x LaunchEmulator.sh
./LaunchEmulator.sh
```

### ⚠️ Port Error Fix

If port 10000 is already in use, stop the conflicting container and rerun the script.

---

## ⚙️ Step 3: Configure the Emulator

If config.json doesn't exist under azure-event-hubs-emulator-installer\EventHub-Emulator\Config, create a new one with the json below. If exists, paste the json below. 

```bash
ls -l ../EventHub-Emulator/Config/Config.json
```

If missing:

```bash
mkdir -p ../EventHub-Emulator/Config
nano ../EventHub-Emulator/Config/Config.json
```

Paste:

```json
{
  "UserConfig": {
    "NamespaceConfig": [
      {
        "Type": "EventHub",
        "Name": "emulatorNs1",
        "Entities": [
          {
            "Name": "eh1",
            "PartitionCount": "2",
            "ConsumerGroups": [
              { "Name": "cg1" }
            ]
          }
        ]
      }
    ],
    "LoggingConfig": {
      "Type": "File"
    }
  }
}
```
---

## 🧑‍💻 Step 4: Setup Test Application

```bash
npm install kafkajs
npm install -D typescript ts-node @types/node
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  }
}
```

---

## 🔌 Kafka Configuration

```ts
export const connectionString =
  "Endpoint=sb://localhost;" +
  "SharedAccessKeyName=RootManageSharedAccessKey;" +
  "SharedAccessKey=SAS_KEY_VALUE;" +
  "UseDevelopmentEmulator=true;";

export const kafkaConfig = {
  clientId: "local-app",
  brokers: ["localhost:9092"],
  ssl: false,
  sasl: {
    mechanism: "plain" as const,
    username: "$ConnectionString",
    password: connectionString
  }
};

export const topic = "eh1";
export const consumerGroup = "cg1";
```

---

## 🧪 Step 5: Run Producer & Consumer

Terminal 1:
```bash
npm run consumer
```

Terminal 2:
```bash
npm run producer
```

---

## 🔍 Step 6: Peek at Messages

To view all messages in the topic (including unconsumed ones), run:

```bash
npm run peek
```

This will:
- Connect with a **temporary consumer group** (doesn't affect your actual consumer's offsets)
- Read **all messages from the beginning** of the topic
- Display each message with partition, offset, key, value, and timestamp
- Automatically exit after 5 seconds of no new messages

---

## 📊 Step 7: Check Consumer Lag

To see how many messages are **not yet consumed** by your consumer group:

```bash
npm run lag
```

This shows:
- **Latest offset** - total messages produced to each partition
- **Committed offset** - where your consumer group has read up to
- **Lag** - number of unconsumed messages

### 💡 Understanding Kafka Message Retention

Unlike traditional message queues (RabbitMQ, SQS), **Kafka does NOT delete messages after consumption**:

| Concept | Description |
|---------|-------------|
| **Message Persistence** | Messages stay in the topic until retention period expires (e.g., 7 days) |
| **Consumer Offsets** | Each consumer group has a "bookmark" tracking what it has read |
| **Peek vs Lag** | `peek` shows ALL messages; `lag` shows how many are unconsumed |

This means:
- `npm run peek` will **always show all messages** (within retention)
- `npm run consumer` just moves your consumer group's offset forward
- Running consumer again won't re-read old messages (offset is saved)

---

## ✅ Done!

You now have a working local Kafka-compatible Azure Event Hub emulator.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run producer` | Send test messages to Kafka topic |
| `npm run consumer` | Consume messages (commits offsets) |
| `npm run peek` | View ALL messages in topic (doesn't affect offsets) |
| `npm run lag` | Check how many messages are unconsumed |

