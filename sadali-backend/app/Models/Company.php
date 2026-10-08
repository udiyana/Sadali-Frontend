<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property-read Pivot $pivot
 * @property string $cms_driver
 * @property int $id
 * @property array<string, int>|null $feature_limits
 */
class Company extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'slug', 'active', 'status', 'plan_key', 'feature_limits', 'domain', 'logo_url', 'settings', 'cms_driver'];

    protected function casts(): array
    {
        return ['active' => 'boolean', 'feature_limits' => 'array', 'settings' => 'array'];
    }

    /** @return HasOne<CompanyProfile, $this> */
    public function profile(): HasOne
    {
        return $this->hasOne(CompanyProfile::class);
    }

    /** @return BelongsToMany<User, $this> */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }

    /** @param Builder<Company> $query
     * @return Builder<Company>
     */
    public function scopeAccessibleTo(Builder $query, User $user): Builder
    {
        return $user->is_super_admin ? $query : $query->whereHas('users', fn (Builder $q) => $q->where('users.id', $user->id));
    }

    /** @param Builder<Company> $query
     * @return Builder<Company>
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->where('active', true)->where('status', 'published');
    }
}
