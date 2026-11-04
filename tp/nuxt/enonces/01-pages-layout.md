# Pages et layout

## Objectif

Créer les trois premières pages de l'application et un layout commun avec une navigation.
À la fin, chaque page s'affiche dans le même cadre : un en-tête avec des liens, puis le contenu de la page.

## Ce que tu vas pratiquer

- le routage par fichiers du dossier `app/pages/` ;
- un layout `default.vue` avec `<slot />` ;
- la navigation avec `<NuxtLink>` ;
- `app.vue` avec `<NuxtLayout>` et `<NuxtPage />`.

Revois si besoin [la leçon sur les pages et le routage](#/nuxt/lecon/02-pages-routage).

## Fichiers à créer ou modifier

- `app/app.vue` (à modifier)
- `app/pages/index.vue`
- `app/pages/a-propos.vue`
- `app/pages/contact.vue`
- `app/layouts/default.vue`

## Étapes

1. Crée `app/pages/index.vue`. Mets un `<h1>Accueil</h1>` et une phrase de bienvenue.
2. Crée `app/pages/a-propos.vue` avec `<h1>À propos</h1>`.
3. Crée `app/pages/contact.vue` avec `<h1>Contact</h1>`.
4. Crée `app/layouts/default.vue` avec cette structure :

   ```vue
   <template>
     <div>
       <header>
         <nav>
           <!-- trois <NuxtLink> : vers /, /a-propos et /contact -->
         </nav>
       </header>
       <main>
         <slot />
       </main>
     </div>
   </template>
   ```

5. Dans le `<nav>`, ajoute trois `<NuxtLink>` : « Accueil » vers `/`, « À propos » vers `/a-propos`, « Contact » vers `/contact`.
6. Remplace le contenu de `app/app.vue` par `<NuxtLayout>` qui contient `<NuxtPage />`.
7. Lance `npm run dev` et clique sur les liens. Le layout reste en place, seule la page change.

> [!NOTE]
> Le nom du fichier donne l'adresse de la page : `a-propos.vue` répond sur `/a-propos`. `index.vue` répond sur `/`.

## Lancer les tests

Depuis le dossier `tp/nuxt` :

```bash
npm test -- 01-pages-layout
```

## Critères de réussite

- La page `app/pages/index.vue` affiche le titre « Accueil ».
- La page `/a-propos` affiche le titre « À propos ».
- La page `/contact` affiche le titre « Contact ».
- Le layout `default.vue` a un `<nav>` avec des liens vers `/`, `/a-propos` et `/contact`.
- Ces liens sont des `<NuxtLink>` (au moins trois).
- Le layout affiche le contenu de la page dans `<main>`, grâce à `<slot />`.
- `app.vue` affiche la page demandée (ex. `/a-propos`) à l'intérieur du layout.

## Pour aller plus loin

- Ajoute un pied de page (`<footer>`) dans le layout.
- Crée un second layout `app/layouts/simple.vue` sans navigation, et utilise-le sur la page contact avec `definePageMeta({ layout: 'simple' })`.
- Change le titre de l'onglet sur chaque page avec `useHead({ title: '…' })`.
