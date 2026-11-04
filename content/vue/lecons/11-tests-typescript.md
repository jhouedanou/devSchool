# Tester et typer

## Objectifs

- Installer Vitest et Vue Test Utils.
- Écrire un test de composant : `mount`, `find`, `trigger`, `setValue`, `emitted`.
- Tester du code asynchrone, un composable et un store Pinia.
- Typer un composant avec `<script setup lang="ts">`.
- Typer les props, les événements, les refs et `defineModel`.

## Partie 1 : tester avec Vitest

**Vitest** est un lanceur de tests rapide, basé sur Vite : il lit la même configuration que ton projet. **Vue Test Utils** (VTU) monte un composant dans un faux DOM et permet d'interagir avec lui.

### Installation

Coche « Vitest » dans `npm create vue@latest`. Dans un projet existant :

```bash
npm install -D vitest @vue/test-utils jsdom
```

```js
// vitest.config.js
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom', // un faux navigateur
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
```

Ajoute un script dans `package.json` : `"test:unit": "vitest"`. Lance `npm run test:unit` : Vitest relance les tests à chaque modification.

Les fichiers de test se nomment `*.spec.js` ou `*.test.js`, par exemple `src/components/__tests__/Compteur.spec.js`.

### Un premier test

```js
// src/components/__tests__/Compteur.spec.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Compteur from '../Compteur.vue'

describe('Compteur', () => {
  it('affiche 0 au départ', () => {
    const wrapper = mount(Compteur)
    expect(wrapper.find('.valeur').text()).toBe('0')
  })

  it('ajoute 1 au clic', async () => {
    const wrapper = mount(Compteur)
    await wrapper.find('button.plus').trigger('click')
    expect(wrapper.find('.valeur').text()).toBe('1')
  })
})
```

- `describe` regroupe des tests ; `it` (ou `test`) décrit un comportement ; `expect` vérifie un résultat.
- `mount(Composant)` monte le composant et retourne un **wrapper** (une enveloppe).
- `trigger('click')` déclenche un événement. Il retourne une promesse : **`await`** attend la mise à jour du DOM.

### L'API principale de Vue Test Utils

| Méthode | Rôle |
|---------|------|
| `mount(C, { props, slots })` | monte le composant avec des props et des slots |
| `wrapper.find(sel)` / `get(sel)` | premier élément ; `get` lève une erreur s'il manque |
| `wrapper.findAll(sel)` | tous les éléments |
| `.text()`, `.html()`, `.exists()` | lire le contenu |
| `.classes()`, `.attributes()` | lire les classes et les attributs |
| `await .trigger('click')` | déclencher un événement |
| `await .setValue('Ada')` | remplir un champ (ou cocher une case) |
| `await wrapper.setProps({ … })` | changer les props |
| `wrapper.emitted()` | les événements émis par le composant |

### Props, champs et événements émis

```js
import { mount } from '@vue/test-utils'
import FormulaireTache from '../FormulaireTache.vue'

it('émet « ajout » avec le texte saisi', async () => {
  const wrapper = mount(FormulaireTache, { props: { max: 50 } })

  await wrapper.find('input').setValue('  Acheter du pain ')
  await wrapper.find('form').trigger('submit')

  expect(wrapper.emitted('ajout')).toHaveLength(1)        // émis une fois
  expect(wrapper.emitted('ajout')[0]).toEqual(['Acheter du pain']) // ses arguments
})
```

`wrapper.emitted('ajout')` est un tableau : un élément par émission, et chaque élément est le tableau des arguments.

> [!TIP]
> Teste ce que l'utilisateur **voit et fait** : le texte affiché, les clics, les événements émis. Évite de tester l'état interne du composant : tes tests resteront valides si tu changes l'implémentation.

### Code asynchrone

Quand le composant appelle `fetch`, remplace `fetch` par une fausse fonction avec `vi`, puis attends les promesses avec `flushPromises()`.

```js
import { it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ListeUtilisateurs from '../ListeUtilisateurs.vue'

it('affiche les utilisateurs reçus', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => [{ id: 1, nom: 'Ada' }],
  })))

  const wrapper = mount(ListeUtilisateurs)
  await flushPromises() // attend la fin des promesses en cours

  expect(wrapper.findAll('li')).toHaveLength(1)
  expect(fetch).toHaveBeenCalledWith('/api/utilisateurs')
})
```

`vi.fn()` crée une fonction espion : tu peux vérifier ses appels avec `toHaveBeenCalled()` ou `toHaveBeenCalledWith()`.

### Tester un composable ou un store

Un composable est une fonction : appelle-la directement.

```js
import { useCompteur } from '@/composables/useCompteur'

it('ne dépasse pas le maximum', () => {
  const { compte, incrementer } = useCompteur(0, { max: 1 })
  incrementer()
  incrementer()
  expect(compte.value).toBe(1)
})
```

Pour un store Pinia, crée une Pinia neuve avant chaque test :

```js
import { beforeEach, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePanierStore } from '@/stores/panier'

beforeEach(() => {
  setActivePinia(createPinia())
})

it('ajoute un article', () => {
  const panier = usePanierStore()
  panier.ajouter({ id: 1, nom: 'Clavier', prix: 50 })
  expect(panier.nombre).toBe(1)
})
```

Pour monter un composant qui utilise un store ou le routeur, passe les plugins : `mount(C, { global: { plugins: [createPinia(), router] } })`.

## Partie 2 : typer avec TypeScript

Coche « TypeScript » dans `npm create vue@latest`. Ajoute ensuite `lang="ts"` sur le bloc script.

```vue
<script setup lang="ts">
// ton code TypeScript
</script>
```

> [!IMPORTANT]
> Vite enlève les types mais ne les **vérifie pas**. La vérification se fait dans l'éditeur (extension « Vue - Official ») et avec `vue-tsc` : `npm run type-check`.

### Typer les props

Passe un type à `defineProps` avec `<…>`. Le `?` rend une prop facultative.

```vue
<script setup lang="ts">
interface Produit {
  id: number
  nom: string
  prix: number
}

const { produit, quantite = 1, enPromo = false } = defineProps<{
  produit: Produit
  quantite?: number
  enPromo?: boolean
}>()
</script>
```

Les valeurs par défaut se donnent dans la déstructuration (Vue 3.5). Dans du code plus ancien, tu verras `withDefaults(defineProps<…>(), { quantite: 1 })`.

> [!TIP]
> Range les types partagés dans un fichier, par exemple `src/types.ts`, et importe-les : `import type { Produit } from '@/types'`.

### Typer les événements

Chaque événement est associé à la liste de ses arguments (un tuple nommé) :

```ts
const emit = defineEmits<{
  ajouter: [id: number, quantite: number]
  fermer: []
}>()

emit('ajouter', 3, 1) // ✅
emit('ajouter', '3')  // ❌ erreur de type : '3' n'est pas un nombre
```

### Typer defineModel et les refs

```ts
const quantite = defineModel<number>({ default: 1 })

const compte = ref(0)                     // type déduit : Ref<number>
const utilisateur = ref<Produit | null>(null) // type donné explicitement
const total = computed(() => compte.value * 2) // ComputedRef<number>
```

Donne le type à `ref<…>()` quand la valeur de départ ne suffit pas (`null`, tableau vide). Pour `ref([])`, écris `ref<Produit[]>([])`.

### Typer une template ref

Avec `useTemplateRef`, l'éditeur et `vue-tsc` déduisent le type à partir de l'élément du template. Tu peux aussi le donner :

```ts
const champ = useTemplateRef<HTMLInputElement>('champ')

onMounted(() => {
  champ.value?.focus() // ?. car la valeur peut être null
})
```

### Typer provide / inject

Une clé `InjectionKey` relie le type entre `provide` et `inject` :

```ts
// src/cles.ts
import type { InjectionKey, Ref } from 'vue'

export const CLE_THEME = Symbol('theme') as InjectionKey<Ref<'clair' | 'sombre'>>
```

```ts
provide(CLE_THEME, theme)          // vérifie le type fourni
const theme = inject(CLE_THEME)    // Ref<'clair' | 'sombre'> | undefined
```

> [!NOTE]
> En Vue 2, TypeScript passait par `Vue.extend()` ou les class components (`vue-class-component`). Ces approches sont abandonnées. Avec `<script setup lang="ts">`, l'inférence marche sans configuration.

## Pièges fréquents

- **Oublier `await`** devant `trigger` ou `setValue` : le DOM n'est pas encore à jour quand `expect` s'exécute.
- **Oublier `environment: 'jsdom'`** : erreur « document is not defined ».
- **Ne pas attendre un fetch** : utilise `await flushPromises()` après le montage.
- **Réutiliser la même Pinia entre les tests** : l'état d'un test pollue le suivant. `setActivePinia(createPinia())` dans `beforeEach`.
- **Croire que Vite vérifie les types** : lance `vue-tsc` (ou `npm run type-check`).
- **Écrire `ref(null)` sans type** : la ref sera typée `Ref<null>`. Écris `ref<Type | null>(null)`.
- **Oublier `?.`** sur une template ref : elle vaut `null` avant le montage.

## Résumé

- Vitest lance les tests ; Vue Test Utils monte les composants. Environnement `jsdom`.
- `mount(C, { props, slots })`, puis `find`, `text`, `await trigger`, `await setValue`, `emitted`.
- `vi.fn()` / `vi.stubGlobal()` simulent `fetch` ; `flushPromises()` attend les promesses.
- Un composable se teste en l'appelant ; un store avec `setActivePinia(createPinia())`.
- `<script setup lang="ts">` : `defineProps<{…}>()`, `defineEmits<{ nom: [args] }>()`, `defineModel<T>()`, `ref<T>()`.
- `vue-tsc` vérifie les types ; Vite ne fait que les retirer.

## Pour pratiquer

Le runner du navigateur ne lance pas Vitest : cette leçon n'a pas d'exercice en ligne. Tous les TP du dossier `tp/vue/` sont vérifiés par des tests Vitest + Vue Test Utils. Lis ceux du TP [Compteur borné](#/vue/tp/01-compteur), puis ajoute un test à ceux du TP [Panier avec Pinia](#/vue/tp/06-panier-pinia).
