<?php

namespace Database\Factories;

use App\Models\Article;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    /**
     * État par défaut : un article publié.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titre = rtrim(fake()->unique()->sentence(4), '.');

        return [
            'titre' => $titre,
            'slug' => Str::slug($titre),
            'contenu' => fake()->paragraphs(3, true),
            'publie' => true,
        ];
    }

    /**
     * Un article non publié (brouillon).
     */
    public function brouillon(): static
    {
        return $this->state(fn (array $attributes) => [
            'publie' => false,
        ]);
    }
}
