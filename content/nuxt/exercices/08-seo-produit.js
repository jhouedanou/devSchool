export default {
  id: '08-seo-produit',
  titre: 'Les balises SEO d\'une fiche produit',
  type: 'nuxt',
  consigne: `Tu écris la page \`app/pages/produits/[id].vue\` d'une boutique. Les moteurs de recherche doivent voir le bon titre.

1. Charge le produit avec \`await useFetch<Produit>(…)\`. L'URL utilise l'id de la route : \`/api/produits/7\` pour la page \`/produits/7\`.
2. Calcule \`titre\` avec \`computed()\` : \`'Vélo de ville | Boutique'\` si le produit existe, sinon \`'Produit introuvable | Boutique'\`.
3. Appelle \`useSeoMeta()\` avec \`title\`, \`description\` et \`ogTitle\`.

> Simulation : les tests fournissent la route et l'API, puis lisent le titre de la page (\`<title>\`). La simulation accepte une valeur simple, une \`ref\` ou un \`computed\`, mais pas une fonction (\`title: () => …\`), pourtant valide dans Nuxt : utilise ici le \`computed\` \`titre\`.`,
  depart: `<script setup lang="ts">
type Produit = { id: number; nom: string; description: string; prix: number }

const route = useRoute()

// TODO 1 : charge le produit avec useFetch et l'id de la route
const produit = ref<Produit | undefined>(undefined)

// TODO 2 : « Nom | Boutique » ou « Produit introuvable | Boutique »
const titre = computed(() => '')

// TODO 3 : useSeoMeta({ title, description, ogTitle })
</script>

<template>
  <main>
    <article v-if="produit">
      <h1>{{ produit.nom }}</h1>
      <p>{{ produit.description }}</p>
      <p class="prix">{{ produit.prix }} €</p>
    </article>
    <p v-else class="introuvable">Produit introuvable.</p>
  </main>
</template>
`,
  solution: `<script setup lang="ts">
type Produit = { id: number; nom: string; description: string; prix: number }

const route = useRoute()

const { data: produit } = await useFetch<Produit>(\`/api/produits/\${route.params.id}\`)

const titre = computed(() =>
  produit.value ? \`\${produit.value.nom} | Boutique\` : 'Produit introuvable | Boutique',
)

useSeoMeta({
  title: titre,
  description: computed(() => produit.value?.description ?? ''),
  ogTitle: titre,
})
</script>

<template>
  <main>
    <article v-if="produit">
      <h1>{{ produit.nom }}</h1>
      <p>{{ produit.description }}</p>
      <p class="prix">{{ produit.prix }} €</p>
    </article>
    <p v-else class="introuvable">Produit introuvable.</p>
  </main>
</template>
`,
  indices: [
    'Construis l\'URL avec une chaîne modèle : `/api/produits/${route.params.id}`.',
    'useSeoMeta accepte des valeurs réactives : passe directement le computed titre.',
  ],
  tests: [
    {
      nom: 'Charge le produit de l\'URL',
      aide: 'Utilise route.params.id dans l\'URL de useFetch.',
      run: async (t) => {
        t.nuxt.route.params.id = '7';
        const appels = t.mockFetch({
          '/api/produits/7': { id: 7, nom: 'Vélo de ville', description: 'Un vélo léger.', prix: 450 },
        });
        const w = await t.mount();
        t.expect(appels.length).toBeGreaterThan(0);
        t.expect(appels[0].url).toContain('/api/produits/7');
        t.expect(w.get('h1').text()).toBe('Vélo de ville');
      },
    },
    {
      nom: 'Le titre de la page contient le nom du produit',
      aide: 'Appelle useSeoMeta({ title: titre, … }) avec « Nom | Boutique ».',
      run: async (t) => {
        t.nuxt.route.params.id = '7';
        t.mockFetch({
          '/api/produits/7': { id: 7, nom: 'Vélo de ville', description: 'Un vélo léger.', prix: 450 },
        });
        await t.mount();
        t.expect(t.nuxt.head.title).toBe('Vélo de ville | Boutique');
      },
    },
    {
      nom: 'Titre de secours si le produit n\'existe pas',
      aide: 'Si produit.value est vide (API en 404), le titre vaut « Produit introuvable | Boutique ».',
      run: async (t) => {
        t.nuxt.route.params.id = '999';
        t.mockFetch({});
        const w = await t.mount();
        t.expect(w.find('.introuvable').exists()).toBe(true);
        t.expect(t.nuxt.head.title).toBe('Produit introuvable | Boutique');
      },
    },
  ],
};
