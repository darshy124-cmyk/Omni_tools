# OmniTool AI

## Setup

1. Copy `.env.example` to `.env` and adjust as needed.
2. Install dependencies: `pnpm install`.
3. Run Prisma: `pnpm -C packages/db prisma generate`.
4. Start services: `docker compose up --build`.

## Add a Tool

1. Edit `packages/core/src/toolRegistry.ts`.
2. Add a tool with a unique `slug` and required metadata.
3. Run `pnpm test` and `pnpm smoke`.

## Dev Scripts

- `pnpm dev` runs the web app.
- `pnpm test` runs unit tests.
- `pnpm smoke` runs registry + engine smoke tests.
