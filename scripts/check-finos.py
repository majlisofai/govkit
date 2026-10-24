#!/usr/bin/env python3
"""Check the govkit-finos module against the FINOS AI Governance Framework.

Reads the risk and mitigation frontmatter from finos/ai-governance-framework
at the commit in upstream/finos.lock.json (or --ref), and reports drift in
plugins/govkit-finos/frameworks/finos-aigf.yaml and
plugins/govkit-finos/references/risk-catalogue.yaml: identifiers, titles,
types, status, risk-to-mitigation links, ISO/IEC 42001 areas, external
references and citation URLs. Intents, summaries and triggers are GovKit's
own and are not compared.

    python3 scripts/check-finos.py                 # against the locked commit
    python3 scripts/check-finos.py --ref main      # what a re-pin would change

Needs network access, so it is not part of the commit checks. Set GH_TOKEN to
avoid GitHub's anonymous rate limit. Requires PyYAML. Exit 1 on any drift.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
MODULE = ROOT / "plugins" / "govkit-finos"
LOCK = json.loads((ROOT / "upstream" / "finos.lock.json").read_text())
REPO = LOCK["repo"].removeprefix("https://github.com/")
SITE = "https://air-governance-framework.finos.org"
GROUP = {"PREV": "Preventative", "DET": "Detective"}
CATEGORY = {"OP": "Operational", "SEC": "Security", "RC": "Regulatory and compliance"}
REFS = {"owasp-llm_references": "owasp-llm", "owasp-asi_references": "owasp-asi", "eu-ai-act_references": "eu-ai-act"}

drift: list[str] = []


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "govkit-check-finos"})
    if os.environ.get("GH_TOKEN") and "api.github.com" in url:
        req.add_header("Authorization", f"Bearer {os.environ['GH_TOKEN']}")
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def upstream(folder: str, ref: str) -> dict[str, dict]:
    """id -> frontmatter (plus _file) for every docs/<folder>/*.md at ref."""
    listing = json.loads(fetch(f"https://api.github.com/repos/{REPO}/contents/docs/{folder}?ref={ref}"))
    out = {}
    for entry in listing:
        if not entry["name"].endswith(".md"):
            continue
        text = fetch(f"https://raw.githubusercontent.com/{REPO}/{ref}/docs/{folder}/{entry['name']}").decode()
        fm = yaml.safe_load(text.split("---")[1])
        fm["_file"] = entry["name"][:-3]
        out[entry["name"].split("_")[0]] = fm
    return out


def same(where: str, field: str, ours, theirs) -> None:
    if ours != theirs:
        drift.append(f"{where}: {field} is {ours!r}, FINOS has {theirs!r}")


def iso_areas(refs: list[str] | None) -> list[str]:
    return sorted({f"A{r.split('-')[1]}" for r in refs or []}, key=lambda a: int(a[1:]))


def ids(items) -> list[str]:
    return sorted(items, key=lambda i: int(re.sub(r"\D", "", i)))


def main() -> None:
    ref = sys.argv[sys.argv.index("--ref") + 1] if "--ref" in sys.argv else LOCK["commit"]
    risks_up, mits_up = upstream("_risks", ref), upstream("_mitigations", ref)

    fw = yaml.safe_load((MODULE / "frameworks" / "finos-aigf.yaml").read_text())
    controls = {c["id"]: c for c in fw["controls"]}
    for mid in sorted(set(controls) ^ set(mits_up)):
        drift.append(f"finos-aigf: mitigation {mid} is {'only in GovKit' if mid in controls else 'missing'}")
    for mid in ids(set(controls) & set(mits_up)):
        c, m, where = controls[mid], mits_up[mid], f"finos-aigf {mid}"
        same(where, "title", c["title"], m["title"])
        same(where, "group", c["group"], GROUP[m["type"]])
        same(where, "obligation", c.get("obligation"), "draft" if m.get("doc-status") == "Draft" else "recommended")
        same(where, "mitigates", c["attributes"]["mitigates"].split(), m.get("mitigates") or [])
        same(where, "iso-iec-42001", (c.get("mappings") or {}).get("iso-iec-42001", []), iso_areas(m.get("iso-42001_references")))
        same(where, "citation_url", c.get("citation_url"), f"{SITE}/mitigations/{m['_file']}.html")

    inverse: dict[str, list[str]] = {}
    for mid, m in mits_up.items():
        for rid in m.get("mitigates") or []:
            inverse.setdefault(rid, []).append(mid)
    cat = yaml.safe_load((MODULE / "references" / "risk-catalogue.yaml").read_text())
    risks = {r["id"]: r for r in cat["risks"]}
    for rid in sorted(set(risks) ^ set(risks_up)):
        drift.append(f"risk-catalogue: risk {rid} is {'only in GovKit' if rid in risks else 'missing'}")
    for rid in ids(set(risks) & set(risks_up)):
        r, u, where = risks[rid], risks_up[rid], f"risk-catalogue {rid}"
        same(where, "title", r["title"], u["title"])
        same(where, "display_id", r["display_id"], f"AIR-{u['type']}-{u['sequence']:03d}")
        same(where, "category", r["category"], CATEGORY[u["type"]])
        same(where, "status", r["status"], "draft" if u.get("doc-status") == "Draft" else "approved")
        same(where, "mitigated_by", r["mitigated_by"], ids(inverse.get(rid, [])))
        same(where, "related_risks", r.get("related_risks", []), u.get("related_risks") or [])
        same(where, "external_refs", r.get("external_refs", {}), {v: u[k] for k, v in REFS.items() if u.get(k)})
        same(where, "citation_url", r.get("citation_url"), f"{SITE}/risks/{u['_file']}.html")
        for t in r["triggers"]:
            if t not in cat["triggers"]:
                drift.append(f"{where}: trigger '{t}' is not defined in triggers")

    for msg in drift:
        print(f"DRIFT {msg}")
    print(f"{len(drift)} difference(s) against {REPO}@{ref[:12]} "
          f"({len(risks_up)} risks, {len(mits_up)} mitigations upstream)")
    sys.exit(1 if drift else 0)


if __name__ == "__main__":
    main()
