/**
 * デプロイしたMCPサーバーの機能をテストするためのクライアントスクリプト
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import * as dotenv from "dotenv";
import { join } from "path";
dotenv.config();

// デプロイしたLambda Function URLを使用
const serverUrl = process.env.MCP_SERVER_URL;

const transport = new StreamableHTTPClientTransport(
  new URL(`${serverUrl}/mcp`)
);

const client = new Client({
  name: "x402-walrus-test-client",
  version: "1.0.0",
});

async function testResourceServer(): Promise<void> {
  console.log("\n=== リソースサーバーからのデータ取得テスト ===");
  try {
    const toolResult = await client.callTool({
      name: "get-data-from-resource-server",
      arguments: {},
    });
    console.log("✅ リソースサーバーからのデータ:", toolResult.content);
  } catch (error) {
    console.error("❌ リソースサーバーテストエラー:", error);
  }
}

async function testWalrusUpload(): Promise<string | null> {
  console.log("\n=== Walrusファイルアップロードテスト ===");
  try {
    // テスト用の小さなファイルパス（実際のファイルパスに変更してください）
    const testFilePath = join(__dirname, "../../mcp/samples/sample.txt");

    console.log("📄 アップロードするファイル:", testFilePath);

    const toolResult = await client.callTool({
      name: "upload-file-to-walrus",
      arguments: {
        filePath: testFilePath,
        numEpochs: 5,
        // sendTo: "0x1234567890123456789012345678901234567890",
      },
    });
    console.log("✅ ファイルアップロード結果:", toolResult);

    // アップロード結果からblobIdを抽出
    const content = toolResult.content[0];
    if (content.type === "text" && content.text.includes("Blob ID:")) {
      const blobIdMatch = content.text.match(/Blob ID:\s*([a-zA-Z0-9]+)/);
      if (blobIdMatch) {
        const blobId = blobIdMatch[1];
        console.log("📄 抽出されたBlob ID:", blobId);
        return blobId;
      }
    }
  } catch (error) {
    console.error("❌ ファイルアップロードテストエラー:", error);
  }
  return null;
}

async function testWalrusDownload(blobId: string): Promise<void> {
  console.log("\n=== Walrusファイルダウンロード & x402支払いテスト ===");
  try {
    const toolResult = await client.callTool({
      name: "download-file-from-walrus-and-pay-USDC-via-x402",
      arguments: {
        blobId: blobId,
        outputPath: "/tmp/downloaded_file.txt",
      },
    });
    console.log("✅ ファイルダウンロード結果:", toolResult.content);
  } catch (error) {
    console.error("❌ ファイルダウンロードテストエラー:", error);
  }
}

async function listAvailableTools(): Promise<void> {
  console.log("\n=== 利用可能なツールのリスト ===");
  try {
    const tools = await client.listTools();
    console.log("🔧 利用可能なツール:");
    tools.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`説明: ${tool.description}`);
      console.log(`パラメータ: ${JSON.stringify(tool.inputSchema, null, 2)}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ ツールリスト取得エラー:", error);
  }
}

async function createTestFile(): Promise<void> {
  console.log("\n=== テストファイル作成 ===");
  try {
    const fs = await import("fs/promises");
    const testContent = `X402 & Walrus MCP Server Test File
作成日時: ${new Date().toISOString()}
テストデータ: Hello, Walrus Storage!
`;
    await fs.writeFile("/tmp/test.txt", testContent, "utf8");
    console.log("✅ テストファイルを作成しました: /tmp/test.txt");
  } catch (error) {
    console.error("❌ テストファイル作成エラー:", error);
  }
}

async function main(): Promise<void> {
  console.log("🚀 X402 & Walrus MCP Server テストクライアント開始");
  console.log(`📡 接続先: ${serverUrl}/mcp`);

  try {
    // MCPサーバーに接続
    console.log("\n🔌 MCPサーバーに接続中...");
    await client.connect(transport);
    console.log("✅ MCPサーバーに接続しました");

    // 利用可能なツールをリスト
    await listAvailableTools();

    // リソースサーバーテスト
    await testResourceServer();

    // テストファイル作成
    await createTestFile();

    // Walrusアップロードテスト（実際のファイルが必要）
    console.log(
      "\n⚠️  注意: Walrusアップロード/ダウンロードテストは実際のファイルとネットワークアクセスが必要です"
    );

    // ファイルアップロードテスト（コメントアウト - 実際のテスト時に有効化）
    let blobId = await testWalrusUpload();

    blobId = "eY-foaTn9LTwqfxy0Q_wW4YURADxG_MZK-nrtjhSjGk";

    // ファイルダウンロードテスト（アップロードが成功した場合のみ）
    if (blobId) {
      await testWalrusDownload(blobId);
    }

    console.log("\n🎉 テスト完了");
  } catch (error) {
    console.error("❌ MCP クライアント実行中のエラー:", error);

    // 詳細なエラー情報を表示
    if (error instanceof Error) {
      console.error("エラーメッセージ:", error.message);
      if (error.stack) {
        console.error("スタックトレース:", error.stack);
      }
    }
  } finally {
    try {
      await client.close();
      console.log("🔌 接続を閉じました");
    } catch (closeError) {
      console.error("❌ 接続クローズエラー:", closeError);
    }
  }
}

// コマンドライン引数の処理
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
    使用方法:
      npm run test-mcp                     # 基本テストを実行
      npm run test-mcp --server-url URL   # カスタムサーバーURLを使用
      npm run test-mcp --help             # このヘルプを表示

    環境変数:
      MCP_SERVER_URL                      # MCPサーバーのURL（デフォルト: Lambda Function URL）

    例:
      MCP_SERVER_URL=http://localhost:8080 npm run test-mcp
      npm run test-mcp --server-url https://your-lambda-url.amazonaws.com
`);
  process.exit(0);
}

// カスタムサーバーURL処理
const serverUrlIndex = args.indexOf("--server-url");
if (serverUrlIndex !== -1 && args[serverUrlIndex + 1]) {
  process.env.MCP_SERVER_URL = args[serverUrlIndex + 1];
}

// メイン関数実行
main().catch((error: unknown) => {
  console.error("🚨 致命的なエラー:", error);
  process.exit(1);
});
