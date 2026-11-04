export default {
  id: '05-carte-produit',
  titre: 'Carte produit : props et événement',
  type: 'vue',
  consigne: `Écris le composant enfant \`CarteProduit\`. Le parent l'utilisera ainsi :

\`\`\`vue
<CarteProduit nom="Clavier" :prix="50" :stock="3" en-promo @ajouter="ajouterAuPanier" />
\`\`\`

1. Déclare les props avec \`defineProps\` :
   - \`nom\` : \`String\`, obligatoire ;
   - \`prix\` : \`Number\`, obligatoire ;
   - \`stock\` : \`Number\`, \`0\` par défaut ;
   - \`enPromo\` : \`Boolean\`, \`false\` par défaut.
2. Déclare l'événement \`ajouter\` avec \`defineEmits\`.
3. Complète le computed \`prixAffiche\` : −20 % si \`enPromo\`, avec 2 décimales (\`toFixed(2)\`).
4. Dans \`.stock\`, affiche \`En stock : 3\` si le stock est positif, sinon \`Rupture\`.
5. Le bouton est désactivé quand le stock vaut 0. Un clic émet \`ajouter\` avec le **nom** du produit.`,
  depart: `<script setup>
import { computed } from 'vue'

// TODO 1 : déclare les props avec defineProps
//   nom (String, obligatoire), prix (Number, obligatoire),
//   stock (Number, 0 par défaut), enPromo (Boolean, false par défaut)
const props = {}

// TODO 2 : déclare l'événement « ajouter » avec defineEmits

// TODO 3 : prix final (−20 % si enPromo), avec 2 décimales
const prixAffiche = computed(() => '0.00')

function ajouter() {
  // TODO 5 : émets « ajouter » avec le nom du produit
}
</script>

<template>
  <article class="carte">
    <h3>{{ props.nom }}</h3>
    <p class="prix">{{ prixAffiche }} €</p>
    <!-- TODO 4 : « En stock : 3 » si stock > 0, sinon « Rupture » -->
    <p class="stock"></p>
    <!-- TODO 5 : désactive le bouton si le stock vaut 0 -->
    <button @click="ajouter">Ajouter au panier</button>
  </article>
</template>

<style scoped>
.carte {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  max-width: 220px;
}
</style>
`,
  solution: `<script setup>
import { computed } from 'vue'

const props = defineProps({
  nom: { type: String, required: true },
  prix: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  enPromo: { type: Boolean, default: false },
})

const emit = defineEmits(['ajouter'])

const prixAffiche = computed(() => {
  const prix = props.enPromo ? props.prix * 0.8 : props.prix
  return prix.toFixed(2)
})

function ajouter() {
  emit('ajouter', props.nom)
}
</script>

<template>
  <article class="carte">
    <h3>{{ nom }}</h3>
    <p class="prix">{{ prixAffiche }} €</p>
    <p class="stock">{{ stock > 0 ? 'En stock : ' + stock : 'Rupture' }}</p>
    <button :disabled="stock === 0" @click="ajouter">Ajouter au panier</button>
  </article>
</template>

<style scoped>
.carte {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  max-width: 220px;
}
</style>
`,
  indices: [
    'defineProps({ stock: { type: Number, default: 0 } }) donne une valeur par défaut.',
    'const emit = defineEmits([\'ajouter\']) puis emit(\'ajouter\', props.nom).',
    'Dans le template, les props sont accessibles directement : {{ nom }}, :disabled="stock === 0".',
  ],
  tests: [
    {
      nom: 'Affiche le nom et le prix reçus en props',
      run: async (t) => {
        const w = await t.mount({ nom: 'Clavier', prix: 50, stock: 3 });
        t.expect(w.get('h3').text()).toBe('Clavier');
        t.expect(w.get('.prix').text()).toBe('50.00 €');
      },
    },
    {
      nom: 'Applique −20 % quand enPromo est vrai',
      run: async (t) => {
        const w = await t.mount({ nom: 'Clavier', prix: 50, stock: 3, enPromo: true });
        t.expect(w.get('.prix').text()).toBe('40.00 €');
      },
    },
    {
      nom: 'Affiche le stock, ou « Rupture » par défaut',
      aide: 'La prop stock vaut 0 par défaut : default: 0.',
      run: async (t) => {
        const w = await t.mount({ nom: 'Clavier', prix: 50, stock: 3 });
        t.expect(w.get('.stock').text()).toBe('En stock : 3');
        const w2 = await t.mount({ nom: 'Souris', prix: 20 });
        t.expect(w2.get('.stock').text()).toBe('Rupture');
        t.expect(w2.get('button').disabled).toBe(true);
      },
    },
    {
      nom: 'Émet « ajouter » avec le nom du produit',
      aide: 'Déclare l\'événement avec defineEmits, puis appelle emit(\'ajouter\', props.nom).',
      run: async (t) => {
        const onAjouter = t.fn();
        const w = await t.mount({ nom: 'Clavier', prix: 50, stock: 3, onAjouter });
        await w.get('button').click();
        t.expect(onAjouter).toHaveBeenCalledTimes(1);
        t.expect(onAjouter).toHaveBeenCalledWith('Clavier');
      },
    },
    {
      nom: 'Se met à jour quand le parent change une prop',
      run: async (t) => {
        const w = await t.mount({ nom: 'Clavier', prix: 50, stock: 3 });
        await w.setProps({ stock: 0, prix: 45 });
        t.expect(w.get('.stock').text()).toBe('Rupture');
        t.expect(w.get('.prix').text()).toBe('45.00 €');
        t.expect(w.get('button').disabled).toBe(true);
      },
    },
  ],
};
