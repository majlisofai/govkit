import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GOVKIT = join(ROOT, 'plugins', 'govkit');
const OVERLAY = join(ROOT, 'plugins', 'govkit-govstack');
const HOOK = join(GOVKIT, 'hooks', 'validate-gov-filename.mjs');
const GEN = join(GOVKIT, 'scripts', 'generate-gov-id.mjs');
const manifest = JSON.parse(readFileSync(join(OVERLAY, 'govkit-overlay.json'), 'utf8'));

// What /govkit-govstack:apply writes into .govkit/doc-types.json.
function appliedRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'govkit-overlay-'));
  mkdirSync(join(dir, '.govkit'));
  mkdirSync(join(dir, 'projects', '001-pilot', 'govstack'), { recursive: true });
  const types = Object.fromEntries(Object.entries(manifest.doc_types).map(([code, { template, ...entry }]) => [code, entry]));
  writeFileSync(join(dir, '.govkit', 'doc-types.json'), JSON.stringify(types));
  return dir;
}

const hook = (filePath) => {
  const out = execFileSync('node', [HOOK], { input: JSON.stringify({ tool_input: { file_path: filePath } }), encoding: 'utf8' });
  return out.trim() ? JSON.parse(out) : null;
};

test('govstack-cfr carries all 78 core requirements with GovStack classifiers', () => {
  const text = readFileSync(join(OVERLAY, 'frameworks', 'govstack-cfr.yaml'), 'utf8');
  assert.equal((text.match(/^  - id: /gm) || []).length, 78);
  assert.equal((text.match(/^    obligation: required$/gm) || []).length, 19);
  assert.equal((text.match(/^    obligation: recommended$/gm) || []).length, 59);
  for (const cat of ['development', 'deployment', 'architecture', 'quality', 'security', 'data']) {
    assert.match(text, new RegExp(`ref: "govstack-cfr-${cat}#req-1"`));
  }
  assert.match(text, /overlay_commands: \["govkit-govstack:compliance"\]/);
});

test('overlay codes are rejected until applied, then accepted with their subdirectory', () => {
  const bare = mkdtempSync(join(tmpdir(), 'govkit-overlay-bare-'));
  mkdirSync(join(bare, 'projects', '001-pilot'), { recursive: true });
  assert.equal(hook(join(bare, 'projects/001-pilot/GOV-001-GSBB-v1.0.md')).decision, 'block');

  const r = appliedRepo();
  assert.equal(hook(join(r, 'projects/001-pilot/GOV-001-GSBB-v1.0.md')), null);
  assert.equal(hook(join(r, 'projects/001-pilot/govstack/GOV-001-GSCA-001-v1.0.md')), null);
  const misplaced = hook(join(r, 'projects/001-pilot/GOV-001-GSCA-001-v1.0.md'));
  assert.equal(misplaced.decision, 'block');
  assert.match(misplaced.reason, /govstack/);
});

test('GovKit id generator numbers overlay assessments in the overlay subdirectory', () => {
  const r = appliedRepo();
  const out = execFileSync('node', [GEN, '001', 'GSCA', '--relpath', '--next-num', join(r, 'projects/001-pilot/govstack'), '--root', r], { encoding: 'utf8' }).trim();
  assert.equal(out, 'govstack/GOV-001-GSCA-001-v1.0.md');
});

test('content validation rejects bad obligations and overlay command references', () => {
  const dir = mkdtempSync(join(tmpdir(), 'govkit-overlay-content-'));
  mkdirSync(join(dir, 'frameworks'), { recursive: true });
  writeFileSync(join(dir, 'frameworks', 'acme-spec.yaml'), [
    'id: acme-spec', 'kind: framework', 'name: ACME', 'version: "1"', 'publisher: ACME',
    'url: https://example.org', 'type: standard', 'verified: 2026-01-01', 'text_policy: paraphrased',
    'related_govkit: { overlay_commands: [govstack-compliance] }',
    'controls:',
    '  - { id: C1, group: G, title: T, intent: I, obligation: mandatory, evidence_hints: [GSCA] }',
    '  - { id: C2, group: G, title: T, intent: I, attributes: { ref: 7 } }',
  ].join('\n'));
  const r = spawnSync('python3', [join(ROOT, 'scripts', 'validate-content.py'), dir], { encoding: 'utf8' });
  assert.equal(r.status, 1, r.stdout);
  assert.match(r.stdout, /not govkit-<overlay>:<command>/);
  assert.match(r.stdout, /obligation 'mandatory'/);
  assert.match(r.stdout, /attributes must map names to strings/);
  assert.doesNotMatch(r.stdout, /evidence hint 'GSCA'/);
});
