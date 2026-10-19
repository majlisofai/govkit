#!/usr/bin/env node
/**
 * Generate GovKit document IDs, mirroring ArcKit's generate-document-id.mjs.
 *
 * Usage: generate-gov-id.mjs PROJECT_ID DOC_TYPE [VERSION] [--filename] [--relpath] [--next-num DIR] [--root DIR]
 *
 *   generate-gov-id.mjs 001 CTRL                         -> GOV-001-CTRL-v1.0
 *   generate-gov-id.mjs 001 CTRL 1.1 --filename          -> GOV-001-CTRL-v1.1.md
 *   generate-gov-id.mjs 001 ASMT --relpath --next-num projects/001-x/assessments
 *                                                        -> assessments/GOV-001-ASMT-001-v1.0.md
 *
 * --root is the repository root used to find .govkit/doc-types.json (default: cwd).
 * Zero npm dependencies: plugins are cloned, never npm-installed.
 */

import { readdirSync } from 'node:fs';
import { loadDocTypes, PREFIX } from '../config/doc-types.mjs';

const USAGE = 'Usage: generate-gov-id.mjs PROJECT_ID DOC_TYPE [VERSION] [--filename] [--relpath] [--next-num DIR] [--root DIR]';

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

const positional = [];
const flags = { filename: false, relpath: false, nextNum: null, root: process.cwd() };
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--filename') flags.filename = true;
  else if (a === '--relpath') { flags.relpath = true; flags.filename = true; }
  else if (a === '--next-num') flags.nextNum = argv[++i] ?? fail(USAGE);
  else if (a === '--root') flags.root = argv[++i] ?? fail(USAGE);
  else if (a.startsWith('--')) fail(`Unknown option ${a}\n${USAGE}`);
  else positional.push(a);
}

const [rawPid, docType, rawVersion = '1.0'] = positional;
if (!rawPid || !docType) fail(USAGE);
if (!/^\d+$/.test(rawPid)) fail(`PROJECT_ID must be numeric, got '${rawPid}'`);
if (!/^\d+(\.\d+)?$/.test(rawVersion)) fail(`VERSION must look like 1.0, got '${rawVersion}'`);

const { known, multi, subdirs } = loadDocTypes(flags.root);
if (!known.has(docType)) {
  fail(`Unknown GovKit doc type '${docType}'. Valid: ${[...known].sort().join(' ')}. Register custom codes in .govkit/doc-types.json.`);
}

const pid = String(parseInt(rawPid, 10)).padStart(3, '0');
const version = rawVersion.includes('.') ? rawVersion : `${rawVersion}.0`;

let id = `${PREFIX}-${pid}-${docType}-v${version}`;
if (multi.has(docType)) {
  if (!flags.nextNum) fail(`${docType} is multi-instance: pass --next-num DIR to allocate a sequence number.`);
  let max = 0;
  try {
    const re = new RegExp(`^${PREFIX}-${pid}-${docType}-(\\d{3})-v`);
    for (const f of readdirSync(flags.nextNum)) {
      const m = f.match(re);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  } catch {
    // Directory does not exist yet: start at 001.
  }
  id = `${PREFIX}-${pid}-${docType}-${String(max + 1).padStart(3, '0')}-v${version}`;
}

let out = flags.filename ? `${id}.md` : id;
if (flags.relpath && subdirs[docType]) out = `${subdirs[docType]}/${out}`;
console.log(out);
