<?php

return [
    'media_disk' => env('CMS_MEDIA_DISK', 'cms'),
    'media_url_ttl_seconds' => max(15, min(300, (int) env('CMS_MEDIA_URL_TTL_SECONDS', 60))),
    'image_max_kb' => (int) env('CMS_IMAGE_MAX_KB', 5120),
    'templates' => ['simple', 'catalog', 'services'],
    'fonts' => ['system', 'inter', 'noto-sans'],
    'section_types' => ['hero', 'text', 'products', 'gallery', 'contact', 'articles'],
];
