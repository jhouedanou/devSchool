# Construire une API REST

## Objectifs

- Activer les routes d'API avec `php artisan install:api`.
- Déclarer les routes d'une ressource avec `Route::apiResource`.
- Formater le JSON avec les API Resources.
- Renvoyer les bons codes HTTP (200, 201, 204, 404, 422).
- Protéger l'API avec des jetons Sanctum.

Une **API REST** renvoie des données (en JSON) au lieu de pages HTML. Un front Vue, React ou une app mobile la consomme.

## Activer l'API

```bash
php artisan install:api
```

Cette commande :

- installe **Laravel Sanctum** (authentification par jetons) ;
- crée `routes/api.php` et l'ajoute dans `bootstrap/app.php` ;
- ajoute la migration de la table `personal_access_tokens` et propose de la jouer.

Ensuite, ajoute le trait `HasApiTokens` au modèle `User` (la commande te le rappelle) :

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}
```

Les routes de `routes/api.php` :

- ont le préfixe `/api` automatiquement ;
- sont **sans état** (stateless) : pas de session, pas de cookie, pas de jeton CSRF.

> [!NOTE]
> **Changé depuis Laravel 11** : `routes/api.php` et Sanctum ne sont plus installés par défaut. Lance `php artisan install:api` quand ton projet a besoin d'une API.

## `Route::apiResource`

```php
// routes/api.php
use App\Http\Controllers\Api\ArticleController;

Route::apiResource('articles', ArticleController::class);
```

| Méthode | URL | Action | Code de succès |
|---------|-----|--------|----------------|
| GET | `/api/articles` | `index` | 200 |
| POST | `/api/articles` | `store` | 201 |
| GET | `/api/articles/{article}` | `show` | 200 |
| PUT/PATCH | `/api/articles/{article}` | `update` | 200 |
| DELETE | `/api/articles/{article}` | `destroy` | 204 |

C'est `Route::resource` sans `create` et `edit` : une API n'affiche pas de formulaire.

```bash
php artisan make:controller Api/ArticleController --api --model=Article
```

## Les API Resources

Si tu renvoies un modèle directement, Laravel envoie **toutes** ses colonnes (sauf les cachées).
Une **API Resource** choisit les champs et leur format.

```bash
php artisan make:resource ArticleResource
```

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'body' => $this->body,
            'published_at' => $this->published_at?->toIso8601String(),
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
```

- `$this->title` lit la colonne du modèle enveloppé.
- `whenLoaded('category')` ajoute la catégorie seulement si elle a été chargée avec `with()`. Cela évite le N+1.

### Une ressource ou une collection

```php
return new ArticleResource($article);                       // un article
return ArticleResource::collection(Article::all());         // une liste
return ArticleResource::collection(Article::paginate(10));  // une liste paginée
```

Le JSON est enveloppé dans une clé `data` :

```json
{
    "data": {
        "id": 1,
        "title": "Bonjour Laravel",
        "slug": "bonjour-laravel",
        "body": "…",
        "published_at": "2026-11-04T10:00:00+00:00"
    }
}
```

Une liste paginée ajoute les clés `links` et `meta` (page courante, total…).

> [!TIP]
> Raccourcis récents : `$article->toResource()` et `Article::all()->toResourceCollection()` trouvent `ArticleResource` tout seuls.

## Le contrôleur d'API

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Requests\UpdateArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;

class ArticleController extends Controller
{
    public function index()
    {
        return ArticleResource::collection(
            Article::with('category')->latest()->paginate(10)
        );
    }

    public function store(StoreArticleRequest $request)
    {
        $article = Article::create($request->validated());

        return new ArticleResource($article);   // 201 automatique : modèle tout juste créé
    }

    public function show(Article $article)
    {
        return new ArticleResource($article->load('category'));
    }

    public function update(UpdateArticleRequest $request, Article $article)
    {
        $article->update($request->validated());

        return new ArticleResource($article);   // 200
    }

    public function destroy(Article $article)
    {
        $article->delete();

        return response()->noContent();         // 204, corps vide
    }
}
```

## Les codes HTTP

| Code | Sens | Qui le produit dans Laravel |
|------|------|-----------------------------|
| 200 OK | succès | réponse normale |
| 201 Created | ressource créée | une Resource d'un modèle tout juste créé, ou `response()->json($data, 201)` |
| 204 No Content | succès sans contenu | `response()->noContent()` |
| 401 Unauthorized | pas authentifié | middleware `auth:sanctum` sans jeton valide |
| 403 Forbidden | authentifié mais pas autorisé | `Gate::authorize()`, `authorize()` d'une Form Request |
| 404 Not Found | introuvable | route model binding, `findOrFail()`, `abort(404)` |
| 422 Unprocessable Content | données invalides | validation |

Pour forcer un code :

```php
return response()->json(['message' => 'Créé'], 201);
return (new ArticleResource($article))->response()->setStatusCode(201);
abort(404, 'Article introuvable');
```

> [!IMPORTANT]
> Le client doit envoyer l'en-tête `Accept: application/json`.
> Laravel renvoie alors les erreurs (401, 404, 422…) en JSON, et jamais une redirection vers une page HTML.

## Tester avec curl

```bash
# Liste
curl http://localhost:8000/api/articles -H "Accept: application/json"

# Création
curl -X POST http://localhost:8000/api/articles \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"title": "Mon API", "slug": "mon-api", "body": "Un texte assez long."}'

# Suppression
curl -X DELETE http://localhost:8000/api/articles/1 -H "Accept: application/json"
```

## Les jetons Sanctum

Un **jeton** (token) est une longue chaîne secrète. Le client l'envoie à chaque requête pour prouver qui il est.

### Créer un jeton

```php
// routes/api.php
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

Route::post('/tokens', function (Request $request) {
    $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
        'device_name' => ['required'],
    ]);

    $user = User::where('email', $request->email)->first();

    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['Identifiants incorrects.'],
        ]);
    }

    return ['token' => $user->createToken($request->device_name)->plainTextToken];
});
```

Le jeton est stocké **haché** en base. `plainTextToken` est la seule occasion de le lire : affiche-le une fois.

### Protéger des routes

```php
// Lecture publique
Route::apiResource('articles', ArticleController::class)->only(['index', 'show']);

// Écriture avec un jeton
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', fn (Request $request) => $request->user());
    Route::apiResource('articles', ArticleController::class)->except(['index', 'show']);
});
```

Le client envoie le jeton dans l'en-tête `Authorization` :

```bash
curl http://localhost:8000/api/user \
  -H "Accept: application/json" \
  -H "Authorization: Bearer 1|AbCdEf123456..."
```

### Révoquer un jeton

```php
$request->user()->currentAccessToken()->delete();   // le jeton utilisé (déconnexion)
$user->tokens()->delete();                          // tous les jetons de l'utilisateur
```

Sanctum sait aussi authentifier une SPA du même domaine avec les cookies de session. Les jetons servent surtout aux apps mobiles et aux clients externes.

## Pièges fréquents

- **HTML ou redirection 302 au lieu de JSON** : vérifie que le client envoie bien `Accept: application/json`.
- **`Call to undefined method createToken()`** : le trait `HasApiTokens` manque dans `User`.
- **`/api/api/articles`** : n'écris pas `/api` dans `routes/api.php`, le préfixe est ajouté tout seul.
- **419 sur un POST d'API** : la route est dans `web.php` (avec CSRF) au lieu de `api.php`.
- **`no such table: personal_access_tokens`** : lance `php artisan migrate` après `install:api`.
- **Modèle renvoyé tel quel** : tu exposes toutes les colonnes. Passe par une API Resource.
- **Relation absente du JSON** : `whenLoaded()` l'ignore si tu n'as pas fait `with()` ou `load()`.

## Résumé

- `php artisan install:api` crée `routes/api.php` (préfixe `/api`, sans état) et installe Sanctum.
- `Route::apiResource()` crée 5 routes : `index`, `store`, `show`, `update`, `destroy`.
- `make:resource` crée une API Resource ; `toArray()` choisit les champs ; le JSON est dans `data`.
- `new ArticleResource($a)` pour un élément, `ArticleResource::collection(...)` pour une liste.
- Codes : 200 lecture, 201 création, 204 suppression, 401 non connecté, 403 interdit, 404 introuvable, 422 invalide.
- Sanctum : `HasApiTokens`, `createToken()->plainTextToken`, middleware `auth:sanctum`, en-tête `Authorization: Bearer …`.

## Pour pratiquer

Fais le TP [API REST JSON](#/laravel/tp/05-api-rest) : routes `apiResource`, API Resources et codes HTTP vérifiés par des tests.
