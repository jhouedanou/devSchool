<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    /**
     * Crée 10 articles publiés et 2 brouillons.
     */
    public function run(): void
    {
        Article::factory(10)->create();

        Article::factory(2)->brouillon()->create();
    }
}
