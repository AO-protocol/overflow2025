import { serve } from "@hono/node-server";
import { config } from "dotenv";
import { Hono } from "hono";
import fs from "node:fs";
import { Network, Resource, paymentMiddleware } from "x402-hono";
import { downloadFile } from "./walrus/download.js";
// Import walrus functions from relative paths
import { uploadFile } from "./walrus/upload.js";

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
      "/download/*": {
        price: "$0.01",
        network,
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
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

// file upload API via walrus
app.post("/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const numEpochs = Number(formData.get("numEpochs") || "10");

    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Create a temporary file
    const tempDir = "./tmp";
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = `${tempDir}/${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer));

    // Upload file using walrus
    const result = await uploadFile(tempFilePath, numEpochs);

    // Clean up temporary file
    fs.unlinkSync(tempFilePath);

    return c.json({
      success: true,
      blobId: result.blobId,
      endEpoch: result.endEpoch,
      status: result.status,
    });
  } catch (error: unknown) {
    console.error("Error uploading file:", error);
    return c.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      500,
    );
  }
});

// file download API via walrus
app.get("/download/:blobId", async (c) => {
  try {
    const blobId = c.req.param("blobId");

    if (!blobId) {
      return c.json({ error: "No blob ID provided" }, 400);
    }

    // Download file using walrus
    const tempDir = "./tmp";
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = `${tempDir}/${blobId}.tmp`;
    const result = await downloadFile(blobId, tempFilePath);

    // Set appropriate headers
    c.header("Content-Type", result.contentType);
    c.header(
      "Content-Disposition",
      `attachment; filename="${blobId}${getExtensionFromContentType(result.contentType)}"`,
    );
    // Read file and send it
    const fileContent = fs.readFileSync(tempFilePath);

    // Clean up temporary file
    fs.unlinkSync(tempFilePath);

    return new Response(fileContent, {
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${blobId}${getExtensionFromContentType(result.contentType)}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Error downloading file:", error);
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to download file",
      },
      500,
    );
  }
});

/**
 * Helper function to get file extension from content type
 *
 * @param contentType - The MIME type to convert to a file extension
 * @returns The file extension corresponding to the MIME type
 */
function getExtensionFromContentType(contentType: string): string {
  const mimeToExt: Record<string, string> = {
    "text/plain": ".txt",
    "text/html": ".html",
    "text/css": ".css",
    "text/javascript": ".js",
    "application/json": ".json",
    "application/xml": ".xml",
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "audio/mpeg": ".mp3",
    "video/mp4": ".mp4",
  };

  return mimeToExt[contentType] || "";
}

serve({
  fetch: app.fetch,
  port: 4021,
});
