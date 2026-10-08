<?php

namespace App\Http\Requests\Cms;

use App\Cms\BrandDrivers;
use Illuminate\Validation\Rule;

class BrandRequest extends CompanyRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('domain'))) {
            $this->merge(['domain' => strtolower(trim($this->input('domain')))]);
        }
    }

    public function rules(): array
    {
        return parent::rules() + [
            'cms_driver' => ['sometimes', Rule::in(BrandDrivers::keys())],
            'domain' => ['nullable', 'string', 'max:253', 'regex:/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/', Rule::unique('companies', 'domain')->ignore($this->route('company'))],
            'logo_url' => 'nullable|url:https|max:500',
            'settings' => 'nullable|array:template,font,primary,secondary',
            'settings.template' => ['sometimes', Rule::in(config('cms.templates'))],
            'settings.font' => ['sometimes', Rule::in(config('cms.fonts'))],
            'settings.primary' => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'settings.secondary' => ['sometimes', 'string', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ];
    }
}
