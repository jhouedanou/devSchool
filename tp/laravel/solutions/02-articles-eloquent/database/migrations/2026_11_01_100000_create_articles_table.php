<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Crée la table des articles.
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->string('slug')->unique();
            $table->text('contenu');
            $table->boolean('publie')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Supprime la table des articles.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
