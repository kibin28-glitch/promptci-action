#!/usr/bin/env node
const fs = require("fs");

const [, , latestJsonPath, stdoutPath] = process.argv;

if (!latestJsonPath) {
  console.error("Usage: format-comment.js <latest.json path> <stdout capture path>");
  process.exit(1);
}

console.log("<!-- promptci-action -->");
console.log("## promptci results");
console.log("");

if (!fs.existsSync(latestJsonPath)) {
  console.log(
    "⚠️ promptci did not produce `tests/results/latest.json` — the run failed before any prompt was tested. Check the workflow logs for details.",
  );
  process.exit(0);
}

let results;
try {
  results = JSON.parse(fs.readFileSync(latestJsonPath, "utf8"));
} catch (err) {
  console.log(
    "⚠️ promptci produced an unreadable `tests/results/latest.json` — check the workflow logs for details.",
  );
  process.exit(0);
}

for (const result of results) {
  const total = result.cases.length;
  const passCount = result.cases.filter((c) => c.eval.pass).length;
  const icon = result.passed ? "✅" : "❌";
  const status = result.passed ? "PASSED" : "FAILED";
  console.log(`${icon} **${result.promptName}** — ${status} (${passCount}/${total} cases)`);
}

let reportUrl = null;
if (stdoutPath && fs.existsSync(stdoutPath)) {
  const stdout = fs.readFileSync(stdoutPath, "utf8");
  const match = stdout.match(/^Report: (.+)$/m);
  if (match) {
    reportUrl = match[1].trim();
  }
}

if (reportUrl) {
  console.log("");
  console.log(`📊 [Full report](${reportUrl})`);
}
