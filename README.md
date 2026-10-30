# Novel Platform

A single-novel publishing and reading application built with Next.js. Visitors can read without an account. Reader accounts provide progress tracking, a bookmark, chapter notifications, and review history. Administration uses a separate password.

[Live website](https://novel-platform-alpha.vercel.app)

## Features

- Novel overview, cover image, and paginated chapter list.
- Chapter navigation, light/dark themes, font selection, and reading layout controls.
- Email/password and Google authentication through Supabase Auth.
- Per-reader progress, one saved bookmark, and in-app notifications for new chapters.
- Novel-wide ratings and reviews; authentication required for new submissions.
- Administration for novel details, cover uploads, drafts, publishing, and review moderation.

The application manages one novel. Reader accounts do not grant administrative access.

## Stack

| Component | Technology |
| --- | --- |
| Application | Next.js 16.4.2, React 19.3.1, TypeScript, Tailwind CSS 4 |
| Runtime | Node.js 22.x |
| Database | Supabase PostgreSQL with Postgres.js |
| Reader authentication | Supabase Auth |
| Cover storage | Vercel Blob |
| Hosting | Vercel, Singapore region |
| Tests | Node.js test runner and Playwright with Microsoft Edge |

Development and builds use Webpack. Run Node.js directly; do not build Docker images on the project owner's machine.

## Getting started

Requirements: Node.js 22.13 or later within the 22.x release line, npm, and access to the existing Vercel project.

```powershell
npm ci
npx --cache .local/npm-cache --yes vercel@64.5.0 login
npx --cache .local/npm-cache --yes vercel@64.5.0 link --yes --scope nguyenlionel --project novel-platform
npx --cache .local/npm-cache --yes vercel@64.5.0 env pull .env.local --yes --scope nguyenlionel
npm run env:check
npm run dev
```

Open [localhost:3000](http://localhost:3000). Pull Development variables for local work. Use the existing project; do not provision another database or use Production credentials for development.

### Environment variables

See [.env.example](.env.example). Store local values in `.env.local` and deployment values in Vercel.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Supabase transaction-pooler connection using the environment's application role |
| `DATABASE_SCHEMA` | `novel_preview` for Development/Preview; `novel_production` for Production |
| `ADMIN_PASSWORD_HASH` | Admin password hash in `scrypt:SALT_HEX:HASH_HEX` format |
| `SESSION_SECRET` | Admin session secret, at least 32 characters |
| `RATE_LIMIT_SECRET` | Separate secret for hashing rate-limit identifiers, at least 32 characters |
| `BLOB_READ_WRITE_TOKEN` | Server-side Vercel Blob token |
| `NEXT_PUBLIC_SUPABASE_URL` | Public URL of the existing Supabase project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |

The Supabase project is `novel-platform` (`fbtpriygrhtalsblzbhh`). Google Client Secret belongs in Supabase provider settings. The application does not require a service-role key. Keep credentials out of source files, logs, and commits; `.env.local` and `.local/` are ignored by Git and deployment.

Google redirects, email confirmation, and SMTP configuration are documented in [Reader accounts](docs/READER_ACCOUNTS.md).

## Usage

### Reading

Open the home page to select a published chapter. The chapter toolbar provides the table of contents, reading preferences, and a shortcut to the end of the chapter.

DejaVu Serif is bundled with the application. Times New Roman uses the device's installed font, with DejaVu Serif as fallback. Font, size, theme, line spacing, paragraph spacing, and content width are stored under `novel-reading-v1` in `localStorage`.

Each LF, CRLF, or CR starts a paragraph. Blank lines do not create empty paragraphs. Paragraphs use a 2em first-line indent; display formatting does not alter stored chapter text.

Signed-in readers can submit reviews and save one bookmark. Returning to the bookmarked chapter requires removing that bookmark before continuing. Progress reaches Read at 90% of chapter content; the review section is excluded. Chapter notifications are in-app only.

Text selection, copy/cut, dragging, and the context menu are restricted within chapter content. Forms remain editable. These restrictions cannot prevent content extraction, screenshots, or OCR.

### Administration

Open `/admin` and use the password for the selected environment. Local access details are stored in the ignored `.local/admin-access.txt` file. Preview and Production passwords differ.

1. Update novel details and select a cover image. Upload occurs when saving the form.
2. Add a chapter and save it as a draft or publish it.
3. Save edits to published chapters to make them public immediately, or unpublish them to return to draft.
4. Confirm chapter deletion when prompted. Hide unwanted reviews from the review list.

Saving is manual. Unsaved edits trigger navigation warnings. When a session expires, sign in again in the dialog and retry saving; edits remain on the current page. Closing the browser without saving loses those edits. Admin sessions expire after eight hours; changing the password hash invalidates existing sessions.

## Testing

```powershell
npm run env:check
npm run lint
npm run typecheck
npm test
npm run build
```

Integration checks use the configured services:

| Command | Effect |
| --- | --- |
| `npm run db:verify` | Checks database access and schema isolation; test writes are rolled back |
| `npm run blob:verify` | Uploads, inspects, and deletes a temporary image |
| `npm run test:e2e` | Runs browser tests against `http://localhost:3100` using Microsoft Edge |

Start the server separately with `npm run dev -- --port 3100` before E2E tests. Account and review tests require two dedicated, confirmed Supabase Auth users in `.local/reader-test-accounts.json`; see [test setup](docs/READER_ACCOUNTS.md).

Run integration tests against Preview when no one else is editing its data. E2E tests enforce `DATABASE_SCHEMA=novel_preview`. Test reviews are hidden and recorded in `.local/reader-review-fixtures.json`; administrative cleanup must delete only those UUIDs because the application role cannot delete reviews.

`GET /api/health` returns `{"status":"ok"}` when the novel record is accessible, or HTTP 503 otherwise.

## Data and deployment

Development and Preview use `novel_preview`; Production uses `novel_production`. Each schema has a separate application role and RLS. Reader identities share the project's Supabase Auth service; reader profiles and activity are stored separately in each schema.

Server queries use `withDb` in `src/lib/db/client.ts`. Each callback reserves a connection, awaits statements sequentially, and releases the connection. Do not pipeline queries on the same connection or set `max_pipeline: 0`. The transaction-pooler connection disables prepared statements and verifies TLS with the bundled public CA.

Migrations are stored in `supabase/migrations/` and have been applied to the existing cloud project. Do not run `supabase start` or `db reset` for this setup. Production contains user-entered content; do not copy Preview data into it or restore the empty state described in early reports.

For an authorized deployment, use:

```powershell
# Preview
npx --cache .local/npm-cache --yes vercel@64.5.0 deploy --yes --scope nguyenlionel --project novel-platform

# Production
npx --cache .local/npm-cache --yes vercel@64.5.0 deploy --prod --yes --scope nguyenlionel --project novel-platform
```

Verify the deployment target and status after deployment. Preview and snapshot URLs retain Vercel Authentication; the main Production URL is public.

## Status and known issues

Reader accounts were deployed on October 25, 2026. The following items remain open in the recorded handover; they were not reverified during the October 30 documentation update:

- Google authentication reached Google's sign-in page, but a later attempt returned to `localhost:3000`. The owner chose to update Supabase Site URL and Redirect URLs; a complete sign-in still requires confirmation.
- Custom SMTP and confirmation-email delivery to a real mailbox have not been verified.
- The October 25 dependency audit reported four high-severity findings in the `@vercel/blob → @vercel/oidc → @vercel/cli-config → zod` chain (`GHSA-mrhx-c7xc-m3w5`). No dependency update has been applied.
- Mobile checks used Edge device emulation. Physical iPhone and Android testing remains pending.

See [PLAN.md](PLAN.md) for acceptance criteria, remaining work, and the current handover.

## Documentation

- [Project plan and handover](PLAN.md)
- [UI specification](docs/UI_SPEC.md)
- [Reader account configuration](docs/READER_ACCOUNTS.md)
- [Foundation report](docs/STAGE_2_REPORT.md)
- [Administration report](docs/STAGE_3_REPORT.md)
- [Reading report](docs/STAGE_4_REPORT.md)
- [Reviews and fonts report](docs/STAGE_5_REPORT.md)
- [Reader revision report](docs/READER_REVISION_REPORT.md)
- [Initial release report](docs/STAGE_6_REPORT.md)
- [Font source and license](src/assets/fonts/README.md)
- [Repository instructions](AGENTS.md)

Stage reports describe historical releases. Current requirements and status are recorded in PLAN.md.
