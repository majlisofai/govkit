#!/usr/bin/env bash
# Export a .drawio file with the draw.io desktop CLI, embedding the diagram so
# the output stays editable in draw.io (.drawio.svg / .drawio.png).
#
# Usage: export-drawio.sh FILE.drawio [svg] [png]     (default: svg)
#   FILE.drawio -> FILE.drawio.svg  (editable SVG)
#               -> FILE.drawio.png  (editable PNG, 2× scale)
#
# Exit 0 exported · 3 draw.io desktop not installed (caller should skip, not fail)
# · 1 export failed. Set DRAWIO_BIN to point at a non-standard install.
set -euo pipefail

in="${1:?usage: export-drawio.sh FILE.drawio [svg] [png]}"
shift || true
formats=("$@")
[ ${#formats[@]} -eq 0 ] && formats=(svg)

[ -f "$in" ] || { echo "No such file: $in" >&2; exit 1; }
case "$in" in *.drawio) ;; *) echo "Expected a .drawio file: $in" >&2; exit 1 ;; esac

bin="${DRAWIO_BIN:-}"
if [ -n "$bin" ] && [ ! -x "$bin" ]; then
  echo "DRAWIO_BIN=$bin is not an executable — skipped export." >&2
  exit 3
fi
if [ -z "$bin" ]; then
  for c in \
    "/Applications/draw.io.app/Contents/MacOS/draw.io" \
    "$HOME/Applications/draw.io.app/Contents/MacOS/draw.io" \
    "$(command -v drawio 2>/dev/null || true)" \
    "$(command -v draw.io 2>/dev/null || true)" \
    "/opt/drawio/drawio" \
    "/c/Program Files/draw.io/draw.io.exe"; do
    if [ -n "$c" ] && [ -x "$c" ]; then bin="$c"; break; fi
  done
fi
if [ -z "$bin" ]; then
  echo "draw.io desktop not found — skipped export. Install it from https://github.com/jgraph/drawio-desktop/releases or set DRAWIO_BIN." >&2
  exit 3
fi

# Linux CI has no display: draw.io needs xvfb there.
run=("$bin")
if [ "$(uname -s)" = "Linux" ] && [ -z "${DISPLAY:-}" ] && command -v xvfb-run >/dev/null; then
  run=(xvfb-run -a "$bin" --no-sandbox)
fi

for f in "${formats[@]}"; do
  case "$f" in
    svg) "${run[@]}" -x -f svg -e -o "$in.svg" "$in" >/dev/null 2>&1 && echo "$in.svg" ;;
    png) "${run[@]}" -x -f png -e -s 2 -o "$in.png" "$in" >/dev/null 2>&1 && echo "$in.png" ;;
    *) echo "Unknown format '$f' (svg|png)" >&2; exit 1 ;;
  esac || { echo "draw.io export to $f failed for $in" >&2; exit 1; }
done
