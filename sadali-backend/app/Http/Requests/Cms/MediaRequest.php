<?php

namespace App\Http\Requests\Cms;

class MediaRequest extends CmsRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('editContent', $this->attributes->get('cmsCompany'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return $this->ownershipRules() + ['file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'max:'.config('cms.image_max_kb'), 'dimensions:max_width=8000,max_height=8000'], 'alt' => 'nullable|string|max:255', 'disk' => 'prohibited', 'path' => 'prohibited'];
    }
}
