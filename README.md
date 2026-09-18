# cyc-afterhours

Personal site. The first public surface is a visual **Climbing Archive**: upload → R2 → D1 → Archive → Video Detail.

Local development defaults to mock data. Production uses Cloudflare Workers (via OpenNext), D1, and R2.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

`DATA_SOURCE=mock` (the default) means:

- climb metadata is stored in `.data/climbs.json`
- uploaded videos are stored in `.data/uploads/`

Open [http://localhost:3000](http://localhost:3000).

- `/` archive
- `/upload` upload
- `/climb/[id]` detail

## Cloudflare resources

Worker, D1, and R2 all use the project name `cyc-afterhours`.

### D1

```bash
npx wrangler login
npx wrangler d1 create cyc-afterhours
```

Put the returned database id into `wrangler.jsonc` (`d1_databases[0].database_id`) and `D1_DATABASE_ID` in `.env.local`.

Apply schema:

```bash
npm run db:migrate:local
npm run db:migrate
```

### R2

```bash
npx wrangler r2 bucket create cyc-afterhours
```

Create an [R2 API token](https://developers.cloudflare.com/r2/api/tokens/) with Object Read & Write. Set:

```text
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME=cyc-afterhours
```

Allow browser PUT/GET from the site origin:

```bash
npx wrangler r2 bucket cors set cyc-afterhours --file schema/r2-cors.json
```

Update `schema/r2-cors.json` with the production origin before going live.

Optional: `R2_PUBLIC_BASE_URL` if the bucket has a public custom domain. Otherwise the Worker issues signed GET URLs.

## Production

`wrangler.jsonc` already sets `DATA_SOURCE=cloudflare`. Production origin is `https://afterhours.cyc-studio.com`.

Set Worker secrets once:

```bash
npx wrangler secret put R2_ACCOUNT_ID
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
npx wrangler secret put R2_BUCKET_NAME
npx wrangler secret put ADMIN_PASSWORD
```

Requires Node.js 22+ for Wrangler 4 / OpenNext preview and deploy. `npm run dev` with mock data works on Node 20.

### Code vs data

| What changed | How it goes live |
|---|---|
| Pages, styles, app code | Push to `main`. Cloudflare Worker Builds deploys automatically. |
| Local mock climbs (`.data/climbs.json` + `.data/uploads`) | `node scripts/push-local-climbs.mjs` |
| Local posters | `node scripts/backfill-posters.mjs` |
| Upload while logged in on production | Already in R2 + D1. Nothing else to run. |
| D1 schema | `npm run db:migrate` |

`.data/` is gitignored. A git push never uploads videos or climb records.

`npm run deploy` rebuilds and publishes the Worker from this machine. It is the same **code** deploy as Worker Builds, not a data sync. Skip it when auto-deploy from `main` is working.

Push local mock climbs to production R2 + D1:

```bash
node scripts/push-local-climbs.mjs
```

That script copies video files to R2 and `INSERT OR IGNORE`s rows into D1. It does not update existing rows. Generate and upload posters with `node scripts/backfill-posters.mjs`.

Product brief: [`docs/project-brief.md`](docs/project-brief.md)
