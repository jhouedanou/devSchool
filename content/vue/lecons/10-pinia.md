# Pinia

## Objectifs

- Comprendre à quoi sert un store.
- Installer Pinia et créer un store avec `defineStore`.
- Écrire un setup store : state, getters et actions.
- Reconnaître un option store.
- Utiliser un store dans un composant et le déstructurer avec `storeToRefs`.

## Pourquoi un store ?

Les props et les événements suffisent entre un parent et son enfant. Mais certaines données servent **partout** : le panier, l'utilisateur connecté, les préférences. Les passer de composant en composant devient vite compliqué.

Un **store** est un état partagé, rangé en dehors des composants. Tous les composants peuvent le lire et le modifier. **Pinia** est la bibliothèque officielle pour cela.

> [!NOTE]
> Pinia remplace **Vuex**. Les différences principales : plus de `mutations` (les actions modifient l'état directement), plus de modules imbriqués ni de `namespaced` (tu crées plusieurs stores), et une API proche de la Composition API.

## Installation

Coche « Pinia » dans `npm create vue@latest`, ou dans un projet existant :

```bash
npm install pinia
```

```js
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
```

## Créer un setup store (recommandé)

`defineStore()` prend un **identifiant unique** et une fonction. Cette fonction ressemble à `<script setup>` :

- une `ref` devient une propriété du **state** (l'état) ;
- un `computed` devient un **getter** (une valeur calculée) ;
- une `function` devient une **action** (une opération).

```js
// src/stores/panier.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const usePanierStore = defineStore('panier', () => {
  // state
  const articles = ref([])

  // getters
  const nombre = computed(() => articles.value.reduce((n, a) => n + a.quantite, 0))
  const total = computed(() =>
    articles.value.reduce((somme, a) => somme + a.prix * a.quantite, 0),
  )

  // actions
  function ajouter(produit) {
    const existant = articles.value.find((a) => a.id === produit.id)
    if (existant) existant.quantite++
    else articles.value.push({ ...produit, quantite: 1 })
  }

  function retirer(id) {
    articles.value = articles.value.filter((a) => a.id !== id)
  }

  function vider() {
    articles.value = []
  }

  return { articles, nombre, total, ajouter, retirer, vider }
})
```

> [!IMPORTANT]
> Retourne **toutes** les propriétés du state. Une ref non retournée n'est pas vue par Pinia : elle échappe aux DevTools, au rendu serveur et aux plugins.

Convention de nommage : `useXxxStore` pour la fonction, un fichier par store dans `src/stores/`.

## Reconnaître un option store

Pinia accepte aussi un objet `{ state, getters, actions }`, proche de l'Options API et de Vuex. Tu le croiseras dans du code existant.

```js
export const usePanierStore = defineStore('panier', {
  state: () => ({ articles: [] }),
  getters: {
    nombre: (state) => state.articles.reduce((n, a) => n + a.quantite, 0),
  },
  actions: {
    ajouter(produit) {
      this.articles.push({ ...produit, quantite: 1 })
    },
  },
})
```

Ici, les actions utilisent `this`. Dans un setup store, il n'y a jamais de `this`.

## Utiliser le store dans un composant

Appelle la fonction `useXxxStore()` dans `<script setup>`. Le store est créé au premier appel, puis **partagé** : tous les composants reçoivent le même.

```vue
<!-- CarteProduit.vue -->
<script setup>
import { usePanierStore } from '@/stores/panier'

defineProps({ produit: Object })
const panier = usePanierStore()
</script>

<template>
  <h3>{{ produit.nom }}</h3>
  <button @click="panier.ajouter(produit)">Ajouter au panier</button>
</template>
```

```vue
<!-- EnTete.vue -->
<script setup>
import { usePanierStore } from '@/stores/panier'

const panier = usePanierStore()
</script>

<template>
  <header>Panier : {{ panier.nombre }} article(s), {{ panier.total }} €</header>
</template>
```

Le store est un objet `reactive` : on écrit `panier.total`, **sans `.value`**, dans le template comme dans le script.

## Déstructurer avec storeToRefs

Comme pour tout `reactive`, déstructurer le store casse la réactivité. `storeToRefs()` transforme le state et les getters en refs. Les actions se déstructurent directement.

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { usePanierStore } from '@/stores/panier'

const panier = usePanierStore()

// ❌ nombre est copié une fois et ne bouge plus
// const { nombre } = panier

// ✅ state et getters : storeToRefs
const { articles, nombre, total } = storeToRefs(panier)
// ✅ actions : directement
const { retirer, vider } = panier
</script>

<template>
  <ul>
    <li v-for="a in articles" :key="a.id">
      {{ a.nom }} × {{ a.quantite }}
      <button @click="retirer(a.id)">Retirer</button>
    </li>
  </ul>
  <p>{{ nombre }} article(s), total {{ total }} €</p>
  <button @click="vider">Vider</button>
</template>
```

## Modifier le state

Trois façons :

```js
const panier = usePanierStore()

panier.ajouter(produit)          // 1. une action (recommandé)
panier.articles = []             // 2. directement
panier.$patch({ articles: [] })  // 3. $patch : plusieurs propriétés d'un coup
```

Préfère les actions : toute la logique métier reste au même endroit, et le code des composants reste simple.

> [!NOTE]
> `$reset()` remet le state à sa valeur de départ, mais seulement dans un option store. Dans un setup store, écris ta propre action `reinitialiser()`.

## Actions asynchrones

Une action peut être `async`. C'est l'endroit idéal pour appeler une API.

```js
export const useProduitsStore = defineStore('produits', () => {
  const liste = ref([])
  const chargement = ref(false)

  async function charger() {
    chargement.value = true
    try {
      const reponse = await fetch('/api/produits')
      liste.value = await reponse.json()
    } finally {
      chargement.value = false
    }
  }

  return { liste, chargement, charger }
})
```

```js
// dans un composant
const produits = useProduitsStore()
onMounted(() => produits.charger())
```

## Un store qui utilise un autre store

Appelle l'autre store **dans** la fonction du store, pas au premier niveau du fichier.

```js
import { useUtilisateurStore } from './utilisateur'

export const useCommandeStore = defineStore('commande', () => {
  const utilisateur = useUtilisateurStore()
  const panier = usePanierStore()

  async function valider() {
    await fetch('/api/commandes', {
      method: 'POST',
      body: JSON.stringify({ client: utilisateur.id, articles: panier.articles }),
    })
    panier.vider()
  }

  return { valider }
})
```

> [!TIP]
> Les Vue DevTools ont un onglet Pinia : tu y vois chaque store, son state et l'historique des actions. Tu peux même modifier le state à la main.

## Pièges fréquents

- **Oublier `app.use(createPinia())`** : erreur « getActivePinia() was called but there was no active Pinia ».
- **Appeler `useXxxStore()` au premier niveau d'un fichier JS** (hors composant), avant l'installation de Pinia : même erreur. Appelle-le dans une fonction.
- **Déstructurer le store sans `storeToRefs`** : les valeurs ne se mettent plus à jour.
- **Utiliser `storeToRefs` pour les actions** : elles sont ignorées. Déstructure les actions directement depuis le store.
- **Écrire `panier.total.value`** : le store est déjà déballé, `panier.total` suffit.
- **Ne pas retourner une ref du state** dans un setup store : elle échappe à Pinia.
- **Mettre tout l'état dans Pinia** : l'état d'un seul composant (champ ouvert, saisie en cours) reste dans une `ref` locale.

## Résumé

- Un store Pinia partage un état entre tous les composants. Installation : `app.use(createPinia())`.
- `defineStore('id', () => { ... })` : `ref` = state, `computed` = getter, `function` = action. Retourne tout.
- L'option store `{ state, getters, actions }` existe aussi ; il utilise `this`.
- `const panier = usePanierStore()` dans un composant ; même instance partout ; pas de `.value`.
- `storeToRefs(store)` pour déstructurer le state et les getters ; les actions se déstructurent directement.
- Les actions (même `async`) sont le bon endroit pour la logique et les appels API.

## Pour pratiquer

Le runner du navigateur n'inclut pas Pinia : cette leçon n'a pas d'exercice en ligne. Passe au TP [Panier avec Pinia](#/vue/tp/06-panier-pinia) : un panier partagé entre plusieurs composants, avec ses tests.
