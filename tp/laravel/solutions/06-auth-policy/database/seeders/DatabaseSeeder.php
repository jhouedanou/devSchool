<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Remplit la base : php artisan db:seed (ou php artisan migrate:fresh --seed).
     */
    public function run(): void
    {
        // Mot de passe : « password » (voir UserFactory).
        $utilisateur = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call(ArticleSeeder::class);

        // Quelques articles écrits par l'utilisateur de test, visibles dans /mes-articles.
        Article::factory(3)->for($utilisateur, 'auteur')->create();
    }
}
