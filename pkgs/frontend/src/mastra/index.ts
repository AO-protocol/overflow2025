import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { x402WalrusAgent } from "./agents";

/**
 * Mastra用のインスタンスを作成
 */
export const mastra = new Mastra({
  agents: { x402WalrusAgent },
  logger: createLogger({
    name: "x402-walrus-Agent",
    level: "info",
  }),
});
