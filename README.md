
## Deploy
`python3 tools/build.py && python3 tools/build_worker.py` writes `worker/worker.js` (all files embedded).
Upload it as the `kasneliai` Worker with bindings `DB` (D1 `kasneliai-waitlist`) and secret `EXPORT_KEY`.
Signups download: `https://kasneliai.lt/api/export?key=<EXPORT_KEY>`. Table schema: `schema.sql`.
