# CMS UI browser verification

## Verified execution

- Frontend: `node --test tests/frontend/*.test.mjs` — **24 tests passed**.
- `npm run types:check` — passed.
- `npm run build` — passed. Existing optional fontaine fallback warning remains non-blocking.
- Scoped Vite Plus lint/format checks — passed.
- Backend suite including panel routes, per-brand URL authorization and UI contract — **130 tests / 818 assertions passed**.
- PHPStan — zero errors. Pint and `git diff --check` — passed.

## Browser checks

Real installed Chrome headless against the running Laravel server at `http://127.0.0.1:8765/cms/demo`, desktop 1440×1000 and mobile 390×844. The browser wrapper timed out; verification used an isolated Playwright package in Hermes scratch, not a new application dependency.

**22 browser checks passed for the original CMS flows before URL workspaces were introduced**; detailed names in `results.json`. Current URL-workspace behavior is verified separately below:

- Exactly three brand cards with explicit demo notice.
- Required service form validation; create, edit, confirm delete with visible read-back.
- Dirty-form discard confirmation.
- Switching brands hides another brand's service.
- Dedicated demo localStorage persistence after reload.
- Selected-page editor creates and reads back section; confirmed page deletion.
- Navigation through Articles, Products, Banners, Properties, Guests, Profile, Settings, Users, Activity.
- Mobile drawer navigation and no horizontal document overflow.
- Anonymous `/cms` redirects to `/login`.
- Zero JavaScript/console errors; zero API mutation requests in demo.

Screenshots: `dashboard.png`, `page-editor.png`, `mobile.png`, `mobile-pages.png`. Mobile captures wait for the drawer transition to complete. Browser contexts are disposable; QA changes did not touch the application database or the user's normal browser storage.

## Fixed during QA

A browser-only validation bug in service-icon/domain patterns was reproduced, regression-tested and fixed: character-class literal hyphens now compile under HTML pattern Unicode-set semantics. Section heading/button-label input limits were aligned to the existing API (160/80) and regression-tested.

## Review regressions verified

The five functional review findings are fixed and regression-tested. Mounted browser checks that were RED before the fix are now GREEN:

- Actual demo: clearing all section text removes old config values; switching pages via the row arrow resets section pagination to 1 (`regression-results.json`).
- Explicit intercepted API fixtures: an editor can open a draft banner on page 925 outside the first 20-page picker batch; after successful POST and failed verification GET, retry sends GET only, with exactly one POST and an accurate saved/pending-verification notice (`mock-regression-results.json`). These fixture checks are not authenticated production API verification.
- Follow-up review found that company admins and super admins also need their existing off-picker banner parent preserved. Both mounted role regressions failed before the fix (empty selected `page_id` instead of 925) and passed after resolving the current parent for every role. Draft/archive restrictions remain conditional on editor permissions. Repeatable browser scenarios are retained in `tests/browser/cms-regressions.mjs`; provide `RBI_PLAYWRIGHT_PACKAGE` as the package.json path in the isolated Playwright installation, and optionally `RBI_QA_BASE_URL`.
- Frontend section lengths match API heading 160, button label 80, text 10000. A real backend SQLite contract test accepts explicit nullable cleared config and confirms read-back.

## Per-brand URL workspaces

`tests/browser/cms-workspace.mjs` passed against the actual Laravel demo UI. `workspace-results.json` records direct navigation to all three slugs, per-brand service isolation, refresh retention, root card navigation, top-left workspace switching on desktop/mobile, and no JavaScript errors or live API requests. Screenshot: `brand-workspace.png`.

Backend tests verify login enforcement, selected-brand props, membership restrictions, superadmin access, missing/deleted brands, and the exact three demo slugs. Demo browser checks are not a claim of authenticated live database CRUD.

## Limits

Authenticated live browser CRUD has not been exercised because no saved operator login was provided. Live adapter behavior is tested using explicitly controlled test responses, not claimed as production data. Demo browser checks verify actual UI behavior. No application database migrations, seed operations, or real user creation were performed.
