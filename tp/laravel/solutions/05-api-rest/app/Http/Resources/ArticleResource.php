<?php

namespace App\Http\Resources;

use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Article
 */
class ArticleResource extends JsonResource
{
    /**
     * Les champs exposés par l'API (ni updated_at ni categorie_id).
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'slug' => $this->slug,
            'contenu' => $this->contenu,
            'publie' => $this->publie,
            // Présente seulement si la relation a été chargée avec with() ou load().
            'categorie' => CategorieResource::make($this->whenLoaded('categorie')),
            'cree_le' => $this->created_at?->toIso8601String(),
        ];
    }
}
