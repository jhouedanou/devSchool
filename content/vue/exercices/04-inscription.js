export default {
  id: '04-inscription',
  titre: "Formulaire d'inscription",
  type: 'vue',
  consigne: `Un formulaire d'inscription à des ateliers. L'objet \`form\` est prêt.

1. Relie les champs à \`form\` avec \`v-model\` :
   - \`#nom\` → \`form.nom\`, avec le modificateur \`.trim\` ;
   - les cases des ateliers → \`form.ateliers\` (un **tableau**) ;
   - les boutons radio du niveau → \`form.niveau\` ;
   - \`#cgu\` → \`form.cgu\` (un **booléen**).
2. Complète le computed \`erreurs\`. Il retourne un tableau de messages :
   - \`'Le nom est obligatoire.'\` si le nom est vide ;
   - \`'Choisis au moins un atelier.'\` si aucun atelier n'est coché ;
   - \`'Accepte les conditions.'\` si la case n'est pas cochée.
3. Désactive le bouton \`Envoyer\` tant qu'il y a des erreurs (\`:disabled\`).
4. Écoute l'envoi avec \`@submit.prevent\`. Dans \`envoyer()\`, s'il n'y a aucune erreur, passe \`envoye\` à \`true\`.`,
  depart: `<script setup>
import { reactive, ref, computed } from 'vue'

const form = reactive({
  nom: '',
  ateliers: [],
  niveau: 'débutant',
  cgu: false,
})
const envoye = ref(false)

const ateliers = ['vue', 'nuxt', 'pinia']
const niveaux = ['débutant', 'intermédiaire', 'avancé']

// TODO 2 : ajoute les messages d'erreur dans la liste
const erreurs = computed(() => {
  const liste = []
  return liste
})

function envoyer() {
  // TODO 4 : si aucune erreur, passe envoye à true
}
</script>

<template>
  <!-- TODO 4 : écoute @submit avec le modificateur .prevent -->
  <form v-if="!envoye" class="inscription">
    <label for="nom">Nom</label>
    <!-- TODO 1 : v-model.trim -->
    <input id="nom" type="text" />

    <fieldset>
      <legend>Ateliers</legend>
      <label v-for="atelier in ateliers" :key="atelier">
        <!-- TODO 1 : v-model vers form.ateliers -->
        <input type="checkbox" :value="atelier" />
        {{ atelier }}
      </label>
    </fieldset>
    <p class="choix">Ateliers choisis : {{ form.ateliers.length }}</p>

    <fieldset>
      <legend>Niveau</legend>
      <label v-for="niveau in niveaux" :key="niveau">
        <!-- TODO 1 : v-model vers form.niveau -->
        <input type="radio" name="niveau" :value="niveau" />
        {{ niveau }}
      </label>
    </fieldset>

    <label>
      <!-- TODO 1 : v-model vers form.cgu -->
      <input id="cgu" type="checkbox" />
      J'accepte les conditions
    </label>

    <ul class="erreurs">
      <li v-for="erreur in erreurs" :key="erreur">{{ erreur }}</li>
    </ul>

    <!-- TODO 3 : désactive le bouton s'il y a des erreurs -->
    <button type="submit">Envoyer</button>
  </form>

  <p v-else class="confirmation">
    Merci {{ form.nom }}, niveau {{ form.niveau }}, ateliers : {{ form.ateliers.join(', ') }}.
  </p>
</template>

<style scoped>
.inscription {
  display: grid;
  gap: 8px;
  max-width: 360px;
}
.erreurs {
  color: #c0392b;
}
</style>
`,
  solution: `<script setup>
import { reactive, ref, computed } from 'vue'

const form = reactive({
  nom: '',
  ateliers: [],
  niveau: 'débutant',
  cgu: false,
})
const envoye = ref(false)

const ateliers = ['vue', 'nuxt', 'pinia']
const niveaux = ['débutant', 'intermédiaire', 'avancé']

const erreurs = computed(() => {
  const liste = []
  if (!form.nom) liste.push('Le nom est obligatoire.')
  if (form.ateliers.length === 0) liste.push('Choisis au moins un atelier.')
  if (!form.cgu) liste.push('Accepte les conditions.')
  return liste
})

function envoyer() {
  if (erreurs.value.length > 0) return
  envoye.value = true
}
</script>

<template>
  <form v-if="!envoye" class="inscription" @submit.prevent="envoyer">
    <label for="nom">Nom</label>
    <input id="nom" v-model.trim="form.nom" type="text" />

    <fieldset>
      <legend>Ateliers</legend>
      <label v-for="atelier in ateliers" :key="atelier">
        <input v-model="form.ateliers" type="checkbox" :value="atelier" />
        {{ atelier }}
      </label>
    </fieldset>
    <p class="choix">Ateliers choisis : {{ form.ateliers.length }}</p>

    <fieldset>
      <legend>Niveau</legend>
      <label v-for="niveau in niveaux" :key="niveau">
        <input v-model="form.niveau" type="radio" name="niveau" :value="niveau" />
        {{ niveau }}
      </label>
    </fieldset>

    <label>
      <input id="cgu" v-model="form.cgu" type="checkbox" />
      J'accepte les conditions
    </label>

    <ul class="erreurs">
      <li v-for="erreur in erreurs" :key="erreur">{{ erreur }}</li>
    </ul>

    <button type="submit" :disabled="erreurs.length > 0">Envoyer</button>
  </form>

  <p v-else class="confirmation">
    Merci {{ form.nom }}, niveau {{ form.niveau }}, ateliers : {{ form.ateliers.join(', ') }}.
  </p>
</template>

<style scoped>
.inscription {
  display: grid;
  gap: 8px;
  max-width: 360px;
}
.erreurs {
  color: #c0392b;
}
</style>
`,
  indices: [
    'Plusieurs cases à cocher avec le même v-model="form.ateliers" remplissent un tableau avec leurs :value.',
    'Pour les boutons radio, mets v-model="form.niveau" sur chaque <input type="radio">.',
    'Dans le script, un computed se lit avec .value : erreurs.value.length.',
  ],
  tests: [
    {
      nom: 'Au départ : 3 erreurs et bouton désactivé',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.findAll('.erreurs li')).toHaveLength(3);
        t.expect(w.get('button[type="submit"]').disabled).toBe(true);
      },
    },
    {
      nom: 'Un nom fait seulement d\'espaces reste invalide (.trim)',
      aide: 'Ajoute le modificateur .trim : v-model.trim="form.nom".',
      run: async (t) => {
        const w = await t.mount();
        await w.get('#nom').setValue('   ');
        t.expect(w.get('.erreurs').text()).toContain('Le nom est obligatoire.');
        await w.get('#nom').setValue('Ada');
        t.expect(w.get('.erreurs').text()).not.toContain('Le nom est obligatoire.');
      },
    },
    {
      nom: 'Les ateliers cochés remplissent un tableau',
      aide: 'Mets v-model="form.ateliers" sur chaque case des ateliers.',
      run: async (t) => {
        const w = await t.mount();
        await w.get('input[value="vue"]').setValue(true);
        await w.get('input[value="pinia"]').setValue(true);
        t.expect(w.get('.choix').text()).toBe('Ateliers choisis : 2');
        t.expect(w.get('.erreurs').text()).not.toContain('Choisis au moins un atelier.');
      },
    },
    {
      nom: 'Formulaire complet : plus d\'erreur et bouton actif',
      run: async (t) => {
        const w = await t.mount();
        await w.get('#nom').setValue('Ada');
        await w.get('input[value="nuxt"]').setValue(true);
        await w.get('#cgu').setValue(true);
        t.expect(w.findAll('.erreurs li')).toHaveLength(0);
        t.expect(w.get('button[type="submit"]').disabled).toBe(false);
      },
    },
    {
      nom: 'Envoi : affiche la confirmation',
      aide: 'Sur le <form> : @submit.prevent="envoyer". Le niveau vient des boutons radio.',
      run: async (t) => {
        const w = await t.mount();
        await w.get('#nom').setValue('  Ada ');
        await w.get('input[value="vue"]').setValue(true);
        await w.get('input[value="pinia"]').setValue(true);
        await w.get('input[value="avancé"]').setValue(true);
        await w.get('#cgu').setValue(true);
        await w.get('form').submit();
        t.expect(w.get('.confirmation').text()).toBe('Merci Ada, niveau avancé, ateliers : vue, pinia.');
      },
    },
    {
      nom: "Pas d'envoi si le formulaire a des erreurs",
      run: async (t) => {
        const w = await t.mount();
        await w.get('form').submit();
        t.expect(w.find('.confirmation').exists()).toBe(false);
        t.expect(w.find('form').exists()).toBe(true);
      },
    },
  ],
};
