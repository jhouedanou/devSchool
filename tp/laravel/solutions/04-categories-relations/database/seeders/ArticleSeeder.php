<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Categorie;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    /**
     * Crée 4 catégories, 10 articles publiés et 2 brouillons.
     */
    public function run(): void
    {
        $categories = collect(['Laravel', 'PHP', 'Vue', 'Outils'])->map(
            fn (string $nom) => Categorie::firstOrCreate(['slug' => Str::slug($nom)], ['nom' => $nom])
        );

        Article::factory(10)
            ->state(fn () => ['categorie_id' => $categories->random()->id])
            ->create();

        Article::factory(2)->brouillon()->create();
    }
}
