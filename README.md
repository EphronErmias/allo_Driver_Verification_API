# Allo Driver Verification API docs

Static Next.js site for the partner **HTTPS** driver-verify contract. No database. No env vars. Copyable backend snippets live on `/auth`.

Partner-neutral by design: the pages say `{PARTNER}`, never a specific platform name.

A copy of this site also lives in the Allo app repo under `partner-api-docs/`. This repo is the Vercel deploy source.

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
```

Writes a static site to `out/`.

## Vercel

Import this GitHub repo as a **new** Vercel project (do not reuse the storefront or admin projects).

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root Directory | `.` (repo root) |
| Build command | `npm run build` |
| Output | static export (`out/`) |
| Environment variables | none |

## AI / crawlers

- [`/llms.txt`](./public/llms.txt) — index
- [`/spec.md`](./public/spec.md) — full markdown contract
- HTML pages use one `h1` per route, tables, and `<pre><code>`

## Edit the spec

Change [`content/spec.ts`](./content/spec.ts) and keep [`public/spec.md`](./public/spec.md) in the same commit.
