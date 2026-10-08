<?php

namespace App\Models;

use App\Cms\CompanyContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** @property int $company_id */
abstract class CompanyRecord extends Model
{
    protected $guarded = ['id', 'company_id'];

    /** @return BelongsTo<Company, $this> */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    protected static function booted(): void
    {
        static::addGlobalScope('company', function (Builder $query) {
            $id = app(CompanyContext::class)->id;
            $id === null ? $query->whereRaw('1 = 0') : $query->where($query->getModel()->qualifyColumn('company_id'), $id);
        });
        static::creating(function (self $record) {
            $id = app(CompanyContext::class)->id;
            if ($id === null) {
                throw new \LogicException('Company context required.');
            }
            $record->company_id = $id;
        });
        static::updating(function (self $record) {
            if ($record->isDirty('company_id') || $record->company_id !== app(CompanyContext::class)->id) {
                throw new \LogicException('Company ownership is immutable.');
            }
        });
    }

    /** @param Builder<static> $query
     * @return Builder<static>
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')->where(fn (Builder $q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
    }
}
