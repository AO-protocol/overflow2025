/**
 * Script to download files from Walrus
 */

import axios from "axios";
import { config } from "dotenv";
import fetch from "node-fetch";
import fs from "node:fs";
import path from "node:path";
import type { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";

config();

const privateKey = process.env.PRIVATE_KEY as Hex;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /weather

console.log("Environment variables check:");
console.log("PRIVATE_KEY:", privateKey ? "***SET***" : "NOT SET");
console.log("RESOURCE_SERVER_URL:", baseURL || "NOT SET");
console.log("ENDPOINT_PATH:", endpointPath || "NOT SET");

if (!privateKey || !baseURL || !endpointPath) {
  throw new Error(`Missing environment variables: ${!privateKey ? 'PRIVATE_KEY ' : ''}${!baseURL ? 'RESOURCE_SERVER_URL ' : ''}${!endpointPath ? 'ENDPOINT_PATH ' : ''}`);
}

// Create a wallet client to handle payments
const account = privateKeyToAccount(privateKey);

// Create an axios client with payment interceptor using x402-axios
const client = withPaymentInterceptor(axios.create({ baseURL }), account);

// Walrus settings
const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

/**
 * Script to download files from Walrus
 *
 * @param blobId Download Blob ID
 * @param outputPath Save path
 * @returns Downloaded file paths and information
 */
export async function downloadFile(
  blobId: string,
  outputPath?: string
): Promise<any> {
  const downloadUrl = `${AGGREGATOR}/v1/blobs/${blobId}`;

  console.log(`Downloading blob: ${blobId}`);
  console.log(`Download URL: ${downloadUrl}`);

  try {
    // pay via x402
    const res = await client.get(endpointPath);
    console.log("x402 response status", res.status);
    console.log("x402 response data", res.data);
    // Download Blob with GET request
    const response = await fetch(downloadUrl);

    if (response.status !== 200) {
      throw new Error(`Download failed with status: ${response.status}`);
    }

    // Get Content-Type from response header
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();
    const fileData = Buffer.from(buffer);

    // Generates a temporary file name if no output path is specified
    const finalOutputPath =
      outputPath ||
      path.join(
        process.cwd(),
        `downloaded-${blobId.substring(0, 8)}${getExtensionFromMime(contentType)}`
      );

    // Save File
    fs.writeFileSync(finalOutputPath, fileData);

    console.log(`File downloaded successfully to: ${finalOutputPath}`);

    // Create basic result object
    const result = {
      filePath: finalOutputPath,
      blobId,
      contentType,
      size: fileData.length,
      metadata: null,
    };

    try {
      // Retrieve metadata (optional - continue processing if failed)
      const metadataUrl = `${AGGREGATOR}/v1/blobs/${blobId}/info`;
      console.log(`Fetching metadata from: ${metadataUrl}`);

      const metadataResponse = await fetch(metadataUrl);

      if (metadataResponse.status === 200) {
        const responseText = await metadataResponse.text();
        if (responseText && responseText.trim().length > 0) {
          try {
            result.metadata = JSON.parse(responseText);
            console.log("Metadata retrieved successfully");
          } catch (parseError) {
            console.warn(
              `Error parsing metadata JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`
            );
            console.log(
              "Raw metadata response:",
              responseText.substring(0, 100) + "..."
            );
          }
        } else {
          console.warn("Metadata endpoint returned empty response");
        }
      } else {
        console.warn(
          `Metadata endpoint returned status: ${metadataResponse.status}`
        );
      }
    } catch (metadataError) {
      console.warn(
        `Failed to retrieve metadata: ${metadataError instanceof Error ? metadataError.message : String(metadataError)}`
      );
    }

    return result;
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

/**
 * Function to get the appropriate file extension from the MIME type
 */
function getExtensionFromMime(mimeType: string): string {
  const mimeToExtension: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "application/json": ".json",
    "text/html": ".html",
    "text/css": ".css",
    "application/javascript": ".js",
  };

  return mimeToExtension[mimeType] || "";
}
