<?php

use App\Http\Controllers\Api\ArticleController;
use Illuminate\Support\Facades\Route;

// Toutes les routes de ce fichier commencent par /api (voir bootstrap/app.php).
// names('api.articles') évite le conflit avec les routes web articles.index et articles.show.
Route::apiResource('articles', ArticleController::class)->names('api.articles');
