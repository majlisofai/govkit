#!/usr/bin/env node
/**
 * GovKit SessionStart hook.
 *
 * 1. Finds the installed ArcKit core version and warns when it is outside the
 *    range GovKit was tested against (config/compat.json, copied from
 *    upstream/compat.json at release). ArcKit publishes no
 *    `arckit--vX.Y.Z` tags, so plugin.json cannot pin a version range; this
 *    hook is the runtime half of that check, CI is the other.
 * 2. Tells the model whether a GovKit profile is active in this repository.
 *
 * Observational only: never blocks, always exits 0.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..');

let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { /* no stdin */ }
const cwd = input.cwd || process.cwd();

const cmp = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
  return 0;
};

function readJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

/** Locate ArcKit core beside GovKit: marketplace cache, then a source checkout. */
function findArckitVersion() {
  const candidates = [];
  // Marketplace cache: <cache>/<marketplace>/<plugin>/<version>/ — GovKit is at
  // <cache>/majlisofai/govkit/<ver>, ArcKit at <cache>/arckit-claude/arckit/<ver>.
  const cache = join(pluginRoot, '..', '..', '..');
  const arckitCache = join(cache, 'arckit-claude', 'arckit');
  if (existsSync(arckitCache)) {
    for (const v of readdirSync(arckitCache)) candidates.push(join(arckitCache, v, '.claude-plugin', 'plugin.json'));
  }
  // Installed-plugins registry, when present.
  const home = process.env.HOME || '';
  const registry = readJson(join(home, '.claude', 'plugins', 'installed_plugins.json'));
  for (const entry of [].concat(registry?.plugins?.['arckit@arckit-claude'] || [])) {
    if (entry?.installPath) candidates.push(join(entry.installPath, '.claude-plugin', 'plugin.json'));
    if (entry?.version) return entry.version;
  }
  const versions = candidates.map(readJson).filter((m) => m?.name === 'arckit').map((m) => m.version);
  return versions.sort(cmp).pop() || null;
}

const lines = [];
const compat = readJson(join(pluginRoot, 'config', 'compat.json'))?.arckit;
const arckitVersion = findArckitVersion();

if (compat && arckitVersion) {
  const ok = cmp(arckitVersion, compat.min) >= 0 && cmp(arckitVersion, compat.max_exclusive) < 0;
  if (!ok) {
    lines.push(
      `GovKit: installed ArcKit ${arckitVersion} is outside the tested range ` +
      `>=${compat.min} <${compat.max_exclusive}. GovKit commands may reference ArcKit commands, ` +
      `templates or paths that changed. Run /govkit:compat for details.`,
    );
  }
}

const profilePath = join(cwd, '.govkit', 'profile.yaml');
if (existsSync(profilePath)) {
  const text = readFileSync(profilePath, 'utf8');
  const name = (text.match(/^\s*name:\s*["']?([^"'\n]+)/m) || [])[1];
  lines.push(`GovKit profile active: .govkit/profile.yaml${name ? ` (${name.trim()})` : ''}. GovKit commands resolve approach, methods, frameworks and tools from it.`);
} else if (existsSync(join(cwd, 'projects'))) {
  lines.push('GovKit: no .govkit/profile.yaml in this repository — run /govkit:init to choose an approach, methods, frameworks and tools. Built-in defaults apply until then.');
}

if (lines.length) {
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: lines.join('\n') } }));
}
process.exit(0);
