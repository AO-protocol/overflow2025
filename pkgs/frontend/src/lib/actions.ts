"use server";

import { mastra } from "@/mastra";

export async function getWeatherInfo(city: string) {
  const agent = mastra.getAgent("x402WalrusAgent");
  // call the agent with memory context
  const result = await agent.generate(`${city}`, {
    threadId: "x402-walrus-thread",
    resourceId: "x402-walrus-resource",
  });

  console.log("Agent response:", result);

  // Process the result
  const responseText = result.text;

  // Return a serializable plain object
  return {
    text: responseText,
  };
}
