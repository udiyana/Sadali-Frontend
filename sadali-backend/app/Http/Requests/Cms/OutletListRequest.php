<?php

namespace App\Http\Requests\Cms;

class OutletListRequest extends ListRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return array_replace(parent::rules(), ['page_id' => [$this->is('api/v1/public/*') && $this->route('outletType') === 'banners' ? 'required' : 'sometimes', 'integer', 'min:1']]);
    }
}
