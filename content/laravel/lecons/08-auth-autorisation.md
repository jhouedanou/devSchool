# Authentification et autorisation

## Objectifs

- Choisir un starter kit pour la connexion des utilisateurs.
- Lire l'utilisateur connecté avec `Auth::user()` ou `auth()->user()`.
- Protéger des routes avec les middleware `auth` et `guest`.
- Hacher et vérifier les mots de passe.
- Autoriser des actions avec les Gates et les Policies.

Deux questions différentes :

- **Authentification** : qui es-tu ? (connexion)
- **Autorisation** : as-tu le droit de faire ça ? (permissions)

## Les starter kits

Un starter kit ajoute à ton projet tout le code de connexion : inscription, connexion, mot de passe oublié, vérification d'email, profil, double authentification.
Tu le choisis à la création du projet :

```bash
laravel new blog
# → choisis React, Vue, Svelte ou Livewire
```

| Starter kit | Front |
|-------------|-------|
| React, Vue, Svelte | Inertia + TypeScript + Tailwind + shadcn |
| Livewire | Blade + Livewire + Flux UI |

Le backend de connexion est **Laravel Fortify**. Tout le code est copié dans ton application : tu peux le modifier.
Une variante **WorkOS AuthKit** ajoute la connexion Google/GitHub, les passkeys et le SSO.

> [!NOTE]
> **Changé depuis Laravel 12** : Breeze et Jetstream ne reçoivent plus de mises à jour.
> Fini `composer require laravel/breeze` puis `php artisan breeze:install` : le choix se fait dans `laravel new`.

### Une connexion à la main

Sans starter kit, `Auth::attempt()` vérifie l'email et le mot de passe :

```php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    if (Auth::attempt($credentials)) {
        $request->session()->regenerate();   // nouvelle session : sécurité

        return redirect()->intended(route('articles.index'));
    }

    return back()->withErrors([
        'email' => 'Email ou mot de passe incorrect.',
    ])->onlyInput('email');
}

public function logout(Request $request)
{
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/');
}
```

`redirect()->intended()` renvoie vers la page que l'utilisateur voulait voir avant de se connecter.

## L'utilisateur connecté

```php
use Illuminate\Support\Facades\Auth;

$user = Auth::user();      // le modèle User, ou null
$id = Auth::id();          // son id, ou null
Auth::check();             // true si connecté

$user = auth()->user();    // même chose avec le helper
$user = $request->user();  // dans un contrôleur
```

Dans Blade :

```blade
@auth
    <p>Bonjour {{ auth()->user()->name }}</p>
@endauth

@guest
    <a href="{{ route('login') }}">Connexion</a>
@endguest
```

## Protéger les routes : `auth` et `guest`

```php
// Seulement pour les utilisateurs connectés
Route::middleware('auth')->group(function () {
    Route::resource('articles', ArticleController::class)->except(['index', 'show']);
});

// Seulement pour les visiteurs non connectés
Route::get('/login', [LoginController::class, 'create'])->middleware('guest')->name('login');
```

- `auth` : un visiteur non connecté est redirigé vers la route nommée `login`. Une requête JSON reçoit **401**.
- `guest` : un utilisateur déjà connecté est redirigé vers le tableau de bord.

Change ces redirections dans `bootstrap/app.php` :

```php
->withMiddleware(function (Middleware $middleware): void {
    $middleware->redirectGuestsTo('/connexion');
    $middleware->redirectUsersTo('/tableau-de-bord');
})
```

> [!NOTE]
> **Changé depuis Laravel 11** : il n'y a plus de `app/Http/Kernel.php` ni de middleware `Authenticate` / `RedirectIfAuthenticated` dans ton dossier `app/`. Tout se règle dans `bootstrap/app.php`.
> **Laravel 13** ajoute aussi l'attribut `#[Middleware('auth')]`, à placer sur une classe de contrôleur ou une méthode.

## Les mots de passe

Ne stocke **jamais** un mot de passe en clair. Stocke son **hash** : une empreinte qu'on ne peut pas inverser.

```php
use Illuminate\Support\Facades\Hash;

$hash = Hash::make('secret123');          // bcrypt par défaut
Hash::check('secret123', $hash);          // true
```

Le modèle `User` a le cast `'password' => 'hashed'`. Le mot de passe est haché tout seul à l'enregistrement :

```php
User::create([
    'name' => 'Ada',
    'email' => 'ada@example.com',
    'password' => 'secret123',   // stocké haché
]);
```

## Les Gates

Une **Gate** est une règle d'autorisation simple, écrite comme une fonction.
Déclare-la dans `app/Providers/AppServiceProvider.php` :

```php
use App\Models\User;
use Illuminate\Support\Facades\Gate;

public function boot(): void
{
    Gate::define('acces-admin', function (User $user) {
        return $user->is_admin;
    });
}
```

Utilise-la :

```php
if (Gate::allows('acces-admin')) {
    // autorisé
}

if (Gate::denies('acces-admin')) {
    abort(403);
}

Gate::authorize('acces-admin');   // lève une erreur 403 si refusé
```

```blade
@can('acces-admin')
    <a href="/admin">Administration</a>
@endcan
```

## Les Policies

Une **Policy** regroupe les règles d'autorisation d'un modèle : qui peut voir, créer, modifier, supprimer.

```bash
php artisan make:policy ArticlePolicy --model=Article
```

```php
<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

class ArticlePolicy
{
    public function create(User $user): bool
    {
        return true;   // tout utilisateur connecté
    }

    public function update(User $user, Article $article): bool
    {
        return $user->id === $article->user_id;
    }

    public function delete(User $user, Article $article): bool
    {
        return $user->id === $article->user_id;
    }
}
```

Laravel trouve la Policy tout seul : `App\Models\Article` → `App\Policies\ArticlePolicy`.
Pour un visiteur non connecté, la réponse est toujours « refusé ».

> [!NOTE]
> **Changé depuis Laravel 11** : `AuthServiceProvider` et son tableau `$policies` n'existent plus. La découverte automatique suffit.

### Vérifier dans le contrôleur

```php
use Illuminate\Support\Facades\Gate;

public function update(UpdateArticleRequest $request, Article $article)
{
    Gate::authorize('update', $article);   // 403 si ce n'est pas l'auteur

    $article->update($request->validated());

    return to_route('articles.show', $article);
}

public function store(StoreArticleRequest $request)
{
    Gate::authorize('create', Article::class);   // pas d'article : on passe la classe

    $request->user()->articles()->create($request->validated());

    return to_route('articles.index');
}
```

La dernière ligne remplit `user_id` tout seul, grâce à la relation `articles()` (hasMany) du modèle `User`.

Autres façons de vérifier :

```php
$request->user()->can('update', $article);      // true / false
$request->user()->cannot('delete', $article);

Route::put('/articles/{article}', [ArticleController::class, 'update'])
    ->can('update', 'article');                 // middleware sur la route
```

Dans une Form Request :

```php
public function authorize(): bool
{
    return $this->user()->can('update', $this->route('article'));
}
```

> [!NOTE]
> **Depuis Laravel 11**, `$this->authorize('update', $article)` ne marche plus dans un contrôleur neuf : la classe `Controller` de base est vide. Utilise `Gate::authorize()`, ou ajoute le trait `AuthorizesRequests` au contrôleur.

### Dans Blade

```blade
@can('update', $article)
    <a href="{{ route('articles.edit', $article) }}">Modifier</a>
@endcan

@cannot('delete', $article)
    <p>Tu ne peux pas supprimer cet article.</p>
@endcannot
```

### Un administrateur qui peut tout faire

La méthode `before()` s'exécute avant les autres méthodes de la Policy :

```php
public function before(User $user, string $ability): ?bool
{
    return $user->is_admin ? true : null;   // null : on continue avec la règle normale
}
```

## Pièges fréquents

- **`Route [login] not defined`** : le middleware `auth` redirige vers une route nommée `login` qui n'existe pas.
- **Bouton caché, action ouverte** : `@can` cache le bouton, mais l'URL reste accessible. Vérifie aussi dans le contrôleur.
- **Policy jamais appelée** : mauvais nom ou mauvais dossier. Elle doit s'appeler `ArticlePolicy` dans `app/Policies`.
- **`Gate::authorize('update', Article::class)`** : la méthode `update` attend un article. Passe l'instance `$article`.
- **`$this->authorize()` introuvable** : la classe `Controller` n'a plus le trait. Utilise `Gate::authorize()`.
- **Oublier `session()->regenerate()`** après la connexion : risque de vol de session.
- **Comparer des mots de passe avec `===`** : utilise `Hash::check()`.

## Résumé

- Les starter kits (React, Vue, Svelte, Livewire) fournissent la connexion avec Fortify ; Breeze et Jetstream ne sont plus mis à jour.
- `Auth::user()`, `auth()->user()` et `$request->user()` donnent l'utilisateur connecté.
- Le middleware `auth` protège une route ; `guest` la réserve aux visiteurs.
- `Hash::make()` hache, `Hash::check()` vérifie ; le cast `hashed` hache le mot de passe du `User`.
- Une Gate est une règle simple (`Gate::define`) ; une Policy regroupe les règles d'un modèle (`make:policy`).
- `Gate::authorize('update', $article)` lève une 403 si refusé ; `@can` / `@cannot` adaptent la vue.

## Pour pratiquer

Fais le TP [Authentification et Policy](#/laravel/tp/06-auth-policy) : protéger les routes et limiter la modification d'un article à son auteur.
