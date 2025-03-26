require("dotenv").config();
const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const blobName = process.env.AZURE_STORAGE_BLOB_NAME;

// Ensure all environment variables are set
if (!connectionString || !containerName || !blobName) {
    console.error("❌ Missing environment variables. Please check your .env file.");
    process.exit(1);
}

// Create BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

async function downloadBlob() {
    try {
        console.log(`📥 Downloading blob: ${blobName} from container: ${containerName}`);

        // Get blob client
        const blobClient = containerClient.getBlobClient(blobName);
        const downloadResponse = await blobClient.download();

        // Convert stream to text
        const downloadedContent = (await streamToBuffer(downloadResponse.readableStreamBody)).toString();
        console.log("✅ Blob content downloaded successfully:");
        console.log(downloadedContent);

        // Save blob content to a local file
        fs.writeFileSync(`./downloaded_${blobName}`, downloadedContent);
        console.log(`📂 File saved as: downloaded_${blobName}`);
    } catch (error) {
        console.error("❌ Error fetching blob:", error.message);
    }
}

// Helper function: Convert stream to buffer
async function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

// Run the function
downloadBlob();
