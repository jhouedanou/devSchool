export default {
  id: '05-panier-partage',
  titre: 'Un panier partagé avec useState',
  type: 'nuxt',
  consigne: `Le panier doit être le même dans toute l'app (en-tête, page produit, page panier). Une \`ref\` locale ne suffit pas.

1. Remplace la \`ref\` par \`useState<Article[]>('panier', () => [])\`. La clé \`'panier'\` identifie l'état partagé.
2. Calcule \`total\` (somme des prix) avec \`computed()\`.
3. \`ajouter(article)\` ajoute l'article au panier.
4. \`vider()\` remet le panier à \`[]\`.

> Dans un vrai projet, tu ranges l'état dans un composable : \`app/composables/usePanier.ts\` avec \`export const usePanier = () => useState('panier', () => [])\`. Ici, tout est dans un seul fichier.`,
  depart: `<script setup lang="ts">
type Article = { id: number; nom: string; prix: number }

const catalogue: Article[] = [
  { id: 1, nom: 'Café', prix: 4 },
  { id: 2, nom: 'Thé', prix: 3 },
]

// TODO 1 : remplace cette ref locale par useState('panier', …)
const panier = ref<Article[]>([])

// TODO 2 : calcule le total avec computed()
const total = 0

function ajouter(article: Article) {
  // TODO 3
}

function vider() {
  // TODO 4
}
</script>

<template>
  <section>
    <ul class="catalogue">
      <li v-for="article in catalogue" :key="article.id">
        {{ article.nom }} ({{ article.prix }} €)
        <button type="button" @click="ajouter(article)">Ajouter {{ article.nom }}</button>
      </li>
    </ul>
    <p class="compteur">{{ panier.length }} article(s)</p>
    <p class="total">Total : {{ total }} €</p>
    <button type="button" class="vider" @click="vider">Vider</button>
  </section>
</template>
`,
  solution: `<script setup lang="ts">
type Article = { id: number; nom: string; prix: number }

const catalogue: Article[] = [
  { id: 1, nom: 'Café', prix: 4 },
  { id: 2, nom: 'Thé', prix: 3 },
]

const panier = useState<Article[]>('panier', () => [])

const total = computed(() => panier.value.reduce((somme, a) => somme + a.prix, 0))

function ajouter(article: Article) {
  panier.value.push(article)
}

function vider() {
  panier.value = []
}
</script>

<template>
  <section>
    <ul class="catalogue">
      <li v-for="article in catalogue" :key="article.id">
        {{ article.nom }} ({{ article.prix }} €)
        <button type="button" @click="ajouter(article)">Ajouter {{ article.nom }}</button>
      </li>
    </ul>
    <p class="compteur">{{ panier.length }} article(s)</p>
    <p class="total">Total : {{ total }} €</p>
    <button type="button" class="vider" @click="vider">Vider</button>
  </section>
</template>
`,
  indices: [
    '`useState` renvoie une ref : lis et modifie `panier.value` dans le script.',
    'Pour le total : `panier.value.reduce((somme, a) => somme + a.prix, 0)`.',
  ],
  tests: [
    {
      nom: 'Le panier est un état useState avec la clé « panier »',
      aide: 'Écris `const panier = useState(\'panier\', () => [])`.',
      run: async (t) => {
        await t.mount();
        t.expect(t.nuxt.etats.panier).toBeDefined();
        t.expect(Array.isArray(t.nuxt.etats.panier.value)).toBe(true);
      },
    },
    {
      nom: 'Ajouter met à jour le compteur et le total',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('Ajouter Café', 'button').click();
        await w.findByText('Ajouter Thé', 'button').click();
        t.expect(w.get('.compteur').text()).toBe('2 article(s)');
        t.expect(w.get('.total').text()).toBe('Total : 7 €');
      },
    },
    {
      nom: 'Le panier est partagé avec les autres composants',
      aide: 'Un autre composant a déjà rempli `useState(\'panier\')`. Ta page doit lire ce même état.',
      run: async (t) => {
        t.window.useState('panier', () => [{ id: 9, nom: 'Gâteau', prix: 5 }]);
        const w = await t.mount();
        t.expect(w.get('.compteur').text()).toBe('1 article(s)');
        t.expect(w.get('.total').text()).toBe('Total : 5 €');
      },
    },
    {
      nom: '« Vider » remet le panier à zéro',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('Ajouter Café', 'button').click();
        await w.get('button.vider').click();
        t.expect(w.get('.compteur').text()).toBe('0 article(s)');
        t.expect(t.nuxt.etats.panier.value).toHaveLength(0);
      },
    },
  ],
};
