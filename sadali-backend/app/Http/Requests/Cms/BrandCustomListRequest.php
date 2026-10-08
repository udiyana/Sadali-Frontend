<?php

namespace App\Http\Requests\Cms;

class BrandCustomListRequest extends CmsRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['group' => 'sometimes|string|max:100', 'keys' => 'sometimes|array|max:100', 'keys.*' => 'string|max:100|regex:/^[a-z0-9_.-]+$/', 'per_page' => 'sometimes|integer|min:1|max:100', 'page' => 'sometimes|integer|min:1', 'page_key' => 'sometimes|string|max:80|regex:/^[a-z0-9-]+$/'];
    }
}
