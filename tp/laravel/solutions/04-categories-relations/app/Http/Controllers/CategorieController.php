<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\View\View;

class CategorieController extends Controller
{
    /**
     * Toutes les catégories avec leur nombre d'articles publiés.
     */
    public function index(): View
    {
        // withCount ajoute un attribut articles_count, calculé en une seule requête.
        $categories = Categorie::withCount([
            'articles' => fn (Builder $query) => $query->publies(),
        ])->orderBy('nom')->get();

        return view('categories.index', ['categories' => $categories]);
    }

    /**
     * Une catégorie (retrouvée par son slug) et ses articles publiés.
     */
    public function show(Categorie $categorie): View
    {
        $articles = $categorie->articles()->publies()->latest()->get();

        return view('categories.show', [
            'categorie' => $categorie,
            'articles' => $articles,
        ]);
    }
}
