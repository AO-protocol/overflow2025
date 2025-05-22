import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";

// OpenAI GPT-4o
export const openAIGpt4o = openai("gpt-3.5-turbo");

// Google Gemini
export const googleGemini = google("gemini-2.0-flash");

// Anthropic AI
export const claude = anthropic("claude-3-7-sonnet-20250219");
