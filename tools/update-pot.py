#!/usr/bin/env python3
#
# update-pot.py: regenerate po/gTile@OhMyDebn.pot from the current
# translatable strings, then merge every po/*.po against it.
#
# Mirrors what Cinnamon's own `cinnamon-xlet-makepot -j` extracts, using
# only xgettext and the Python standard library (makepot itself needs
# python3-polib, which isn't a dependency of anything else here):
#   - _("...") calls in 5.4/*.js (via xgettext, JavaScript mode)
#   - settings-schema.json: every "description", "tooltip", "units" and
#     "title" under a settings key, plus each combobox "options" label
#     (skipping "custom"), plus column titles/units of list settings
#   - metadata.json: "name", "description", "comments", "contributors"
# Reference comments use makepot's "path->key->field" form so the two
# tools' output stays interchangeable.
#
# Run from anywhere: `python3 tools/update-pot.py`. Re-run after editing
# any user-facing string - a changed msgid otherwise silently loses its
# translations in every language (gettext matches on the exact msgid).
# msgmerge keeps existing translations, marks near-matches fuzzy for a
# translator to confirm, and (here) drops entries whose string no longer
# exists rather than carrying them as commented-out "#~" clutter.

import json
import os
import subprocess
import sys
from collections import OrderedDict
from datetime import datetime, timezone

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
XLET_VERSION_DIR = "5.4"
POT = os.path.join(REPO, "po", "gTile@OhMyDebn.pot")


def po_escape(s):
    return s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n")


def po_string(s):
    # Multi-line strings are written the way gettext tools do: an empty
    # first line, then one quoted line per source line.
    if "\n" in s.rstrip("\n") or s.endswith("\n"):
        parts = s.split("\n")
        lines = ['""']
        for i, part in enumerate(parts):
            if i < len(parts) - 1:
                lines.append('"%s\\n"' % po_escape(part))
            elif part:
                lines.append('"%s"' % po_escape(part))
        return "\n".join(lines)
    return '"%s"' % po_escape(s)


entries = OrderedDict()  # msgid -> {"refs": [], "comments": []}


def add(msgid, comment):
    if not isinstance(msgid, str) or not msgid.strip():
        return
    e = entries.setdefault(msgid, {"refs": [], "comments": []})
    if comment not in e["comments"]:
        e["comments"].append(comment)


def extract_settings(data, path, parent=""):
    for key, value in data.items():
        if parent:
            if key in ("description", "tooltip", "units", "title"):
                add(value, "%s->%s->%s" % (path, parent, key))
            elif key == "options" and isinstance(value, dict):
                for label, opt in value.items():
                    if opt == "custom":
                        continue
                    add(label, "%s->%s->%s" % (path, parent, key))
            elif key == "columns" and isinstance(value, list):
                for col in value:
                    for col_key in ("title", "units"):
                        if col_key in col:
                            add(col[col_key], "%s->%s->columns->%s" % (path, parent, col_key))
        if isinstance(value, dict):
            extract_settings(value, path, key)


def extract_metadata(data, path):
    for key in ("name", "description", "comments"):
        if key in data:
            add(data[key], "%s->%s" % (path, key))
    if "contributors" in data:
        values = data["contributors"]
        if isinstance(values, str):
            values = values.split(",")
        for v in values:
            add(v.strip(), "%s->contributors" % path)


# 1. JS strings via xgettext, parsed back into `entries` so JS and JSON
#    references for the same msgid end up in one entry.
js_dir = os.path.join(REPO, XLET_VERSION_DIR)
js_files = sorted(f for f in os.listdir(js_dir) if f.endswith(".js"))
xg = subprocess.run(
    ["xgettext", "--language=JavaScript", "--from-code=UTF-8", "--keyword=_",
     "--omit-header", "--no-wrap", "--output=-"] + [os.path.join(XLET_VERSION_DIR, f) for f in js_files],
    cwd=REPO, capture_output=True, text=True, check=True)
refs, msgid_lines, in_msgid = [], None, False
for line in xg.stdout.splitlines() + [""]:
    if line.startswith("#:"):
        refs.extend(line[2:].split())
    elif line.startswith("msgid "):
        msgid_lines = [line[6:]]
        in_msgid = True
    elif in_msgid and line.startswith('"'):
        msgid_lines.append(line)
    elif line.startswith("msgstr") or line == "":
        if msgid_lines is not None:
            msgid = "".join(json.loads(p) for p in msgid_lines)
            if msgid:
                e = entries.setdefault(msgid, {"refs": [], "comments": []})
                e["refs"].extend(r for r in refs if r not in e["refs"])
        refs, msgid_lines, in_msgid = [], None, False

# 2. JSON strings, in file order.
with open(os.path.join(js_dir, "settings-schema.json")) as fp:
    extract_settings(json.load(fp, object_pairs_hook=OrderedDict), "%s->settings-schema.json" % XLET_VERSION_DIR)
with open(os.path.join(REPO, "metadata.json")) as fp:
    extract_metadata(json.load(fp, object_pairs_hook=OrderedDict), "metadata.json")

# 3. Write the template.
now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M%z")
out = [
    "# gTile@OhMyDebn translation template.",
    "# This file is distributed under the same license as the gTile@OhMyDebn package.",
    "#",
    "#, fuzzy",
    'msgid ""',
    'msgstr ""',
    '"Project-Id-Version: gTile@OhMyDebn\\n"',
    '"Report-Msgid-Bugs-To: https://github.com/dougburks/gTile-OhMyDebn/issues\\n"',
    '"POT-Creation-Date: %s\\n"' % now,
    '"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\\n"',
    '"Last-Translator: FULL NAME <EMAIL@ADDRESS>\\n"',
    '"Language-Team: LANGUAGE <LL@li.org>\\n"',
    '"Language: \\n"',
    '"MIME-Version: 1.0\\n"',
    '"Content-Type: text/plain; charset=UTF-8\\n"',
    '"Content-Transfer-Encoding: 8bit\\n"',
]
for msgid, e in entries.items():
    out.append("")
    for c in e["comments"]:
        out.append("#. %s" % c)
    if e["refs"]:
        out.append("#: %s" % " ".join(e["refs"]))
    out.append("msgid %s" % po_string(msgid))
    out.append('msgstr ""')
with open(POT, "w") as fp:
    fp.write("\n".join(out) + "\n")
print("wrote %s: %d strings" % (os.path.relpath(POT, REPO), len(entries)))

# 4. Merge every language file.
po_dir = os.path.join(REPO, "po")
for name in sorted(os.listdir(po_dir)):
    if not name.endswith(".po"):
        continue
    po = os.path.join(po_dir, name)
    subprocess.run(["msgmerge", "--update", "--backup=none", "--quiet", "--no-wrap", po, POT], check=True)
    subprocess.run(["msgattrib", "--no-obsolete", "--no-wrap", "-o", po, po], check=True)
    stats = subprocess.run(["msgfmt", "--check", "--statistics", "-o", "/dev/null", po],
                           capture_output=True, text=True)
    if stats.returncode != 0:
        print("%s: msgfmt FAILED\n%s" % (name, stats.stderr), file=sys.stderr)
        sys.exit(1)
    print("%-10s %s" % (name, stats.stderr.strip()))
