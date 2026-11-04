<?php

use App\Http\Controllers\ArticleController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Route;

// TP 01 : pages simples avec des routes nommées.
Route::view('/', 'accueil')->name('accueil');

Route::view('/a-propos', 'a-propos')->name('a-propos');

Route::get('/bonjour/{nom}', [PageController::class, 'bonjour'])->name('bonjour');

// TP 02 : articles publics.
Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
Route::get('/articles/{article:slug}', [ArticleController::class, 'show'])->name('articles.show');
