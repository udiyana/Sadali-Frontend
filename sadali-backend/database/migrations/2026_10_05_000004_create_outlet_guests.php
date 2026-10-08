<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->string('first_name', 120);
            $t->string('last_name', 120)->nullable();
            $t->string('email')->nullable();
            $t->string('phone', 30)->nullable();
            $t->timestamps();
            $t->index(['company_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
