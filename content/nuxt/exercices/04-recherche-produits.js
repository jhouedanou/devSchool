export default {
  id: '04-recherche-produits',
  titre: 'Une recherche réactive',
  type: 'nuxt',
  consigne: `L'API \`/api/produits?q=…\` renvoie un objet \`{ total, produits }\`. Tu affiches les produits et tu relances la requête quand l'utilisateur tape.

1. Passe une option \`query\` à \`useFetch\` : \`query: computed(() => ({ q: recherche.value }))\`. Quand \`recherche\` change, Nuxt refait la requête.
2. Ajoute \`transform: (reponse) => reponse.produits\` : \`data\` contient alors directement le tableau.
3. Ajoute \`default: () => []\` : la liste vaut \`[]\` tant qu'il n'y a pas de données (et en cas d'erreur).

> Dans un vrai projet, tu peux aussi écrire \`query: { q: recherche }\`. La simulation de cet exercice ne suit pas une ref placée **dans** un objet : utilise la forme avec \`computed\`, valide dans Nuxt aussi.`,
  depart: `<script setup lang="ts">
type Produit = { id: number; nom: string }

const recherche = ref('')

// TODO : ajoute les options query, transform et default
const { data: produits } = await useFetch('/api/produits')
</script>

<template>
  <section>
    <input v-model="recherche" type="search" placeholder="Rechercher un produit">
    <p class="compte">{{ produits.length }} résultat(s)</p>
    <ul>
      <li v-for="produit in produits" :key="produit.id">{{ produit.nom }}</li>
    </ul>
  </section>
</template>
`,
  solution: `<script setup lang="ts">
type Produit = { id: number; nom: string }

const recherche = ref('')

const { data: produits } = await useFetch('/api/produits', {
  query: computed(() => ({ q: recherche.value })),
  transform: (reponse: { total: number; produits: Produit[] }) => reponse.produits,
  default: () => [],
})
</script>

<template>
  <section>
    <input v-model="recherche" type="search" placeholder="Rechercher un produit">
    <p class="compte">{{ produits.length }} résultat(s)</p>
    <ul>
      <li v-for="produit in produits" :key="produit.id">{{ produit.nom }}</li>
    </ul>
  </section>
</template>
`,
  indices: [
    'Les options sont le 2e argument : `useFetch(\'/api/produits\', { query, transform, default })`.',
    '`transform` reçoit la réponse brute et renvoie ce que tu veux garder dans `data`.',
    '`default` est une fonction : `default: () => []`.',
  ],
  tests: [
    {
      nom: 'Affiche les produits (grâce à transform)',
      aide: 'L\'API renvoie `{ total, produits }`. Avec `transform: (r) => r.produits`, `data` devient le tableau.',
      run: async (t) => {
        t.mockFetch(() => ({
          total: 3,
          produits: [{ id: 1, nom: 'Vélo' }, { id: 2, nom: 'Casque' }, { id: 3, nom: 'Gourde' }],
        }));
        const w = await t.mount();
        t.expect(w.findAll('li')).toHaveLength(3);
        t.expect(w.get('.compte').text()).toBe('3 résultat(s)');
      },
    },
    {
      nom: 'Envoie la recherche dans ?q=',
      aide: 'Ajoute `query: computed(() => ({ q: recherche.value }))`.',
      run: async (t) => {
        const appels = t.mockFetch(() => ({ total: 0, produits: [] }));
        await t.mount();
        const url = new URL(appels[0].url, 'http://x');
        t.expect(url.pathname).toBe('/api/produits');
        t.expect(url.searchParams.has('q')).toBe(true);
      },
    },
    {
      nom: 'Taper dans le champ relance la requête',
      aide: 'La `query` doit être réactive (`computed`) pour que Nuxt la surveille.',
      run: async (t) => {
        const tous = [{ id: 1, nom: 'Vélo' }, { id: 2, nom: 'Casque vélo' }, { id: 3, nom: 'Gourde' }];
        const appels = t.mockFetch((url) => {
          const q = new URL(url, 'http://x').searchParams.get('q') || '';
          const produits = tous.filter((p) => p.nom.toLowerCase().includes(q.toLowerCase()));
          return { total: produits.length, produits };
        });
        const w = await t.mount();
        await w.get('input').setValue('vélo');
        await t.wait(() => {
          const urls = appels.map((a) => new URL(a.url, 'http://x').searchParams.get('q'));
          t.expect(urls).toContain('vélo');
          t.expect(w.findAll('li')).toHaveLength(2);
        });
      },
    },
    {
      nom: 'Valeur par défaut si l\'API échoue',
      aide: 'Ajoute `default: () => []` : `data` vaut alors `[]` au lieu de `undefined`.',
      run: async (t) => {
        t.mockFetch(() => t.reponse({ message: 'Erreur serveur' }, 500));
        const w = await t.mount();
        t.expect(w.get('.compte').text()).toBe('0 résultat(s)');
      },
    },
  ],
};
