#!/usr/bin/env node
/**
 * Sync GovKit with an ArcKit release.
 *
 * GovKit never edits ArcKit. It depends on the arckit core plugin at runtime
 * and vendors only the files ArcKit itself treats as shared across overlays
 * (ArcKit's scripts/sync-shared-assets.py): references/, templates/_partials/
 * and the project helper scripts. Vendored files keep ArcKit's relative paths
 * inside plugins/govkit so command text written in ArcKit's style works
 * unchanged. They are recorded with hashes in upstream/arckit.lock.json and
 * must not be edited by hand (check-compat.mjs fails if they are).
 *
 * It also snapshots ArcKit's public surface — command names, template names,
 * doc-type codes — into upstream/snapshot/, which check-compat.mjs uses to
 * prove every /arckit:* reference in GovKit still resolves.
 *
 * Usage:
 *   node scripts/sync-arckit.mjs                    # re-sync the locked ref
 *   node scripts/sync-arckit.mjs --ref v6.19.0      # move to a release tag
 *   node scripts/sync-arckit.mjs --ref latest       # newest vX.Y.Z tag
 *   node scripts/sync-arckit.mjs --source ../arc-kit  # use a local checkout as-is
 *   node scripts/sync-arckit.mjs --check            # verify vendored files match the lock, change nothing
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN = join(ROOT, 'plugins', 'govkit');
const LOCK = join(ROOT, 'upstream', 'arckit.lock.json');
const SNAPSHOT = join(ROOT, 'upstream', 'snapshot');
const REPO = 'https://github.com/tractorjuice/arc-kit.git';

// Paths relative to ArcKit's core plugin (plugins/arckit-claude/), copied to
// the same relative path under plugins/govkit/. Directories copy every file.
const SHARED = [
  'references',
  'templates/_partials',
  'scripts/bash/common.sh',
  'scripts/bash/create-project.sh',
  'scripts/bash/list-projects.sh',
];

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const checkOnly = args.includes('--check');

const sha256 = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const listFiles = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? listFiles(p) : [p];
});
const readLock = () => (existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, 'utf8')) : null);

if (checkOnly) {
  const lock = readLock();
  if (!lock) { console.error('No upstream/arckit.lock.json — run sync first.'); process.exit(1); }
  const drift = Object.entries(lock.files).filter(([rel, hash]) => {
    const p = join(PLUGIN, rel);
    return !existsSync(p) || sha256(p) !== hash;
  });
  if (drift.length) {
    console.error('Vendored ArcKit files differ from upstream/arckit.lock.json (never edit them; re-run sync):');
    for (const [rel] of drift) console.error(`  ${rel}`);
    process.exit(1);
  }
  console.log(`OK: ${Object.keys(lock.files).length} vendored files match ArcKit ${lock.version} (${lock.commit.slice(0, 10)}).`);
  process.exit(0);
}

// --- Resolve the source tree ------------------------------------------------
let source = opt('--source');
let ref = opt('--ref') || readLock()?.ref || 'latest';
let tmp;
if (!source) {
  if (ref === 'latest') {
    const tags = execFileSync('git', ['ls-remote', '--tags', '--refs', REPO], { encoding: 'utf8' })
      .split('\n').map((l) => l.split('refs/tags/')[1]).filter((t) => /^v\d+\.\d+\.\d+$/.test(t || ''));
    tags.sort((a, b) => {
      const pa = a.slice(1).split('.').map(Number);
      const pb = b.slice(1).split('.').map(Number);
      return pa[0] - pb[0] || pa[1] - pb[1] || pa[2] - pb[2];
    });
    ref = tags.pop();
    console.log(`Latest ArcKit release tag: ${ref}`);
  }
  tmp = mkdtempSync(join(tmpdir(), 'govkit-arckit-'));
  execFileSync('git', ['clone', '--quiet', '--depth', '1', '--branch', ref, REPO, tmp], { stdio: 'inherit' });
  source = tmp;
}
const core = join(source, 'plugins', 'arckit-claude');
if (!existsSync(join(core, '.claude-plugin', 'plugin.json'))) {
  console.error(`Not an ArcKit source checkout: ${source}`);
  process.exit(1);
}
const version = JSON.parse(readFileSync(join(core, '.claude-plugin', 'plugin.json'), 'utf8')).version;
let commit = 'unknown';
try { commit = execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); } catch { /* not a git tree */ }

// --- Copy shared assets -----------------------------------------------------
const previous = readLock();
for (const rel of Object.keys(previous?.files || {})) rmSync(join(PLUGIN, rel), { force: true });

const files = {};
for (const rel of SHARED) {
  const src = join(core, rel);
  if (!existsSync(src)) { console.warn(`warn: ArcKit ${version} has no ${rel} — check-compat will flag references to it`); continue; }
  const srcFiles = statSync(src).isDirectory() ? listFiles(src) : [src];
  for (const f of srcFiles) {
    const relFile = relative(core, f);
    const dest = join(PLUGIN, relFile);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(f, dest);
    files[relFile] = sha256(dest);
  }
}

// --- Snapshot ArcKit's public surface ---------------------------------------
mkdirSync(SNAPSHOT, { recursive: true });
const stem = (f) => f.replace(/\.md$/, '');
const commands = { arckit: readdirSync(join(core, 'commands')).filter((f) => f.endsWith('.md')).map(stem).sort() };
const pluginsDir = join(source, 'plugins');
for (const dir of readdirSync(pluginsDir)) {
  const manifest = join(pluginsDir, dir, '.claude-plugin', 'plugin.json');
  const cmdDir = join(pluginsDir, dir, 'commands');
  if (dir === 'arckit-claude' || !existsSync(manifest) || !existsSync(cmdDir)) continue;
  const name = JSON.parse(readFileSync(manifest, 'utf8')).name;
  commands[name] = readdirSync(cmdDir).filter((f) => f.endsWith('.md')).map(stem).sort();
}
const templates = readdirSync(join(core, 'templates')).filter((f) => /-template\.(md|html)$/.test(f)).sort();
const { DOC_TYPES } = await import(pathToFileURL(join(core, 'config', 'doc-types.mjs')).href);
const skills = existsSync(join(core, 'skills')) ? readdirSync(join(core, 'skills')).sort() : [];

writeFileSync(join(SNAPSHOT, 'commands.json'), `${JSON.stringify(commands, null, 2)}\n`);
writeFileSync(join(SNAPSHOT, 'templates.json'), `${JSON.stringify(templates, null, 2)}\n`);
writeFileSync(join(SNAPSHOT, 'doc-types.json'), `${JSON.stringify(Object.keys(DOC_TYPES).sort(), null, 2)}\n`);
writeFileSync(join(SNAPSHOT, 'skills.json'), `${JSON.stringify(skills, null, 2)}\n`);

// ArcKit's filename hook + the registry it imports, kept at their relative
// paths so tests can execute the real hook against GOV-* paths. GovKit's
// prefix choice depends on this hook ignoring non-ARC files.
for (const rel of ['hooks/validate-arc-filename.mjs', 'config/doc-types.mjs']) {
  const dest = join(SNAPSHOT, 'arckit-hook', rel);
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(join(core, rel), dest);
}

const lock = {
  repo: REPO,
  ref: opt('--source') ? 'local' : ref,
  commit,
  version,
  synced_at: new Date().toISOString().slice(0, 10),
  files: Object.fromEntries(Object.entries(files).sort()),
};
writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`);
if (tmp) rmSync(tmp, { recursive: true, force: true });

const changed = previous?.version && previous.version !== version ? ` (was ${previous.version})` : '';
console.log(`Synced ArcKit ${version}${changed} @ ${commit.slice(0, 10)}: ${Object.keys(files).length} vendored files, ` +
  `${Object.values(commands).flat().length} commands across ${Object.keys(commands).length} plugins.`);
console.log('Next: node scripts/check-compat.mjs');
