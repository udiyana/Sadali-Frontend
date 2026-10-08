<?php

namespace App\Cms;

use App\Models\Article;
use App\Models\Page;
use App\Models\Product;
use App\Models\Section;

final class ContentTypes
{
    /** @return class-string<Page|Product|Article|Section> */
    public static function model(string $type): string
    {
        return match ($type) {
            'pages' => Page::class,'products' => Product::class,'articles' => Article::class,'sections' => Section::class,default => abort(404)
        };
    }
}
