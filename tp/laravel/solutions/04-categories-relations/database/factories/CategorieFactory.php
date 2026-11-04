<?php

namespace Database\Factories;

use App\Models\Categorie;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Categorie>
 */
class CategorieFactory extends Factory
{
    /**
     * État par défaut d'une catégorie.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nom = ucfirst(fake()->unique()->word());

        return [
            'nom' => $nom,
            'slug' => Str::slug($nom),
        ];
    }
}
