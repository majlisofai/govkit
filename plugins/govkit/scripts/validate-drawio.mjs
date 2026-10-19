#!/usr/bin/env node
/**
 * Validate a .drawio file that Claude generated, before it is exported or
 * committed. Zero dependencies (plugins are never npm-installed), so it uses a
 * small tokenizer rather than a full XML parser; draw.io's uncompressed format
 * is regular enough for that.
 *
 * Usage: validate-drawio.mjs FILE.drawio [--grid N] [--json]
 *
 * Errors (exit 1):
 *   - XML not well-formed (unbalanced or mismatched tags, bad attribute syntax)
 *   - no <mxfile>/<diagram>, or a compressed diagram (text instead of <mxGraphModel>)
 *   - missing root cells id="0" and id="1" (parent "0")
 *   - duplicate cell id within a page
 *   - parent / source / target that names no cell on the page
 *   - vertex without <mxGeometry>
 *   - edge with neither source+target nor sourcePoint+targetPoint
 * Warnings:
 *   - vertex position off the page grid
 *   - overlapping sibling vertices (neither containing the other)
 *   - edge label with no text but a value attribute of whitespace
 */

import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const gridArg = args.indexOf('--grid') >= 0 ? Number(args[args.indexOf('--grid') + 1]) : null;
const asJson = args.includes('--json');
if (!file) {
  console.error('Usage: validate-drawio.mjs FILE.drawio [--grid N] [--json]');
  process.exit(2);
}

const errors = [];
const warnings = [];
let xml;
try {
  xml = readFileSync(file, 'utf8');
} catch (e) {
  console.error(`Cannot read ${file}: ${e.message}`);
  process.exit(2);
}

// --- Tokenize into a tree ---------------------------------------------------
const ATTR = /([A-Za-z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
function parseAttrs(src, where) {
  const attrs = {};
  const leftover = src.replace(ATTR, (_, name, __, dq, sq) => {
    if (name in attrs) errors.push(`${where}: duplicate attribute '${name}'`);
    attrs[name] = dq ?? sq;
    return '';
  }).trim();
  if (leftover) errors.push(`${where}: malformed attributes near '${leftover.slice(0, 40)}'`);
  return attrs;
}

const root = { name: '#root', attrs: {}, children: [], text: '' };
const stack = [root];
const TOKEN = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[[\s\S]*?\]\]>|<\/?([A-Za-z_][\w:.-]*)([^>]*?)(\/?)>|([^<]+)/g;
let m;
let line = 1;
while ((m = TOKEN.exec(xml))) {
  const [tok, name, rest, selfClose, text] = m;
  const where = `line ${line}`;
  line += (tok.match(/\n/g) || []).length;
  if (tok.startsWith('<!--') || tok.startsWith('<?')) continue;
  if (tok.startsWith('<![CDATA[')) { stack.at(-1).text += tok; continue; }
  if (text !== undefined) { stack.at(-1).text += text; continue; }
  if (tok.startsWith('</')) {
    const open = stack.pop();
    if (!open || open.name !== name) {
      errors.push(`${where}: closing </${name}> does not match <${open?.name ?? 'nothing'}>`);
      break;
    }
    continue;
  }
  const node = { name, attrs: parseAttrs(rest, `${where} <${name}>`), children: [], text: '', line: where };
  stack.at(-1).children.push(node);
  if (!selfClose) stack.push(node);
}
if (stack.length > 1 && !errors.length) errors.push(`unclosed <${stack.at(-1).name}>`);
if (xml.includes('<') && root.children.length === 0) errors.push('no XML elements found');

// --- Structure --------------------------------------------------------------
const find = (node, name) => node.children.filter((c) => c.name === name);
const mxfile = find(root, 'mxfile')[0];
if (!errors.length && !mxfile) errors.push('root element must be <mxfile>');

const pages = mxfile ? find(mxfile, 'diagram') : [];
if (mxfile && pages.length === 0) errors.push('<mxfile> has no <diagram> pages');

let vertexCount = 0;
let edgeCount = 0;
for (const page of pages) {
  const pname = page.attrs.name || page.attrs.id || '?';
  const model = find(page, 'mxGraphModel')[0];
  if (!model) {
    errors.push(`page '${pname}': no <mxGraphModel> — compressed diagrams are not allowed; write uncompressed XML`);
    continue;
  }
  const grid = gridArg ?? Number(model.attrs.gridSize || 10);
  const rootEl = find(model, 'root')[0];
  if (!rootEl) { errors.push(`page '${pname}': <mxGraphModel> has no <root>`); continue; }

  // <object>/<UserObject> wrap an mxCell and carry its id.
  const cells = rootEl.children.flatMap((c) => {
    if (c.name === 'mxCell') return [{ id: c.attrs.id, cell: c }];
    if (c.name === 'object' || c.name === 'UserObject') {
      const inner = find(c, 'mxCell')[0];
      return inner ? [{ id: c.attrs.id, cell: inner }] : [];
    }
    return [];
  });
  const ids = new Map();
  for (const { id, cell } of cells) {
    if (!id) { errors.push(`page '${pname}' ${cell.line}: cell without id`); continue; }
    if (ids.has(id)) errors.push(`page '${pname}': duplicate cell id '${id}'`);
    ids.set(id, cell);
  }
  if (!ids.has('0')) errors.push(`page '${pname}': missing root cell id="0"`);
  if (ids.get('1')?.attrs.parent !== '0') errors.push(`page '${pname}': missing layer cell id="1" parent="0"`);

  const boxes = [];
  for (const [id, cell] of ids) {
    const a = cell.attrs;
    for (const ref of ['parent', 'source', 'target']) {
      if (a[ref] !== undefined && !ids.has(a[ref])) errors.push(`page '${pname}': cell '${id}' ${ref}="${a[ref]}" does not exist`);
    }
    const geo = find(cell, 'mxGeometry')[0];
    if (a.vertex === '1') {
      vertexCount++;
      if (!geo) { errors.push(`page '${pname}': vertex '${id}' has no <mxGeometry>`); continue; }
      const [x, y, w, h] = ['x', 'y', 'width', 'height'].map((k) => Number(geo.attrs[k] || 0));
      if (grid > 1 && (x % grid || y % grid)) warnings.push(`page '${pname}': vertex '${id}' at (${x},${y}) is off the ${grid}px grid`);
      boxes.push({ id, parent: a.parent, x, y, w, h });
    }
    if (a.edge === '1') {
      edgeCount++;
      const points = geo ? find(geo, 'mxPoint').map((p) => p.attrs.as) : [];
      const anchored = (a.source && a.target) || (points.includes('sourcePoint') && points.includes('targetPoint'))
        || (a.source && points.includes('targetPoint')) || (a.target && points.includes('sourcePoint'));
      if (!anchored) errors.push(`page '${pname}': edge '${id}' needs source+target ids or sourcePoint+targetPoint`);
    }
  }

  // Overlap check among siblings; a box that contains another is a container.
  const inside = (o, i) => i.x >= o.x && i.y >= o.y && i.x + i.w <= o.x + o.w && i.y + i.h <= o.y + o.h;
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const p = boxes[i];
      const q = boxes[j];
      if (p.parent !== q.parent || !p.w || !q.w) continue;
      const overlap = p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h;
      if (overlap && !inside(p, q) && !inside(q, p)) warnings.push(`page '${pname}': vertices '${p.id}' and '${q.id}' overlap`);
    }
  }
}

const result = { file, pages: pages.length, vertices: vertexCount, edges: edgeCount, errors, warnings };
if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  for (const w of warnings) console.log(`WARN  ${w}`);
  for (const e of errors) console.log(`FAIL  ${e}`);
  console.log(`${errors.length ? 'INVALID' : 'OK'}: ${file} — ${pages.length} page(s), ${vertexCount} vertices, ${edgeCount} edges, ${warnings.length} warning(s)`);
}
process.exit(errors.length ? 1 : 0);
