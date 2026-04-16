# SEC CLI Downloader

A lightweight CLI tool to download SEC filings directly from the SEC website.

一個輕量級命令行工具，用於從美國 SEC 官網下載公司財報與申報文件。

---

## Features

- Download filings by ticker and year
- Support `latest` lookup
- Local caching for ticker-to-CIK and filings metadata
- Avoid duplicate downloads
- Support custom filing forms such as `10-K`, `10-Q`, and `8-K`
- Support download limits for multi-filing years
- Support cache refresh and custom output directory

---

## Project Structure

- [`sec.js`](/Users/chane/Desktop/Github/download-sec/sec.js): CLI entrypoint, SEC API requests, cache handling, filtering, and file download logic
- [`cache/`](/Users/chane/Desktop/Github/download-sec/cache): cached ticker/CIK mapping and recent filings metadata
- [`downloads/`](/Users/chane/Desktop/Github/download-sec/downloads): downloaded SEC filing documents grouped by ticker
- [`package.json`](/Users/chane/Desktop/Github/download-sec/package.json): package metadata and dependencies

---

## Installation

```bash
git clone https://github.com/your-username/sec-cli-downloader.git
cd sec-cli-downloader
npm install
```

---

## Usage

```bash
node sec.js <ticker> <year|latest> [options]
```

Examples:

```bash
node sec.js AAPL 2023
node sec.js AAPL latest
node sec.js MSFT latest --form 10-Q --limit 2
node sec.js GOOGL 2024 --output ./reports --refresh-cache
```

Options:

- `--form <type>`: filing form to download, default is `10-K`
- `--limit <number>`: maximum number of filings to download
- `--output <dir>`: custom download directory
- `--refresh-cache`: fetch fresh filings metadata instead of using cache

Environment variable:

- `SEC_USER_AGENT`: custom SEC-compliant User-Agent string

---

## Roadmap

- [x] Support latest filing download
- [x] Add local caching for CIK and filings metadata
- [x] Avoid duplicate downloads
- [x] Support multiple filing forms
- [x] Add limit control for multi-filing downloads
- [x] Add cache refresh support
- [x] Add custom output directory support
- [ ] Add tests for filtering and CLI parsing
- [ ] Add batch download support for multiple tickers
