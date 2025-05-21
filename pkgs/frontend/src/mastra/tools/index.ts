import { MCPClient } from "@mastra/mcp";

interface LogMessage {
  level: string;
  message: string;
}

/**
 * Create MCP Client for file upload and download for Walrus
 * @returns MCPClient instance
 */
export const createWalrusMCPClient = () => {
  // create MCPClient instance
  // this mcp has 3 tools
  const mcpClient = new MCPClient({
    id: "x402-walrus-tools",
    servers: {
      walrus: {
        command: "node",
        args: [process.env.PATH_TO_MCP as string],
        env: {
          PRIVATE_KEY: process.env.PRIVATE_KEY as string,
          RESOURCE_SERVER_URL: "http://localhost:4021",
          ENDPOINT_PATH: "/download",
        },
        // @ts-expect-error server is not a function
        log: (logMessage: LogMessage) => {
          console.log(`[${logMessage.level}] ${logMessage.message}`);
        },
      },
    },
    timeout: 60000, // Timeout: 60 seconds
  });

  return mcpClient;
};
