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

export const topic = "eh1"; // must match emulator
export const consumerGroup = "cg1"; // from config.json