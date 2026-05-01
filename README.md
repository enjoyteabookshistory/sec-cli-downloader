# sec-cli-downloader

A lightweight CLI for downloading SEC EDGAR filings.

一个轻量级命令行工具，用于下载美股上市公司的 SEC 财报。

## Features

- Download filings by ticker and year
- Download the latest filing with `latest`
- Support multiple tickers such as `AAPL,MSFT`
- Support multiple form types such as `10-K`, `10-Q`, `8-K`
- Skip files that already exist
- Cache SEC metadata locally
- Download to a custom directory with `--output`

## Installation

```bash
npm install -g sec-cli-downloader
```

The SEC expects a descriptive user agent. Set your email before using the CLI:

```bash
export SEC_USER_AGENT="your-email@example.com"
```

## Usage

```bash
sec <ticker[,ticker...]> <year|latest> [options]
```

Options:

- `-f, --form <type>` SEC form type, default `10-K`
- `-l, --limit <number>` maximum number of filings to download
- `-o, --output <dir>` download directory, default `./downloads`
- `--refresh-cache` ignore cached SEC metadata

## Examples

```bash
# Download a 10-K for a specific year
sec AAPL 2023

# Download the latest 10-K
sec GOOGL latest

# Download 10-Q filings
sec MSFT latest --form 10-Q

# Download multiple tickers
sec AAPL,MSFT latest --limit 2

# Download to a custom directory
sec NVDA 2024 --output ./reports

# Run without a global install
npx sec-cli-downloader AAPL latest --output ./reports
```

## Output

By default, filings are saved to:

```text
./downloads/<TICKER>/
```

With a custom output directory:

```text
<your-output-dir>/<TICKER>/
```

## Cache

SEC metadata is cached for 24 hours in:

```text
~/.sec-cli-downloader/cache/
```

Set `SEC_CACHE_DIR` if you want to override the cache location.
