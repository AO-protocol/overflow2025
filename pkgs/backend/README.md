# Backend API for Google Cloud Run

These are the steps to deploy this backend API to Google Cloud Run.

## Prerequisites

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) is installed
- Google Cloud project is created
- Docker is installed

## Running locally

1. Set environment variables

```bash
cp .env.example .env
# Edit the .env file and set appropriate values
```

2. Install dependencies

```bash
pnpm install
```

3. Run locally

```bash
pnpm dev
```

## Build and run locally with Docker

```bash
# Build the image
docker build -t backend-api .

# Run the container locally
docker run -p 8080:8080 --env-file .env backend-api
```

## Deploying to Google Cloud Run

1. Authenticate with Google Cloud SDK

```bash
gcloud auth login
```

2. Configure the project

```bash
export YOUR_PROJECT_ID=YOUR_PROJECT_ID
gcloud config set project $YOUR_PROJECT_ID
```

3. Build and push the Docker image

```bash
# Create an Artifact Registry repository (only for the first time)
# Create a container repository named backend-repo
gcloud artifacts repositories create backend-repo --repository-format=docker --location=asia-northeast1 --description="Docker repository"

# Build and send Docker
gcloud builds submit --tag asia-northeast1-docker.pkg.dev/$YOUR_PROJECT_ID/backend-repo/backend-api:latest
```

4. Deploy to Cloud Run

```bash
gcloud run deploy backend-api \\
  --image asia-northeast1-docker.pkg.dev/$YOUR_PROJECT_ID/backend-repo/backend-api:latest \\
  --platform managed \\
  --region asia-northeast1 \\
  --allow-unauthenticated \\
  --set-env-vars="FACILITATOR_URL=https://x402.org/facilitator,ADDRESS=0x51908F598A5e0d8F1A3bAbFa6DF76F9704daD072,NETWORK=base-sepolia"
```

5. Delete from Cloud Run

```bash
gcloud run services delete backend-api --region asia-northeast1 --project $YOUR_PROJECT_ID
```

## Environment Variables

The following environment variables need to be set during deployment:

- `FACILITATOR_URL`: Facilitator URL
- `ADDRESS`: Payment destination address (starts with 0x)
- `NETWORK`: Network name (e.g., optimism-goerli)

## Notes

- Cloud Run gets the port number from the environment variable `PORT`
- For security reasons, use Cloud Run settings or Secret Manager for setting environment variables in the production environment, not the .env file
