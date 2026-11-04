# La réactivité : ref, reactive, computed

## Objectifs

- Créer un état réactif avec `ref()` et utiliser `.value`.
- Savoir quand Vue « déballe » une ref dans le template.
- Connaître `reactive()` et ses limites.
- Calculer une valeur dérivée avec `computed()`.
- Protéger un état avec `readonly()`.

## Le principe

Un état **réactif** est une valeur que Vue surveille. Quand elle change, Vue met à jour tout ce qui l'affiche. Tu ne touches jamais au DOM toi-même.

Une variable JavaScript normale n'est pas surveillée :

```vue
<script setup>
let compte = 0 // ❌ pas réactif : l'écran reste à 0
</script>

<template>
  <button @click="compte++">{{ compte }}</button>
</template>
```

> [!NOTE]
> En Vue 2, tout ce qui était dans `data()` devenait réactif, avec `Object.defineProperty`. Vue 3 utilise des **Proxy** et des getters/setters. Conséquences : `Vue.set()` et `this.$set()` n'existent plus. Ajouter une propriété ou écrire `liste[0] = x` est maintenant réactif.

## ref()

`ref()` crée une valeur réactive. Elle accepte n'importe quel type : nombre, chaîne, booléen, tableau, objet.

```vue
<script setup>
import { ref } from 'vue'

const compte = ref(0)

function incrementer() {
  compte.value++ // dans le script : .value
}
</script>

<template>
  <!-- dans le template : pas de .value -->
  <button @click="incrementer">{{ compte }}</button>
</template>
```

### Pourquoi `.value` ?

`ref()` retourne un **objet** avec une propriété `value`. Cette propriété a un getter (lecture) et un setter (écriture). Le getter dit à Vue « cette valeur est utilisée ici ». Le setter dit à Vue « elle a changé, mets à jour ».

```js
const prenom = ref('Ada')
console.log(prenom.value) // 'Ada'
prenom.value = 'Grace'     // Vue met à jour l'écran
```

### Les objets et tableaux dans une ref

Une ref qui contient un objet ou un tableau est réactive **en profondeur** : tu peux modifier une propriété ou ajouter un élément.

```js
const panier = ref([])
panier.value.push({ nom: 'Clavier', prix: 50 }) // réactif

const user = ref({ nom: 'Ada', ville: 'Lyon' })
user.value.ville = 'Paris' // réactif
user.value = { nom: 'Grace', ville: 'Nice' } // réactif aussi
```

> [!TIP]
> La documentation de Vue recommande `ref()` comme outil principal. Tu peux l'utiliser pour tout.

## Le déballage dans le template

Dans le template, Vue enlève le `.value` pour toi. On dit qu'il « déballe » la ref (unwrap). Cela marche pour les refs déclarées **au premier niveau** de `<script setup>`.

```vue
<script setup>
import { ref } from 'vue'

const compte = ref(1)
const objet = { id: ref(1) } // ref rangée dans un objet normal
</script>

<template>
  <p>{{ compte + 1 }}</p>     <!-- 2 -->
  <p>{{ objet.id }}</p>       <!-- 1 : le résultat final d'un {{ }} est déballé -->
  <p>{{ objet.id + 1 }}</p>   <!-- ❌ "[object Object]1" -->
</template>
```

`objet.id` n'est pas au premier niveau : Vue ne le déballe pas dans un calcul. La solution : déstructurer pour remonter la ref au premier niveau (`const { id } = objet`).

## reactive()

`reactive()` rend un **objet** réactif. Pas besoin de `.value`.

```js
import { reactive } from 'vue'

const form = reactive({ nom: '', email: '' })
form.nom = 'Ada' // réactif, sans .value
```

C'est pratique pour un groupe de valeurs liées, comme un formulaire. Mais `reactive()` a trois limites.

### Limite 1 : seulement les objets

```js
const n = reactive(0) // ❌ ne marche pas : un nombre n'est pas un objet
```

### Limite 2 : on ne peut pas remplacer l'objet

```js
let etat = reactive({ compte: 0 })
etat = reactive({ compte: 1 }) // ❌ le template garde l'ancien objet

// ✅ modifie les propriétés à la place
etat.compte = 1
// ✅ ou Object.assign pour en changer plusieurs
Object.assign(etat, { compte: 1 })
```

### Limite 3 : la déstructuration casse la réactivité

```js
const etat = reactive({ compte: 0 })
let { compte } = etat // ❌ compte est un simple nombre, copié une fois
compte++              // etat.compte ne change pas
```

Pour garder le lien, transforme les propriétés en refs avec `toRefs()` :

```js
import { reactive, toRefs } from 'vue'

const etat = reactive({ compte: 0, nom: 'Ada' })
const { compte, nom } = toRefs(etat) // deux refs liées à etat
compte.value++ // etat.compte vaut 1
```

## computed()

`computed()` crée une valeur **dérivée** : elle se calcule à partir d'autres valeurs réactives. Elle se met à jour toute seule.

```vue
<script setup>
import { ref, computed } from 'vue'

const articles = ref([
  { nom: 'Clavier', prix: 50, quantite: 1 },
  { nom: 'Souris', prix: 20, quantite: 2 },
])

const total = computed(() =>
  articles.value.reduce((somme, a) => somme + a.prix * a.quantite, 0),
)
const livraisonOfferte = computed(() => total.value >= 80)
</script>

<template>
  <p>Total : {{ total }} €</p>
  <p v-if="livraisonOfferte">Livraison offerte</p>
</template>
```

Un computed est une ref en lecture seule : dans le script, lis-le avec `total.value`.

### computed ou fonction ?

Une fonction appelée dans le template donne le même résultat :

```vue
<p>Total : {{ calculerTotal() }} €</p>
```

La différence : un computed est **mis en cache**. Il ne se recalcule que si une de ses dépendances change. Une fonction est relancée à **chaque** rendu du composant.

| | `computed` | fonction |
|---|---|---|
| Recalcul | seulement si une dépendance change | à chaque rendu |
| Paramètres | non | oui |
| Usage | valeur dérivée | calcul avec un paramètre, action |

> [!WARNING]
> Un computed doit seulement **calculer et retourner** une valeur. Pas de requête réseau, pas de modification d'un autre état. Pour un effet de bord, utilise `watch` (leçon 7).

### computed modifiable (rare)

Tu peux donner un `get` et un `set`. C'est utile pour relier un `v-model` à une valeur transformée.

```js
const prenom = ref('Ada')
const nom = ref('Lovelace')

const nomComplet = computed({
  get: () => `${prenom.value} ${nom.value}`,
  set: (valeur) => {
    const [p, n] = valeur.split(' ')
    prenom.value = p
    nom.value = n
  },
})
```

## readonly()

`readonly()` retourne une version en lecture seule d'une ref ou d'un objet réactif. La lecture reste réactive, mais l'écriture est refusée (avec un avertissement en développement).

```js
import { ref, readonly } from 'vue'

const compte = ref(0)
const compteLecture = readonly(compte)

compte.value++         // ✅ l'original reste modifiable
compteLecture.value++  // ⚠️ refusé, avertissement dans la console
```

On s'en sert pour partager un état sans laisser les autres le modifier. Tu le reverras avec provide/inject (leçon 6) et les composables (leçon 8).

## Pièges fréquents

- **Oublier `.value` dans le script** : `compte++` sur une ref ne fait rien d'utile. Écris `compte.value++`.
- **Ajouter `.value` dans le template** : `{{ compte.value }}` n'affiche rien pour une ref de premier niveau, car elle est déjà déballée.
- **Remplacer un objet `reactive`** : `etat = reactive({...})` coupe le lien avec le template. Modifie ses propriétés ou utilise une `ref`.
- **Déstructurer un `reactive`** : `const { compte } = etat` donne une copie figée. Utilise `toRefs(etat)`.
- **Faire un effet de bord dans un computed** (fetch, modification d'une autre ref) : utilise `watch`.
- **Modifier un computed** sans `set` : il est en lecture seule.

## Résumé

- `ref(valeur)` crée un état réactif. Dans le script : `.value`. Dans le template : sans `.value`.
- Une ref contenant un objet ou un tableau est réactive en profondeur.
- Le template déballe les refs de premier niveau. Une ref rangée dans un objet normal n'est pas déballée dans un calcul.
- `reactive(objet)` évite `.value` mais : objets seulement, pas de remplacement, pas de déstructuration (sauf avec `toRefs`).
- `computed(() => ...)` calcule une valeur dérivée, mise en cache. Pas d'effet de bord dedans.
- `readonly()` partage un état sans permettre de le modifier.

## Pour pratiquer

Fais l'exercice [Un compteur réactif](#/vue/exercice/02-compteur), puis [Comprendre .value](#/vue/exercice/02-mini-ref) pour voir le principe d'une ref. Ensuite, attaque le TP [Compteur borné](#/vue/tp/01-compteur).
