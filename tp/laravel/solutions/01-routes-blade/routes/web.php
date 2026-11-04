<?php

use Illuminate\Support\Facades\Route;

// TP 01 : pages simples avec des routes nommées.
Route::view('/', 'accueil')->name('accueil');

Route::view('/a-propos', 'a-propos')->name('a-propos');

Route::get('/bonjour/{nom}', function (string $nom) {
    return view('bonjour', ['nom' => $nom]);
})->name('bonjour');
