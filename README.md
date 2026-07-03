# Cashback UA

Mobile-first PWA for quickly searching and comparing cashback offers from Ukrainian banks by merchant, service, or category words.

This repository is implemented phase by phase from `CODEX_PROJECT_PLAN.md`. Current product focus: a fast, convenient search experience. Settings and archive screens are intentionally deferred, while the JSON data structure keeps the fields needed to support them later.

## Stack

- React
- TypeScript with strict mode
- Vite
- React Router with `createHashRouter`
- Tailwind CSS
- shadcn/ui-compatible configuration
- Zod
- ESLint
- GitHub Actions
- GitHub Pages

## Development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Check the project:

```bash
npm run lint
npm run typecheck
npm run validate-data
npm run build
```

## Routes

The app uses hash routing so it works on GitHub Pages:

- `/#/`

## Deployment

`.github/workflows/deploy.yml` deploys `dist` to GitHub Pages after pushes to `main` using the official GitHub Pages actions.

The workflow runs `npm ci`, `npm run lint`, `npm run typecheck`, `npm run validate-data`, and `npm run build` before uploading `dist`.

## PWA

The app uses `vite-plugin-pwa` with `registerType: "prompt"`.

- Manifest is generated during `npm run build`.
- App shell, static data JSON, icons, and local bank logos are precached.
- The service worker does not silently reload the app.
- When a new deployment is available, the app shows: `Дані про кешбеки оновлено` with an `Оновити` button.
- Display mode is `standalone`.

## Data Structure

Static data lives in `public/data` and is loaded at runtime with `fetch`, so cashback data is not bundled into the main JavaScript chunk:

- `banks.json` - bank directory.
- `cards.json` - cards connected to banks.
- `categories.json` - cashback categories and MCC codes.
- `merchants.json` - merchant names, aliases, categories, and MCC codes.
- `offers/index.json` - available monthly offer periods.
- `offers/YYYY-MM.json` - monthly cashback offers.

TypeScript domain types are in `src/types/cashback.ts`. Zod schemas are in `src/schemas/data.ts`.

Current data includes July 2026 PUMB and monobank offers transcribed from screenshots. Add or update cashback data only from verified screenshots or sources before release.

## Adding Data

### Add a Bank

Add an item to `public/data/banks.json` with a unique lowercase `id`, display `name`, `slug`, logo path, and `active` flag.

### Add a Card

Add an item to `public/data/cards.json`. `bankId` must point to an existing bank. Include supported payment systems and whether the card supports own and credit funds.

### Add a Merchant

Add an item to `public/data/merchants.json`. `categoryIds` must point to existing categories. MCC codes are strings with exactly four digits.

### Add a Category

Add an item to `public/data/categories.json` with aliases and MCC codes. Use Ukrainian and English aliases where useful for search.

### Create a Monthly Offers File

Create `public/data/offers/YYYY-MM.json` with:

- `period` matching the filename.
- `updatedAt` as an ISO date-time with timezone offset.
- `offers` containing cashback offers.

Then add the period to `public/data/offers/index.json`.

Offer IDs must include the period, for example `pumb-2026-07-kims`.

## Validation

Run:

```bash
npm run validate-data
```

The validator checks duplicate IDs, missing bank/card/category/merchant references, MCC format, invalid dates, filename and period mismatch, offer IDs missing the period, invalid rewards, empty funding sources/channels, missing verification dates, and contradictory automatic activation rules.

Validation errors include the filename, entity ID, field, and human-readable message.

## Search

The main screen searches current-month offers and shows one ranked result list. The app does not infer whether a cashback is personally activated for the user.

Search supports merchant names, merchant aliases, category names, category aliases, and bank names. MCC codes stay in the data model for validation and offer details, but are not used as a user-facing search input.

## Month Rollover

Month rollover foundation lives in `src/lib/dates`, `src/lib/monthly-offers`, and `src/hooks`.

- `getPeriodKey(date)` uses local date methods and returns `YYYY-MM`.
- `formatUkrainianPeriod(period)` formats a period for Ukrainian UI labels.
- `getCurrentMonthOffers(period)` loads `public/data/offers/index.json` and the current monthly JSON file with `fetch`.
- Missing current-month data returns an explicit `missing` result and the latest available archive period.
- `useCurrentPeriod()` checks the month on application start, window focus, and `visibilitychange`.

## MVP Limitations

- Data is maintained manually in JSON files.
- No backend, database, authentication, or external bank API is used.
- Cashback offer data is manually transcribed and needs ongoing verification against current bank screens or sources.
- Some MCC mappings are practical starting values for search and validation and may need editorial refinement.
- No user settings, personalized card selection, or archive UI is currently shipped.

## Phase Notes

Phase 1 created the application shell, strict TypeScript setup, Tailwind/shadcn foundation, and GitHub Pages deployment workflow.

Phase 2 added domain types, Zod schemas, JSON data structure, and the data validation script.

Phase 3 adds local period helpers, runtime monthly offer loading, missing-current-month detection, and hooks/services for current-month UI work.

Phase 4 originally added Settings UI for banks, cards, and current-month cashback activation. This UI has been removed from the current product slice to keep focus on search.

Phase 5 adds reusable business logic for MiniSearch indexing, search relevance, offer evaluation, reward comparison, and sorting.

Phase 6 adds the main Search page UI with a single search input, ranked results, compact offer cards, and empty states.

Phase 7 originally added the Archive page for browsing monthly offer JSON files. This UI has been removed from the current product slice; monthly JSON files still keep period-based structure for a future archive.

Phase 8 adds PWA installability, local icons, cached static assets, offline app shell support, and the deployment update prompt.
