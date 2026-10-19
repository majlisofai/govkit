#!/usr/bin/env node
/**
 * WCAG 2.x contrast check for brand colour pairs.
 *
 * Usage: check-contrast.mjs [--min 4.5] FG BG [FG BG ...] [--json]
 *   check-contrast.mjs '#111111' '#FFFFFF' '#CC3A1C' '#FFFFFF'
 *
 * Prints the ratio for each pair and exits 1 if any pair is below --min
 * (default 4.5, WCAG AA for body text; use 3 for large text and UI borders).
 * Colours are #RGB or #RRGGBB. Zero dependencies.
 */

const argv = process.argv.slice(2);
let min = 4.5;
let asJson = false;
const colours = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--min') min = Number(argv[++i]);
  else if (argv[i] === '--json') asJson = true;
  else colours.push(argv[i]);
}
if (colours.length === 0 || colours.length % 2) {
  console.error('Usage: check-contrast.mjs [--min 4.5] FG BG [FG BG ...] [--json]');
  process.exit(2);
}

function parse(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a hex colour: ${hex}`);
  const h = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export function contrast(fg, bg) {
  const [a, b] = [luminance(parse(fg)), luminance(parse(bg))].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const results = [];
try {
  for (let i = 0; i < colours.length; i += 2) {
    const ratio = contrast(colours[i], colours[i + 1]);
    results.push({ fg: colours[i], bg: colours[i + 1], ratio: Math.round(ratio * 100) / 100, pass: ratio >= min });
  }
} catch (e) {
  console.error(e.message);
  process.exit(2);
}

if (asJson) console.log(JSON.stringify({ min, results }, null, 2));
else for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.fg} on ${r.bg}  ${r.ratio.toFixed(2)}:1 (min ${min})`);
process.exit(results.every((r) => r.pass) ? 0 : 1);
