# Les directives du template

## Objectifs

- Lier un attribut à une valeur avec `v-bind` (`:`).
- Écouter un événement avec `v-on` (`@`) et ses modificateurs.
- Afficher sous condition avec `v-if` et `v-show`.
- Répéter un élément avec `v-for` et une `:key`.
- Changer les classes et les styles selon l'état.
- Savoir pourquoi `v-html` est dangereux.

Une **directive** est un attribut spécial qui commence par `v-`. Sa valeur est une expression JavaScript.

## v-bind : lier un attribut

`v-bind:attribut="expression"` donne à l'attribut la valeur de l'expression. Le raccourci est `:`.

```vue
<script setup>
const image = '/img/logo.png'
const description = 'Logo de Vue'
const enCours = true
</script>

<template>
  <img v-bind:src="image" :alt="description" />
  <button :disabled="enCours">Envoyer</button>
</template>
```

Pour un attribut booléen comme `disabled`, Vue retire l'attribut si la valeur est fausse (`false`, `null`, `undefined`).

Depuis Vue 3.4, si l'attribut et la variable ont le même nom, tu peux écrire seulement `:nom` :

```vue
<!-- identique à :id="id" et :src="src" -->
<img :id :src />
```

Pour lier plusieurs attributs d'un coup, passe un objet à `v-bind` :

```vue
<script setup>
const attributs = { id: 'champ-email', type: 'email', required: true }
</script>

<template>
  <input v-bind="attributs" />
</template>
```

## v-on : écouter un événement

`v-on:evenement="gestionnaire"` exécute du code quand l'événement arrive. Le raccourci est `@`.

```vue
<script setup>
import { ref } from 'vue'

const compte = ref(0)

function ajouter(n) {
  compte.value += n
}

function afficher(event) {
  console.log(event.target.value)
}
</script>

<template>
  <button @click="compte++">+1</button>
  <button @click="ajouter(5)">+5</button>
  <input @input="afficher" />
  <input @input="(e) => console.log(e.target.value)" />
</template>
```

- `@click="afficher"` : Vue appelle la fonction avec l'objet événement.
- `@click="ajouter(5)"` : appel avec tes paramètres. L'événement est disponible dans `$event`.

### Les modificateurs d'événements

Un modificateur s'ajoute après un point. Il évite d'écrire `event.preventDefault()` à la main.

| Modificateur | Effet |
|--------------|-------|
| `.prevent` | appelle `event.preventDefault()` |
| `.stop` | appelle `event.stopPropagation()` |
| `.once` | le gestionnaire ne s'exécute qu'une fois |
| `.self` | seulement si le clic vise l'élément lui-même, pas un enfant |

```vue
<form @submit.prevent="envoyer">…</form>
<a href="/aide" @click.prevent="ouvrirAide">Aide</a>
<div class="fond" @click.self="fermer">…</div>
<button @click.once="activer">Activer</button>
```

Pour le clavier, il y a des modificateurs de touche :

```vue
<input @keyup.enter="valider" @keyup.esc="annuler" />
<input @keydown.ctrl.s.prevent="sauvegarder" />
```

> [!NOTE]
> Changements depuis Vue 2 : les codes de touche (`@keyup.13`) et le modificateur `.native` n'existent plus. Utilise les noms de touches (`.enter`, `.esc`, `.page-down`…).

## v-if, v-else-if, v-else

`v-if` affiche l'élément seulement si la condition est vraie. Sinon, l'élément n'existe pas dans le DOM.

```vue
<p v-if="chargement">Chargement…</p>
<p v-else-if="erreur" class="erreur">{{ erreur }}</p>
<ul v-else>
  <li v-for="u in utilisateurs" :key="u.id">{{ u.nom }}</li>
</ul>
```

`v-else-if` et `v-else` doivent suivre **directement** un élément avec `v-if` ou `v-else-if`.

Pour regrouper plusieurs éléments sans ajouter de balise, utilise `<template>` :

```vue
<template v-if="connecte">
  <h2>Bienvenue</h2>
  <button @click="deconnecter">Se déconnecter</button>
</template>
```

## v-show

`v-show` cache l'élément avec `display: none`. L'élément reste dans le DOM.

```vue
<div v-show="menuOuvert" class="menu">…</div>
```

| | `v-if` | `v-show` |
|---|---|---|
| Élément caché | retiré du DOM | présent, avec `display: none` |
| Coût | création à chaque affichage | création une seule fois |
| `v-else` | oui | non |
| Usage | condition qui change rarement | élément qu'on bascule souvent |

## v-for : répéter un élément

`v-for` crée un élément pour chaque entrée d'un tableau.

```vue
<script setup>
import { ref } from 'vue'

const produits = ref([
  { id: 1, nom: 'Clavier', prix: 50 },
  { id: 2, nom: 'Souris', prix: 20 },
])
</script>

<template>
  <ul>
    <li v-for="(produit, index) in produits" :key="produit.id">
      {{ index + 1 }}. {{ produit.nom }} : {{ produit.prix }} €
    </li>
  </ul>
</template>
```

D'autres formes :

```vue
<span v-for="n in 5" :key="n">{{ n }}</span>              <!-- 1 à 5 -->
<p v-for="(valeur, cle) in user" :key="cle">{{ cle }} : {{ valeur }}</p>
```

### La `:key`

La `:key` aide Vue à reconnaître chaque élément quand la liste change. Elle doit être **unique** et **stable** : un `id` est idéal.

> [!WARNING]
> Évite `:key="index"` si la liste peut être triée, filtrée ou si on peut y insérer un élément. Vue réutiliserait le mauvais élément : un champ ou une case cochée garderait l'ancien contenu.

### v-if et v-for sur le même élément

> [!NOTE]
> En Vue 2, `v-for` passait avant `v-if`. En Vue 3, c'est l'inverse : `v-if` est évalué en premier, donc il ne voit pas la variable de la boucle.

```vue
<!-- ❌ erreur : "tache" n'existe pas encore pour v-if -->
<li v-for="tache in taches" v-if="!tache.faite" :key="tache.id">…</li>

<!-- ✅ filtre avec un computed -->
<li v-for="tache in tachesAFaire" :key="tache.id">…</li>

<!-- ✅ ou mets v-for sur un <template> -->
<template v-for="tache in taches" :key="tache.id">
  <li v-if="!tache.faite">{{ tache.texte }}</li>
</template>
```

## Classes et styles dynamiques

`:class` accepte un objet : la classe est ajoutée si la valeur est vraie.

```vue
<li :class="{ faite: tache.faite, urgente: tache.priorite > 2 }">…</li>
```

Ou un tableau, qui peut contenir des objets :

```vue
<button :class="['bouton', taille, { actif: estActif }]">OK</button>
```

`:class` se combine avec un `class` statique :

```vue
<div class="carte" :class="{ selectionnee: estSelectionnee }">…</div>
```

`:style` accepte un objet avec des propriétés CSS en camelCase (ou entre guillemets en kebab-case) :

```vue
<p :style="{ color: couleur, fontSize: taille + 'px' }">Texte</p>
<div :style="{ '--progression': pourcentage + '%' }" class="barre"></div>
```

> [!TIP]
> Préfère `:class` à `:style`. Le CSS reste dans le bloc `<style>`, plus facile à lire et à maintenir.

## v-html et le danger XSS

`v-html` insère une chaîne comme du **HTML**, sans échappement.

```vue
<div v-html="articleHtml"></div>
```

> [!WARNING]
> N'utilise jamais `v-html` avec un contenu venant d'un utilisateur. Un texte comme `<img src=x onerror="voler()">` exécuterait du JavaScript dans la page : c'est une faille **XSS** (Cross-Site Scripting). Réserve `v-html` à du contenu sûr, ou nettoie-le avant (avec une bibliothèque comme DOMPurify).

De plus, les styles `scoped` ne s'appliquent pas au HTML inséré par `v-html`.

## Pièges fréquents

- **Oublier le `:`** : `<img src="image">` donne le texte « image », pas la valeur de la variable.
- **`v-if` avec `v-for` sur le même élément** : en Vue 3, `v-if` passe en premier. Filtre avec un computed.
- **`:key="index"` sur une liste modifiable** : des champs gardent le mauvais contenu. Utilise un `id`.
- **`v-else` séparé de son `v-if`** par un autre élément : erreur de compilation.
- **Formulaire sans `.prevent`** : `@submit="envoyer"` recharge la page. Écris `@submit.prevent`.
- **`v-html` avec une saisie utilisateur** : faille XSS.

## Résumé

- `:attr="expr"` (v-bind) lie un attribut. `:attr` seul si la variable a le même nom (Vue 3.4+).
- `@evt="gestionnaire"` (v-on) écoute un événement. Modificateurs : `.prevent`, `.stop`, `.once`, `.self`, `.enter`, `.esc`…
- `v-if` / `v-else-if` / `v-else` ajoutent ou retirent l'élément. `v-show` le cache seulement.
- `v-for="(item, index) in liste"` répète un élément. Donne toujours une `:key` unique et stable.
- En Vue 3, `v-if` est évalué avant `v-for`.
- `:class` et `:style` acceptent des objets et des tableaux.
- `v-html` n'échappe rien : jamais avec du contenu utilisateur.

## Pour pratiquer

Fais l'exercice [Liste de tâches filtrée](#/vue/exercice/03-liste-taches) : `v-for`, `:key`, `:class`, `@click` et `v-if`. Ensuite, le TP [Liste de tâches](#/vue/tp/02-todo-list) reprend tout cela dans un vrai projet.
