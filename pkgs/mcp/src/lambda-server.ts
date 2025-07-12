import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import serverlessExpress from "@vendia/serverless-express";
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import express from "express";
import fetch from "node-fetch";
import { z } from "zod";
import { downloadFile } from "./walrus/download.js";
import { uploadFile } from "./walrus/upload.js";

// Environment variables
const PORT = Number.parseInt(process.env.PORT || "8080", 10);
const RESOURCE_SERVER_URL = process.env.RESOURCE_SERVER_URL!;

console.log("Lambda function started!");
console.log("Using RESOURCE_SERVER_URL:", RESOURCE_SERVER_URL);
console.log("Environment variables:", JSON.stringify(process.env, null, 2));

// Create an MCP server
const server = new McpServer({
  name: "x402 & walrus MCP Server",
  version: "1.0.0",
});

// Express app
const app = express();
app.use(express.json());

// リクエストログ用ミドルウェア
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  next();
});

// Add tools
server.tool(
  "upload-file-to-walrus",
  "Upload a file to Walrus storage",
  {
    fileContent: z
      .string()
      .describe("Base64 encoded file content (for Lambda environment)"),
    fileName: z.string().describe("Name of the file including extension"),
    numEpochs: z.number().describe("Number of epochs to store the file"),
    sendTo: z.string().optional().describe("Optional recipient address"),
  },
  async ({ fileContent, fileName, numEpochs, sendTo }) => {
    console.log("Upload tool called with args:");
    console.log("fileName:", fileName);
    console.log("numEpochs:", numEpochs);
    console.log("sendTo:", sendTo);
    console.log("fileContent length:", fileContent?.length || 0);

    try {
      // Lambda環境では、Base64でエンコードされたファイル内容を受け取る
      if (!fileContent || !fileName) {
        throw new Error("fileContent and fileName are required");
      }

      // Base64をデコードして一時ファイルを作成
      const fs = await import("node:fs");
      const path = await import("node:path");
      
      const tempDir = "/tmp"; // Lambda環境で書き込み可能なディレクトリ
      const tempFilePath = path.join(tempDir, fileName);
      
      console.log("Creating temporary file:", tempFilePath);
      
      // Base64デコード
      const fileBuffer = Buffer.from(fileContent, "base64");
      fs.writeFileSync(tempFilePath, fileBuffer);
      
      console.log("Temporary file created, uploading to Walrus...");
      
      // 既存のアップロード関数を使用
      const result = await uploadFile(tempFilePath, numEpochs, sendTo);
      
      // 一時ファイルを削除
      try {
        fs.unlinkSync(tempFilePath);
        console.log("Temporary file cleaned up");
      } catch (cleanupError) {
        console.warn("Failed to cleanup temporary file:", cleanupError);
      }
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "success",
              message: "File uploaded to Walrus storage successfully",
              blobId: result.blobId,
              blobUrl: result.blobUrl,
              endEpoch: result.endEpoch,
              suiUrl: result.suiUrl,
              fileName: fileName,
            }),
          },
        ],
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error uploading file: ${error}`,
          },
        ],
      };
    }
  },
);

server.tool(
  "download-file-from-walrus-and-pay-USDC-via-x402",
  "Download a file from Walrus decentralized storage network with automatic USDC payment processing through x402 payment gateway. This tool retrieves files stored on Walrus using their unique Blob ID, handles the payment verification, and saves the file to your specified location. The payment ensures access to premium download speeds and guaranteed availability. When running in Lambda environment, the file content is returned as Base64 encoded data for local saving.",
  {
    blobId: z.string().describe("The blob ID of the file to download"),
    outputPath: z
      .string()
      .optional()
      .describe("Optional output path for the downloaded file"),
  },
  async ({ blobId, outputPath }) => {
    console.log("Download tool called with args:");
    console.log("blobId:", blobId);
    console.log("outputPath:", outputPath);

    console.log("Downloading file with blobId:", blobId);
    console.log("Output path:", outputPath);

    try {
      const result = await downloadFile(blobId, outputPath);

      // Lambda環境の場合、ファイル内容をBase64エンコードして返す
      if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
        console.log("Running in Lambda environment, returning file content");
        const fs = await import("node:fs");

        if (fs.existsSync(result.filePath)) {
          const fileContent = fs.readFileSync(result.filePath);
          const base64Content = fileContent.toString("base64");

          // ファイル名を決定
          const originalExtension = getFileExtension(result.contentType);
          const suggestedFilename =
            outputPath ||
            `downloaded-${blobId.substring(0, 8)}${originalExtension}`;

          // Lambda環境の一時ファイルを削除
          fs.unlinkSync(result.filePath);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  status: "success",
                  message:
                    "File downloaded from Walrus storage successfully. File content included as Base64 data.",
                  blobId: result.blobId,
                  contentType: result.contentType,
                  size: result.size,
                  suggestedFilename: suggestedFilename,
                  originalOutputPath: outputPath,
                  fileContent: base64Content,
                  metadata: result.metadata,
                  downloadUrl: `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`,
                  instructions:
                    "The file content is Base64 encoded. Decode and save to your desired location.",
                }),
              },
            ],
          };
        } else {
          throw new Error(`Downloaded file not found at: ${result.filePath}`);
        }
      }

      // ローカル環境の場合は従来通り
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "success",
              message: "File downloaded from Walrus storage and saved locally.",
              filePath: result.filePath,
              blobId: result.blobId,
              contentType: result.contentType,
              size: result.size,
              metadata: result.metadata,
              downloadUrl: `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`,
            }),
          },
        ],
      };
    } catch (error) {
      console.error("Download error:", error);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: error instanceof Error ? error.message : String(error),
              blobId: blobId,
              downloadUrl: `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`,
            }),
          },
        ],
      };
    }
  }
);

server.tool(
  "get-data-from-resource-server",
  "Get data from the resource server (in this example, the weather)",
  {},
  async () => {
    try {
      console.log("リソースサーバーに接続を試行中:", RESOURCE_SERVER_URL);

      // まず基本的な接続テストを行う
      const healthUrl = `${RESOURCE_SERVER_URL}/health`;
      console.log("ヘルスチェックURL:", healthUrl);

      const response = await fetch(healthUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "AWS-Lambda-MCP-Client/1.0",
        },
      });

      console.log("レスポンス ステータス:", response.status);
      console.log("レスポンス ヘッダー:", Object.fromEntries(response.headers));

      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      let data: string;
      if (contentType?.includes("application/json")) {
        const jsonData = await response.json();
        data = JSON.stringify(jsonData, null, 2);
      } else {
        data = await response.text();
      }

      return {
        content: [
          {
            type: "text",
            text: `リソースサーバーからの応答:\nURL: ${healthUrl}\nステータス: ${response.status}\nContent-Type: ${contentType}\nデータ: ${data}`,
          },
        ],
      };
    } catch (error) {
      console.error("リソースサーバーへの接続エラー:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `リソースサーバーへの接続エラー: ${errorMessage}\nURL: ${RESOURCE_SERVER_URL}\nエラーの詳細: ${error}`,
          },
        ],
      };
    }
  }
);

// Create HTTP transport
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // Disable session management
});

// Routes
app.post("/mcp", async (req, res) => {
  console.log("MCP POST request received!");
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request handling error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.get("/mcp", async (req, res) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

app.delete("/mcp", async (req, res) => {
  res.writeHead(405).end(
    JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed.",
      },
      id: null,
    })
  );
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// For AWS Lambda
let serverConnected = false;
const ensureServerConnection = async () => {
  if (!serverConnected) {
    await server.connect(transport);
    serverConnected = true;
  }
};

// Lambda handler
export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("Lambda handler called!");
  console.log("Event:", JSON.stringify(event, null, 2));
  console.log("Context:", JSON.stringify(context, null, 2));

  try {
    await ensureServerConnection();
    const serverlessHandler = serverlessExpress({ app });
    return new Promise((resolve, reject) => {
      serverlessHandler(event, context, (error, result) => {
        if (error) {
          console.error("Serverless handler error:", error);
          reject(error);
        } else {
          console.log("Serverless handler success:", result);
          resolve(result as APIGatewayProxyResult);
        }
      });
    });
  } catch (error) {
    console.error("Lambda handler error:", error);
    throw error;
  }
};

server
  .connect(transport)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`MCP server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server setup failed:", error);
    process.exit(1);
  });

/**
 * Helper function to get file extension from content type
 *
 * @param contentType - MIME type of the file
 * @returns File extension with dot prefix
 */
function getFileExtension(contentType: string): string {
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
    "application/octet-stream": ".bin",
  };

  return mimeToExtension[contentType] || ".bin";
}
