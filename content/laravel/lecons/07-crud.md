# Un CRUD complet

## Objectifs

- Déclarer les 7 routes d'une ressource avec `Route::resource`.
- Écrire un contrôleur ressource complet.
- Utiliser le route model binding pour récupérer le modèle.
- Construire des formulaires sûrs avec `@csrf` et `@method`.
- Afficher des messages flash et paginer une liste.

**CRUD** veut dire Create, Read, Update, Delete : créer, lire, modifier, supprimer.

## `Route::resource` : 7 routes en une ligne

```php
// routes/web.php
use App\Http\Controllers\ArticleController;

Route::resource('articles', ArticleController::class);
```

| Méthode | URL | Action | Nom | Rôle |
|---------|-----|--------|-----|------|
| GET | `/articles` | `index` | `articles.index` | liste |
| GET | `/articles/create` | `create` | `articles.create` | formulaire de création |
| POST | `/articles` | `store` | `articles.store` | enregistre le nouvel article |
| GET | `/articles/{article}` | `show` | `articles.show` | affiche un article |
| GET | `/articles/{article}/edit` | `edit` | `articles.edit` | formulaire de modification |
| PUT/PATCH | `/articles/{article}` | `update` | `articles.update` | enregistre les modifications |
| DELETE | `/articles/{article}` | `destroy` | `articles.destroy` | supprime |

Tu peux limiter les routes :

```php
Route::resource('articles', ArticleController::class)->only(['index', 'show']);
Route::resource('articles', ArticleController::class)->except(['destroy']);
```

Génère le contrôleur avec ses 7 méthodes et ses Form Requests :

```bash
php artisan make:controller ArticleController --resource --model=Article --requests
```

## Le route model binding

Dans l'URL `/articles/{article}`, le paramètre s'appelle `article`.
Si la méthode demande `Article $article`, Laravel cherche l'article lui-même :

```php
public function show(Article $article)
{
    // Laravel a fait Article::findOrFail($id) pour toi
    return view('articles.show', compact('article'));
}
```

Si l'article n'existe pas, Laravel répond **404**.

Pour chercher par une autre colonne que `id` :

```php
Route::get('/articles/{article:slug}', [ArticleController::class, 'show']);
// /articles/bonjour-laravel → Article::where('slug', 'bonjour-laravel')->firstOrFail()
```

Ou pour toutes les routes du modèle :

```php
// app/Models/Article.php
public function getRouteKeyName(): string
{
    return 'slug';
}
```

## Le contrôleur ressource

```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Models\Article;

class ArticleController extends Controller
{
    public function index()
    {
        $articles = Article::latest()->paginate(10);

        return view('articles.index', compact('articles'));
    }

    public function create()
    {
        return view('articles.create');
    }

    public function store(StoreArticleRequest $request)
    {
        $article = Article::create($request->validated());

        return to_route('articles.show', $article)->with('success', 'Article créé.');
    }

    public function show(Article $article)
    {
        return view('articles.show', compact('article'));
    }

    public function edit(Article $article)
    {
        return view('articles.edit', compact('article'));
    }

    public function update(UpdateArticleRequest $request, Article $article)
    {
        $article->update($request->validated());

        return to_route('articles.show', $article)->with('success', 'Article modifié.');
    }

    public function destroy(Article $article)
    {
        $article->delete();

        return to_route('articles.index')->with('success', 'Article supprimé.');
    }
}
```

`route('articles.show', $article)` accepte le modèle : Laravel met son `id` (ou son slug) dans l'URL.

> [!TIP]
> Après un POST, PUT ou DELETE réussi, redirige toujours. Si l'utilisateur recharge la page, le formulaire n'est pas renvoyé une deuxième fois.

## Les formulaires

### Création

```blade
{{-- resources/views/articles/create.blade.php --}}
<x-layout>
    <h1>Nouvel article</h1>

    <form method="POST" action="{{ route('articles.store') }}">
        @csrf

        <label for="title">Titre</label>
        <input id="title" name="title" value="{{ old('title') }}">
        @error('title') <p class="erreur">{{ $message }}</p> @enderror

        <label for="body">Contenu</label>
        <textarea id="body" name="body">{{ old('body') }}</textarea>
        @error('body') <p class="erreur">{{ $message }}</p> @enderror

        <button type="submit">Enregistrer</button>
    </form>
</x-layout>
```

### Modification

```blade
{{-- resources/views/articles/edit.blade.php --}}
<form method="POST" action="{{ route('articles.update', $article) }}">
    @csrf
    @method('PUT')

    <input name="title" value="{{ old('title', $article->title) }}">
    <textarea name="body">{{ old('body', $article->body) }}</textarea>

    <button type="submit">Mettre à jour</button>
</form>
```

### Suppression

```blade
<form method="POST" action="{{ route('articles.destroy', $article) }}"
      onsubmit="return confirm('Supprimer cet article ?')">
    @csrf
    @method('DELETE')
    <button type="submit">Supprimer</button>
</form>
```

- `@csrf` ajoute un champ caché `_token`. Il prouve que le formulaire vient de ton site. Sans lui : **419**.
- `@method('PUT')` ajoute un champ caché `_method`. Le HTML ne connaît que GET et POST, Laravel lit ce champ pour trouver la route PUT ou DELETE. Sans lui : **405 Method Not Allowed**.

> [!NOTE]
> **Changé dans Laravel 13** : le middleware CSRF s'appelle `PreventRequestForgery` (avant : `VerifyCsrfToken`).
> Il vérifie d'abord l'origine de la requête (en-tête `Sec-Fetch-Site` envoyé par le navigateur), puis le jeton si besoin.
> Dans tes formulaires, rien ne change : garde `@csrf`.

## Les messages flash

Un **message flash** est une valeur gardée en session pour la requête suivante seulement.

```php
return to_route('articles.index')->with('success', 'Article créé.');
```

Affiche-le dans le layout, pour toutes les pages :

```blade
{{-- resources/views/components/layout.blade.php --}}
@session('success')
    <div class="flash">{{ $value }}</div>
@endsession
```

Dans un projet plus ancien, tu verras l'équivalent :

```blade
@if (session('success'))
    <div class="flash">{{ session('success') }}</div>
@endif
```

## La pagination

```php
$articles = Article::latest()->paginate(10);
```

`paginate(10)` renvoie 10 articles et lit le numéro de page dans `?page=2`.

```blade
{{-- resources/views/articles/index.blade.php --}}
<x-layout>
    <h1>Articles</h1>

    <a href="{{ route('articles.create') }}">Nouvel article</a>

    @forelse ($articles as $article)
        <article>
            <h2><a href="{{ route('articles.show', $article) }}">{{ $article->title }}</a></h2>
            <a href="{{ route('articles.edit', $article) }}">Modifier</a>
        </article>
    @empty
        <p>Aucun article.</p>
    @endforelse

    {{ $articles->links() }}
</x-layout>
```

- `{{ $articles->links() }}` affiche les liens de pagination (style Tailwind par défaut).
- `simplePaginate(10)` affiche seulement « Précédent » et « Suivant », avec une requête de moins.
- `->withQueryString()` garde les autres paramètres de l'URL (filtres, recherche) dans les liens.
- `$articles->total()` et `$articles->currentPage()` donnent le total et la page courante.

## Le parcours complet

```text
GET  /articles/create  → create()  → vue du formulaire
POST /articles         → store()   → validation → Article::create() → redirection + flash
GET  /articles/5       → show()    → vue de l'article
GET  /articles/5/edit  → edit()    → formulaire prérempli
PUT  /articles/5       → update()  → validation → $article->update() → redirection + flash
DELETE /articles/5     → destroy() → $article->delete() → redirection + flash
```

## Pièges fréquents

- **419 Page Expired** : `@csrf` manque, ou la session a expiré.
- **405 Method Not Allowed** : `@method('PUT')` ou `@method('DELETE')` manque.
- **Modèle vide injecté** : la route a `{article}` mais la méthode demande `Article $post`. Les noms doivent être identiques, sinon Laravel injecte un `Article` vide, sans 404.
- **Supprimer avec un lien `<a>`** : un lien fait un GET. Utilise toujours un formulaire avec `DELETE`.
- **`Route::resource('article', …)`** au singulier : les noms deviennent `article.index`. Utilise le pluriel.
- **Pagination qui perd les filtres** : ajoute `->withQueryString()`.
- **Pas de redirection après `store()`** : un rechargement renvoie le formulaire et crée un doublon.

## Résumé

- `Route::resource('articles', ArticleController::class)` crée 7 routes nommées (`index`, `create`, `store`, `show`, `edit`, `update`, `destroy`).
- `php artisan make:controller ArticleController --resource --model=Article` génère les 7 méthodes.
- Le route model binding transforme `{article}` en modèle `Article $article` (404 si absent) ; `{article:slug}` cherche par slug.
- Les formulaires ont `@csrf` ; PUT et DELETE ajoutent `@method('PUT')` / `@method('DELETE')`.
- `->with('success', '…')` crée un message flash ; `@session('success')` l'affiche.
- `paginate(10)` + `{{ $articles->links() }}` paginent la liste.

## Pour pratiquer

Fais le TP [CRUD des articles avec validation](#/laravel/tp/03-crud-articles) : contrôleur ressource, Form Requests, formulaires et messages flash.
