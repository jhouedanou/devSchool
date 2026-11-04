<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ajoute l'auteur de chaque article.
     * Nullable : les articles créés dans l'admin (TP 03) ou l'API (TP 05) n'ont pas d'auteur.
     */
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('categorie_id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    /**
     * Retire la colonne et sa clé étrangère.
     */
    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
