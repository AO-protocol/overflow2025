/**
 * Verification script entrypoint
 */
import path from "node:path";
import { WalrusVerifier } from "./index.js";

async function main() {
  const targetName = process.argv[2] || "default";
  const configPath =
    process.argv[3] || path.join(process.cwd(), "walrus-config.json");
  const outputDir =
    process.argv[4] || path.join(process.cwd(), "verification-results");

  console.log(`Starting verification for target: ${targetName}`);
  console.log(`Config path: ${configPath}`);
  console.log(`Output directory: ${outputDir}`);

  const verifier = new WalrusVerifier({
    target: targetName,
    configPath,
    outputDir,
  });

  try {
    const result = await verifier.verify();
    console.log("Verification result:", JSON.stringify(result, null, 2));

    if (!result.success) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  }
}

main().catch(console.error);
