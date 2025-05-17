import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import axios from "axios";
import { config } from "dotenv";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";

// Load environment variables and throw an error if any are missing
config();

const privateKey = process.env.PRIVATE_KEY as Hex;
const baseURL = process.env.RESOURCE_SERVER_URL as string; // e.g. https://example.com
const endpointPath = process.env.ENDPOINT_PATH as string; // e.g. /weather

if (!privateKey || !baseURL || !endpointPath) {
  throw new Error("Missing environment variables");
}

// Create a wallet client to handle payments
const account = privateKeyToAccount(privateKey);

// Create an axios client with payment interceptor using x402-axios
const client = withPaymentInterceptor(axios.create({ baseURL }), account);

// Create an MCP server
const server = new McpServer({
  name: "x402 & walrus MCP Client",
  version: "1.0.0",
});


// Add an addition tool
server.tool(
  "get-data-from-resource-server",
  "Get data from the resource server (in this example, the weather) & upload file or download via walrus", //change this description to change when the client calls the tool
  {},
  async () => {
    const res = await client.get(endpointPath);
    return {
      content: [{ type: "text", text: JSON.stringify(res.data) }],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);