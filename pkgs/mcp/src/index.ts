import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
    console.log(`[MCP upload-file-to-walrus] Received filePath: ${filePath}, type: ${typeof filePath}`);
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
