"use server";

import { mastra } from "@/mastra";

export async function getWeatherInfo(city: string) {
  const agent = mastra.getAgent("x402WalrusAgent");
  // call the agent 
  const result = await agent.generate(`${city}`);

  console.log("Agent response:", result.text);

  // Return a serializable plain object
  return {
    text: result.text,
  };
}
