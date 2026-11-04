# Base de données : migrations et Eloquent

## Objectifs

- Configurer la base de données (SQLite par défaut).
- Créer un modèle avec sa migration, sa factory et son seeder.
- Décrire une table avec une migration et la faire évoluer.
- Lire, créer, modifier et supprimer des données avec Eloquent.
- Remplir la base avec des factories et des seeders.

## La base de données

Le `.env` d'un nouveau projet utilise SQLite :

```bash
DB_CONNECTION=sqlite
```

La base est le fichier `database/database.sqlite`. Rien d'autre à installer.
Pour MySQL, change les variables `DB_*` :

```bash
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=blog
DB_USERNAME=root
DB_PASSWORD=
```

## Créer le modèle et ses fichiers

```bash
php artisan make:model Article -mfs
```

| Option | Crée |
|--------|------|
| `-m` | une migration |
| `-f` | une factory |
| `-s` | un seeder |
| `-c` | un contrôleur |
| `-a` | tout : migration, factory, seeder, policy, contrôleur, Form Requests |

```text
app/Models/Article.php
database/migrations/2026_11_04_120000_create_articles_table.php
database/factories/ArticleFactory.php
database/seeders/ArticleSeeder.php
```

**Conventions** : le modèle `Article` (singulier, PascalCase) correspond à la table `articles` (pluriel, snake_case).
Chaque table a une clé primaire `id` et les colonnes `created_at` et `updated_at`.

> [!TIP]
> Garde des noms **anglais** pour les modèles et les colonnes. Le pluriel automatique de Laravel suit les règles de l'anglais.

## Les migrations

Une **migration** est une classe PHP qui décrit un changement de structure de la base.
Elle est versionnée avec ton code : toute l'équipe a la même structure.

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('body');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
```

- `up()` applique le changement.
- `down()` l'annule (utilisé par `migrate:rollback`).

### Types de colonnes courants

| Méthode | Colonne |
|---------|---------|
| `$table->id()` | clé primaire auto-incrémentée |
| `string('title')` | texte court (255 caractères max) |
| `text('body')` | texte long |
| `integer('stock')`, `unsignedInteger('views')` | nombre entier |
| `decimal('price', 8, 2)` | nombre décimal exact |
| `boolean('is_featured')` | vrai / faux |
| `date('born_on')`, `dateTime('starts_at')`, `timestamp('published_at')` | dates |
| `json('options')` | données JSON |
| `foreignId('user_id')` | clé étrangère (leçon 5) |
| `timestamps()` | `created_at` et `updated_at` |

Les **modificateurs** s'enchaînent après le type :

```php
$table->string('subtitle')->nullable();          // accepte NULL
$table->unsignedInteger('views')->default(0);    // valeur par défaut
$table->string('email')->unique();               // pas de doublon
$table->string('status')->index();               // index pour les recherches
```

### Modifier une table existante

Ne modifie pas une migration déjà jouée. Crée une nouvelle migration :

```bash
php artisan make:migration add_views_to_articles_table
```

```php
public function up(): void
{
    Schema::table('articles', function (Blueprint $table) {
        $table->unsignedInteger('views')->default(0);
    });
}

public function down(): void
{
    Schema::table('articles', function (Blueprint $table) {
        $table->dropColumn('views');
    });
}
```

`Schema::create()` crée une table, `Schema::table()` modifie une table existante.

### Les commandes de migration

```bash
php artisan migrate              # joue les migrations pas encore jouées
php artisan migrate:status       # liste les migrations jouées et en attente
php artisan migrate:rollback     # annule le dernier lot de migrations
php artisan migrate:fresh        # supprime TOUTES les tables puis rejoue tout
php artisan migrate:fresh --seed # pareil, puis lance les seeders
```

> [!WARNING]
> `migrate:fresh` efface toutes les données. Ne l'utilise jamais en production.

## Le modèle Eloquent

**Eloquent** est l'ORM de Laravel : une classe modèle représente une table, une instance représente une ligne.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['title', 'slug', 'body', 'published_at'])]
class Article extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }
}
```

### Le mass assignment et `$fillable`

`create()` et `update()` reçoivent un tableau de colonnes : c'est le **mass assignment** (affectation en masse).
Tu dois lister les colonnes autorisées. Sinon un visiteur pourrait envoyer un champ `is_admin=1`.

La syntaxe classique, toujours valable en Laravel 13 :

```php
class Article extends Model
{
    protected $fillable = ['title', 'slug', 'body', 'published_at'];
}
```

L'inverse existe : `protected $guarded = ['id'];` liste les colonnes **interdites**.

> [!NOTE]
> **Nouveau dans Laravel 13** : le squelette utilise des attributs PHP comme `#[Fillable([...])]` et `#[Hidden([...])]` (colonnes cachées dans le JSON).
> Ils font la même chose que les propriétés `$fillable` et `$hidden`. Tu verras les deux styles.

### Les casts

Un **cast** convertit une colonne en type PHP à la lecture, et inversement à l'écriture.

```php
protected function casts(): array
{
    return [
        'published_at' => 'datetime',   // objet date (Carbon)
        'is_featured' => 'boolean',
        'options' => 'array',           // JSON ↔ tableau PHP
        'password' => 'hashed',         // haché automatiquement
    ];
}
```

```php
$article->published_at->format('d/m/Y');   // possible grâce au cast datetime
```

> [!NOTE]
> **Changé depuis Laravel 11** : les casts se déclarent dans une méthode `casts()`. L'ancienne propriété `protected $casts = [...]` fonctionne encore.

## Le CRUD avec Eloquent

### Créer

```php
$article = Article::create([
    'title' => 'Bonjour Laravel',
    'slug' => 'bonjour-laravel',
    'body' => 'Mon premier article.',
]);

// ou, colonne par colonne
$article = new Article();
$article->title = 'Deuxième article';
$article->slug = 'deuxieme-article';
$article->body = 'Texte.';
$article->save();
```

### Lire

```php
Article::all();                          // tous les articles (Collection)
Article::find(1);                        // l'article 1, ou null
Article::findOrFail(1);                  // l'article 1, ou erreur 404
Article::where('slug', 'bonjour-laravel')->first();   // le premier, ou null

Article::whereNotNull('published_at')
    ->orderByDesc('published_at')
    ->take(5)
    ->get();                             // Collection de 5 articles

Article::latest()->get();                // tri par created_at décroissant
Article::count();
Article::where('title', 'like', '%laravel%')->exists();   // true / false
```

`where()` prépare la requête. Elle s'exécute seulement avec `get()`, `first()`, `count()`…

### Modifier

```php
$article = Article::findOrFail(1);
$article->update(['title' => 'Nouveau titre']);

// ou
$article->title = 'Nouveau titre';
$article->save();

// plusieurs lignes d'un coup
Article::whereNull('published_at')->update(['published_at' => now()]);
```

### Supprimer

```php
$article->delete();
Article::destroy(1);
Article::destroy([1, 2, 3]);
Article::where('views', 0)->delete();
```

### Trouver ou créer

```php
$article = Article::firstOrCreate(
    ['slug' => 'faq'],                       // recherche
    ['title' => 'FAQ', 'body' => 'À venir']  // valeurs si création
);
```

Teste tout ça dans `php artisan tinker` avant de l'écrire dans un contrôleur.

## Les factories

Une **factory** fabrique des modèles avec de fausses données, pour les tests et le développement.

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ArticleFactory extends Factory
{
    public function definition(): array
    {
        $title = fake()->unique()->sentence();

        return [
            'title' => $title,
            'slug' => Str::slug($title),
            'body' => fake()->paragraphs(3, true),
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => ['published_at' => null]);
    }
}
```

Le modèle doit utiliser le trait `HasFactory` (ajouté par `make:model -f`).

```php
Article::factory()->create();                       // 1 article en base
Article::factory()->count(10)->create();            // 10 articles
Article::factory(10)->create();                     // pareil
Article::factory()->make();                         // en mémoire, pas en base
Article::factory()->create(['title' => 'Fixé']);    // une valeur imposée
Article::factory()->draft()->create();              // avec l'état « draft »
```

`fake()` donne accès à Faker : `name()`, `email()`, `sentence()`, `paragraph()`, `numberBetween(1, 10)`…

## Les seeders

Un **seeder** remplit la base avec des données de départ.

```php
<?php

namespace Database\Seeders;

use App\Models\Article;
use Illuminate\Database\Seeder;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        Article::factory(20)->create();
    }
}
```

`DatabaseSeeder` est le seeder principal. Il appelle les autres :

```php
public function run(): void
{
    User::factory()->create(['name' => 'Test User', 'email' => 'test@example.com']);

    $this->call([
        ArticleSeeder::class,
    ]);
}
```

```bash
php artisan db:seed                        # lance DatabaseSeeder
php artisan db:seed --class=ArticleSeeder  # lance un seul seeder
php artisan migrate:fresh --seed           # base neuve + données
```

## Pièges fréquents

- **`no such table: articles`** : tu as oublié `php artisan migrate`.
- **`MassAssignmentException`** : le modèle n'a ni `$fillable` ni `$guarded`. Ajoute la liste des colonnes.
- **Une colonne ne s'enregistre pas** : elle manque dans `$fillable`. Laravel l'ignore sans erreur.
- **Migration déjà jouée modifiée** : le changement n'est pas appliqué. Crée une nouvelle migration.
- **`Attempt to read property "title" on null`** : `find()` n'a rien trouvé. Utilise `findOrFail()` ou teste `null`.
- **Oublier `get()`** : `Article::where(...)` est une requête, pas une liste de résultats.
- **`no such column: updated_at`** : la migration n'a pas `$table->timestamps()`.

## Résumé

- SQLite est la base par défaut (`database/database.sqlite`).
- `php artisan make:model Article -mfs` crée le modèle, la migration, la factory et le seeder.
- Une migration décrit la structure : `Schema::create()` dans `up()`, `Schema::dropIfExists()` dans `down()`.
- `migrate`, `migrate:rollback`, `migrate:fresh --seed` gèrent les migrations.
- `$fillable` (ou `#[Fillable]` en Laravel 13) liste les colonnes autorisées pour `create()` et `update()`.
- `casts()` convertit les colonnes (`datetime`, `boolean`, `array`, `hashed`).
- Eloquent : `create`, `find`, `findOrFail`, `where()->get()`, `update`, `delete`.
- Les factories fabriquent de fausses données ; les seeders remplissent la base (`db:seed`).

## Pour pratiquer

Fais le TP [Modèle Article et liste](#/laravel/tp/02-articles-eloquent) : migration, modèle, factory, seeder et page de liste.
