# Routes et contrôleurs

## Objectifs

- Déclarer des routes pour chaque méthode HTTP.
- Utiliser des paramètres d'URL, optionnels ou contraints.
- Nommer les routes et générer leurs URL avec `route()`.
- Grouper les routes avec un préfixe ou un middleware.
- Déplacer la logique dans un contrôleur et lire la requête.
- Renvoyer une vue, du JSON ou une redirection.

## Une première route

Une **route** associe une méthode HTTP et une URL à une action.
Les routes des pages se trouvent dans `routes/web.php`.

```php
<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/bonjour', function () {
    return 'Bonjour !';
});
```

Va sur http://localhost:8000/bonjour : la page affiche « Bonjour ! ».

## Les méthodes HTTP

```php
Route::get('/articles', $action);             // lire
Route::post('/articles', $action);            // créer
Route::put('/articles/{id}', $action);        // modifier (tout l'objet)
Route::patch('/articles/{id}', $action);      // modifier (une partie)
Route::delete('/articles/{id}', $action);     // supprimer

Route::match(['get', 'post'], '/contact', $action);   // plusieurs méthodes
Route::view('/a-propos', 'about');                    // affiche directement une vue
Route::redirect('/accueil', '/');                     // redirection 302
```

Un formulaire HTML ne connaît que GET et POST.
Pour PUT, PATCH et DELETE, tu ajoutes `@method('PUT')` dans le formulaire (leçon 7).

> [!IMPORTANT]
> Tout formulaire POST, PUT, PATCH ou DELETE vers `routes/web.php` doit contenir `@csrf`.
> Sans ce jeton, Laravel répond **419 Page Expired**.

## Les paramètres de route

Écris le paramètre entre accolades. Laravel le passe à ta fonction.

```php
Route::get('/articles/{id}', function (string $id) {
    return "Article n° $id";
});

Route::get('/articles/{article}/commentaires/{commentaire}', function (string $article, string $commentaire) {
    return "Commentaire $commentaire de l'article $article";
});
```

Les paramètres sont passés **dans l'ordre de l'URL**, pas selon leur nom.

### Paramètre optionnel

Ajoute `?` après le nom et donne une valeur par défaut à la variable.

```php
Route::get('/bonjour/{nom?}', function (?string $nom = 'inconnu') {
    return "Bonjour $nom";
});
// /bonjour      → Bonjour inconnu
// /bonjour/Ada  → Bonjour Ada
```

### Contraintes

Une contrainte limite les valeurs acceptées. Si la valeur ne correspond pas, Laravel répond 404.

```php
Route::get('/articles/{id}', $action)->whereNumber('id');
Route::get('/auteurs/{nom}', $action)->whereAlpha('nom');
Route::get('/articles/{slug}', $action)->where('slug', '[a-z0-9-]+');
Route::get('/langages/{langage}', $action)->whereIn('langage', ['php', 'js']);
```

## Les routes nommées

Donne un nom à la route avec `->name()`. Génère ensuite son URL avec `route()`.

```php
Route::get('/articles/{id}', $action)->name('articles.show');

route('articles.show', ['id' => 5]);   // http://localhost:8000/articles/5
route('articles.show', 5);             // même résultat
route('articles.index', ['page' => 2]); // paramètre en trop → ?page=2
```

Dans une vue Blade :

```blade
<a href="{{ route('articles.show', $article->id) }}">Lire</a>
```

Avantage : tu peux changer l'URL dans `web.php` sans casser les liens.
Convention de nommage : `ressource.action` (`articles.index`, `articles.show`…).

## Les groupes de routes

Un groupe applique la même option à plusieurs routes.

```php
// Préfixe d'URL et de nom
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('/articles', $action)->name('articles');
    // URL : /admin/articles   Nom : admin.articles
});

// Middleware pour tout le groupe (ici : utilisateur connecté)
Route::middleware('auth')->group(function () {
    Route::get('/profil', $action);
    Route::get('/parametres', $action);
});
```

Rappel : un middleware est un filtre qui s'exécute avant ton code. `auth` bloque les visiteurs non connectés.

## Les contrôleurs

Un **contrôleur** est une classe qui regroupe les actions liées à une ressource.
Il évite de mettre toute la logique dans `web.php`.

```bash
php artisan make:controller ArticleController
```

Laravel crée `app/Http/Controllers/ArticleController.php` :

```php
<?php

namespace App\Http\Controllers;

class ArticleController extends Controller
{
    public function index()
    {
        return view('articles.index');
    }

    public function show(string $id)
    {
        return view('articles.show', ['id' => $id]);
    }
}
```

Relie les routes aux méthodes avec un tableau `[Classe::class, 'méthode']` :

```php
use App\Http\Controllers\ArticleController;

Route::get('/articles', [ArticleController::class, 'index'])->name('articles.index');
Route::get('/articles/{id}', [ArticleController::class, 'show'])->name('articles.show');
```

Tu peux aussi grouper les routes d'un même contrôleur :

```php
Route::controller(ArticleController::class)->group(function () {
    Route::get('/articles', 'index')->name('articles.index');
    Route::get('/articles/{id}', 'show')->name('articles.show');
});
```

### Contrôleur à une seule action

```bash
php artisan make:controller AccueilController --invokable
```

La classe a une seule méthode `__invoke()`. La route cite seulement la classe :

```php
Route::get('/', AccueilController::class)->name('accueil');
```

> [!NOTE]
> **Changé depuis Laravel 8** : Laravel n'ajoute plus le namespace des contrôleurs, donc `'ArticleController@index'` ne marche plus. Utilise `[ArticleController::class, 'index']`.
> **Depuis Laravel 11**, la classe de base `Controller` est vide. `$this->validate()` et `$this->authorize()` n'existent plus par défaut. Tu utilises `$request->validate()` (leçon 6) et `Gate::authorize()` (leçon 8).

## Lire la requête

Ajoute `Request $request` dans les paramètres : Laravel te donne l'objet tout seul.
On appelle ça l'**injection de dépendances**.

```php
use Illuminate\Http\Request;

public function store(Request $request)
{
    $titre = $request->input('title');        // champ de formulaire ou de JSON
    $page = $request->query('page', 1);        // ?page=2, sinon 1
    $donnees = $request->only(['title', 'body']);
    $publie = $request->boolean('published');  // "1", "on", "true" → true

    if ($request->has('title')) {
        // le champ est présent
    }

    $request->method();   // "POST"
    $request->path();     // "articles"
}
```

Avec des paramètres de route, mets `Request` **avant** eux :

```php
public function update(Request $request, string $id)
{
    // ...
}
```

## Les réponses

| Tu renvoies… | Laravel envoie… |
|--------------|-----------------|
| une chaîne | une page HTML |
| un tableau ou un modèle Eloquent | du JSON |
| `view('articles.index')` | une vue Blade |
| `response()->json($data, 201)` | du JSON avec le code 201 |
| `redirect('/articles')` | une redirection 302 |
| `response()->noContent()` | une réponse vide 204 |

```php
// JSON
return ['nom' => 'Ada', 'langage' => 'PHP'];
return response()->json(['message' => 'Créé'], 201);

// Redirections
return redirect('/articles');
return redirect()->route('articles.show', 5);
return to_route('articles.index');          // raccourci de redirect()->route()
return back();                              // page précédente

// Redirection avec un message flash (affiché une seule fois)
return to_route('articles.index')->with('success', 'Article créé.');

// Erreurs
abort(404);
abort_if($article === null, 404);
```

## Voir ses routes

```bash
php artisan route:list
php artisan route:list --path=articles   # filtre sur l'URL
php artisan route:list -v                # affiche aussi les middleware
```

```text
GET|HEAD  articles ........ articles.index › ArticleController@index
GET|HEAD  articles/{id} ... articles.show  › ArticleController@show
```

## Pièges fréquents

- **Ordre des routes** : `/articles/{id}` déclarée avant `/articles/create` capture « create ». Déclare les routes fixes d'abord, ou ajoute `->whereNumber('id')`.
- **`Target class [ArticleController] does not exist`** : il manque `use App\Http\Controllers\ArticleController;` en haut de `web.php`.
- **419 Page Expired** : le formulaire n'a pas `@csrf`.
- **`Missing required parameter`** : tu appelles `route('articles.show')` sans donner l'`id`.
- **Paramètre optionnel sans défaut** : `{nom?}` demande `?string $nom = null` (ou une autre valeur).
- **Routes en cache** : après `php artisan route:cache`, une nouvelle route n'apparaît pas. Lance `php artisan route:clear`.

## Résumé

- `Route::get/post/put/patch/delete(url, action)` déclare une route dans `routes/web.php`.
- `{id}` est un paramètre, `{id?}` un paramètre optionnel ; `whereNumber()`, `where()`… le contraignent.
- `->name('articles.show')` nomme la route ; `route('articles.show', 5)` génère son URL.
- `Route::prefix()`, `->name()`, `->middleware()` et `->group()` regroupent des routes.
- `php artisan make:controller` crée un contrôleur ; la route le cite avec `[ArticleController::class, 'index']`.
- `Request $request` donne accès aux données envoyées (`input`, `query`, `only`, `boolean`).
- Un tableau devient du JSON ; `redirect()`, `to_route()` et `back()` redirigent.

## Pour pratiquer

Lis aussi la leçon sur [les vues Blade](#/laravel/lecon/03-blade), puis fais le TP [Routes et vues Blade](#/laravel/tp/01-routes-blade).
