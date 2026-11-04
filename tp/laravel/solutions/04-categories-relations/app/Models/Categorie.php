<?php

namespace App\Models;

use Database\Factories\CategorieFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// Laravel devine la table « categories » à partir du nom du modèle.
#[Fillable(['nom', 'slug'])]
class Categorie extends Model
{
    /** @use HasFactory<CategorieFactory> */
    use HasFactory;

    /**
     * Les articles de la catégorie (clé étrangère : categorie_id).
     *
     * @return HasMany<Article, $this>
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }
}
