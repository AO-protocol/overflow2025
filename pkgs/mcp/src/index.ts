import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { config } from "dotenv";
import type { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";
import { downloadFile } from "./walrus/download.js";
import { uploadFile } from "./walrus/upload.js";

// Load environment variables and throw an error if any are missing
config();

const privateKey = process.env.PRIVATE_KEY as Hex;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /weather

if (!privateKey || !baseURL || !endpointPath) {
  throw new Error("Missing environment variables");
}

// Create a wallet client to handle payments
const account = privateKeyToAccount(privateKey);

// Create an axios client with payment interceptor using x402-axios
const client = withPaymentInterceptor(axios.create({ baseURL }), account);

// Create an MCP server
const server = new McpServer({
  name: "x402 & walrus MCP Client",
  version: "1.0.0",
});

// Add tools
server.tool(
  "get-data-from-resource-server",
  "Get data from the resource server (in this example, the weather)",
  {},
  async () => {
    const res = await client.get(endpointPath);
    return {
      content: [{ type: "text", text: JSON.stringify(res.data) }],
    };
  },
);

// Add Walrus upload file tool
server.tool(
  "upload-file-to-walrus",
  "Upload a file to Walrus storage",
  {
    type: "object",
    properties: {
      filePath: {
        type: "string",
        description: "Path to the file that should be uploaded",
      },
      numEpochs: {
        type: "number",
        description: "Number of epochs to store the file for",
      },
      sendTo: {
        type: "string",
        description: "Optional: Address to send the object to",
      },
    },
    required: ["filePath", "numEpochs"],
  },
  async ({ filePath, numEpochs, sendTo }) => {
    try {
      const result = await uploadFile(filePath, numEpochs, sendTo);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "success",
              blobId: result.blobId,
              blobUrl: result.blobUrl,
              endEpoch: result.endEpoch,
              suiUrl: result.suiUrl,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: error instanceof Error ? error.message : String(error),
            }),
          },
        ],
      };
    }
  },
);

// Add Walrus download file tool
server.tool(
  "download-file-from-walrus",
  "Download a file from Walrus storage",
  {
    type: "object",
    properties: {
      blobId: {
        type: "string",
        description: "ID of the blob to download",
      },
      outputPath: {
        type: "string",
        description: "Optional: Path where the downloaded file should be saved",
      },
    },
    required: ["blobId"],
  },
  async ({ blobId, outputPath }) => {
    try {
      // pay via x402
      const res = await client.get(endpointPath);
      console.log("x402 response status", res.status);
      console.log("x402 response data", res.data);

      // file download
      const result = await downloadFile(blobId, outputPath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "success",
              filePath: result.filePath,
              contentType: result.contentType,
              size: result.size,
              metadata: result.metadata,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: "error",
              message: error instanceof Error ? error.message : String(error),
            }),
          },
        ],
      };
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
