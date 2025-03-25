require("dotenv").config();
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");


const keyVaultName = process.env.KEY_VAULT_NAME;
const secretName = process.env.SECRET_NAME;
const vaultUrl = `https://${keyVaultName}.vault.azure.net`;


const credential = new DefaultAzureCredential();
const client = new SecretClient(vaultUrl, credential);

async function fetchSecret() {
    try {
        const secret = await client.getSecret(secretName);
        console.log(`Fetched secret: ${secret.value}`);
    } catch (error) {
        console.error("Error fetching secret:", error);
    }
}

fetchSecret();
