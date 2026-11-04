# TP Laravel : un blog, TP après TP

Ce dossier est une vraie application Laravel 13.
Tu la complètes TP après TP pour construire un petit blog : pages Blade, articles, administration, catégories, API JSON, connexion.
Chaque TP a son énoncé et ses tests automatiques (PHPUnit). Ton but : faire passer les tests.

## Prérequis

- **PHP 8.3 ou plus** : `php -v`
- **Composer 2** : `composer -V`
- Les extensions PHP demandées par Laravel : `ctype`, `curl`, `dom`, `fileinfo`, `filter`, `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`.
- Pour la base de données : **`pdo_sqlite`** (SQLite, aucun serveur à installer).

Vérifie les extensions avec `php -m`. Sous Windows, active-les dans `php.ini` (lignes `extension=…`).

Pas besoin de Node.js : les pages utilisent une simple feuille de style, `public/css/blog.css`, sans Vite.

## Installation

Depuis ce dossier (`tp/laravel`) :

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
```

Sous Windows (PowerShell), remplace `cp` par `copy` et `touch database/database.sqlite` par `New-Item database/database.sqlite`.

Puis lance le site :

```bash
php artisan serve
```

Ouvre http://localhost:8000.

> Les tests n'utilisent pas `database/database.sqlite` : ils travaillent dans une base SQLite en mémoire, vidée à chaque test (voir `phpunit.xml`). Ils ont quand même besoin du fichier `.env` et de sa clé `APP_KEY`.

## Les TP

| TP | Titre | Niveau | Énoncé | Tests |
|----|-------|--------|--------|-------|
| 01 | Routes et vues Blade | 1 | `enonces/01-routes-blade.md` | `tests/Feature/Tp01RoutesBladeTest.php` |
| 02 | Modèle Article et liste | 1 | `enonces/02-articles-eloquent.md` | `tests/Feature/Tp02ArticlesEloquentTest.php` |
| 03 | CRUD des articles avec validation | 2 | `enonces/03-crud-articles.md` | `tests/Feature/Tp03CrudArticlesTest.php` |
| 04 | Catégories et relations | 2 | `enonces/04-categories-relations.md` | `tests/Feature/Tp04CategoriesRelationsTest.php` |
| 05 | API REST JSON | 2 | `enonces/05-api-rest.md` | `tests/Feature/Tp05ApiRestTest.php` |
| 06 | Authentification et Policy | 3 | `enonces/06-auth-policy.md` | `tests/Feature/Tp06AuthPolicyTest.php` |

Fais-les **dans l'ordre** : chaque TP s'appuie sur le précédent.
Au départ, tous les tests des TP échouent. C'est normal.

## Commandes

```bash
php artisan test                  # tous les tests
php artisan test --filter=Tp03    # un seul TP
php verifier-solutions.php        # vérifie que les solutions passent tous les tests
```

Autres commandes utiles :

```bash
php artisan route:list            # toutes les routes, avec leurs noms
php artisan migrate:fresh --seed  # base vidée, migrations relancées, seeders lancés
php artisan tinker                # console PHP dans l'application
```

## Organisation

```
tp/laravel/
  README.md                 ce fichier
  enonces/                  un énoncé par TP (aussi affiché sur le site)
  tests/Feature/Tp0X…Test.php   les tests de chaque TP
  solutions/<id>/           la solution de chaque TP, aux mêmes chemins que dans le projet
  verifier-solutions.php    applique les solutions dans une copie et lance les tests
  app/, routes/, resources/, database/…   l'application Laravel (squelette officiel)
```

Les solutions s'empilent : `solutions/03-crud-articles/` contient seulement les fichiers créés ou modifiés au TP 03, dans leur état à la fin du TP 03.

`php verifier-solutions.php` ne touche jamais à ton projet. Il le copie dans un dossier temporaire (sans `vendor/`, qu'il réutilise), applique les solutions 01 à 06 dans l'ordre, puis lance `php artisan test`. Le code de sortie vaut 0 si tout passe.
Options : `--jusqua=03` (solutions 01 à 03 seulement), `--garder` (garde la copie), et toute option de `php artisan test` (`--filter=Tp03`).

> Le script part de ton dossier tel qu'il est. Si tu as déjà créé tes propres migrations, elles s'ajoutent à celles des solutions et peuvent entrer en conflit (table créée deux fois). Pour vérifier les solutions seules, lance-le depuis un clone propre du dépôt.

## Conseils

- Lis tout l'énoncé avant de coder. Les URL, noms de routes, noms de champs et textes du tableau sont ceux des tests : respecte-les à la lettre.
- Lance les tests du TP souvent : `php artisan test --filter=Tp02`. Un test qui échoue affiche la ligne en cause et ce qu'il attendait.
- Les noms des tests décrivent le comportement attendu : `test_un_article_non_publie_ou_inconnu_renvoie_une_404`.
- Utilise `php artisan make:…` pour créer les fichiers (modèles, contrôleurs, requêtes, policies) : les chemins et les espaces de noms seront justes.
- Bloqué ? Compare avec le dossier `solutions/` du TP, fichier par fichier. Essaie d'abord seul : c'est en cherchant qu'on retient.
- Après une modification de `.env` ou de `config/`, lance `php artisan config:clear`.
- Pour repartir de zéro sur un TP, `git restore` et `git clean` sur les fichiers concernés.
