#!/usr/bin/env node

const fs = require("fs");

let hash = {},
  schools = fs.readFileSync("data/school.txt", "utf8").trim().split("\n");

for (let [idx, line] of schools.entries()) {
  line = line.trim();
  if (!line.length || line[0] === "#") continue;
  hash[line.split(",")[2]] = idx;
}
let n = schools.length;

let data = fs.readFileSync("dist/merge_preview.txt", "utf8").split("\n");

for (let line of data) {
  line = line.trim();
  if (!line.length || line[0] === "#") continue;
  let [cmd, ...data] = line.split(" ");
  switch (cmd) {
    // b <name> <origin> 表示将新名称 <name> 合并到 <origin>，将新名称作为别名。
    case "b": {
      let [name, origin] = data;
      let idx = hash[origin];
      console.assert(idx != null, line);
      schools[idx] += `,${name}`;
      break;
    }
    // f <name> <origin> 表示将新名称 <name> 合并到 <origin>，并将新名称设为正式名称。
    case "f": {
      let [name, origin] = data;
      let idx = hash[origin];
      console.assert(idx != null, line);
      let segments = schools[idx].split(",");
      segments.splice(2, 0, name);
      schools[idx] = segments.join(",");
      break;
    }
    // c <province> <city> <name> 表示插入学校 <province>,<city>,<name>。
    case "c": {
      let [province, city, name] = data;
      schools.push(`${province},${city},${name}`);
      hash[name] = n++;
      break;
    }
    // s <name> <origin>，表示将名称 <name> 从 <origin> 拆出，并按照原来的地区设置新建一个学校。
    case "s": {
      let [name, origin] = data;
      let idx = hash[origin];
      console.assert(idx != null, line);
      let segments = schools[idx].split(",");
      schools.push(`${segments[0]},${segments[1]},${name}`);
      schools[idx] =
        segments.slice(0, 2).join(",") +
        `,${segments
          .slice(2)
          .filter((s) => s !== name)
          .join(",")}`;
      hash[name] = n++;
      break;
    }
  }
}

fs.writeFileSync("data/school_new.txt", schools.join("\n") + "\n", "utf8");
