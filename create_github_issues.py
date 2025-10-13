#!/usr/bin/env python3
import csv, os, subprocess, sys, shlex

REPO = os.environ.get("REPO") or (len(sys.argv) > 1 and sys.argv[1])
CSV_PATH = os.environ.get("CSV") or (len(sys.argv) > 2 and sys.argv[2]) or "IDMAR-backlog.csv"
DRY_RUN = os.environ.get("DRY_RUN", "0") == "1"

if not REPO:
    print("Usage: REPO=owner/name python3 create_github_issues.py [REPO] [CSV]\n", file=sys.stderr)
    sys.exit(1)

def run(cmd):
    print("$", cmd)
    if DRY_RUN:
        return ""
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print(res.stdout)
        print(res.stderr, file=sys.stderr)
        raise SystemExit(res.returncode)
    return res.stdout.strip()

# Auth check
try:
    run("gh auth status -h github.com")
except SystemExit:
    print("Erro: 'gh' não autenticado. Corre 'gh auth login' primeiro.", file=sys.stderr)
    sys.exit(1)

# Milestones set from CSV
milestones = set()
with open(CSV_PATH, newline='', encoding='utf-8') as f:
    r = csv.DictReader(f)
    for row in r:
        m = (row.get("Milestone") or "").strip()
        if m:
            milestones.add(m)

existing = run(f"gh api repos/{REPO}/milestones --paginate --jq '.[].title'")
existing_set = set(existing.splitlines()) if existing else set()
for m in milestones:
    if m not in existing_set:
        run(f"gh api repos/{REPO}/milestones -X POST -F title={shlex.quote(m)}")

# Issues
with open(CSV_PATH, newline='', encoding='utf-8') as f:
    r = csv.DictReader(f)
    for row in r:
        title = row["Issue Title"].strip()
        epic = row["Epic"].strip()
        desc = row["Description"].strip()
        prio = row["Priority"].strip()
        est  = row["Estimate (pts)"].strip()
        ms   = row["Milestone"].strip()
        labels = [f"Epic:{epic}", f"Priority:{prio}"]
        body = desc + "\\n\\n---\\n**Epic:** " + epic + "  \\n**Priority:** " + prio + "  \\n**Estimate:** " + est + " pts  \\n**Milestone:** " + ms + "\\n"
        cmd = ["gh", "issue", "create",
               "--repo", REPO,
               "--title", shlex.quote(title),
               "--body", shlex.quote(body)]
        if ms:
            cmd += ["--milestone", shlex.quote(ms)]
        if labels:
            cmd += ["--label", shlex.quote(",".join(labels))]
        run(" ".join(cmd))
print("Done.")
