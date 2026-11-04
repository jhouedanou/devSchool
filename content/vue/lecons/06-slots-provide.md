# Slots et provide/inject

## Objectifs

- Passer du contenu HTML à un composant avec un slot.
- Utiliser des slots nommés et des contenus de secours.
- Renvoyer des données au parent avec un slot avec portée (scoped slot).
- Partager une valeur avec tous les descendants avec `provide` / `inject`.
- Comprendre les attributs transmis (fallthrough attributes).

## Le slot par défaut

Une prop passe une **donnée**. Un **slot** passe du **contenu** : du texte, du HTML, d'autres composants.

L'enfant place `<slot />` à l'endroit où le contenu doit apparaître :

```vue
<!-- BoiteAlerte.vue -->
<template>
  <div class="alerte">
    <strong>Attention :</strong>
    <slot />
  </div>
</template>
```

Le parent écrit le contenu entre les balises du composant :

```vue
<BoiteAlerte>
  Ton mot de passe expire dans <b>3 jours</b>.
</BoiteAlerte>
```

Le contenu du slot est écrit dans le parent : il a accès aux variables du **parent**, pas à celles de l'enfant.

### Le contenu de secours

Ce qui est écrit entre `<slot>` et `</slot>` s'affiche si le parent ne donne rien.

```vue
<!-- BoutonEnvoyer.vue -->
<template>
  <button type="submit">
    <slot>Envoyer</slot>
  </button>
</template>
```

```vue
<BoutonEnvoyer />               <!-- affiche « Envoyer » -->
<BoutonEnvoyer>Valider</BoutonEnvoyer>  <!-- affiche « Valider » -->
```

## Les slots nommés

Un composant peut avoir plusieurs emplacements. Chaque slot a un `name`.

```vue
<!-- CarteBase.vue -->
<template>
  <article class="carte">
    <header>
      <slot name="entete">Sans titre</slot>
    </header>
    <main>
      <slot />  <!-- slot par défaut, nommé « default » -->
    </main>
    <footer v-if="$slots.pied">
      <slot name="pied" />
    </footer>
  </article>
</template>
```

Le parent vise un slot avec `<template #nom>`. `#nom` est le raccourci de `v-slot:nom`.

```vue
<CarteBase>
  <template #entete>
    <h2>Mon profil</h2>
  </template>

  <p>Ce contenu va dans le slot par défaut.</p>

  <template #pied>
    <button>Modifier</button>
  </template>
</CarteBase>
```

Le contenu qui n'est pas dans un `<template #...>` va dans le slot par défaut.

> [!TIP]
> `$slots.pied` (dans le template) ou `useSlots()` (dans le script) indique si le parent a rempli un slot. Ici, le `<footer>` n'est créé que s'il y a du contenu.

> [!NOTE]
> En Vue 2, on écrivait `slot="entete"` et `slot-scope="props"`. Ces attributs sont remplacés par `v-slot` (ou `#`). `$scopedSlots` a fusionné avec `$slots`.

## Les slots avec portée (scoped slots)

Parfois, le contenu du parent a besoin de données de l'**enfant**. L'enfant les passe comme des attributs sur `<slot>` :

```vue
<!-- ListeProduits.vue -->
<script setup>
defineProps({ produits: { type: Array, default: () => [] } })
</script>

<template>
  <ul>
    <li v-for="(produit, index) in produits" :key="produit.id">
      <slot :produit="produit" :index="index">
        {{ produit.nom }}  <!-- contenu de secours -->
      </slot>
    </li>
  </ul>
</template>
```

Le parent récupère ces données, appelées **props du slot**, avec `#default="{ ... }"` :

```vue
<ListeProduits :produits="catalogue">
  <template #default="{ produit, index }">
    {{ index + 1 }}. <strong>{{ produit.nom }}</strong> : {{ produit.prix }} €
  </template>
</ListeProduits>
```

Si le composant n'a **que** le slot par défaut, tu peux écrire `v-slot` directement sur la balise :

```vue
<ListeProduits :produits="catalogue" v-slot="{ produit }">
  {{ produit.nom.toUpperCase() }}
</ListeProduits>
```

Un slot nommé peut aussi avoir une portée : `<slot name="ligne" :produit="produit" />` côté enfant, `<template #ligne="{ produit }">` côté parent. L'enfant garde la logique (boucle, tri, pagination) ; le parent choisit l'affichage.

## provide et inject

Passer une prop de composant en composant, sur plusieurs niveaux, devient vite pénible. On appelle cela le **prop drilling** (forage de props).

`provide()` rend une valeur disponible pour **tous les descendants** d'un composant. `inject()` la récupère, quelle que soit la profondeur.

```vue
<!-- App.vue (ancêtre) -->
<script setup>
import { ref, provide } from 'vue'

const utilisateur = ref({ nom: 'Ada', role: 'admin' })
provide('utilisateur', utilisateur)
</script>
```

```vue
<!-- BarreMenu.vue (descendant, à n'importe quel niveau) -->
<script setup>
import { inject } from 'vue'

const utilisateur = inject('utilisateur')
</script>

<template>
  <p>Connecté : {{ utilisateur.nom }}</p>
</template>
```

### Garder la réactivité

Fournis la **ref** elle-même, pas sa valeur. Sinon, le descendant reçoit une copie figée.

```js
provide('theme', theme)        // ✅ réactif
provide('theme', theme.value)  // ❌ simple chaîne, ne change plus
```

### Contrôler les modifications

Bonne pratique : seul le composant qui fournit l'état le modifie. Fournis une version `readonly` et une fonction pour la changer.

```vue
<script setup>
import { ref, provide, readonly } from 'vue'

const theme = ref('clair')

function basculerTheme() {
  theme.value = theme.value === 'clair' ? 'sombre' : 'clair'
}

provide('theme', { theme: readonly(theme), basculerTheme })
</script>
```

```js
// dans un descendant
const { theme, basculerTheme } = inject('theme')
```

### Valeur par défaut et clé Symbol

Le deuxième argument d'`inject` est une valeur par défaut, utilisée si aucun ancêtre ne fournit la clé.

```js
const theme = inject('theme', 'clair')
```

Dans une grande application, utilise un `Symbol` comme clé pour éviter les collisions de noms :

```js
// cles.js
export const CLE_THEME = Symbol('theme')

// dans les composants
provide(CLE_THEME, theme)
const theme = inject(CLE_THEME)
```

Tu peux aussi fournir une valeur à toute l'application dans `main.js` : `app.provide('config', { api: '/api' })`.

> [!WARNING]
> Appelle `inject()` au premier niveau de `<script setup>`. Il ne marche pas dans une fonction appelée plus tard (un gestionnaire de clic, un `setTimeout`).

> [!TIP]
> provide/inject convient pour un thème, une configuration ou un composant « famille » (des onglets, un formulaire). Pour un état global de l'application (panier, utilisateur connecté), préfère Pinia (leçon 10).

## Les attributs transmis (fallthrough)

Un **attribut transmis** est un attribut passé à un composant mais non déclaré comme prop ou événement. Exemples : `class`, `style`, `id`, `data-*`, `@click`.

Si le composant a **un seul élément racine**, Vue ajoute ces attributs dessus.

```vue
<!-- BoutonBase.vue -->
<template>
  <button class="bouton"><slot /></button>
</template>
```

```vue
<BoutonBase class="large" id="envoyer" @click="envoyer">OK</BoutonBase>
<!-- rendu : <button class="bouton large" id="envoyer">OK</button>, avec l'écouteur click -->
```

`class` et `style` sont **fusionnés** avec ceux de l'élément racine. Les écouteurs s'ajoutent à ceux de la racine. Les autres attributs remplacent ceux de la racine.

### Choisir où vont les attributs

Pour placer les attributs sur un autre élément que la racine, désactive l'héritage avec `defineOptions`, puis utilise `v-bind="$attrs"` :

```vue
<!-- ChampTexte.vue -->
<script setup>
defineOptions({ inheritAttrs: false })
defineProps({ label: String })
</script>

<template>
  <label class="champ">
    {{ label }}
    <input v-bind="$attrs" />
  </label>
</template>
```

```vue
<ChampTexte label="E-mail" type="email" placeholder="ada@exemple.fr" required />
<!-- type, placeholder et required vont sur l'<input> -->
```

Dans le script, `useAttrs()` donne le même objet que `$attrs`.

Si le composant a **plusieurs éléments racines**, Vue ne sait pas où mettre les attributs. Il affiche un avertissement, sauf si tu places `v-bind="$attrs"` sur l'un d'eux.

> [!NOTE]
> En Vue 3, `$listeners` n'existe plus : les écouteurs sont dans `$attrs` (sous la forme `onClick`). `class` et `style` font aussi partie de `$attrs`.

## Pièges fréquents

- **Utiliser une variable de l'enfant dans le contenu du slot** : le slot voit les variables du parent. Passe la donnée avec un slot avec portée.
- **Mélanger `v-slot` sur la balise et des `<template #nom>`** : dès qu'il y a des slots nommés, mets le slot par défaut dans un `<template #default>`.
- **Fournir `ref.value` au lieu de la ref** : le descendant ne voit pas les changements.
- **Modifier un état injecté depuis n'importe où** : fournis-le en `readonly` avec une fonction de modification.
- **Appeler `inject()` dans un gestionnaire d'événement** : il doit être appelé pendant le setup, au premier niveau du script.
- **Composant à plusieurs racines** qui reçoit `class` : avertissement « Extraneous non-props attributes ». Ajoute `v-bind="$attrs"` sur la bonne racine.

## Résumé

- `<slot />` affiche le contenu donné par le parent. Ce qui est entre `<slot>` et `</slot>` est le contenu de secours.
- Slots nommés : `<slot name="entete" />` dans l'enfant, `<template #entete>` dans le parent.
- Slot avec portée : `<slot :produit="produit" />` dans l'enfant, `#default="{ produit }"` dans le parent.
- `provide(cle, valeur)` partage une valeur avec tous les descendants ; `inject(cle, defaut)` la récupère.
- Fournis la ref (réactive), de préférence en `readonly`, avec des fonctions pour la modifier.
- Les attributs non déclarés vont sur l'élément racine. `inheritAttrs: false` + `v-bind="$attrs"` pour choisir leur place.

## Pour pratiquer

Fais les exercices [Une liste personnalisable avec des slots](#/vue/exercice/06-liste-slots) et [Partager un thème avec provide/inject](#/vue/exercice/06-theme-provide). Tu peux ensuite reprendre le TP [Catalogue : props et événements](#/vue/tp/03-catalogue-produits) et remplacer une partie de l'affichage par un slot.
