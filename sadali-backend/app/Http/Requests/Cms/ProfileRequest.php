<?php

namespace App\Http\Requests\Cms;

use Illuminate\Validation\Rule;

class ProfileRequest extends CmsRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->attributes->get('cmsCompany'));
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $rules = $this->ownershipRules() + [
            'description' => 'nullable|string|max:10000', 'address' => 'nullable|string|max:2000', 'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:30', 'whatsapp' => ['nullable', 'regex:/^62[0-9]{8,13}$/'],
            'opening_hours' => 'nullable|array:mon,tue,wed,thu,fri,sat,sun', 'opening_hours.*' => 'nullable|array:opens,closes,closed',
            'opening_hours.*.opens' => 'nullable|date_format:H:i', 'opening_hours.*.closes' => 'nullable|date_format:H:i', 'opening_hours.*.closed' => 'boolean',
            'social_links' => 'nullable|array:instagram,facebook,tiktok,youtube,website', 'social_links.*' => 'nullable|url:https|max:500',
            'legal' => 'nullable|array:business_name,nib,npwp', 'legal.*' => 'nullable|string|max:100',
            'theme' => 'nullable|array:primary,accent,font,template',
            'theme.primary' => ['sometimes', 'regex:/^#[0-9a-fA-F]{6}$/'], 'theme.accent' => ['sometimes', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'theme.font' => ['sometimes', Rule::in(config('cms.fonts'))], 'theme.template' => ['sometimes', Rule::in(config('cms.templates'))],
            'meta_title' => 'nullable|string|max:160', 'meta_description' => 'nullable|string|max:320',
        ];
        foreach (['logo', 'cover', 'share'] as $key) {
            $rules[$key.'_media_id'] = $this->mediaRule();
        }

        return $rules;
    }
}
