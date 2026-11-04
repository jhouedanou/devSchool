# Composants : props et événements

## Objectifs

- Importer et utiliser un composant enfant.
- Déclarer des props avec `defineProps` (types, valeurs par défaut).
- Émettre un événement vers le parent avec `defineEmits`.
- Respecter le flux de données descendant.
- Créer un `v-model` sur ton composant avec `defineModel`.

## Utiliser un composant enfant

Un composant est un fichier `.vue`. Pour l'utiliser, importe-le dans `<script setup>`, puis écris sa balise.

```vue
<!-- App.vue -->
<script setup>
import CarteProduit from './components/CarteProduit.vue'
</script>

<template>
  <CarteProduit nom="Clavier" :prix="50" />
  <CarteProduit nom="Souris" :prix="20" />
</template>
```

Chaque balise crée une **instance** indépendante, avec son propre état.

> [!TIP]
> Donne aux composants un nom en PascalCase et en plusieurs mots (`CarteProduit`, `BoutonEnvoyer`). Cela évite les conflits avec les balises HTML (`<header>`, `<button>`).

## Les props : du parent vers l'enfant

Les **props** sont les paramètres d'un composant. Le parent les passe comme des attributs. L'enfant les déclare avec la macro `defineProps`.

> [!NOTE]
> `defineProps`, `defineEmits` et `defineModel` sont des **macros** : le compilateur les transforme. Pas besoin de les importer.

### Déclarer les props

La forme courte, avec un tableau de noms :

```js
const props = defineProps(['nom', 'prix'])
```

La forme recommandée, avec un objet qui précise le type :

```vue
<!-- CarteProduit.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  nom: { type: String, required: true },
  prix: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  enPromo: { type: Boolean, default: false },
  tags: { type: Array, default: () => [] }, // objet ou tableau : une fonction
})

const prixFinal = computed(() => (props.enPromo ? props.prix * 0.8 : props.prix))
</script>

<template>
  <article class="carte">
    <h3>{{ nom }}</h3>
    <p>{{ prixFinal }} €</p>
    <p v-if="stock === 0">Rupture</p>
  </article>
</template>
```

- Dans le template, une prop s'utilise directement : `{{ nom }}`.
- Dans le script, passe par l'objet : `props.prix`.
- En développement, Vue affiche un avertissement si le type ne correspond pas ou si une prop obligatoire manque.

### Passer des props

```vue
<CarteProduit
  nom="Clavier"
  :prix="50"
  :stock="produit.stock"
  en-promo
/>
```

- Sans `:`, la valeur est une **chaîne** : `nom="Clavier"`.
- Avec `:`, la valeur est une **expression** : `:prix="50"` donne le nombre 50.
- Une prop booléenne sans valeur vaut `true` : `en-promo`.
- Dans le template du parent, tu peux écrire le nom en kebab-case (`en-promo`). Vue le relie à `enPromo`.

### Déstructurer les props (Vue 3.5)

Depuis Vue 3.5, tu peux déstructurer `defineProps` et donner les valeurs par défaut en JavaScript. La réactivité est gardée.

```js
const { nom, prix, stock = 0, enPromo = false } = defineProps({
  nom: String,
  prix: Number,
  stock: Number,
  enPromo: Boolean,
})

const prixFinal = computed(() => (enPromo ? prix * 0.8 : prix))
```

> [!WARNING]
> Pour surveiller une prop déstructurée avec `watch`, passe une fonction : `watch(() => stock, ...)`. Le compilateur refuse `watch(stock, ...)`.

## Le flux de données descendant

Les données descendent du parent vers l'enfant. Quand le parent change une prop, l'enfant se met à jour. L'inverse est interdit : **une prop est en lecture seule** dans l'enfant.

```js
const props = defineProps({ quantiteInitiale: Number })

props.quantiteInitiale++ // ❌ avertissement : la prop est en lecture seule
```

Deux solutions selon le besoin :

```js
// 1. La prop sert de valeur de départ : copie-la dans une ref locale
const quantite = ref(props.quantiteInitiale)

// 2. Tu veux une version transformée : utilise un computed
const nomMajuscules = computed(() => props.nom.toUpperCase())
```

Si l'enfant veut **changer** une donnée du parent, il émet un événement. Le parent décide.

## Les événements : de l'enfant vers le parent

L'enfant déclare ses événements avec `defineEmits`, puis les émet avec `emit()`.

```vue
<!-- CarteProduit.vue -->
<script setup>
const props = defineProps({ id: Number, nom: String })
const emit = defineEmits(['ajouter', 'supprimer'])

function ajouter() {
  emit('ajouter', props.id) // nom de l'événement + données
}
</script>

<template>
  <h3>{{ nom }}</h3>
  <button @click="ajouter">Ajouter</button>
  <button @click="emit('supprimer', id)">Supprimer</button>
</template>
```

Le parent écoute avec `@` :

```vue
<!-- App.vue -->
<script setup>
import { ref } from 'vue'
import CarteProduit from './components/CarteProduit.vue'

const panier = ref([])

function ajouterAuPanier(id) {
  panier.value.push(id)
}
</script>

<template>
  <CarteProduit :id="1" nom="Clavier" @ajouter="ajouterAuPanier" />
  <p>{{ panier.length }} article(s)</p>
</template>
```

> [!NOTE]
> Un événement de composant ne remonte pas plus haut que le parent direct (pas de propagation comme un clic). Pour partager un état plus loin, utilise provide/inject (leçon 6) ou Pinia (leçon 10).

Tu peux valider les données émises avec la forme objet :

```js
const emit = defineEmits({
  ajouter: (id) => typeof id === 'number', // retourne false → avertissement
})
```

## defineModel : un v-model sur ton composant

`v-model` marche aussi sur un composant. Avant Vue 3.4, il fallait une prop `modelValue` et un événement `update:modelValue`. Aujourd'hui, `defineModel()` fait tout.

```vue
<!-- ChampRecherche.vue -->
<script setup>
const texte = defineModel({ type: String, default: '' })
</script>

<template>
  <input v-model="texte" placeholder="Rechercher…" />
  <button v-if="texte" @click="texte = ''">Effacer</button>
</template>
```

```vue
<!-- Parent -->
<script setup>
import { ref } from 'vue'
import ChampRecherche from './ChampRecherche.vue'

const recherche = ref('')
</script>

<template>
  <ChampRecherche v-model="recherche" />
  <p>Tu cherches : {{ recherche }}</p>
</template>
```

`defineModel()` retourne une ref :

- sa valeur vient de la prop `modelValue` du parent ;
- quand tu la modifies, Vue émet `update:modelValue` et le parent met à jour sa ref.

### Plusieurs v-model

Donne un nom en premier argument. Le parent utilise `v-model:nom`.

```vue
<!-- ChampNom.vue -->
<script setup>
const prenom = defineModel('prenom')
const nom = defineModel('nom')
</script>

<template>
  <input v-model="prenom" />
  <input v-model="nom" />
</template>
```

```vue
<ChampNom v-model:prenom="user.prenom" v-model:nom="user.nom" />
```

> [!NOTE]
> Changements depuis Vue 2 : la prop `value` et l'événement `input` deviennent `modelValue` et `update:modelValue`. Le modificateur `.sync` disparaît : `:titre.sync="t"` devient `v-model:titre="t"`. L'option `model` n'existe plus.

## Reconnaître l'Options API

Dans du code ancien, les props et événements s'écrivent ainsi :

```js
export default {
  props: { nom: String },
  emits: ['ajouter'],
  methods: {
    ajouter() {
      this.$emit('ajouter', this.nom)
    },
  },
}
```

## Pièges fréquents

- **Modifier une prop** : `props.x = ...` est refusé. Copie la prop dans une ref, ou émets un événement.
- **Oublier `:`** : `:prix="50"` donne un nombre, `prix="50"` donne la chaîne `"50"` (et un avertissement de type).
- **Valeur par défaut d'un objet ou tableau** sans fonction : écris `default: () => []`.
- **Ne pas déclarer un événement** dans `defineEmits` : l'écouteur du parent est aussi posé sur l'élément racine de l'enfant. Pour un événement nommé `click`, il se déclenche alors deux fois.
- **`watch(propDestructuree, ...)`** : passe un getter, `watch(() => propDestructuree, ...)`.
- **Utiliser `v-model` directement sur une prop** dans l'enfant : utilise `defineModel`.

## Résumé

- Importe un composant dans `<script setup>` et utilise sa balise.
- `defineProps({...})` déclare les props, avec `type`, `required`, `default`.
- Les props descendent et sont en lecture seule. Copie-les dans une ref si l'enfant doit les changer localement.
- `defineEmits([...])` déclare les événements ; `emit('nom', donnees)` les envoie. Le parent écoute avec `@nom`.
- `defineModel()` crée une ref liée au `v-model` du parent. `defineModel('titre')` pour `v-model:titre`.
- Depuis Vue 3.5, on peut déstructurer `defineProps` avec des valeurs par défaut.

## Pour pratiquer

Fais les exercices [Carte produit](#/vue/exercice/05-carte-produit) et [Un v-model maison](#/vue/exercice/05-champ-quantite). Ensuite, le TP [Catalogue : props et événements](#/vue/tp/03-catalogue-produits) te fait découper une page en composants.
