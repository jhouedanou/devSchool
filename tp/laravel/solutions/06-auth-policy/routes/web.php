<?php

use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\ConnexionController;
use App\Http\Controllers\MesArticlesController;
use Illuminate\Support\Facades\Route;

// TP 01 : pages simples avec des routes nommées.
Route::view('/', 'accueil')->name('accueil');

Route::view('/a-propos', 'a-propos')->name('a-propos');

Route::get('/bonjour/{nom}', function (string $nom) {
    return view('bonjour', ['nom' => $nom]);
})->name('bonjour');

// TP 02 : articles publics.
Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
Route::get('/articles/{article:slug}', [ArticleController::class, 'show'])->name('articles.show');

// TP 03 : administration des articles (routes admin.articles.*).
Route::prefix('admin')->name('admin.')->group(function () {
    Route::resource('articles', AdminArticleController::class)->except('show');
});

// TP 04 : catégories.
Route::get('/categories', [CategorieController::class, 'index'])->name('categories.index');
Route::get('/categories/{categorie:slug}', [CategorieController::class, 'show'])->name('categories.show');

// TP 06 : connexion et déconnexion.
Route::middleware('guest')->group(function () {
    Route::get('/connexion', [ConnexionController::class, 'create'])->name('connexion');
    Route::post('/connexion', [ConnexionController::class, 'store']);
});

Route::post('/deconnexion', [ConnexionController::class, 'destroy'])
    ->middleware('auth')
    ->name('deconnexion');

// TP 06 : espace de l'auteur connecté (routes mes-articles.*).
// L'admin du TP 03 et l'API du TP 05 ne changent pas : leurs tests restent valables.
Route::middleware('auth')->group(function () {
    Route::resource('mes-articles', MesArticlesController::class)
        ->except('show')
        ->parameters(['mes-articles' => 'article']);
});
