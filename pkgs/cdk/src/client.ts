/**
 * デプロイしたMCPサーバーの機能をテストするためのクライアントスクリプト
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import * as dotenv from "dotenv";
import { join } from "path";
dotenv.config();

// デプロイしたLambda Function URLを使用
const serverUrl =
  process.env.MCP_SERVER_URL ||
  "https://5oefnxcjetk4xvobfiyhhpvkte0pmuof.lambda-url.ap-northeast-1.on.aws";

console.log("🔧 環境変数確認:");
console.log("MCP_SERVER_URL:", process.env.MCP_SERVER_URL);
console.log("使用するサーバーURL:", serverUrl);

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
    console.log("ツール呼び出し: get-data-from-resource-server");
    const toolResult = await client.callTool({
      name: "get-data-from-resource-server",
      arguments: {},
    });
    console.log("✅ リソースサーバーからのデータ:");
    console.log("レスポンス詳細:", JSON.stringify(toolResult, null, 2));
  } catch (error) {
    console.error("❌ リソースサーバーテストエラー:", error);
  }
}

async function testWalrusUpload(): Promise<string | null> {
  console.log("\n=== Walrusファイルアップロードテスト ===");

  // 使用するファイルパスを決定
  let targetFilePath = "/tmp/test.txt";
  const originalFilePath = join(__dirname, "../../mcp/samples/sample.txt");

  console.log("📄 ファイル存在チェック中...");
  try {
    const fs = await import("node:fs/promises");
    await fs.access(originalFilePath);
    targetFilePath = originalFilePath;
    console.log("✅ サンプルファイルが存在します:", originalFilePath);
  } catch (fileError) {
    console.log(
      "⚠️  サンプルファイルが見つかりません。テストファイルを使用:",
      targetFilePath
    );
  }

  // 複数の引数形式でテストを試行
  const testConfigs = [
    {
      name: "標準形式",
      arguments: {
        filePath: targetFilePath,
        numEpochs: 5,
      },
    },
    {
      name: "文字列形式",
      arguments: {
        filePath: targetFilePath,
        numEpochs: 5,
      },
    },
    {
      name: "最小形式",
      arguments: {
        filePath: targetFilePath,
        numEpochs: 1,
      },
    },
  ];

  for (const config of testConfigs) {
    try {
      console.log(`\n🔄 ${config.name}でアップロードテスト中...`);
      console.log("引数:", JSON.stringify(config.arguments, null, 2));

      const toolResult = await client.callTool({
        name: "upload-file-to-walrus",
        arguments: config.arguments,
      });

      console.log("レスポンス:", JSON.stringify(toolResult, null, 2));

      // 成功の場合はblobIdを抽出して返す
      if (toolResult.content && Array.isArray(toolResult.content)) {
        const content = toolResult.content[0];
        if (
          content &&
          typeof content === "object" &&
          "type" in content &&
          content.type === "text" &&
          "text" in content &&
          typeof content.text === "string"
        ) {
          // JSONレスポンスかチェック
          try {
            const jsonResponse = JSON.parse(content.text);
            if (jsonResponse.status === "success" && jsonResponse.blobId) {
              console.log("✅ アップロード成功 - BlobID:", jsonResponse.blobId);
              return jsonResponse.blobId;
            }
          } catch (parseError) {
            // JSON以外のレスポンスの場合、正規表現でblobIdを抽出
            if (
              content.text.includes("Blob ID:") ||
              content.text.includes("blobId")
            ) {
              const blobIdMatch = content.text.match(
                /(?:Blob ID|blobId):\s*([a-zA-Z0-9_-]+)/
              );
              if (blobIdMatch) {
                console.log("✅ アップロード成功 - BlobID:", blobIdMatch[1]);
                return blobIdMatch[1];
              }
            }
          }

          // エラーレスポンスかチェック
          if (
            content.text.includes("invalid_type") ||
            content.text.includes("Required")
          ) {
            console.log(`❌ ${config.name}: パラメータエラー`);
            continue; // 次の設定を試行
          }
        }
      }

      // その他のエラー
      console.log(`❌ ${config.name}: 予期しないレスポンス形式`);
    } catch (error) {
      console.error(`❌ ${config.name}: 実行エラー:`, error);
    }
  }

  console.log("❌ すべてのアップロード形式でテストに失敗しました");
  return null;
}

async function testWalrusDownload(blobId: string): Promise<void> {
  console.log("\n=== Walrusファイルダウンロード & x402支払いテスト ===");

  // 複数の引数形式でテストを試行
  const testConfigs = [
    {
      name: "標準形式（出力パス指定あり）",
      arguments: {
        blobId: blobId,
        outputPath: "/tmp/downloaded_file.txt",
      },
    },
    {
      name: "最小形式（出力パス指定なし）",
      arguments: {
        blobId: blobId,
      },
    },
    {
      name: "文字列形式",
      arguments: {
        blobId: blobId,
        outputPath: "/tmp/downloaded_file.txt",
      },
    },
  ];

  for (const config of testConfigs) {
    try {
      console.log(`\n🔄 ${config.name}でダウンロードテスト中...`);
      console.log("引数:", JSON.stringify(config.arguments, null, 2));

      const toolResult = await client.callTool({
        name: "download-file-from-walrus-and-pay-USDC-via-x402",
        arguments: config.arguments,
      });

      console.log("レスポンス:", JSON.stringify(toolResult, null, 2));

      // 成功の場合の処理
      if (toolResult.content && Array.isArray(toolResult.content)) {
        const content = toolResult.content[0];
        if (
          content &&
          typeof content === "object" &&
          "type" in content &&
          content.type === "text" &&
          "text" in content &&
          typeof content.text === "string"
        ) {
          // JSONレスポンスかチェック
          try {
            const jsonResponse = JSON.parse(content.text);
            if (jsonResponse.status === "success") {
              console.log("✅ ダウンロード成功:", jsonResponse);
              return; // 成功したので終了
            } else if (jsonResponse.status === "error") {
              console.log(
                `❌ ${config.name}: サーバーエラー:`,
                jsonResponse.message
              );
            }
          } catch (parseError) {
            // JSON以外のレスポンスの場合
            if (
              content.text.includes("successfully") ||
              content.text.includes("downloaded")
            ) {
              console.log("✅ ダウンロード成功");
              return;
            } else if (
              content.text.includes("invalid_type") ||
              content.text.includes("Required")
            ) {
              console.log(`❌ ${config.name}: パラメータエラー`);
              continue; // 次の設定を試行
            } else {
              console.log(`❌ ${config.name}: エラーレスポンス:`, content.text);
            }
          }
        }
      }
    } catch (error) {
      console.error(`❌ ${config.name}: 実行エラー:`, error);
    }
  }

  console.log("❌ すべてのダウンロード形式でテストに失敗しました");
}

async function testLocalMCPServer(): Promise<void> {
  console.log("\n=== ローカルMCPサーバーテスト（参考） ===");
  console.log("💡 ローカルのindex.jsを使用したテストを推奨します");
  console.log(
    "   コマンド例: node /Users/harukikondo/git/overflow2025/pkgs/mcp/dist/index.js"
  );
  console.log(
    "   VS Code MCP設定での 'x402-walrus' サーバーが正しく動作するかをテストできます"
  );
}

async function analyzeServerResponse(): Promise<void> {
  console.log("\n=== サーバーレスポンス分析 ===");
  try {
    // まず、利用可能なツールの詳細スキーマを取得
    const tools = await client.listTools();

    console.log("� ツールスキーマ詳細分析:");
    tools.tools.forEach((tool, index) => {
      console.log(`\n${index + 1}. ${tool.name}`);
      console.log(`   説明: ${tool.description}`);
      console.log(
        `   入力スキーマタイプ: ${tool.inputSchema?.type || "undefined"}`
      );

      if (
        tool.inputSchema &&
        typeof tool.inputSchema === "object" &&
        "properties" in tool.inputSchema
      ) {
        console.log(
          `   プロパティ: ${JSON.stringify(tool.inputSchema.properties, null, 4)}`
        );
        console.log(
          `   必須項目: ${JSON.stringify(tool.inputSchema.required || [], null, 4)}`
        );
      } else {
        console.log(
          `   ⚠️  詳細スキーマが取得できません - サーバー側の問題の可能性`
        );
      }
    });

    // サーバーの能力をテスト
    console.log("\n🔍 サーバー機能分析:");
    const capabilities = await client.getServerCapabilities();
    console.log("サーバー機能詳細:", JSON.stringify(capabilities, null, 2));
  } catch (error) {
    console.error("❌ サーバーレスポンス分析エラー:", error);
  }
}

async function createTestFile(): Promise<void> {
  console.log("\n=== テストファイル作成 ===");
  try {
    const fs = await import("node:fs/promises");
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

  if (!serverUrl) {
    console.error("❌ MCP_SERVER_URL環境変数が設定されていません");
    return;
  }

  try {
    // MCPサーバーに接続
    console.log("\n🔌 MCPサーバーに接続中...");
    await client.connect(transport);
    console.log("✅ MCPサーバーに接続しました");

    // サーバー情報を取得
    console.log("\n📋 サーバー情報:");
    const serverInfo = await client.getServerCapabilities();
    console.log("サーバー機能:", JSON.stringify(serverInfo, null, 2));

    // サーバーレスポンス分析
    await analyzeServerResponse();

    // ローカルMCPサーバーテストの案内
    await testLocalMCPServer();

    // リソースサーバーテスト
    await testResourceServer();

    // テストファイル作成
    await createTestFile();

    console.log(
      "\n⚠️  注意: 以下のテストはAWS Lambda MCP サーバーの問題により失敗する可能性があります"
    );

    // ファイルアップロードテスト
    let blobId = await testWalrusUpload();

    // 既知のblobIdでダウンロードテスト
    const knownBlobId = "eY-foaTn9LTwqfxy0Q_wW4YURADxG_MZK-nrtjhSjGk";
    console.log(`\n📋 既知のBlobIDでダウンロードテスト: ${knownBlobId}`);
    await testWalrusDownload(knownBlobId);

    // アップロードが成功した場合はそのblobIdでもテスト
    if (blobId && blobId !== knownBlobId) {
      console.log(
        `\n📋 アップロードで取得したBlobIDでダウンロードテスト: ${blobId}`
      );
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
