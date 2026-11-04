<?php

namespace App\Models;

use Database\Factories\ArticleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// user_id n'est pas « fillable » : l'auteur vient de l'utilisateur connecté, jamais du formulaire.
#[Fillable(['titre', 'slug', 'contenu', 'publie', 'categorie_id'])]
class Article extends Model
{
    /** @use HasFactory<ArticleFactory> */
    use HasFactory;

    /**
     * Conversions automatiques des colonnes.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'publie' => 'boolean',
        ];
    }

    /**
     * Garde seulement les articles publiés : Article::publies()->get().
     */
    #[Scope]
    protected function publies(Builder $query): void
    {
        $query->where('publie', true);
    }

    /**
     * La catégorie de l'article (colonne categorie_id, peut être vide).
     *
     * @return BelongsTo<Categorie, $this>
     */
    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    /**
     * L'auteur de l'article. Le nom de la relation (auteur) ne suit pas
     * le nom de la colonne (user_id) : on précise donc la clé étrangère.
     *
     * @return BelongsTo<User, $this>
     */
    public function auteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
