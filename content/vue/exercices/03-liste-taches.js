export default {
  id: '03-liste-taches',
  titre: 'Liste de tâches filtrée',
  type: 'vue',
  consigne: `Les données sont prêtes : \`taches\`, \`filtre\` et le computed \`tachesVisibles\`. Il reste le template.

1. Affiche chaque tâche de \`tachesVisibles\` dans un \`<li>\` avec \`v-for\` et \`:key="tache.id"\`.
2. Ajoute la classe \`faite\` au \`<li>\` quand \`tache.faite\` est vrai (\`:class\`).
3. Un clic sur le \`<li>\` inverse \`tache.faite\` (\`@click\`).
4. Crée un bouton par filtre avec \`v-for\` sur \`filtres\`. Un clic change \`filtre\`. Le bouton du filtre actif a la classe \`actif\`.
5. Si \`tachesVisibles\` est vide, affiche \`<p class="vide">Aucune tâche.</p>\` **à la place** de la liste (\`v-if\` / \`v-else\`).`,
  depart: `<script setup>
import { ref, computed } from 'vue'

const taches = ref([
  { id: 1, texte: 'Lire la doc de Vue', faite: true },
  { id: 2, texte: 'Installer Vite', faite: false },
  { id: 3, texte: 'Écrire un composant', faite: false },
])

const filtres = [
  { valeur: 'toutes', libelle: 'Toutes' },
  { valeur: 'a-faire', libelle: 'À faire' },
  { valeur: 'faites', libelle: 'Faites' },
]
const filtre = ref('toutes')

const tachesVisibles = computed(() => {
  if (filtre.value === 'a-faire') return taches.value.filter((t) => !t.faite)
  if (filtre.value === 'faites') return taches.value.filter((t) => t.faite)
  return taches.value
})
</script>

<template>
  <div class="taches">
    <nav class="filtres">
      <!-- TODO 4 : un bouton par filtre (v-for), @click pour changer filtre,
           classe « actif » sur le filtre en cours -->
      <button>Toutes</button>
    </nav>

    <!-- TODO 5 : ce paragraphe seulement si la liste est vide (v-if),
         sinon la liste (v-else) -->
    <p class="vide">Aucune tâche.</p>

    <ul class="liste">
      <!-- TODO 1, 2, 3 : un <li> par tâche visible, avec :key, :class et @click -->
      <li>Une tâche</li>
    </ul>
  </div>
</template>

<style scoped>
li {
  cursor: pointer;
}
.faite {
  text-decoration: line-through;
  color: #888;
}
.actif {
  background: #42b883;
  color: white;
}
</style>
`,
  solution: `<script setup>
import { ref, computed } from 'vue'

const taches = ref([
  { id: 1, texte: 'Lire la doc de Vue', faite: true },
  { id: 2, texte: 'Installer Vite', faite: false },
  { id: 3, texte: 'Écrire un composant', faite: false },
])

const filtres = [
  { valeur: 'toutes', libelle: 'Toutes' },
  { valeur: 'a-faire', libelle: 'À faire' },
  { valeur: 'faites', libelle: 'Faites' },
]
const filtre = ref('toutes')

const tachesVisibles = computed(() => {
  if (filtre.value === 'a-faire') return taches.value.filter((t) => !t.faite)
  if (filtre.value === 'faites') return taches.value.filter((t) => t.faite)
  return taches.value
})
</script>

<template>
  <div class="taches">
    <nav class="filtres">
      <button
        v-for="f in filtres"
        :key="f.valeur"
        :class="{ actif: filtre === f.valeur }"
        @click="filtre = f.valeur"
      >
        {{ f.libelle }}
      </button>
    </nav>

    <p v-if="tachesVisibles.length === 0" class="vide">Aucune tâche.</p>

    <ul v-else class="liste">
      <li
        v-for="tache in tachesVisibles"
        :key="tache.id"
        :class="{ faite: tache.faite }"
        @click="tache.faite = !tache.faite"
      >
        {{ tache.texte }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
li {
  cursor: pointer;
}
.faite {
  text-decoration: line-through;
  color: #888;
}
.actif {
  background: #42b883;
  color: white;
}
</style>
`,
  indices: [
    'v-for="tache in tachesVisibles" :key="tache.id" sur le <li>.',
    ':class="{ faite: tache.faite }" ajoute la classe seulement si la condition est vraie.',
    'v-if et v-else doivent être sur deux éléments qui se suivent : <p v-if="..."> puis <ul v-else>.',
  ],
  tests: [
    {
      nom: 'Affiche les 3 tâches',
      run: async (t) => {
        const w = await t.mount();
        const items = w.findAll('li');
        t.expect(items).toHaveLength(3);
        t.expect(items[0].text()).toBe('Lire la doc de Vue');
        t.expect(items[2].text()).toBe('Écrire un composant');
      },
    },
    {
      nom: 'La classe « faite » suit tache.faite',
      run: async (t) => {
        const w = await t.mount();
        const items = w.findAll('li');
        t.expect(items[0].classes('faite')).toBe(true);
        t.expect(items[1].classes('faite')).toBe(false);
      },
    },
    {
      nom: 'Un clic sur une tâche la coche puis la décoche',
      aide: 'Sur le <li> : @click="tache.faite = !tache.faite".',
      run: async (t) => {
        const w = await t.mount();
        await w.findAll('li')[1].click();
        t.expect(w.findAll('li')[1].classes('faite')).toBe(true);
        await w.findAll('li')[1].click();
        t.expect(w.findAll('li')[1].classes('faite')).toBe(false);
      },
    },
    {
      nom: 'Les boutons « À faire » et « Faites » filtrent la liste',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('À faire', 'button').click();
        t.expect(w.findAll('li')).toHaveLength(2);
        await w.findByText('Faites', 'button').click();
        t.expect(w.findAll('li')).toHaveLength(1);
        await w.findByText('Toutes', 'button').click();
        t.expect(w.findAll('li')).toHaveLength(3);
      },
    },
    {
      nom: 'Le bouton du filtre actif a la classe « actif »',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.findByText('Toutes', 'button').classes('actif')).toBe(true);
        await w.findByText('Faites', 'button').click();
        t.expect(w.findByText('Faites', 'button').classes('actif')).toBe(true);
        t.expect(w.findByText('Toutes', 'button').classes('actif')).toBe(false);
      },
    },
    {
      nom: 'Affiche « Aucune tâche. » seulement si la liste est vide',
      aide: 'Utilise v-if sur le paragraphe .vide et v-else sur la liste.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.find('.vide').exists()).toBe(false);
        await w.findByText('Faites', 'button').click();
        await w.findAll('li')[0].click();
        t.expect(w.findAll('li')).toHaveLength(0);
        t.expect(w.get('.vide').text()).toBe('Aucune tâche.');
      },
    },
  ],
};
