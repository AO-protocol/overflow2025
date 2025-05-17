"use server";

import { mastra } from "@/mastra";

export async function getWeatherInfo(city: string) {
  const agent = mastra.getAgent("weatherAgent");

  const result = await agent.generate(`What's the weather like in ${city}?`);

  // Return a serializable plain object
  return {
    text: result.text,
    city: city,
  };
}
