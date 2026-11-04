<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ArticleRequest extends FormRequest
{
    /**
     * Tout le monde peut envoyer ce formulaire (pas encore d'authentification).
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prépare les données avant la validation :
     * le slug vient du titre, et une case non cochée devient false.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug((string) $this->input('titre')),
            'publie' => $this->boolean('publie'),
        ]);
    }

    /**
     * Règles de validation.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titre' => ['required', 'string', 'min:3', 'max:120'],
            // En modification, on ignore l'article en cours : garder son titre reste permis.
            'slug' => ['required_with:titre', Rule::unique('articles', 'slug')->ignore($this->route('article'))],
            'contenu' => ['required', 'string', 'min:10'],
            'publie' => ['boolean'],
        ];
    }

    /**
     * Messages d'erreur en français.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'titre.required' => 'Le titre est obligatoire.',
            'titre.min' => 'Le titre doit contenir au moins 3 caractères.',
            'titre.max' => 'Le titre ne doit pas dépasser 120 caractères.',
            'slug.required_with' => 'Le titre doit contenir au moins une lettre ou un chiffre.',
            'slug.unique' => 'Un article avec ce titre existe déjà.',
            'contenu.required' => 'Le contenu est obligatoire.',
            'contenu.min' => 'Le contenu doit contenir au moins 10 caractères.',
        ];
    }
}
