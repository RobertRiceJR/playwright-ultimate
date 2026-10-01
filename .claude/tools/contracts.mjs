#!/usr/bin/env node
// Reads every contract in .claude/contracts/*.md, validates the dependency graph, prints what
// is ready to mint, and writes .claude/dashboards/the-ark/data.js for the graph dashboard.
//
//   npm run contracts          # validate, print summary, write data.js
//   npm run contracts:check    # validate and print only; exit 1 on errors (CI)
//
// Frontmatter is parsed by a small reader that understands only the template's shape:
// top-level `key: value`, inline lists `[a, b]`, and block lists of scalars or flat maps.
// Anything else fails loudly rather than being guessed at. No dependencies.

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const contractsDir = path.join(repoRoot, ".claude/contracts");
const outDir = path.join(repoRoot, ".claude/dashboards/the-ark");
const checkOnly = process.argv.includes("--check");

const KINDS = ["orchestrator", "capability"];
const STATUSES = ["draft", "proposed", "minted", "deprecated"];
const REQUIRED = ["id", "title", "kind", "stage", "owner", "status", "version", "updated", "provides", "gate"];

// ---------- frontmatter ----------

function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) { if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") quote = c;
    else if (c === "#" && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

function scalar(raw) {
  const v = raw.trim();
  if (v === "" || v === "null" || v === "~") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(",").map(scalar) : [];
  }
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) return v.slice(1, -1);
  return v;
}

function splitPair(text, where) {
  const m = /^([A-Za-z_][\w-]*):(?:\s+(.*))?$/.exec(text);
  if (!m) throw new Error(`${where}: expected "key: value", got "${text}"`);
  return [m[1], m[2] ?? ""];
}

function parseFrontmatter(src, file) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  if (!m) throw new Error(`${file}: no frontmatter block`);
  const lines = m[1].split(/\r?\n/)
    .map((raw, n) => ({ n: n + 2, text: stripComment(raw).replace(/\s+$/, "") }))
    .filter(l => l.text.trim() !== "");

  const out = {};
  let key = null;      // top-level key whose block list we are filling
  let item = null;     // current map item inside that list
  let itemIndent = 0;

  for (const { n, text } of lines) {
    const where = `${file}:${n}`;
    const indent = text.length - text.trimStart().length;
    const body = text.trim();

    if (indent === 0) {
      const [k, v] = splitPair(body, where);
      item = null;
      if (v === "") { out[k] = []; key = k; } else { out[k] = scalar(v); key = null; }
      continue;
    }
    if (!key) throw new Error(`${where}: indented line with no open list`);

    if (body.startsWith("- ")) {
      const rest = body.slice(2).trim();
      if (/^[A-Za-z_][\w-]*:(\s|$)/.test(rest)) {
        const [k, v] = splitPair(rest, where);
        item = { [k]: scalar(v) };
        itemIndent = indent + 2;
        out[key].push(item);
      } else {
        item = null;
        out[key].push(scalar(rest));
      }
      continue;
    }
    if (item && indent === itemIndent) {
      const [k, v] = splitPair(body, where);
      item[k] = scalar(v);
      continue;
    }
    throw new Error(`${where}: unsupported YAML here (only flat maps inside lists)`);
  }
  return out;
}

// ---------- semver ----------

const parseVer = v => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(v ?? ""));
  return m ? m.slice(1).map(Number) : null;
};
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

function satisfies(version, range) {
  const v = parseVer(version);
  if (!v) return false;
  const r = String(range ?? "*").trim();
  if (r === "*") return true;
  const op = r[0] === "^" || r[0] === "~" ? r[0] : "";
  const base = parseVer(op ? r.slice(1) : r);
  if (!base) return false;
  if (op === "") return cmp(v, base) === 0;
  if (cmp(v, base) < 0) return false;
  if (op === "~") return v[0] === base[0] && v[1] === base[1];
  if (base[0] > 0) return v[0] === base[0];
  if (base[1] > 0) return v[0] === 0 && v[1] === base[1];
  return cmp(v, base) === 0;
}

// ---------- load ----------

const issues = [];
const issue = (level, contract, message) => issues.push({ level, contract, message });

const files = (await readdir(contractsDir)).filter(f => f.endsWith(".md")).sort();
const contracts = [];
for (const f of files) {
  const rel = path.posix.join(".claude/contracts", f);
  try {
    const fm = parseFrontmatter(await readFile(path.join(contractsDir, f), "utf8"), rel);
    fm.file = rel;
    fm.depends_on ??= [];
    fm.provides ??= [];
    fm.gate ??= [];
    fm.code ??= [];
    fm.knowledge ??= [];
    contracts.push(fm);
  } catch (err) {
    issue("error", f.replace(/\.md$/, ""), err.message);
  }
}
const byId = new Map(contracts.map(c => [c.id, c]));

// ---------- validate ----------

for (const c of contracts) {
  const id = c.id ?? c.file;
  for (const k of REQUIRED) {
    const v = c[k];
    if (v == null || (Array.isArray(v) && v.length === 0)) issue("error", id, `missing required field "${k}"`);
  }
  if (c.id && c.file !== `.claude/contracts/${c.id}.md`) issue("error", id, `id does not match filename ${c.file}`);
  if (c.kind && !KINDS.includes(c.kind)) issue("error", id, `kind "${c.kind}" is not one of ${KINDS.join(", ")}`);
  if (c.status && !STATUSES.includes(c.status)) issue("error", id, `status "${c.status}" is not one of ${STATUSES.join(", ")}`);
  if (c.version && !parseVer(c.version)) issue("error", id, `version "${c.version}" is not x.y.z`);

  const stage = byId.get(c.stage);
  if (c.kind === "orchestrator" && c.stage !== c.id) issue("error", id, `an orchestrator's stage must be its own id`);
  else if (c.stage && (!stage || stage.kind !== "orchestrator")) issue("error", id, `stage "${c.stage}" is not an orchestrator contract`);

  const names = c.provides.map(p => p?.name);
  if (new Set(names).size !== names.length) issue("error", id, "duplicate names in provides");

  for (const d of c.depends_on) {
    const up = byId.get(d?.id);
    if (!up) { issue("error", id, `depends on unknown contract "${d?.id}"`); continue; }
    if (up.id === c.id) { issue("error", id, "depends on itself"); continue; }
    for (const u of d.uses ?? []) {
      if (!up.provides.some(p => p.name === u)) issue("error", id, `uses "${u}", which ${up.id} does not provide`);
    }
    if (!(d.uses ?? []).length) issue("warning", id, `depends on ${up.id} without naming what it uses`);
    if (!satisfies(up.version, d.version)) issue("error", id, `wants ${up.id}@${d.version ?? "*"}, but it is ${up.version}`);
    if (up.status === "deprecated") issue("warning", id, `depends on deprecated ${up.id}`);
    if (c.status === "minted" && up.status !== "minted") issue("error", id, `is minted but upstream ${up.id} is ${up.status}`);
  }

  if (c.status === "minted") {
    if (!c.minted) issue("error", id, "is minted but has no minted date");
    for (const p of c.provides) if (p?.ref && !existsSync(path.join(repoRoot, p.ref))) issue("error", id, `is minted but ${p.name} ref ${p.ref} does not exist`);
    for (const p of [...c.code, ...c.knowledge]) if (!existsSync(path.join(repoRoot, p))) issue("error", id, `is minted but ${p} does not exist`);
  } else if (c.minted) {
    issue("warning", id, `has a minted date but status is ${c.status}`);
  }
}

// ---------- graph ----------

const deps = c => c.depends_on.map(d => byId.get(d.id)).filter(up => up && up !== c);

// Cycle check (DFS with colors), then depth = longest path from a root.
const color = new Map();
function visit(c, trail) {
  color.set(c.id, "grey");
  for (const up of deps(c)) {
    if (color.get(up.id) === "grey") {
      const loop = [...trail, c.id];
      issue("error", c.id, `dependency cycle: ${[...loop.slice(loop.indexOf(up.id)), up.id].join(" -> ")}`);
    }
    else if (!color.has(up.id)) visit(up, [...trail, c.id]);
  }
  color.set(c.id, "black");
}
for (const c of contracts) if (!color.has(c.id)) visit(c, []);
const hasCycle = issues.some(i => i.message.startsWith("dependency cycle"));

const depthMemo = new Map();
function depth(c, seen = new Set()) {
  if (depthMemo.has(c.id)) return depthMemo.get(c.id);
  if (seen.has(c.id)) return 0;
  seen.add(c.id);
  const d = Math.max(-1, ...deps(c).map(up => depth(up, seen))) + 1;
  depthMemo.set(c.id, d);
  return d;
}

function ancestors(c, acc = new Set()) {
  for (const up of deps(c)) if (!acc.has(up.id)) { acc.add(up.id); ancestors(up, acc); }
  return acc;
}

const consumers = new Map(contracts.map(c => [c.id, []]));
for (const c of contracts) for (const up of deps(c)) consumers.get(up.id).push(c.id);

const rows = contracts.map(c => {
  const blockedBy = deps(c).filter(up => up.status !== "minted").map(up => up.id);
  const mintable = c.status !== "minted" && c.status !== "deprecated" && blockedBy.length === 0;
  // Root blockers: unminted ancestors whose own upstream is all minted, i.e. where work starts.
  const rootBlockers = [...ancestors(c)].map(i => byId.get(i))
    .filter(a => a.status !== "minted" && deps(a).every(u => u.status === "minted"))
    .map(a => a.id);
  return {
    id: c.id, title: c.title, kind: c.kind, stage: c.stage, owner: c.owner,
    status: c.status, version: c.version, minted: c.minted, updated: c.updated, file: c.file,
    depth: hasCycle ? 0 : depth(c),
    depends_on: c.depends_on.map(d => ({
      id: d.id, version: d.version ?? "*", uses: d.uses ?? [],
      satisfied: byId.get(d.id)?.status === "minted",
    })),
    provides: c.provides.map(p => ({ ...p, refExists: !!p.ref && existsSync(path.join(repoRoot, p.ref)) })),
    gate: c.gate, code: c.code, knowledge: c.knowledge,
    consumers: consumers.get(c.id) ?? [],
    blockedBy, rootBlockers, mintable,
  };
}).sort((a, b) => a.depth - b.depth || a.id.localeCompare(b.id));

const stages = rows.filter(r => r.kind === "orchestrator").map(r => r.id);

// ---------- report ----------

const errors = issues.filter(i => i.level === "error");
const warnings = issues.filter(i => i.level === "warning");
const pad = (s, n) => String(s).padEnd(n);
const w = Math.max(...rows.map(r => r.id.length), 8) + 2;

console.log(`\nContracts (${rows.length})\n`);
console.log(pad("id", w) + pad("status", 12) + pad("version", 10) + "blocked by");
for (const r of rows) {
  const flag = r.mintable ? "ready to mint" : r.blockedBy.join(", ") || "-";
  console.log(pad(r.id, w) + pad(r.status, 12) + pad(r.version, 10) + flag);
}
const next = rows.filter(r => r.mintable).map(r => r.id);
console.log(`\nNext to mint: ${next.join(", ") || "nothing (all minted or blocked)"}`);
for (const i of issues) console.log(`${i.level === "error" ? "ERROR" : "warn "}  ${i.contract}: ${i.message}`);
console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);

if (!checkOnly) {
  const data = { generatedAt: new Date().toISOString(), stages, contracts: rows, issues };
  const header =
    "// Generated by .claude/tools/contracts.mjs from .claude/contracts/*.md. Do not edit;\n" +
    "// change the contract frontmatter and run `npm run contracts`.\n";
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "data.js"), header + "window.ARK = " + JSON.stringify(data, null, 2) + ";\n");
  console.log(`Wrote ${path.relative(repoRoot, path.join(outDir, "data.js")).replaceAll("\\", "/")}`);
}

process.exit(errors.length ? 1 : 0);
