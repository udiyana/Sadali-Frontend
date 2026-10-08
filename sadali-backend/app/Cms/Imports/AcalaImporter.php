<?php

namespace App\Cms\Imports;

use App\Cms\CompanyContext;
use App\Models\BrandContentBlock;
use App\Models\BrandDataset;
use App\Models\BrandImageSlot;
use App\Models\Company;
use App\Models\CompanyRecord;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use InvalidArgumentException;
use JsonException;

final class AcalaImporter
{
    public const MAX_BYTES = 10 * 1024 * 1024;

    public const MAX_DEPTH = 64;

    public const SOURCE = 'acala-barbistro-rebuild:repository-seeds';

    public const DUMMY_SOURCE = 'Acala-Backend-gagal:repository-dummy';

    /** @var array<string, class-string<CompanyRecord>> */
    private const MODELS = ['contents' => BrandContentBlock::class, 'datasets' => BrandDataset::class, 'images' => BrandImageSlot::class];

    /** @var array<string, list<string>> */
    private const KEYS = ['contents' => ['page', 'section'], 'datasets' => ['key'], 'images' => ['key']];

    /** @param array<string, mixed> $snapshot
     * @return array<string, mixed>
     */
    public function import(array $snapshot, bool $overwrite = false, bool $publish = false): array
    {
        $this->validate($snapshot);
        $context = app(CompanyContext::class);
        $previous = $context->id;

        try {
            return DB::transaction(function () use ($snapshot, $overwrite, $publish, $context): array {
                $brand = Company::withTrashed()->where('slug', 'acala')->lockForUpdate()->first();
                if ($brand !== null && ($brand->trashed() || ! in_array($brand->cms_driver, ['generic', 'acala'], true))) {
                    throw new InvalidArgumentException('The acala slug belongs to an incompatible or deleted outlet.');
                }
                $brandCreated = $brand === null;
                if ($brand === null) {
                    $brand = Company::create(['name' => 'Acala', 'slug' => 'acala', 'cms_driver' => 'acala', 'active' => $publish, 'status' => $publish ? 'published' : 'draft']);
                } else {
                    $attributes = ['cms_driver' => 'acala'];
                    if ($overwrite) {
                        $attributes['name'] = 'Acala';
                    }
                    if ($publish) {
                        $attributes['active'] = true;
                        $attributes['status'] = 'published';
                    }
                    $brand->fill($attributes)->save();
                }
                $context->id = $brand->id;
                $report = ['brand_id' => $brand->id, 'brand_created' => $brandCreated];
                foreach (self::MODELS as $collection => $model) {
                    $counts = ['created' => 0, 'existing' => 0, 'updated' => 0];
                    foreach ($snapshot[$collection] as $record) {
                        $query = $model::query();
                        foreach (self::KEYS[$collection] as $key) {
                            $query->where($key, $record[$key]);
                        }
                        $existing = $query->lockForUpdate()->first();
                        if ($existing === null) {
                            $model::create($record);
                            $counts['created']++;
                        } elseif ($overwrite) {
                            $existing->fill($record);
                            if ($existing->isDirty()) {
                                $existing->save();
                                $counts['updated']++;
                            } else {
                                $counts['existing']++;
                            }
                        } else {
                            $counts['existing']++;
                        }
                    }
                    $report[$collection] = $counts;
                }

                return $report;
            });
        } finally {
            $context->id = $previous;
        }
    }

    /** Validate all collections before the first database write.
     * @param  array<string, mixed>  $snapshot
     */
    public function validate(array $snapshot): void
    {
        try {
            $json = json_encode($snapshot, JSON_THROW_ON_ERROR, self::MAX_DEPTH);
        } catch (JsonException) {
            throw new InvalidArgumentException('Snapshot exceeds the JSON depth limit or contains invalid data.');
        }
        if (strlen($json) > self::MAX_BYTES) {
            throw new InvalidArgumentException('Snapshot exceeds the 10 MiB size limit.');
        }
        if (array_diff(array_keys($snapshot), ['source', 'provenance', 'contents', 'datasets', 'images']) !== []) {
            throw new InvalidArgumentException('Snapshot contains unsupported top-level fields.');
        }
        if (! in_array($snapshot['source'] ?? null, [self::SOURCE, self::DUMMY_SOURCE], true)) {
            throw new InvalidArgumentException('Snapshot must identify Acala repository seeds, not a live database export.');
        }
        if (isset($snapshot['provenance']) && (! is_array($snapshot['provenance']) || ($snapshot['provenance']['live_database_available'] ?? false) !== false)) {
            throw new InvalidArgumentException('Snapshot provenance must not claim live database data.');
        }
        if ($snapshot['source'] === self::DUMMY_SOURCE && ($snapshot['provenance']['data_mode'] ?? null) !== 'dummy') {
            throw new InvalidArgumentException('Backend dummy snapshots must explicitly identify dummy data.');
        }
        $fields = [
            'contents' => ['page', 'section', 'label', 'eyebrow', 'title', 'subtitle', 'body', 'cta_label', 'cta_url', 'image', 'metadata', 'sort_order', 'is_published'],
            'datasets' => ['key', 'label', 'description', 'data', 'sort_order', 'is_published'],
            'images' => ['key', 'group', 'label', 'path', 'alt'],
        ];
        foreach ($fields as $collection => $allowed) {
            if (! isset($snapshot[$collection]) || ! is_array($snapshot[$collection]) || ! array_is_list($snapshot[$collection])) {
                throw new InvalidArgumentException("Snapshot {$collection} must be a JSON list.");
            }
            $seen = [];
            foreach ($snapshot[$collection] as $record) {
                if (! is_array($record) || array_diff(array_keys($record), $allowed) !== []) {
                    throw new InvalidArgumentException("Unsupported record fields in {$collection}.");
                }
                $limits = [
                    'page' => 80, 'section' => 80, 'key' => 100, 'group' => 100,
                    'label' => $collection === 'contents' ? 120 : 160,
                    'eyebrow' => 160, 'title' => 255, 'subtitle' => 1000,
                    'image' => 500, 'cta_label' => 160, 'cta_url' => 500,
                    'description' => 1000, 'path' => 500, 'alt' => 500,
                ];
                $rules = [];
                foreach ($allowed as $field) {
                    $rules[$field] = match ($field) {
                        'sort_order' => ['sometimes', 'integer', 'min:0', 'max:4294967295'],
                        'is_published' => ['sometimes', 'boolean'],
                        'data' => ['present', 'array'],
                        'metadata' => ['sometimes', 'nullable', 'array'],
                        'body' => ['sometimes', 'nullable', 'string', 'max:65535'],
                        default => ['sometimes', 'nullable', 'string', 'max:'.$limits[$field]],
                    };
                }
                $required = array_merge(self::KEYS[$collection], ['label'], $collection === 'images' ? ['group', 'path'] : []);
                foreach ($required as $key) {
                    $rules[$key] = ['required', 'string', 'max:'.$limits[$key]];
                }
                // MySQL TEXT is byte-bounded, unlike Laravel's character-count string rule.
                if (isset($record['body']) && is_string($record['body']) && strlen($record['body']) > 65535) {
                    throw new InvalidArgumentException('Content body exceeds the database byte limit.');
                }
                $errors = Validator::make($record, $rules)->errors();
                if ($errors->isNotEmpty()) {
                    throw new InvalidArgumentException("Invalid record fields in {$collection}: ".implode(', ', $errors->keys()).'.');
                }
                foreach (self::KEYS[$collection] as $key) {
                    if (! preg_match('/\A[a-z0-9][a-z0-9_.-]*\z/D', $record[$key])) {
                        throw new InvalidArgumentException("Invalid natural key in {$collection}.");
                    }
                }
                if ($collection === 'datasets' && in_array($record['key'], ['site_scripts', 'users', 'auth', 'credentials', 'analytics'], true)) {
                    throw new InvalidArgumentException('Executable, identity, credential and analytics datasets are not importable.');
                }
                foreach (['data', 'metadata'] as $jsonField) {
                    if (isset($record[$jsonField]) && is_array($record[$jsonField])) {
                        $this->validatePublicData($record[$jsonField]);
                    }
                }
                $identity = [];
                foreach (self::KEYS[$collection] as $field) {
                    $identity[] = $record[$field];
                }
                $key = json_encode($identity, JSON_THROW_ON_ERROR);
                if (isset($seen[$key])) {
                    throw new InvalidArgumentException("Duplicate natural key in {$collection}.");
                }
                $seen[$key] = true;
            }
        }
    }

    /** @param array<array-key, mixed> $data */
    private function validatePublicData(array $data): void
    {
        foreach ($data as $key => $value) {
            if (is_string($key) && in_array(strtolower($key), [
                'password', 'password_confirmation', 'remember_token', 'api_key', 'api_token',
                'access_token', 'refresh_token', 'client_secret', 'private_key', 'session_token',
                'site_scripts', 'credentials', 'auth', 'users', 'analytics',
            ], true)) {
                throw new InvalidArgumentException('Nested identity, secret or executable configuration is not importable.');
            }
            if (is_array($value)) {
                $this->validatePublicData($value);
            }
        }
    }
}
