import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN = join(ROOT, 'plugins', 'govkit');
const HOOK = join(PLUGIN, 'hooks', 'validate-gov-filename.mjs');
const GEN = join(PLUGIN, 'scripts', 'generate-gov-id.mjs');

function repo() {
  const dir = mkdtempSync(join(tmpdir(), 'govkit-test-'));
  mkdirSync(join(dir, 'projects', '001-pilot', 'assessments'), { recursive: true });
  return dir;
}

function hook(filePath, cwd) {
  const out = execFileSync('node', [HOOK], { input: JSON.stringify({ tool_input: { file_path: filePath }, cwd }), encoding: 'utf8' });
  return out.trim() ? JSON.parse(out) : null;
}

test('hook passes a correct single-instance GOV file', () => {
  const r = repo();
  assert.equal(hook(join(r, 'projects/001-pilot/GOV-001-CTRL-v1.0.md')), null);
});

test('hook ignores ARC files and files outside projects/', () => {
  const r = repo();
  assert.equal(hook(join(r, 'projects/001-pilot/ARC-001-NOPE-v1.0.md')), null);
  assert.equal(hook(join(r, 'docs/GOV-001-NOPE-v1.0.md')), null);
});

test('hook blocks unknown codes and lists valid ones', () => {
  const r = repo();
  const res = hook(join(r, 'projects/001-pilot/GOV-001-NOPE-v1.0.md'));
  assert.equal(res.decision, 'block');
  assert.match(res.reason, /Unknown document type 'NOPE'/);
  assert.match(res.reason, /CTRL/);
});

test('hook corrects project id, version and subdirectory', () => {
  const r = repo();
  const res = hook(join(r, 'projects/001-pilot/GOV-7-ASMT-v1.md'));
  assert.equal(res.decision, 'block');
  assert.ok(res.reason.includes(join(r, 'projects/001-pilot/assessments/GOV-001-ASMT-001-v1.0.md')), res.reason);
});

test('hook assigns the next sequence for multi-instance types', () => {
  const r = repo();
  writeFileSync(join(r, 'projects/001-pilot/assessments/GOV-001-ASMT-002-v1.0.md'), '');
  const res = hook(join(r, 'projects/001-pilot/assessments/GOV-001-ASMT-v1.0.md'));
  assert.equal(res.decision, 'block');
  assert.ok(res.reason.includes(join(r, 'projects/001-pilot/assessments/GOV-001-ASMT-003-v1.0.md')), res.reason);
});

test('hook blocks a sequence on a single-instance type', () => {
  const r = repo();
  assert.equal(hook(join(r, 'projects/001-pilot/GOV-001-CTRL-001-v1.0.md')).decision, 'block');
});

test('hook accepts project-registered custom codes', () => {
  const r = repo();
  mkdirSync(join(r, '.govkit'));
  writeFileSync(join(r, '.govkit', 'doc-types.json'), JSON.stringify({ AIIA: { name: 'AI Impact Assessment', category: 'Assurance' } }));
  assert.equal(hook(join(r, 'projects/001-pilot/GOV-001-AIIA-v1.0.md')), null);
});

test('hook resolves relative paths against cwd', () => {
  const r = repo();
  assert.equal(hook('projects/001-pilot/GOV-001-CTRL-v1.0.md', r), null);
});

test('id generator: single, multi-instance, relpath, unknown', () => {
  const r = repo();
  const run = (...a) => execFileSync('node', [GEN, ...a, '--root', r], { encoding: 'utf8' }).trim();
  assert.equal(run('1', 'CTRL'), 'GOV-001-CTRL-v1.0');
  assert.equal(run('001', 'CTRL', '2', '--filename'), 'GOV-001-CTRL-v2.0.md');
  writeFileSync(join(r, 'projects/001-pilot/assessments/GOV-001-ASMT-001-v1.0.md'), '');
  assert.equal(run('001', 'ASMT', '--relpath', '--next-num', join(r, 'projects/001-pilot/assessments')), 'assessments/GOV-001-ASMT-002-v1.0.md');
  const bad = spawnSync('node', [GEN, '001', 'NOPE', '--root', r], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /Unknown GovKit doc type/);
  const noSeq = spawnSync('node', [GEN, '001', 'GATE', '--root', r], { encoding: 'utf8' });
  assert.equal(noSeq.status, 1);
});

test('session hook reports a missing profile when projects/ exists', () => {
  const r = repo();
  const out = execFileSync('node', [join(PLUGIN, 'hooks', 'govkit-session.mjs')], {
    input: JSON.stringify({ cwd: r }),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN, HOME: r },
  });
  assert.match(JSON.parse(out).hookSpecificOutput.additionalContext, /\/govkit:init/);
});

test('session hook warns when ArcKit is outside the tested range', () => {
  const cache = mkdtempSync(join(tmpdir(), 'govkit-cache-'));
  const gov = join(cache, 'majlisofai', 'govkit', '0.1.0');
  const arc = join(cache, 'arckit-claude', 'arckit', '9.0.0', '.claude-plugin');
  mkdirSync(join(gov, 'config'), { recursive: true });
  mkdirSync(arc, { recursive: true });
  writeFileSync(join(gov, 'config', 'compat.json'), JSON.stringify({ arckit: { min: '6.18.0', max_exclusive: '7.0.0' } }));
  writeFileSync(join(arc, 'plugin.json'), JSON.stringify({ name: 'arckit', version: '9.0.0' }));
  const out = execFileSync('node', [join(PLUGIN, 'hooks', 'govkit-session.mjs')], {
    input: JSON.stringify({ cwd: cache }),
    encoding: 'utf8',
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: gov, HOME: cache },
  });
  assert.match(JSON.parse(out).hookSpecificOutput.additionalContext, /ArcKit 9\.0\.0 is outside the tested range/);
});

test('contract: ArcKit\'s own filename hook ignores GOV-* files', () => {
  const arcHook = join(ROOT, 'upstream', 'snapshot', 'arckit-hook', 'hooks', 'validate-arc-filename.mjs');
  const r = repo();
  const run = (p) => execFileSync('node', [arcHook], { input: JSON.stringify({ tool_input: { file_path: p } }), encoding: 'utf8' }).trim();
  assert.equal(run(join(r, 'projects/001-pilot/GOV-001-CTRL-v1.0.md')), '');
  assert.equal(run(join(r, 'projects/001-pilot/assessments/GOV-001-ASMT-001-v1.0.md')), '');
  // Sanity: the same code under ARC- is blocked, which is why GovKit uses GOV-.
  assert.match(run(join(r, 'projects/001-pilot/ARC-001-CTRL-v1.0.md')), /"decision":"block"/);
});
