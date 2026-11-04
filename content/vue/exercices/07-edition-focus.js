export default {
  id: '07-edition-focus',
  titre: 'Titre modifiable : useTemplateRef et nextTick',
  type: 'vue',
  consigne: `Un titre devient un champ quand on clique sur « Modifier ». Le champ doit recevoir le **focus** tout de suite.

Problème : juste après \`edition.value = true\`, l'\`<input>\` n'existe pas encore dans le DOM. Vue met le DOM à jour un peu plus tard. \`await nextTick()\` attend cette mise à jour.

1. Importe \`useTemplateRef\` et \`nextTick\`.
2. Crée \`const champ = useTemplateRef('champ')\` et ajoute \`ref="champ"\` sur l'\`<input>\`.
3. Dans \`modifier()\` : après \`edition.value = true\`, attends \`nextTick()\`, puis appelle \`champ.value.focus()\`.
4. Dans \`valider()\` : si le titre est vide, mets \`'Sans titre'\`.`,
  depart: `<script setup>
import { ref } from 'vue'
// TODO 1 : importe aussi useTemplateRef et nextTick

const titre = ref('Mes courses')
const edition = ref(false)
// TODO 2 : const champ = useTemplateRef('champ')

function modifier() {
  edition.value = true
  // TODO 3 : attends nextTick(), puis donne le focus au champ
}

function valider() {
  // TODO 4 : si le titre est vide, mets 'Sans titre'
  edition.value = false
}
</script>

<template>
  <div class="titre-editable">
    <!-- TODO 2 : ajoute ref="champ" sur l'input -->
    <input v-if="edition" v-model.trim="titre" @keyup.enter="valider" />
    <template v-else>
      <h2>{{ titre }}</h2>
      <button class="modifier" @click="modifier">Modifier</button>
    </template>
  </div>
</template>
`,
  solution: `<script setup>
import { ref, useTemplateRef, nextTick } from 'vue'

const titre = ref('Mes courses')
const edition = ref(false)
const champ = useTemplateRef('champ')

async function modifier() {
  edition.value = true
  await nextTick()
  champ.value.focus()
}

function valider() {
  if (titre.value === '') titre.value = 'Sans titre'
  edition.value = false
}
</script>

<template>
  <div class="titre-editable">
    <input v-if="edition" ref="champ" v-model.trim="titre" @keyup.enter="valider" />
    <template v-else>
      <h2>{{ titre }}</h2>
      <button class="modifier" @click="modifier">Modifier</button>
    </template>
  </div>
</template>
`,
  indices: [
    'La fonction doit être async pour pouvoir écrire await nextTick().',
    'La clé de useTemplateRef(\'champ\') doit être la même que l\'attribut ref="champ".',
    'Avec v-model.trim, un titre fait d\'espaces devient une chaîne vide.',
  ],
  tests: [
    {
      nom: 'Affiche le titre et le bouton « Modifier »',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('h2').text()).toBe('Mes courses');
        t.expect(w.find('input').exists()).toBe(false);
      },
    },
    {
      nom: '« Modifier » affiche le champ avec le titre',
      run: async (t) => {
        const w = await t.mount();
        await w.get('.modifier').click();
        t.expect(w.get('input').value).toBe('Mes courses');
      },
    },
    {
      nom: 'Le champ reçoit le focus',
      aide: 'Après edition.value = true, fais await nextTick() puis champ.value.focus().',
      run: async (t) => {
        const w = await t.mount();
        await w.get('.modifier').click();
        await t.tick();
        t.expect(t.document.activeElement).toBe(w.get('input').element);
      },
    },
    {
      nom: 'Entrée valide le nouveau titre',
      run: async (t) => {
        const w = await t.mount();
        await w.get('.modifier').click();
        await w.get('input').setValue('Cadeaux');
        await w.get('input').trigger('keyup', { key: 'Enter' });
        t.expect(w.find('input').exists()).toBe(false);
        t.expect(w.get('h2').text()).toBe('Cadeaux');
      },
    },
    {
      nom: 'Un titre vide devient « Sans titre »',
      aide: 'Dans valider(), teste titre.value === \'\'.',
      run: async (t) => {
        const w = await t.mount();
        await w.get('.modifier').click();
        await w.get('input').setValue('   ');
        await w.get('input').trigger('keyup', { key: 'Enter' });
        t.expect(w.get('h2').text()).toBe('Sans titre');
      },
    },
  ],
};
