const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "..", "src", "assets", `asd.json`);
fs.writeFileSync(filePath, "123");
