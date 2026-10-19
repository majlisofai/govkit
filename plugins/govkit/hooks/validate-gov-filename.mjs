#!/usr/bin/env node
/**
 * GovKit PreToolUse (Write) hook — GOV filename convention enforcement.
 *
 * The GovKit counterpart of ArcKit's validate-arc-filename.mjs. ArcKit's hook
 * ignores GOV-* files; this one checks them against
 *   projects/{NNN-name}/[subdir/]GOV-{PID}-{TYPE}[-{SEQ}]-v{N.N}.md
 * plus, for types that declare them, companion files with the same stem
 * (.json, .drawio, .drawio.svg, .drawio.png), and blocks with a model-visible
 * reason naming the corrected path. Like ArcKit, it never rewrites the tool input — a block is a gate, not a grant.
 *
 * Exit 0 always; emits {decision:'block', reason} or nothing.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { EXTENSIONS, loadDocTypes, PREFIX } from '../config/doc-types.mjs';

// Alternation for the extension group of the filename pattern.
const EXT_ALT = [...EXTENSIONS].sort((a, b) => b.length - a.length).map((e) => e.replace(/\./g, '\\.')).join('|');

let data;
try {
  const raw = readFileSync(0, 'utf8');
  if (!raw.trim()) process.exit(0);
  data = JSON.parse(raw);
} catch {
  process.exit(0);
}

let filePath = data?.tool_input?.file_path || '';
if (!filePath) process.exit(0);
if (!filePath.startsWith('/') && data.cwd) filePath = join(data.cwd, filePath);

const filename = basename(filePath);
if (!filePath.includes('/projects/') || !filename.startsWith(`${PREFIX}-`) || !EXTENSIONS.some((e) => filename.endsWith(e))) process.exit(0);

const block = (reason) => {
  console.log(JSON.stringify({ decision: 'block', reason: `GovKit: ${reason}` }));
  process.exit(0);
};

const repoRoot = filePath.split('/projects/')[0];
const afterProjects = filePath.split('/projects/')[1];
const projectDirName = afterProjects.split('/')[0];
const projectDir = join(repoRoot, 'projects', projectDirName);
const dirNum = (projectDirName.match(/^(\d+)-/) || [])[1];

const m = filename.match(new RegExp(`^${PREFIX}-(\\d+)-([A-Z][A-Z0-9-]*?)(?:-(\\d{3}))?-v(\\d+(?:\\.\\d+)?)(${EXT_ALT})$`));
if (!m) block(`'${filename}' does not match ${PREFIX}-{PID}-{TYPE}[-{SEQ}]-v{N.N}.md. Generate it with node \${CLAUDE_PLUGIN_ROOT}/scripts/generate-gov-id.mjs.`);

const [, rawPid, docType, seq, rawVersion, ext] = m;
const { types, known, multi, subdirs } = loadDocTypes(repoRoot);

if (!known.has(docType)) {
  block(`Unknown document type '${docType}' in '${filename}'. Valid: ${[...known].sort().join(' ')}. Register custom codes in .govkit/doc-types.json.`);
}
const allowedExt = types[docType].extensions || ['.md'];
if (!allowedExt.includes(ext)) {
  block(`${docType} artefacts cannot be '${ext}' files (allowed: ${allowedExt.join(' ')}).`);
}
if (ext !== '.md' && multi.has(docType) && !seq) {
  block(`'${filename}' is a companion file: give it the same name as its ${PREFIX}-*-${docType}-NNN-v*.md, sequence number included.`);
}

const pid = String(parseInt(dirNum ?? rawPid, 10)).padStart(3, '0');
const version = rawVersion.includes('.') ? rawVersion : `${rawVersion}.0`;

let expectedDir = projectDir;
let seqPart = '';
if (multi.has(docType)) {
  if (subdirs[docType]) expectedDir = join(projectDir, subdirs[docType]);
  if (seq) {
    seqPart = `-${seq}`;
  } else {
    let max = 0;
    try {
      for (const f of readdirSync(expectedDir)) {
        const s = f.match(new RegExp(`^${PREFIX}-${pid}-${docType}-(\\d{3})-v`));
        if (s) max = Math.max(max, parseInt(s[1], 10));
      }
    } catch { /* no dir yet */ }
    seqPart = `-${String(max + 1).padStart(3, '0')}`;
  }
} else if (seq) {
  block(`${docType} is single-instance and takes no sequence number ('${filename}').`);
}

const expected = join(expectedDir, `${PREFIX}-${pid}-${docType}${seqPart}-v${version}${ext}`);
if (expected !== join(dirname(filePath), filename)) {
  block(`Write to '${expected}' instead of '${filePath}' (project ID, sequence, version format or subdirectory corrected).`);
}
process.exit(0);
