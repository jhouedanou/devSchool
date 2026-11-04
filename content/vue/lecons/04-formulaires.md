# Formulaires et v-model

## Objectifs

- Relier un champ à l'état avec `v-model`.
- Utiliser `v-model` sur un texte, une zone de texte, une case à cocher, un bouton radio et une liste déroulante.
- Nettoyer la saisie avec `.trim`, `.number` et `.lazy`.
- Envoyer un formulaire avec `@submit.prevent`.
- Valider un formulaire avec un `computed`.

## Le principe de v-model

`v-model` crée une **liaison dans les deux sens** :

- l'état change → le champ affiche la nouvelle valeur ;
- l'utilisateur tape → l'état change.

```vue
<script setup>
import { ref } from 'vue'

const prenom = ref('')
</script>

<template>
  <input v-model="prenom" placeholder="Ton prénom" />
  <p>Bonjour {{ prenom || 'inconnu' }} !</p>
</template>
```

`v-model` est un raccourci. Sur un champ texte, il équivaut à :

```vue
<input :value="prenom" @input="prenom = $event.target.value" />
```

> [!IMPORTANT]
> Avec `v-model`, l'état est la seule source de vérité. Les attributs `value`, `checked` ou `selected` écrits dans le HTML sont ignorés. Donne la valeur de départ dans la `ref`.

## Texte et zone de texte

```vue
<script setup>
import { ref } from 'vue'

const titre = ref('')
const message = ref('')
</script>

<template>
  <input v-model="titre" type="text" />
  <textarea v-model="message" rows="4"></textarea>
  <p>{{ message.length }} / 500 caractères</p>
</template>
```

> [!WARNING]
> `<textarea>{{ message }}</textarea>` ne marche pas. Utilise toujours `v-model` sur une zone de texte.

## Case à cocher

### Une case seule : un booléen

```vue
<script setup>
import { ref } from 'vue'

const accepte = ref(false)
</script>

<template>
  <label>
    <input v-model="accepte" type="checkbox" />
    J'accepte les conditions
  </label>
  <button :disabled="!accepte">Continuer</button>
</template>
```

### Plusieurs cases : un tableau

Si plusieurs cases partagent le même `v-model` relié à un **tableau**, le tableau contient la `value` des cases cochées.

```vue
<script setup>
import { ref } from 'vue'

const langages = ref([]) // doit être un tableau
</script>

<template>
  <label><input v-model="langages" type="checkbox" value="vue" /> Vue</label>
  <label><input v-model="langages" type="checkbox" value="react" /> React</label>
  <label><input v-model="langages" type="checkbox" value="php" /> PHP</label>
  <p>Choisis : {{ langages.join(', ') }}</p>
</template>
```

Pour une valeur qui n'est pas une chaîne, utilise `:value` : `:value="produit.id"`.

## Boutons radio

Chaque bouton a sa `value`. La ref prend la valeur du bouton choisi.

```vue
<script setup>
import { ref } from 'vue'

const livraison = ref('standard')
</script>

<template>
  <label><input v-model="livraison" type="radio" value="standard" /> Standard</label>
  <label><input v-model="livraison" type="radio" value="express" /> Express</label>
  <p>Livraison : {{ livraison }}</p>
</template>
```

## Liste déroulante (select)

```vue
<script setup>
import { ref } from 'vue'

const pays = ref('')
const listePays = [
  { code: 'fr', nom: 'France' },
  { code: 'be', nom: 'Belgique' },
  { code: 'ch', nom: 'Suisse' },
]
</script>

<template>
  <select v-model="pays">
    <option disabled value="">Choisis un pays</option>
    <option v-for="p in listePays" :key="p.code" :value="p.code">{{ p.nom }}</option>
  </select>
</template>
```

> [!TIP]
> Ajoute une première option `disabled value=""` : sans elle, sur iOS, l'utilisateur ne peut pas choisir la première option quand la valeur de départ ne correspond à aucune option.

Avec l'attribut `multiple`, la ref doit être un tableau : `<select v-model="choix" multiple>`.

## Les modificateurs de v-model

| Modificateur | Effet |
|--------------|-------|
| `.trim` | enlève les espaces au début et à la fin |
| `.number` | convertit la saisie en nombre (avec `parseFloat`) |
| `.lazy` | met à jour à l'événement `change` (quand on quitte le champ) au lieu de chaque frappe |

```vue
<input v-model.trim="nom" />
<input v-model.number="quantite" type="text" inputmode="numeric" />
<input v-model.lazy="recherche" />
```

> [!NOTE]
> Sur un `<input type="number">`, Vue convertit déjà la valeur en nombre. `.number` sert surtout pour un champ texte ou un `<select>`. Si la saisie n'est pas un nombre (par exemple un champ vide), la valeur reste une chaîne.

## Relier label et champ avec useId()

Un `<label for="...">` doit pointer vers l'`id` du champ. Si le composant est utilisé plusieurs fois, l'`id` doit être unique. `useId()` (Vue 3.5) génère un identifiant unique.

```vue
<script setup>
import { ref, useId } from 'vue'

const id = useId()
const email = ref('')
</script>

<template>
  <label :for="id">E-mail</label>
  <input :id v-model="email" type="email" />
</template>
```

## Envoyer le formulaire

Écoute l'événement `submit` sur le `<form>`, avec `.prevent` pour éviter le rechargement de la page.

```vue
<script setup>
import { reactive } from 'vue'

const form = reactive({ email: '', message: '' })

async function envoyer() {
  await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  Object.assign(form, { email: '', message: '' }) // vide le formulaire
}
</script>

<template>
  <form @submit.prevent="envoyer">
    <input v-model.trim="form.email" type="email" />
    <textarea v-model="form.message"></textarea>
    <button type="submit">Envoyer</button>
  </form>
</template>
```

Avec `@submit`, l'envoi marche aussi avec la touche Entrée dans un champ.

> [!TIP]
> `reactive()` convient bien à un formulaire : tu écris `form.email` sans `.value`. Pour le vider, utilise `Object.assign(form, {...})` et pas `form = reactive({...})`.

## Valider avec un computed

Les erreurs dépendent des valeurs du formulaire : c'est une valeur dérivée, donc un `computed`.

```vue
<script setup>
import { reactive, ref, computed } from 'vue'

const form = reactive({ nom: '', email: '', age: null })
const tentative = ref(false) // l'utilisateur a-t-il déjà essayé d'envoyer ?

const erreurs = computed(() => {
  const e = {}
  if (!form.nom) e.nom = 'Le nom est obligatoire.'
  if (!form.email.includes('@')) e.email = "L'e-mail n'est pas valide."
  if (!form.age || form.age < 18) e.age = 'Tu dois avoir 18 ans ou plus.'
  return e
})
const estValide = computed(() => Object.keys(erreurs.value).length === 0)

function envoyer() {
  tentative.value = true
  if (!estValide.value) return
  console.log('Envoi', { ...form })
}
</script>

<template>
  <form @submit.prevent="envoyer">
    <input v-model.trim="form.nom" placeholder="Nom" />
    <p v-if="tentative && erreurs.nom" class="erreur">{{ erreurs.nom }}</p>

    <input v-model.trim="form.email" type="email" placeholder="E-mail" />
    <p v-if="tentative && erreurs.email" class="erreur">{{ erreurs.email }}</p>

    <input v-model="form.age" type="number" placeholder="Âge" />
    <p v-if="tentative && erreurs.age" class="erreur">{{ erreurs.age }}</p>

    <button type="submit">Créer mon compte</button>
  </form>
</template>
```

La ref `tentative` évite d'afficher des erreurs en rouge avant que l'utilisateur ait commencé.

> [!NOTE]
> Pour de gros formulaires, des bibliothèques comme VeeValidate ou FormKit existent. Pour la plupart des cas, un `computed` suffit.

## Pièges fréquents

- **Mettre `value="..."` ou `checked` dans le HTML** : `v-model` les ignore. Donne la valeur de départ dans la ref.
- **Initialiser un groupe de cases avec autre chose qu'un tableau** : `ref('')` au lieu de `ref([])` donne un booléen, pas une liste.
- **Oublier `.prevent` sur `@submit`** : la page se recharge et l'état est perdu.
- **Écrire `<textarea>{{ texte }}</textarea>`** : utilise `v-model`.
- **Croire que `.number` donne toujours un nombre** : un champ vide donne `''`. Vérifie dans ta validation.
- **Faire `v-model` sur une prop** : les props sont en lecture seule. Utilise `defineModel` (leçon 5).

## Résumé

- `v-model` relie un champ à l'état dans les deux sens. La ref est la source de vérité.
- Case seule → booléen. Plusieurs cases avec le même `v-model` → tableau des `value` cochées.
- Radio et select → la `value` de l'option choisie.
- `.trim` nettoie, `.number` convertit, `.lazy` attend l'événement `change`.
- `useId()` donne un `id` unique pour relier `<label for>` et le champ.
- `@submit.prevent="envoyer"` sur le `<form>`.
- Les erreurs de validation sont un `computed` ; le bouton peut être `:disabled` tant qu'il y en a.

## Pour pratiquer

Fais l'exercice [Formulaire d'inscription](#/vue/exercice/04-inscription), puis le TP [Formulaire d'inscription validé](#/vue/tp/04-formulaire-inscription).
