# Acala backend compatibility merge

## Provenance and scope

The source `C:/laragon/www/Acala-Backend-gagal` was inspected read-only: `routes/api.php`, `CmsContentController`, and `CmsContent`. This integration uses its contract structure and dummy/seed fixtures, **not a live API export**. No source code or application database is changed by the compatibility implementation or its tests.

The existing custom Acala driver, models, importer, editor, and authenticated central brand-scoped CRUD remain authoritative. This adapter adds only an anonymous, read-only content collection. It does not duplicate source authentication or unsafe public mutators.

## Registration

The shared-route owner has registered this once in `routes/web.php`:

```php
require __DIR__.'/acala-compat.php';
```

The dedicated route file exposes `GET /api/cms/public-contents`, named `acala-compat.public-contents`, under the existing `cms-public` throttle. Feature tests load the route file with web middleware only if shared registration has not yet been performed.

## Contract

- `page=home` selects the original page key; omitted `page` selects published blocks across pages.
- Page keys must be nonempty lowercase letters/digits/hyphens, at most 80 characters.
- `per_page` defaults to 20 and accepts integers 1–100.
- `page_number` is the continuation page, an integer at least 1. It deliberately does not use `page`, which is already the source's page-key filter.
- Invalid filters return JSON HTTP 422. An unknown but well-formed page key returns an empty collection.
- Response retains `{ "data": [content records] }`, adding existing collection `links` and `meta`, including `has_more`. Follow `links.next` until null; selected page keys survive continuation.
- Full source content fields are retained: `id`, `page`, `section`, `label`, `eyebrow`, `title`, `subtitle`, `body`, `image`, `cta_label`, `cta_url`, `metadata`, `sort_order`, `is_published`, `created_at`, `updated_at`. Internal `company_id` is never selected or serialized.
- Ordering matches the source: page, sort order, section. Body and metadata remain full payloads rather than private-list summaries.

Example: `GET /api/cms/public-contents?page=home&per_page=20&page_number=2`.

## Deliberate safety differences

The source public-contents route calls its unfiltered `index`, exposing unpublished records. That behavior is not reproduced. This adapter resolves only the existing, nondeleted company whose slug is exactly `acala`, active flag is true, status is `published`, and trusted code driver is exactly `acala`. Missing, inactive, unpublished, generic/untrusted-driver, or deleted Acala returns 404, without selecting another brand. Only published blocks are queried under the normal tenant global scope. No unscoped model mode is introduced.

Tenant context is saved and restored in `finally`, including retrieval exceptions; preexisting context is restored rather than reset blindly. Existing public company middleware is not reused because it resets context to null instead of preserving prior context. Existing `BrandCustomCollection` supplies resource and continuation conventions, with an explicit field allowlist to prevent private ownership leakage on this legacy URL. The generic list request is not reused because its numeric `page` conflicts with the original page-key contract.

## Verification

Tests use disposable SQLite `:memory:` fixtures, never the application database. Core contract slices were implemented test-first with observed RED/GREEN transitions: missing endpoint 404 → selected-page success; unbounded 23 rows → default 20 with continuation; malformed oversized pagination accepted 200 → validation 422. Additional tests protect existing tenant visibility/scoping and finally restoration, including a simulated Eloquent retrieval exception.

Run from the destination project (Git Bash):

```bash
APP_ENV=testing DB_CONNECTION=sqlite DB_DATABASE=:memory: DB_URL='' php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit tests/Feature/Cms/AcalaCompatibilityTest.php
php vendor/bin/pint --test app/Http/Controllers/Cms/AcalaCompatibilityController.php routes/acala-compat.php tests/Feature/Cms/AcalaCompatibilityTest.php
```

Focused verification: 6 tests, 113 assertions passed; full PHPUnit suite: 166 tests, 2,283 assertions passed; Pint passed. SQLite extensions must be explicitly enabled on this host; the first unconfigured run reported `could not find driver`, and was rerun with the extension flags before any production implementation.
