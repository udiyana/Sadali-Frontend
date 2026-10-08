# Acala repository snapshot import

## What is being imported

`database/data/acala/source.json` contains actual Acala **repository seed definitions**, not a live CMS database export. Its source identifier is `acala-barbistro-rebuild:repository-seeds`. The source `.env` and database dump were not provided, and its autoloader was absent; live editor changes cannot be recovered or claimed. The extraction provenance includes the source-file hashes.

The supplied snapshot has **51 content blocks across 10 pages, 15 datasets, and 32 image slots**. Dataset labels, descriptions and nested JSON are preserved, rather than replaced with demo records. No users, passwords, memberships, authentication data, analytics or `site_scripts` are imported. Existing Acala editor changes are preserved on normal repeated imports.

## Commands

After the target application's migrations have been deployed through your normal reviewed migration process:

```bash
# Validation only: never writes to or even queries the database.
php artisan cms:import-acala --dry-run

# Creates Acala (slug acala, cms_driver acala) as inactive/draft.
# On subsequent runs, only missing records are inserted.
php artisan cms:import-acala

# Override the local JSON path, not a URL or PHP file to execute.
php artisan cms:import-acala --source=/absolute/path/to/source.json --dry-run

# Explicitly opt in to activation/publication.
php artisan cms:import-acala --publish

# Explicitly reset existing matching content fields to snapshot values.
# Also resets the brand name to Acala, but never replaces brand settings.
php artisan cms:import-acala --overwrite
```

`--dry-run` takes precedence over `--publish` and `--overwrite`: neither can cause writes during a dry run. Dry-run counts are **source record counts**, not predictions of database inserts; outlet compatibility and database constraints are checked during a real import. An existing published outlet is not demoted by a normal import. Publication of the outlet does not override individual `is_published` flags.

A successful write reports only the outlet ID and `created`, `existing`, `updated` counts per collection. With `--overwrite`, unchanged records count as existing; only changed records count as updated. Failures return a nonzero exit code. Database exceptions are intentionally not printed because they may contain connection details or raw record values.

## Safety and idempotency

- All three collections are validated before any database writes. JSON is bounded to 10 MiB and depth 64; the CLI accepts only readable local files and rejects stream wrappers/URLs.
- Root shape: `source`, optional `provenance`, and JSON lists `contents`, `datasets`, `images`. Entity fields are allowlisted, including nested `data`/`metadata` JSON. Unknown fields and supplied ownership/IDs are rejected. Sensitive configuration keys in nested JSON are rejected.
- The `source` identifier must match the Acala repository seed snapshot. Provenance, when supplied, must not claim a live database export. This is schema/provenance validation, not a cryptographic signature: import only reviewed trusted snapshots. The importer never evaluates PHP, HTML or scripts; rendering applications must still escape/sanitize content and enforce safe URL handling.
- Natural keys are `(company_id, page, section)` for content and `(company_id, key)` for datasets/images. Duplicate keys within any input collection abort before writes. Existing keys are locked and preserved unless `--overwrite` is supplied; other outlets are never touched.
- All writes happen in one transaction. Failures roll back the brand and every child collection. The tenant context's prior value is restored in `finally`, on both success and failure.
- An existing `acala` slug with driver `generic` or `acala` can be imported deliberately. An incompatible driver or soft-deleted outlet aborts instead of being hijacked or restored. Slug and natural-key database uniqueness remain the final concurrency guard; concurrent conflicting first imports may fail safely and should be retried after the competing transaction completes.
- No owner is created or attached. Grant existing authorized users access through the normal administrative membership workflow.
- The importer does not run migrations or read/copy the source application's credentials, `.env`, database or users.

## Assets and separate frontend origins

The extraction process copies actual referenced files to `public/outlet-assets/acala` and records file hashes and missing paths in `database/data/acala/assets-manifest.json`. Existing asset references are rebased in the snapshot; **the missing original `/Branch/Acala nusa dua/DSC03517.jpg` is explicitly recorded, not silently replaced**. Importing the snapshot does not download or regenerate files.

A separate frontend must resolve returned root-relative asset paths against the **backend/API origin**, not its own origin, for example `new URL(path, apiOrigin).href`. Public read availability also depends on the outlet being active/published and the individual records' publication flags.

## Verification without application database writes

The feature tests use SQLite `:memory:` through `phpunit.xml` and exercise the actual default snapshot, repeated imports, editorial/foreign-tenant preservation, explicit overwrite/publication, duplicate and forbidden fields, invalid/missing/deep/oversized files, and transaction/context cleanup. No live/application database was migrated or seeded during implementation.

On the supplied Windows PHP installation, SQLite extensions must be enabled for this command:

```bash
php -d extension=pdo_sqlite -d extension=sqlite3 vendor/bin/phpunit tests/Feature/Cms/AcalaImportTest.php
php vendor/bin/phpstan analyse app/Cms/Imports/AcalaImporter.php app/Console/Commands/ImportAcalaCms.php --no-progress
php vendor/bin/pint --test app/Cms/Imports/AcalaImporter.php app/Console/Commands/ImportAcalaCms.php tests/Feature/Cms/AcalaImportTest.php
```

SQLite tests verify importer behavior, not production MySQL locking or collation behavior. Review migrations and run any production database-specific integration checks before deployment. Running the import without `--dry-run` outside PHPUnit writes to the configured application database and is an explicit operational action, not a verification step.
