<?php

namespace App\Http\Resources\Cms;

use Illuminate\Http\Resources\Json\JsonResource;

class BrandCustomResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray($request): array
    {
        $data = $this->resource->toArray();
        if ($request->is('api/v1/public/*')) {
            unset($data['company_id']);
        }

        return $data;
    }
}
