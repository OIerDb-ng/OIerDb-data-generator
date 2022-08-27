#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

let output = {};

fs.readdirSync("static")
  .filter((fn) => fn.endsWith(".json"))
  .map((fn) => {
    let name = path.basename(fn, ".json");
    let content = fs.readFileSync(`static/${fn}`, "utf8");
    output[name] = JSON.parse(content);
  });

output.schools = JSON.parse(fs.readFileSync("dist/school.json", "utf8"));

const outputStr = JSON.stringify(output);

fs.writeFileSync("dist/static.json", outputStr);
fs.writeFileSync(
  "dist/static.info.json",
  JSON.stringify({
    sha512: crypto.createHash("sha512").update(outputStr).digest("hex"),
    size: new TextEncoder().encode(outputStr).length,
  })
);
fs.unlinkSync("dist/school.json");
