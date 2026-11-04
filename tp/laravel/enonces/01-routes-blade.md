# Routes et vues Blade

## Objectif

Tu poses les bases du blog : trois pages, des routes nommées, un petit contrôleur et un layout commun.
Le layout est un composant Blade `<x-layout>` avec la navigation du site.

## Ce que tu vas pratiquer

- les routes dans `routes/web.php` : `Route::view()` et `Route::get()` ;
- les paramètres de route (`{nom}`) et un contrôleur simple ;
- les routes nommées et le helper `route()` ;
- les composants Blade anonymes, avec `@props` et `{{ $slot }}` ;
- l'échappement automatique de `{{ }}`.

Leçons utiles : [les routes et contrôleurs](#/laravel/lecon/02-routes-controleurs) et [Blade](#/laravel/lecon/03-blade).

## Fichiers à créer ou modifier

- `routes/web.php` (à modifier)
- `app/Http/Controllers/PageController.php` (à créer)
- `resources/views/components/layout.blade.php` (à créer)
- `resources/views/accueil.blade.php` (à créer)
- `resources/views/a-propos.blade.php` (à créer)
- `resources/views/bonjour.blade.php` (à créer)

Commandes conseillées :

```bash
php artisan make:view accueil
php artisan make:view a-propos
php artisan make:view bonjour
php artisan make:component layout --view
php artisan make:controller PageController
```

`make:component layout --view` crée un composant anonyme : seulement la vue, sans classe PHP.

## Étapes

1. Crée le composant `resources/views/components/layout.blade.php`. Il reçoit une prop `titre` avec `@props(['titre' => 'Mon blog'])`.
2. Dans le layout, écris une page HTML complète. La balise `<title>` contient `{{ $titre }} - Mon blog`.
3. Ajoute une feuille de style simple : `<link rel="stylesheet" href="{{ asset('css/blog.css') }}">`. Le fichier `public/css/blog.css` existe déjà. Pas besoin de Vite.
4. Ajoute un `<nav>` avec deux liens : « Accueil » et « À propos ». Les liens utilisent `route()` : `href="{{ route('accueil') }}"`.
5. Affiche le contenu de la page avec `{{ $slot }}`, dans une balise `<main>`.
6. Crée les trois vues. Chacune commence par `<x-layout titre="…">` et finit par `</x-layout>`.
7. Dans `PageController`, écris la méthode `bonjour(string $nom)`. Elle renvoie `view('bonjour', ['nom' => $nom])`.
8. Dans `routes/web.php`, remplace la route `welcome` par les trois routes du tableau. Donne un nom à chacune avec `->name()`. La route `bonjour` appelle le contrôleur : `[PageController::class, 'bonjour']`.
9. Dans la vue `bonjour`, affiche le nom avec `{{ $nom }}` (jamais `{!! !!}`).

| URL | Nom de route | Action | Vue | `titre` du layout | Titre `<h1>` |
|-----|--------------|--------|-----|-------------------|--------------|
| `/` | `accueil` | `Route::view()` | `accueil` | `Accueil` | `Bienvenue sur mon blog` |
| `/a-propos` | `a-propos` | `Route::view()` | `a-propos` | `À propos` | `À propos` |
| `/bonjour/{nom}` | `bonjour` | `PageController@bonjour` | `bonjour` | `Bonjour` | `Bonjour, {nom} !` |

Exemple : `/bonjour/Alice` affiche `Bonjour, Alice !` et le titre d'onglet `Bonjour - Mon blog`.

> [!TIP]
> Pour une page sans logique, `Route::view('/a-propos', 'a-propos')` suffit. Pas besoin de fonction ni de contrôleur.

## Lancer les tests

Depuis le dossier `tp/laravel` :

```bash
php artisan test --filter=Tp01
```

Pour voir le site : `php artisan serve`, puis ouvre http://localhost:8000.

## Critères de réussite

- `/` répond 200 et affiche `Bienvenue sur mon blog` dans un `<h1>`.
- `/a-propos` répond 200 et affiche `À propos` dans un `<h1>`.
- `/bonjour/Alice` affiche `Bonjour, Alice !`.
- Le nom est échappé : `/bonjour/<b>Zoé` affiche `&lt;b&gt;Zoé` dans le HTML, pas une vraie balise `<b>`.
- Les routes s'appellent `accueil`, `a-propos` et `bonjour`.
- La route `bonjour` appelle `PageController@bonjour`.
- Le composant `resources/views/components/layout.blade.php` existe, affiche le slot et met `{titre} - Mon blog` dans `<title>`.
- Chaque page contient un `<nav>` avec des liens vers `route('accueil')` et `route('a-propos')`.
- Les titres d'onglet sont `Accueil - Mon blog`, `À propos - Mon blog` et `Bonjour - Mon blog`.

## Pour aller plus loin

- Limite `{nom}` aux lettres avec `->where('nom', '[\pL\- ]+')`. Que renvoie `/bonjour/123` ?
- Mets en valeur le lien de la page courante avec `request()->routeIs('a-propos')`.
- Ajoute un slot nommé `<x-slot:pied>` pour personnaliser le pied de page.
- Lance `php artisan route:list` et retrouve tes trois routes.
