#!/usr/bin/env node
/**
 * Version, tag and publish the plugins in .claude-plugin/marketplace.json.
 *
 * Each plugin is released on its own: tag <plugin>--v<version> (the form Claude
 * Code resolves plugin dependency versions against) and a GitHub release whose
 * notes are the plugin's CHANGELOG.md entry. While a version is 0.x it is
 * published as a pre-release (beta); from 1.0.0 it is a stable release.
 *
 * CHANGELOG.md headings: "## X.Y.Z — date" for govkit, "## <plugin> X.Y.Z — date"
 * for a module. govkit must have an entry for its version; a module without one
 * gets GitHub's generated notes.
 *
 *   release.mjs bump <plugin> <patch|minor|major|X.Y.Z>
 *       Set the version in plugin.json and marketplace.json (and metadata.version
 *       for govkit) and add a CHANGELOG.md entry stub to fill in.
 *   release.mjs check
 *       Versions are X.Y.Z, govkit has a CHANGELOG entry, and no entry is a stub.
 *   release.mjs notes <plugin> [version]
 *       Print the CHANGELOG entry (exit 1 if there is none).
 *   release.mjs publish [--dry-run]
 *       For each plugin whose tag does not exist yet, tag HEAD and create the
 *       GitHub release with gh. Needs GH_TOKEN in CI.
 *
 * --root DIR runs against another checkout (used by tests).
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (name, takesValue) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const [, value] = args.splice(i, takesValue ? 2 : 1);
  return takesValue ? value : true;
};
const ROOT = option('--root', true) || join(dirname(fileURLToPath(import.meta.url)), '..');
const DRY = option('--dry-run', false) === true;
const [cmd, ...rest] = args;

const STUB = 'TODO: describe the changes';
const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const MARKET = join(ROOT, '.claude-plugin', 'marketplace.json');
const CHANGELOG = join(ROOT, 'CHANGELOG.md');

const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const writeJson = (p, v) => writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const die = (msg) => {
  console.error(`release: ${msg}`);
  process.exit(1);
};
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();

const market = json(MARKET);
const plugins = market.plugins.map((entry) => {
  const dir = join(ROOT, entry.source);
  const manifestPath = join(dir, '.claude-plugin', 'plugin.json');
  return { entry, dir, manifestPath, manifest: json(manifestPath) };
});
const find = (name) => plugins.find((p) => p.entry.name === name) || die(`no plugin '${name}' in marketplace.json (have: ${plugins.map((p) => p.entry.name).join(', ')})`);
const tagOf = (name, version) => `${name}--v${version}`;
const isBeta = (version) => version.startsWith('0.');

function entryOf(name, version) {
  if (!existsSync(CHANGELOG)) return null;
  const lines = readFileSync(CHANGELOG, 'utf8').split('\n');
  const start = lines.findIndex((l) => {
    const m = l.match(/^## (?:(\S+) )?(\d+\.\d+\.\d+)\b/);
    return m && (m[1] || 'govkit') === name && m[2] === version;
  });
  if (start < 0) return null;
  const next = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  return lines.slice(start + 1, next < 0 ? undefined : next).join('\n').trim();
}

function nextVersion(current, how) {
  if (SEMVER.test(how)) return how;
  const m = current.match(SEMVER) || die(`current version '${current}' is not X.Y.Z`);
  const [maj, min, pat] = m.slice(1).map(Number);
  if (how === 'major') return `${maj + 1}.0.0`;
  if (how === 'minor') return `${maj}.${min + 1}.0`;
  if (how === 'patch') return `${maj}.${min}.${pat + 1}`;
  return die(`bump must be patch, minor, major or X.Y.Z, not '${how}'`);
}
const cmp = (a, b) => {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

function bump(name, how) {
  if (!how) die('usage: release.mjs bump <plugin> <patch|minor|major|X.Y.Z>');
  const p = find(name);
  const from = p.manifest.version;
  const to = nextVersion(from, how);
  if (cmp(to, from) <= 0) die(`${name} ${to} is not newer than ${from}`);

  p.manifest.version = to;
  writeJson(p.manifestPath, p.manifest);
  p.entry.version = to;
  if (name === 'govkit') market.metadata.version = to;
  writeJson(MARKET, market);

  if (!entryOf(name, to)) {
    const date = new Date().toISOString().slice(0, 10);
    let tested;
    if (name === 'govkit') {
      tested = `Tested against ArcKit ${json(join(ROOT, 'upstream', 'arckit.lock.json')).version}.`;
    } else {
      const { min, max_exclusive: max } = json(join(p.dir, 'govkit-overlay.json')).govkit || {};
      tested = `Supports GovKit >=${min} <${max}.`;
    }
    const heading = name === 'govkit' ? `## ${to} — ${date}` : `## ${name} ${to} — ${date}`;
    const stub = `${heading}\n\n${tested}\n\n- ${STUB}.\n\n`;
    const text = existsSync(CHANGELOG) ? readFileSync(CHANGELOG, 'utf8') : '# Changelog\n\n';
    const at = text.search(/^## /m);
    writeFileSync(CHANGELOG, at < 0 ? text + stub : text.slice(0, at) + stub + text.slice(at));
  }
  console.log(`${name} ${from} → ${to}${isBeta(to) ? ' (beta)' : ''}. Fill in its CHANGELOG.md entry, then commit and merge to main.`);
}

function check() {
  const problems = [];
  for (const { entry, manifest } of plugins) {
    const { name } = entry;
    if (!SEMVER.test(manifest.version)) problems.push(`${name} version '${manifest.version}' is not X.Y.Z`);
    const notes = entryOf(name, manifest.version);
    if (notes === null && name === 'govkit') problems.push(`CHANGELOG.md has no '## ${manifest.version} — <date>' entry for govkit`);
    if (notes?.includes(STUB)) problems.push(`CHANGELOG.md entry for ${name} ${manifest.version} is still a stub`);
  }
  for (const msg of problems) console.error(`FAIL ${msg}`);
  if (problems.length) process.exit(1);
  console.log(`release metadata OK: ${plugins.map(({ entry, manifest }) => `${entry.name} ${manifest.version}`).join(', ')}`);
}

function notes(name, version) {
  const p = find(name);
  const text = entryOf(name, version || p.manifest.version);
  if (text === null) die(`CHANGELOG.md has no entry for ${name} ${version || p.manifest.version}`);
  console.log(text);
}

function publish() {
  const sha = git('rev-parse', 'HEAD');
  const repo = (plugins[0].manifest.repository || '').replace(/^https:\/\/github\.com\/|\.git$/g, '');
  let published = 0;
  for (const { entry, manifest } of plugins) {
    const { name } = entry;
    const { version } = manifest;
    const tag = tagOf(name, version);
    if (git('tag', '-l', tag)) continue;

    const beta = isBeta(version);
    const title = `${manifest.displayName || name} ${version}${beta ? ' (beta)' : ''}`;
    const body = entryOf(name, version);
    const install = [
      '```bash',
      `claude plugin marketplace add ${repo}`,
      `claude plugin install ${name}@${market.name}`,
      '```',
    ].join('\n');
    const lead = beta ? `> **Beta.** ${name} is pre-1.0: commands, profile keys and file formats may still change between minor versions.\n\n` : '';
    const ghArgs = ['release', 'create', tag, '--target', sha, '--title', title];
    if (body === null) ghArgs.push('--generate-notes', '--notes', `${lead}${install}`);
    else {
      const file = join(mkdtempSync(join(tmpdir(), 'govkit-release-')), 'notes.md');
      writeFileSync(file, `${lead}${body}\n\n## Install\n\n${install}\n`);
      ghArgs.push('--notes-file', file);
    }
    // Pre-releases are never "Latest"; among stable releases, govkit keeps the badge.
    if (beta) ghArgs.push('--prerelease');
    else if (name !== 'govkit') ghArgs.push('--latest=false');

    console.log(`${DRY ? '[dry-run] ' : ''}${tag} @ ${sha.slice(0, 10)}: ${title}${body === null ? ' (generated notes)' : ''}`);
    if (!DRY) execFileSync('gh', ghArgs, { cwd: ROOT, stdio: 'inherit' });
    published++;
  }
  if (!published) console.log('nothing to release: every plugin version is already tagged');
}

if (cmd === 'bump') bump(...rest);
else if (cmd === 'check') check();
else if (cmd === 'notes') notes(...rest);
else if (cmd === 'publish') publish();
else die('usage: release.mjs <bump|check|notes|publish> [...] [--root DIR] [--dry-run]');
