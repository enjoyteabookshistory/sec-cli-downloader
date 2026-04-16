# SEC CLI Downloader

A lightweight CLI tool to download SEC filings directly from the SEC website.

一個輕量級命令行工具，用於從美國 SEC 官網下載公司財報與申報文件。



## Features

- Download filings by ticker and year
- Support `latest` lookup
- Local caching for ticker-to-CIK and filings metadata
- Avoid duplicate downloads
- Support custom filing forms such as `10-K`, `10-Q`, and `8-K`
- Support download limits for multi-filing years
- Support cache refresh and custom output directory


## Project Structure

- [`sec.js`](/Users/chane/Desktop/Github/download-sec/sec.js): CLI entrypoint, SEC API requests, cache handling, filtering, and file download logic
- [`cache/`](/Users/chane/Desktop/Github/download-sec/cache): cached ticker/CIK mapping and recent filings metadata
- [`downloads/`](/Users/chane/Desktop/Github/download-sec/downloads): downloaded SEC filing documents grouped by ticker
- [`package.json`](/Users/chane/Desktop/Github/download-sec/package.json): package metadata and dependencies



## Installation
=======
## 🚀 Features | 功能

- Download 10-K filings by ticker and year  
  根據股票代碼和年份下載年報

- Support latest filing download  
  支援下載最新年報（latest）

- Local caching (CIK & filings)  
  本地快取（CIK 與 filings）

- Avoid duplicate downloads  
  避免重複下載

- Fast and minimal dependencies  
  快速且依賴少

- Support multiple tickers (e.g. AAPL,MSFT)  
  支援多股票同時下載  

- Support multiple filing types (10-K / 10-Q / 8-K)  
  支援多種財報類型  

- Limit number of downloads  
  支援下載數量限制  

- CLI tool available via npm (`sec` command)  
  已發佈為 npm CLI 工具  

## 📦 Installation | 安裝

```bash
git clone https://github.com/your-username/sec-cli-downloader.git
cd sec-cli-downloader
npm install
```

=======
### 🆕 Option: Install via npm (Recommended)

```bash
npm install -g sec-cli-downloader

Then you can use:
```bash
sec AAPL latest

Or run without install:
```bash
npx sec-cli-downloader AAPL latest


# 用一個 CLI 工具，一鍵下載美股公司財報（SEC 10-K）

最近我做了一個小而實用的開源工具：
👉 **sec-cli-downloader**

它可以讓你在命令行中，直接從 U.S. Securities and Exchange Commission 官網下載美股公司的年度財報（10-K）。

---

## 🚀 為什麼要做這個工具？

如果你做過投資研究，應該會有這些痛點：

* 想看公司年報，需要手動去 SEC 官網查找
* 找到之後還要點很多層才能下載
* 想批量分析公司時，效率極低

我希望有一個工具，可以做到：

👉 **輸入股票代碼 → 自動下載財報**

---

## ⚙️ 工具使用方式

### 1️⃣ 下載指定年份財報

```bash
node sec.js AAPL 2023
```

---

### 2️⃣ 下載最新財報（最實用）

```bash
node sec.js GOOGL latest
```

👉 會自動下載 Alphabet Inc. 最新提交的 10-K 年報


---

=======


---

## ✅ ③ 替换示例（保留原 node，用 CLI 增强）
```bash
sec AAPL 2023
# 或
```bash
node sec.js AAPL 2023
---
```bash
sec GOOGL latest
# 或
```bash
node sec.js GOOGL latest

### 🆕 更多用法

```bash
# 多股票
sec AAPL,MSFT latest

# 下载 10-Q
sec MSFT latest --form 10-Q

# 限制数量
sec AAPL latest --limit 2

# 自定义输出目录
sec GOOGL 2024 --output ./reports


## 🧠 核心實現原理

整個流程其實很乾淨：

1. **Ticker → CIK**
2. 從 SEC API 獲取 filings
3. 過濾 10-K
4. 下載 HTML 財報

數據來源全部來自 SEC 官方 API：

```text
https://data.sec.gov/
```
（工具通過 CLI 封裝 SEC API，實現自動化下載與本地快取）

---

## ⚡ 性能優化（重點）

這個工具做了幾個關鍵優化：

### ✅ 本地 Cache

* ticker → CIK
* filings（1天有效）

避免重複請求 SEC

---

### ✅ 避免重複下載

如果文件已存在，直接跳過：

```bash
⏭ Skip: xxxx.htm
```

---

### ✅ Lazy Loading 設計

不預先下載全部公司數據，而是：

👉 用到才 cache

這樣可以保持：

* 輕量
* 高效
* 可擴展

---

## 📁 輸出結果

下載的財報會保存在：

```bash
downloads/<TICKER>/
```

直接打開就是完整 10-K：

```bash
open downloads/GOOGL/xxxx.htm
```

---

## 🔥 這個工具的意義（不只是下載）

這個工具本質上是：

👉 **金融數據管道（Data Ingestion Layer）**

它可以作為：

* 財報分析系統的入口
* 量化投資數據源
* 自動估值模型的基礎

---

## 🚀 未來規劃

接下來我準備擴展：

* 支援 10-Q / 8-K
* PDF 下載
* 批量股票下載
* 財報結構化解析（XBRL）
* CLI 查詢 & 分析功能

例如：

```bash
sec analyze AAPL
```


=======
### 🆕 CLI 用法（推薦）

```bash
sec <ticker> <year|latest> [options]

支持：

多股票：AAPL,MSFT
不同表單：--form 10-K / 10-Q / 8-K
限制下載數量：--limit


---

## 🔗 開源地址

GitHub：

👉 https://github.com/enjoyteabookshistory/sec-cli-downloader

---

## ⭐ 如果對你有幫助

歡迎 Star ⭐ 或提 PR 🙌

# Build a CLI Tool to Download SEC 10-K Filings in Seconds

I recently built a lightweight open-source CLI tool:
👉 **sec-cli-downloader**

It allows you to download company annual reports (10-K) directly from the U.S. Securities and Exchange Commission in seconds.

---

## 🚀 Why I built this

If you've ever done equity research, you probably faced this:

* Navigating the SEC website is tedious
* Too many clicks to find a filing
* Impossible to scale for multiple companies

I wanted something simple:

👉 **Input a ticker → Download the filing**

---

## ⚙️ Usage

### Download by year

```bash
node sec.js AAPL 2023
```

---

### Download latest 10-K

```bash
node sec.js GOOGL latest
```

This will fetch the latest filing of Alphabet Inc. automatically.


=======
### 🆕 CLI Usage (Recommended)

```bash
sec AAPL latest

Or
```bash
npx sec-cli-downloader AAPL latest
>>>>>>> dev
---

## 🧠 How it works

The pipeline is straightforward:

1. Convert ticker → CIK
2. Fetch filings from SEC API
3. Filter 10-K
4. Download filing document

Data source:

```
https://data.sec.gov/
```

---

## ⚡ Performance Optimizations

### ✅ Local caching

* ticker → CIK
* filings (1-day TTL)

---

### ✅ Skip duplicate downloads

Already downloaded files are skipped automatically.

---

### ✅ Lazy loading

Only fetch data when needed.

This keeps the tool:

* Fast
* Lightweight
* Scalable

---

## 📁 Output

Files are saved under:

```
downloads/<TICKER>/
```

You can open them directly:

```bash
open downloads/GOOGL/xxxx.htm
```

---

## 🔥 Beyond a downloader

This tool is more than a downloader.

👉 It is a **data ingestion layer for financial analysis**

You can build on top of it:

* Financial modeling
* Quant pipelines
* Automated valuation

---

## 🚀 Roadmap

* Support 10-Q / 8-K
* PDF downloads
* Batch processing
* XBRL parsing
* CLI analytics

Example:

```bash
sec analyze AAPL
```

---

## 🔗 GitHub

👉 https://github.com/enjoyteabookshistory/sec-cli-downloader

---

## ⭐ If you find it useful

Give it a star or contribute 🙌

=======
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

=======