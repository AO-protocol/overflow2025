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
  process.env.RESOURCE_SERVER_URL || "http://localhost:4021";

// Create an MCP server
const server = new McpServer({
  name: "x402 & walrus MCP Server",
  version: "1.0.0",
});

// Express app
const app = express();
app.use(express.json());

// Add tools
server.tool(
  "get-data-from-resource-server",
  "Get data from the resource server (in this example, the weather)",
  {
    type: "object",
    properties: {},
  },
  async () => {
    try {
      const response = await fetch(RESOURCE_SERVER_URL);
      const data = await response.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching data: ${error}`,
          },
        ],
      };
    }
  }
);

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
  "Download a file from Walrus storage & pay USDC via x402",
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

// Create HTTP transport
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // Disable session management
});

// Routes
app.post("/mcp", async (req, res) => {
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
  await ensureServerConnection();
  const serverlessHandler = serverlessExpress({ app });
  return new Promise((resolve, reject) => {
    serverlessHandler(event, context, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result as APIGatewayProxyResult);
      }
    });
  });
};

// Start the server for local development
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
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
}
