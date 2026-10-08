<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $t) {
            $t->string('domain', 253)->nullable()->unique();
            $t->string('logo_url', 500)->nullable();
            $t->json('settings')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $t) {
            $t->dropUnique(['domain']);
            $t->dropColumn(['domain', 'logo_url', 'settings']);
        });
    }
};
