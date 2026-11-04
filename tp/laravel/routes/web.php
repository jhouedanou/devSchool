<?php

use Illuminate\Support\Facades\Route;

// Projet de TP : un petit blog construit TP après TP.
// Les énoncés sont dans le dossier enonces/. Lance les tests avec : php artisan test

// TODO TP 01 : remplace cette route par la page d'accueil (URL « / », nom « accueil »).
Route::get('/', function () {
    return view('welcome');
});

// TODO TP 01 : ajoute la page « À propos » (URL « /a-propos », nom « a-propos »).

// TODO TP 01 : ajoute la page « Bonjour » (URL « /bonjour/{nom} », nom « bonjour »).

// TODO TP 02 : liste des articles publiés (« /articles ») et page d'un article (« /articles/{article:slug} »).

// TODO TP 03 : CRUD d'administration sous « /admin/articles » avec Route::resource().

// TODO TP 04 : pages des catégories (« /categories » et « /categories/{categorie:slug} »).

// TODO TP 06 : connexion, déconnexion et espace « /mes-articles ».
