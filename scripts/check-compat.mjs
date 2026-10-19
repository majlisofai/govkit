#!/usr/bin/env node
/**
 * Prove GovKit is compatible with the ArcKit release in upstream/arckit.lock.json.
 *
 * Checks (each prints PASS/FAIL; exit 1 on any FAIL):
 *   vendored    vendored ArcKit files match the lock (never hand-edited)
 *   versions    plugin.json == marketplace.json version; plugin config/compat.json
 *               == upstream/compat.json; locked ArcKit version inside the range
 *   doc-types   no GovKit code collides with an ArcKit code
 *   arckit-refs every arckit:<cmd> / arckit-<overlay>:<cmd> reference resolves
 *               to a command in the locked ArcKit release
 *   govkit-refs every govkit:<cmd> reference resolves to a GovKit command or skill
 *   overrides   every override rule in references/govkit/arckit-overrides.md
 *               names a template that exists in the locked ArcKit release
 *   templates   every GovKit doc type with a command has that command and a template
 *
 * YAML content (frameworks, methods, profile) is checked by validate-content.py.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN = join(ROOT, 'plugins', 'govkit');
const SNAP = join(ROOT, 'upstream', 'snapshot');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

const results = [];
const check = (name, problems) => results.push({ name, problems });

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

const lock = json(join(ROOT, 'upstream', 'arckit.lock.json'));
const vendored = new Set(Object.keys(lock.files));
const ownFiles = walk(PLUGIN).filter((p) => !vendored.has(relative(PLUGIN, p)) && /\.(md|ya?ml|json|mjs)$/.test(p));

// vendored
try {
  execFileSync('node', [join(ROOT, 'scripts', 'sync-arckit.mjs'), '--check'], { stdio: 'pipe' });
  check('vendored', []);
} catch (e) {
  check('vendored', [String(e.stderr || e.message).trim()]);
}

// versions
{
  const problems = [];
  const plugin = json(join(PLUGIN, '.claude-plugin', 'plugin.json'));
  const market = json(join(ROOT, '.claude-plugin', 'marketplace.json'));
  const entry = market.plugins.find((p) => p.name === 'govkit');
  if (entry?.version !== plugin.version) problems.push(`marketplace.json govkit version ${entry?.version} != plugin.json ${plugin.version}`);
  const upstreamCompat = readFileSync(join(ROOT, 'upstream', 'compat.json'), 'utf8');
  if (readFileSync(join(PLUGIN, 'config', 'compat.json'), 'utf8') !== upstreamCompat) {
    problems.push('plugins/govkit/config/compat.json differs from upstream/compat.json (copy it)');
  }
  const { min, max_exclusive: max } = JSON.parse(upstreamCompat).arckit;
  const n = (v) => v.split('.').map(Number).reduce((a, x) => a * 1000 + x, 0);
  if (n(lock.version) < n(min) || n(lock.version) >= n(max)) problems.push(`locked ArcKit ${lock.version} outside >=${min} <${max}`);
  for (const dep of [].concat(plugin.dependencies || [])) {
    if (typeof dep === 'object' && dep.version) problems.push(`plugin.json pins arckit '${dep.version}', but ArcKit publishes no arckit--v* tags so it cannot resolve`);
  }
  check('versions', problems);
}

// doc-types
const arckitTypes = new Set(json(join(SNAP, 'doc-types.json')));
const { DOC_TYPES } = await import(pathToFileURL(join(PLUGIN, 'config', 'doc-types.mjs')).href);
check('doc-types', Object.keys(DOC_TYPES).filter((c) => arckitTypes.has(c)).map((c) => `GovKit code ${c} collides with an ArcKit code`));

// arckit-refs / govkit-refs
{
  const commands = json(join(SNAP, 'commands.json'));
  const allArckit = new Set(Object.values(commands).flat());
  const govkitCmds = new Set([
    ...readdirSync(join(PLUGIN, 'commands')).map((f) => f.replace(/\.md$/, '')),
    ...readdirSync(join(PLUGIN, 'skills')),
  ]);
  const aProblems = [];
  const gProblems = [];
  const re = /\b(arckit(?:-[a-z0-9-]+)?|govkit):([a-z][a-z0-9.-]*[a-z0-9])/g;
  for (const file of ownFiles) {
    const text = readFileSync(file, 'utf8');
    for (const [, ns, cmd] of text.matchAll(re)) {
      const where = relative(ROOT, file);
      if (ns === 'govkit') {
        if (!govkitCmds.has(cmd)) gProblems.push(`${where}: govkit:${cmd} has no command or skill`);
      } else if (ns === 'arckit') {
        // ArcKit documents overlay commands under the core namespace too.
        if (!allArckit.has(cmd)) aProblems.push(`${where}: arckit:${cmd} not in ArcKit ${lock.version}`);
      } else if (!commands[ns]) {
        aProblems.push(`${where}: plugin ${ns} not in ArcKit ${lock.version}`);
      } else if (!commands[ns].includes(cmd)) {
        aProblems.push(`${where}: ${ns}:${cmd} not in ArcKit ${lock.version}`);
      }
    }
  }
  check('arckit-refs', [...new Set(aProblems)]);
  check('govkit-refs', [...new Set(gProblems)]);
}

// overrides
{
  const templates = new Set(json(join(SNAP, 'templates.json')));
  const rules = readFileSync(join(PLUGIN, 'references', 'govkit', 'arckit-overrides.md'), 'utf8')
    .split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3).trim());
  check('overrides', rules.filter((r) => !templates.has(`${r}-template.md`)).map((r) => `override rule '${r}' — ArcKit ${lock.version} has no ${r}-template.md`));
}

// templates
{
  const problems = [];
  const tmplFor = { GMOD: 'operating-model', APPL: 'applicability', ASMT: 'assessment', XWLK: 'crosswalk', CTRL: 'controls', EVID: 'evidence', GATE: 'gate', EXCP: 'exception', BRPT: 'board-report' };
  for (const [code, info] of Object.entries(DOC_TYPES)) {
    const cmdFile = join(PLUGIN, 'commands', `${info.command}.md`);
    if (!existsSync(cmdFile)) { problems.push(`${code}: command ${info.command}.md missing`); continue; }
    const fm = readFileSync(cmdFile, 'utf8').match(/^doc-type:\s*(\S+)/m)?.[1];
    if (fm !== code) problems.push(`${info.command}.md doc-type is '${fm}', registry says ${code}`);
    if (!tmplFor[code] || !existsSync(join(PLUGIN, 'templates', `${tmplFor[code]}-template.md`))) problems.push(`${code}: template missing`);
  }
  check('templates', problems);
}

let failed = 0;
for (const { name, problems } of results) {
  console.log(`${problems.length ? 'FAIL' : 'PASS'}  ${name}`);
  for (const p of problems) console.log(`      - ${p}`);
  if (problems.length) failed++;
}
console.log(`\nArcKit ${lock.version} (${lock.ref}, ${lock.commit.slice(0, 10)}): ${failed ? `${failed} check(s) failed` : 'compatible'}`);
process.exit(failed ? 1 : 0);
