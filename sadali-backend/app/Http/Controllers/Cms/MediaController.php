<?php

namespace App\Http\Controllers\Cms;

use App\Cms\Audit;
use App\Cms\MediaDelivery;
use App\Cms\PublicMedia;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\ListRequest;
use App\Http\Requests\Cms\MediaRequest;
use App\Http\Resources\Cms\CmsResource;
use App\Models\Company;
use App\Models\Media;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response as FileResponse;

class MediaController extends Controller
{
    public function index(ListRequest $request): AnonymousResourceCollection
    {
        return CmsResource::collection(Media::orderBy('id')->paginate($request->integer('per_page', 20)));
    }

    public function store(MediaRequest $request): JsonResponse
    {
        $disk = config('cms.media_disk');
        if (config('filesystems.disks.'.$disk.'.visibility') !== 'private') {
            throw new \LogicException('CMS media requires a private storage disk.');
        }
        $file = $request->file('file');
        $mime = $file->getMimeType();
        $dimensions = getimagesize($file->getRealPath());
        // Network I/O must not hold a database transaction or the company row lock.
        $path = $file->store('companies/'.$request->attributes->get('cmsCompany')->id.'/originals', [
            'disk' => $disk,
            'visibility' => 'private',
            'ContentType' => $mime,
            'CacheControl' => 'private, no-store',
        ]);
        if (! $path) {
            throw new \RuntimeException('Media storage failed.');
        }
        try {
            $media = DB::transaction(function () use ($request, $disk, $file, $path, $mime, $dimensions) {
                $company = Company::whereKey($request->attributes->get('cmsCompany')->id)->lockForUpdate()->firstOrFail();
                $limit = $company->feature_limits['media'] ?? null;
                if ($limit !== null && Media::count() >= $limit) {
                    throw ValidationException::withMessages(['limit' => 'Batas media paket telah tercapai.']);
                }
                $media = Media::create(['disk' => $disk, 'path' => $path, 'mime' => $mime, 'size' => $file->getSize(), 'width' => $dimensions[0] ?? null, 'height' => $dimensions[1] ?? null, 'alt' => $request->validated('alt')]);
                Audit::record('media.uploaded', $media);

                return $media;
            });
        } catch (\Throwable $error) {
            try {
                Storage::disk($disk)->delete($path);
            } catch (\Throwable $cleanupError) {
                report($cleanupError);
            }
            throw $error;
        }

        return (new CmsResource($media))->response()->setStatusCode(201);
    }

    public function file(Request $request, string $company, string $media, MediaDelivery $delivery): FileResponse
    {
        $item = Media::findOrFail($media);
        if ($request->is('api/v1/public/*')) {
            abort_unless(PublicMedia::isVisible($item->id), 404);
        }

        return $delivery->response($item);
    }

    public function destroy(Request $request, string $company, string $media): Response
    {
        Gate::authorize('update', $request->attributes->get('cmsCompany'));
        $item = Media::findOrFail($media);
        // Foreign keys deliberately reject deleting referenced files.
        try {
            DB::transaction(function () use ($item) {
                Audit::record('media.deleted', $item);
                $item->delete();
            });
        } catch (QueryException $e) {
            if (in_array((string) $e->getCode(), ['23000', '23503'])) {
                abort(409, 'Media masih digunakan oleh konten.');
            } throw $e;
        }
        Storage::disk($item->disk)->delete($item->path);

        return response()->noContent();
    }
}
