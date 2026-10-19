#!/usr/bin/env node
/**
 * Render a GovKit team topology model as a draw.io team matrix:
 * stream-aligned teams as vertical columns, virtual chapters as horizontal
 * rows (one dot per member), platform team(s) below with their capabilities
 * and interaction mode, enabling / complicated-subsystem teams on the right,
 * an organisation summary and a legend.
 *
 * Usage: render-team-matrix.mjs MODEL.json -o OUT.drawio
 *
 * Layout is deterministic so a re-render after a model change only moves what
 * changed. Styles come from model.styles (the skill resolves them from the
 * brand's diagram style, notations.team); anything missing falls back to the
 * neutral defaults below. Zero dependencies.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const inFile = args.find((a) => !a.startsWith('-'));
const outIdx = args.indexOf('-o');
const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
if (!inFile || !outFile) {
  console.error('Usage: render-team-matrix.mjs MODEL.json -o OUT.drawio');
  process.exit(2);
}
const model = JSON.parse(readFileSync(inFile, 'utf8'));

const FONT = 'fontFamily=Helvetica;';
const DEFAULT_STYLES = {
  title: `text;html=1;align=center;verticalAlign=middle;fontSize=24;fontStyle=1;${FONT}`,
  subtitle: `text;html=1;align=center;verticalAlign=middle;fontSize=13;fontStyle=2;fontColor=#555555;${FONT}`,
  text: `text;html=1;align=left;verticalAlign=top;whiteSpace=wrap;fontSize=9;fontColor=#333333;${FONT}`,
  text_center: `text;html=1;align=center;verticalAlign=middle;whiteSpace=wrap;fontSize=9;fontColor=#555555;${FONT}`,
  boundary: `rounded=1;arcSize=3;dashed=1;fillColor=none;strokeColor=#333333;html=1;${FONT}`,
  stream_aligned: `rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#6C8EBF;verticalAlign=top;${FONT}`,
  stream_header: `rounded=0;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontStyle=1;fontSize=11;${FONT}`,
  mission: `rounded=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontSize=8;${FONT}`,
  chapter_rail: `rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;horizontal=0;fontStyle=1;fontSize=11;${FONT}`,
  chapter: `rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontStyle=1;fontSize=11;${FONT}`,
  chapter_cell: `rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontSize=14;${FONT}`,
  platform: `rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#82B366;verticalAlign=top;${FONT}`,
  platform_header: `text;html=1;align=center;verticalAlign=middle;fontStyle=1;fontSize=12;${FONT}`,
  capability: `rounded=1;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontStyle=1;fontSize=10;${FONT}`,
  enabling: `rounded=1;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontSize=10;${FONT}`,
  complicated_subsystem: `shape=hexagon;perimeter=hexagonPerimeter2;whiteSpace=wrap;html=1;size=0.12;fillColor=#F8CECC;strokeColor=#B85450;fontSize=10;${FONT}`,
  box: `rounded=0;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#666666;verticalAlign=top;align=left;spacingLeft=10;spacingTop=6;fontSize=10;${FONT}`,
  focal: 'strokeColor=#B85450;strokeWidth=3;',
  edge_x_as_a_service: `html=1;endArrow=block;endFill=1;dashed=1;strokeColor=#82B366;fontSize=10;labelBackgroundColor=#FFFFFF;${FONT}`,
  edge_collaboration: `html=1;endArrow=none;strokeWidth=3;strokeColor=#9673A6;opacity=60;fontSize=10;labelBackgroundColor=#FFFFFF;${FONT}`,
  edge_facilitating: `html=1;endArrow=open;dashed=1;dashPattern=1 3;strokeColor=#9673A6;fontSize=10;labelBackgroundColor=#FFFFFF;${FONT}`,
  edge_plain: `html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;endArrow=block;endFill=1;strokeColor=#333333;${FONT}`,
  dot: '●',
};
const S = { ...DEFAULT_STYLES, ...(model.styles || {}) };

const g = model.page?.grid || 10;
const snap = (v) => Math.round(v / g) * g;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// html=1 value: escape each part, join with an (escaped) <br>.
const lines = (...parts) => parts.filter((p) => p !== undefined && p !== null && p !== '').map(esc).join('&lt;br&gt;');
const bold = (s) => `&lt;b&gt;${esc(s)}&lt;/b&gt;`;
const italic = (s) => `&lt;i&gt;${esc(s)}&lt;/i&gt;`;

const cells = [];
const vertex = (id, value, style, x, y, w, h, parent = '1') =>
  cells.push(`<mxCell id="${id}" value="${value}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${snap(x)}" y="${snap(y)}" width="${snap(w)}" height="${snap(h)}" as="geometry"/></mxCell>`);
const edge = (id, value, style, source, target, points = []) =>
  cells.push(`<mxCell id="${id}" value="${value}" style="${style}" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry">${points.length ? `<Array as="points">${points.map(([x, y]) => `<mxPoint x="${snap(x)}" y="${snap(y)}"/>`).join('')}</Array>` : ''}</mxGeometry></mxCell>`);

const chapters = model.chapters || [];
const teams = model.teams || [];
const streams = teams.filter((t) => t.type === 'stream-aligned');
const platforms = teams.filter((t) => t.type === 'platform');
const others = teams.filter((t) => t.type === 'enabling' || t.type === 'complicated-subsystem');
const MODE_LABEL = { 'x-as-a-service': 'X-as-a-Service', collaboration: 'Collaboration', facilitating: 'Facilitating' };
const size = (t) => (t.members ? Object.values(t.members).reduce((a, b) => a + b, 0) : (t.size || 0));
const maxSize = model.rules?.team_size?.max;

// --- Geometry -----------------------------------------------------------------
const M = 40;
const RAIL_W = 30;
const CH_W = 150;
const COL_W = 130;
const GAP = 20;
const HEADER_H = 50;
const MISSION_H = 40;
const ROW_H = 60;
const CELL_H = 30;
const FOOT_H = 50;
// Interactions between non-platform teams and stream columns run in lanes
// above the stream boundary, so they never cross other columns.
const laneInteractions = (model.interactions || []).filter((i) => !(teams.find((t) => t.id === i.from)?.type === 'platform'));
const LANE = 20;
const top = 110 + laneInteractions.length * LANE + (laneInteractions.length ? 20 : 0);

const x0 = M + RAIL_W + 10 + CH_W + 40;
const rowsTop = top + HEADER_H + MISSION_H + 20;
const colH = HEADER_H + MISSION_H + 20 + chapters.length * ROW_H + FOOT_H;
const streamsRight = x0 + streams.length * COL_W + (streams.length - 1) * GAP;
const otherX = streamsRight + 50;
const W = Math.max(streamsRight + (others.length ? 230 : 40), 900);

// --- Title ---------------------------------------------------------------------
const subtitle = model.subtitle ||
  `${streams.length} Stream-Aligned Teams (Vertical) × ${chapters.length} Virtual Chapters (Horizontal)${maxSize ? ` – Max ${maxSize} per team` : ''}`;
vertex('tm-title', esc(model.title || 'Team Organization'), S.title, 0, 20, W, 40);
vertex('tm-subtitle', esc(subtitle), S.subtitle, 0, 60, W, 30);

// --- Chapters (rows) -------------------------------------------------------------
if (chapters.length) {
  vertex('tm-chapter-rail', esc('VIRTUAL CHAPTERS (Horizontal)'), S.chapter_rail, M, rowsTop - 10, RAIL_W, chapters.length * ROW_H);
}
chapters.forEach((c, r) => {
  const y = rowsTop + r * ROW_H;
  vertex(`tm-ch-${c.id}`, esc(c.name), S.chapter, M + RAIL_W + 10, y, CH_W, CELL_H);
  vertex(`tm-ch-${c.id}-note`, lines(c.scope, c.lead ? `Chapter Lead: ${c.lead}` : ''), S.text, M + RAIL_W + 10, y + CELL_H, CH_W + 20, ROW_H - CELL_H);
});

// --- Stream-aligned columns ------------------------------------------------------------
vertex('tm-streams', '', S.boundary, x0 - 20, top - 20, streamsRight - x0 + 40, colH + 40);
streams.forEach((t, k) => {
  const x = x0 + k * (COL_W + GAP);
  const focal = t.focal ? S.focal : '';
  vertex(`tm-${t.id}`, '', S.stream_aligned + focal, x, top, COL_W, colH);
  vertex(`tm-${t.id}-head`, lines(t.name, t.short).replace(/^/, '&lt;b&gt;') + '&lt;/b&gt;', S.stream_header, x, top, COL_W, HEADER_H);
  vertex(`tm-${t.id}-mission`, esc(t.mission || t.business_stream || ''), S.mission, x + 10, top + HEADER_H + 10, COL_W - 20, MISSION_H - 10);
  chapters.forEach((c, r) => {
    const n = t.members?.[c.id] || 0;
    const y = rowsTop + r * ROW_H;
    if (n > 0) vertex(`tm-${t.id}-${c.id}`, esc(S.dot.repeat(n)), S.chapter_cell, x + 20, y, COL_W - 40, CELL_H);
  });
  const fy = rowsTop + chapters.length * ROW_H;
  vertex(`tm-${t.id}-size`, italic(`Team: ${size(t)}`), S.text_center, x, fy, COL_W, 20);
  vertex(`tm-${t.id}-lead`, esc((t.leadership || []).join(' + ')), S.text_center, x, fy + 20, COL_W, 20);
});

// --- Enabling / complicated-subsystem teams (right) -------------------------------------
others.forEach((t, k) => {
  const h = 110;
  const y = top + k * (h + 20);
  const style = (t.type === 'enabling' ? S.enabling : S.complicated_subsystem) + (t.focal ? S.focal : '');
  const label = t.type === 'enabling' ? 'Enabling' : 'Complicated subsystem';
  vertex(`tm-${t.id}`, lines(t.name, t.short, `(${label}, ${size(t)})`), style, otherX, y, 180, h);
});

// --- Platform team(s) (below) ------------------------------------------------------------------
let y = top + colH + 100;
platforms.forEach((p, k) => {
  const caps = p.capabilities || [];
  const h = 150;
  const px = x0 - 20;
  const pw = streamsRight - x0 + 40;
  vertex(`tm-${p.id}`, '', S.platform + (p.focal ? S.focal : ''), px, y, pw, h);
  vertex(`tm-${p.id}-head`, bold(`${p.name}${p.short ? ` (${p.short})` : ''}`), S.platform_header, px, y + 5, pw, 30);
  const cw = caps.length ? (pw - 40 - (caps.length - 1) * 20) / caps.length : 0;
  caps.forEach((c, i) => vertex(`tm-${p.id}-cap-${i}`, lines(c.name, c.detail ? `(${c.detail})` : ''), S.capability, px + 20 + i * (cw + 20), y + 50, cw, 50));
  vertex(`tm-${p.id}-note`, italic(`${p.name}: ${size(p)} members (dedicated)`), S.text, px + 20, y + 110, 300, 20);
  const modes = [...new Set((model.interactions || []).filter((i) => i.from === p.id).map((i) => i.mode))];
  if (modes.length) vertex(`tm-${p.id}-mode`, esc(`Interaction Mode: ${modes.map((m) => MODE_LABEL[m]).join(', ')} to ${(model.interactions || []).some((i) => i.from === p.id && i.to === '*stream') ? 'all streams' : 'consumers'}`), S.text, px + 340, y + 110, 400, 20);
  // Chapters also span the platform when the platform staffs chapters.
  if (p.members && chapters.length && k === 0) {
    edge(`tm-${p.id}-chapters`, '', S.edge_plain, 'tm-chapter-rail', `tm-${p.id}`, [[M + RAIL_W / 2, y + h / 2]]);
  }
  y += h + 40;
});

// --- Interactions ------------------------------------------------------------------------------
const colX = (id) => {
  const k = streams.findIndex((t) => t.id === id);
  return k >= 0 ? x0 + k * (COL_W + GAP) + COL_W / 2 : null;
};
let lane = 0;
(model.interactions || []).forEach((i, n) => {
  const style = S[`edge_${i.mode.replace(/-/g, '_')}`] || S.edge_plain;
  const label = esc(MODE_LABEL[i.mode] || i.mode) + (i.until ? esc(` (until ${i.until})`) : '');
  const target = i.to === '*stream' ? 'tm-streams' : `tm-${i.to}`;
  const fromOther = others.find((t) => t.id === i.from);
  if (fromOther && colX(i.to) !== null) {
    // Leave the team's left side, climb to a lane above the boundary, run to
    // the target column, drop into its top edge.
    const k = others.indexOf(fromOther);
    const laneY = top - 40 - lane * LANE;
    lane++;
    edge(`tm-int-${n}`, label, `${style}edgeStyle=orthogonalEdgeStyle;rounded=0;exitX=0;exitY=0.5;entryX=0.5;entryY=0;`,
      `tm-${i.from}`, target, [[otherX - 20 - k * 10, top + k * 130 + 55], [otherX - 20 - k * 10, laneY], [colX(i.to), laneY]]);
  } else {
    edge(`tm-int-${n}`, label, style, `tm-${i.from}`, target);
  }
});

// --- Summary and legend --------------------------------------------------------------------------
const streamMembers = streams.reduce((a, t) => a + size(t), 0);
const leaders = streams.reduce((a, t) => a + (t.leadership || []).length, 0);
const otherMembers = [...platforms, ...others].reduce((a, t) => a + size(t), 0);
const summary = [
  bold(`${streams.length} Stream-Aligned Teams (vertical)`),
  esc(`${streamMembers} members across streams${maxSize ? ` (max ${maxSize} per team)` : ''}, each owning a business stream end-to-end`),
  bold(`${chapters.length} Virtual Chapters (horizontal)`),
  esc(chapters.map((c) => c.name.replace(/ Chapter$/, '')).join(' · ') + ' – cross-stream alignment'),
  ...platforms.map((p) => bold(`${p.name}: ${size(p)} members`)),
  ...(others.length ? [esc(`${others.length} enabling / complicated-subsystem team(s): ${others.reduce((a, t) => a + size(t), 0)} members`)] : []),
  bold(`Total: ${streamMembers + otherMembers + leaders} people (${streamMembers + otherMembers} team members + ${leaders} stream leadership)`),
].join('&lt;br&gt;');
const summaryLines = 6 + platforms.length + (others.length ? 1 : 0);
vertex('tm-summary', `${bold('Organization Summary')}&lt;br&gt;&lt;br&gt;${summary}`, S.box, x0 - 20, y + 20, 640, 30 + summaryLines * 15);

const legend = [
  ['Stream-Aligned Team', S.stream_header],
  ['Virtual Chapter', S.chapter],
  ...(platforms.length ? [['Platform Team', S.capability]] : []),
  ...(others.some((t) => t.type === 'enabling') ? [['Enabling Team', S.enabling]] : []),
  ...(others.some((t) => t.type === 'complicated-subsystem') ? [['Complicated Subsystem', S.complicated_subsystem]] : []),
];
const lx = Math.max(streamsRight - 280, x0 + 680);
vertex('tm-legend', bold('Legend'), `${S.box}align=center;spacingLeft=0;`, lx, y + 20, 300, 60 + Math.ceil(legend.length / 2) * 50);
legend.forEach(([name, style], i) => vertex(`tm-legend-${i}`, esc(name), `${style}fontStyle=0;fontSize=10;`, lx + 20 + (i % 2) * 140, y + 60 + Math.floor(i / 2) * 50, 120, 30));
vertex('tm-legend-dot', esc(`${S.dot} = Chapter Member`), S.text_center, lx + 20 + (legend.length % 2) * 140, y + 60 + Math.floor(legend.length / 2) * 50, 120, 30);

const pageH = y + 20 + 60 + Math.ceil(legend.length / 2) * 50 + 60;
const xml = `<mxfile host="govkit" agent="GovKit render-team-matrix">
  <diagram id="team-matrix" name="Team Matrix">
    <mxGraphModel grid="1" gridSize="${g}" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${snap(W + M)}" pageHeight="${snap(pageH)}" background="#FFFFFF" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
`;
writeFileSync(outFile, xml);
console.log(`${outFile}: ${streams.length} streams × ${chapters.length} chapters, ${platforms.length} platform, ${others.length} other team(s), ${cells.length} cells`);
