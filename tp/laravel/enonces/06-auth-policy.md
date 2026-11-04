# Authentification et Policy

## Objectif

Les visiteurs peuvent se connecter et écrire leurs propres articles.
Chaque article a un auteur. Seul l'auteur peut modifier ou supprimer son article.
Tu écris la connexion à la main, sans starter kit, pour bien voir chaque étape.

## Ce que tu vas pratiquer

- `Auth::attempt()`, `Auth::logout()` et la régénération de session ;
- les middlewares `auth` et `guest` ;
- une Policy et `Gate::authorize()` ;
- `@auth`, `@guest` et `@can` dans Blade ;
- les tests avec `actingAs()`, `assertAuthenticatedAs()` et `assertForbidden()`.

Leçons utiles : [l'authentification et l'autorisation](#/laravel/lecon/08-auth-autorisation) et [les tests](#/laravel/lecon/10-tests-artisan).

## La conception choisie

L'admin du TP 03 et l'API du TP 05 restent ouvertes et inchangées. Leurs tests continuent donc de passer.
Le travail des auteurs se fait dans un **espace séparé** : `/mes-articles`.

- `/mes-articles` demande d'être connecté (middleware `auth`).
- On y voit seulement ses propres articles.
- Un article créé là reçoit l'utilisateur connecté comme auteur (`user_id`).
- La policy refuse (403) la modification et la suppression à toute autre personne que l'auteur.
- `user_id` est nullable : les articles créés par l'admin ou l'API n'ont pas d'auteur.

> [!NOTE]
> Dans une vraie application, tu protégerais aussi `/admin` et l'API (rôle administrateur, Sanctum). Voir « Pour aller plus loin ».

## Fichiers à créer ou modifier

- `database/migrations/xxxx_add_user_id_to_articles_table.php` (à créer)
- `app/Models/Article.php` (relation `auteur()`) et `app/Models/User.php` (relation `articles()`)
- `app/Policies/ArticlePolicy.php` (à créer)
- `app/Http/Controllers/ConnexionController.php` (à créer)
- `app/Http/Controllers/MesArticlesController.php` (à créer)
- `resources/views/connexion.blade.php` (à créer)
- `resources/views/mes-articles/index.blade.php`, `create.blade.php`, `edit.blade.php` (à créer)
- `resources/views/components/layout.blade.php` (liens Connexion / Mes articles / Déconnexion)
- `bootstrap/app.php` (où envoyer les invités)
- `routes/web.php` (à modifier)

Commandes conseillées :

```bash
php artisan make:migration add_user_id_to_articles_table --table=articles
php artisan make:policy ArticlePolicy --model=Article
php artisan make:controller ConnexionController
php artisan make:controller MesArticlesController --resource --model=Article
```

## Étapes

1. Migration : `$table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();` Puis `php artisan migrate`.
2. Dans `Article`, ajoute `auteur()` : `return $this->belongsTo(User::class, 'user_id');` Dans `User`, ajoute `articles()` : `return $this->hasMany(Article::class);`
3. N'ajoute **pas** `user_id` aux champs `Fillable` : l'auteur vient de l'utilisateur connecté, jamais du formulaire.
4. `ArticlePolicy` : les méthodes `update()` et `delete()` renvoient `$user->id === $article->user_id`. Laravel trouve la policy tout seul grâce à son nom.
5. Routes de connexion :

   | Méthode | URL | Nom | Middleware | Action |
   |---------|-----|-----|------------|--------|
   | GET | `/connexion` | `connexion` | `guest` | `ConnexionController@create` |
   | POST | `/connexion` | (aucun) | `guest` | `ConnexionController@store` |
   | POST | `/deconnexion` | `deconnexion` | `auth` | `ConnexionController@destroy` |

6. La vue `connexion.blade.php` contient un formulaire `POST` vers `route('connexion')` avec `@csrf`, un champ `email` et un champ `password`.
7. `store()` valide `email` (`required`, `email`) et `password` (`required`). Ensuite :
   - si `Auth::attempt($identifiants)` échoue : retour au formulaire avec l'erreur `Ces identifiants ne correspondent pas.` sur la clé `email` (`back()->withErrors([...])->onlyInput('email')`) ;
   - sinon : `$request->session()->regenerate()`, puis `redirect()->intended(route('mes-articles.index'))`.
8. `destroy()` : `Auth::logout()`, `$request->session()->invalidate()`, `$request->session()->regenerateToken()`, puis redirection vers `/`.
9. Dans `bootstrap/app.php`, dans `withMiddleware()` : `$middleware->redirectGuestsTo(fn () => route('connexion'));` Un invité qui ouvre `/mes-articles` part alors vers `/connexion`. Tu peux aussi ajouter `$middleware->redirectUsersTo(fn () => route('mes-articles.index'));` : un utilisateur déjà connecté qui ouvre `/connexion` part vers son espace.
10. Routes de l'espace auteur, dans un groupe `Route::middleware('auth')` :

    ```php
    Route::resource('mes-articles', MesArticlesController::class)
        ->except('show')
        ->parameters(['mes-articles' => 'article']);
    ```

    `parameters()` nomme le paramètre `{article}`. Sans lui, il s'appellerait `{mes_article}`, et `ArticleRequest` ne trouverait plus l'article à ignorer pour l'unicité du slug.
11. `MesArticlesController` :
    - `index()` : `$request->user()->articles()->latest()->get()` ;
    - `store(ArticleRequest $request)` : `$request->user()->articles()->create($request->validated())` remplit `user_id` tout seul ;
    - `edit()`, `update()` : commence par `Gate::authorize('update', $article)` ;
    - `destroy()` : commence par `Gate::authorize('delete', $article)` ;
    - redirige vers `route('mes-articles.index')` avec les mêmes messages flash qu'au TP 03 (`Article créé.`, `Article modifié.`, `Article supprimé.`).
12. Les vues `mes-articles/create` et `edit` réutilisent `@include('admin.articles._champs')`.
13. Dans le layout : `@auth` affiche « Mes articles » et un bouton « Déconnexion » (petit formulaire `POST` vers `route('deconnexion')`) ; sinon, un lien « Connexion ».

> [!TIP]
> Pour tester dans le navigateur : `php artisan migrate:fresh --seed`, puis connecte-toi avec `test@example.com` et le mot de passe `password` (valeur de `UserFactory`).

## Lancer les tests

Depuis le dossier `tp/laravel` :

```bash
php artisan test --filter=Tp06
```

Puis lance toute la suite pour vérifier que les TP 03 et 05 passent encore :

```bash
php artisan test
```

## Critères de réussite

- Un invité qui ouvre `/mes-articles` est redirigé vers `/connexion`.
- `/connexion` affiche un formulaire avec les champs `email` et `password`.
- De bons identifiants connectent l'utilisateur et redirigent vers `/mes-articles`.
- De mauvais identifiants redirigent vers `/connexion` avec l'erreur `Ces identifiants ne correspondent pas.` ; personne n'est connecté.
- `POST /deconnexion` déconnecte l'utilisateur et redirige vers `/`.
- `/mes-articles` affiche seulement les articles de l'utilisateur connecté.
- Un article créé dans `/mes-articles` a pour `user_id` l'utilisateur connecté ; message `Article créé.`
- La policy : l'auteur peut `update` et `delete` ; un autre utilisateur ne peut pas.
- L'auteur peut ouvrir le formulaire de modification, modifier (`Article modifié.`) et supprimer (`Article supprimé.`) son article.
- Un autre utilisateur reçoit 403 sur `edit`, `update` et `destroy`, et l'article ne change pas.

## Pour aller plus loin

- Sur la page publique d'un article, affiche un lien « Modifier cet article » avec `@can('update', $article)`.
- Ajoute une colonne `est_admin` aux utilisateurs et une méthode `before()` dans la policy : un admin peut tout faire.
- Protège `/admin` avec un Gate `admin` et le middleware `can:admin`. Adapte les tests du TP 03 avec `actingAs()`.
- Limite les tentatives de connexion avec `RateLimiter` (5 essais par minute).
- Compare avec un starter kit officiel (`laravel new` propose React, Vue, Livewire) : retrouve les mêmes étapes dans son code.
