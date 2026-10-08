# Acala CMS UI verification

## Scope

Mounted React Acala driver against the running Laravel application, using explicitly intercepted private API responses from `database/data/acala/source.json` and the actual backend `AcalaDefinition::get()` metadata. These checks are **not authenticated production database CRUD**.

## Passed browser scenarios

Command: `RBI_PLAYWRIGHT_PACKAGE=<isolated Playwright package.json> node tests/browser/cms-acala.mjs`.

1. Content initially fetches only `home` with `page_key=home`, `per_page=20`, not datasets/images. Detail GET populates original Acala fields. PATCH succeeds, a controlled verification GET fails, retry sends only GET, fields remain locked, and exactly one PATCH is observed. Choosing `about` loads only its blocks.
2. Dataset summaries load separately; a selected detail GET exposes the actual branch array JSON including Nusa Dua. Image slots paginate 20 then 12 records rather than loading the whole collection.
3. Non-admin editor cannot edit published content, cannot enable publication on the draft form, and cannot create/edit immediately-public image slots. Mobile navigation opens the dataset/image modules.
4. Dataset detail with a null JSON root displays `null`; the mounted form saves a boolean root without coercion, and verification retry issues GET only.

All four scenarios passed with zero page JavaScript errors. Artifacts: `acala-results.json`, `acala-0.png` through `acala-3.png`.

Merged frontend/source suite passed **32 tests** (30 frontend, 2 source/checksum). TypeScript, production build and scoped lint/format passed. Backend suite passed **159 tests / 2,166 assertions**; PHPStan, repository-wide Pint and diff checks passed.

## Remaining verification

Application MySQL migrations/import have been applied. Acala ID 1 (`acala` driver) is inactive/draft; 51 blocks, 15 datasets and 32 image slots were read back against 913 snapshot fields. Re-running the default importer created/updated zero records and preserved all existing records. The initial MySQL index-name limit failure was repaired with a short index name and non-destructive migration resume; a regression test preserves existing content when resuming a missing index.

Real HTTP checks returned 404 for inactive public page/dataset and 401 for an unauthenticated private definition. Existing user count remains 2; there are zero Acala memberships and zero superadmins. Account access was not automatically elevated: explicitly assign an existing account the intended Acala membership before using `/cms/acala`.

Authenticated real-MySQL browser CRUD and public activation have not been exercised. Independent integration review is complete: no security blockers were reported; the sole Unicode body-byte validation defect was fixed and independently rechecked with a passing focused HTTP regression (1 test / 13 assertions). See `docs/acala-installation.md` for operational state and source limitations.
