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

```bash
ls -l ../EventHub-Emulator/ConfigFiles/Config.json
```

If missing:

```bash
mkdir -p ../EventHub-Emulator/ConfigFiles
nano ../EventHub-Emulator/ConfigFiles/Config.json
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

## ✅ Done!

You now have a working local Kafka-compatible Azure Event Hub emulator.
