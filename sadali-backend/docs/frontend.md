# Frontend CMS / Brand workspace

## Entry points

- `/cms`: session-authenticated Inertia `cms/index`, uses the existing `/api/v1/cms/brands` API. The server supplies `demo: false`, `cmsUser` and a `cmsRoles` map keyed by company/brand ID. No credentials are manufactured by the frontend.
- `/cms/demo`: explicit anonymous demonstration with exactly **three fictional brands**: Nusa Stay, Sora Kitchen, Aruna Wellness. It uses the same UI and a separate adapter, not database seed data. Demo controls never send API mutations. A persistent badge and notice distinguish demo from live; header links switch modes.
- `/cms/{brandSlug}`: authenticated per-brand workspace. The server resolves the slug through `Company::accessibleTo($user)`, rejects foreign/missing/deleted brands with 404, and supplies `cmsBrand`/`cmsBrandSlug`. Refresh and direct links keep the selected tenant; changing modules must never fall back to the first brand.
- `/cms/demo/{brandSlug}`: isolated demo workspace for `nusa-stay`, `sora-kitchen`, or `aruna-wellness`; unknown slugs return 404. The top-left workspace picker changes the URL with a full navigation, resetting old-brand forms, pages and requests. `/cms` and `/cms/demo` remain brand selection entry points.
- `resources/js/app.tsx` exempts `cms/*` from the starter AppLayout. All other layout behavior is unchanged.

## Implementation

- `resources/js/pages/cms/index.tsx`: responsive workspace shell, brand overview/picker, selected-brand shortcuts, paginated module tables, page workspace and activity viewer.
- `resources/js/cms/adapter.ts`: typed dependency-injected live/demo adapter and role permissions, tested directly by Node (current Node supports native TypeScript type stripping).
- `resources/js/cms/config.ts`: module/form field definitions and allowlisted section configuration.
- `resources/js/cms/editor.tsx`: labeled forms, browser validation, API field errors, dirty-state confirmation, membership management, loading/saving states.
- `resources/js/cms/{payload,banner-pages,write,navigation}.ts`: tested form serialization, bounded independent banner-parent resolution, committed-write verification coordinator, and shared page-opening state reset. Clearing section text sends explicit nullable config fields; a successful mutation followed by a failed read-back locks the form and offers GET-only verification retry, never a duplicate POST/PATCH.
- `resources/js/cms/cms.css`: isolated light UI, inherited Instrument Sans, white/mist surfaces, navy text and teal accent, distinct brand initials. No external imagery, emoji, gradients or HTML content rendering.

## Supported work

- Brand cards and selected-brand navigation. Overview shows only loaded brand totals, **not fabricated content/visitor metrics**.
- Pages: lightweight list; open the selected page's `/pages/{id}/editor` only, with separate section pagination. Page title, slug, body, publication status and SEO fields. Sections can be added, edited, deleted, positioned and hidden. Types: hero/text/products/gallery/contact/articles. Config fields: heading/text/button_label/button_url/limit. All text is rendered as text, not HTML.
- Properties, services, guests, banners, products and articles: scoped create/edit/delete, required fields, URL/email/number validation, pagination and confirmation before deletion. Banners select a page from a paginated page picker. Published banner pages are blocked for editors, including draft banners.
- Profile uses `PUT /brands/{id}/profile`. Brand metadata and template/font/primary/secondary settings use `PATCH /brands/{id}`. These are distinct resources, not an invented merged endpoint. Domain is metadata only; saving it does not provision DNS or TLS.
- Users are visible only to super administrators. List/create/update/delete and per-brand membership role selection. Membership replacement retains assignments for brands not in the currently loaded brand list. New live passwords must be typed by the operator (at least 12 characters); they exist only in form memory and are never logged or persisted to demo storage. Demo user forms do not include password controls and do not create real accounts.
- Activity is a paginated read-only tenant log; displayed timestamps are explicitly UTC.

## Requests, access and errors

Fetch uses same-origin paths, `credentials: same-origin`, `Accept: application/json` and a URL-decoded `X-XSRF-TOKEN` header for mutation methods. Never uses bearer tokens or disables CSRF. 401/403/419 have actionable messages, 422 displays field errors, invalid non-JSON responses are errors. Live errors never silently switch to demo.

Only the selected module is loaded. Banner page selection adds the required page summary request; page editing adds only the selected page and a page of its sections. Brand/module/filter/page changes abort prior reads. Detail reads are canceled when navigating away. Saving reads back the exact resource; deletion verifies the scoped detail is no longer available before claiming success.

Role controls derive from the supplied user/role map (or brand pivot). Guests/profile/settings require admin access. Editors cannot publish, change an existing published record, or modify a section/banner belonging to a published page. Backend policies remain the authoritative security boundary.

Forms and destructive/dirty confirmations use Radix dialogs with focus trapping, Escape behavior and restoration. Icons have accessible button labels. Mobile navigation collapses; tables scroll horizontally without expanding the page.

## Demo persistence and limitations

Demo changes persist under the dedicated localStorage key `rbi.cms.demo.v1`; clear that key to reset. No application/session/auth storage keys are changed. Invalid stored demo JSON is discarded. Root brand creation/deletion is disabled in demo to retain exactly three brands; existing demo brand details can be edited. Demo examples use fictional names and `.test` email addresses, not production contacts. Storage access may be disabled by browser policy; without available localStorage, changes last only for the current mounted session.

Outlet API lists do not support server search/status filters. Their filters are **explicitly labeled as current-page filters**. Pages/products/articles use documented server-side search/status. Live brands are not hard-coded to three; overview and page selectors are paginated. Membership editing is limited to brands in the currently loaded root list while retaining other memberships.

This is an administration UI, not a public website renderer, a media upload manager, a rich-text/HTML editor, DNS provisioning, scheduled-publication controls, or analytics. Existing schedules are preserved when editing (not silently cleared). Backend quota/ownership errors remain visible. No production database migration or seeding is performed by the frontend.

## Verification

```sh
node --test tests/frontend/*.test.mjs
npm run types:check
npm run build
npm exec vp -- lint resources/js/cms resources/js/pages/cms resources/js/app.tsx tests/frontend --deny-warnings
npm exec vp -- fmt resources/js/cms resources/js/pages/cms resources/js/app.tsx tests/frontend --check
```

The adapter was developed in vertical RED → GREEN increments: fictional brand listing; live CSRF request; error/204 behavior; scoped persisted demo CRUD/password exclusion; permissions; demo root limits/content validation; native Laravel user pagination/non-JSON rejection. Tests use built-in `node:test` and `assert`, no new packages.
