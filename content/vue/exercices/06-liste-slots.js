export default {
  id: '06-liste-slots',
  titre: 'Une liste personnalisable avec des slots',
  type: 'vue',
  consigne: `Écris un composant \`ListeElements\` dont le parent peut personnaliser l'affichage :

\`\`\`vue
<ListeElements :elements="amis">
  <template #titre>Mes amis</template>
  <template #default="{ element, index }">{{ index + 1 }}. {{ element.nom }}</template>
  <template #vide>Aucun ami pour l'instant.</template>
</ListeElements>
\`\`\`

1. Dans \`<header>\`, place un slot nommé \`titre\`. Contenu de secours : \`Liste\`.
2. Dans chaque \`<li>\`, place le slot par défaut. Passe-lui \`element\` et \`index\` (slot avec portée). Contenu de secours : le nom de l'élément.
3. Si \`elements\` est vide, n'affiche pas la liste. Affiche à la place \`<p class="vide">\` avec un slot nommé \`vide\`. Contenu de secours : \`Rien à afficher.\``,
  depart: `<script setup>
defineProps({
  elements: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="liste-elements">
    <header class="entete">
      <!-- TODO 1 : slot nommé « titre », contenu de secours « Liste » -->
      Liste
    </header>

    <!-- TODO 3 : si elements est vide, affiche <p class="vide"> avec un slot « vide »
         (contenu de secours : « Rien à afficher. ») à la place de la liste -->

    <ul>
      <li v-for="(element, index) in elements" :key="element.id">
        <!-- TODO 2 : slot par défaut avec les props element et index,
             contenu de secours : le nom de l'élément -->
        {{ element.nom }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.entete {
  font-weight: bold;
}
</style>
`,
  solution: `<script setup>
defineProps({
  elements: { type: Array, default: () => [] },
})
</script>

<template>
  <section class="liste-elements">
    <header class="entete">
      <slot name="titre">Liste</slot>
    </header>

    <p v-if="elements.length === 0" class="vide">
      <slot name="vide">Rien à afficher.</slot>
    </p>

    <ul v-else>
      <li v-for="(element, index) in elements" :key="element.id">
        <slot :element="element" :index="index">{{ element.nom }}</slot>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.entete {
  font-weight: bold;
}
</style>
`,
  indices: [
    'Un slot nommé : <slot name="titre">Liste</slot>. Le texte entre les balises est le contenu de secours.',
    'Un slot avec portée : <slot :element="element" :index="index">. Le parent récupère ces valeurs avec #default="{ element, index }".',
    'Mets v-if="elements.length === 0" sur le <p class="vide"> et v-else sur le <ul>.',
  ],
  tests: [
    {
      nom: 'Sans slot : titre « Liste » et nom de chaque élément',
      run: async (t) => {
        const w = await t.mount({ elements: [{ id: 1, nom: 'Ada' }, { id: 2, nom: 'Linus' }] });
        t.expect(w.get('header').text()).toBe('Liste');
        const items = w.findAll('li');
        t.expect(items).toHaveLength(2);
        t.expect(items[1].text()).toBe('Linus');
      },
    },
    {
      nom: 'Le slot « titre » remplace le titre',
      aide: 'Dans le <header> : <slot name="titre">Liste</slot>.',
      run: async (t) => {
        const w = await t.mount(
          { elements: [{ id: 1, nom: 'Ada' }] },
          { slots: { titre: 'Mes amis' } },
        );
        t.expect(w.get('header').text()).toBe('Mes amis');
      },
    },
    {
      nom: 'Le slot par défaut reçoit element et index',
      aide: 'Dans le <li> : <slot :element="element" :index="index">{{ element.nom }}</slot>.',
      run: async (t) => {
        const w = await t.mount(
          { elements: [{ id: 1, nom: 'Ada' }, { id: 2, nom: 'Linus' }] },
          { slots: { default: (p) => (p.index + 1) + '. ' + p.element.nom.toUpperCase() } },
        );
        const items = w.findAll('li');
        t.expect(items[0].text()).toBe('1. ADA');
        t.expect(items[1].text()).toBe('2. LINUS');
      },
    },
    {
      nom: 'Liste vide : message de secours, sans <ul>',
      run: async (t) => {
        const w = await t.mount({ elements: [] });
        t.expect(w.get('.vide').text()).toBe('Rien à afficher.');
        t.expect(w.find('ul').exists()).toBe(false);
      },
    },
    {
      nom: 'Le slot « vide » remplace le message',
      run: async (t) => {
        const w = await t.mount({ elements: [] }, { slots: { vide: 'Aucun ami pour l\'instant.' } });
        t.expect(w.get('.vide').text()).toBe('Aucun ami pour l\'instant.');
      },
    },
  ],
};
