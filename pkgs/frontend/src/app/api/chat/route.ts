import { NextResponse } from "next/server";

// Simple non-streaming implementation to avoid compatibility issues
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // For testing purposes, return a mock response
    // This will help us determine if the issue is with OpenAI API or our implementation
    const mockResponse = {
      id: "mock-response",
      role: "assistant",
      content: `This is a test response. We have received your message.: "${
        messages[messages.length - 1]?.content || "No message"
      }"

Product Recommendations: 1.
1. wireless headphones - ¥12,000
2. laptop computer - ¥85,000
3. coffee maker - ¥15,000

If you can help in any way, please let us know.`,
    };

    return NextResponse.json({ messages: [...messages, mockResponse] });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
