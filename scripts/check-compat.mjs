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
 * GovKit overlays (plugins/govkit-<name>/ with a govkit-overlay.json) are checked too:
 * their version matches marketplace.json, their doc-type codes collide with no
 * ArcKit or GovKit code, their arckit:/govkit: references resolve, every
 * govkit-<overlay>:<cmd> reference resolves to a command or skill of that
 * overlay, and each overlay doc type has its command and template.
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

// GovKit overlays: sibling plugins named govkit-<name> that carry a govkit-overlay.json.
const overlays = readdirSync(join(ROOT, 'plugins'))
  .filter((d) => d.startsWith('govkit-') && existsSync(join(ROOT, 'plugins', d, 'govkit-overlay.json')))
  .map((name) => {
    const dir = join(ROOT, 'plugins', name);
    const cmds = (sub) => (existsSync(join(dir, sub)) ? readdirSync(join(dir, sub)) : []);
    return {
      name,
      dir,
      manifest: json(join(dir, 'govkit-overlay.json')),
      plugin: json(join(dir, '.claude-plugin', 'plugin.json')),
      commands: new Set([...cmds('commands').map((f) => f.replace(/\.md$/, '')), ...cmds('skills')]),
      files: walk(dir).filter((p) => /\.(md|ya?ml|json|mjs)$/.test(p)),
    };
  });
const overlayByName = new Map(overlays.map((o) => [o.name, o]));

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
  for (const o of overlays) {
    const oEntry = market.plugins.find((p) => p.name === o.name);
    if (!oEntry) problems.push(`marketplace.json has no entry for overlay ${o.name}`);
    else if (oEntry.version !== o.plugin.version) problems.push(`marketplace.json ${o.name} version ${oEntry.version} != plugin.json ${o.plugin.version}`);
    if (o.manifest.overlay !== o.name) problems.push(`${o.name}/govkit-overlay.json overlay '${o.manifest.overlay}' != plugin name`);
    if (!(o.plugin.dependencies || []).some((d) => (d.name || d) === 'govkit')) problems.push(`${o.name} plugin.json does not depend on govkit`);
    const { min: gMin, max_exclusive: gMax } = o.manifest.govkit || {};
    if (!gMin || !gMax || n(plugin.version) < n(gMin) || n(plugin.version) >= n(gMax)) {
      problems.push(`${o.name} supports GovKit >=${gMin} <${gMax}, but GovKit is ${plugin.version}`);
    }
  }
  check('versions', problems);
}

// doc-types
const arckitTypes = new Set(json(join(SNAP, 'doc-types.json')));
const { DOC_TYPES } = await import(pathToFileURL(join(PLUGIN, 'config', 'doc-types.mjs')).href);
{
  const problems = Object.keys(DOC_TYPES).filter((c) => arckitTypes.has(c)).map((c) => `GovKit code ${c} collides with an ArcKit code`);
  const seen = new Map();
  for (const o of overlays) {
    for (const code of Object.keys(o.manifest.doc_types || {})) {
      if (arckitTypes.has(code)) problems.push(`${o.name} code ${code} collides with an ArcKit code`);
      if (DOC_TYPES[code]) problems.push(`${o.name} code ${code} collides with a GovKit code`);
      if (seen.has(code)) problems.push(`${o.name} code ${code} collides with overlay ${seen.get(code)}`);
      seen.set(code, o.name);
    }
  }
  check('doc-types', problems);
}

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
  const re = /\b(arckit(?:-[a-z0-9-]+)?|govkit(?:-[a-z0-9-]+)?):([a-z][a-z0-9.-]*[a-z0-9])/g;
  for (const file of [...ownFiles, ...overlays.flatMap((o) => o.files)]) {
    const text = readFileSync(file, 'utf8');
    for (const [, ns, cmd] of text.matchAll(re)) {
      const where = relative(ROOT, file);
      if (ns === 'govkit') {
        if (!govkitCmds.has(cmd)) gProblems.push(`${where}: govkit:${cmd} has no command or skill`);
      } else if (ns.startsWith('govkit-')) {
        const o = overlayByName.get(ns);
        if (!o) gProblems.push(`${where}: ${ns}:${cmd} names no GovKit overlay in plugins/`);
        else if (!o.commands.has(cmd)) gProblems.push(`${where}: ${ns}:${cmd} has no command or skill in ${ns}`);
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
  check('overrides', rules.filter((r) => !templates.has(`${r}-template.md`) && !templates.has(`${r}-template.html`)).map((r) => `override rule '${r}' — ArcKit ${lock.version} has no ${r}-template.md or .html`));
}

// templates
{
  const problems = [];
  const tmplFor = { GMOD: 'operating-model', APPL: 'applicability', ASMT: 'assessment', XWLK: 'crosswalk', CTRL: 'controls', EVID: 'evidence', GATE: 'gate', EXCP: 'exception', BRPT: 'board-report', DGRM: 'diagram', TEAM: 'team' };
  for (const [code, info] of Object.entries(DOC_TYPES)) {
    // A doc type is written by a command or by a skill carrying doc-type: frontmatter.
    const cmdFile = [join(PLUGIN, 'commands', `${info.command}.md`), join(PLUGIN, 'skills', info.command, 'SKILL.md')].find(existsSync);
    if (!cmdFile) { problems.push(`${code}: no command or skill '${info.command}'`); continue; }
    const fm = readFileSync(cmdFile, 'utf8').match(/^doc-type:\s*(\S+)/m)?.[1];
    if (fm !== code) problems.push(`${relative(ROOT, cmdFile)} doc-type is '${fm}', registry says ${code}`);
    if (!tmplFor[code] || !existsSync(join(PLUGIN, 'templates', `${tmplFor[code]}-template.md`))) problems.push(`${code}: template missing`);
  }
  for (const o of overlays) {
    for (const [code, info] of Object.entries(o.manifest.doc_types || {})) {
      const [ns, cmd] = String(info.command || '').split(':');
      if (ns !== o.name || !cmd) { problems.push(`${o.name} ${code}: command '${info.command}' must be ${o.name}:<command>`); continue; }
      const cmdFile = [join(o.dir, 'commands', `${cmd}.md`), join(o.dir, 'skills', cmd, 'SKILL.md')].find(existsSync);
      if (!cmdFile) { problems.push(`${o.name} ${code}: no command or skill '${cmd}'`); continue; }
      const fm = readFileSync(cmdFile, 'utf8').match(/^doc-type:\s*(\S+)/m)?.[1];
      if (fm !== code) problems.push(`${relative(ROOT, cmdFile)} doc-type is '${fm}', manifest says ${code}`);
      if (!info.template || !existsSync(join(o.dir, 'templates', `${info.template}-template.md`))) problems.push(`${o.name} ${code}: template missing`);
    }
    for (const rel of o.manifest.installs || []) {
      if (!existsSync(join(o.dir, rel))) problems.push(`${o.name}: installs ${rel}, which does not exist`);
    }
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
