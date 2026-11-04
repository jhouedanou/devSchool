# Découvrir Nuxt 4

## Objectifs

- Comprendre ce que Nuxt ajoute à Vue.
- Distinguer les modes de rendu : SSR, SSG, SPA et rendu hybride.
- Créer un projet avec `npm create nuxt@latest`.
- Te repérer dans la structure de Nuxt 4 (`app/`, `server/`, `shared/`, `public/`).
- Connaître les commandes `dev`, `build`, `generate` et `preview`.

## Nuxt, c'est quoi ?

Nuxt est un framework construit sur Vue. Vue gère l'interface. Nuxt ajoute tout le reste : le routage, le rendu côté serveur, une API serveur et une organisation des fichiers.

Avec Vue seul, tu choisis et branches chaque outil. Avec Nuxt, ces choix sont faits pour toi, et tu suis des conventions.

| Besoin | Vue + Vite | Nuxt |
|--------|------------|------|
| Routes | tu installes et configures Vue Router | un fichier dans `app/pages/` = une route |
| Imports | tu écris `import { ref } from 'vue'` | `ref`, tes composants et tes composables sont importés automatiquement |
| Rendu serveur | configuration manuelle et complexe | activé par défaut |
| API | un autre projet (Express…) | des fichiers dans `server/api/` |
| SEO | à la main | `useHead()`, `useSeoMeta()` |

## Les modes de rendu

Le **rendu** est l'étape qui transforme tes composants en HTML. Nuxt peut la faire à plusieurs endroits.

### SSR (rendu universel, par défaut)

Le serveur exécute ton code Vue et renvoie une page HTML complète. Ensuite, le navigateur **hydrate** la page. L'hydratation est l'étape où Vue reprend le HTML reçu et y branche la réactivité et les événements.

Avantages : la page s'affiche vite et les moteurs de recherche lisent le contenu.

### SSG (génération statique)

Les pages sont rendues **au moment du build**, une fois pour toutes. Tu obtiens des fichiers HTML que tu peux héberger n'importe où. C'est le rôle de `nuxt generate`.

### SPA (rendu côté client)

Avec `ssr: false`, le serveur envoie une page presque vide. Le navigateur télécharge le JavaScript et construit la page. C'est le fonctionnement d'une app Vue classique.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,
})
```

### Rendu hybride

Tu choisis un mode **par route** avec `routeRules`. Par exemple : l'accueil prérendu, le blog mis en cache, le tableau de bord en SPA.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },
    '/blog/**': { swr: 3600 },
    '/admin/**': { ssr: false },
  },
})
```

Tu verras ces règles en détail dans [la leçon sur le SEO et le rendu](#/nuxt/lecon/08-seo-rendu).

## Créer un projet

Il te faut Node.js 22 ou plus récent.

```bash
npm create nuxt@latest mon-app
cd mon-app
npm run dev -- -o
```

L'assistant te pose quelques questions (gestionnaire de paquets, dépôt git, modules). L'option `-o` ouvre le navigateur sur `http://localhost:3000`.

## La structure de Nuxt 4

```text
mon-app/
├─ app/                 ← le code de l'application Vue
│  ├─ assets/           ← CSS, images traitées par le build
│  ├─ components/       ← composants (auto-importés)
│  ├─ composables/      ← composables (auto-importés)
│  ├─ layouts/          ← mises en page
│  ├─ middleware/       ← middlewares de route
│  ├─ pages/            ← une page = une route
│  ├─ plugins/          ← plugins de l'app
│  ├─ utils/            ← fonctions utilitaires (auto-importées)
│  ├─ app.vue           ← composant racine
│  ├─ app.config.ts     ← configuration publique de l'app
│  └─ error.vue         ← page d'erreur
├─ server/              ← le code serveur (Nitro)
│  ├─ api/              ← routes /api/…
│  ├─ routes/           ← routes sans préfixe /api
│  ├─ middleware/       ← code exécuté à chaque requête
│  └─ utils/            ← helpers serveur (auto-importés)
├─ shared/              ← code commun à app/ et server/
│  ├─ utils/
│  └─ types/
├─ public/              ← fichiers servis tels quels (favicon.ico, robots.txt)
├─ nuxt.config.ts       ← configuration de Nuxt
├─ package.json
└─ tsconfig.json
```

Tu n'as pas besoin de tous ces dossiers au départ. Crée-les quand tu en as besoin.

- `app/` : tout ce qui tourne dans Vue (serveur **et** navigateur).
- `server/` : uniquement côté serveur. Ce code n'est jamais envoyé au navigateur.
- `shared/` : du code pur (types, fonctions de calcul) utilisable des deux côtés. Pas de code Vue ni Nitro dedans.
- `public/` : `public/logo.png` est servi à l'adresse `/logo.png`.

> [!NOTE]
> **Changement depuis Nuxt 3.** En Nuxt 4, le code Vue vit dans `app/` (avant, `pages/`, `components/`… étaient à la racine). L'alias `~` pointe maintenant vers `app/`, et `~~` vers la racine du projet. Nuxt 4 détecte encore l'ancienne structure : la migration n'est pas obligatoire.

> [!NOTE]
> **Changement depuis Nuxt 2.** Nuxt 2 utilisait Vue 2, webpack et l'Options API. Nuxt 3 et 4 utilisent Vue 3, Vite, la Composition API et le serveur Nitro. `asyncData` et `fetch()` des composants sont remplacés par `useFetch()` et `useAsyncData()`.

## app.vue et nuxt.config.ts

`app/app.vue` est le composant racine. Sans dossier `app/pages/`, c'est la seule page de l'app.

```vue
<!-- app/app.vue -->
<template>
  <h1>Bonjour Nuxt !</h1>
</template>
```

`nuxt.config.ts` contient la configuration. `defineNuxtConfig` est disponible sans import.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/image'],
  css: ['~/assets/css/main.css'],
})
```

- `compatibilityDate` fixe le comportement de Nitro et de certains modules. Garde la date créée par l'assistant.
- `devtools` active les Nuxt DevTools (un panneau d'inspection en bas de la page, en dev).
- `modules` ajoute des extensions (images, contenu, UI…).
- `css` charge des fichiers CSS globaux.

## Les commandes

Le `package.json` créé contient ces scripts :

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  }
}
```

| Commande | Rôle |
|----------|------|
| `nuxt dev` | serveur de développement avec rechargement à chaud |
| `nuxt build` | build de production avec serveur (dans `.output/`) |
| `nuxt generate` | build + prérendu de toutes les pages trouvées (site statique dans `.output/public/`) |
| `nuxt preview` | lance le résultat du build en local, pour vérifier |
| `nuxt prepare` | génère les types dans `.nuxt/` (lancé après `npm install`) |
| `nuxt module add <nom>` | installe un module et l'ajoute à `nuxt.config.ts` |

Lance-les avec `npm run dev`, `npm run build`… ou avec `npx nuxt <commande>`.

> [!TIP]
> Les dossiers `.nuxt/` (fichiers générés en dev) et `.output/` (résultat du build) ne se versionnent pas. Le `.gitignore` du projet les exclut déjà.

## Pièges fréquents

- **Code navigateur exécuté sur le serveur.** `window`, `document` ou `localStorage` n'existent pas pendant le rendu serveur. Utilise-les dans `onMounted()` ou dans `<ClientOnly>`.
- **Mélanger les deux structures.** Avec un dossier `app/`, Nuxt cherche les pages, composants et composables dans `app/`. Un `pages/` laissé à la racine n'est pas pris en compte. Range tout le code Vue dans `app/`.
- **Importer du code serveur dans l'app.** Le code de `server/` ne doit pas être importé dans `app/`, et inversement. Mets le code commun dans `shared/`.
- **Confondre `build` et `generate`.** `nuxt build` produit un serveur Node à lancer. `nuxt generate` produit des fichiers statiques.
- **Oublier `-- -o`.** Avec npm, les options de la commande passent après `--` : `npm run dev -- -o`.

## Résumé

- Nuxt = Vue + routage par fichiers + rendu serveur + API Nitro + auto-imports.
- Par défaut, Nuxt fait du SSR puis hydrate la page dans le navigateur.
- `nuxt generate` produit un site statique, `ssr: false` une SPA, `routeRules` un rendu par route.
- En Nuxt 4 : le code Vue va dans `app/`, le serveur dans `server/`, le code commun dans `shared/`, les fichiers bruts dans `public/`.
- `~` pointe vers `app/`, `~~` vers la racine.

## Pour pratiquer

Cette leçon n'a pas d'exercice dans le navigateur. Fais son quiz, puis installe le projet de TP et commence par [le TP « Pages et layout »](#/nuxt/tp/01-pages-layout) après [la leçon sur les pages](#/nuxt/lecon/02-pages-routage).
