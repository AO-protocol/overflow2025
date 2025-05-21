import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { x402WalrusAgent } from "./agents";

/**
 * Create an instance for Mastra
 */
export const mastra = new Mastra({
  agents: { x402WalrusAgent },
  logger: createLogger({
    name: "x402-walrus-Agent",
    level: "info",
  }),
});
