# API REST JSON

## Objectif

Tu exposes les articles dans une API JSON sous `/api/articles`.
Une application mobile pourra lister, lire, créer, modifier et supprimer des articles.
Chaque réponse utilise le bon code HTTP.

## Ce que tu vas pratiquer

- le fichier `routes/api.php` et le préfixe `/api` ;
- `Route::apiResource()` et les noms de routes ;
- les ressources API (`JsonResource`) pour choisir les champs exposés ;
- la pagination en JSON ;
- les codes HTTP 200, 201, 204, 404 et 422 ;
- les tests `getJson`, `postJson`, `assertJsonPath`…

Leçon utile : [les API](#/laravel/lecon/09-api).

## Fichiers à créer ou modifier

- `routes/api.php` (à créer)
- `bootstrap/app.php` (déclarer `routes/api.php`)
- `app/Http/Controllers/Api/ArticleController.php` (à créer)
- `app/Http/Resources/ArticleResource.php` et `CategorieResource.php` (à créer)

Commandes conseillées :

```bash
php artisan make:controller Api/ArticleController --api --model=Article
php artisan make:resource ArticleResource
php artisan make:resource CategorieResource
```

## Étapes

1. Déclare les routes API. Deux façons :
   - **à la main (conseillé ici)** : crée `routes/api.php`, puis ajoute `api: __DIR__.'/../routes/api.php',` dans `withRouting()` de `bootstrap/app.php` ;
   - **avec `php artisan install:api`** : la commande fait la même chose, mais installe aussi Laravel Sanctum (jetons d'API). Tu n'en as pas besoin dans ce TP.
2. Dans `routes/api.php` : `Route::apiResource('articles', ArticleController::class)->names('api.articles');` Le préfixe `/api` est ajouté tout seul.
3. Vérifie avec `php artisan route:list --path=api`. Tu dois voir `api.articles.index`, `store`, `show`, `update`, `destroy`.
4. `CategorieResource` expose `id`, `nom` et `slug`.
5. `ArticleResource` expose exactement ces champs :

   | Clé JSON | Valeur |
   |----------|--------|
   | `id` | `$this->id` |
   | `titre` | `$this->titre` |
   | `slug` | `$this->slug` |
   | `contenu` | `$this->contenu` |
   | `publie` | `$this->publie` (booléen) |
   | `categorie` | `CategorieResource::make($this->whenLoaded('categorie'))` |
   | `cree_le` | `$this->created_at?->toIso8601String()` |

   Pas de `created_at`, `updated_at` ni `categorie_id` dans la réponse.
6. Dans `Api\ArticleController` :

   | Méthode | Réponse | Code |
   |---------|---------|------|
   | `index()` | `ArticleResource::collection(Article::with('categorie')->latest()->paginate(10))` | 200 |
   | `store(ArticleRequest $request)` | l'article créé | 201 |
   | `show(Article $article)` | l'article, avec sa catégorie (`$article->load('categorie')`) | 200 |
   | `update(ArticleRequest $request, Article $article)` | l'article modifié | 200 |
   | `destroy(Article $article)` | `response()->noContent()` | 204 |

7. Pour le code 201 : `return ArticleResource::make($article)->response()->setStatusCode(201);`
8. Réutilise `ArticleRequest` du TP 03 : en JSON, une erreur de validation donne une réponse 422 avec les erreurs, sans rien changer.

> [!NOTE]
> Pourquoi `->names('api.articles')` ? Sans lui, les routes API s'appelleraient `articles.index` et `articles.show`, comme les pages web du TP 02. Deux routes ne doivent pas porter le même nom.

> [!TIP]
> Le 404 en JSON est déjà prêt : dans `bootstrap/app.php`, `shouldRenderJsonWhen()` rend les erreurs en JSON pour les URL `api/*`.

## Lancer les tests

Depuis le dossier `tp/laravel` :

```bash
php artisan test --filter=Tp05
```

Pour essayer à la main : `php artisan serve`, puis ouvre http://localhost:8000/api/articles.

## Critères de réussite

- `route('api.articles.index')` vaut `/api/articles` ; `route('articles.index')` vaut toujours `/articles`.
- `GET /api/articles` renvoie 10 articles par page, avec `links` et `meta` (`total`, `per_page`, `current_page`, `last_page`) ; la page 2 contient le reste.
- Chaque article de la liste contient sa catégorie (`data.0.categorie.nom`).
- `GET /api/articles/{id}` renvoie `id`, `titre`, `slug`, `contenu`, `publie`, `categorie` (`id`, `nom`, `slug`) et `cree_le`, mais pas `created_at`, `updated_at` ni `categorie_id`.
- Un article inexistant renvoie 404 en JSON (avec une clé `message`).
- `POST /api/articles` crée l'article, génère le slug et renvoie 201.
- `POST /api/articles` avec des données invalides renvoie 422 et des erreurs sur `titre` et `contenu`.
- `PUT /api/articles/{id}` modifie l'article et renvoie 200.
- `DELETE /api/articles/{id}` supprime l'article et renvoie 204 sans contenu.

## Pour aller plus loin

- Protège `store`, `update` et `destroy` avec Sanctum (`php artisan install:api`, puis `->middleware('auth:sanctum')`).
- Ajoute un filtre : `/api/articles?categorie=laravel`.
- Limite le nombre d'appels avec le middleware `throttle:60,1`.
- Teste ton API avec `curl -H "Accept: application/json" http://localhost:8000/api/articles`.
