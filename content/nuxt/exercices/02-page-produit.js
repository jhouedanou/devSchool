export default {
  id: '02-page-produit',
  titre: 'Une page produit dynamique',
  type: 'nuxt',
  consigne: `Tu écris la page \`app/pages/produits/[id].vue\`. Nuxt l'affiche pour les URL \`/produits/1\`, \`/produits/2\`, etc.

1. Récupère la route avec \`useRoute()\`. Pas d'import : la fonction est auto-importée.
2. Calcule \`id\` avec \`computed()\` : c'est le **nombre** contenu dans \`route.params.id\`.
3. Ajoute un \`<NuxtLink>\` avec la classe \`suivant\` vers le produit suivant (\`/produits/4\` si tu es sur \`/produits/3\`).
4. Dans \`retour()\`, va sur \`/produits\` avec \`navigateTo()\`.

> Simulation : il n'y a qu'un fichier et pas de vrai routeur. Les tests choisissent l'URL (par exemple \`/produits/3\`) et observent les navigations.`,
  depart: `<script setup lang="ts">
// Fichier : app/pages/produits/[id].vue

// TODO 1 : récupère la route avec useRoute()

// TODO 2 : calcule l'id (un nombre) à partir de route.params.id
const id = 0

function retour() {
  // TODO 4 : va sur /produits avec navigateTo()
}
</script>

<template>
  <article>
    <h1>Produit n° {{ id }}</h1>
    <!-- TODO 3 : un <NuxtLink> (classe « suivant ») vers le produit suivant -->
    <button type="button" @click="retour">Retour à la liste</button>
  </article>
</template>
`,
  solution: `<script setup lang="ts">
// Fichier : app/pages/produits/[id].vue
const route = useRoute()

const id = computed(() => Number(route.params.id))

function retour() {
  navigateTo('/produits')
}
</script>

<template>
  <article>
    <h1>Produit n° {{ id }}</h1>
    <NuxtLink :to="\`/produits/\${id + 1}\`" class="suivant">Produit suivant</NuxtLink>
    <button type="button" @click="retour">Retour à la liste</button>
  </article>
</template>
`,
  indices: [
    '`route.params.id` est une chaîne : `"3" + 1` donne `"31"`. Convertis avec `Number()`.',
    'Pour un lien dynamique, lie `to` avec une chaîne modèle : `` <NuxtLink :to="`/produits/${id + 1}`"> ``.',
    '`navigateTo()` est auto-importé : appelle-le directement dans `retour()`.',
  ],
  tests: [
    {
      nom: 'Affiche le numéro du produit de l\'URL',
      aide: 'Lis `route.params.id` avec `useRoute()`.',
      run: async (t) => {
        t.nuxt.route.params.id = '3';
        const w = await t.mount();
        t.expect(w.get('h1').text()).toBe('Produit n° 3');
      },
    },
    {
      nom: 'Le lien « suivant » pointe vers /produits/4',
      aide: 'Convertis l\'id en nombre avant de faire `+ 1`, sinon tu obtiens `/produits/31`.',
      run: async (t) => {
        t.nuxt.route.params.id = '3';
        const w = await t.mount();
        t.expect(w.get('a.suivant').attributes('href')).toBe('/produits/4');
      },
    },
    {
      nom: 'Le lien utilise <NuxtLink> (navigation sans rechargement)',
      aide: 'Remplace la balise `<a>` par `<NuxtLink :to="…">`.',
      run: async (t) => {
        t.nuxt.route.params.id = '7';
        const w = await t.mount();
        // On bloque le rechargement d'une balise <a> classique.
        const bloquer = (e) => e.preventDefault();
        t.document.addEventListener('click', bloquer, true);
        try {
          await w.get('a.suivant').click();
        } finally {
          t.document.removeEventListener('click', bloquer, true);
        }
        t.expect(t.nuxt.navigations).toContain('/produits/8');
      },
    },
    {
      nom: 'Le bouton « Retour » navigue vers /produits',
      aide: 'Dans `retour()`, appelle `navigateTo(\'/produits\')`.',
      run: async (t) => {
        t.nuxt.route.params.id = '3';
        const w = await t.mount();
        await w.findByText('Retour', 'button').click();
        t.expect(t.nuxt.navigations).toEqual(['/produits']);
      },
    },
  ],
};
