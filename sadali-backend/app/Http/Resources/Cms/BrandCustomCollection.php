<?php

namespace App\Http\Resources\Cms;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class BrandCustomCollection extends ResourceCollection
{
    public $collects = BrandCustomResource::class;

    /**
     * @param  array<string, mixed>  $paginated
     * @param  array<string, mixed>  $default
     * @return array<string, mixed>
     */
    public function paginationInformation(Request $request, array $paginated, array $default): array
    {
        $default['meta']['has_more'] = $paginated['current_page'] < $paginated['last_page'];

        return $default;
    }
}
