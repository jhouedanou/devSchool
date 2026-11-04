# Tests et outils

## Objectifs

- Écrire et lancer des tests Feature avec PHPUnit ou Pest.
- Repartir d'une base propre avec `RefreshDatabase` et créer des données avec les factories.
- Vérifier une réponse avec les assertions HTTP et base de données.
- Simuler un utilisateur connecté avec `actingAs`.
- Créer une commande artisan, lancer une tâche en file d'attente et prévisualiser un mail.

## Lancer les tests

```bash
php artisan test                               # tous les tests
php artisan test --filter=ArticleTest          # une classe ou une méthode
php artisan test tests/Feature/ArticleTest.php # un fichier
php artisan make:test ArticleTest              # nouveau test dans tests/Feature
php artisan make:test SlugTest --unit          # nouveau test dans tests/Unit
```

- Un **test Feature** envoie une vraie requête HTTP à ton application et vérifie la réponse.
- Un **test Unit** teste une petite partie isolée (une classe, une fonction).

`phpunit.xml` règle l'environnement de test : base SQLite **en mémoire**, mails dans un tableau, files d'attente en mode `sync`.
Tes données de développement ne sont jamais touchées.

## Un test Feature avec PHPUnit

```php
<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArticleTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_liste_affiche_les_articles(): void
    {
        // 1. Préparer
        Article::factory()->create(['title' => 'Bonjour Laravel']);

        // 2. Agir
        $response = $this->get('/articles');

        // 3. Vérifier
        $response->assertStatus(200);
        $response->assertSee('Bonjour Laravel');
    }
}
```

- Le nom de la méthode commence par `test_`. Sinon PHPUnit l'ignore.
- `RefreshDatabase` remet la base à zéro pour chaque test.
- Les factories créent les données dont le test a besoin.

## Le même test avec Pest

**Pest** est un autre framework de test, construit sur PHPUnit, avec une syntaxe plus courte.
Tu le choisis à la création : `laravel new blog --pest`.

```php
<?php

use App\Models\Article;

test('la liste affiche les articles', function () {
    Article::factory()->create(['title' => 'Bonjour Laravel']);

    $this->get('/articles')
        ->assertOk()
        ->assertSee('Bonjour Laravel');
});
```

Dans `tests/Pest.php`, `RefreshDatabase` s'active pour tout le dossier :

```php
pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');
```

Les assertions sont les mêmes. Les TP de ce parcours utilisent PHPUnit.

## Les assertions courantes

### Réponse HTTP

| Assertion | Vérifie |
|-----------|---------|
| `assertStatus(200)` | le code HTTP exact |
| `assertOk()`, `assertCreated()`, `assertNoContent()` | 200, 201, 204 |
| `assertNotFound()`, `assertForbidden()`, `assertUnprocessable()` | 404, 403, 422 |
| `assertSee('texte')`, `assertDontSee('texte')` | le texte est (ou n'est pas) dans la page |
| `assertRedirect('/articles')` | redirection vers cette URL |
| `assertRedirectToRoute('articles.index')` | redirection vers cette route |
| `assertSessionHas('success')` | un message flash existe |
| `assertSessionHasErrors(['title'])` | le champ `title` a une erreur de validation |
| `assertViewHas('articles')` | la vue a reçu cette variable |
| `assertJson(['title' => 'Mon API'])` | le JSON contient ces valeurs |
| `assertJsonPath('data.title', 'Mon API')` | la valeur à ce chemin |
| `assertJsonCount(3, 'data')` | le nombre d'éléments sous `data` |

### Base de données

```php
$this->assertDatabaseHas('articles', ['title' => 'Mon titre']);
$this->assertDatabaseMissing('articles', ['id' => $article->id]);
$this->assertDatabaseCount('articles', 3);
```

## Tester un formulaire et la validation

```php
public function test_un_utilisateur_cree_un_article(): void
{
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/articles', [
        'title' => 'Mon titre',
        'slug' => 'mon-titre',
        'body' => 'Un contenu assez long.',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    $this->assertDatabaseHas('articles', ['title' => 'Mon titre', 'user_id' => $user->id]);
}

public function test_le_titre_est_obligatoire(): void
{
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/articles', ['title' => ''])
        ->assertSessionHasErrors(['title']);

    $this->assertDatabaseCount('articles', 0);
}
```

En test, la protection CSRF est désactivée : pas besoin de jeton.

## Simuler un utilisateur : `actingAs`

`actingAs($user)` fait comme si `$user` était connecté pour la requête.

```php
public function test_un_visiteur_est_redirige_vers_login(): void
{
    $this->get('/articles/create')->assertRedirect('/login');
}

public function test_seul_l_auteur_peut_supprimer(): void
{
    $article = Article::factory()->create();       // auteur créé par la factory
    $autre = User::factory()->create();

    $this->actingAs($autre)
        ->delete("/articles/{$article->id}")
        ->assertForbidden();

    $this->assertDatabaseHas('articles', ['id' => $article->id]);
}
```

## Tester une API

Utilise `getJson()`, `postJson()`, `putJson()`, `deleteJson()` : ils envoient `Accept: application/json`.

```php
use Laravel\Sanctum\Sanctum;

public function test_la_creation_demande_un_titre(): void
{
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/articles', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['title']);
}

public function test_la_liste_renvoie_trois_articles(): void
{
    Article::factory(3)->create();

    $this->getJson('/api/articles')
        ->assertOk()
        ->assertJsonCount(3, 'data');
}
```

## Une commande artisan personnalisée

```bash
php artisan make:command PurgerBrouillons
```

Laravel crée `app/Console/Commands/PurgerBrouillons.php`. Elle est disponible tout de suite.

```php
<?php

namespace App\Console\Commands;

use App\Models\Article;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('articles:purger {jours=30} {--force}')]
#[Description('Supprime les brouillons plus vieux que N jours')]
class PurgerBrouillons extends Command
{
    public function handle(): int
    {
        $jours = (int) $this->argument('jours');

        $requete = Article::whereNull('published_at')
            ->where('created_at', '<', now()->subDays($jours));

        $nombre = $requete->count();

        if (! $this->option('force') && ! $this->confirm("Supprimer {$nombre} brouillon(s) ?")) {
            return self::FAILURE;
        }

        $requete->delete();
        $this->info("{$nombre} brouillon(s) supprimé(s).");

        return self::SUCCESS;
    }
}
```

```bash
php artisan articles:purger            # 30 jours, demande confirmation
php artisan articles:purger 90 --force # 90 jours, sans confirmation
```

- `{jours=30}` est un **argument** avec une valeur par défaut ; `{--force}` est une **option** (vrai si présente).
- `$this->argument()` et `$this->option()` lisent les valeurs ; `$this->info()` affiche un message.

> [!NOTE]
> **Nouveau dans Laravel 13** : `make:command` utilise les attributs `#[Signature]` et `#[Description]`.
> Avant, on écrivait `protected $signature = 'articles:purger {jours=30} {--force}';` et `protected $description = '…';`. Les deux marchent.

Pour planifier la commande, écris dans `routes/console.php` :

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('articles:purger --force')->daily();
```

En local, `php artisan schedule:work` lance le planificateur.
Avant Laravel 11, le planning était dans `app/Console/Kernel.php`.

## Les files d'attente (queues)

Une **file d'attente** exécute une tâche plus tard, en arrière-plan. La réponse HTTP part tout de suite.
Une tâche s'appelle un **job**.

```bash
php artisan make:job EnvoyerMailBienvenue
```

```php
<?php

namespace App\Jobs;

use App\Mail\Bienvenue;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class EnvoyerMailBienvenue implements ShouldQueue
{
    use Queueable;

    public function __construct(public User $user) {}

    public function handle(): void
    {
        Mail::to($this->user)->send(new Bienvenue($this->user));
    }
}
```

```php
EnvoyerMailBienvenue::dispatch($user);   // mis dans la file
```

```bash
php artisan queue:work    # le worker exécute les jobs
```

- Le `.env` contient `QUEUE_CONNECTION=database` : les jobs sont stockés dans la table `jobs`, déjà créée par les migrations de base.
- `composer run dev` lance déjà un worker.
- `QUEUE_CONNECTION=sync` exécute les jobs tout de suite, sans worker (c'est le réglage des tests).

## Les mails et leur aperçu

```bash
php artisan make:mail Bienvenue
```

```php
<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class Bienvenue extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Bienvenue sur le blog');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.bienvenue');
    }
}
```

La vue `resources/views/mail/bienvenue.blade.php` reçoit les propriétés publiques, ici `$user`.

```php
Mail::to($user)->send(new Bienvenue($user));    // envoi immédiat
Mail::to($user)->queue(new Bienvenue($user));   // envoi par la file d'attente
```

**Aperçu dans le navigateur** : une route qui renvoie le mail l'affiche comme une page.

```php
// routes/web.php (seulement en local)
if (app()->isLocal()) {
    Route::get('/apercu-mail', function () {
        return new App\Mail\Bienvenue(App\Models\User::firstOrFail());
    });
}
```

Avec `MAIL_MAILER=log` (valeur du `.env` de départ), les mails envoyés sont écrits dans `storage/logs/laravel.log`.

### Tester sans envoyer

```php
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;

Mail::fake();
// … action qui envoie le mail …
Mail::assertSent(Bienvenue::class);

Queue::fake();
// … action qui lance le job …
Queue::assertPushed(EnvoyerMailBienvenue::class);
```

## Pièges fréquents

- **`no such table` dans un test** : il manque `use RefreshDatabase;`. La base en mémoire est vide.
- **Test ignoré** : la méthode ne commence pas par `test_` (ou n'a pas l'attribut `#[Test]`).
- **Redirection 302 au lieu de 422** : tu as utilisé `post()` sur une route d'API. Utilise `postJson()`.
- **Données qui fuient entre tests** : chaque test doit créer ses propres données.
- **Le worker ignore ton nouveau code** : `queue:work` garde l'ancien code en mémoire. Relance-le, ou lance `php artisan queue:restart`.
- **Job jamais exécuté** : aucun worker ne tourne. Lance `php artisan queue:work`.
- **Route d'aperçu en production** : elle expose les données d'un utilisateur. Limite-la au local.

## Résumé

- `php artisan test` lance les tests ; `make:test` en crée (`--unit` pour un test unitaire).
- Un test Feature : préparer (factories), agir (`$this->get()`, `post()`, `getJson()`…), vérifier (assertions).
- `RefreshDatabase` remet la base à zéro ; `actingAs($user)` simule une connexion.
- Assertions clés : `assertStatus`, `assertSee`, `assertRedirect`, `assertJson`, `assertSessionHasErrors`, `assertDatabaseHas`.
- `make:command` crée une commande ; `#[Signature]` définit son nom, ses arguments et options.
- Un job (`ShouldQueue`) est lancé avec `dispatch()` et exécuté par `php artisan queue:work`.
- Un mailable renvoyé par une route s'affiche dans le navigateur ; `Mail::fake()` et `Queue::fake()` servent aux tests.

## Pour pratiquer

Chaque TP contient des tests PHPUnit : lance `php artisan test` pour vérifier ton travail.
Relis les tests du TP [CRUD des articles avec validation](#/laravel/tp/03-crud-articles), puis ajoute tes propres tests au TP [Authentification et Policy](#/laravel/tp/06-auth-policy).
