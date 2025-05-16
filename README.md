# Sui Overflow2025

A hackathon project using a monorepo structure with pnpm workspaces.

## Project Structure

```
.
├── pkgs/
│   ├── web/         # Next.js frontend
│   ├── mcp/         # Model Context Protocol implementation
│   └── walrus/      # Verification scripts
```

## Technologies

- **Package Manager**: pnpm
- **Monorepo Structure**: pnpm workspaces
- **Frontend**: Next.js with TypeScript
- **Code Quality**: Biome (linting and formatting)
- **Git Hooks**: Lefthook

## Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/overflow2025.git
cd overflow2025

# Install dependencies
pnpm install

# Setup git hooks
pnpm lefthook
```

### Development

```bash
# Start Next.js frontend development server
pnpm web

# Build all packages
pnpm build

# Start development mode for all packages
pnpm dev

# Build MCP package
pnpm mcp:build

# Run Walrus verification
pnpm walrus:verify

# Format code
pnpm format

# Lint code
pnpm lint
```

## Git Hooks

- **Pre-commit**: Automatically formats and lints staged files
- **Pre-push**: Formats and lints all pushed files
