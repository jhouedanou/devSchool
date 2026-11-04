<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ajoute la catégorie (facultative) de chaque article.
     */
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->foreignId('categorie_id')
                ->nullable()
                ->after('id')
                ->constrained('categories')
                ->nullOnDelete();
        });
    }

    /**
     * Retire la colonne et sa clé étrangère.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('categorie_id');
        });
    }
};
