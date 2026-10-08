<?php

namespace App\Http\Requests\Cms;

use App\Rules\PlainText;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class CmsRequest extends FormRequest
{
    /** @return array<string, string> */
    public function messages(): array
    {
        return ['email' => 'Gunakan alamat email yang valid.', 'unique' => 'Nilai :attribute sudah digunakan.', 'in' => 'Pilihan :attribute tidak valid.', 'array' => 'Konfigurasi :attribute tidak valid atau memuat kolom yang tidak diizinkan.', 'regex' => 'Format :attribute tidak sesuai petunjuk.', 'url' => 'Gunakan URL HTTPS yang valid.', 'date' => 'Gunakan tanggal dan waktu yang valid.', 'boolean' => 'Kolom :attribute harus berupa pilihan ya/tidak.', 'integer' => 'Kolom :attribute harus berupa bilangan bulat.', 'decimal' => 'Harga maksimal memiliki dua angka di belakang koma.', 'numeric' => 'Kolom :attribute harus berupa angka.', 'min' => 'Nilai :attribute lebih kecil dari batas minimum.', 'mimes' => 'Upload hanya gambar JPG, PNG, atau WebP.', 'mimetypes' => 'Tipe file gambar tidak diizinkan.', 'dimensions' => 'Dimensi gambar maksimal 8000 × 8000 piksel.', 'required' => 'Kolom :attribute wajib diisi.', 'max' => 'Kolom :attribute melebihi batas yang diizinkan.', 'exists' => 'Pilihan :attribute tidak tersedia untuk perusahaan ini.', 'prohibited' => 'Kolom :attribute tidak boleh diubah melalui endpoint ini.'];
    }

    /** @return array<\Closure> */
    public function after(): array
    {
        return [function ($validator) {
            $walk = function ($values, $prefix = '') use (&$walk, $validator) {
                foreach ($values as $key => $value) {
                    $path = $prefix === '' ? (string) $key : $prefix.'.'.$key;
                    if (is_array($value)) {
                        $walk($value, $path);
                    } elseif (is_string($value)) {
                        (new PlainText)->validate($path, $value, fn ($message) => $validator->errors()->add($path, $message));
                    }
                }
            };
            $walk($this->except(['password', 'password_confirmation', 'file']));
        }];
    }

    /** @return array<string, string> */
    protected function ownershipRules(): array
    {
        return ['company_id' => 'prohibited', 'id' => 'prohibited', 'actor_id' => 'prohibited'];
    }

    /** @return array<int, mixed> */
    protected function mediaRule(): array
    {
        return ['nullable', 'integer', Rule::exists('media', 'id')->where('company_id', $this->attributes->get('cmsCompany')->id)];
    }
}
