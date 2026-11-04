<?php

namespace App\Http\Controllers;

use App\Http\Requests\ArticleRequest;
use App\Models\Article;
use App\Models\Categorie;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\View\View;

// Espace de l'auteur connecté. Les routes sont protégées par le middleware « auth ».
class MesArticlesController extends Controller
{
    /**
     * Les articles de l'utilisateur connecté.
     */
    public function index(Request $request): View
    {
        $articles = $request->user()->articles()->with('categorie')->latest()->get();

        return view('mes-articles.index', ['articles' => $articles]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): View
    {
        return view('mes-articles.create', [
            'categories' => Categorie::orderBy('nom')->get(),
        ]);
    }

    /**
     * Crée un article dont l'auteur est l'utilisateur connecté.
     */
    public function store(ArticleRequest $request): RedirectResponse
    {
        // Passer par la relation remplit user_id automatiquement.
        $request->user()->articles()->create($request->validated());

        return to_route('mes-articles.index')->with('succes', 'Article créé.');
    }

    /**
     * Formulaire de modification (réservé à l'auteur).
     */
    public function edit(Article $article): View
    {
        Gate::authorize('update', $article);

        return view('mes-articles.edit', [
            'article' => $article,
            'categories' => Categorie::orderBy('nom')->get(),
        ]);
    }

    /**
     * Met à jour l'article (réservé à l'auteur).
     */
    public function update(ArticleRequest $request, Article $article): RedirectResponse
    {
        Gate::authorize('update', $article);

        $article->update($request->validated());

        return to_route('mes-articles.index')->with('succes', 'Article modifié.');
    }

    /**
     * Supprime l'article (réservé à l'auteur).
     */
    public function destroy(Article $article): RedirectResponse
    {
        Gate::authorize('delete', $article);

        $article->delete();

        return to_route('mes-articles.index')->with('succes', 'Article supprimé.');
    }
}
