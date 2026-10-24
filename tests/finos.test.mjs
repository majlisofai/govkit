import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GOVKIT = join(ROOT, 'plugins', 'govkit');
const MODULE = join(ROOT, 'plugins', 'govkit-finos');
const HOOK = join(GOVKIT, 'hooks', 'validate-gov-filename.mjs');
const GEN = join(GOVKIT, 'scripts', 'generate-gov-id.mjs');
const manifest = JSON.parse(readFileSync(join(MODULE, 'govkit-overlay.json'), 'utf8'));

// Repo tooling may use PyYAML; the plugin itself never parses these files in Node.
const yaml = (path) => JSON.parse(execFileSync('python3', ['-c',
  'import json, sys, yaml; print(json.dumps(yaml.safe_load(open(sys.argv[1])), default=str))', path], { encoding: 'utf8' }));
const framework = yaml(join(MODULE, 'frameworks', 'finos-aigf.yaml'));
const catalogue = yaml(join(MODULE, 'references', 'risk-catalogue.yaml'));

function appliedRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'govkit-finos-'));
  mkdirSync(join(dir, '.govkit'));
  mkdirSync(join(dir, 'projects', '001-pilot', 'finos'), { recursive: true });
  const types = Object.fromEntries(Object.entries(manifest.doc_types).map(([code, { template, ...entry }]) => [code, entry]));
  writeFileSync(join(dir, '.govkit', 'doc-types.json'), JSON.stringify(types));
  return dir;
}

const hook = (filePath) => {
  const out = execFileSync('node', [HOOK], { input: JSON.stringify({ tool_input: { file_path: filePath } }), encoding: 'utf8' });
  return out.trim() ? JSON.parse(out) : null;
};

test('finos-aigf carries the 25 FINOS mitigations, two of them Draft', () => {
  assert.equal(framework.controls.length, 25);
  assert.deepEqual(new Set(framework.controls.map((c) => c.group)), new Set(['Preventative', 'Detective']));
  assert.deepEqual(framework.controls.filter((c) => c.obligation === 'draft').map((c) => c.id), ['mi-24', 'mi-25']);
  assert.deepEqual(framework.related_govkit.overlay_commands, ['govkit-finos:risk-assess']);
});

test('risk catalogue and mitigations link both ways', () => {
  const risks = new Map(catalogue.risks.map((r) => [r.id, r]));
  assert.equal(risks.size, 24);
  const inverse = new Map();
  for (const c of framework.controls) {
    for (const rid of c.attributes.mitigates.split(' ')) {
      assert.ok(risks.has(rid), `${c.id} mitigates unknown ${rid}`);
      inverse.set(rid, [...(inverse.get(rid) || []), c.id]);
    }
  }
  for (const r of catalogue.risks) {
    assert.ok(r.mitigated_by.length > 0, `${r.id} has no mitigation`);
    assert.deepEqual([...r.mitigated_by].sort(), [...(inverse.get(r.id) || [])].sort(), r.id);
    for (const t of r.triggers) assert.ok(t in catalogue.triggers, `${r.id} trigger ${t} undefined`);
    assert.match(r.display_id, /^AIR-(OP|SEC|RC)-\d{3}$/);
  }
});

test('FNRA is rejected until applied, then accepted in finos/', () => {
  const bare = mkdtempSync(join(tmpdir(), 'govkit-finos-bare-'));
  mkdirSync(join(bare, 'projects', '001-pilot', 'finos'), { recursive: true });
  assert.equal(hook(join(bare, 'projects/001-pilot/finos/GOV-001-FNRA-001-v1.0.md')).decision, 'block');

  const r = appliedRepo();
  assert.equal(hook(join(r, 'projects/001-pilot/finos/GOV-001-FNRA-001-v1.0.md')), null);
  const misplaced = hook(join(r, 'projects/001-pilot/GOV-001-FNRA-001-v1.0.md'));
  assert.equal(misplaced.decision, 'block');
  assert.match(misplaced.reason, /finos/);
});

test('GovKit id generator numbers FNRA assessments in finos/', () => {
  const r = appliedRepo();
  const out = execFileSync('node', [GEN, '001', 'FNRA', '--relpath', '--next-num', join(r, 'projects/001-pilot/finos'), '--root', r], { encoding: 'utf8' }).trim();
  assert.equal(out, 'finos/GOV-001-FNRA-001-v1.0.md');
});
