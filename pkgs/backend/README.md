# Backend API for Google Cloud Run

このバックエンドAPIをGoogle Cloud Runにデプロイするための手順です。

## 前提条件

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)がインストール済み
- Google Cloudプロジェクトが作成済み
- Dockerがインストール済み

## ローカルでの実行

1. 環境変数を設定

```bash
cp .env.example .env
# .envファイルを編集して適切な値を設定
```

2. 依存関係をインストール

```bash
pnpm install
```

3. ローカルで実行

```bash
pnpm dev
```

## Dockerでのビルドとローカル実行

```bash
# イメージのビルド
docker build -t backend-api .

# ローカルでコンテナを実行
docker run -p 8080:8080 --env-file .env backend-api
```

## Google Cloud Runへのデプロイ

1. Google Cloud SDKで認証

```bash
gcloud auth login
```

2. プロジェクトの設定

```bash
gcloud config set project YOUR_PROJECT_ID
```

3. Dockerイメージのビルドとプッシュ

```bash
# Artifact Registryリポジトリの作成（初回のみ）
gcloud artifacts repositories create backend-repo --repository-format=docker --location=asia-northeast1 --description="Docker repository"

# Dockerのビルドと送信
gcloud builds submit --tag asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/backend-repo/backend-api:latest
```

4. Cloud Runへのデプロイ

```bash
gcloud run deploy backend-api \
  --image asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/backend-repo/backend-api:latest \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars="FACILITATOR_URL=your_facilitator_url,ADDRESS=0x0000000000000000000000000000000000000000,NETWORK=optimism-goerli"
```

## 環境変数

デプロイ時に以下の環境変数を設定する必要があります：

- `FACILITATOR_URL`: ファシリテーターのURL
- `ADDRESS`: ペイメント先のアドレス（0xで始まる）
- `NETWORK`: ネットワーク名（例：optimism-goerli）

## 注意点

- Cloud Runではポート番号を環境変数`PORT`から取得します
- セキュリティ上の理由から、本番環境での環境変数の設定は、.envファイルではなくCloud Run設定またはSecret Managerを使用してください
