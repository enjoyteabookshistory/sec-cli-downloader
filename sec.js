#!/usr/bin/env node

const axios = require("axios");
const { Command } = require("commander");
const fs = require("fs");
const path = require("path");

<<<<<<< HEAD
const USER_AGENT = process.env.SEC_USER_AGENT || "your-email@example.com";
=======
// ===== 基础配置 =====
const USER_AGENT = process.env.SEC_USER_AGENT || "your-email@example.com";

if (!process.env.SEC_USER_AGENT) {
  console.warn(
    "⚠️  SEC_USER_AGENT not set. Please set your email to avoid rate limiting."
  );
}

>>>>>>> dev
const BASE_DIR = __dirname;
const CACHE_DIR = path.join(BASE_DIR, "cache");
const FILINGS_CACHE_DIR = path.join(CACHE_DIR, "filings");
const DEFAULT_DOWNLOAD_DIR = path.join(BASE_DIR, "downloads");
<<<<<<< HEAD
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
=======
>>>>>>> dev

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// ===== 初始化目录 =====
fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(FILINGS_CACHE_DIR, { recursive: true });

<<<<<<< HEAD
=======
// ===== 工具函数 =====
>>>>>>> dev
function loadJSON(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function normalizeTicker(ticker) {
  return ticker.trim().toUpperCase();
}

function parseLimit(value) {
  const limit = Number.parseInt(value, 10);
<<<<<<< HEAD

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer");
  }

  return limit;
}

=======
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer");
  }
  return limit;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ===== 安全请求（防止崩溃）=====
async function safeRequest(config) {
  try {
    return await axios(config);
  } catch (err) {
    if (err.response) {
      console.error("HTTP Error:", err.response.status);
    } else {
      console.error("Network Error:", err.message);
    }
    throw err;
  }
}

// ===== CLI =====
>>>>>>> dev
function parseOptions(argv) {
  const program = new Command();

  program
    .name("sec")
    .description("Download SEC filings by ticker and filing year")
<<<<<<< HEAD
    .argument("<ticker>", "stock ticker, for example AAPL")
    .argument("<year>", 'filing year, or "latest"')
    .option("-f, --form <type>", "SEC filing form to download", "10-K")
    .option("-l, --limit <number>", "maximum number of filings to download")
    .option("-o, --output <dir>", "download directory", DEFAULT_DOWNLOAD_DIR)
    .option("--refresh-cache", "ignore cached SEC filings and fetch fresh data")
    .addHelpText(
      "after",
      `

Examples:
  node sec.js AAPL 2023
  node sec.js AAPL latest
  node sec.js MSFT latest --form 10-Q --limit 2
  node sec.js GOOGL 2024 --output ./reports --refresh-cache`
=======
    .argument("<ticker>", "stock ticker, e.g. AAPL or AAPL,MSFT")
    .argument("<year>", 'filing year or "latest"')
    .option("-f, --form <type>", "SEC form type", "10-K")
    .option("-l, --limit <number>", "max number of filings")
    .option("-o, --output <dir>", "download directory", DEFAULT_DOWNLOAD_DIR)
    .option("--refresh-cache", "ignore cache")
    .addHelpText(
      "after",
      `
Examples:
  sec AAPL 2023
  sec AAPL latest
  sec MSFT latest --form 10-Q --limit 2
  sec GOOGL 2024 --output ./reports --refresh-cache
  sec AAPL,MSFT latest --limit 2
`
>>>>>>> dev
    );

  program.parse(argv);

<<<<<<< HEAD
  const [ticker, year] = program.args;
  const options = program.opts();

  return {
    ticker: normalizeTicker(ticker),
=======
  const [tickerInput, year] = program.args;
  const options = program.opts();

  return {
    tickers: tickerInput.split(",").map(normalizeTicker),
>>>>>>> dev
    year,
    form: options.form.toUpperCase(),
    limit: options.limit ? parseLimit(options.limit) : null,
    outputDir: path.resolve(options.output),
    refreshCache: Boolean(options.refreshCache),
  };
}

<<<<<<< HEAD
=======
// ===== ticker → CIK =====
>>>>>>> dev
async function getCIK(ticker) {
  const cacheFile = path.join(CACHE_DIR, "ticker_cik.json");
  const cache = loadJSON(cacheFile) || {};

  if (cache[ticker]) {
    console.log("Cache hit (CIK):", ticker);
    return cache[ticker];
  }

  console.log("Fetching CIK from SEC...");

<<<<<<< HEAD
  const res = await axios.get("https://www.sec.gov/files/company_tickers.json", {
=======
  const res = await safeRequest({
    url: "https://www.sec.gov/files/company_tickers.json",
>>>>>>> dev
    headers: { "User-Agent": USER_AGENT },
  });

  for (const key in res.data) {
    if (res.data[key].ticker.toUpperCase() === ticker) {
      const cik = res.data[key].cik_str.toString().padStart(10, "0");

      cache[ticker] = cik;
      saveJSON(cacheFile, cache);

      return cik;
    }
  }

  throw new Error(`Ticker not found: ${ticker}`);
}

<<<<<<< HEAD
=======
// ===== filings =====
>>>>>>> dev
async function getFilings(cik, ticker, refreshCache = false) {
  const file = path.join(FILINGS_CACHE_DIR, `${ticker}.json`);

  if (!refreshCache && fs.existsSync(file)) {
    const stat = fs.statSync(file);
    const age = Date.now() - stat.mtimeMs;

    if (age < CACHE_TTL_MS) {
      console.log("Cache hit (filings)");
      return loadJSON(file);
    }
  }

  console.log("Fetching filings from SEC...");

  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
<<<<<<< HEAD
  const res = await axios.get(url, {
=======

  const res = await safeRequest({
    url,
>>>>>>> dev
    headers: { "User-Agent": USER_AGENT },
  });

  saveJSON(file, res.data.filings.recent);

  return res.data.filings.recent;
}

<<<<<<< HEAD
=======
// ===== 过滤 =====
>>>>>>> dev
function filterFilings(filings, { year, form, limit }) {
  const results = [];
  const latestOnly = year.toLowerCase() === "latest";

  for (let i = 0; i < filings.form.length; i++) {
    if (filings.form[i] !== form) continue;
<<<<<<< HEAD
    if (!latestOnly && !filings.filingDate[i].startsWith(year)) continue;

=======

    if (!latestOnly && !filings.filingDate[i].startsWith(year)) continue;

>>>>>>> dev
    results.push({
      accession: filings.accessionNumber[i],
      document: filings.primaryDocument[i],
      filingDate: filings.filingDate[i],
      form: filings.form[i],
    });

<<<<<<< HEAD
    if (latestOnly) break;
    if (limit && results.length >= limit) break;
=======
    // limit 优先
    if (limit && results.length >= limit) break;

    // latest 默认 1 条
    if (latestOnly && !limit && results.length >= 1) break;
>>>>>>> dev
  }

  return results;
}

<<<<<<< HEAD
=======
// ===== 下载 =====
>>>>>>> dev
async function downloadFile(cik, ticker, filing, outputDir) {
  const accession = filing.accession.replace(/-/g, "");
  const dir = path.join(outputDir, ticker);

  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, filing.document);

  if (fs.existsSync(filePath)) {
    console.log("Skip:", filing.document);
    return;
  }

  const url = `https://www.sec.gov/Archives/edgar/data/${Number.parseInt(
    cik,
    10
  )}/${accession}/${filing.document}`;

  console.log(`Downloading ${filing.form} ${filing.filingDate}: ${filing.document}`);

  const res = await safeRequest({
    url,
    headers: { "User-Agent": USER_AGENT },
    responseType: "stream",
  });

  const writer = fs.createWriteStream(filePath);
  res.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      console.log("Saved:", filePath);
      resolve();
    });
    writer.on("error", reject);
  });
}

<<<<<<< HEAD
async function main() {
  try {
    const options = parseOptions(process.argv);

    console.log(`\n${options.ticker} ${options.year} ${options.form}\n`);

    const cik = await getCIK(options.ticker);
    console.log("CIK:", cik);

    const filings = await getFilings(cik, options.ticker, options.refreshCache);
    const targets = filterFilings(filings, options);

    if (targets.length === 0) {
      console.log(`No ${options.form} found`);
      return;
    }

    for (const filing of targets) {
      await downloadFile(cik, options.ticker, filing, options.outputDir);
    }

    console.log("\nDone");
  } catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
=======
// ===== 主流程 =====
async function processTicker(ticker, options) {
  console.log(`\n📊 ${ticker} ${options.year} ${options.form}\n`);

  const cik = await getCIK(ticker);
  console.log("CIK:", cik);

  const filings = await getFilings(cik, ticker, options.refreshCache);
  const targets = filterFilings(filings, options);

  if (targets.length === 0) {
    console.log(`No ${options.form} found`);
    return;
  }

  for (const filing of targets) {
    await downloadFile(cik, ticker, filing, options.outputDir);
    await sleep(200); // 限速
>>>>>>> dev
  }
}

async function main() {
  try {
    const options = parseOptions(process.argv);

    for (const ticker of options.tickers) {
      await processTicker(ticker, options);
    }

    console.log("\nDone");
  } catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
  }
}

main();