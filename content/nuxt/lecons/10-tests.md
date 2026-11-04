# Tester une app Nuxt

## Objectifs

- Connaître les trois sortes de tests d'une app Nuxt : unitaires, Nuxt, de bout en bout.
- Configurer Vitest avec `@nuxt/test-utils`.
- Monter un composant avec `mountSuspended`.
- Simuler une API avec `registerEndpoint` et un auto-import avec `mockNuxtImport`.
- Écrire un test de bout en bout avec `setup` et `$fetch`.

## Trois sortes de tests

| Sorte | Teste | Environnement | Outils |
|-------|-------|---------------|--------|
| Unitaire | une fonction pure (`shared/utils`, validation, calcul) | `node` | Vitest seul |
| Nuxt | un composant, un composable, une page | `nuxt` (Nuxt dans un faux DOM) | `mountSuspended`, `mockNuxtImport`, `registerEndpoint` |
| Bout en bout (e2e) | l'app construite, vue de l'extérieur | `node` + vrai serveur | `setup`, `$fetch`, `createPage` |

L'environnement **nuxt** démarre une app Nuxt dans **happy-dom**, un faux navigateur en JavaScript. Les auto-imports, les plugins et `useFetch` y marchent comme dans l'app.

## Installer

```bash
npm i -D @nuxt/test-utils vitest @vue/test-utils happy-dom playwright-core
```

`playwright-core` ne sert qu'aux tests e2e qui pilotent un navigateur.

Range les tests par sorte :

```text
test/
├─ unit/
│  └─ prix.test.ts
├─ nuxt/
│  ├─ ListeTaches.test.ts
│  └─ usePanier.test.ts
└─ e2e/
   └─ api.test.ts
```

Puis crée `vitest.config.ts`, avec un **projet** Vitest par sorte :

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: { name: 'unit', include: ['test/unit/*.{test,spec}.ts'], environment: 'node' },
      },
      {
        test: { name: 'e2e', include: ['test/e2e/*.{test,spec}.ts'], environment: 'node' },
      },
      await defineVitestProject({
        test: { name: 'nuxt', include: ['test/nuxt/*.{test,spec}.ts'], environment: 'nuxt' },
      }),
    ],
  },
})
```

Le `package.json` doit contenir `"type": "module"` (ou nomme le fichier `vitest.config.mts`).

```bash
npx vitest                 # tous les tests, en mode surveillance
npx vitest run             # une seule passe (pour la CI)
npx vitest --project nuxt  # seulement les tests Nuxt
```

> [!WARNING]
> Choisis l'environnement avec le dossier (le `include` du projet). N'utilise pas le commentaire `// @vitest-environment nuxt` : il change l'environnement sans ajouter les plugins de Nuxt.

> [!TIP]
> Ajoute `'@nuxt/test-utils/module'` aux `modules` de `nuxt.config.ts` pour lancer tes tests depuis les Nuxt DevTools. C'est facultatif.

## Un test unitaire

Une fonction pure se teste sans Nuxt, donc très vite.

```ts
// test/unit/prix.test.ts
import { describe, expect, it } from 'vitest'
import { calculerTotal } from '../../shared/utils/calculerTotal'

describe('calculerTotal', () => {
  it('additionne les prix', () => {
    expect(calculerTotal([{ prix: 4 }, { prix: 3 }])).toBe(7)
  })
})
```

## Monter un composant : `mountSuspended`

`mountSuspended` monte un composant dans l'environnement Nuxt. Il attend le `setup` asynchrone (`await useFetch(…)`) et renvoie un wrapper de Vue Test Utils (`find`, `text`, `trigger`…).

```ts
// test/nuxt/ListeTaches.test.ts
import { describe, expect, it } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import ListeTaches from '~/components/ListeTaches.vue'

// Fausse route Nitro : useFetch('/api/taches') reçoit ces données.
registerEndpoint('/api/taches', () => [
  { id: 1, titre: 'Lire la doc', faite: false },
  { id: 2, titre: 'Écrire un test', faite: false },
])

describe('ListeTaches', () => {
  it('affiche les tâches de l\'API', async () => {
    const wrapper = await mountSuspended(ListeTaches)
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.text()).toContain('Lire la doc')
  })
})
```

Pour une page, passe la route de départ :

```ts
import PageProduit from '~/pages/produits/[id].vue'

const wrapper = await mountSuspended(PageProduit, { route: '/produits/3' })
expect(wrapper.find('h1').text()).toBe('Produit n° 3')
```

`registerEndpoint` accepte aussi un objet pour une autre méthode :

```ts
registerEndpoint('/api/taches', {
  method: 'POST',
  handler: () => ({ id: 3, titre: 'Nouvelle', faite: false }),
})
```

## Simuler un auto-import : `mockNuxtImport`

`mockNuxtImport` remplace une fonction auto-importée (un composable de Nuxt ou un des tiens) dans tout le fichier de test. Exemple : un composable `useAujourdhui()` qui renvoie la date du jour, à figer pour le test.

```ts
// test/nuxt/BandeauDate.test.ts
import { expect, it } from 'vitest'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import BandeauDate from '~/components/BandeauDate.vue'

mockNuxtImport('useAujourdhui', () => {
  return () => '2026-11-04'
})

it('affiche la date du jour', async () => {
  const wrapper = await mountSuspended(BandeauDate)
  expect(wrapper.text()).toContain('2026-11-04')
})
```

`mockNuxtImport` est remonté en haut du fichier (comme `vi.mock`). Conséquences : un seul appel par fonction et par fichier, et aucune variable extérieure dans la fabrique. Pour changer le comportement d'un test à l'autre, crée le faux avec `vi.hoisted` :

```ts
// test/nuxt/MenuCompte.test.ts
import { expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import MenuCompte from '~/components/MenuCompte.vue'

const { useUtilisateurMock } = vi.hoisted(() => ({ useUtilisateurMock: vi.fn() }))
mockNuxtImport('useUtilisateur', () => useUtilisateurMock)

it('montre le menu admin à un admin', async () => {
  useUtilisateurMock.mockReturnValue(ref({ nom: 'Ada', role: 'admin' }))
  const wrapper = await mountSuspended(MenuCompte)
  expect(wrapper.find('.admin').exists()).toBe(true)
})

it('cache le menu admin à un membre', async () => {
  useUtilisateurMock.mockReturnValue(ref({ nom: 'Léa', role: 'membre' }))
  const wrapper = await mountSuspended(MenuCompte)
  expect(wrapper.find('.admin').exists()).toBe(false)
})
```

Pour remplacer un composant enfant, utilise `mockComponent('NomDuComposant', { … })`.

## Les tests de bout en bout

Un test **e2e** construit l'app, lance un vrai serveur, puis l'interroge comme un visiteur. Il est plus lent, mais il teste tout : pages, API, middlewares.

```ts
// test/e2e/api.test.ts
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('mon app', async () => {
  await setup()   // build + démarrage du serveur

  it('rend la page d\'accueil côté serveur', async () => {
    const html = await $fetch('/')
    expect(html).toContain('Mes tâches')
  })

  it('GET /api/taches renvoie un tableau', async () => {
    const taches = await $fetch('/api/taches')
    expect(Array.isArray(taches)).toBe(true)
  })
})
```

Ici, `$fetch` vient de `@nuxt/test-utils/e2e` : il appelle le serveur de test. Pour une page HTML, il renvoie le texte ; pour une route JSON, l'objet.

Pour cliquer dans un vrai navigateur, active `browser: true` et utilise `createPage` (Playwright) :

```ts
import { createPage, setup } from '@nuxt/test-utils/e2e'

await setup({ browser: true })

it('ajoute une tâche', async () => {
  const page = await createPage('/')
  await page.getByPlaceholder('Nouvelle tâche').fill('Pain')
  await page.getByRole('button', { name: 'Ajouter' }).click()
  await page.getByText('Pain').waitFor()
})
```

Autres options de `setup` : `rootDir` (dossier de l'app), `setupTimeout` (le build peut être long), `host` (tester un serveur déjà lancé).

## Pièges fréquents

- **Mélanger `runtime` et `e2e` dans un fichier.** `@nuxt/test-utils/runtime` (environnement nuxt) et `@nuxt/test-utils/e2e` (environnement node) ne vont pas ensemble. Fais deux fichiers.
- **Oublier `await` devant `mountSuspended`.** Le composant n'est pas encore monté.
- **État partagé entre les tests.** Une seule app Nuxt sert tout le fichier : un `useState` modifié reste modifié. Remets-le à zéro dans un `beforeEach` (par exemple avec `clearNuxtState()`).
- **Variable extérieure dans `mockNuxtImport`.** La fabrique est remontée en haut du fichier. Utilise `vi.hoisted`.
- **Tester un détail interne.** Teste ce que voit l'utilisateur (texte, liens, réponses de l'API), pas les variables du composant.
- **Lancer les e2e à chaque sauvegarde.** Ils reconstruisent l'app : garde-les pour la CI ou utilise `--project unit` et `--project nuxt` en développement.

## Résumé

- Trois projets Vitest : `unit` (node), `nuxt` (`defineVitestProject`, environnement nuxt), `e2e` (node).
- `mountSuspended(Composant, { route })` monte un composant avec Nuxt et attend son `setup` asynchrone.
- `registerEndpoint` simule une route Nitro, `mockNuxtImport` un auto-import, `mockComponent` un composant.
- `setup()` + `$fetch` testent l'app construite. `createPage` pilote un navigateur.
- Les fichiers `runtime` et `e2e` restent séparés.

## Pour pratiquer

Cette leçon n'a pas d'exercice dans le navigateur. Le projet de TP Nuxt est vérifié par Vitest et `@nuxt/test-utils`. Ouvre les tests d'un TP, par exemple [le TP « Afficher les tâches avec useFetch »](#/nuxt/tp/04-usefetch-taches), repère `mountSuspended` et `registerEndpoint`, puis ajoute un test pour le cas d'erreur de l'API.
