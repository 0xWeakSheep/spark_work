#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const NODE = process.execPath;
const SKILL_DIR = "/Users/caoxiangrui/.codex/plugins/cache/openai-primary-runtime/presentations/26.601.10930/skills/presentations";
const BUILD_SCRIPT = path.join(SKILL_DIR, "scripts/build_artifact_deck.mjs");
const THREAD_ID = process.env.CODEX_THREAD_ID || `manual-${Date.now().toString(36)}`;
const WORKSPACE = path.join(ROOT, "artifacts", "outputs", THREAD_ID, "presentations", "movie-spark-analysis");
const SLIDES_DIR = path.join(WORKSPACE, "slides");
const PREVIEW_DIR = path.join(WORKSPACE, "preview");
const LAYOUT_DIR = path.join(WORKSPACE, "layout");
const CONTACT_SHEET = path.join(WORKSPACE, "contact-sheet.png");
const MANIFEST = path.join(WORKSPACE, "artifact-build-manifest.json");
const FINAL = path.join(ROOT, "docs", "presentation", "电影数据离线分析系统_答辩PPT.pptx");

const common = String.raw`
export const C = {
  bg: "#F8FAFC",
  ink: "#172033",
  muted: "#64748B",
  blue: "#1E40AF",
  sky: "#3B82F6",
  amber: "#F59E0B",
  green: "#0F766E",
  red: "#B91C1C",
  line: "#D9E2EF",
  panel: "#FFFFFF",
  dark: "#0F172A",
};

export function base(slide, ctx, section = "") {
  ctx.addShape(slide, { x: 0, y: 0, w: 1280, h: 720, fill: C.bg, line: ctx.line("#00000000", 0) });
  ctx.addText(slide, { x: 50, y: 672, w: 720, h: 24, text: "基于 Spark 的电影数据离线分析系统", fontSize: 13, color: C.muted });
  ctx.addText(slide, { x: 1120, y: 672, w: 110, h: 24, text: String(ctx.slideNumber).padStart(2, "0"), fontSize: 13, color: C.muted, align: "right" });
  if (section) {
    ctx.addText(slide, { x: 50, y: 32, w: 260, h: 24, text: section, fontSize: 13, color: C.blue, bold: true });
  }
}

export function title(slide, ctx, text, subtitle = "", section = "") {
  base(slide, ctx, section);
  ctx.addText(slide, { x: 50, y: 62, w: 860, h: 68, text, fontSize: 34, color: C.ink, bold: true, typeface: ctx.fonts.title });
  if (subtitle) ctx.addText(slide, { x: 52, y: 132, w: 880, h: 40, text: subtitle, fontSize: 17, color: C.muted });
}

export function panel(slide, ctx, x, y, w, h, label, body, accent = C.blue) {
  ctx.addShape(slide, { x, y, w, h, fill: C.panel, line: ctx.line(C.line, 1) });
  ctx.addShape(slide, { x, y, w: 6, h, fill: accent, line: ctx.line("#00000000", 0) });
  ctx.addText(slide, { x: x + 20, y: y + 16, w: w - 40, h: 28, text: label, fontSize: 18, bold: true, color: C.ink });
  ctx.addText(slide, { x: x + 20, y: y + 50, w: w - 40, h: h - 70, text: body, fontSize: 13, color: C.muted, insets: { left: 0, right: 0, top: 0, bottom: 0 } });
}

export function pill(slide, ctx, x, y, text, color = C.blue) {
  ctx.addShape(slide, { x, y, w: 150, h: 34, fill: color, line: ctx.line("#00000000", 0) });
  ctx.addText(slide, { x, y: y + 7, w: 150, h: 20, text, fontSize: 13, color: "#FFFFFF", bold: true, align: "center" });
}

export function metric(slide, ctx, x, y, value, label, color = C.blue) {
  ctx.addShape(slide, { x, y, w: 245, h: 110, fill: C.panel, line: ctx.line(C.line, 1) });
  ctx.addText(slide, { x: x + 18, y: y + 18, w: 205, h: 38, text: value, fontSize: 30, color, bold: true, typeface: ctx.fonts.mono });
  ctx.addText(slide, { x: x + 18, y: y + 62, w: 205, h: 28, text: label, fontSize: 14, color: C.muted });
}

export function arrow(slide, ctx, x1, y1, x2, y2, color = C.blue) {
  const w = Math.max(1, x2 - x1);
  ctx.addShape(slide, { x: x1, y: y1, w, h: 3, fill: color, line: ctx.line("#00000000", 0) });
  ctx.addShape(slide, { geometry: "triangle", x: x2 - 8, y: y2 - 7, w: 16, h: 14, fill: color, line: ctx.line("#00000000", 0) });
}
`;

const slides = [
  String.raw`
import { C, base, metric, panel, pill } from "./common.mjs";
export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  base(slide, ctx);
  ctx.addText(slide, { x: 54, y: 76, w: 820, h: 78, text: "基于 Spark 的电影数据离线分析系统", fontSize: 39, color: C.ink, bold: true, typeface: ctx.fonts.title });
  ctx.addText(slide, { x: 58, y: 162, w: 720, h: 40, text: "HDFS + Spark RDD / SQL / Streaming + MySQL + Flask + ECharts", fontSize: 18, color: C.muted });
  metric(slide, ctx, 58, 270, "45,843", "电影条目", C.blue);
  metric(slide, ctx, 328, 270, "1,048,575", "评分记录", C.green);
  metric(slide, ctx, 598, 270, "6,040", "用户样本", C.amber);
  metric(slide, ctx, 868, 270, "3 类", "Spark 组件覆盖", C.red);
  panel(slide, ctx, 58, 430, 1088, 120, "答辩主线", "先说明考核目标和技术选型，再展示数据处理链路、三类 Spark 作业、可视化页面和运行验收。", C.blue);
  pill(slide, ctx, 58, 585, "课程考核");
  pill(slide, ctx, 228, 585, "可运行项目", C.green);
  pill(slide, ctx, 398, 585, "报告截图", C.amber);
  return slide;
}
`,
  String.raw`
import { C, title, panel } from "./common.mjs";
export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "考核目标拆解", "将附件要求拆成三个可验证功能", "01 目标");
  panel(slide, ctx, 72, 205, 340, 250, "功能一：RDD 离线分析", "数据上传 HDFS；读取 movies 与 ratings；过滤异常数据；计算平均评分；输出前 20 部高分电影。", C.blue);
  panel(slide, ctx, 470, 205, 340, 250, "功能二：Spark SQL + MySQL", "导入 MySQL；通过 JDBC 访问结构化表；按用户性别统计电影类型关注人数；柱状图展示。", C.green);
  panel(slide, ctx, 868, 205, 340, 250, "功能三：Streaming", "动态追加评分批次文件；实时计算评分数量和平均分；折线图轮询刷新，展示变化过程。", C.amber);
  ctx.addText(slide, { x: 74, y: 510, w: 1030, h: 52, text: "交付物：Docker 项目、Flask 仪表盘、课程总结报告、答辩 PPT、运行命令与截图清单。", fontSize: 21, bold: true, color: C.ink });
  return slide;
}
`,
  String.raw`
import { C, title, panel, arrow } from "./common.mjs";
export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "总体架构", "数据层、计算层、存储层、服务层、展示层解耦", "02 架构");
  panel(slide, ctx, 60, 214, 190, 115, "数据层", "CSV / DAT\n清洗数据\n流式批次", C.blue);
  panel(slide, ctx, 310, 214, 210, 115, "HDFS", "/movie/input\n/movie/stream/input", C.sky);
  panel(slide, ctx, 580, 162, 230, 90, "Spark RDD", "Top 20 电影评分榜", C.green);
  panel(slide, ctx, 580, 288, 230, 90, "Spark SQL", "男女电影类型关注", C.green);
  panel(slide, ctx, 580, 414, 230, 90, "Streaming", "实时评分趋势", C.green);
  panel(slide, ctx, 870, 214, 180, 115, "MySQL", "原始表\n结果表", C.amber);
  panel(slide, ctx, 1090, 214, 140, 115, "Web", "Flask API\nECharts", C.red);
  arrow(slide, ctx, 252, 270, 306, 270, C.blue);
  arrow(slide, ctx, 524, 270, 574, 206, C.green);
  arrow(slide, ctx, 524, 270, 574, 332, C.green);
  arrow(slide, ctx, 524, 270, 574, 458, C.green);
  arrow(slide, ctx, 814, 270, 866, 270, C.amber);
  arrow(slide, ctx, 1054, 270, 1086, 270, C.red);
  ctx.addText(slide, { x: 62, y: 575, w: 1030, h: 50, text: "Web 页面只读取 MySQL 结果表，计算任务通过脚本触发，便于演示和复现实验。", fontSize: 19, color: C.ink, bold: true });
  return slide;
}
`,
  String.raw`
import { C, title, panel, metric } from "./common.mjs";
export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "数据集与预处理", "保留原始压缩包，生成清洗后的 processed 数据", "03 数据");
  metric(slide, ctx, 72, 190, "45,843", "Movies.csv", C.blue);
  metric(slide, ctx, 342, 190, "1,048,575", "Ratings.csv", C.green);
  metric(slide, ctx, 612, 190, "753,155", "Tags.csv", C.amber);
  metric(slide, ctx, 882, 190, "6,040", "Users.dat", C.red);
  panel(slide, ctx, 74, 350, 500, 160, "清洗策略", "CSV 使用标准 csv.reader 解析；异常编码容错；过滤空标签、非法评分和坏行；将 Users.dat 转换为 Users.csv 便于入库。", C.blue);
  panel(slide, ctx, 630, 350, 500, 160, "统计口径", "Users.dat 与 Tags.csv 用户范围不完全一致，因此性别统计以 ratings + movies + users 为主，按 genres 作为电影标签/类型。", C.amber);
  return slide;
}
`,
  String.raw`
import { C, title, panel } from "./common.mjs";
export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "数据库设计", "四张原始表 + 四张结果表", "04 存储");
  const left = [
    ["movies", "电影 ID、标题、类型"],
    ["ratings", "用户评分记录"],
    ["users", "用户性别、年龄、职业"],
    ["tags", "补充标签数据"]
  ];
  const right = [
    ["top_movies", "评分最高前 20"],
    ["gender_genre_attention", "男女类型关注数量"],
    ["gender_top_genres", "男女最关注类型"],
    ["stream_rating_trend", "流式评分趋势"]
  ];
  panel(slide, ctx, 82, 190, 500, 360, "原始数据表", left.map(r => r.join("：")).join("\n"), C.blue);
  panel(slide, ctx, 690, 190, 500, 360, "分析结果表", right.map(r => r.join("：")).join("\n"), C.green);
  ctx.addText(slide, { x: 82, y: 585, w: 1000, h: 44, text: "结果表面向页面查询设计，避免 Web 层直接扫描 HDFS 或重复执行 Spark 作业。", fontSize: 19, color: C.ink, bold: true });
  return slide;
}
`,
  String.raw`
import { C, title, panel, arrow } from "./common.mjs";
export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "RDD：平均评分最高前 20 部电影", "展示 Spark Core 的转换、聚合、排序过程", "05 RDD");
  panel(slide, ctx, 66, 236, 190, 130, "读取 HDFS", "Movies.csv\nRatings.csv", C.blue);
  panel(slide, ctx, 310, 236, 190, 130, "解析过滤", "过滤表头\n过滤异常行", C.sky);
  panel(slide, ctx, 554, 236, 190, 130, "聚合评分", "movieId ->\n(sum, count)", C.green);
  panel(slide, ctx, 798, 236, 190, 130, "关联标题", "join movies\n得到 title", C.amber);
  panel(slide, ctx, 1042, 236, 170, 130, "写结果", "top_movies\nTop 20", C.red);
  arrow(slide, ctx, 260, 300, 306, 300, C.blue);
  arrow(slide, ctx, 504, 300, 550, 300, C.green);
  arrow(slide, ctx, 748, 300, 794, 300, C.green);
  arrow(slide, ctx, 992, 300, 1038, 300, C.amber);
  ctx.addText(slide, { x: 70, y: 440, w: 1080, h: 64, text: "排序规则：平均分降序、评分次数降序、标题升序。结果用于页面横向柱状图和 Top 20 明细表。", fontSize: 20, color: C.ink, bold: true });
  return slide;
}
`,
  String.raw`
import { C, title, panel, arrow } from "./common.mjs";
export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "Spark SQL：男女关注电影类型", "JDBC 读取 MySQL，DataFrame + SQL 完成关联统计", "06 SQL");
  panel(slide, ctx, 70, 196, 250, 120, "输入表", "ratings\nusers\nmovies", C.blue);
  panel(slide, ctx, 390, 196, 250, 120, "关联", "ratings.user_id = users.user_id\nratings.movie_id = movies.movie_id", C.green);
  panel(slide, ctx, 710, 196, 250, 120, "拆分类型", "explode(split(genres, '|'))", C.amber);
  panel(slide, ctx, 390, 390, 250, 120, "分组聚合", "GROUP BY gender, genre", C.green);
  panel(slide, ctx, 710, 390, 250, 120, "窗口函数", "ROW_NUMBER 选出最高类型", C.amber);
  panel(slide, ctx, 1030, 292, 170, 120, "输出表", "gender_genre_attention\ngender_top_genres", C.red);
  arrow(slide, ctx, 324, 256, 386, 256, C.blue);
  arrow(slide, ctx, 644, 256, 706, 256, C.green);
  arrow(slide, ctx, 835, 322, 520, 386, C.green);
  arrow(slide, ctx, 644, 450, 706, 450, C.amber);
  arrow(slide, ctx, 964, 450, 1026, 352, C.red);
  return slide;
}
`,
  String.raw`
import { C, title, panel, arrow } from "./common.mjs";
export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "Streaming：动态评分趋势", "用小批次文件模拟评分持续到达", "07 Streaming");
  panel(slide, ctx, 70, 220, 220, 130, "拆分批次", "Ratings.csv ->\nratings_batch_001.csv ...", C.blue);
  panel(slide, ctx, 350, 220, 220, 130, "追加 HDFS", "/movie/stream/input\n每 6 秒一个文件", C.sky);
  panel(slide, ctx, 630, 220, 220, 130, "流式处理", "maxFilesPerTrigger=1\nforeachBatch", C.green);
  panel(slide, ctx, 910, 220, 220, 130, "趋势入库", "stream_rating_trend\navg/count/min/max", C.amber);
  arrow(slide, ctx, 294, 284, 346, 284, C.blue);
  arrow(slide, ctx, 574, 284, 626, 284, C.green);
  arrow(slide, ctx, 854, 284, 906, 284, C.amber);
  panel(slide, ctx, 168, 438, 840, 112, "页面效果", "前端每 6 秒调用 /api/stream-trend。随着 stream_rating_trend 增加记录，折线图展示平均分和记录数的连续变化。", C.red);
  return slide;
}
`,
  String.raw`
import { C, title, panel } from "./common.mjs";
export async function slide09(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "Flask + ECharts 可视化", "首页就是实际分析仪表盘", "08 Web");
  panel(slide, ctx, 70, 185, 330, 155, "API 设计", "/api/summary\n/api/top-movies\n/api/gender-genres\n/api/stream-trend", C.blue);
  panel(slide, ctx, 475, 185, 330, 155, "图表设计", "Top 20 横向柱状图\n男女类型分组柱状图\n实时评分折线图", C.green);
  panel(slide, ctx, 880, 185, 330, 155, "交互设计", "刷新按钮\nStreaming 自动轮询\n响应式布局", C.amber);
  ctx.addShape(slide, { x: 74, y: 405, w: 1050, h: 110, fill: "#FFFFFF", line: ctx.line(C.line, 1) });
  ctx.addText(slide, { x: 96, y: 426, w: 970, h: 58, text: "页面展示服务与计算任务解耦：Spark 写 MySQL，Flask 读 MySQL，ECharts 只负责渲染结果。", fontSize: 24, color: C.ink, bold: true });
  return slide;
}
`,
  String.raw`
import { C, title, panel } from "./common.mjs";
export async function slide10(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "运行命令与验收", "答辩时按命令链路演示", "09 验收");
  panel(slide, ctx, 70, 180, 510, 320, "核心命令", "docker compose up -d --build\n\ndocker compose exec spark-hadoop bash scripts/setup_all.sh\n\ndocker compose exec spark-hadoop hdfs dfs -ls /movie/input\n\ndocker compose exec spark-hadoop bash scripts/streaming/run_streaming_demo.sh", C.blue);
  panel(slide, ctx, 660, 180, 510, 320, "验收结果", "HDFS 能看到四个输入文件\nMySQL 原始表有数据\nTop 20 表有 20 条记录\n男女类型统计表有结果\nStreaming 趋势表持续增加\nWeb 三个图表正常显示", C.green);
  return slide;
}
`,
  String.raw`
import { C, title, panel } from "./common.mjs";
export async function slide11(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "小组答辩分工建议", "每人 5 分钟，可按模块分配", "10 分工");
  panel(slide, ctx, 70, 178, 330, 160, "成员 A", "项目背景、考核要求、总体架构、技术选型。", C.blue);
  panel(slide, ctx, 475, 178, 330, 160, "成员 B", "数据集说明、预处理、HDFS 上传、MySQL 表设计。", C.green);
  panel(slide, ctx, 880, 178, 330, 160, "成员 C", "RDD Top 20 作业、Spark SQL 男女类型统计。", C.amber);
  panel(slide, ctx, 270, 410, 330, 150, "成员 D", "Streaming 演示、Web 可视化、截图结果。", C.red);
  panel(slide, ctx, 680, 410, 330, 150, "成员 E/F", "问题解决、测试验收、总结与扩展方向。", C.sky);
  return slide;
}
`,
  String.raw`
import { C, title, panel, pill } from "./common.mjs";
export async function slide12(presentation, ctx) {
  const slide = presentation.slides.add();
  title(slide, ctx, "总结", "完成从数据到图表的全流程 Spark 离线分析系统", "11 总结");
  panel(slide, ctx, 84, 190, 330, 190, "已完成", "HDFS 数据存储\nRDD 离线统计\nSpark SQL 关联分析\nStreaming 动态统计\nFlask + ECharts 页面", C.green);
  panel(slide, ctx, 474, 190, 330, 190, "工程特点", "Docker 一体化\n脚本化复现\n结果表解耦\n适配 16GB Mac", C.blue);
  panel(slide, ctx, 864, 190, 330, 190, "后续扩展", "推荐算法\n年龄段分析\n类型筛选\n更多实时指标", C.amber);
  ctx.addText(slide, { x: 86, y: 470, w: 760, h: 64, text: "Q&A", fontSize: 46, color: C.ink, bold: true, typeface: ctx.fonts.title });
  pill(slide, ctx, 86, 555, "Spark");
  pill(slide, ctx, 256, 555, "Hadoop", C.green);
  pill(slide, ctx, 426, 555, "MySQL", C.amber);
  pill(slide, ctx, 596, 555, "ECharts", C.red);
  return slide;
}
`
];

async function main() {
  await fs.mkdir(SLIDES_DIR, { recursive: true });
  await fs.mkdir(path.dirname(FINAL), { recursive: true });
  await fs.writeFile(path.join(SLIDES_DIR, "common.mjs"), common, "utf8");
  await fs.writeFile(path.join(WORKSPACE, "profile-plan.txt"), [
    "task mode: create",
    "primary deck-profile: engineering-platform",
    "proof objects: architecture diagram, data flow, run commands, verification checklist",
    "brand constraints: course project, no external brand assets",
    "QA gates: readable Chinese text, no overlap, rendered previews generated",
    "",
  ].join("\n"), "utf8");

  for (let i = 0; i < slides.length; i += 1) {
    await fs.writeFile(path.join(SLIDES_DIR, `slide-${String(i + 1).padStart(2, "0")}.mjs`), slides[i], "utf8");
  }

  const result = spawnSync(
    NODE,
    [
      BUILD_SCRIPT,
      "--slides-dir",
      SLIDES_DIR,
      "--out",
      FINAL,
      "--preview-dir",
      PREVIEW_DIR,
      "--layout-dir",
      LAYOUT_DIR,
      "--contact-sheet",
      CONTACT_SHEET,
      "--manifest",
      MANIFEST,
      "--slide-count",
      String(slides.length),
      "--workspace",
      WORKSPACE,
    ],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        NODE_PATH: "/Users/caoxiangrui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules",
        PYTHON: "/Users/caoxiangrui/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",
      },
      encoding: "utf8",
    },
  );

  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(result.status || 1);
  }
  console.log(result.stdout);
  console.log(FINAL);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
