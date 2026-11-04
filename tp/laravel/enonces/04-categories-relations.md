# Catégories et relations

## Objectif

Chaque article peut maintenant appartenir à une catégorie.
Tu crées le modèle `Categorie`, les relations entre les deux modèles et les pages des catégories.
Tu évites aussi le problème des requêtes N+1 avec le chargement anticipé (eager loading).

## Ce que tu vas pratiquer

- une migration qui ajoute une clé étrangère (`foreignId()->constrained()`) ;
- les relations `belongsTo` et `hasMany` ;
- les factories avec `->for($categorie)` ;
- `withCount()` avec une condition ;
- `with()` pour charger une relation à l'avance ;
- la règle de validation `exists`.

Leçon utile : [les relations](#/laravel/lecon/05-relations).

## Fichiers à créer ou modifier

- `database/migrations/xxxx_create_categories_table.php` (à créer)
- `database/migrations/xxxx_add_categorie_id_to_articles_table.php` (à créer)
- `app/Models/Categorie.php` et `database/factories/CategorieFactory.php` (à créer)
- `app/Models/Article.php` (relation `categorie()`, `categorie_id` dans `Fillable`)
- `app/Http/Controllers/CategorieController.php` (à créer)
- `resources/views/categories/index.blade.php` et `show.blade.php` (à créer)
- `app/Http/Controllers/ArticleController.php` et `resources/views/articles/index.blade.php` (afficher la catégorie)
- `app/Http/Requests/ArticleRequest.php`, `app/Http/Controllers/Admin/ArticleController.php`, `resources/views/admin/articles/_champs.blade.php` (choix de la catégorie dans l'admin)
- `database/seeders/ArticleSeeder.php` (créer des catégories)
- `routes/web.php` et le layout (lien « Catégories »)

Commandes conseillées :

```bash
php artisan make:model Categorie -mf
php artisan make:migration add_categorie_id_to_articles_table --table=articles
php artisan make:controller CategorieController
```

## Étapes

1. Table `categories` : `id`, `nom` (string), `slug` (string, unique), `timestamps`. Laravel devine le nom `categories` à partir du modèle `Categorie`.
2. Dans la deuxième migration, ajoute à `articles` une colonne `categorie_id` **nullable** : `$table->foreignId('categorie_id')->nullable()->constrained('categories')->nullOnDelete();`
3. Lance `php artisan migrate`.
4. Modèle `Categorie` : `#[Fillable(['nom', 'slug'])]`, le trait `HasFactory` et la relation `articles()` qui renvoie `$this->hasMany(Article::class)`.
5. Modèle `Article` : ajoute `categorie_id` aux champs `Fillable` et la relation `categorie()` qui renvoie `$this->belongsTo(Categorie::class)`.
6. `CategorieFactory` : un nom au hasard et son slug.
7. Routes :

   | URL | Nom | Méthode |
   |-----|-----|---------|
   | `/categories` | `categories.index` | `CategorieController@index` |
   | `/categories/{categorie:slug}` | `categories.show` | `CategorieController@show` |

8. `index()` : les catégories avec le nombre d'articles **publiés** : `Categorie::withCount(['articles' => fn ($query) => $query->where('publie', true)])`. La vue affiche chaque catégorie sur une ligne, au format `Nom (nombre)`, par exemple `Laravel (2)`, avec un lien vers sa page. Le nombre vient de `$categorie->articles_count`.
9. `show()` : le nom de la catégorie dans un `<h1>`, puis ses articles publiés : `$categorie->articles()->where('publie', true)->latest()->get()`.
10. Sur `/articles`, affiche le nom de la catégorie de chaque article (s'il en a une). Dans le contrôleur, charge la relation à l'avance : `Article::with('categorie')->…`.
11. Admin : ajoute la règle `'categorie_id' => ['nullable', 'integer', 'exists:categories,id']` dans `ArticleRequest`. Passe la liste des catégories aux vues `create` et `edit`. Dans `_champs.blade.php`, ajoute un `<select name="categorie_id">` avec une option vide « Aucune ».
12. Dans `ArticleSeeder`, crée quelques catégories et répartis les articles dedans.

> [!WARNING]
> Sans `with('categorie')`, la vue lance une requête par article pour lire sa catégorie : c'est le problème N+1. Les tests de ce TP activent `Model::preventLazyLoading()` : la page plante si tu oublies `with()`.

> [!NOTE]
> `categorie_id` est nullable : un article peut ne pas avoir de catégorie. Les tests des TP 02 et 03 créent des articles sans catégorie, ils doivent continuer à passer.

## Lancer les tests

Depuis le dossier `tp/laravel` :

```bash
php artisan test --filter=Tp04
```

## Critères de réussite

- La table `categories` a `nom` et `slug` ; deux catégories ne peuvent pas avoir le même slug.
- `$article->categorie()` est une relation `BelongsTo` et `$categorie->articles()` une relation `HasMany`.
- Un article peut ne pas avoir de catégorie (`categorie_id` vaut `null`).
- `/categories/{slug}` affiche le nom de la catégorie dans un `<h1>` et ses articles publiés seulement.
- Une catégorie inconnue renvoie 404.
- `/categories` affiche `Laravel (2)` pour une catégorie qui a 2 articles publiés et 1 brouillon, et `Vue (0)` pour une catégorie vide, avec un lien vers chaque catégorie.
- `/articles` affiche la catégorie de chaque article sans requête N+1.
- Le formulaire admin contient un champ `categorie_id`. Une catégorie valide est enregistrée ; une catégorie inexistante donne une erreur sur `categorie_id`.

## Pour aller plus loin

- Active `Model::preventLazyLoading(! app()->isProduction())` dans `AppServiceProvider` pour tout le projet.
- Ajoute une relation `belongsToMany` pour des étiquettes (tags), avec une table pivot `article_etiquette`.
- Affiche la catégorie dans la liste admin et compte les requêtes avec `DB::enableQueryLog()`.
