# Démarrer avec Vue 3

## Objectifs

- Créer un projet Vue avec `npm create vue@latest`.
- Comprendre la structure d'un projet Vite.
- Lire un fichier `.vue` (SFC) écrit avec `<script setup>`.
- Afficher des données avec l'interpolation `{{ }}`.
- Installer et ouvrir les Vue DevTools.

## Ce qui a changé depuis Vue 2

> [!NOTE]
> Si tu as connu Vue 2, retiens ces changements :
> - **Vite** remplace Vue CLI (webpack). Le serveur démarre presque tout de suite.
> - La **Composition API** et `<script setup>` remplacent l'objet `data` / `methods` / `computed`.
> - `createApp(App).mount('#app')` remplace `new Vue({ render: h => h(App) }).$mount('#app')`.
> - Un composant peut avoir **plusieurs éléments racines** dans son template.
> - Vue 2 n'est plus maintenu depuis le 31 décembre 2023.

## Créer un projet

Il te faut Node.js 22 ou plus récent. Lance :

```bash
npm create vue@latest
```

L'outil `create-vue` te pose des questions :

1. le nom du projet ;
2. une liste de fonctionnalités à cocher : TypeScript, JSX, Router, Pinia, Vitest, tests de bout en bout, linter, Prettier.

Pour débuter, tu peux ne rien cocher. Tu pourras ajouter Router ou Pinia plus tard avec `npm install`.

Ensuite :

```bash
cd mon-projet
npm install
npm run dev
```

Le site tourne sur `http://localhost:5173`. Quand tu enregistres un fichier, la page se met à jour sans rechargement. C'est le **HMR** (Hot Module Replacement : remplacement à chaud).

## La structure du projet

```
mon-projet/
├── index.html        ← la seule page HTML, avec <div id="app">
├── package.json      ← dépendances et scripts
├── vite.config.js    ← configuration de Vite
├── public/           ← fichiers copiés tels quels (favicon…)
└── src/
    ├── main.js       ← point d'entrée : crée l'application
    ├── App.vue       ← composant racine
    ├── assets/       ← CSS et images importés par le code
    └── components/   ← tes composants
```

Les scripts de `package.json` :

| Commande | Rôle |
|----------|------|
| `npm run dev` | serveur de développement |
| `npm run build` | version optimisée dans `dist/` |
| `npm run preview` | sert le dossier `dist/` en local pour le tester |

Le fichier `vite.config.js` active le plugin Vue et un alias :

```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

> [!TIP]
> L'alias `@` pointe vers `src/`. Écris `import Bouton from '@/components/Bouton.vue'` au lieu de `'../../components/Bouton.vue'`.

## Le point d'entrée : main.js

```js
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
```

- `createApp(App)` crée une application à partir du composant racine.
- `.mount('#app')` l'affiche dans `<div id="app">` de `index.html`.

Les plugins (Vue Router, Pinia) s'installent avec `app.use()`, **avant** `mount()` :

```js
const app = createApp(App)
app.use(router)
app.mount('#app')
```

## Le fichier .vue (SFC)

Un SFC (Single-File Component : composant en un seul fichier) regroupe trois blocs : la logique, le HTML et le CSS.

```vue
<script setup>
import { ref } from 'vue'

const prenom = 'Ada'
const clics = ref(0)
</script>

<template>
  <h1>Bonjour {{ prenom }} !</h1>
  <button @click="clics++">Cliqué {{ clics }} fois</button>
</template>

<style scoped>
h1 {
  color: #42b883;
}
</style>
```

- `<script setup>` : le JavaScript du composant. Tout ce que tu déclares au premier niveau (variables, fonctions, imports) est utilisable dans le template.
- `<template>` : le HTML du composant.
- `<style scoped>` : le CSS. Avec `scoped`, ce CSS ne s'applique qu'à ce composant.

`ref(0)` crée une valeur **réactive** : quand elle change, l'écran se met à jour. C'est le sujet de la leçon suivante.

### Pourquoi `<script setup>` ?

C'est la façon recommandée d'écrire un composant. Pas de `export default`, pas de `return` : il y a moins de code à écrire.

Dans du code ancien, tu verras l'**Options API**. Elle marche toujours, mais on ne l'utilise pas dans ce parcours :

```vue
<script>
export default {
  data() {
    return { clics: 0 }
  },
  methods: {
    ajouter() {
      this.clics++
    },
  },
}
</script>
```

> [!NOTE]
> Repère l'Options API à son `export default { data(), methods, computed }` et à `this`. Avec `<script setup>`, il n'y a jamais de `this`.

## L'interpolation `{{ }}`

Les doubles accolades affichent une valeur sous forme de texte. Tu peux y écrire une **expression** JavaScript, c'est-à-dire du code qui produit une valeur.

```vue
<script setup>
const produit = { nom: 'Clavier', prix: 49.9 }
const stock = 3
</script>

<template>
  <p>{{ produit.nom.toUpperCase() }}</p>
  <p>{{ produit.prix.toFixed(2) }} €</p>
  <p>{{ stock > 0 ? 'En stock' : 'Épuisé' }}</p>
</template>
```

Une instruction (`if`, `for`, `const x = 1`) ne marche pas entre accolades. Pour afficher sous condition ou répéter un élément, on utilise les directives (leçon 3).

> [!WARNING]
> `{{ }}` échappe le HTML. `{{ '<b>gras</b>' }}` affiche les balises comme du texte. C'est voulu : cela protège contre les failles XSS.

## Utiliser un composant enfant

```vue
<script setup>
import CarteProfil from './components/CarteProfil.vue'
</script>

<template>
  <CarteProfil />
  <CarteProfil />
</template>
```

Avec `<script setup>`, un composant importé est utilisable tout de suite dans le template. Plus besoin de l'option `components: { ... }`.

## Les Vue DevTools

Les Vue DevTools affichent l'arbre des composants, leurs props, leur état et les événements émis. Tu peux aussi modifier une valeur à la main pour tester l'affichage.

Deux façons de les utiliser :

1. **Le plugin Vite** `vite-plugin-vue-devtools`. `create-vue` l'ajoute déjà dans `vite.config.js`. Lance `npm run dev` : un bouton en bas de la page ouvre le panneau.
2. **L'extension de navigateur** « Vue.js devtools » (Chrome, Edge, Firefox). Elle ajoute un onglet « Vue » dans les outils de développement (F12).

> [!TIP]
> Les DevTools ne marchent qu'en développement (`npm run dev`). Une application construite avec `npm run build` ne les active pas.

## Pièges fréquents

- **Oublier `setup`** : avec `<script>` seul, les variables ne sont pas accessibles dans le template.
- **Mettre une instruction dans `{{ }}`** : `{{ if (ok) ... }}` ne compile pas. Utilise une expression (`ok ? 'oui' : 'non'`).
- **Ouvrir `index.html` directement** dans le navigateur : la page reste blanche. Passe toujours par `npm run dev`.
- **Appeler `app.use()` après `mount()`** : le plugin n'est pas pris en compte. Installe les plugins avant.
- **Modifier `dist/`** : ce dossier est recréé à chaque `npm run build`. Modifie `src/`.
- **Changer une variable normale** : `let n = 0` puis `n++` ne met pas l'écran à jour. Il faut `ref()`.

## Résumé

- `npm create vue@latest` crée un projet Vite + Vue. `npm run dev` le lance sur le port 5173.
- `main.js` crée l'application : `createApp(App).mount('#app')`. Les plugins passent par `app.use()` avant `mount`.
- Un fichier `.vue` contient `<script setup>`, `<template>` et `<style scoped>`.
- Dans `<script setup>`, tout ce qui est déclaré au premier niveau est disponible dans le template.
- `{{ expression }}` affiche une valeur sous forme de texte (HTML échappé).
- Les Vue DevTools (plugin Vite ou extension) montrent les composants et leur état.

## Pour pratiquer

Fais l'exercice [Bonjour Vue](#/vue/exercice/01-bonjour) : tu affiches des données avec `{{ }}`. Le premier TP, [Compteur borné](#/vue/tp/01-compteur), viendra juste après la [leçon sur la réactivité](#/vue/lecon/02-reactivite).
