# Modèle Article et liste

## Objectif

Le blog a maintenant des articles en base de données.
Tu crées la table, le modèle Eloquent, une factory et un seeder.
Puis tu affiches la liste des articles publiés et la page de chaque article.

## Ce que tu vas pratiquer

- les migrations (`Schema::create`, colonnes, index unique) ;
- le modèle Eloquent : affectation de masse (`#[Fillable]`) et conversions (`casts()`) ;
- les factories et les seeders ;
- les requêtes simples : `where`, `latest()` ;
- la liaison de modèle par slug : `{article:slug}`.

Leçon utile : [les migrations et Eloquent](#/laravel/lecon/04-migrations-eloquent).

## Fichiers à créer ou modifier

- `database/migrations/xxxx_xx_xx_xxxxxx_create_articles_table.php` (à créer)
- `app/Models/Article.php` (à créer)
- `database/factories/ArticleFactory.php` (à créer)
- `database/seeders/ArticleSeeder.php` (à créer)
- `database/seeders/DatabaseSeeder.php` (à modifier)
- `app/Http/Controllers/ArticleController.php` (à créer)
- `resources/views/articles/index.blade.php` et `resources/views/articles/show.blade.php` (à créer)
- `resources/views/components/layout.blade.php` (lien « Articles » dans la navigation)
- `routes/web.php` (à modifier)

Commandes conseillées :

```bash
php artisan make:model Article -mfs
php artisan make:controller ArticleController
```

`-mfs` crée en une fois la migration, la factory et le seeder.

> [!NOTE]
> Les leçons utilisent des noms de colonnes anglais (`title`, `body`). Ici, ils sont en français (`titre`, `contenu`, `publie`), car les tests les attendent ainsi.

## Étapes

1. Dans la migration, crée la table `articles` avec ces colonnes :

   | Colonne | Type | Détail |
   |---------|------|--------|
   | `id` | `id()` | |
   | `titre` | `string` | |
   | `slug` | `string` | `->unique()` |
   | `contenu` | `text` | |
   | `publie` | `boolean` | `->default(false)` |
   | `created_at`, `updated_at` | `timestamps()` | |

2. Lance `php artisan migrate`.
3. Dans le modèle `Article`, autorise l'affectation de masse de `titre`, `slug`, `contenu` et `publie`. Avec Laravel 13, écris l'attribut `#[Fillable([...])]` au-dessus de la classe, comme dans `app/Models/User.php`. L'ancienne écriture `protected $fillable = [...]` marche aussi.
4. Ajoute une méthode `casts()` qui convertit `publie` en `boolean`.
5. Écris la factory : un titre au hasard, le slug calculé avec `Str::slug($titre)`, un contenu de quelques paragraphes, `publie` à `true`. Ajoute un état `brouillon()` qui met `publie` à `false`.
6. Dans `ArticleSeeder`, crée au moins 5 articles publiés et 1 brouillon. Appelle ce seeder depuis `DatabaseSeeder` avec `$this->call(ArticleSeeder::class)`.
7. Lance `php artisan db:seed`.
8. Écris `ArticleController` avec deux méthodes :
   - `index()` : les articles publiés, du plus récent au plus ancien (`latest()`).
   - `show(Article $article)` : affiche l'article. S'il n'est pas publié, réponds 404 avec `abort_unless($article->publie, 404)`.
9. Ajoute les routes :

   | URL | Nom | Méthode |
   |-----|-----|---------|
   | `/articles` | `articles.index` | `ArticleController@index` |
   | `/articles/{article:slug}` | `articles.show` | `ArticleController@show` |

10. Dans `articles/index.blade.php`, affiche le titre de chaque article avec un lien vers sa page : `route('articles.show', $article->slug)`. S'il n'y a aucun article, affiche `Aucun article pour le moment.` (pense à `@forelse`).
11. Dans `articles/show.blade.php`, affiche le titre et le contenu.
12. Ajoute un lien « Articles » dans la navigation du layout.

> [!NOTE]
> Avec `{article:slug}`, Laravel cherche l'article par sa colonne `slug`. Si aucun article ne correspond, il répond 404 tout seul.

> [!TIP]
> Un scope local rend le code plus lisible. Avec Laravel 13 : une méthode `protected function publies(Builder $query)` marquée `#[Scope]`. Tu écris ensuite `Article::publies()->latest()->get()`.

## Lancer les tests

Depuis le dossier `tp/laravel` :

```bash
php artisan test --filter=Tp02
```

Les tests utilisent `Article::factory()` : ta factory et le trait `HasFactory` sont nécessaires.

## Critères de réussite

- La table `articles` a les colonnes `id`, `titre`, `slug`, `contenu`, `publie`, `created_at`, `updated_at`.
- `Article::create([...])` fonctionne avec `titre`, `slug`, `contenu` et `publie`.
- `publie` est un vrai booléen (`true` et non `1`).
- Deux articles ne peuvent pas avoir le même slug (erreur de la base).
- `/articles` affiche les articles publiés, avec un lien vers `/articles/{slug}`, et cache les brouillons.
- Les articles sont triés du plus récent au plus ancien.
- Sans article, la page affiche `Aucun article pour le moment.`
- `/articles/{slug}` affiche le titre et le contenu de l'article.
- Un brouillon ou un slug inconnu renvoie 404.
- `ArticleSeeder` crée au moins 5 articles publiés et au moins 1 brouillon.

## Pour aller plus loin

- Pagine la liste avec `->paginate(5)` et affiche `{{ $articles->links() }}`.
- Affiche un extrait du contenu avec `Str::limit($article->contenu, 150)`.
- Essaie `php artisan tinker`, puis `Article::publies()->count()`.
- Lance `php artisan migrate:fresh --seed` pour repartir d'une base propre.
