<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $t) {
            $t->id();
            $t->foreignId('company_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->text('address')->nullable();
            $t->string('phone', 30)->nullable();
            $t->string('status')->default('draft');
            $t->timestamps();
            $t->softDeletes();
            $t->index(['company_id', 'status', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
