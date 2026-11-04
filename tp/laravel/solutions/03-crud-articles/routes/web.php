<?php

use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\ArticleController;
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
