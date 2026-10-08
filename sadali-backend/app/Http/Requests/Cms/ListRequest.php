<?php

namespace App\Http\Requests\Cms;

class ListRequest extends CmsRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['view' => 'sometimes|in:summary,full', 'per_page' => 'sometimes|integer|min:1|max:100', 'page' => 'sometimes|integer|min:1', 'status' => 'sometimes|in:draft,published,archived', 'search' => 'sometimes|string|max:100', 'page_id' => 'sometimes|integer|min:1'];
    }
}
