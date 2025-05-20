import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { downloadFile } from "./walrus/download.js";
import { uploadFile } from "./walrus/upload.js";

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
    return {
      content: [{ type: "text", text: JSON.stringify("success!") }],
    };
  }
);

// Add Walrus upload file tool
server.tool(
  "upload-file-to-walrus",
  "Upload a file to Walrus storage",
  {
    filePath: z.string(),
    numEpochs: z.number(),
    sendTo: z.string().optional(),
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
  }
);

// Add Walrus download file tool
server.tool(
  "download-file-from-walrus-and-pay-USDC-via-x402",
  "Download a file from Walrus storage & pay USDC via x402",
  {
    blobId: z.string(),
    outputPath: z.string().optional(),
  },
  async ({ blobId, outputPath }) => {
    try {
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
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
