<?php

namespace App\Models;

use Database\Factories\ArticleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['titre', 'slug', 'contenu', 'publie'])]
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
}
