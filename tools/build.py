"""Wrap landing.html (artifact body content) into a standalone index.html for static hosting."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
body = (root / "landing.html").read_text()
head = ('<!doctype html><html lang="lt"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta property="og:title" content="Kąsneliai – pirmoji lietuviška BLW programėlė">'
        '<meta property="og:description" content="Kasdienis kūdikio maitinimo planas, saugus patiekimas pagal amžių ir alergenai po vieną. Užsirašykite į laukiančiųjų sąrašą.">'
        '<meta property="og:image" content="https://kasneliai.lt/img/og.jpg"><meta property="og:url" content="https://kasneliai.lt/"><link rel="canonical" href="https://kasneliai.lt/"><link rel="icon" href="img/favicon.png">'
        '<script src="config.js"></script>'
        '</head><body>')
(root / "index.html").write_text(head + body + "</body></html>\n")
print("wrote", root / "index.html")

# Cloudflare Pages bundle: dist/ holds only what is served.
import shutil
dist = root / "dist"
shutil.rmtree(dist, ignore_errors=True)
dist.mkdir()
for name in ["index.html", "config.js"]:
    shutil.copy(root / name, dist / name)
shutil.copy(root / "deploy" / "_headers", dist / "_headers")
shutil.copytree(root / "img", dist / "img")
print("wrote", dist)
