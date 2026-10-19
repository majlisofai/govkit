/**
 * GovKit Document Type Codes — single source of truth for hooks and scripts.
 *
 * Why a separate prefix (GOV-) instead of ARC-?
 *   ArcKit core's validate-arc-filename.mjs blocks any ARC-*.md write whose
 *   type code is not in ArcKit's own registry, and a third-party plugin cannot
 *   add to that registry. GOV-* files pass through ArcKit's hook untouched
 *   (the same approach ArcKit's NHS overlay uses for SAFETY-CASE.md), and are
 *   validated by GovKit's own hook instead. Layout is otherwise identical:
 *   projects/{NNN-name}/[subdir/]GOV-{PID}-{TYPE}[-{SEQ}]-v{N.N}.md
 *
 * Codes here must never collide with an ArcKit code (scripts/check-compat.mjs
 * checks against the vendored ArcKit registry snapshot).
 *
 * Projects can register extra codes in .govkit/doc-types.json:
 *   { "MYCODE": { "name": "My Artefact", "category": "Governance",
 *                 "multiInstance": true, "subdir": "my-artefacts" } }
 *
 * Schema per entry:
 *   name          Display name.
 *   category      Grouping for reports.
 *   multiInstance Allocates a -NNN- sequence (one file per instance).
 *   subdir        Subdirectory under the project for multi-instance types.
 *   command       The /govkit:* command or skill that writes it.
 *   extensions    File extensions allowed for the type (default ['.md']). Non-.md
 *                 files are companions of the .md with the same stem, e.g.
 *                 diagrams/GOV-001-DGRM-001-v1.0.drawio beside ...-v1.0.md.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const PREFIX = 'GOV';

export const DOC_TYPES = {
  GMOD: { name: 'Governance Operating Model',     category: 'Governance', command: 'operating-model' },
  APPL: { name: 'Framework Applicability',        category: 'Governance', command: 'applicability' },
  ASMT: { name: 'Framework Assessment',           category: 'Assurance',  command: 'assess',   multiInstance: true, subdir: 'assessments' },
  XWLK: { name: 'Framework Crosswalk',            category: 'Governance', command: 'crosswalk' },
  CTRL: { name: 'Control Register',               category: 'Assurance',  command: 'controls' },
  EVID: { name: 'Evidence Register',              category: 'Assurance',  command: 'evidence' },
  GATE: { name: 'Stage Gate Review',              category: 'Assurance',  command: 'gate',      multiInstance: true, subdir: 'gates' },
  EXCP: { name: 'Policy Exception',               category: 'Governance', command: 'exception', multiInstance: true, subdir: 'exceptions' },
  BRPT: { name: 'Governance Board Report',        category: 'Reporting',  command: 'board-report', multiInstance: true, subdir: 'board-reports' },
  DGRM: { name: 'Architecture Diagram (draw.io)', category: 'Architecture', command: 'diagram',  multiInstance: true, subdir: 'diagrams',
          extensions: ['.md', '.drawio', '.drawio.svg', '.drawio.png'] },
  TEAM: { name: 'Team Topology Design',           category: 'Governance', command: 'team-design',
          extensions: ['.md', '.json', '.drawio', '.drawio.svg', '.drawio.png'] },
};

/** File extensions the GOV filename convention covers (per type, `extensions`; default .md). */
export const EXTENSIONS = ['.md', '.json', '.drawio', '.drawio.svg', '.drawio.png'];

/** Merge built-in types with a project's .govkit/doc-types.json (built-ins win). */
export function loadDocTypes(projectRoot) {
  let custom = {};
  if (projectRoot) {
    try {
      custom = JSON.parse(readFileSync(join(projectRoot, '.govkit', 'doc-types.json'), 'utf8'));
    } catch {
      custom = {};
    }
  }
  const merged = { ...custom, ...DOC_TYPES };
  return {
    types: merged,
    known: new Set(Object.keys(merged)),
    multi: new Set(Object.entries(merged).filter(([, v]) => v.multiInstance).map(([k]) => k)),
    subdirs: Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v.multiInstance && v.subdir).map(([k, v]) => [k, v.subdir]),
    ),
  };
}
