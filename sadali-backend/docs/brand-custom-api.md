# Code-defined brand CMS API

`Company.cms_driver` selects a **code-owned** registry (`App\Cms\BrandDrivers`). Existing companies default to `generic`; their existing company/outlet/content APIs remain unchanged. `acala` enables independently defined content blocks, datasets and image slots. No dataset, brand settings value, template string or script installs a driver. Unknown persisted drivers fail closed. Adding a new frontend means adding its definition, validators, tenant models/routes and tests in code, not forcing it into one shared frontend template.

## Definition

Authenticated, accessible tenant:

`GET /api/v1/cms/brands/{companyId}/definition`

```json
{"data":{"driver":"acala","name":"Acala","modules":[{"key":"content-blocks","label":"Konten Acala","fields":[{"key":"page","type":"text","label":"Halaman","required":true,"max":80}]}],"pages":["home"],"datasets":[{"key":"branches","label":"Branches"}],"dependencies":{"home":["branches"]}}}
```

Example above is abbreviated. The actual Acala definition contains three modules, ten source page keys, fifteen source dataset keys, page dependencies and shared dependencies. Fields use only `text`, `textarea`, `number`, `checkbox`, `json`. `generic` returns `{driver:"generic",name:"Generic",modules:[]}`: keep the existing generic UI/API rather than interpreting an empty custom module list as missing generic functionality.

`cms_driver` is fillable on Company and accepted by BrandRequest only for registry keys `generic` and `acala`; existing brand authorization still applies.

## Authenticated CRUD

Base: `/api/v1/cms/brands/{companyId}` (numeric tenant ID, existing session auth, CSRF and tenant middleware).

For each module `content-blocks`, `datasets`, `image-slots`:

- `GET /{module}`: paginated summaries only.
- `POST /{module}`: create, returns HTTP 201 and `{data: record}`.
- `GET /{module}/{recordId}`: full record including body/metadata or selected dataset data.
- `PATCH /{module}/{recordId}`: partial validated update, `{data: record}`.
- `DELETE /{module}/{recordId}`: HTTP 204.

Lists default to 20, accept `per_page=1..100` and `page>=1`, and return `{data:[...],meta:{total,current_page,last_page,per_page,has_more,...},links:{first,last,prev,next}}`. Follow `links.next`, which preserves filters. Bodies, metadata and dataset JSON are excluded **in the SQL select**, not just hidden after loading. Content filtering uses `page_key=home`; the **record field is still `page`**, while query `page` means pagination. Image lists optionally filter `group`.

Unrelated/foreign child IDs return 404 even for a user who can access a different brand. Request ownership (`id`, `company_id`, `actor_id`) is prohibited; CompanyRecord supplies ownership from server context and fails closed without it. Every successful custom create/update/delete records field names only in tenant audit logs, transactionally with the mutation.

Editors create/change/delete draft blocks and datasets but cannot publish, unpublish or mutate/delete already published records. Admins with the existing `publish` gate can. Image slots have no source publication flag and are inherently public once their brand is public: **all image slot writes require publishing permission**. Driver-gated custom endpoints return 404 for generic brands.

## Models and attributes

All three models extend `CompanyRecord`; `id` and `company_id` are guarded and ownership is immutable. All have `id`, server `company_id`, `created_at`, `updated_at` in addition to:

| Model / table | Attributes |
|---|---|
| `BrandContentBlock` / `brand_content_blocks` | `page`, `section`, `label`, `eyebrow`, `title`, `subtitle`, `body`, `image`, `cta_label`, `cta_url`, `metadata`, `sort_order`, `is_published` |
| `BrandDataset` / `brand_datasets` | `key`, `label`, `description`, `data`, `sort_order`, `is_published` |
| `BrandImageSlot` / `brand_image_slots` | `key`, `group`, `label`, `path`, `alt` |

Blocks cast metadata to array, sort_order to integer and is_published to boolean. Datasets retain the source-compatible PHP array cast for data, integer sort_order and boolean is_published; HTTP serialization decodes raw JSON without collapsing objects into arrays (including `{}` versus `[]`). JSON request validation likewise retains the original data value without placing stdClass into Symfony InputBag. Root arrays, objects, scalar values and null are supported. Metadata is nullable array/object-style configuration, never code. Database defaults are sort_order=0 and is_published=false; image slots intentionally have neither attribute.

Unique constraints: `(company_id,page,section)` for blocks and `(company_id,key)` for datasets/images. PATCH checks the resulting page/section pair even when only `page` changes. Normal validation failures return 422.

## Public, frontend-specific reads

Base: `/api/v1/public/brands/{brandSlug}` (public **slug**, not tenant numeric ID).

| Endpoint | Response / scope |
|---|---|
| `GET /content/{pageKey}` | Published blocks of exactly the selected page, `{data:[{section,label,eyebrow,title,subtitle,body,image,cta_label,cta_url,metadata}],meta,links}` |
| `GET /datasets/{key}` | Exactly one published selected dataset, source-compatible `{data: JSON}`; no record wrapper |
| `GET /datasets` | Bounded published dataset navigation summaries (`key,label,description,sort_order`), never all data payloads |
| `GET /image-slots` | Bounded `{data:[{key,path,alt}],meta,links}`; optional `group=home`, `keys[]=home_hero&keys[]=about_hero` (max 100 keys) |

The brand must be active and published for every public endpoint. Draft datasets return 404; draft blocks never appear. Unknown/empty pages yield an empty paginated block list rather than fetching other pages. Public responses omit tenant ownership and audit/auth/guest information. There is no mega-endpoint that returns all dataset JSON.

Read the definition once for authenticated CMS navigation, then fetch summaries for the selected module/page and the **one detail record** selected for editing. Public frontends fetch a selected page plus individual dataset dependencies actually needed by its components. Shared dependencies are separate named requests, not permission to preload every dataset. Source-root data arrays and objects are preserved, so existing Acala frontend selectors can adapt their base URL without a generic page template rewrite.

For separately hosted frontends, resolve relative image paths against the **API origin**, e.g. `new URL(path, apiOrigin)`, not against the frontend origin. Treat body/metadata/data strings as inert content; escape text, never use eval or raw executable HTML, and validate any nested URL before rendering. The API deliberately preserves opaque JSON rather than executing or interpreting it.

## Validation and exclusions

- `site_scripts` cannot be created or used as an updated dataset key. A model global scope also hides legacy site_scripts records from authenticated lists, details, update/delete and public reads. The import command must exclude it independently; no tracking/auth source data belongs in these tables.
- Dataset data and metadata are limited to 1 MiB encoded UTF-8 JSON and depth 16. Content body is limited to 50,000 characters and 65,535 UTF-8 bytes (the MySQL TEXT capacity); create/update reject oversize Unicode with HTTP 422 before persistence. All textual schema limits match the definition.
- Image/path fields allow HTTPS URLs without credentials or existing public raster-image paths. Control characters, backslashes, encoded traversal, protocol-relative URLs, active schemes, non-image local files and nonexistent local assets are rejected. CTA URLs permit HTTPS or safe root-relative navigation paths. Arbitrary JSON remains opaque and does not automatically authorize embedded URLs.
- Upload images through the **existing backend media API**; the unsafe source SVG upload endpoint was not copied. HTTPS media URLs can populate image/path fields.
- A deliberately preserved missing source asset remains an import-manifest issue, not a corrected filename invented by this API. A newly submitted nonexistent path must be replaced with a valid asset before that payload can pass validation.

## Schema and verification

Additive migrations: `2026_10_05_000007_add_brand_cms_driver.php`, `2026_10_05_000008_create_brand_custom_tables.php`. They do not run automatically and this implementation did not run them against the application database. Test migrations execute only on PHPUnit's disposable SQLite `:memory:` connection. Source repository was read-only; no credentials, auth, analytics controllers or production data were copied.

Feature suite `tests/Feature/Cms/BrandCustomTest.php` exercises actual application routes/middleware: definition, all CRUD, foreign tenants, editor publication restrictions, draft/public visibility, filtered paginated image paths, continuation links, lightweight lists, key uniqueness, inert bounded JSON, exact JSON root types and blocked executable dataset keys. Each new feature slice was run RED before its implementation, then GREEN; authorization/pagination regression coverage also verifies behavior already supplied by earlier slices.

Local CLI requires explicit SQLite extensions:

```sh
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/phpunit/phpunit/phpunit --filter=BrandCustomTest
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/phpunit/phpunit/phpunit
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpstan analyse --no-progress --error-format=table
```

Deployment/import and separately hosted frontend CORS configuration remain separate operational steps. SQLite tests do not prove MySQL locking/concurrency semantics.
