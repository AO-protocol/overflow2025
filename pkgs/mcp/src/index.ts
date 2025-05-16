/**
 * Model Context Protocol implementation
 * Main entry point
 */
import axios, { type AxiosInstance } from "axios";

export interface MCPOptions {
  apiKey?: string;
  baseUrl?: string;
}

export interface MCPResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

export class MCPClient {
  private apiKey: string | undefined;
  private baseUrl: string;
  private client: AxiosInstance;

  constructor(options: MCPOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.example.com/mcp";

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
    });
  }

  async connect(): Promise<boolean> {
    try {
      const response = await this.client.get("/status");
      return response.status === 200;
    } catch (error) {
      console.error("Failed to connect to MCP server:", error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    // Implement disconnection logic if needed
    console.log("Disconnecting from MCP server");
  }

  async sendRequest(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<MCPResponse> {
    try {
      const response = await this.client.post(endpoint, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`MCP request to ${endpoint} failed:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default MCPClient;
