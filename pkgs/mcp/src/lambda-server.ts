import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import serverlessExpress from "@vendia/serverless-express";
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import express from "express";
import { z } from "zod";
import { downloadFile } from "./walrus/download.js";
import { uploadFile } from "./walrus/upload.js";

// Environment variables
const PORT = Number.parseInt(process.env.PORT || "8080", 10);
const RESOURCE_SERVER_URL =
  process.env.RESOURCE_SERVER_URL ||
  "http://awsx40-backe-sh4quwo8qxwb-1187647147.ap-northeast-1.elb.amazonaws.com";

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
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "The path to the file to upload",
      },
      numEpochs: {
        type: "number",
        description: "Number of epochs to store the file",
      },
      sendTo: {
        type: "string",
        description: "Optional recipient address",
      },
    },
    required: ["filePath", "numEpochs"],
  },
  async (args) => {
    const { filePath, numEpochs, sendTo } = z
      .object({
        filePath: z.string(),
        numEpochs: z.number(),
        sendTo: z.string().optional(),
      })
      .parse(args);

    console.log("Uploading file:", filePath);
    console.log("Number of epochs:", numEpochs);
    console.log("Send to address:", sendTo);

    try {
      const result = await uploadFile(filePath, numEpochs, sendTo);
      return {
        content: [
          {
            type: "text",
            text: `File uploaded successfully. Blob ID: ${result.blobId}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error uploading file: ${error}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "download-file-from-walrus-and-pay-USDC-via-x402",
  `
    Download a file from Walrus decentralized storage network with automatic USDC payment processing through x402 payment gateway. 
    This tool retrieves files stored on Walrus using their unique Blob ID, handles the payment verification, and saves the file to your specified location. 
    The payment ensures access to premium download speeds and guaranteed availability.
  `,
  {
    type: "object",
    properties: {
      blobId: {
        type: "string",
        description: "The blob ID of the file to download",
      },
      outputPath: {
        type: "string",
        description: "Optional output path for the downloaded file",
      },
    },
    required: ["blobId"],
  },
  async (args) => {
    const { blobId, outputPath } = z
      .object({
        blobId: z.string(),
        outputPath: z.string().optional(),
      })
      .parse(args);

    console.log("Downloading file with blobId:", blobId);
    console.log("Output path:", outputPath);

    try {
      const result = await downloadFile(blobId, outputPath);
      return {
        content: [
          {
            type: "text",
            text: `File downloaded successfully: ${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error downloading file: ${error}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "get-data-from-resource-server",
  "Get data from the resource server (in this example, the weather)",
  {
    type: "object",
    properties: {},
  },
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
          `HTTP error! status: ${response.status} ${response.statusText}`,
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `リソースサーバーへの接続エラー: ${errorMessage}\nURL: ${RESOURCE_SERVER_URL}\nエラーの詳細: ${error}`,
          },
        ],
      };
    }
  },
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
  context: Context,
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
