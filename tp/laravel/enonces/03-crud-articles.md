# CRUD des articles avec validation

## Objectif

Tu crées l'espace d'administration des articles sous `/admin/articles`.
On peut y lister, créer, modifier et supprimer les articles.
Les données passent par une Form Request qui valide le formulaire et génère le slug.

## Ce que tu vas pratiquer

- `Route::resource()` et un contrôleur ressource ;
- les groupes de routes avec `prefix()` et `name()` ;
- une Form Request : `rules()`, `messages()`, `prepareForValidation()` ;
- l'affichage des erreurs avec `@error` et `old()` ;
- les méthodes HTTP `PUT` et `DELETE` avec `@method` et `@csrf` ;
- les redirections et les messages flash.

Leçons utiles : [la validation](#/laravel/lecon/06-validation) et [le CRUD](#/laravel/lecon/07-crud).

## Fichiers à créer ou modifier

- `app/Http/Controllers/Admin/ArticleController.php` (à créer)
- `app/Http/Requests/ArticleRequest.php` (à créer)
- `resources/views/admin/articles/index.blade.php` (à créer)
- `resources/views/admin/articles/create.blade.php` et `edit.blade.php` (à créer)
- `resources/views/admin/articles/_champs.blade.php` (à créer : champs communs aux deux formulaires)
- `resources/views/components/layout.blade.php` (message flash, lien « Admin »)
- `routes/web.php` (à modifier)

Commandes conseillées :

```bash
php artisan make:controller Admin/ArticleController --resource --model=Article
php artisan make:request ArticleRequest
```

## Étapes

1. Dans `routes/web.php`, crée un groupe `Route::prefix('admin')->name('admin.')`. À l'intérieur : `Route::resource('articles', …)->except('show')`.
2. Vérifie avec `php artisan route:list --name=admin` : tu dois voir `admin.articles.index`, `create`, `store`, `edit`, `update` et `destroy`.
3. Dans `ArticleRequest`, `authorize()` renvoie `true`.
4. Dans `prepareForValidation()`, ajoute deux valeurs avec `$this->merge([...])` :
   - `slug` : `Str::slug()` du titre ;
   - `publie` : `$this->boolean('publie')` (une case non cochée n'est pas envoyée).
5. Écris les règles :

   | Champ | Règles |
   |-------|--------|
   | `titre` | `required`, `string`, `min:3`, `max:120` |
   | `contenu` | `required`, `string`, `min:10` |
   | `publie` | `boolean` |
   | `slug` | `required_with:titre`, unique dans `articles` (ignore l'article en cours de modification) |

   Pour le slug : `Rule::unique('articles', 'slug')->ignore($this->route('article'))`.
6. Dans `messages()`, écris ces messages exacts :

   | Clé | Message |
   |-----|---------|
   | `titre.required` | `Le titre est obligatoire.` |
   | `titre.min` | `Le titre doit contenir au moins 3 caractères.` |
   | `titre.max` | `Le titre ne doit pas dépasser 120 caractères.` |
   | `contenu.required` | `Le contenu est obligatoire.` |
   | `contenu.min` | `Le contenu doit contenir au moins 10 caractères.` |
   | `slug.unique` | `Un article avec ce titre existe déjà.` |

7. Dans le contrôleur, `store()` et `update()` reçoivent `ArticleRequest $request` et utilisent `$request->validated()`.
8. Après chaque action, redirige vers `route('admin.articles.index')` avec un message flash dans la clé `succes` :

   | Action | Message |
   |--------|---------|
   | création | `Article créé.` |
   | modification | `Article modifié.` |
   | suppression | `Article supprimé.` |

   Exemple : `return to_route('admin.articles.index')->with('succes', 'Article créé.');`
9. Dans le layout, affiche le message s'il existe : `@if (session('succes')) … @endif`.
10. La liste admin affiche **tous** les articles, brouillons compris, avec un lien « Modifier » et un bouton « Supprimer ». Le bouton est dans un petit formulaire avec `@csrf` et `@method('DELETE')`.
11. Dans `_champs.blade.php`, mets les champs `titre` (input texte), `contenu` (textarea) et `publie` (case à cocher, `value="1"`). Remplis-les avec `old('titre', $article->titre ?? '')`. Sous le titre, affiche `@error('titre')` et `@error('slug')`. Sous le contenu, `@error('contenu')`.
12. `create.blade.php` envoie le formulaire en `POST` vers `route('admin.articles.store')`. `edit.blade.php` l'envoie vers `route('admin.articles.update', $article)` avec `@method('PUT')`. Les deux incluent `@include('admin.articles._champs')`.

> [!IMPORTANT]
> Sans `->ignore(...)`, modifier un article sans changer son titre déclencherait l'erreur « Un article avec ce titre existe déjà. ».

> [!NOTE]
> L'admin n'est pas protégée pour l'instant. La connexion arrive au TP 06.

## Lancer les tests

Depuis le dossier `tp/laravel` :

```bash
php artisan test --filter=Tp03
```

## Critères de réussite

- `/admin/articles` liste tous les articles, publiés et brouillons.
- `/admin/articles/create` affiche un formulaire vers `route('admin.articles.store')` avec les champs `titre`, `contenu` et `publie`.
- Créer un article génère le slug (`Mon premier article` → `mon-premier-article`), redirige vers `/admin/articles` et affiche `Article créé.`
- Un titre et un contenu vides donnent les erreurs `Le titre est obligatoire.` et `Le contenu est obligatoire.`, avec retour au formulaire.
- Un titre de 2 caractères ou de 121 caractères est refusé ; 120 caractères est accepté.
- Un contenu de 10 caractères est accepté ; un contenu plus court est refusé.
- Après une erreur, le formulaire affiche les messages et garde les valeurs saisies.
- Un deuxième article avec le même titre donne l'erreur `Un article avec ce titre existe déjà.` (clé `slug`).
- Modifier un article met à jour titre, slug et statut, puis affiche `Article modifié.` Garder le même titre est permis.
- Supprimer un article l'efface de la base et affiche `Article supprimé.`

## Pour aller plus loin

- Ajoute la page `show` de la ressource et retire `->except('show')`.
- Pagine la liste admin avec `->paginate(10)`.
- Au lieu d'une erreur, génère un slug différent (`mon-titre-2`) quand le titre existe déjà.
- Remplace `_champs.blade.php` par un composant `<x-champ-texte name="titre" label="Titre" />`.
