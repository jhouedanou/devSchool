# Valider les données

## Objectifs

- Valider une requête avec `$request->validate()`.
- Choisir les règles courantes (`required`, `max`, `unique`, `exists`…).
- Afficher les erreurs et les anciennes valeurs dans Blade.
- Déplacer la validation dans une Form Request.
- Personnaliser les messages et comprendre la réponse 422 en JSON.

## Valider dans le contrôleur

Ne fais jamais confiance aux données envoyées. Valide-les avant de les enregistrer.

```php
use Illuminate\Http\Request;

public function store(Request $request)
{
    $validated = $request->validate([
        'title' => ['required', 'string', 'max:255'],
        'slug' => ['required', 'alpha_dash', 'unique:articles,slug'],
        'body' => ['required', 'string', 'min:10'],
        'category_id' => ['required', 'exists:categories,id'],
        'published_at' => ['nullable', 'date'],
    ]);

    Article::create($validated);

    return to_route('articles.index');
}
```

- **Si tout est valide** : `$validated` contient seulement les champs validés.
- **Si une règle échoue** pour un formulaire : Laravel redirige vers la page précédente avec les erreurs et les valeurs saisies.
- **Si une règle échoue** pour une requête JSON : Laravel répond **422** avec la liste des erreurs.

La syntaxe en chaîne marche aussi : `'title' => 'required|string|max:255'`.

## Les règles courantes

| Règle | Signification |
|-------|---------------|
| `required` | le champ doit être présent et non vide |
| `nullable` | le champ peut être vide (`null`) |
| `string`, `integer`, `numeric`, `boolean`, `array` | type attendu |
| `email`, `url`, `date` | format attendu |
| `min:3`, `max:255` | longueur (texte), valeur (nombre) ou taille en Ko (fichier) |
| `between:1,10` | entre deux bornes |
| `in:draft,published` | une valeur de la liste |
| `unique:articles,slug` | la valeur n'existe pas encore dans `articles.slug` |
| `exists:categories,id` | la valeur existe dans `categories.id` |
| `confirmed` | un champ `xxx_confirmation` identique existe (mot de passe) |
| `alpha_dash` | lettres, chiffres, `-` et `_` |
| `after:today`, `before:2030-01-01` | date après / avant |
| `image`, `mimes:jpg,png` | fichier image / extensions autorisées |
| `sometimes` | valider seulement si le champ est envoyé |
| `bail` | arrêter les règles du champ à la première erreur |

Pour les règles avec options, utilise la classe `Rule` :

```php
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

'status' => ['required', Rule::in(['draft', 'published'])],
'password' => ['required', 'confirmed', Password::min(8)],
```

## Afficher les erreurs dans Blade

La variable `$errors` existe dans **toutes** les vues web. Elle est vide s'il n'y a pas d'erreur.

```blade
@if ($errors->any())
    <div class="alerte">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif
```

Sous chaque champ, utilise `@error` :

```blade
<label for="title">Titre</label>
<input id="title" name="title" value="{{ old('title') }}"
       class="@error('title') invalide @enderror">

@error('title')
    <p class="erreur">{{ $message }}</p>
@enderror
```

- `@error('title')` s'affiche seulement si le champ `title` a une erreur. `$message` contient le premier message.
- `old('title')` remet la valeur saisie avant la redirection. L'utilisateur ne retape pas tout.
- Pour un formulaire de modification : `old('title', $article->title)`. La valeur de l'article sert si rien n'a été saisi.

Autres méthodes utiles : `$errors->has('title')`, `$errors->first('title')`.

## Les Form Requests

Une **Form Request** est une classe qui contient la validation (et l'autorisation) d'un formulaire.
Elle allège le contrôleur.

```bash
php artisan make:request StoreArticleRequest
```

Laravel crée `app/Http/Requests/StoreArticleRequest.php` :

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;   // false par défaut : erreur 403 !
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'alpha_dash', 'unique:articles,slug'],
            'body' => ['required', 'string', 'min:10'],
        ];
    }
}
```

Dans le contrôleur, remplace `Request` par ta classe :

```php
use App\Http\Requests\StoreArticleRequest;

public function store(StoreArticleRequest $request)
{
    Article::create($request->validated());

    return to_route('articles.index');
}
```

La validation se fait **avant** l'appel de `store()`. Si elle échoue, la méthode n'est jamais exécutée.
`$request->validated()` renvoie seulement les champs validés.

### Ignorer l'article courant pour `unique`

À la modification, le slug existe déjà : c'est celui de l'article lui-même. Ignore-le :

```php
// app/Http/Requests/UpdateArticleRequest.php
use Illuminate\Validation\Rule;

public function rules(): array
{
    return [
        'title' => ['required', 'string', 'max:255'],
        'slug' => [
            'required',
            'alpha_dash',
            Rule::unique('articles', 'slug')->ignore($this->route('article')),
        ],
        'body' => ['required', 'string', 'min:10'],
    ];
}
```

`$this->route('article')` renvoie l'article de l'URL `/articles/{article}`.

## Des messages personnalisés

Les messages par défaut sont en anglais. Tu peux les remplacer champ par champ.

Dans une Form Request :

```php
public function messages(): array
{
    return [
        'title.required' => 'Le titre est obligatoire.',
        'title.max' => 'Le titre fait au plus :max caractères.',
        'slug.unique' => 'Ce slug est déjà utilisé.',
    ];
}

public function attributes(): array
{
    return [
        'body' => 'contenu',   // « The contenu field is required. »
    ];
}
```

Avec `validate()`, passe les messages en deuxième argument :

```php
$request->validate(
    ['title' => ['required', 'max:255']],
    ['title.required' => 'Le titre est obligatoire.'],
);
```

> [!TIP]
> Pour traduire tous les messages, lance `php artisan lang:publish`. Laravel crée le dossier `lang/` avec `lang/en/validation.php`. Ajoute ensuite `lang/fr/validation.php` et mets `APP_LOCALE=fr` dans `.env`.

## La réponse 422 en JSON

Si la requête attend du JSON (en-tête `Accept: application/json`), Laravel ne redirige pas.
Il répond avec le code **422 Unprocessable Content** :

```json
{
    "message": "The title field is required. (and 1 more error)",
    "errors": {
        "title": ["The title field is required."],
        "body": ["The body field is required."]
    }
}
```

Essaie avec `curl` :

```bash
curl -X POST http://localhost:8000/api/articles \
  -H "Accept: application/json" \
  -d "title="
```

Ton front (Vue, React…) lit `errors.title[0]` pour afficher le message sous le champ.

## Pièges fréquents

- **Erreur 403 avec une Form Request** : `authorize()` renvoie `false` par défaut. Mets `true` ou une vraie règle.
- **Champ optionnel refusé** : Laravel convertit les champs vides en `null`. Sans `nullable`, la règle `date` ou `string` échoue.
- **`unique` à la modification** : sans `->ignore(...)`, l'article est en conflit avec lui-même.
- **`$request->all()` au lieu de `validated()`** : des champs non validés passent dans `create()`.
- **Nom de champ différent** : la règle `title` ne valide rien si l'input s'appelle `titre`.
- **`confirmed` sans le bon champ** : il faut un input `password_confirmation`.
- **Une redirection 302 au lieu d'un 422** : la requête n'a pas l'en-tête `Accept: application/json`.

## Résumé

- `$request->validate([...])` valide et renvoie les champs validés.
- En cas d'erreur : redirection avec erreurs pour un formulaire, réponse 422 pour du JSON.
- Règles courantes : `required`, `nullable`, `string`, `max`, `email`, `unique`, `exists`, `confirmed`, `in`.
- Dans Blade : `$errors`, `@error('champ')` / `$message`, et `old('champ')` pour garder la saisie.
- `php artisan make:request` crée une Form Request avec `authorize()` et `rules()`.
- `messages()` et `attributes()` personnalisent les messages.
- `Rule::unique(...)->ignore(...)` évite le conflit à la modification.

## Pour pratiquer

Fais le TP [CRUD des articles avec validation](#/laravel/tp/03-crud-articles) après la leçon sur [le CRUD complet](#/laravel/lecon/07-crud).
