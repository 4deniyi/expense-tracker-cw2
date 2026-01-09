const { CosmosClient } = require("@azure/cosmos");
const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");

function getEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function cosmos() {
  const endpoint = getEnv("COSMOS_ENDPOINT");
  const key = getEnv("COSMOS_KEY");
  const databaseId = getEnv("COSMOS_DATABASE");
  const containerId = getEnv("COSMOS_CONTAINER");
  const client = new CosmosClient({ endpoint, key });
  const container = client.database(databaseId).container(containerId);
  return { container };
}

function blob() {
  const conn = getEnv("BLOB_CONNECTION_STRING");
  const containerName = getEnv("BLOB_CONTAINER");
  const service = BlobServiceClient.fromConnectionString(conn);
  const container = service.getContainerClient(containerName);
  return { container };
}

async function ensureBlobContainer() {
  const { container } = blob();
  await container.createIfNotExists();
}

async function uploadBase64Image(base64, contentType) {
  const { container } = blob();
  const id = uuidv4();
  const ext = contentType === "image/png" ? "png" : "jpg";
  const blobName = `receipts/${id}.${ext}`;

  const buffer = Buffer.from(base64, "base64");
  const blockBlob = container.getBlockBlobClient(blobName);
  await blockBlob.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType || "image/jpeg" }
  });

  return blockBlob.url;
}

module.exports = {
  cosmos,
  ensureBlobContainer,
  uploadBase64Image,
  notifyLogicApp
};

async function notifyLogicApp(expense) {
  const url = process.env.LOGIC_APP_URL;
  if (!url) return;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense)
  });
}

module.exports.notifyLogicApp = notifyLogicApp;
