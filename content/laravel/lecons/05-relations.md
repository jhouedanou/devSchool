# Relations Eloquent

## Objectifs

- Créer une clé étrangère avec `foreignId()->constrained()`.
- Définir les relations un-à-plusieurs, un-à-un et plusieurs-à-plusieurs.
- Lire et créer des données à travers une relation.
- Repérer et corriger le problème N+1 avec `with()`.
- Compter des éléments liés avec `withCount()`.

## Les trois relations principales

| Relation | Exemple | Clé étrangère |
|----------|---------|---------------|
| un-à-plusieurs | une catégorie a plusieurs articles | `articles.category_id` |
| un-à-un | un utilisateur a un profil | `profiles.user_id` |
| plusieurs-à-plusieurs | un article a plusieurs tags, un tag a plusieurs articles | table pivot `article_tag` |

La clé étrangère est toujours du côté « qui appartient ».

## Un-à-plusieurs : `hasMany` et `belongsTo`

### La migration

```bash
php artisan make:model Category -mf
```

La table `categories` doit être créée **avant** `articles`. L'ordre suit la date dans le nom du fichier.

```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->timestamps();
});

Schema::create('articles', function (Blueprint $table) {
    $table->id();
    $table->foreignId('category_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->text('body');
    $table->timestamps();
});
```

- `foreignId('category_id')` crée une colonne d'entier positif.
- `constrained()` ajoute la contrainte de clé étrangère vers `categories.id`. Laravel devine la table à partir du nom de la colonne.
- `cascadeOnDelete()` supprime les articles quand on supprime leur catégorie.

Autres choix à la suppression :

```php
$table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();   // met NULL
$table->foreignId('category_id')->constrained()->restrictOnDelete();           // bloque la suppression
```

### Les modèles

```php
// app/Models/Category.php
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }
}
```

```php
// app/Models/Article.php
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Article extends Model
{
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
```

Laravel devine la clé : `category()` → colonne `category_id`.

### Utiliser la relation

```php
$category = Category::find(1);

$category->articles;                                  // Collection des articles
$category->articles()->whereNotNull('published_at')->get();   // requête filtrée

$article = Article::find(1);
$article->category->name;                             // la catégorie de l'article
```

- **Propriété** (`$category->articles`) : les résultats, chargés au premier accès.
- **Méthode** (`$category->articles()`) : une requête que tu peux compléter.

### Créer à travers la relation

```php
// category_id est rempli automatiquement
$category->articles()->create([
    'title' => 'Les relations',
    'body' => 'Texte…',
]);

// rattacher un article existant
$article->category()->associate($category);
$article->save();
```

## Un-à-un : `hasOne`

```php
// app/Models/User.php
use Illuminate\Database\Eloquent\Relations\HasOne;

public function profile(): HasOne
{
    return $this->hasOne(Profile::class);
}
```

```php
// app/Models/Profile.php — la table profiles a une colonne user_id
public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}
```

```php
$user->profile->bio;
$profile->user->name;
```

## Plusieurs-à-plusieurs : `belongsToMany`

Il faut une **table pivot** : une table intermédiaire qui relie les deux.
Son nom : les deux modèles au singulier, dans l'ordre alphabétique, séparés par `_`. Ici : `article_tag`.

```bash
php artisan make:model Tag -m
php artisan make:migration create_article_tag_table
```

```php
Schema::create('article_tag', function (Blueprint $table) {
    $table->foreignId('article_id')->constrained()->cascadeOnDelete();
    $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
    $table->primary(['article_id', 'tag_id']);   // pas de doublon
});
```

```php
// app/Models/Article.php
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

public function tags(): BelongsToMany
{
    return $this->belongsToMany(Tag::class);
}
```

```php
// app/Models/Tag.php
public function articles(): BelongsToMany
{
    return $this->belongsToMany(Article::class);
}
```

### Gérer les liens

```php
$article->tags()->attach($tagId);        // ajoute un lien
$article->tags()->attach([1, 2]);        // ajoute plusieurs liens
$article->tags()->detach($tagId);        // retire un lien
$article->tags()->detach();              // retire tous les liens
$article->tags()->sync([1, 3]);          // garde exactement les tags 1 et 3
$article->tags()->toggle([2]);           // ajoute si absent, retire si présent

foreach ($article->tags as $tag) {
    echo $tag->name;
}
```

`sync()` est pratique avec une liste de cases à cocher dans un formulaire.
Si ta pivot a des colonnes `created_at` / `updated_at`, ajoute `->withTimestamps()` à la relation.

## Le problème N+1

```php
$articles = Article::all();               // 1 requête

foreach ($articles as $article) {
    echo $article->category->name;        // 1 requête PAR article
}
```

Avec 100 articles, tu fais **101 requêtes**. C'est le problème N+1 : 1 requête pour la liste + N requêtes pour les relations.

### La solution : le chargement anticipé (eager loading)

```php
$articles = Article::with('category')->get();   // 2 requêtes au total
```

```php
Article::with(['category', 'tags'])->get();     // plusieurs relations
Article::with('category:id,name')->get();       // seulement certaines colonnes (garde id)
Category::with('articles.tags')->get();         // relations imbriquées
$article->load('tags');                         // charger après coup
```

### Détecter le N+1 en développement

Dans `app/Providers/AppServiceProvider.php` :

```php
use Illuminate\Database\Eloquent\Model;

public function boot(): void
{
    Model::preventLazyLoading(! $this->app->isProduction());
}
```

Hors production, Laravel lève une exception dès qu'une relation est chargée sans `with()`.

> [!NOTE]
> Laravel 12 et 13 proposent aussi `Model::automaticallyEagerLoadRelationships()`. Laravel charge alors la relation pour toute la collection au premier accès. Apprends d'abord `with()` : c'est explicite et il marche partout.

## Compter : `withCount`

```php
$categories = Category::withCount('articles')->get();

foreach ($categories as $category) {
    echo "{$category->name} ({$category->articles_count})";
}
```

`withCount('articles')` ajoute un attribut `articles_count` sans charger les articles.

Filtrer selon une relation :

```php
Category::has('articles')->get();      // catégories avec au moins un article

Category::whereHas('articles', function ($query) {
    $query->whereNotNull('published_at');
})->get();                             // catégories avec au moins un article publié
```

## Les factories avec des relations

```php
// database/factories/ArticleFactory.php
public function definition(): array
{
    return [
        'category_id' => Category::factory(),   // crée une catégorie si besoin
        'title' => fake()->sentence(),
        'body' => fake()->paragraph(),
    ];
}
```

```php
$category = Category::factory()->create();
Article::factory(3)->for($category)->create();                // 3 articles dans cette catégorie
Category::factory()->has(Article::factory()->count(5))->create();   // 1 catégorie + 5 articles
```

## Pièges fréquents

- **Propriété ou méthode** : `$article->category` donne le modèle ; `$article->category()` donne une requête. `$article->category()->name` ne marche pas.
- **Nom de clé non standard** : `author()` vers `User` cherche `author_id`. Précise la colonne : `$this->belongsTo(User::class, 'user_id')`.
- **Pivot mal nommée** : `tag_article` au lieu de `article_tag`. Renomme-la ou précise le nom : `belongsToMany(Tag::class, 'tag_article')`.
- **Ordre des migrations** : créer `articles` avant `categories` fait échouer `constrained()`.
- **`nullOnDelete()` sans `nullable()`** : la colonne doit accepter NULL.
- **N+1 dans une boucle** : ajoute `with()` dès que tu affiches une relation dans une liste.
- **`category_id` absent de `$fillable`** : `Article::create([... 'category_id' => 1])` l'ignore. Ajoute-le ou passe par `$category->articles()->create()`.

## Résumé

- `foreignId('category_id')->constrained()` crée la colonne et la clé étrangère ; `cascadeOnDelete()` gère la suppression.
- `hasMany` / `belongsTo` : un-à-plusieurs ; la clé est sur le modèle qui `belongsTo`.
- `hasOne` : un-à-un ; `belongsToMany` : plusieurs-à-plusieurs avec une table pivot (`article_tag`).
- `attach`, `detach`, `sync`, `toggle` gèrent les liens de la pivot.
- `$modele->relation` donne les résultats ; `$modele->relation()` donne une requête.
- `with()` évite le problème N+1 ; `preventLazyLoading()` le détecte.
- `withCount('articles')` ajoute `articles_count`.

## Pour pratiquer

Fais le TP [Catégories et relations](#/laravel/tp/04-categories-relations) : relier les articles aux catégories, charger avec `with()` et compter avec `withCount()`.
