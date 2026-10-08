<?php

namespace App\Cms;

/** Code-owned schema; never load frontend templates or executable configuration from a dataset. */
final class AcalaDefinition
{
    /** @return array<string, mixed> */
    public static function get(): array
    {
        $content = [
            self::field('page', 'text', 'Halaman', true, 80), self::field('section', 'text', 'Bagian', true, 80),
            self::field('label', 'text', 'Label', false, 120), self::field('eyebrow', 'text', 'Eyebrow', false, 160),
            self::field('title', 'text', 'Judul', false, 255), self::field('subtitle', 'textarea', 'Subjudul', false, 1000),
            self::field('body', 'textarea', 'Isi', false, 50000), self::field('image', 'text', 'URL gambar', false, 500),
            self::field('cta_label', 'text', 'Label tombol', false, 160), self::field('cta_url', 'text', 'URL tombol', false, 500),
            self::field('sort_order', 'number', 'Urutan', false, 100000), self::field('is_published', 'checkbox', 'Terbit'),
            self::field('metadata', 'json', 'Metadata', false, 1048576),
        ];
        $datasets = [
            'branches' => 'Branches', 'branch_booking_urls' => 'Branch Booking URLs', 'contact_links' => 'Contact Links',
            'booking_actions' => 'Booking Actions', 'booking_action_cards' => 'Booking Action Cards', 'blog_highlights' => 'Blog Highlights',
            'hero_collage_images' => 'Hero Collage Images', 'branch_moments' => 'Branch Moments', 'gallery_branches' => 'Gallery Branches',
            'reviews' => 'Reviews', 'menu_categories' => 'Menu Categories', 'menu_items' => 'Menu Items', 'branch_options' => 'Branch USP Options',
            'branch_usps' => 'Branch USP Cards', 'home_menu_groups' => 'Home Menu Groups',
        ];

        return [
            'driver' => 'acala', 'name' => 'Acala',
            'modules' => [
                ['key' => 'content-blocks', 'label' => 'Konten Acala', 'fields' => $content],
                ['key' => 'datasets', 'label' => 'Data Acala', 'fields' => [
                    self::field('key', 'text', 'Kunci', true, 100), self::field('label', 'text', 'Label', true, 160),
                    self::field('description', 'textarea', 'Deskripsi', false, 1000), self::field('data', 'json', 'Data JSON', true, 1048576),
                    self::field('sort_order', 'number', 'Urutan', false, 100000), self::field('is_published', 'checkbox', 'Terbit'),
                ]],
                ['key' => 'image-slots', 'label' => 'Gambar Acala', 'fields' => [
                    self::field('key', 'text', 'Kunci', true, 100), self::field('group', 'text', 'Grup', true, 100),
                    self::field('label', 'text', 'Label', true, 160), self::field('path', 'text', 'URL gambar', true, 500), self::field('alt', 'text', 'Teks alternatif', false, 500),
                ]],
            ],
            'pages' => ['home', 'about', 'branches', 'menu', 'gallery', 'blog', 'contact', 'reservation', 'branch-nusa-dua', 'branch-nusa-lembongan'],
            'datasets' => array_map(fn (string $key, string $label): array => ['key' => $key, 'label' => $label], array_keys($datasets), array_values($datasets)),
            // Page-local reads plus shared dependencies are fetched independently, never as one all-payload request.
            'shared_dependencies' => ['branches', 'booking_actions'],
            'dependencies' => [
                'home' => ['branches', 'booking_actions', 'hero_collage_images', 'branch_options', 'branch_usps', 'home_menu_groups', 'gallery_branches', 'blog_highlights', 'reviews'],
                'about' => ['branches', 'blog_highlights'], 'branches' => ['branches'], 'menu' => ['branches'],
                'gallery' => ['branches', 'gallery_branches', 'blog_highlights'], 'blog' => ['blog_highlights', 'booking_actions'],
                'contact' => ['branches', 'booking_action_cards', 'contact_links', 'blog_highlights'],
                'reservation' => ['branches', 'booking_actions', 'branch_booking_urls'],
                'branch-nusa-dua' => ['branches', 'booking_actions', 'branch_moments', 'blog_highlights'],
                'branch-nusa-lembongan' => ['branches', 'booking_actions', 'branch_moments', 'blog_highlights'],
            ],
        ];
    }

    /** @return array<string, mixed> */
    private static function field(string $key, string $type, string $label, bool $required = false, ?int $max = null): array
    {
        $field = ['key' => $key, 'type' => $type, 'label' => $label];
        if ($required) {
            $field['required'] = true;
        }
        if ($max !== null) {
            $field['max'] = $max;
        }

        return $field;
    }
}
