<?php

namespace App\Http\Requests\Cms;

use App\Cms\BrandCustomModules;
use App\Models\BrandContentBlock;
use App\Rules\BoundedBrandJson;
use App\Rules\SafeBrandUrl;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class BrandCustomRequest extends CmsRequest
{
    /** @return array<string, mixed> */
    public function validationData(): array
    {
        $data = parent::validationData();
        // Retain JSON objects (including {}) without inserting objects into Symfony InputBag.
        if ($this->route('module') === 'datasets' && $this->isJson()) {
            $payload = json_decode($this->getContent());
            if ($payload instanceof \stdClass && property_exists($payload, 'data')) {
                $data['data'] = $payload->data;
            }
        }

        return $data;
    }

    public function authorize(): bool
    {
        $company = $this->attributes->get('cmsCompany');

        return $this->user()->can('editContent', $company) && (($this->route('module') !== 'image-slots' && ! $this->boolean('is_published')) || $this->user()->can('publish', $company));
    }

    /** @return array<\Closure> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->route('module') !== 'content-blocks' || $validator->errors()->isNotEmpty()) {
                return;
            }
            $existing = $this->route('record') === null ? null : BrandContentBlock::whereKey($this->route('record'))->firstOrFail();
            $page = $this->input('page', $existing?->getAttribute('page'));
            $section = $this->input('section', $existing?->getAttribute('section'));
            $query = BrandContentBlock::query()->where('page', $page)->where('section', $section);
            if ($existing !== null) {
                $query->whereKeyNot($existing->getKey());
            }
            if ($query->exists()) {
                $validator->errors()->add('section', 'Bagian sudah digunakan pada halaman ini.');
            }
        }];
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $required = $this->isMethod('post') ? 'required' : 'sometimes';
        $model = BrandCustomModules::model((string) $this->route('module'));
        $existing = $this->route('record') === null ? null : $model::whereKey($this->route('record'))->firstOrFail();
        $unique = Rule::unique((new $model)->getTable(), 'key')->where('company_id', $this->attributes->get('cmsCompany')->id)->ignore($existing?->getKey());
        if ($this->route('module') === 'image-slots') {
            return $this->ownershipRules() + [
                'key' => [$required, 'string', 'max:100', 'regex:/^[a-z0-9_.-]+$/', $unique], 'group' => [$required, 'string', 'max:100'],
                'label' => [$required, 'string', 'max:160'], 'path' => [$required, 'string', 'max:500', new SafeBrandUrl(true)], 'alt' => 'nullable|string|max:500',
            ];
        }
        if ($this->route('module') === 'datasets') {
            return $this->ownershipRules() + [
                'key' => [$required, 'string', 'max:100', 'regex:/^[a-z0-9_.-]+$/', Rule::notIn(['site_scripts']), $unique],
                'label' => [$required, 'string', 'max:160'], 'description' => 'nullable|string|max:1000', 'data' => [$this->isMethod('post') ? 'present' : 'sometimes', new BoundedBrandJson],
                'sort_order' => 'sometimes|integer|min:0|max:100000', 'is_published' => 'sometimes|boolean',
            ];
        }

        return $this->ownershipRules() + [
            'page' => [$required, 'string', 'max:80', 'regex:/^[a-z0-9-]+$/'],
            'section' => [$required, 'string', 'max:80', 'regex:/^[a-z0-9_-]+$/'],
            'label' => 'nullable|string|max:120', 'eyebrow' => 'nullable|string|max:160', 'title' => 'nullable|string|max:255', 'subtitle' => 'nullable|string|max:1000',
            'body' => ['nullable', 'string', 'max:50000', function (string $attribute, mixed $value, \Closure $fail): void {
                if (is_string($value) && strlen($value) > 65535) {
                    $fail('Konten maksimal berukuran 65535 byte UTF-8.');
                }
            }], 'image' => ['nullable', 'string', 'max:500', new SafeBrandUrl(true)], 'cta_label' => 'nullable|string|max:160', 'cta_url' => ['nullable', 'string', 'max:500', new SafeBrandUrl],
            'metadata' => ['nullable', 'array', new BoundedBrandJson], 'sort_order' => 'sometimes|integer|min:0|max:100000', 'is_published' => 'sometimes|boolean',
        ];
    }
}
