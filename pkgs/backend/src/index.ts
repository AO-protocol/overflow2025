import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";
import { Network, Resource, paymentMiddleware } from "x402-hono";
// Import walrus functions from relative paths

config();

const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
const payTo = process.env.ADDRESS as `0x${string}`;
const network = process.env.NETWORK as Network;

if (!facilitatorUrl || !payTo || !network) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const app = new Hono();

console.log("Server is running");

app.use(
  paymentMiddleware(
    payTo,
    {
      "/weather": {
        price: "$0.001",
        network,
      },
      "/download": {
        price: "$0.01",
        network,
      },
    },
    {
      url: facilitatorUrl,
    }
  )
);

// get weather report API
app.get("/weather", async (c) => {
  return c.json({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  });
});

// get download file API
app.get("/download", async (c) => {
  return c.json({
    resulut: "pay to download",
  });
});

serve({
  fetch: app.fetch,
  port: 4021,
});
