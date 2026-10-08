<?php

namespace App\Cms;

use App\Models\Media;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

final class MediaDelivery
{
    public function response(Media $media): Response
    {
        $disk = Storage::disk($media->disk);
        // The controller has already checked membership/publication. Never cache this redirect.
        if (config('filesystems.disks.'.$media->disk.'.driver') === 's3'
          && config('filesystems.disks.'.$media->disk.'.cms_delivery') === 'temporary_url') {
            $url = $disk->temporaryUrl($media->path, now()->addSeconds(config('cms.media_url_ttl_seconds')), [
                'ResponseContentType' => $media->mime,
                'ResponseContentDisposition' => 'inline',
                'ResponseCacheControl' => 'private, no-store',
            ]);
            abort_unless(parse_url($url, PHP_URL_SCHEME) === 'https', 500);

            // Skip an additional HEAD request: an expired/missing object is handled by the storage provider.
            return redirect()->away($url)->withHeaders(['Cache-Control' => 'private, no-store', 'Referrer-Policy' => 'no-referrer']);
        }
        abort_unless($disk->exists($media->path), 404);

        return $disk->response($media->path, null, ['Content-Type' => $media->mime, 'X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store'], 'inline');
    }
}
