<?php

namespace App\Console\Commands;

use App\Cms\Audit;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PromoteCmsAdmin extends Command
{
    protected $signature = 'cms:promote {email : Email pengguna terdaftar}';

    protected $description = 'Berikan akses super admin CMS kepada pengguna yang sudah ada.';

    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();
        if (! $user) {
            $this->error('Pengguna belum terdaftar.');

            return self::FAILURE;
        }
        DB::transaction(function () use ($user) {
            $user->forceFill(['is_super_admin' => true])->save();
            Audit::record('user.promoted_by_console', $user, ['is_super_admin']);
        });
        $this->info('Akses super admin CMS diberikan.');

        return self::SUCCESS;
    }
}
