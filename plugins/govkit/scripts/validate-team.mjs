#!/usr/bin/env node
/**
 * Check a GovKit team topology model (GOV-NNN-TEAM-vN.N.json) against the
 * rules of its team-model method (methods/team-models/<id>.yaml).
 *
 * Usage: validate-team.mjs MODEL.json [--json]
 *
 * The model's "rules" block carries the resolved rule settings (the skill
 * copies them from the method file, because plugin scripts take no YAML
 * dependency). Missing rules fall back to the Team Topologies defaults below.
 * Exit 1 on any error-severity finding. Zero dependencies.
 */

import { readFileSync } from 'node:fs';

const DEFAULT_RULES = {
  team_size: { severity: 'error', min: 5, max: 8, count_leadership: false },
  stream_ownership: { severity: 'error' },
  stream_leadership: { severity: 'error', required: ['Product Owner', 'Tech Lead'] },
  chapter_lead: { severity: 'error' },
  chapter_span: { severity: 'warn', min_streams: 2 },
  required_chapters: { severity: 'warn', chapters: [] },
  platform_interaction: { severity: 'error' },
  time_boxed: { severity: 'error' },
  max_collaborations: { severity: 'warn', max: 2 },
  capability_consumed: { severity: 'warn' },
  dunbar: { severity: 'warn', limit: 150 },
};
const ALIASES = { 'product owner': ['po', 'product owner', 'product manager'], 'tech lead': ['tl', 'tech lead', 'technical lead', 'engineering lead'] };

const file = process.argv[2];
const asJson = process.argv.includes('--json');
if (!file) {
  console.error('Usage: validate-team.mjs MODEL.json [--json]');
  process.exit(2);
}
let model;
try {
  model = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`Cannot read ${file}: ${e.message}`);
  process.exit(2);
}

const rules = {};
for (const [id, def] of Object.entries(DEFAULT_RULES)) rules[id] = { ...def, ...(model.rules?.[id] || {}) };
const findings = [];
const add = (rule, msg, severity = rules[rule]?.severity || 'error') => findings.push({ rule, severity, msg });

const teams = model.teams || [];
const chapters = model.chapters || [];
const chapterIds = new Set(chapters.map((c) => c.id));
const byId = new Map();
for (const t of teams) {
  if (byId.has(t.id)) add('structure', `duplicate team id '${t.id}'`, 'error');
  byId.set(t.id, t);
}
const streams = teams.filter((t) => t.type === 'stream-aligned');
const sizeOf = (t) => {
  const members = t.members ? Object.values(t.members).reduce((a, b) => a + b, 0) : (t.size || 0);
  return members + (rules.team_size.count_leadership ? (t.leadership || []).length : 0);
};

// Structure
if (!streams.length) add('structure', 'no stream-aligned teams', 'error');
for (const t of teams) {
  for (const ch of Object.keys(t.members || {})) {
    if (!chapterIds.has(ch)) add('structure', `team '${t.id}' has members in unknown chapter '${ch}'`, 'error');
  }
  if (!t.members && !t.size) add('structure', `team '${t.id}' has neither members nor size`, 'error');
}

// team_size
for (const t of teams) {
  const n = sizeOf(t);
  const { min, max } = rules.team_size;
  if (n && (n < min || n > max)) add('team_size', `team '${t.id}' has ${n} members (allowed ${min}–${max})`);
}

// stream_ownership
const seenStreams = new Map();
for (const t of streams) {
  if (!t.business_stream) add('stream_ownership', `stream-aligned team '${t.id}' names no business_stream`);
  else if (seenStreams.has(t.business_stream.toLowerCase())) add('stream_ownership', `teams '${seenStreams.get(t.business_stream.toLowerCase())}' and '${t.id}' share business stream '${t.business_stream}'`);
  else seenStreams.set(t.business_stream.toLowerCase(), t.id);
}

// stream_leadership
for (const t of streams) {
  const have = (t.leadership || []).map((r) => r.toLowerCase().trim());
  for (const role of rules.stream_leadership.required || []) {
    const accepted = ALIASES[role.toLowerCase()] || [role.toLowerCase()];
    if (!have.some((h) => accepted.includes(h))) add('stream_leadership', `team '${t.id}' has no ${role}`);
  }
}

// chapter_lead / chapter_span / required_chapters
for (const c of chapters) {
  if (!c.lead) add('chapter_lead', `chapter '${c.id}' has no lead`);
  const span = streams.filter((t) => (t.members?.[c.id] || 0) > 0).length;
  if (span < rules.chapter_span.min_streams) add('chapter_span', `chapter '${c.id}' has members in ${span} stream(s) (min ${rules.chapter_span.min_streams})`);
}
for (const ch of rules.required_chapters.chapters || []) {
  for (const t of streams) if (!(t.members?.[ch] > 0)) add('required_chapters', `team '${t.id}' has no member in required chapter '${ch}'`);
}

// Interactions
const expand = (ref) => (ref === '*stream' ? streams.map((t) => t.id) : [ref]);
const collabCount = new Map();
for (const i of model.interactions || []) {
  for (const ref of [i.from, i.to]) {
    if (ref !== '*stream' && !byId.has(ref)) add('structure', `interaction references unknown team '${ref}'`, 'error');
  }
  const from = byId.get(i.from);
  const toTypes = expand(i.to).map((id) => byId.get(id)?.type);
  if (from?.type === 'platform' && toTypes.includes('stream-aligned') && i.mode !== 'x-as-a-service') {
    add('platform_interaction', `platform '${i.from}' → '${i.to}' is '${i.mode}', expected x-as-a-service`);
  }
  if ((i.mode === 'collaboration' || i.mode === 'facilitating') && !i.until) {
    add('time_boxed', `${i.mode} '${i.from}' → '${i.to}' has no "until" date`);
  }
  if (i.mode === 'collaboration') {
    // Count per team pair: a collaboration with '*stream' is one per stream.
    for (const a of expand(i.from)) {
      for (const b of expand(i.to)) {
        collabCount.set(a, (collabCount.get(a) || 0) + 1);
        collabCount.set(b, (collabCount.get(b) || 0) + 1);
      }
    }
  }
}
for (const [id, n] of collabCount) {
  if (n > rules.max_collaborations.max) add('max_collaborations', `team '${id}' is in ${n} concurrent collaborations (max ${rules.max_collaborations.max})`);
}
for (const p of teams.filter((t) => t.type === 'platform')) {
  if (!(model.interactions || []).some((i) => i.from === p.id)) add('platform_interaction', `platform '${p.id}' declares no consumers`, 'warn');
  for (const cap of p.capabilities || []) {
    if (!cap.consumers) continue;
    if (cap.consumers.length === 0) add('capability_consumed', `capability '${cap.name}' of '${p.id}' has no consumers`);
    for (const c of cap.consumers) if (!byId.has(c)) add('structure', `capability '${cap.name}' consumer '${c}' is not a team`, 'error');
  }
}

// dunbar
const total = teams.reduce((a, t) => a + sizeOf(t) + (rules.team_size.count_leadership ? 0 : (t.leadership || []).length), 0);
if (total > rules.dunbar.limit) add('dunbar', `${total} people exceeds ${rules.dunbar.limit}; split into separate hubs/tribes`);

const errors = findings.filter((f) => f.severity === 'error');
const summary = {
  file,
  stream_aligned: streams.length,
  platform: teams.filter((t) => t.type === 'platform').length,
  enabling: teams.filter((t) => t.type === 'enabling').length,
  complicated_subsystem: teams.filter((t) => t.type === 'complicated-subsystem').length,
  chapters: chapters.length,
  stream_members: streams.reduce((a, t) => a + sizeOf(t), 0),
  total_people: total,
};
if (asJson) {
  console.log(JSON.stringify({ summary, findings }, null, 2));
} else {
  for (const f of findings) console.log(`${f.severity === 'error' ? 'FAIL' : 'WARN'}  [${f.rule}] ${f.msg}`);
  console.log(`${errors.length ? 'INVALID' : 'OK'}: ${summary.stream_aligned} stream-aligned, ${summary.platform} platform, ${summary.enabling} enabling, ` +
    `${summary.complicated_subsystem} complicated-subsystem team(s); ${summary.chapters} chapters; ${summary.total_people} people; ` +
    `${errors.length} error(s), ${findings.length - errors.length} warning(s)`);
}
process.exit(errors.length ? 1 : 0);
