import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { weatherAgent } from "./agents";

/**
 * Mastra用のインスタンスを作成
 */
export const mastra = new Mastra({
  agents: { weatherAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});
