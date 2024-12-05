#!/usr/bin/env node

const fs = require("fs");

const isOldFormat = process.argv.includes("--old-format");

const schoolStage = {
  小学: ["小学", "附小", "附属小学", /小$/],
  初中: ["初中", "初级"],
  高中: [
    "高中",
    "高级",
    "中等专业学校",
    "中专",
    "职高",
    "职业",
    /中.*校区/,
    /中.*实验学校/,
    /中.*分校/,
  ],
  大学: [],
  未知: [],
  机构: [
    "公司",
    "编程",
    "少儿",
    "图灵",
    "培训",
    "算法",
    "创客",
    "信奥",
    "培训",
    "创想",
    "机器人",
    "少年宫",
    "信息学",
    "工作室",
    "研究院",
    "无人机",
    "俱乐部",
    "服务中心",
    /教育$/,
    /中心$/,
    /科技$/,
    /文化[馆宫]?$/,

    // 特殊机构名
    "童程童美",
    "瓦力工厂",
    /未来$/,
  ],
  个人: ["个人"],
};

const schoolStageKeys = Object.keys(schoolStage);

const schoolStageAlias = [
  [/中$/, ["初中", "高中"]],
  ["中學", ["初中", "高中"]],
  ["中学", ["初中", "高中"]],
  ["中级", ["初中", "高中"]],
  ["附属中学", ["初中", "高中"]],
  ["附中", ["初中", "高中"]],
];

const schoolRaw = fs.readFileSync("data/school.txt", "utf-8");
const schoolLines = schoolRaw.split("\n");
const newSchools = [];

if (isOldFormat) {
  console.warn("enabled '--old-format' option");

  for (const _line of schoolLines) {
    const line = _line.trim();

    if (!line.length || line[0] === "," || line[0] === "#") continue;

    const [province, city, ...names] = line.split(",");

    let stages = [];

    for (const _name of names) {
      let name = _name.trim();

      if (_name.includes("附")) {
        name = name.split(/附属?/)[1];
      }

      for (const stage in schoolStage) {
        if (
          schoolStage[stage].some((keyword) =>
            typeof keyword === "string"
              ? name.includes(keyword)
              : name.match(keyword)
          )
        ) {
          stages.push(stage);
        }
      }

      for (const [keyword, aliases] of schoolStageAlias) {
        if (
          typeof keyword === "string"
            ? name.includes(keyword)
            : name.match(keyword)
        ) {
          stages.push(...aliases);
        }
      }
    }

    stages = Array.from(new Set(stages)).sort((a, b) => {
      return schoolStageKeys.indexOf(a) - schoolStageKeys.indexOf(b);
    });

    if (stages.length === 0) {
      stages.push("未知");
      console.warn(`未知学段：${line}`);
    }

    newSchools.push(
      `${province},${city},${stages.join("/")},${names.join(",")}`
    );
  }
} else {
  // 更新已有信息
}

fs.writeFileSync("data/school_new.txt", newSchools.join("\n") + "\n", "utf-8");
