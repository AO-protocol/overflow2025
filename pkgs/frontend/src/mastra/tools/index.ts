import { MCPClient } from "@mastra/mcp";

interface LogMessage {
  level: string;
  message: string;
}

/**
 * WalrusのファイルアップロードとダウンロードのMCP Clientを作成
 * @returns MCPClientインスタンス
 */
export const createWalrusMCPClient = () => {
  // create MCPClient instance
  // this mcp has 3 tools
  const mcpClient = new MCPClient({
    id: "x402-walrus-tools", 
    servers: {
      walrus: {
        command: "pnpm",
        args: [
          "--silent",
          "-C",
          "/Users/harukikondo/git/overflow2025", // ここは各々の環境合わせて変更する
          "mcp",
          "dev"
        ],
        env: {
          PRIVATE_KEY: process.env.PRIVATE_KEY as string,
          RESOURCE_SERVER_URL: "http://localhost:4021",
          ENDPOINT_PATH: "/download",
        },
        log: (logMessage: LogMessage) => {
          console.log(`[${logMessage.level}] ${logMessage.message}`);
        },
      },
    },
    timeout: 60000, // タイムアウト: 60秒
  });

  return mcpClient;
};