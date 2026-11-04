# Les vues Blade

## Objectifs

- Renvoyer une vue avec `view()` et lui passer des données.
- Afficher des valeurs en sécurité avec `{{ }}`.
- Utiliser les conditions et les boucles de Blade.
- Construire un layout avec un composant (`<x-layout>`, `$slot`).
- Reconnaître l'ancien style `@extends` / `@section`.
- Charger le CSS et le JS avec `@vite`.

## Renvoyer une vue

**Blade** est le moteur de templates de Laravel.
Une vue est un fichier `.blade.php` dans `resources/views/`.

```text
resources/views/
├── welcome.blade.php
├── articles/
│   ├── index.blade.php     ← view('articles.index')
│   └── show.blade.php      ← view('articles.show')
└── components/
    └── layout.blade.php    ← <x-layout>
```

Le point dans le nom remplace le `/` du dossier.

```php
public function index()
{
    $articles = ['Bonjour Laravel', 'Les routes', 'Blade'];

    return view('articles.index', ['articles' => $articles, 'titre' => 'Mes articles']);
}
```

Deux autres façons d'écrire la même chose :

```php
return view('articles.index', compact('articles', 'titre'));
return view('articles.index')->with('titre', 'Mes articles');
```

Chaque clé du tableau devient une variable dans la vue : `$articles`, `$titre`.

## Afficher des données

```blade
<h1>{{ $titre }}</h1>
<p>{{ strtoupper($titre) }}</p>
<p>{{ $sousTitre ?? 'Pas de sous-titre' }}</p>
<p>Nous sommes le {{ now()->format('d/m/Y') }}.</p>
```

- `{{ $x }}` affiche la valeur **échappée** : `<script>` devient du texte inoffensif. Cela protège contre les failles XSS (injection de code dans la page).
- `{!! $x !!}` affiche la valeur **sans échappement**. Utilise-le seulement pour du HTML sûr que tu as produit toi-même.
- `{{-- commentaire --}}` est un commentaire Blade : il n'apparaît pas dans le HTML.
- `@{{ nom }}` affiche `{{ nom }}` tel quel, pour un framework JS comme Vue.

```blade
{{-- Le visiteur a écrit : <b>Salut</b> --}}
{{ $commentaire }}    {{-- affiche : &lt;b&gt;Salut&lt;/b&gt; --}}
{!! $commentaire !!}  {{-- affiche Salut en gras : dangereux si le texte vient d'un visiteur --}}
```

## Les conditions

```blade
@if (count($articles) === 0)
    <p>Aucun article.</p>
@elseif (count($articles) === 1)
    <p>Un seul article.</p>
@else
    <p>{{ count($articles) }} articles.</p>
@endif

@unless ($estAdmin)
    <p>Accès limité.</p>
@endunless

@isset($message)
    <p>{{ $message }}</p>
@endisset

@auth
    <a href="/profil">Mon profil</a>
@endauth

@guest
    <a href="/login">Connexion</a>
@endguest
```

`@unless` est l'inverse de `@if`. `@auth` et `@guest` testent si l'utilisateur est connecté.

## Les boucles

```blade
<ul>
    @foreach ($articles as $article)
        <li>{{ $loop->iteration }}. {{ $article }}</li>
    @endforeach
</ul>
```

`@forelse` gère aussi le cas de la liste vide :

```blade
<ul>
    @forelse ($articles as $article)
        <li>{{ $article }}</li>
    @empty
        <li>Aucun article pour l'instant.</li>
    @endforelse
</ul>
```

Dans une boucle, la variable `$loop` donne des infos utiles :

| Propriété | Valeur |
|-----------|--------|
| `$loop->iteration` | numéro du tour, à partir de 1 |
| `$loop->index` | numéro du tour, à partir de 0 |
| `$loop->first` / `$loop->last` | premier / dernier tour |
| `$loop->count` | nombre total d'éléments |

Il existe aussi `@for` et `@while`, comme en PHP.

### Petits raccourcis d'attributs

```blade
<li @class(['article', 'actif' => $loop->first])>…</li>
<input type="checkbox" name="published" @checked($publie)>
<option value="php" @selected($langage === 'php')>PHP</option>
```

## Un layout avec un composant

Toutes tes pages partagent le même squelette HTML.
Tu le mets dans un **composant** Blade : un morceau de vue réutilisable.

Un fichier dans `resources/views/components/` devient un composant `<x-nom>`.

```blade
{{-- resources/views/components/layout.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'Mon blog' }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <nav>
        <a href="{{ route('articles.index') }}">Articles</a>
    </nav>

    <main>
        {{ $slot }}
    </main>
</body>
</html>
```

Utilise-le dans une page :

```blade
{{-- resources/views/articles/index.blade.php --}}
<x-layout>
    <x-slot:title>Mes articles</x-slot>

    <h1>Mes articles</h1>

    @foreach ($articles as $article)
        <p>{{ $article }}</p>
    @endforeach
</x-layout>
```

- `{{ $slot }}` affiche le contenu placé entre `<x-layout>` et `</x-layout>`.
- `<x-slot:title>` remplit un **slot nommé** : il devient la variable `$title` dans le composant.

### Un composant avec des props

Les **props** sont les données que tu passes au composant, comme des attributs HTML.

```blade
{{-- resources/views/components/alerte.blade.php --}}
@props(['type' => 'info'])

<div {{ $attributes->merge(['class' => 'alerte alerte-'.$type]) }}>
    {{ $slot }}
</div>
```

```blade
<x-alerte type="succes">Article enregistré.</x-alerte>
<x-alerte :type="$niveau" class="mb-4">Attention.</x-alerte>
```

- `@props` déclare les props et leurs valeurs par défaut.
- `:type="$niveau"` (avec deux-points) passe une **expression PHP**. Sans deux-points, c'est du texte.
- `$attributes` contient les autres attributs (ici `class="mb-4"`).

Un sous-dossier se note avec un point : `components/forms/input.blade.php` devient `<x-forms.input />`.

```bash
php artisan make:component forms.input --view
```

## L'ancien style : `@extends` et `@section`

Tu verras ce style dans les projets plus anciens. Il marche toujours.

```blade
{{-- resources/views/layouts/app.blade.php --}}
<html>
<head>
    <title>@yield('title', 'Mon blog')</title>
</head>
<body>
    @yield('content')
</body>
</html>
```

```blade
{{-- resources/views/articles/index.blade.php --}}
@extends('layouts.app')

@section('title', 'Mes articles')

@section('content')
    <h1>Mes articles</h1>
@endsection
```

`@yield` marque un emplacement. `@section` le remplit. `@extends` choisit le layout.

> [!NOTE]
> Les starter kits actuels utilisent des **composants** pour les layouts. Préfère `<x-layout>` dans un nouveau projet. Ne mélange pas les deux styles dans la même vue.

## Inclure une vue : `@include`

```blade
@include('partials.nav')
@include('articles._carte', ['article' => $article])
```

La vue incluse voit les variables de la vue parente. Tu peux en ajouter avec un tableau.
Pour un bloc avec des props et des slots, préfère un composant.

## Le CSS et le JS avec Vite

**Vite** compile les fichiers de `resources/css` et `resources/js`.
La directive `@vite` ajoute les bonnes balises `<link>` et `<script>`.

```blade
@vite(['resources/css/app.css', 'resources/js/app.js'])
```

```bash
npm run dev     # développement : recharge la page à chaque modification
npm run build   # production : fichiers compilés dans public/build/
```

La configuration est dans `vite.config.js`. Tailwind CSS 4 est déjà installé dans le squelette.
Pour une image placée dans `public/`, utilise `asset()` :

```blade
<img src="{{ asset('images/logo.png') }}" alt="Logo">
```

> [!NOTE]
> **Changé depuis Laravel 8** : Vite remplace Laravel Mix (`webpack.mix.js`, `mix()`) depuis Laravel 9.19.

## Pièges fréquents

- **`{!! !!}` avec du texte de visiteur** : faille XSS. Utilise `{{ }}`.
- **Directive non fermée** : un `@if` sans `@endif` donne une erreur de syntaxe peu claire.
- **Mauvais nom de composant** : `<x-layout>` cherche `resources/views/components/layout.blade.php`.
- **`Undefined variable $titre`** : la variable n'est pas passée par `view()`. Passe-la ou écris `{{ $titre ?? '' }}`.
- **Oublier les deux-points** : `<x-alerte type="$niveau">` passe le texte « $niveau », pas la variable.
- **« Vite manifest not found »** : lance `npm run build` ou `npm run dev`.
- **Requêtes dans la vue** : prépare les données dans le contrôleur, la vue ne fait qu'afficher.

## Résumé

- `view('articles.index', [...])` affiche `resources/views/articles/index.blade.php` avec des variables.
- `{{ }}` échappe le HTML ; `{!! !!}` ne l'échappe pas.
- `@if`, `@unless`, `@isset`, `@auth`, `@guest` pour les conditions ; `@foreach` et `@forelse` / `@empty` pour les boucles.
- Un fichier de `resources/views/components/` devient `<x-nom>` ; `{{ $slot }}` reçoit le contenu, `<x-slot:title>` un slot nommé.
- `@props` déclare les props ; `:prop="$variable"` passe une expression PHP.
- `@extends`, `@section` et `@yield` sont l'ancien style de layout.
- `@vite([...])` charge les assets compilés par Vite.

## Pour pratiquer

Fais le TP [Routes et vues Blade](#/laravel/tp/01-routes-blade) : routes nommées, contrôleur et layout en composant.
