<?php

namespace App\Http\Controllers\Cms;

use App\Cms\Audit;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\ListRequest;
use App\Http\Requests\Cms\UserRequest;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /** @return LengthAwarePaginator<int, User> */
    public function index(ListRequest $request): LengthAwarePaginator
    {
        abort_unless($request->user()->is_super_admin, 403);

        return User::select('id', 'name', 'email', 'is_super_admin')->with('companies:id,name,slug')->orderBy('id')->paginate($request->integer('per_page', 20));
    }

    public function show(Request $request, string $user): JsonResponse
    {
        abort_unless($request->user()->is_super_admin, 403);
        $item = User::with('companies:id,name,slug')->findOrFail($user);

        return response()->json(['data' => array_merge($item->only(['id', 'name', 'email', 'is_super_admin']), ['memberships' => $item->companies->map(fn ($company) => ['company_id' => $company->id, 'company_name' => $company->name, 'role' => $company->pivot->getAttribute('role')])])]);
    }

    public function store(UserRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $u = new User;
            $this->save($request, $u);
            Audit::record('user.created', $u);

            return $u;
        });

        return response()->json(['data' => $user->refresh()->only(['id', 'name', 'email', 'is_super_admin'])], 201);
    }

    public function update(UserRequest $request, string $user): JsonResponse
    {
        $item = DB::transaction(function () use ($request, $user) {
            $item = User::lockForUpdate()->findOrFail($user);
            abort_if($item->id === $request->user()->id && $request->has('is_super_admin') && ! $request->boolean('is_super_admin'), 422, 'Tidak dapat mencabut akses super admin sendiri.');
            $this->save($request, $item);
            Audit::record('user.updated', $item, array_keys($request->validated()));

            return $item;
        });

        return response()->json(['data' => $item->only(['id', 'name', 'email', 'is_super_admin'])]);
    }

    public function destroy(Request $request, string $user): Response
    {
        abort_unless($request->user()->is_super_admin, 403);
        $item = User::findOrFail($user);
        abort_if($item->is_super_admin, 422, 'Cabut role super admin melalui admin lain sebelum menghapus pengguna.');
        DB::transaction(function () use ($item) {
            Audit::record('user.deleted', $item);
            DB::table('sessions')->where('user_id', $item->id)->delete();
            $item->delete();
        });

        return response()->noContent();
    }

    private function save(UserRequest $request, User $user): void
    {
        $data = $request->validated();
        $user->fill(collect($data)->only(['name', 'email', 'password'])->all());
        if (array_key_exists('is_super_admin', $data)) {
            $user->is_super_admin = $data['is_super_admin'];
        }
        $user->save();
        if (array_key_exists('memberships', $data)) {
            $members = [];
            foreach ($data['memberships'] as $m) {
                $members[$m['company_id']] = ['role' => $m['role']];
            }
            $user->companies()->sync($members);
        }
    }
}
