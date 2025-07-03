const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["./dist/lambda-server.js"],
    bundle: true,
    minify: true,
    platform: "node",
    target: "node20",
    outfile: "bundle.js",
    external: ["aws-sdk", "@aws-sdk/*"], // AWS SDK は Lambda 環境に既に存在するため除外
    metafile: true,
  })
  .then((result) => {
    // バンドルサイズ情報を出力
    const outputSize = Object.entries(result.metafile.outputs).reduce(
      (acc, [file, data]) => {
        return acc + data.bytes;
      },
      0
    );
    console.log(`file size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
  })
  .catch(() => process.exit(1));
