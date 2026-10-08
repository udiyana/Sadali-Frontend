<?php

namespace App\Http\Resources\Cms;

use App\Models\Media;
use Illuminate\Http\Resources\Json\JsonResource;

class CmsResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray($request): array
    {
        $data = $this->resource->toArray();
        unset($data['disk'],$data['path'],$data['deleted_at']);
        $public = $request->is('api/v1/public/*');
        if ($public) {
            if (isset($data['settings']) && is_array($data['settings'])) {
                $safe = [];
                foreach (['template' => config('cms.templates'), 'font' => config('cms.fonts')] as $key => $allowed) {
                    if (isset($data['settings'][$key]) && in_array($data['settings'][$key], $allowed, true)) {
                        $safe[$key] = $data['settings'][$key];
                    }
                }
                foreach (['primary', 'secondary'] as $key) {
                    $value = $data['settings'][$key] ?? null;
                    if (is_string($value) && preg_match('/^#[0-9a-fA-F]{6}$/', $value)) {
                        $safe[$key] = $value;
                    }
                }
                $data['settings'] = $safe;
            }
            foreach (['legal', 'plan_key', 'feature_limits', 'company_id'] as $field) {
                unset($data[$field]);
            }
        }
        if ($this->resource instanceof Media) {
            $company = $request->attributes->get('cmsCompany');
            $data['url'] = url('/api/v1/'.($public ? 'public/companies/'.$company->slug : 'cms/companies/'.$company->id).'/media/'.$this->resource->getKey().'/file');
        }
        foreach (['logo', 'cover', 'share', 'image'] as $key) {
            if (! empty($data[$key.'_media_id'])) {
                $company = $request->attributes->get('cmsCompany');
                $data[$key.'_url'] = url('/api/v1/'.($public ? 'public/companies/'.$company->slug : 'cms/companies/'.$company->id).'/media/'.$data[$key.'_media_id'].'/file');
            }
        }
        if (! empty($data['whatsapp'])) {
            $data['whatsapp_url'] = 'https://wa.me/'.$data['whatsapp'];
        }

        return $data;
    }
}
