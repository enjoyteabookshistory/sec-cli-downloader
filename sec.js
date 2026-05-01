#!/usr/bin/env node

const axios = require("axios");
const { Command, InvalidArgumentError } = require("commander");
const fs = require("fs");
const os = require("os");
const path = require("path");

const USER_AGENT = process.env.SEC_USER_AGENT || "your-email@example.com";
const CACHE_DIR = process.env.SEC_CACHE_DIR
  ? path.resolve(process.env.SEC_CACHE_DIR)
  : path.join(os.homedir(), ".sec-cli-downloader", "cache");
const FILINGS_CACHE_DIR = path.join(CACHE_DIR, "filings");
const DEFAULT_DOWNLOAD_DIR = path.resolve(process.cwd(), "downloads");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function loadJSON(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveJSON(file, data) {
  ensureDirectory(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function normalizeTicker(ticker) {
  return ticker.trim().toUpperCase();
}

function parseTickerList(value) {
  const tickers = value
    .split(",")
    .map(normalizeTicker)
    .filter(Boolean);

  if (tickers.length === 0) {
    throw new InvalidArgumentError("ticker must include at least one symbol");
  }

  return tickers;
}

function parseYear(value) {
  const year = value.trim();

  if (year.toLowerCase() === "latest") return year;
  if (/^\d{4}$/.test(year)) return year;

  throw new InvalidArgumentError('year must be a 4-digit year or "latest"');
}

function parseLimit(value) {
  const limit = Number.parseInt(value, 10);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new InvalidArgumentError("--limit must be a positive integer");
  }

  return limit;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeRequest(config) {
  try {
    return await axios({
      timeout: 30000,
      ...config,
      headers: {
        "User-Agent": USER_AGENT,
        ...(config.headers || {}),
      },
    });
  } catch (error) {
    if (error.response) {
      throw new Error(`SEC request failed with status ${error.response.status}`);
    }

    throw new Error(`SEC request failed: ${error.message}`);
  }
}

function parseOptions(argv) {
  const program = new Command();

  program
    .name("sec")
    .description("Download SEC filings by ticker and filing year")
    .argument("<ticker>", "stock ticker, e.g. AAPL or AAPL,MSFT")
    .argument("<year>", 'filing year or "latest"')
    .option("-f, --form <type>", "SEC form type", "10-K")
    .option("-l, --limit <number>", "max number of filings", parseLimit)
    .option("-o, --output <dir>", "download directory", DEFAULT_DOWNLOAD_DIR)
    .option("--refresh-cache", "ignore cached SEC metadata")
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
    );

  program.parse(argv);

  const [tickerInput, yearInput] = program.args;
  const options = program.opts();

  return {
    tickers: parseTickerList(tickerInput),
    year: parseYear(yearInput),
    form: options.form.trim().toUpperCase(),
    limit: options.limit || null,
    outputDir: path.resolve(process.cwd(), options.output),
    refreshCache: Boolean(options.refreshCache),
  };
}

async function getCIK(ticker, refreshCache = false) {
  const cacheFile = path.join(CACHE_DIR, "ticker_cik.json");
  const cache = loadJSON(cacheFile) || {};

  if (!refreshCache && cache[ticker]) {
    console.log("Cache hit (CIK):", ticker);
    return cache[ticker];
  }

  console.log("Fetching CIK from SEC...");

  const response = await safeRequest({
    url: "https://www.sec.gov/files/company_tickers.json",
  });

  const company = Object.values(response.data).find(
    (item) => item.ticker && item.ticker.toUpperCase() === ticker
  );

  if (!company) {
    throw new Error(`Ticker not found: ${ticker}`);
  }

  const cik = company.cik_str.toString().padStart(10, "0");
  cache[ticker] = cik;
  saveJSON(cacheFile, cache);

  return cik;
}

async function getFilings(cik, ticker, refreshCache = false) {
  const cacheFile = path.join(FILINGS_CACHE_DIR, `${ticker}.json`);

  if (!refreshCache && fs.existsSync(cacheFile)) {
    const stat = fs.statSync(cacheFile);
    const age = Date.now() - stat.mtimeMs;

    if (age < CACHE_TTL_MS) {
      console.log("Cache hit (filings):", ticker);
      return loadJSON(cacheFile);
    }
  }

  console.log("Fetching filings from SEC...");

  const response = await safeRequest({
    url: `https://data.sec.gov/submissions/CIK${cik}.json`,
  });

  const recentFilings = response.data?.filings?.recent;

  if (!recentFilings) {
    throw new Error(`Unable to load recent filings for ${ticker}`);
  }

  saveJSON(cacheFile, recentFilings);
  return recentFilings;
}

function filterFilings(filings, { year, form, limit }) {
  const results = [];
  const latestOnly = year.toLowerCase() === "latest";
  const total = Array.isArray(filings.form) ? filings.form.length : 0;

  for (let index = 0; index < total; index += 1) {
    if (filings.form[index] !== form) continue;

    const filingDate = filings.filingDate[index] || "";
    if (!latestOnly && !filingDate.startsWith(year)) continue;

    const document = filings.primaryDocument[index];
    if (!document) continue;

    results.push({
      accession: filings.accessionNumber[index],
      document,
      filingDate,
      form: filings.form[index],
    });

    if (limit && results.length >= limit) break;
    if (latestOnly && !limit && results.length >= 1) break;
  }

  return results;
}

async function downloadFile(cik, ticker, filing, outputDir) {
  const accession = filing.accession.replace(/-/g, "");
  const tickerDir = path.join(outputDir, ticker);
  const filePath = path.join(tickerDir, filing.document);

  ensureDirectory(tickerDir);

  if (fs.existsSync(filePath)) {
    console.log("Skip:", filePath);
    return filePath;
  }

  const url = `https://www.sec.gov/Archives/edgar/data/${Number.parseInt(
    cik,
    10
  )}/${accession}/${filing.document}`;

  console.log(`Downloading ${filing.form} ${filing.filingDate}: ${filing.document}`);

  const response = await safeRequest({
    url,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);

  await new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });

  console.log("Saved:", filePath);
  return filePath;
}

async function processTicker(ticker, options) {
  console.log(`\n${ticker} ${options.year} ${options.form}\n`);

  const cik = await getCIK(ticker, options.refreshCache);
  console.log("CIK:", cik);

  const filings = await getFilings(cik, ticker, options.refreshCache);
  const targets = filterFilings(filings, options);

  if (targets.length === 0) {
    console.log(`No ${options.form} filings found for ${ticker}`);
    return;
  }

  for (const filing of targets) {
    await downloadFile(cik, ticker, filing, options.outputDir);
    await sleep(200);
  }
}

async function main(argv = process.argv) {
  try {
    const options = parseOptions(argv);

    if (!process.env.SEC_USER_AGENT) {
      console.warn(
        "Warning: SEC_USER_AGENT is not set. Set your email to reduce SEC rate-limit issues."
      );
    }

    ensureDirectory(options.outputDir);

    for (const ticker of options.tickers) {
      await processTicker(ticker, options);
    }

    console.log("\nDone");
  } catch (error) {
    console.error("Error:", error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  CACHE_DIR,
  CACHE_TTL_MS,
  DEFAULT_DOWNLOAD_DIR,
  FILINGS_CACHE_DIR,
  downloadFile,
  filterFilings,
  getCIK,
  getFilings,
  main,
  normalizeTicker,
  parseLimit,
  parseOptions,
  parseTickerList,
  parseYear,
  processTicker,
  safeRequest,
};

if (require.main === module) {
  main();
}
