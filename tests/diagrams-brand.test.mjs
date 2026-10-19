import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN = join(ROOT, 'plugins', 'govkit');
const S = join(PLUGIN, 'scripts');
const FIXTURE = join(ROOT, 'tests', 'fixtures', 'drawio', 'archimate-layered.drawio');
const tmp = (p) => mkdtempSync(join(tmpdir(), p));

// --- filename hook: draw.io companions ---------------------------------------
function hook(filePath) {
  const out = execFileSync('node', [join(PLUGIN, 'hooks', 'validate-gov-filename.mjs')], { input: JSON.stringify({ tool_input: { file_path: filePath } }), encoding: 'utf8' });
  return out.trim() ? JSON.parse(out) : null;
}

test('hook accepts DGRM .md and .drawio companions in diagrams/', () => {
  const r = tmp('govkit-dg-');
  mkdirSync(join(r, 'projects/001-x/diagrams'), { recursive: true });
  assert.equal(hook(join(r, 'projects/001-x/diagrams/GOV-001-DGRM-001-v1.0.md')), null);
  assert.equal(hook(join(r, 'projects/001-x/diagrams/GOV-001-DGRM-001-v1.0.drawio')), null);
  assert.equal(hook(join(r, 'projects/001-x/diagrams/GOV-001-DGRM-001-v1.0.drawio.svg')), null);
});

test('hook blocks a companion without sequence and .drawio for non-diagram types', () => {
  const r = tmp('govkit-dg-');
  assert.match(hook(join(r, 'projects/001-x/diagrams/GOV-001-DGRM-v1.0.drawio')).reason, /companion file/);
  assert.match(hook(join(r, 'projects/001-x/GOV-001-CTRL-v1.0.drawio')).reason, /cannot be '\.drawio'/);
  assert.match(hook(join(r, 'projects/001-x/GOV-001-DGRM-001-v1.0.drawio')).reason, /diagrams\/GOV-001-DGRM-001-v1\.0\.drawio/);
});

// --- validate-drawio ---------------------------------------------------------
const validate = (file, ...a) => spawnSync('node', [join(S, 'validate-drawio.mjs'), file, ...a], { encoding: 'utf8' });
const model = (cells) => `<mxfile><diagram id="p" name="P"><mxGraphModel gridSize="10"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells}</root></mxGraphModel></diagram></mxfile>`;
const v = (id, x, y, w = 160, h = 80) => `<mxCell id="${id}" value="${id}" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`;

test('validator passes the real ArchiMate fixture', () => {
  const r = validate(FIXTURE, '--grid', '8');
  assert.equal(r.status, 0, r.stdout);
  assert.match(r.stdout, /13 vertices, 9 edges/);
});

test('validator rejects broken references, duplicates, compressed pages and bad XML', () => {
  const d = tmp('govkit-dv-');
  const write = (name, xml) => { writeFileSync(join(d, name), xml); return join(d, name); };
  const refs = validate(write('refs.drawio', model(v('a', 0, 0) + v('a', 400, 0) + '<mxCell id="e" edge="1" parent="1" source="a" target="ghost"><mxGeometry relative="1" as="geometry"/></mxCell>')));
  assert.equal(refs.status, 1);
  assert.match(refs.stdout, /duplicate cell id 'a'/);
  assert.match(refs.stdout, /target="ghost" does not exist/);
  const compressed = validate(write('c.drawio', '<mxfile><diagram id="p" name="P">7VZNb9swDP01Ph</diagram></mxfile>'));
  assert.match(compressed.stdout, /compressed diagrams are not allowed/);
  const bad = validate(write('bad.drawio', '<mxfile><diagram><mxGraphModel></diagram></mxfile>'));
  assert.match(bad.stdout, /does not match/);
  const noRoot = validate(write('nr.drawio', '<mxfile><diagram id="p"><mxGraphModel><root><mxCell id="x" vertex="1"><mxGeometry as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>'));
  assert.match(noRoot.stdout, /missing root cell id="0"/);
});

test('validator warns on overlap and off-grid, but passes', () => {
  const d = tmp('govkit-dv-');
  writeFileSync(join(d, 'o.drawio'), model(v('a', 0, 0) + v('b', 100, 33)));
  const r = validate(join(d, 'o.drawio'));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /'a' and 'b' overlap/);
  assert.match(r.stdout, /off the 10px grid/);
});

// --- export ------------------------------------------------------------------
test('export skips with exit 3 when draw.io is unavailable', () => {
  const d = tmp('govkit-ex-');
  cpSync(FIXTURE, join(d, 'a.drawio'));
  const r = spawnSync('bash', [join(S, 'export-drawio.sh'), join(d, 'a.drawio')], { encoding: 'utf8', env: { ...process.env, DRAWIO_BIN: '/nonexistent/drawio' } });
  assert.equal(r.status, 3);
});

const drawioInstalled = existsSync('/Applications/draw.io.app/Contents/MacOS/draw.io');
test('export writes an editable .drawio.svg', { skip: !drawioInstalled && 'draw.io desktop not installed' }, () => {
  const d = tmp('govkit-ex-');
  cpSync(FIXTURE, join(d, 'a.drawio'));
  const r = spawnSync('bash', [join(S, 'export-drawio.sh'), join(d, 'a.drawio'), 'svg'], { encoding: 'utf8', timeout: 60000 });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(d, 'a.drawio.svg')));
});

// --- contrast ----------------------------------------------------------------
test('contrast checker computes WCAG ratios', () => {
  const ok = spawnSync('node', [join(S, 'check-contrast.mjs'), '#111111', '#FFFFFF'], { encoding: 'utf8' });
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /18\.88:1/);
  const fail = spawnSync('node', [join(S, 'check-contrast.mjs'), '#999999', '#FFFFFF'], { encoding: 'utf8' });
  assert.equal(fail.status, 1);
  const large = spawnSync('node', [join(S, 'check-contrast.mjs'), '--min', '2.5', '#999999', '#FFFFFF'], { encoding: 'utf8' });
  assert.equal(large.status, 0);
});

// --- brands --------------------------------------------------------------------
const content = (...a) => spawnSync('python3', [join(ROOT, 'scripts', 'validate-content.py'), ...a], { encoding: 'utf8' });

function brandRepo(colours = {}) {
  const d = tmp('govkit-br-');
  const b = join(d, '.govkit', 'brands', 'acme');
  mkdirSync(join(b, 'assets'), { recursive: true });
  writeFileSync(join(b, 'assets', 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  const c = { paper: '#FFFFFF', ink: '#111111', ink_muted: '#5C5C5C', accent: '#0057B8', on_accent: '#FFFFFF', ...colours };
  writeFileSync(join(b, 'brand.yaml'), [
    'id: acme', 'kind: brand', 'name: Acme Corp',
    'colours:', ...Object.entries(c).map(([k, val]) => `  ${k}: "${val}"`),
    '  rag: { red: "#B3261E", amber: "#7A5200", green: "#1E6B3A" }',
    '  text_pairs: [[ink, paper], [accent, paper], [on_accent, accent]]',
    'typography: { text: { family: Source Sans 3 } }',
    'logo: { symbol: assets/logo.svg, alt: Acme }',
    'voice: { banned_terms: [synergy] }',
    'documents: { header: "**{name}** · {doc_id}" }',
    'diagrams: { drawio_style: standard }',
  ].join('\n'));
  writeFileSync(join(d, '.govkit', 'profile.yaml'), 'govkit_profile: 1\nbrand: acme\n');
  return d;
}

test('a custom project brand validates and resolves', () => {
  const d = brandRepo();
  const r = content(join(d, '.govkit'));
  assert.equal(r.status, 0, r.stdout);
});

test('a brand failing WCAG contrast is rejected', () => {
  const d = brandRepo({ accent: '#7FB2FF' });
  const r = content(join(d, '.govkit'));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /\[accent, paper\] contrast .* below WCAG AA/);
});

test('an unknown brand id fails profile validation', () => {
  const d = tmp('govkit-br-');
  mkdirSync(join(d, '.govkit'));
  writeFileSync(join(d, '.govkit', 'profile.yaml'), 'brand: nope\n');
  assert.match(content(join(d, '.govkit')).stdout, /brands\/nope\/brand\.yaml not found/);
});

test('central brand: a brand in the org profile layer (extends) resolves for the project', () => {
  const org = brandRepo();                       // org repo holds .govkit/brands/acme
  const orgDir = join(org, '.govkit');
  writeFileSync(join(orgDir, 'profile.yaml'), 'govkit_profile: 1\nbrand: acme\n');
  const proj = tmp('govkit-proj-');
  mkdirSync(join(proj, '.govkit'));
  writeFileSync(join(proj, '.govkit', 'profile.yaml'), `govkit_profile: 1\nextends: ${join(orgDir, 'profile.yaml')}\n`);
  const r = content(join(proj, '.govkit'));
  assert.equal(r.status, 0, r.stdout);
});

test('session hook reports the brand', () => {
  const d = brandRepo();
  const out = execFileSync('node', [join(PLUGIN, 'hooks', 'govkit-session.mjs')], { input: JSON.stringify({ cwd: d }), encoding: 'utf8', env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN, HOME: d } });
  assert.match(JSON.parse(out).hookSpecificOutput.additionalContext, /Brand: acme/);
});
