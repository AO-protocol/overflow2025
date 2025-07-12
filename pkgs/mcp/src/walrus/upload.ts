/**
 * Script to upload files to Walrus
 */

import fetch from "node-fetch";
import fs from "node:fs";
import path from "node:path";

// Walrus settings
const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const PUBLISHER = "https://publisher.walrus-01.tududes.com";

// Sui related settings
const SUI_NETWORK = "testnet";
const SUI_VIEW_TX_URL = `https://suiscan.xyz/${SUI_NETWORK}/tx`;
const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/${SUI_NETWORK}/object`;

/**
 * Function to upload a file to Walrus using base64 content (for Lambda environment)
 *
 * @param base64Content - Base64 encoded file content
 * @param fileName - Name of the file including extension
 * @param numEpochs - Storage duration (number of epochs)
 * @param sendTo - Optional: Address to send the object to
 * @returns Upload information
 */
export async function uploadFileFromBase64(
  base64Content: string,
  fileName: string,
  numEpochs: number,
  sendTo?: string,
): Promise<any> {
  console.log(`Uploading file from base64: ${fileName}`);
  
  // Create temporary file in /tmp directory (Lambda writeable directory)
  const tempDir = "/tmp";
  const filePath = path.join(tempDir, fileName);
  
  try {
    // Decode base64 content and write to temporary file
    const fileBuffer = Buffer.from(base64Content, "base64");
    fs.writeFileSync(filePath, fileBuffer);
    console.log(`Created temporary file: ${filePath}`);
    
    // Use existing upload logic
    const result = await uploadFile(filePath, numEpochs, sendTo);
    
    // Clean up temporary file
    try {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    } catch (cleanupError) {
      console.warn(`Failed to clean up temporary file: ${cleanupError}`);
    }
    
    return result;
  } catch (error) {
    // Clean up temporary file in case of error
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.warn(`Failed to clean up temporary file after error: ${cleanupError}`);
    }
    throw new Error(`Failed to upload file from base64: ${error}`);
  }
}

/**
 * Function to upload a file to Walrus
 *
 * @param filePath - Path of the file to be uploaded
 * @param numEpochs - Storage duration (number of epochs)
 * @param sendTo - Optional: Address to send the object to
 * @returns Upload information
 */
export async function uploadFile(
  filePath: string,
  numEpochs: number,
  sendTo?: string,
): Promise<any> {
  console.log(`Uploading file: ${filePath}`);
  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${filePath}`);
    throw new Error(`File does not exist: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath);
  const mimeType = getMimeType(filePath);

  console.log(`Uploading file: ${filePath}`);
  console.log(`MIME Type: ${mimeType}`);
  console.log(`Storage duration: ${numEpochs} epochs`);

  // Construct the upload endpoint
  const sendToParam = sendTo ? `&send_object_to=${sendTo}` : "";
  const uploadUrl = `${PUBLISHER}/v1/blobs?epochs=${numEpochs}${sendToParam}`;

  console.log(`Uploading to: ${uploadUrl}`);

  try {
    // Upload the file with a PUT request
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: fileContent,
      headers: {
        "Content-Type": mimeType,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const resultData = await response.json();
    console.log("Upload successful!");

    // Process the response
    const storageInfo = processUploadResponse(
      resultData as Record<string, unknown>
    );
    return storageInfo;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Function to process the upload response
 * @param response Response from the Walrus API
 * @returns Processed upload information
 */
function processUploadResponse(response: Record<string, unknown>): {
  status: string;
  blobId: string;
  endEpoch: number;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
  blobUrl: string;
  suiUrl: string;
} {
  interface InfoType {
    status: string;
    blobId: string;
    endEpoch: number;
    suiRefType: string;
    suiRef: string;
    suiBaseUrl: string;
    blobUrl?: string;
    suiUrl?: string;
  }

  let info: InfoType;

  if (
    "alreadyCertified" in response &&
    typeof response.alreadyCertified === "object" &&
    response.alreadyCertified !== null
  ) {
    const certifiedData = response.alreadyCertified as Record<string, any>;
    info = {
      status: "Already certified",
      blobId: String(certifiedData.blobId || ""),
      endEpoch: Number(certifiedData.endEpoch || 0),
      suiRefType: "Previous Sui Certified Event",
      suiRef: String(
        (certifiedData.event as Record<string, any>)?.txDigest || ""
      ),
      suiBaseUrl: SUI_VIEW_TX_URL,
    };
  } else if (
    "newlyCreated" in response &&
    typeof response.newlyCreated === "object" &&
    response.newlyCreated !== null
  ) {
    const newData = response.newlyCreated as Record<string, any>;
    const blobObject = newData.blobObject as Record<string, any>;
    const storage = blobObject.storage as Record<string, any>;

    info = {
      status: "Newly created",
      blobId: String(blobObject.blobId || ""),
      endEpoch: Number(storage.endEpoch || 0),
      suiRefType: "Associated Sui Object",
      suiRef: String(blobObject.id || ""),
      suiBaseUrl: SUI_VIEW_OBJECT_URL,
    };
  } else {
    throw new Error("Unhandled successful response!");
  }

  // Add the blob URL
  info.blobUrl = `${AGGREGATOR}/v1/blobs/${info.blobId}`;
  info.suiUrl = `${info.suiBaseUrl}/${info.suiRef}`;

  return info as Required<InfoType>;
}

/**
 * Function to infer the MIME type from the file extension
 * @param filePath File path
 * @returns MIME type string
 */
function getMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".json": "application/json",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
  };

  return mimeTypes[extension] || "application/octet-stream";
}
