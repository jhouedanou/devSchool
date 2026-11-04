<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\View\View;

class ArticleController extends Controller
{
    /**
     * Liste des articles publiés, du plus récent au plus ancien.
     */
    public function index(): View
    {
        // with('categorie') : chargement anticipé (eager loading), 2 requêtes au lieu de 1 + N.
        $articles = Article::with('categorie')->publies()->latest()->get();

        return view('articles.index', ['articles' => $articles]);
    }

    /**
     * Un article, retrouvé par son slug (route /articles/{article:slug}).
     */
    public function show(Article $article): View
    {
        abort_unless($article->publie, 404);

        return view('articles.show', ['article' => $article->load('categorie')]);
    }
}
