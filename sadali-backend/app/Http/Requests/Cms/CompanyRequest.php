<?php

namespace App\Http\Requests\Cms;

use App\Models\Company;
use Illuminate\Validation\Rule;

class CompanyRequest extends CmsRequest
{
    public function authorize(): bool
    {
        return $this->isMethod('post') ? $this->user()->can('create', Company::class) : $this->user()->can('update', $this->attributes->get('cmsCompany'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $central = $this->user()->is_super_admin;

        return $this->ownershipRules() + [
            'name' => [$this->isMethod('post') ? 'required' : 'sometimes', 'string', 'max:255'],
            'slug' => [$this->isMethod('post') ? 'required' : 'sometimes', 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('companies', 'slug')->ignore($this->route('company'))],
            'active' => $central ? 'sometimes|boolean' : 'prohibited',
            'status' => ['sometimes', Rule::in(['draft', 'published', 'archived'])],
            'plan_key' => $central ? 'sometimes|string|max:50' : 'prohibited',
            'feature_limits' => $central ? 'sometimes|array:pages,products,articles,media' : 'prohibited',
            'feature_limits.*' => 'integer|min:0|max:100000',
        ];
    }
}
