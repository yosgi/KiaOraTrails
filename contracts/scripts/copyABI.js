const fs = require("fs");
const path = require("path");

const sourcePath = path.join(__dirname, "../build/contracts");
const destinationPath = path.join(__dirname, "../../front-end/public/abi");

if (!fs.existsSync(destinationPath)) {
  fs.mkdirSync(destinationPath, { recursive: true });
}

fs.readdirSync(sourcePath).forEach((file) => {
  if (file.endsWith(".json")) {
    fs.copyFileSync(
      path.join(sourcePath, file),
      path.join(destinationPath, file)
    );
    console.log(`Copied: ${file}`);
  }
});

console.log("✅ ABI files copied successfully!");
