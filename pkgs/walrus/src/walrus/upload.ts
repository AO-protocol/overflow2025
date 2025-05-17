/**
 * Walrusへファイルをアップロードするためのスクリプト
 */

import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// Walrusの設定
const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const PUBLISHER = "https://publisher.walrus-01.tududes.com";

// Sui関連の設定
const SUI_NETWORK = "testnet";
const SUI_VIEW_TX_URL = `https://suiscan.xyz/${SUI_NETWORK}/tx`;
const SUI_VIEW_OBJECT_URL = `https://suiscan.xyz/${SUI_NETWORK}/object`;

/**
 * ファイルをWalrusにアップロードする関数
 *
 * @param filePath アップロードするファイルのパス
 * @param numEpochs ストレージの期間（エポック数）
 * @param sendTo オプション: オブジェクトの送信先アドレス
 * @returns アップロード情報
 */
export async function uploadFile(
  filePath: string,
  numEpochs: number,
  sendTo?: string
): Promise<any> {
  // ファイルが存在するか確認
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath);
  const mimeType = getMimeType(filePath);

  console.log(`Uploading file: ${filePath}`);
  console.log(`MIME Type: ${mimeType}`);
  console.log(`Storage duration: ${numEpochs} epochs`);

  // アップロードエンドポイントを構築
  const sendToParam = sendTo ? `&send_object_to=${sendTo}` : "";
  const uploadUrl = `${PUBLISHER}/v1/blobs?epochs=${numEpochs}${sendToParam}`;

  console.log(`Uploading to: ${uploadUrl}`);

  try {
    // ファイルをPUTリクエストでアップロード
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: fileContent,
      headers: {
        "Content-Type": mimeType,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const resultData = await response.json();
    console.log("Upload successful!");

    // レスポンスを処理
    const storageInfo = processUploadResponse(resultData);
    return storageInfo;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * アップロードレスポンスを処理する関数
 */
function processUploadResponse(response: any) {
  let info;

  if ("alreadyCertified" in response) {
    info = {
      status: "Already certified",
      blobId: response.alreadyCertified.blobId,
      endEpoch: response.alreadyCertified.endEpoch,
      suiRefType: "Previous Sui Certified Event",
      suiRef: response.alreadyCertified.event.txDigest,
      suiBaseUrl: SUI_VIEW_TX_URL,
    };
  } else if ("newlyCreated" in response) {
    info = {
      status: "Newly created",
      blobId: response.newlyCreated.blobObject.blobId,
      endEpoch: response.newlyCreated.blobObject.storage.endEpoch,
      suiRefType: "Associated Sui Object",
      suiRef: response.newlyCreated.blobObject.id,
      suiBaseUrl: SUI_VIEW_OBJECT_URL,
    };
  } else {
    throw Error("Unhandled successful response!");
  }

  // blobのURLを追加
  info.blobUrl = `${AGGREGATOR}/v1/blobs/${info.blobId}`;
  info.suiUrl = `${info.suiBaseUrl}/${info.suiRef}`;

  return info;
}

/**
 * ファイル拡張子からMIMEタイプを推測する関数
 */
function getMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".json": "application/json",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
  };

  return mimeTypes[extension] || "application/octet-stream";
}
