<?php

namespace App\Cms;

use App\Models\Article;
use App\Models\CompanyProfile;
use App\Models\Page;
use App\Models\Product;
use App\Models\Section;
use Illuminate\Support\Facades\DB;

final class PublicMedia
{
    public static function isVisible(int $id): bool
    {
        // All branches preserve the model's company global scope. Only one SQL round trip.
        $references = CompanyProfile::select('id')->where(fn ($q) => $q->where('logo_media_id', $id)->orWhere('cover_media_id', $id)->orWhere('share_media_id', $id));
        foreach ([Page::class, Article::class, Product::class] as $model) {
            $query = $model::select('id')->published()->where('image_media_id', $id);
            if ($model === Product::class) {
                $query->where('visible', true);
            }
            $references->unionAll($query);
        }
        $references->unionAll(Section::select('id')->where('visible', true)->where('image_media_id', $id)->whereIn('page_id', Page::published()->select('id')));

        return DB::query()->fromSub($references, 'public_media_references')->exists();
    }
}
