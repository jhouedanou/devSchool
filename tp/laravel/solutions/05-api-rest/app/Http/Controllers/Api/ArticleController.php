<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ArticleController extends Controller
{
    /**
     * GET /api/articles : liste paginée (10 par page), du plus récent au plus ancien.
     */
    public function index(): AnonymousResourceCollection
    {
        $articles = Article::with('categorie')->latest()->paginate(10);

        return ArticleResource::collection($articles);
    }

    /**
     * POST /api/articles : crée un article et répond 201.
     * ArticleRequest renvoie 422 en JSON si les données sont invalides.
     */
    public function store(ArticleRequest $request): JsonResponse
    {
        $article = Article::create($request->validated());

        return ArticleResource::make($article->load('categorie'))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * GET /api/articles/{article} : un article (404 s'il n'existe pas).
     */
    public function show(Article $article): ArticleResource
    {
        return ArticleResource::make($article->load('categorie'));
    }

    /**
     * PUT/PATCH /api/articles/{article} : modifie un article et répond 200.
     */
    public function update(ArticleRequest $request, Article $article): ArticleResource
    {
        $article->update($request->validated());

        return ArticleResource::make($article->load('categorie'));
    }

    /**
     * DELETE /api/articles/{article} : supprime et répond 204 (sans contenu).
     */
    public function destroy(Article $article): Response
    {
        $article->delete();

        return response()->noContent();
    }
}
