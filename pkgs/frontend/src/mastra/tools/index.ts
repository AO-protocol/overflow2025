import { MCPClient } from "@mastra/mcp";

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
        command: "node",
        args: [process.env.PATH_TO_MCP as string],
        env: {
          PRIVATE_KEY: process.env.PRIVATE_KEY as string,
          RESOURCE_SERVER_URL: "http://localhost:4021",
          ENDPOINT_PATH: "/download",
        },
      },
    },
    timeout: 60000, // タイムアウト: 60秒
  });

  return mcpClient;
};

/**
 * ツールだけ取得するメソッド
 */
export const getwalrusMCPCTools = async () => {
  const walrusMCPClient = createWalrusMCPClient();
  return await walrusMCPClient.getTools();
};
