# Sui Overflow2025

[![Build MCP and Frontend](https://github.com/AO-protocol/overflow2025/actions/workflows/build.yml/badge.svg)](https://github.com/AO-protocol/overflow2025/actions/workflows/build.yml)

## Project Overview

## Product Page

## Project Structure

```
.
├── pkgs/
│   ├── frontend/    # Next.js frontend application
│   ├── backend/     # Backend service with Hono
│   └── mcp/         # Model Context Protocol implementation
```

## Technologies

- **Package Manager**: pnpm
- **Monorepo Structure**: pnpm workspaces
- **Frontend**: Next.js 15 with React 19, TypeScript, and PWA support
- **Backend**: Hono framework with TypeScript
- **MCP**: Model Context Protocol SDK implementation
- **Walrus**: Verification scripts for file operations
- **Code Quality**: Biome (linting and formatting)

## Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/AO-protocol/overflow2025.git
cd overflow2025

# Install dependencies
pnpm install
```

### formatter

```bash
pnpm format
```

### How to work

#### setup

1. backend

create `pkgs/backend/.env` file

```bash
FACILITATOR_URL=https://x402.org/facilitator
NETWORK=base-sepolia
ADDRESS=
```

2. mcp

create `pkgs/mcp/.env` file

```bash
RESOURCE_SERVER_URL=http://localhost:4021
ENDPOINT_PATH=/download/:blobId
PRIVATE_KEY=
```

3. frontend

create `pkgs/fronend/.env.local`

```bash
OPENAI_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
ANTHROPIC_API_KEY=
PATH_TO_MCP=<PATT TO your repo>/overflow2025/pkgs/mcp/dist/index.js
```

### Start Backend Server & MCP

1. start backend Server

```bash
pnpm backend dev
```

2. build MCP Server

```bash
pnpm mcp build
```

3. setup MCP config & start

open VS Code's `settings/json` & add mcp config

```json
{
  "x402-walrus": {
    "command": "node",
    "args": ["<absolute path to this repo>/pkgs/mcp/dist/index.js"],
    "env": {
      "PRIVATE_KEY": "<private key of a wallet with USDC on Base Sepolia>",
      "RESOURCE_SERVER_URL": "http://localhost:4021",
      "ENDPOINT_PATH": "/download"
    }
  }
}
```

And Start MCP Server

4. try to acucess via GitHub Copilot Agent Mode

   - file upload

     ```bash
     ファイルをWalrusにアップロードしてください。
     ファイルパス:
     `/Users/harukikondo/git/overflow2025/pkgs/mcp/samples/sample.txt`
     保存期間: 10
     ```

   - file download

     ```bash
     Walrusからファイルをダウンロードしてください。
     BlobID: [アップロード時に取得したblobId]
     保存先:
     `/Users/harukikondo/git/overflow2025/pkgs/mcp/samples/downloaded_file.txt`
     ```

5. Start Frontend

```bash
pnpm frontend dev
```

## Package Details

### Frontend

Next.js 15 application with React 19, featuring:

- Progressive Web App (PWA) capabilities
- Tailwind CSS for styling
- Mastra AI integration

### Backend

Hono-based backend service with:

- Node server implementation
- x402 integration

### MCP

Model Context Protocol implementation with:

- MCP SDK integration
- Viem for blockchain interactions

### Walrus

Verification scripts for file operations:

- File upload and download functionality
- TypeScript implementation
