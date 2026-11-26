"""Rebuild the five static pages from shared HTML templates. Python 3, stdlib only."""
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "templates"
PAGES = [
    ("about", "index.html", "About Me", "Woan-Shiuan Chien (Winnie), Assistant Professor at NYCU and director of Social Lab. Biography, research interests and student opportunities."),
    ("research", "pages/research.html", "Research", "Multimodal signal processing for human-centered AI, from spoken interaction to health analytics and trustworthy AI."),
    ("experience", "pages/experience.html", "Experience", "Academic appointments, working experience, professional service, honors and invited talks by Woan-Shiuan Chien."),
    ("publication", "pages/publication.html", "Publications", "Dissertation, thesis, journal articles, conference papers and patents by Woan-Shiuan Chien."),
    ("contact", "pages/contact.html", "Contact", "Contact Professor Chien at NYCU, find the office or Social Lab and explore academic profiles."),
]

def template(name):
    return (TEMPLATES / (name + ".html")).read_text(encoding="utf-8")

NAV_ICONS = {"about": "about-me", "research": "research", "experience": "experience", "publication": "publications", "contact": "contact"}

def icon(name, root):
    return (f'<svg class="brand-icon" aria-hidden="true" focusable="false" viewBox="0 0 32 32">'
            f'<use href="{root}brand/icons.svg#{name}"></use></svg>')

def selected_awards():
    records = json.loads((ROOT / "data/honors.json").read_text(encoding="utf-8"))
    rows = []
    for record in records:
        if "selected" in record:
            award = record["selected"]
            rows.append(
                f'      <li><span class="period">{escape(award["period"])}</span>'
                f'<strong>{escape(award["title"])}</strong>'
                f'<span class="award-detail">{escape(award["detail"])}</span></li>'
            )
    return "\n".join(rows)

def build():
    profile = json.loads((ROOT / "data/profile.json").read_text(encoding="utf-8"))
    for key, path, title, description in PAGES:
        root = "../" if "/" in path else ""
        navigation = []
        for target, url, label, _ in PAGES:
            active = ' aria-current="page"' if target == key else ""
            navigation.append(f'<a href="{root}{url}" aria-label="{label}" title="{label}"{active}>{icon(NAV_ICONS[target], root)}<span>{label}</span></a>')
            if target == "publication":
                navigation.append(
                    '<a href="{{lab}}" target="_blank" rel="noopener" aria-label="Social Lab" title="Social Lab">'
                    '<img class="brand-icon nav-lab-logo" src="{{root}}brand/platforms/social-lab-logo-icon.png"'
                    ' width="676" height="474" alt=""><span>Social Lab</span></a>'
                )
        values = {
            **{k: escape(v, quote=True) for k,v in profile.items()},
            "selected_awards": selected_awards() if key == "experience" else "",
            "gallery_style": '    <link rel="stylesheet" href="css/gallery.css">' if key == "about" else "",
            "body": template(key), "root": root, "key": key, "title": title,
            "navigation": "\n".join(navigation), "description": description,
            "canonical": "https://woanshiuanchien.github.io/" + ("" if key=="about" else path),
            "profiles": template("profiles"), "sidebar": template("sidebar"), "footer": template("footer"),
            "map": template("map") if key=="contact" else "",
            "page_script": "" if key=="contact" else f'<script type="module" src="{root}js/{key}.js"></script>',
        }
        output = template("base")
        for _ in range(5):
            if "{{" not in output:
                break
            output = re.sub(r"\{\{(\w+)\}\}", lambda m: icon(m[1][5:].replace("_", "-"), root) if m[1].startswith("icon_") else values[m[1]], output)
        (ROOT / path).write_text(output, encoding="utf-8")

if __name__ == "__main__":
    build()
