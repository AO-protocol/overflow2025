import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

// OpenAI GPT-4o
export const openAIGpt4o = openai("gpt-3.5-turbo");

// Google Gemini AIプロバイダーの作成
export const googleGemini = google('gemini-2.0-flash')
