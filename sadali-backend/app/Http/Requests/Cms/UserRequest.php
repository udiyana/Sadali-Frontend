<?php

namespace App\Http\Requests\Cms;

use Illuminate\Validation\Rule;

class UserRequest extends CmsRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()->is_super_admin;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return ['name' => [$required, 'string', 'max:255'], 'email' => [$required, 'email', 'max:255', Rule::unique('users')->ignore($this->route('user'))],
            'password' => [$required, 'string', 'min:12', 'max:128', 'confirmed'], 'is_super_admin' => 'sometimes|boolean', 'company_id' => 'prohibited',
            'memberships' => 'sometimes|array|max:100', 'memberships.*' => 'array:company_id,role',
            'memberships.*.company_id' => ['required', 'integer', 'distinct', Rule::exists('companies', 'id')->whereNull('deleted_at')],
            'memberships.*.role' => ['required', Rule::in(['company_admin', 'company_editor'])],
        ];
    }
}
