#!/usr/bin/env node

const axios = require("axios");
const { Command } = require("commander");
const fs = require("fs");
const path = require("path");

<<<<<<< HEAD
<<<<<<< HEAD
const USER_AGENT = process.env.SEC_USER_AGENT || "your-email@example.com";
=======
// ===== 基础配置 =====
const USER_AGENT = process.env.SEC_USER_AGENT || "your-email@example.com";
=======
// ===== 基础配置 =====
const USER_AGENT = process.env.SEC_USER_AGENT || "your-email@example.com";
>>>>>>> a3d0009 (updae sec to be a npm package)

if (!process.env.SEC_USER_AGENT) {
  console.warn(
    "⚠️  SEC_USER_AGENT not set. Please set your email to avoid rate limiting."
  );
}

<<<<<<< HEAD
>>>>>>> dev
=======
>>>>>>> a3d0009 (updae sec to be a npm package)
const BASE_DIR = __dirname;
const CACHE_DIR = path.join(BASE_DIR, "cache");
const FILINGS_CACHE_DIR = path.join(CACHE_DIR, "filings");
const DEFAULT_DOWNLOAD_DIR = path.join(BASE_DIR, "downloads");
<<<<<<< HEAD
<<<<<<< HEAD
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
=======
>>>>>>> dev
=======
>>>>>>> a3d0009 (updae sec to be a npm package)

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// ===== 初始化目录 =====
fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(FILINGS_CACHE_DIR, { recursive: true });

<<<<<<< HEAD
<<<<<<< HEAD
=======
// ===== 工具函数 =====
>>>>>>> dev
=======
// ===== 工具函数 =====
>>>>>>> a3d0009 (updae sec to be a npm package)
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
<<<<<<< HEAD

=======
>>>>>>> a3d0009 (updae sec to be a npm package)
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer");
  }
  return limit;
}

<<<<<<< HEAD
=======
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer");
  }
  return limit;
}

=======
>>>>>>> a3d0009 (updae sec to be a npm package)
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
<<<<<<< HEAD
>>>>>>> dev
=======
>>>>>>> a3d0009 (updae sec to be a npm package)
function parseOptions(argv) {
  const program = new Command();

  program
    .name("sec")
    .description("Download SEC filings by ticker and filing year")
<<<<<<< HEAD
<<<<<<< HEAD
    .argument("<ticker>", "stock ticker, for example AAPL")
    .argument("<year>", 'filing year, or "latest"')
    .option("-f, --form <type>", "SEC filing form to download", "10-K")
    .option("-l, --limit <number>", "maximum number of filings to download")
=======
    .argument("<ticker>", "stock ticker, e.g. AAPL or AAPL,MSFT")
    .argument("<year>", 'filing year or "latest"')
    .option("-f, --form <type>", "SEC form type", "10-K")
    .option("-l, --limit <number>", "max number of filings")
>>>>>>> a3d0009 (updae sec to be a npm package)
    .option("-o, --output <dir>", "download directory", DEFAULT_DOWNLOAD_DIR)
    .option("--refresh-cache", "ignore cache")
    .addHelpText(
      "after",
      `
Examples:
<<<<<<< HEAD
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
=======
>>>>>>> a3d0009 (updae sec to be a npm package)
  sec AAPL 2023
  sec AAPL latest
  sec MSFT latest --form 10-Q --limit 2
  sec GOOGL 2024 --output ./reports --refresh-cache
  sec AAPL,MSFT latest --limit 2
`
<<<<<<< HEAD
>>>>>>> dev
=======
>>>>>>> a3d0009 (updae sec to be a npm package)
    );

  program.parse(argv);

<<<<<<< HEAD
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
=======
  const [tickerInput, year] = program.args;
  const options = program.opts();

  return {
    tickers: tickerInput.split(",").map(normalizeTicker),
>>>>>>> a3d0009 (updae sec to be a npm package)
    year,
    form: options.form.toUpperCase(),
    limit: options.limit ? parseLimit(options.limit) : null,
    outputDir: path.resolve(options.output),
    refreshCache: Boolean(options.refreshCache),
  };
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
// ===== ticker → CIK =====
>>>>>>> dev
=======
// ===== ticker → CIK =====
>>>>>>> a3d0009 (updae sec to be a npm package)
async function getCIK(ticker) {
  const cacheFile = path.join(CACHE_DIR, "ticker_cik.json");
  const cache = loadJSON(cacheFile) || {};

  if (cache[ticker]) {
    console.log("Cache hit (CIK):", ticker);
    return cache[ticker];
  }

  console.log("Fetching CIK from SEC...");

<<<<<<< HEAD
<<<<<<< HEAD
  const res = await axios.get("https://www.sec.gov/files/company_tickers.json", {
=======
  const res = await safeRequest({
    url: "https://www.sec.gov/files/company_tickers.json",
>>>>>>> dev
=======
  const res = await safeRequest({
    url: "https://www.sec.gov/files/company_tickers.json",
>>>>>>> a3d0009 (updae sec to be a npm package)
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
<<<<<<< HEAD
=======
// ===== filings =====
>>>>>>> dev
=======
// ===== filings =====
>>>>>>> a3d0009 (updae sec to be a npm package)
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
<<<<<<< HEAD
  const res = await axios.get(url, {
=======

  const res = await safeRequest({
    url,
>>>>>>> dev
=======

  const res = await safeRequest({
    url,
>>>>>>> a3d0009 (updae sec to be a npm package)
    headers: { "User-Agent": USER_AGENT },
  });

  saveJSON(file, res.data.filings.recent);

  return res.data.filings.recent;
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
// ===== 过滤 =====
>>>>>>> dev
=======
// ===== 过滤 =====
>>>>>>> a3d0009 (updae sec to be a npm package)
function filterFilings(filings, { year, form, limit }) {
  const results = [];
  const latestOnly = year.toLowerCase() === "latest";

  for (let i = 0; i < filings.form.length; i++) {
    if (filings.form[i] !== form) continue;
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> a3d0009 (updae sec to be a npm package)
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
<<<<<<< HEAD
    if (latestOnly) break;
    if (limit && results.length >= limit) break;
=======
    // limit 优先
    if (limit && results.length >= limit) break;

    // latest 默认 1 条
    if (latestOnly && !limit && results.length >= 1) break;
>>>>>>> dev
=======
    // limit 优先
    if (limit && results.length >= limit) break;

    // latest 默认 1 条
    if (latestOnly && !limit && results.length >= 1) break;
>>>>>>> a3d0009 (updae sec to be a npm package)
  }

  return results;
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
// ===== 下载 =====
>>>>>>> dev
=======
// ===== 下载 =====
>>>>>>> a3d0009 (updae sec to be a npm package)
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
<<<<<<< HEAD
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
  }
}

>>>>>>> a3d0009 (updae sec to be a npm package)
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

<<<<<<< HEAD
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

=======
>>>>>>> a3d0009 (updae sec to be a npm package)
main();