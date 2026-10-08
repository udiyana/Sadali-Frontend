<?php

namespace App\Http\Requests\Cms;

use Illuminate\Validation\Rule;

class OutletRequest extends CmsRequest
{
    public function authorize(): bool
    {
        $company = $this->attributes->get('cmsCompany');
        if ($this->route('outletType') === 'guests') {
            return $this->user()->can('update', $company);
        }

        return $this->user()->can('editContent', $company) && ($this->input('status') !== 'published' || $this->user()->can('publish', $company));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        if ($this->route('outletType') === 'banners') {
            return $this->ownershipRules() + ['page_id' => [$this->isMethod('post') ? 'required' : 'sometimes', 'integer', Rule::exists('pages', 'id')->where('company_id', $this->attributes->get('cmsCompany')->id)], 'image_url' => [$this->isMethod('post') ? 'required' : 'sometimes', 'url:https', 'max:500'], 'title' => 'nullable|string|max:160', 'link_url' => 'nullable|url:https|max:500', 'position' => 'sometimes|integer|min:0|max:1000', 'status' => ['sometimes', Rule::in(['draft', 'published', 'archived'])]];
        } if ($this->route('outletType') === 'services') {
            return $this->ownershipRules() + ['name' => [$this->isMethod('post') ? 'required' : 'sometimes', 'string', 'max:255'], 'icon' => ['nullable', 'string', 'max:80', 'regex:/^[a-z][a-z0-9-]*$/'], 'description' => 'nullable|string|max:5000', 'status' => ['sometimes', Rule::in(['draft', 'published', 'archived'])]];
        } if ($this->route('outletType') === 'guests') {
            return $this->ownershipRules() + ['first_name' => [$this->isMethod('post') ? 'required' : 'sometimes', 'string', 'max:120'], 'last_name' => 'nullable|string|max:120', 'email' => 'nullable|email|max:255', 'phone' => 'nullable|string|max:30'];
        }

        return $this->ownershipRules() + ['name' => [$this->isMethod('post') ? 'required' : 'sometimes', 'string', 'max:255'], 'address' => 'nullable|string|max:2000', 'phone' => 'nullable|string|max:30', 'status' => ['sometimes', Rule::in(['draft', 'published', 'archived'])]];
    }
}
