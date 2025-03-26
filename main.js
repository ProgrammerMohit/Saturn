require("dotenv").config();
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");

// Load environment variables
const keyVaultName = process.env.KEY_VAULT_NAME;
const secretName = process.env.SECRET_NAME; // The secret contains AZURE_STORAGE_CONNECTION_STRING
const vaultUrl = `https://${keyVaultName}.vault.azure.net`;

const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;
const blobName = process.env.AZURE_STORAGE_BLOB_NAME;

if (!keyVaultName || !secretName || !containerName || !blobName) {
    console.error("❌ Missing environment variables. Please check your .env file.");
    process.exit(1);
}

// Authenticate with Azure
const credential = new DefaultAzureCredential();
const keyVaultClient = new SecretClient(vaultUrl, credential);

// Function to fetch secret from Key Vault
async function fetchSecret() {
    try {
        console.log("🔄 Fetching Storage Account connection string from Azure Key Vault...");
        const secret = await keyVaultClient.getSecret(secretName);
        console.log("✅ Secret fetched successfully!");
        return secret.value;
    } catch (error) {
        console.error("❌ Error fetching secret from Key Vault:", error.message);
        throw error;
    }
}

// Function to download blob from Azure Storage
 
async function downloadBlob(connectionString) {
    try {
        console.log("🔄 Connecting to Azure Blob Storage...");
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobName);

        console.log(`📥 Downloading blob: ${blobName} from container: ${containerName}`);
        const downloadResponse = await blobClient.download();
        const downloadedContent = (await streamToBuffer(downloadResponse.readableStreamBody)).toString();

        console.log("✅ Blob content downloaded successfully:");
        console.log(downloadedContent);

        // Save blob content to a local file
        fs.writeFileSync(`./downloaded_${blobName}`, downloadedContent);
        console.log(`📂 File saved as: downloaded_${blobName}`);
    } catch (error) {
        console.error("❌ Error fetching blob from Azure Storage:", error.message);
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

// Main function
async function main() {
    try {
        const connectionString = await process.env.AZURE_STORAGE_CONNECTION_STRING;
        await downloadBlob(connectionString);
        await fetchSecret() // Fetch storage connection string from Key Vault
        // Download blob using the connection string
    } catch (error) {
        console.error("❌ Process failed:", error.message);
    }
}

// Run the process
main();
