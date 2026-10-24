import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RELEASE = join(ROOT, 'scripts', 'release.mjs');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

// A minimal checkout: marketplace with govkit and one module, a lock, a CHANGELOG, one commit.
function repo() {
  const dir = mkdtempSync(join(tmpdir(), 'govkit-release-'));
  const write = (p, v) => {
    mkdirSync(dirname(join(dir, p)), { recursive: true });
    writeFileSync(join(dir, p), typeof v === 'string' ? v : JSON.stringify(v, null, 2) + '\n');
  };
  write('.claude-plugin/marketplace.json', {
    name: 'majlisofai',
    metadata: { version: '0.4.0' },
    plugins: [
      { name: 'govkit', source: './plugins/govkit', version: '0.4.0' },
      { name: 'govkit-demo', source: './plugins/govkit-demo', version: '0.1.0' },
    ],
  });
  write('plugins/govkit/.claude-plugin/plugin.json', { name: 'govkit', displayName: 'GovKit', version: '0.4.0', repository: 'https://github.com/majlisofai/govkit' });
  write('plugins/govkit-demo/.claude-plugin/plugin.json', { name: 'govkit-demo', version: '0.1.0' });
  write('plugins/govkit-demo/govkit-overlay.json', { overlay: 'govkit-demo', govkit: { min: '0.4.0', max_exclusive: '1.0.0' } });
  write('upstream/arckit.lock.json', { version: '6.18.2' });
  write('CHANGELOG.md', '# Changelog\n\n## 0.4.0 — 2026-10-24\n\nTested against ArcKit 6.18.2.\n\n- Overlays.\n\n## 0.3.0 — 2026-10-19\n\n- Teams.\n');
  const git = (...a) => execFileSync('git', a, { cwd: dir, stdio: 'pipe' });
  git('init', '-q');
  git('add', '.');
  git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'init');
  return { dir, git };
}

const run = (dir, ...args) => spawnSync('node', [RELEASE, ...args, '--root', dir], { encoding: 'utf8' });

test('check passes on a released state and notes print the CHANGELOG entry', () => {
  const { dir } = repo();
  assert.equal(run(dir, 'check').status, 0);
  const notes = run(dir, 'notes', 'govkit');
  assert.equal(notes.status, 0);
  assert.equal(notes.stdout.trim(), 'Tested against ArcKit 6.18.2.\n\n- Overlays.');
  assert.equal(run(dir, 'notes', 'govkit-demo').status, 1, 'a module without an entry has no notes');
});

test('bump govkit updates plugin.json, both marketplace versions and adds a stub that fails check', () => {
  const { dir } = repo();
  const r = run(dir, 'bump', 'govkit', 'minor');
  assert.equal(r.status, 0, r.stderr);
  assert.equal(json(join(dir, 'plugins/govkit/.claude-plugin/plugin.json')).version, '0.5.0');
  const market = json(join(dir, '.claude-plugin/marketplace.json'));
  assert.equal(market.metadata.version, '0.5.0');
  assert.equal(market.plugins[0].version, '0.5.0');
  assert.equal(market.plugins[1].version, '0.1.0', 'other plugins untouched');
  const changelog = readFileSync(join(dir, 'CHANGELOG.md'), 'utf8');
  assert.match(changelog, /^# Changelog\n\n## 0\.5\.0 — \d{4}-\d\d-\d\d\n\nTested against ArcKit 6\.18\.2\.\n\n- TODO/);
  assert.ok(changelog.indexOf('## 0.5.0') < changelog.indexOf('## 0.4.0'));

  const check = run(dir, 'check');
  assert.equal(check.status, 1);
  assert.match(check.stderr, /govkit 0\.5\.0 is still a stub/);
});

test('bump a module leaves govkit and metadata alone and uses a prefixed heading', () => {
  const { dir } = repo();
  assert.equal(run(dir, 'bump', 'govkit-demo', 'patch').status, 0);
  const market = json(join(dir, '.claude-plugin/marketplace.json'));
  assert.equal(market.metadata.version, '0.4.0');
  assert.equal(market.plugins[1].version, '0.1.1');
  assert.match(readFileSync(join(dir, 'CHANGELOG.md'), 'utf8'), /## govkit-demo 0\.1\.1 — .*\n\nSupports GovKit >=0\.4\.0 <1\.0\.0\./);
});

test('bump rejects non-increasing and malformed versions', () => {
  const { dir } = repo();
  assert.match(run(dir, 'bump', 'govkit', '0.4.0').stderr, /not newer/);
  assert.match(run(dir, 'bump', 'govkit', '1.0.0-beta.1').stderr, /patch, minor, major or X\.Y\.Z/);
  assert.match(run(dir, 'bump', 'nope', 'patch').stderr, /no plugin 'nope'/);
});

test('publish releases only untagged versions, 0.x as beta', () => {
  const { dir, git } = repo();
  let out = run(dir, 'publish', '--dry-run').stdout;
  assert.match(out, /govkit--v0\.4\.0 .*GovKit 0\.4\.0 \(beta\)$/m);
  assert.match(out, /govkit-demo--v0\.1\.0 .*\(generated notes\)$/m);

  git('tag', 'govkit--v0.4.0');
  git('tag', 'govkit-demo--v0.1.0');
  assert.match(run(dir, 'publish', '--dry-run').stdout, /nothing to release/);

  run(dir, 'bump', 'govkit', 'major');
  out = run(dir, 'publish', '--dry-run').stdout;
  assert.match(out, /govkit--v1\.0\.0 .*GovKit 1\.0\.0$/m, 'stable from 1.0.0');
  assert.doesNotMatch(out, /govkit-demo/);
});
