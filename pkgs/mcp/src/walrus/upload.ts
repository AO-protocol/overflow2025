/**
 * Walrusへファイルをアップロードするためのスクリプト
 */

import fetch from "node-fetch";
import fs from "node:fs";
import path from "node:path";

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
  sendTo?: string,
): Promise<any> {
  console.log(`Uploading file: ${filePath}`);
  // ファイルが存在するか確認
  if (!fs.existsSync(filePath)) {
    console.log(`File does not exist: ${filePath}`);
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
    const storageInfo = processUploadResponse(resultData as Record<string, unknown>);
    return storageInfo;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * アップロードレスポンスを処理する関数
 * @param response Walrus APIからのレスポンス
 * @returns 処理されたアップロード情報
 */
function processUploadResponse(response: Record<string, unknown>): {
  status: string;
  blobId: string;
  endEpoch: number;
  suiRefType: string;
  suiRef: string;
  suiBaseUrl: string;
  blobUrl: string;
  suiUrl: string;
} {
  interface InfoType {
    status: string;
    blobId: string;
    endEpoch: number;
    suiRefType: string;
    suiRef: string;
    suiBaseUrl: string;
    blobUrl?: string;
    suiUrl?: string;
  }

  let info: InfoType;

  if ("alreadyCertified" in response && 
      typeof response.alreadyCertified === 'object' && 
      response.alreadyCertified !== null) {
    const certifiedData = response.alreadyCertified as Record<string, any>;
    info = {
      status: "Already certified",
      blobId: String(certifiedData.blobId || ""),
      endEpoch: Number(certifiedData.endEpoch || 0),
      suiRefType: "Previous Sui Certified Event",
      suiRef: String((certifiedData.event as Record<string, any>)?.txDigest || ""),
      suiBaseUrl: SUI_VIEW_TX_URL,
    };
  } else if ("newlyCreated" in response && 
             typeof response.newlyCreated === 'object' && 
             response.newlyCreated !== null) {
    const newData = response.newlyCreated as Record<string, any>;
    const blobObject = newData.blobObject as Record<string, any>;
    const storage = blobObject.storage as Record<string, any>;
    
    info = {
      status: "Newly created",
      blobId: String(blobObject.blobId || ""),
      endEpoch: Number(storage.endEpoch || 0),
      suiRefType: "Associated Sui Object",
      suiRef: String(blobObject.id || ""),
      suiBaseUrl: SUI_VIEW_OBJECT_URL,
    };
  } else {
    throw new Error("Unhandled successful response!");
  }

  // blobのURLを追加
  info.blobUrl = `${AGGREGATOR}/v1/blobs/${info.blobId}`;
  info.suiUrl = `${info.suiBaseUrl}/${info.suiRef}`;

  return info as Required<InfoType>;
}

/**
 * ファイル拡張子からMIMEタイプを推測する関数
 * @param filePath ファイルパス
 * @returns MIME タイプの文字列
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
