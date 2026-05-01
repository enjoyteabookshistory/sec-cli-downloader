const path = require("path");
const test = require("node:test");
const assert = require("node:assert/strict");

const { DEFAULT_DOWNLOAD_DIR, filterFilings, parseOptions } = require("./sec");

test("parseOptions resolves custom output relative to cwd", () => {
  const options = parseOptions([
    "node",
    "sec.js",
    "AAPL,msft",
    "latest",
    "--output",
    "./reports",
  ]);

  assert.deepEqual(options.tickers, ["AAPL", "MSFT"]);
  assert.equal(options.year, "latest");
  assert.equal(options.outputDir, path.resolve(process.cwd(), "reports"));
});

test("parseOptions uses downloads directory by default", () => {
  const options = parseOptions(["node", "sec.js", "AAPL", "2024"]);

  assert.equal(options.outputDir, DEFAULT_DOWNLOAD_DIR);
  assert.equal(options.form, "10-K");
  assert.equal(options.limit, null);
});

test("filterFilings returns the latest filing when no limit is provided", () => {
  const filings = {
    form: ["10-K", "10-K", "10-Q"],
    filingDate: ["2024-02-01", "2023-02-01", "2024-05-01"],
    accessionNumber: ["1", "2", "3"],
    primaryDocument: ["a.htm", "b.htm", "c.htm"],
  };

  const results = filterFilings(filings, {
    year: "latest",
    form: "10-K",
    limit: null,
  });

  assert.equal(results.length, 1);
  assert.equal(results[0].document, "a.htm");
});

test("filterFilings respects limit for matching year", () => {
  const filings = {
    form: ["10-K", "10-K", "10-K"],
    filingDate: ["2024-02-01", "2024-01-01", "2023-02-01"],
    accessionNumber: ["1", "2", "3"],
    primaryDocument: ["a.htm", "b.htm", "c.htm"],
  };

  const results = filterFilings(filings, {
    year: "2024",
    form: "10-K",
    limit: 2,
  });

  assert.equal(results.length, 2);
  assert.deepEqual(
    results.map((item) => item.document),
    ["a.htm", "b.htm"]
  );
});
