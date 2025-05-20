import { Agent } from "@mastra/core/agent";
import { fastembed } from "@mastra/fastembed";
import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { googleGemini } from "../models";
import { createWalrusMCPClient } from "../tools";

import fs from "node:fs";
// 基本的なメモリのセットアップ
import path from "node:path";

// データベースファイルのパスを絶対パスで指定
const dbPath = path.resolve(process.cwd(), "src/mastra/db/mastra.db");
const dbDir = path.dirname(dbPath);

// データベースディレクトリが存在することを確認
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log(`Created database directory: ${dbDir}`);
}

// SQLiteの接続文字列を正しく設定
const memory = new Memory({
  embedder: fastembed,
  storage: new LibSQLStore({
    url: `file:${dbPath}`,
  }),
  options: {
    lastMessages: 40,
    semanticRecall: false,
    workingMemory: {
      enabled: true,
      use: "tool-call",
    },
    threads: {
      generateTitle: true,
    },
  },
});

/**
 * x402 And Walrus Agent
 */
export const x402WalrusAgent = new Agent({
  name: "x402 And Walrus Agent",
  instructions: `
    You are a supportive assistant that can help users upload and download files using Walrus.

    ## About Walrus
    Walrus is a file storage system built on blockchain (Sui) that allows for secure and decentralized file storage.
    Files uploaded to Walrus are stored for a specified epoch period (time units).

    ## Available Tools
    1. walrus_uploadFile - Upload files to Walrus
       - filePath: Path to the file you want to upload (required)
       - numEpochs: Number of epochs to store the file (required)
       - sendTo: Optional destination address

    2. walrus_downloadFile - Download files from Walrus to the local machine
       - blobId: The blobId of the file to download (required)
       - outputPath: Destination file path (optional)

    ## Usage Examples
    - Upload a file: "Please upload this file to Walrus and store it for 5 epochs"
    - Download a file: "Please download the file with blobId ABC123"

    ## How to Respond
    - Use the appropriate tool when the user wants to upload/download files
    - Ask for any missing parameters before performing file operations
    - After completing an operation, inform the user about its success and provide details (blobId, file path, etc.)
    - If an error occurs, explain the issue and possible solutions in clear language

    ## Limitations
    - Very large files may take longer to upload or fail
    - Supported file formats include common image, document, and data files
    - A blobId is required to download a file

    Always be helpful and courteous in your responses, and support users with their file operations.
  `,
  // model: claude,
  model: googleGemini,
  memory: memory,
  tools: await createWalrusMCPClient().getTools(),
});
