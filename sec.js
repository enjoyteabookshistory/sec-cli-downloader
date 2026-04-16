#!/usr/bin/env node

const axios = require("axios");
const { Command } = require("commander");
const fs = require("fs");
const path = require("path");

const USER_AGENT = process.env.SEC_USER_AGENT || "your-email@example.com";
const BASE_DIR = __dirname;
const CACHE_DIR = path.join(BASE_DIR, "cache");
const FILINGS_CACHE_DIR = path.join(CACHE_DIR, "filings");
const DEFAULT_DOWNLOAD_DIR = path.join(BASE_DIR, "downloads");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(FILINGS_CACHE_DIR, { recursive: true });

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

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("--limit must be a positive integer");
  }

  return limit;
}

function parseOptions(argv) {
  const program = new Command();

  program
    .name("sec")
    .description("Download SEC filings by ticker and filing year")
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
    );

  program.parse(argv);

  const [ticker, year] = program.args;
  const options = program.opts();

  return {
    ticker: normalizeTicker(ticker),
    year,
    form: options.form.toUpperCase(),
    limit: options.limit ? parseLimit(options.limit) : null,
    outputDir: path.resolve(options.output),
    refreshCache: Boolean(options.refreshCache),
  };
}

async function getCIK(ticker) {
  const cacheFile = path.join(CACHE_DIR, "ticker_cik.json");
  const cache = loadJSON(cacheFile) || {};

  if (cache[ticker]) {
    console.log("Cache hit (CIK):", ticker);
    return cache[ticker];
  }

  console.log("Fetching CIK from SEC...");

  const res = await axios.get("https://www.sec.gov/files/company_tickers.json", {
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
  const res = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  saveJSON(file, res.data.filings.recent);

  return res.data.filings.recent;
}

function filterFilings(filings, { year, form, limit }) {
  const results = [];
  const latestOnly = year.toLowerCase() === "latest";

  for (let i = 0; i < filings.form.length; i++) {
    if (filings.form[i] !== form) continue;
    if (!latestOnly && !filings.filingDate[i].startsWith(year)) continue;

    results.push({
      accession: filings.accessionNumber[i],
      document: filings.primaryDocument[i],
      filingDate: filings.filingDate[i],
      form: filings.form[i],
    });

    if (latestOnly) break;
    if (limit && results.length >= limit) break;
  }

  return results;
}

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

  const res = await axios.get(url, {
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
  }
}

main();
