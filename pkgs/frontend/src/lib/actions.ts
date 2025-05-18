"use server";

import { mastra } from "@/mastra";

export async function getWeatherInfo(city: string) {
  const agent = mastra.getAgent("x402WalrusAgent");
  // call the agent with memory context
  const result = await agent.generate(`${city}`, {
    threadId: "x402-walrus-thread",
    resourceId: "x402-walrus-resource", // リソースIDを追加
  });

  console.log("Agent response:", result);

  // 結果を処理
  const responseText = result.text;

  // Return a serializable plain object
  return {
    text: responseText,
  };
}
