import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const S = join(ROOT, 'plugins', 'govkit', 'scripts');
const EXAMPLE = join(ROOT, 'examples', 'teams', 'ai-innovation-hub.json');
const tmp = () => mkdtempSync(join(tmpdir(), 'govkit-team-'));
const base = () => JSON.parse(readFileSync(EXAMPLE, 'utf8'));
const write = (model) => {
  const f = join(tmp(), 'm.json');
  writeFileSync(f, JSON.stringify(model));
  return f;
};
const validate = (f) => spawnSync('node', [join(S, 'validate-team.mjs'), f, '--json'], { encoding: 'utf8' });
const findings = (model) => JSON.parse(validate(write(model)).stdout).findings;

test('the AI Innovation Hub example is a valid design', () => {
  const r = validate(EXAMPLE);
  assert.equal(r.status, 0, r.stdout);
  const { summary, findings: f } = JSON.parse(r.stdout);
  assert.deepEqual(f, []);
  assert.equal(summary.stream_aligned, 8);
  assert.equal(summary.chapters, 5);
  assert.equal(summary.stream_members, 64);
});

test('oversized team, missing PO and shared business stream are errors', () => {
  const m = base();
  m.teams[0].members.ux = 5;                       // 11 members
  m.teams[1].leadership = ['Tech Lead'];
  m.teams[2].business_stream = m.teams[3].business_stream;
  const f = findings(m);
  assert.ok(f.some((x) => x.rule === 'team_size' && /stream-1.*11 members/.test(x.msg)));
  assert.ok(f.some((x) => x.rule === 'stream_leadership' && /stream-2 has no Product Owner/.test(x.msg.replace(/'/g, ''))));
  assert.ok(f.some((x) => x.rule === 'stream_ownership' && /share business stream/.test(x.msg)));
  assert.equal(validate(write(m)).status, 1);
});

test('interaction rules: platform must be X-as-a-Service; collaboration must be time-boxed', () => {
  const m = base();
  m.interactions[0].mode = 'collaboration';
  const f = findings(m);
  assert.ok(f.some((x) => x.rule === 'platform_interaction'));
  assert.ok(f.some((x) => x.rule === 'time_boxed'));
  assert.ok(f.some((x) => x.rule === 'max_collaborations' && x.severity === 'warn'));
});

test('chapter rules and unknown references', () => {
  const m = base();
  m.chapters[0].lead = '';
  m.chapters.push({ id: 'qa', name: 'QA Chapter', lead: 'QA Lead' });
  m.teams[0].members.ux -= 1;
  m.teams[0].members.qa = 1;                       // QA in only one stream
  m.teams[0].members.ghost = 1;
  m.rules = { ...m.rules, required_chapters: { severity: 'warn', chapters: ['qa'] } };
  m.interactions.push({ from: 'nobody', to: 'stream-1', mode: 'x-as-a-service' });
  const f = findings(m);
  assert.ok(f.some((x) => x.rule === 'chapter_lead'));
  assert.ok(f.some((x) => x.rule === 'chapter_span' && /'qa'.*1 stream/.test(x.msg)));
  assert.ok(f.some((x) => x.rule === 'required_chapters' && /stream-2/.test(x.msg)));
  assert.ok(f.some((x) => /unknown chapter 'ghost'/.test(x.msg)));
  assert.ok(f.some((x) => /unknown team 'nobody'/.test(x.msg)));
});

test('rules block overrides the defaults (method customisation)', () => {
  const m = base();
  m.rules = { ...m.rules, team_size: { severity: 'warn', min: 3, max: 6, count_leadership: false } };
  const r = validate(write(m));
  assert.equal(r.status, 0);                       // now only warnings
  assert.ok(JSON.parse(r.stdout).findings.every((x) => x.severity === 'warn' && x.rule === 'team_size'));
});

test('renderer produces a valid draw.io matrix with every team, cell and interaction', () => {
  const m = base();
  m.teams.push({ id: 'enable-x', type: 'enabling', name: 'Enablers', size: 5 });
  m.teams.push({ id: 'core-y', type: 'complicated-subsystem', name: 'Core', size: 6 });
  m.interactions.push({ from: 'enable-x', to: 'stream-2', mode: 'facilitating', until: '2027-01-01' });
  m.interactions.push({ from: 'core-y', to: 'stream-6', mode: 'collaboration', until: '2027-01-01' });
  const f = write(m);
  const out = join(dirname(f), 'm.drawio');
  execFileSync('node', [join(S, 'render-team-matrix.mjs'), f, '-o', out]);
  const v = spawnSync('node', [join(S, 'validate-drawio.mjs'), out, '--json'], { encoding: 'utf8' });
  assert.equal(v.status, 0, v.stdout);
  const res = JSON.parse(v.stdout);
  assert.deepEqual(res.warnings, []);
  assert.equal(res.edges, 3);
  const xml = readFileSync(out, 'utf8');
  const dots = [...xml.matchAll(/id="tm-stream-\d+-[a-z-]+" value="(●+)"/g)].reduce((a, x) => a + x[1].length, 0);
  assert.equal(dots, 64);                          // one dot per chapter member
  assert.match(xml, /X-as-a-Service/);
  assert.match(xml, /Facilitating \(until 2027-01-01\)/);
  assert.match(xml, /entryX=0\.5;entryY=0;/);      // lane routing into the column top
});

test('hook accepts TEAM .json/.drawio companions and rejects .json for other types', () => {
  const r = tmp();
  mkdirSync(join(r, 'projects/001-x'), { recursive: true });
  const hook = (p) => {
    const out = execFileSync('node', [join(ROOT, 'plugins/govkit/hooks/validate-gov-filename.mjs')], { input: JSON.stringify({ tool_input: { file_path: join(r, p) } }), encoding: 'utf8' });
    return out.trim() ? JSON.parse(out) : null;
  };
  assert.equal(hook('projects/001-x/GOV-001-TEAM-v1.0.json'), null);
  assert.equal(hook('projects/001-x/GOV-001-TEAM-v1.0.drawio'), null);
  assert.match(hook('projects/001-x/GOV-001-CTRL-v1.0.json').reason, /cannot be '\.json'/);
});

test('team-model method with an unimplemented rule fails content validation', () => {
  const d = tmp();
  mkdirSync(join(d, '.govkit', 'methods', 'team-models'), { recursive: true });
  writeFileSync(join(d, '.govkit', 'methods', 'team-models', 'acme.yaml'),
    'id: acme\nkind: team-model\nteam_types: { stream-aligned: {}, platform: {} }\ninteraction_modes: { x-as-a-service: {} }\nrules:\n  team_size: { severity: error, min: 4, max: 9 }\n  vibes: { severity: warn }\n');
  const r = spawnSync('python3', [join(ROOT, 'scripts', 'validate-content.py'), join(d, '.govkit')], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /rule 'vibes' is not implemented/);
});
