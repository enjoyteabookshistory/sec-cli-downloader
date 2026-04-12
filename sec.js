#!/usr/bin/env node

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const USER_AGENT = "your-email@example.com";

const ticker = process.argv[2];
const year = process.argv[3];

if (!ticker || !year) {
  console.log("Usage:");
  console.log("  node sec.js AAPL 2023");
  console.log("  node sec.js AAPL latest");
  process.exit(1);
}

// ===== 路徑 =====
const BASE_DIR = __dirname;
const CACHE_DIR = path.join(BASE_DIR, "cache");
const FILINGS_CACHE_DIR = path.join(CACHE_DIR, "filings");
const DOWNLOAD_DIR = path.join(BASE_DIR, "downloads");

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(FILINGS_CACHE_DIR, { recursive: true });
fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

// ===== 工具 =====
function loadJSON(file) {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file));
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ===== 1. ticker → CIK =====
async function getCIK(ticker) {
  const cacheFile = path.join(CACHE_DIR, "ticker_cik.json");
  let cache = loadJSON(cacheFile) || {};

  if (cache[ticker]) {
    console.log("✅ Cache hit (CIK):", ticker);
    return cache[ticker];
  }

  console.log("🌐 Fetching CIK from SEC...");

  const res = await axios.get(
    "https://www.sec.gov/files/company_tickers.json",
    { headers: { "User-Agent": USER_AGENT } }
  );

  for (let key in res.data) {
    if (res.data[key].ticker.toLowerCase() === ticker.toLowerCase()) {
      const cik = res.data[key].cik_str.toString().padStart(10, "0");

      cache[ticker] = cik;
      saveJSON(cacheFile, cache);

      return cik;
    }
  }

  throw new Error("Ticker not found");
}

// ===== 2. filings（帶 cache）=====
async function getFilings(cik, ticker) {
  const file = path.join(FILINGS_CACHE_DIR, `${ticker}.json`);

  if (fs.existsSync(file)) {
    const stat = fs.statSync(file);
    const age = Date.now() - stat.mtimeMs;

    if (age < 24 * 60 * 60 * 1000) {
      console.log("✅ Cache hit (filings)");
      return loadJSON(file);
    }
  }

  console.log("🌐 Fetching filings from SEC...");

  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;

  const res = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
  });

  saveJSON(file, res.data.filings.recent);

  return res.data.filings.recent;
}

// ===== 3. 過濾 10-K =====
function filter10K(filings, year) {
  const results = [];

  for (let i = 0; i < filings.form.length; i++) {
    if (filings.form[i] === "10-K") {
      if (year === "latest") {
        // 找第一個（最新）
        return [
          {
            accession: filings.accessionNumber[i],
            document: filings.primaryDocument[i],
          },
        ];
      }

      if (filings.filingDate[i].startsWith(year)) {
        results.push({
          accession: filings.accessionNumber[i],
          document: filings.primaryDocument[i],
        });
      }
    }
  }

  return results;
}

// ===== 4. 下載 =====
async function downloadFile(cik, filing) {
  const accession = filing.accession.replace(/-/g, "");

  const dir = path.join(DOWNLOAD_DIR, ticker);
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, filing.document);

  if (fs.existsSync(filePath)) {
    console.log("⏭ Skip:", filing.document);
    return;
  }

  const url = `https://www.sec.gov/Archives/edgar/data/${parseInt(
    cik
  )}/${accession}/${filing.document}`;

  console.log("⬇ Downloading:", filing.document);

  const res = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
    responseType: "stream",
  });

  const writer = fs.createWriteStream(filePath);
  res.data.pipe(writer);

  return new Promise((resolve) => {
    writer.on("finish", () => {
      console.log("✅ Saved:", filePath);
      resolve();
    });
  });
}

// ===== 主流程 =====
async function main() {
  try {
    console.log(`\n📊 ${ticker} ${year}\n`);

    const cik = await getCIK(ticker);
    console.log("CIK:", cik);

    const filings = await getFilings(cik, ticker);
    const targets = filter10K(filings, year);

    if (targets.length === 0) {
      console.log("❌ No 10-K found");
      return;
    }

    for (const filing of targets) {
      await downloadFile(cik, filing);
    }

    console.log("\n🎉 Done");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

main();
