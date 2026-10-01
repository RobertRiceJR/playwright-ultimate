#!/usr/bin/env node
// Refreshes the live metrics in data.js: GitHub stars + last push, npm weekly downloads.
// Curated content (picks, techniques, notes) is never touched; npm packages are re-sorted
// by downloads because that is their ranking rule. Repos keep their curated order.
//
//   node .claude/dashboards/ecosystem/refresh.mjs            # update data.js in place
//   node .claude/dashboards/ecosystem/refresh.mjs --dry-run  # report only
//
// GitHub auth: GITHUB_TOKEN env var, else `gh auth token`, else unauthenticated (60 req/hr).

import { readFile, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(here, "data.js");
const repoRoot = path.resolve(here, "../../..");
const dryRun = process.argv.includes("--dry-run");

const HEADER = `// Single source of truth for the Playwright Ecosystem Guide (index.html).
// Edit content freely; keep it strict JSON after the "=" so refresh.mjs can parse it.
// Live numbers (stars, pushed, weekly, asOf) are rewritten by refresh.mjs.
window.ECOSYSTEM = `;

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try { return execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; }
}

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) { const idx = i++; out[idx] = await fn(items[idx]); }
  }));
  return out;
}

async function playwrightVersion() {
  for (const p of ["node_modules/@playwright/test/package.json", "package.json"]) {
    try {
      const pkg = JSON.parse(await readFile(path.join(repoRoot, p), "utf8"));
      const v = pkg.version && p.startsWith("node_modules") ? pkg.version : pkg.devDependencies?.["@playwright/test"];
      if (v) return v.replace(/^[^\d]*/, "").split(".").slice(0, 2).join(".");
    } catch { /* try next */ }
  }
  return null;
}

const raw = await readFile(dataPath, "utf8");
const data = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
const gh = token();
const headers = { Accept: "application/vnd.github+json", "User-Agent": "playwright-ultimate-dashboard", ...(gh && { Authorization: `Bearer ${gh}` }) };
const warnings = [];
let changed = 0;

const repos = data.categories.flatMap((c) => c.repos.map((r) => ({ c, r })));
await pool(repos, 6, async ({ c, r }) => {
  const res = await fetch(`https://api.github.com/repos/${r.repo}`, { headers });
  if (!res.ok) { warnings.push(`[${c.id}] ${r.repo}: GitHub ${res.status}`); return; }
  const j = await res.json();
  const pushed = j.pushed_at?.slice(0, 10);
  if (j.full_name && j.full_name !== r.repo) warnings.push(`[${c.id}] ${r.repo} moved to ${j.full_name} (updated)`);
  if (j.archived) warnings.push(`[${c.id}] ${r.repo} is ARCHIVED — replace it`);
  const age = (Date.now() - new Date(pushed)) / 864e5;
  if (age > 365) warnings.push(`[${c.id}] ${r.repo} has not been pushed in ${Math.round(age)} days`);
  if (r.stars !== j.stargazers_count || r.pushed !== pushed) changed++;
  Object.assign(r, { repo: j.full_name || r.repo, stars: j.stargazers_count, pushed });
});

const pkgs = data.categories.flatMap((c) => c.npm.map((n) => ({ c, n })));
await pool(pkgs, 6, async ({ c, n }) => {
  const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${n.name}`);
  if (!res.ok) { warnings.push(`[${c.id}] ${n.name}: npm ${res.status}`); return; }
  const j = await res.json();
  if (n.weekly !== j.downloads) changed++;
  n.weekly = j.downloads;
});
for (const c of data.categories) c.npm.sort((a, b) => (b.weekly || 0) - (a.weekly || 0));

data.asOf = new Date().toISOString().slice(0, 10);
data.playwrightVersion = (await playwrightVersion()) || data.playwrightVersion;

console.log(`Checked ${repos.length} repos and ${pkgs.length} packages; ${changed} metric(s) changed.`);
for (const w of warnings) console.log("  ! " + w);
if (dryRun) console.log("Dry run: data.js not written.");
else { await writeFile(dataPath, HEADER + JSON.stringify(data, null, 2) + ";\n"); console.log(`Wrote ${path.relative(repoRoot, dataPath)} (asOf ${data.asOf}).`); }
