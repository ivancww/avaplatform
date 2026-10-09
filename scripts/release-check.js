const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const VERSION_RE = /^v(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)$/;
const metadata = JSON.parse(fs.readFileSync("platform-release.json", "utf8"));
const html = fs.readFileSync("index.html", "utf8");
const version = html.match(/const AVA_PLATFORM_VERSION="([^"]+)";/)?.[1];
if (!version || !VERSION_RE.test(version)) throw new Error("index.html must declare a valid AVA Platform version");
if (metadata.version !== version || !VERSION_RE.test(metadata.version)) throw new Error("release metadata and visible Platform version differ");
if (!/^[0-9a-f]{40}$/.test(metadata.sourceSha)) throw new Error("release metadata sourceSha must be a full Git commit SHA");

const baseRef = process.env.GITHUB_BASE_REF;
if (baseRef) {
  const changed = execFileSync("git", ["diff", "--name-only", `origin/${baseRef}...HEAD`], { encoding: "utf8" }).trim().split("\\n").filter(Boolean);
  const governanceOnly = /^(tests\\/|docs\\/|scripts\\/release-check\\.js$|platform-release\\.json$|\\.github\\/workflows\\/release-governance\\.yml$|AGENTS\\.md$)/;
  const functional = changed.filter(file => !governanceOnly.test(file));
  if (functional.length) {
    const baseHtml = execFileSync("git", ["show", `origin/${baseRef}:index.html`], { encoding: "utf8" });
    const baseVersion = baseHtml.match(/const AVA_PLATFORM_VERSION="([^"]+)";/)?.[1];
    if (baseVersion === version) throw new Error(`release-relevant files changed without a Platform version increment: ${functional.join(", ")}`);
    const parse = value => value.match(/^v(\\d+)\\.(\\d+)\\.(\\d+)$/).slice(1).map(Number);
    const before = parse(baseVersion), after = parse(version);
    if (after[0] < before[0] || (after[0] === before[0] && (after[1] < before[1] || (after[1] === before[1] && after[2] <= before[2])))) {
      throw new Error(`Platform version must increase for functional changes: ${baseVersion} -> ${version}`);
    }
  }
}
console.log(`Platform release check passed: ${version} (${metadata.sourceSha})`);
