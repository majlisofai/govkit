import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const validate = (...args) => spawnSync('python3', [join(ROOT, 'scripts', 'validate-content.py'), ...args], { encoding: 'utf8' });

test('built-in content validates', () => {
  const r = validate();
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('compat check passes against the locked ArcKit release', () => {
  const r = spawnSync('node', [join(ROOT, 'scripts', 'check-compat.mjs')], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test('a project override with bad references fails validation', () => {
  const dir = mkdtempSync(join(tmpdir(), 'govkit-content-'));
  const govkit = join(dir, '.govkit');
  mkdirSync(join(govkit, 'frameworks'), { recursive: true });
  writeFileSync(join(govkit, 'frameworks', 'acme-policy.yaml'), [
    'id: acme-policy', 'kind: framework', 'name: ACME', 'version: "1"', 'publisher: ACME',
    'url: https://example.org', 'type: policy', 'verified: 2026-01-01', 'text_policy: paraphrased',
    'controls:',
    '  - { id: C1, group: G, title: T, intent: I, evidence_hints: [NOTACODE], mappings: { nope: [X] } }',
    '  - { id: C1, group: G, title: T, intent: I }',
  ].join('\n'));
  writeFileSync(join(govkit, 'profile.yaml'), 'frameworks:\n  active: [acme-policy, missing-fw]\n  primary: other\n');
  const r = validate(govkit);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /NOTACODE/);
  assert.match(r.stdout, /unknown framework 'nope'/);
  assert.match(r.stdout, /duplicate control id C1/);
  assert.match(r.stdout, /frameworks\/missing-fw\.yaml not found/);
  assert.match(r.stdout, /primary must be in frameworks\.active/);
});
