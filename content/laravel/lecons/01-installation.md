# Installer Laravel et comprendre la structure

## Objectifs

- Installer PHP, Composer et l'installeur Laravel.
- Créer un projet Laravel 13 et le lancer en local.
- Savoir à quoi sert chaque dossier du projet.
- Utiliser le fichier `.env` et les commandes `artisan` de base.
- Suivre le trajet d'une requête dans Laravel.

## Ce qu'il te faut

Laravel 13 demande **PHP 8.3 ou plus**.
Il te faut aussi **Composer**, le gestionnaire de paquets PHP.
**Node.js** (avec npm) sert à compiler le CSS et le JavaScript.

```bash
php -v        # doit afficher 8.3 ou plus
composer -V
node -v
```

Si PHP manque, le site **php.new** installe PHP, Composer et l'installeur Laravel en une commande :

```bash
# Linux (il existe aussi une commande pour macOS et Windows sur php.new)
/bin/bash -c "$(curl -fsSL https://php.new/install/linux/8.5)"
```

> [!TIP]
> Sur macOS ou Windows, **Laravel Herd** installe PHP, Composer et un serveur local avec une interface graphique.

## Créer un projet

### Avec l'installeur `laravel`

```bash
composer global require laravel/installer
laravel new blog
```

L'installeur te pose des questions : starter kit, framework de tests, base de données.
Un **starter kit** est un projet de départ avec la connexion des utilisateurs déjà faite (leçon 8).
Pour ce parcours, choisis **aucun starter kit**, **PHPUnit** et **SQLite**.

Tu peux aussi donner certaines réponses en options :

```bash
laravel new blog --phpunit --database=sqlite
```

### Avec Composer seul

```bash
composer create-project laravel/laravel blog
```

Tu obtiens le squelette vierge : pas de starter kit, PHPUnit pour les tests.
Composer génère la clé de l'application, crée la base SQLite et lance les migrations.

### Lancer le projet

```bash
cd blog
npm install && npm run build
composer run dev
```

`composer run dev` lance en même temps le serveur PHP, un worker de file d'attente et Vite.
Ouvre ensuite http://localhost:8000.

Tu peux aussi lancer seulement le serveur PHP :

```bash
php artisan serve
```

> [!NOTE]
> **Changé depuis Laravel 8/9** : la base par défaut est **SQLite** (depuis Laravel 11).
> Le fichier `database/database.sqlite` est créé à l'installation, et les migrations sont déjà jouées.
> Tu n'as plus besoin d'installer MySQL pour débuter.

## La structure du projet

```text
blog/
├── app/                    ← ton code PHP
│   ├── Http/Controllers/   ← les contrôleurs
│   ├── Models/             ← les modèles Eloquent (User.php)
│   └── Providers/          ← AppServiceProvider.php
├── bootstrap/
│   ├── app.php             ← configuration : routes, middleware, exceptions
│   └── providers.php       ← liste des service providers
├── config/                 ← fichiers de configuration (app.php, database.php…)
├── database/
│   ├── factories/          ← fabriques de fausses données
│   ├── migrations/         ← structure des tables
│   ├── seeders/            ← remplissage de la base
│   └── database.sqlite     ← la base SQLite
├── public/                 ← seul dossier visible depuis le web (index.php)
├── resources/
│   ├── css/  js/           ← sources front, compilées par Vite
│   └── views/              ← les vues Blade
├── routes/
│   ├── web.php             ← routes des pages
│   └── console.php         ← commandes artisan et tâches planifiées
├── storage/                ← logs, cache, fichiers envoyés
├── tests/                  ← tests Feature et Unit
├── vendor/                 ← dépendances Composer (ne pas modifier)
├── .env                    ← variables d'environnement
└── artisan                 ← l'outil en ligne de commande
```

Les dossiers que tu touches le plus : `app/`, `routes/`, `resources/views/` et `database/`.

> [!NOTE]
> **Changé depuis Laravel 11** : la structure est allégée.
> Il n'y a plus de `app/Http/Kernel.php`, ni de `app/Console/Kernel.php`, ni de `app/Exceptions/Handler.php`.
> Les routes, les middleware et les exceptions se configurent dans `bootstrap/app.php`.
> Le fichier `routes/api.php` n'existe plus par défaut : tu l'ajoutes avec `php artisan install:api` (leçon 9).

### Le fichier `bootstrap/app.php`

C'est le point central de la configuration.

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // ajouter ou configurer des middleware
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // personnaliser la gestion des erreurs
    })->create();
```

- `withRouting()` dit quels fichiers de routes charger.
- `health: '/up'` crée une route qui répond 200 si l'application fonctionne.
- `withMiddleware()` remplace l'ancien `Kernel.php`.

## Le fichier `.env`

Le fichier `.env` contient la configuration propre à chaque machine : mots de passe, URL, mode debug.

```bash
APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxx
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite

SESSION_DRIVER=database
QUEUE_CONNECTION=database
MAIL_MAILER=log
```

- `.env` ne se commite **jamais** : il contient des secrets.
- `.env.example` est le modèle commité, sans secrets.
- `APP_KEY` sert à chiffrer les sessions et les cookies. Tu la crées avec `php artisan key:generate`.
- `APP_DEBUG=true` affiche le détail des erreurs. Mets `false` en production.

Les fichiers de `config/` lisent `.env` avec `env()`. Dans ton code, utilise `config()` :

```php
// config/app.php
'name' => env('APP_NAME', 'Laravel'),

// dans ton code
$nom = config('app.name');
```

## Artisan, l'outil en ligne de commande

`artisan` crée des fichiers, lance des migrations, affiche les routes, etc.

| Commande | Rôle |
|----------|------|
| `php artisan serve` | lance le serveur local |
| `php artisan make:controller ArticleController` | crée un contrôleur |
| `php artisan make:model Article -m` | crée un modèle et sa migration |
| `php artisan migrate` | exécute les migrations |
| `php artisan route:list` | liste toutes les routes |
| `php artisan tinker` | ouvre une console PHP dans ton application |
| `php artisan list` | liste toutes les commandes |
| `php artisan help make:model` | affiche l'aide d'une commande |
| `php artisan about` | résume la configuration (versions, drivers…) |
| `php artisan optimize:clear` | vide tous les caches (config, routes, vues) |

Toutes les commandes `make:*` génèrent du code au bon endroit, avec le bon namespace.

### Tinker

Tinker est une console interactive (REPL) : tu tapes du PHP, tu vois le résultat tout de suite.

```bash
php artisan tinker
> User::count()
= 0
> User::factory()->create(['name' => 'Ada'])
> User::first()->name
= "Ada"
> exit
```

C'est pratique pour tester une requête Eloquent sans écrire de page.

## Le trajet d'une requête

1. Le serveur web envoie **toutes** les requêtes à `public/index.php`.
2. `index.php` charge Composer et crée l'application avec `bootstrap/app.php`.
3. Laravel charge les **service providers**. Un service provider est une classe qui configure un service (base de données, routes, cache…).
4. La requête traverse les **middleware**. Un middleware est un filtre qui s'exécute avant ton code : session, protection CSRF, connexion…
5. Le **routeur** cherche la route qui correspond à la méthode HTTP et à l'URL.
6. La route appelle une fonction ou un **contrôleur**. Il renvoie une réponse : page HTML, JSON ou redirection.
7. La réponse repasse par les middleware, puis part vers le navigateur.

```text
Navigateur ─► public/index.php ─► bootstrap/app.php ─► middleware ─► route ─► contrôleur
                                                                                  │
Navigateur ◄──────────────── middleware ◄──────────── réponse (vue Blade, JSON…) ◄┘
```

## Pièges fréquents

- **Mauvaise racine web** : le serveur doit pointer sur `public/`, jamais sur la racine du projet. Sinon `.env` devient lisible depuis le web.
- **« Vite manifest not found »** : tu as oublié `npm install && npm run build` (ou `npm run dev`).
- **`.env` commité** : tes secrets partent sur Git. Vérifie qu'il est dans `.gitignore`.
- **`env()` dans le code** : après `php artisan config:cache`, `env()` renvoie `null` hors des fichiers de `config/`. Utilise `config()`.
- **PHP trop ancien** : Composer refuse d'installer Laravel 13 avec PHP 8.2.
- **Modifier `vendor/`** : tes changements sont perdus au prochain `composer install`.
- **Config qui ne change pas** : un cache est actif. Lance `php artisan optimize:clear`.

## Résumé

- Laravel 13 demande PHP 8.3+, Composer et Node.js.
- `laravel new blog` ou `composer create-project laravel/laravel blog` crée le projet.
- `composer run dev` lance le serveur, la file d'attente et Vite ; `php artisan serve` lance seulement le serveur.
- SQLite est la base par défaut depuis Laravel 11.
- `bootstrap/app.php` configure routes, middleware et exceptions : il n'y a plus de `Kernel.php`.
- `.env` contient la config locale et les secrets ; dans le code, lis-la avec `config()`.
- `artisan` génère du code (`make:*`), gère la base (`migrate`) et liste les routes (`route:list`).
- Une requête passe par `public/index.php`, les middleware, le routeur, puis le contrôleur.

## Pour pratiquer

Installe le projet de TP en suivant le fichier `tp/laravel/README.md`.
Lance `php artisan about`, `php artisan route:list` et ouvre `php artisan tinker`.
Après les leçons 2 et 3, fais le premier TP : [Routes et vues Blade](#/laravel/tp/01-routes-blade).
