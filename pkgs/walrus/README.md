# WALRUS-Sample

WALRUS 検証用のスクリプト

## 動かし方

```bash
pnpm install
```

```bash
pnpm format
```

```bash
--- ファイルのアップロード ---
Uploading file: /Users/harukikondo/git/WALRUS-Sample/samples/sample.txt
MIME Type: text/plain
Storage duration: 10 epochs
Uploading to: https://publisher.walrus-01.tududes.com/v1/blobs?epochs=10
Upload successful!
アップロード結果: {
  "status": "Newly created",
  "blobId": "RXLAFjFJcYA4PXD-R5T4Cb1cm_P-zADMGD02bMIOiFI",
  "endEpoch": 43,
  "suiRefType": "Associated Sui Object",
  "suiRef": "0x684f5fc11a262727c54b0fb7d0d9e1bf82bbde03628e8a6d221c93bdffe1d9e2",
  "suiBaseUrl": "https://suiscan.xyz/testnet/object",
  "blobUrl": "https://aggregator.walrus-testnet.walrus.space/v1/blobs/RXLAFjFJcYA4PXD-R5T4Cb1cm_P-zADMGD02bMIOiFI",
  "suiUrl": "https://suiscan.xyz/testnet/object/0x684f5fc11a262727c54b0fb7d0d9e1bf82bbde03628e8a6d221c93bdffe1d9e2"
}

--- ファイルのダウンロード ---
Downloading blob: RXLAFjFJcYA4PXD-R5T4Cb1cm_P-zADMGD02bMIOiFI
Download URL: https://aggregator.walrus-testnet.walrus.space/v1/blobs/RXLAFjFJcYA4PXD-R5T4Cb1cm_P-zADMGD02bMIOiFI
File downloaded successfully to: /Users/harukikondo/git/WALRUS-Sample/samples/downloaded_sample.txt
Fetching metadata from: https://aggregator.walrus-testnet.walrus.space/v1/blobs/RXLAFjFJcYA4PXD-R5T4Cb1cm_P-zADMGD02bMIOiFI/info
Metadata endpoint returned status: 404
ダウンロード結果: {
  "filePath": "/Users/harukikondo/git/WALRUS-Sample/samples/downloaded_sample.txt",
  "blobId": "RXLAFjFJcYA4PXD-R5T4Cb1cm_P-zADMGD02bMIOiFI",
  "contentType": "application/octet-stream",
  "size": 161,
  "metadata": null
}

=== 処理が完了しました ===
```
