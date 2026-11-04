# Format du contenu devSchool

Ce document explique comment écrire le contenu du site : leçons, quiz, exercices dans le navigateur et TP.
Le site est **statique** (pas de build). Il lit les fichiers ci-dessous avec `import()` et `fetch()`.

## 1. Arborescence

```
content/
  catalogue.js                  ← ordre des parcours : ['vue', 'nuxt', 'react', 'laravel']
  <parcours>/
    index.js                    ← description du parcours (leçons + TP)
    lecons/<id-lecon>.md        ← texte de la leçon (Markdown)
    quiz/<id-lecon>.js          ← quiz de la leçon (même id que la leçon)
    exercices/<id-exercice>.js  ← exercices de code exécutés dans le navigateur
tp/
  <parcours>/
    README.md                   ← installation du projet de TP
    enonces/<id-tp>.md          ← énoncé de chaque TP (affiché sur le site)
    …                           ← projet réel (Vite, Nuxt, Laravel) + tests + solutions
```

Vérifications :

```bash
node scripts/verifier-contenu.mjs vue        # structure (rapide, sans navigateur)
node scripts/verifier-exercices.mjs vue      # exécute chaque exercice dans Chromium
node scripts/verifier-exercices.mjs vue --exercice=02-compteur
```

## 2. `content/<parcours>/index.js`

```js
export default {
  id: 'vue',
  titre: 'Vue.js',
  version: 'Vue 3.5',
  couleur: '#42b883',            // couleur du parcours
  description: 'Une phrase courte.',
  objectifs: ['Créer des composants…', '…'],   // « À la fin, tu sauras… »
  lecons: [
    {
      id: '01-demarrer',          // = nom des fichiers lecons/01-demarrer.md et quiz/01-demarrer.js
      titre: 'Démarrer avec Vue',
      duree: 20,                  // minutes
      resume: 'Une phrase.',
      exercices: ['01-bonjour'],  // ids dans exercices/ (peut être vide)
      tps: ['01-compteur'],       // TP conseillés après la leçon (facultatif)
    },
  ],
  tps: [
    { id: '01-compteur', titre: 'Compteur borné', duree: 30, niveau: 1, resume: 'Une phrase.' },
  ],
};
```

`niveau` : 1 = facile, 2 = moyen, 3 = avancé.

## 3. Leçons (`lecons/<id>.md`)

- Commence par `# Titre de la leçon`.
- **Français facile** : phrases courtes, explications brèves et précises. Tutoiement.
- Structure conseillée :
  1. `## Objectifs` (3 à 5 puces)
  2. Sections `##` / `###` avec explication courte + exemple de code
  3. `## Pièges fréquents`
  4. `## Résumé` (puces)
- Blocs de code avec langage : `js`, `ts`, `vue`, `jsx`, `tsx`, `html`, `css`, `php`, `blade`, `bash`, `json`.
- Encadrés (style GitHub) :

```md
> [!TIP]
> Astuce utile.

> [!NOTE]
> Information.

> [!WARNING]
> Piège à éviter.

> [!IMPORTANT]
> Point essentiel.
```

- Liens internes : `[l'exercice](#/vue/exercice/01-bonjour)`, `[le TP](#/vue/tp/01-compteur)`, `[la leçon](#/vue/lecon/02-reactivite)`.
- Tableaux Markdown acceptés.

## 4. Quiz (`quiz/<id-lecon>.js`)

Au moins 4 questions (idéalement 6 à 10). Trois types :

```js
export default [
  {
    type: 'unique',                       // une seule bonne réponse
    question: 'Quelle fonction crée une valeur réactive ?',
    code: 'const n = ???(0)',             // facultatif : extrait affiché sous la question
    langage: 'js',                        // facultatif : coloration du code
    choix: ['reactive()', 'ref()', 'watch()'],
    reponse: 1,                           // index (à partir de 0)
    explication: 'ref() enveloppe une valeur…',
  },
  {
    type: 'multiple',                     // plusieurs bonnes réponses
    question: 'Lesquelles sont des directives ?',
    choix: ['v-if', 'v-loop', 'v-for', 'v-model'],
    reponses: [0, 2, 3],
    explication: '…',
  },
  {
    type: 'texte',                        // réponse à taper (code à trous)
    question: 'Complète la route.',
    code: "Route::____('/articles', [ArticleController::class, 'index']);",
    langage: 'php',
    acceptees: ['get'],                   // comparaison sans majuscules ni espaces en trop
    explication: '…',
  },
];
```

Règles : `explication` obligatoire. Les choix sont mélangés à l'affichage, donc **pas** de « toutes les réponses ci-dessus ».
Le quiz est réussi à 70 %. L'examen final du parcours tire 20 questions au hasard dans tous les quiz.

## 5. Exercices dans le navigateur (`exercices/<id>.js`)

L'élève écrit du code dans un éditeur ; les tests tournent dans une iframe isolée (`app/runner/`).

```js
export default {
  id: '02-compteur',                     // = nom du fichier
  titre: 'Un compteur réactif',
  type: 'vue',                           // 'js' | 'vue' | 'nuxt' | 'react'
  consigne: `Markdown : ce qu'il faut faire, en étapes courtes.`,
  depart: `…code de départ…`,            // doit compiler et faire échouer au moins un test
  solution: `…solution…`,                // doit passer tous les tests
  indices: ['Premier indice', 'Deuxième indice'],
  apercuFetch: { '/api/users': [{ id: 1, nom: 'Ada' }] }, // facultatif : réponses de fetch dans l'aperçu
  tests: [
    {
      nom: 'Affiche 0 au départ',
      aide: 'Facultatif : conseil affiché si le test échoue.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.find('.valeur').text()).toBe('0');
      },
    },
  ],
};
```

### Code de l'élève selon le type

| type    | L'élève écrit | Bibliothèques |
|---------|---------------|---------------|
| `js`    | un module JS : `export function …` | aucune |
| `vue`   | un fichier `.vue` complet (`<script setup>`, `<template>`, `<style scoped>`) ; `import { ref } from 'vue'` | Vue 3.5 (pas de Pinia ni Router) |
| `nuxt`  | un fichier `.vue` façon Nuxt : **auto-imports** (`ref`, `computed`, `useState`, `useFetch`, `useAsyncData`, `$fetch`, `useRoute`, `navigateTo`, `useHead`, `useSeoMeta`, `createError`…) sans import, aussi dans le template (`$route`, `navigateTo`), `<NuxtLink>` disponible, `lang="ts"` accepté, `await useFetch()` en haut du script accepté ; `query` accepte des refs, `pick` et `transform` marchent | Vue 3.5 + simulation de Nuxt (pas de serveur, pas de plugins) |
| `react` | un module JSX : `import { useState } from 'react'` + `export default function App() {}` | **React 18.3** (pas de `use`, `useActionState`, `useOptimistic` : garde ces sujets pour les TP locaux en React 19) |

### Règles importantes pour les tests

- `run` est **sérialisé** avec `toString()` puis rejoué dans l'iframe : il ne doit utiliser **aucune variable extérieure**. Tout passe par `t`.
- Écris toujours `run: async (t) => { … }`.
- Dans `depart` et `solution` (chaînes entre backticks), échappe `` \` `` et `\${`.
- Chaque test tourne sur un module **neuf** (code de l'élève ré-exécuté, composant remonté).
- Délai max : 4 s par test.

### API `t` disponible dans les tests

| API | Rôle |
|-----|------|
| `t.module` | exports du code de l'élève (`t.module.somme(1, 2)`, `t.module.default`) |
| `await t.mount(props?, { slots? })` | monte le composant par défaut (Vue/Nuxt/React). Retourne une enveloppe `w` |
| `t.expect(x)` | `toBe`, `toEqual`, `toContain`, `toMatch`, `toHaveLength`, `toBeTruthy`, `toBeFalsy`, `toBeNull`, `toBeUndefined`, `toBeDefined`, `toBeGreaterThan(OrEqual)`, `toBeLessThan(OrEqual)`, `toBeCloseTo`, `toBeInstanceOf`, `toBeTypeOf`, `toThrow`, `toHaveBeenCalled`, `toHaveBeenCalledTimes`, `toHaveBeenCalledWith`, et `.not` |
| `t.fn(impl?)` | fonction espion (comme `vi.fn()`), `f.mock.calls` |
| `await t.tick()` | attend la mise à jour du DOM |
| `await t.pause(ms)` | attend `ms` millisecondes (le rendu est mis à jour) |
| `await t.wait(() => { … })` | réessaie la fonction jusqu'à ce qu'elle ne lève plus d'erreur (1,5 s max) |
| `t.mockFetch(gestionnaire)` | remplace `fetch`. Objet `{ '/api/users': [...] }` (correspondance par sous-chaîne) ou fonction `(url, init) => données`. Retourne la liste des appels `[{ url, method, body, json }]` |
| `t.reponse(corps, statut)` | crée une `Response` (pour simuler une erreur 404/500) |
| `t.logs` | textes affichés avec `console.log` pendant le test |
| `t.nuxt` | (type `nuxt`) `t.nuxt.route` (à remplir AVANT `mount` : `t.nuxt.route.params.id = '3'`), `t.nuxt.navigations` (chemins passés à `navigateTo`), `t.nuxt.etats` (refs de `useState`), `t.nuxt.head.title` |
| `t.document`, `t.window` | DOM de l'iframe |

Enveloppe `w` (retour de `mount`) et éléments (`w.find(...)`) :

| Méthode | Rôle |
|---------|------|
| `w.find(sel)` | premier élément (ne lève pas d'erreur s'il manque : `exists()` → `false`) |
| `w.get(sel)` | comme `find` mais lève une erreur claire s'il manque |
| `w.findAll(sel)` | tableau d'éléments |
| `w.findByText('Ajouter', 'button')` | élément le plus profond qui contient ce texte |
| `.exists()`, `.text()` (espaces normalisés), `.html()`, `.attributes(nom?)`, `.classes(nom?)`, `.value`, `.checked`, `.disabled`, `.isVisible()` | lecture |
| `await .click()`, `await .setValue(v)`, `await .trigger('keyup', { key: 'Enter' })`, `await .submit()` | actions (le rendu est mis à jour après) |
| `await w.setProps({ … })`, `await w.unmount()` | composant monté |

Pour tester un événement émis (Vue) ou un callback (React) : passe un espion en prop.

```js
run: async (t) => {
  const onAjout = t.fn();
  const w = await t.mount({ onAjout });          // Vue : écoute l'événement « ajout »
  await w.find('input').setValue('Lait');
  await w.find('form').submit();
  t.expect(onAjout).toHaveBeenCalledWith('Lait');
},
```

Pour un test asynchrone (fetch) :

```js
run: async (t) => {
  t.mockFetch({ '/api/users': [{ id: 1, nom: 'Ada' }] });
  const w = await t.mount();
  await t.wait(() => t.expect(w.findAll('li')).toHaveLength(1));
},
```

## 6. Travaux pratiques (`tp/<parcours>/`)

Chaque parcours a **un seul projet** de TP, avec de vrais outils :

| Parcours | Projet | Tests |
|----------|--------|-------|
| `tp/vue` | Vite + Vue 3 | Vitest + Vue Test Utils |
| `tp/react` | Vite + React 19 | Vitest + Testing Library |
| `tp/nuxt` | Nuxt 4 | Vitest + @nuxt/test-utils |
| `tp/laravel` | Laravel (squelette complet, sans `vendor/`) | PHPUnit (`php artisan test`) |

Chaque TP a :

- un énoncé `tp/<parcours>/enonces/<id>.md` (commence par `# Titre`, puis : Objectif, Ce que tu vas pratiquer, Fichiers à modifier, Étapes, Lancer les tests, Pour aller plus loin) ;
- des tests automatiques ;
- une solution dans `tp/<parcours>/solutions/<id>/` ;
- une commande pour vérifier que **toutes les solutions passent** les tests.

Dans les énoncés, les chemins sont relatifs au dossier du projet (`tp/vue/`).
