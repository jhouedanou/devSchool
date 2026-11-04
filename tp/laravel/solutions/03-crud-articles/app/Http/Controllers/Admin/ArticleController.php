<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleRequest;
use App\Models\Article;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ArticleController extends Controller
{
    /**
     * Tous les articles, publiés ou non.
     */
    public function index(): View
    {
        $articles = Article::latest()->get();

        return view('admin.articles.index', ['articles' => $articles]);
    }

    /**
     * Formulaire de création.
     */
    public function create(): View
    {
        return view('admin.articles.create');
    }

    /**
     * Enregistre un nouvel article (données déjà validées par ArticleRequest).
     */
    public function store(ArticleRequest $request): RedirectResponse
    {
        Article::create($request->validated());

        return to_route('admin.articles.index')->with('succes', 'Article créé.');
    }

    /**
     * Formulaire de modification.
     */
    public function edit(Article $article): View
    {
        return view('admin.articles.edit', ['article' => $article]);
    }

    /**
     * Met à jour un article.
     */
    public function update(ArticleRequest $request, Article $article): RedirectResponse
    {
        $article->update($request->validated());

        return to_route('admin.articles.index')->with('succes', 'Article modifié.');
    }

    /**
     * Supprime un article.
     */
    public function destroy(Article $article): RedirectResponse
    {
        $article->delete();

        return to_route('admin.articles.index')->with('succes', 'Article supprimé.');
    }
}
