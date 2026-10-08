<?php

namespace App\Http\Requests\Cms;

use App\Cms\ContentTypes;
use Carbon\CarbonImmutable;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ContentRequest extends CmsRequest
{
    protected function passedValidation(): void
    {
        if ($this->filled('published_at')) {
            /** @var Validator $validator */
            $validator = $this->validator;
            $data = $validator->getData();
            $data['published_at'] = CarbonImmutable::parse($data['published_at'])->utc()->format('Y-m-d H:i:s');
            $validator->setData($data);
        }
    }

    public function authorize(): bool
    {
        $company = $this->attributes->get('cmsCompany');
        if (! $this->user()->can('editContent', $company)) {
            return false;
        }
        if ($this->input('status') === 'published' || $this->filled('published_at')) {
            return $this->user()->can('publish', $company);
        }

        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $type = $this->route('type');
        ContentTypes::model($type);
        $required = $this->isMethod('post') ? 'required' : 'sometimes';
        if ($type === 'sections') {
            return $this->ownershipRules() + [
                'page_id' => [$required, 'integer', Rule::exists('pages', 'id')->where('company_id', $this->attributes->get('cmsCompany')->id)],
                'type' => [$required, Rule::in(config('cms.section_types'))], 'position' => 'sometimes|integer|min:0|max:1000', 'visible' => 'sometimes|boolean',
                'config' => [$required, 'array:heading,text,button_label,button_url,limit'],
                'config.heading' => 'nullable|string|max:160', 'config.text' => 'nullable|string|max:10000', 'config.button_label' => 'nullable|string|max:80',
                'config.button_url' => 'nullable|url:https|max:500', 'config.limit' => 'sometimes|integer|min:1|max:24',
                'image_media_id' => $this->mediaRule(),
            ];
        }
        $rules = $this->ownershipRules() + [
            'title' => [$required, 'string', 'max:255'], 'slug' => [$required, 'string', 'max:120', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique($type, 'slug')->where('company_id', $this->attributes->get('cmsCompany')->id)->ignore($this->route('record'))],
            'body' => 'nullable|string|max:50000', 'status' => ['sometimes', Rule::in(['draft', 'published', 'archived'])],
            'published_at' => 'nullable|date', 'image_media_id' => $this->mediaRule(), 'meta_title' => 'nullable|string|max:160', 'meta_description' => 'nullable|string|max:320',
        ];
        if ($type === 'products') {
            $rules += ['kind' => ['sometimes', Rule::in(['product', 'service'])], 'category' => 'nullable|string|max:100', 'price' => 'nullable|numeric|decimal:0,2|min:0|max:9999999999999.99', 'visible' => 'sometimes|boolean'];
        }

        return $rules;
    }
}
