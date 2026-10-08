<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('cms_driver', 40)->default('generic');
        });
    }

    public function down(): void
    {
        Schema::table('companies', fn (Blueprint $table) => $table->dropColumn('cms_driver'));
    }
};
