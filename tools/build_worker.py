"""Bundle dist/ into one Cloudflare Worker module (worker/worker.js) with the waitlist API."""
import base64, json, mimetypes, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
dist = root / "dist"
types = {".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".webp": "image/webp",
         ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml"}
files = {}
for f in sorted(dist.rglob("*")):
    if f.is_file() and f.name != "_headers":
        rel = "/" + f.relative_to(dist).as_posix()
        files[rel] = [types.get(f.suffix, mimetypes.guess_type(f.name)[0] or "application/octet-stream"),
                      base64.b64encode(f.read_bytes()).decode()]
api = (root / "worker" / "api.js").read_text()
out = root / "worker" / "worker.js"
out.write_text("const FILES = " + json.dumps(files) + ";\n" + api)
print("wrote", out, round(out.stat().st_size / 1024), "KB", len(files), "files")
