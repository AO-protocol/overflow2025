/**
 * WALRUSサンプルアプリケーション
 *
 * Walrusを使用してファイルのアップロードとダウンロードを行うサンプルスクリプトです
 */

import fs from "node:fs";
import path from "node:path";
import { downloadFile } from "./walrus/download.js";
import { uploadFile } from "./walrus/upload.js";

// サンプルファイルの作成
const createSampleFile = () => {
  const sampleDir = path.join(process.cwd(), "samples");
  if (!fs.existsSync(sampleDir)) {
    fs.mkdirSync(sampleDir, { recursive: true });
  }

  const sampleFilePath = path.join(sampleDir, "sample.txt");
  fs.writeFileSync(
    sampleFilePath,
    `これはWalrusにアップロードするサンプルテキストファイルです。
作成日時: ${new Date().toLocaleString("ja-JP")}
Walrusは分散型ストレージです。`
  );

  return sampleFilePath;
};

const main = async () => {
  try {
    console.log("=== Walrusサンプルアプリケーション ===");

    // サンプルファイルの作成
    const sampleFilePath = createSampleFile();
    console.log(`サンプルファイルを作成しました: ${sampleFilePath}`);

    // ファイルのアップロード
    console.log("\n--- ファイルのアップロード ---");
    const uploadResult = await uploadFile(sampleFilePath, 10); // 10エポック分のストレージ期間
    console.log("アップロード結果:", JSON.stringify(uploadResult, null, 2));

    // ファイルのダウンロード
    console.log("\n--- ファイルのダウンロード ---");
    const blobId = uploadResult.blobId;
    const downloadResult = await downloadFile(
      blobId,
      path.join(process.cwd(), "samples", "downloaded_sample.txt")
    );
    console.log("ダウンロード結果:", JSON.stringify(downloadResult, null, 2));

    console.log("\n=== 処理が完了しました ===");
  } catch (error) {
    console.error("エラーが発生しました:", error);
  }
};

main();
