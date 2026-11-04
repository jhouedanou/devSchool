export default {
  id: '05-champ-quantite',
  titre: 'Un v-model maison avec defineModel',
  type: 'vue',
  consigne: `Écris un composant \`ChampQuantite\` utilisable avec \`v-model\` :

\`\`\`vue
<ChampQuantite v-model="quantite" :min="1" :max="5" />
\`\`\`

1. Crée \`quantite\` avec \`defineModel\` : type \`Number\`, valeur par défaut \`1\`.
2. \`moins()\` retire 1, sans descendre sous \`props.min\`.
3. \`plus()\` ajoute 1, sans dépasser \`props.max\`.
4. Désactive « − » quand on est au minimum, et « + » quand on est au maximum.

\`defineModel()\` retourne une ref. Quand tu modifies \`quantite.value\`, Vue émet \`update:modelValue\` vers le parent.`,
  depart: `<script setup>
// TODO 1 : crée « quantite » avec defineModel (type Number, valeur par défaut 1)
const quantite = 1

const props = defineProps({
  min: { type: Number, default: 1 },
  max: { type: Number, default: 10 },
})

function moins() {
  // TODO 2 : retire 1, sans descendre sous props.min
}

function plus() {
  // TODO 3 : ajoute 1, sans dépasser props.max
}
</script>

<template>
  <div class="quantite">
    <!-- TODO 4 : désactive « − » au minimum et « + » au maximum -->
    <button class="moins" @click="moins">−</button>
    <span class="valeur">{{ quantite }}</span>
    <button class="plus" @click="plus">+</button>
  </div>
</template>

<style scoped>
.quantite {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
</style>
`,
  solution: `<script setup>
const quantite = defineModel({ type: Number, default: 1 })

const props = defineProps({
  min: { type: Number, default: 1 },
  max: { type: Number, default: 10 },
})

function moins() {
  if (quantite.value > props.min) quantite.value--
}

function plus() {
  if (quantite.value < props.max) quantite.value++
}
</script>

<template>
  <div class="quantite">
    <button class="moins" :disabled="quantite <= min" @click="moins">−</button>
    <span class="valeur">{{ quantite }}</span>
    <button class="plus" :disabled="quantite >= max" @click="plus">+</button>
  </div>
</template>

<style scoped>
.quantite {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
</style>
`,
  indices: [
    'const quantite = defineModel({ type: Number, default: 1 }) : pas besoin d\'import, c\'est une macro.',
    'Dans le script : quantite.value. Dans le template : quantite.',
    'Tu peux utiliser defineModel et defineProps dans le même composant.',
  ],
  tests: [
    {
      nom: 'Affiche la valeur reçue par v-model',
      run: async (t) => {
        const w = await t.mount({ modelValue: 3 });
        t.expect(w.get('.valeur').text()).toBe('3');
      },
    },
    {
      nom: '« + » et « − » émettent update:modelValue',
      aide: 'Modifie quantite.value : defineModel émet l\'événement pour toi.',
      run: async (t) => {
        const maj = t.fn();
        const w = await t.mount({ modelValue: 3, 'onUpdate:modelValue': maj });
        await w.get('.plus').click();
        t.expect(maj).toHaveBeenCalledWith(4);
        await w.get('.moins').click();
        t.expect(maj).toHaveBeenCalledWith(2);
      },
    },
    {
      nom: 'Fonctionne avec un vrai v-model (le parent met à jour la valeur)',
      run: async (t) => {
        let w;
        const maj = t.fn((v) => w.setProps({ modelValue: v }));
        w = await t.mount({ modelValue: 1, 'onUpdate:modelValue': maj });
        await w.get('.plus').click();
        await w.get('.plus').click();
        t.expect(w.get('.valeur').text()).toBe('3');
      },
    },
    {
      nom: 'Respecte min et max',
      run: async (t) => {
        const maj = t.fn();
        const w = await t.mount({ modelValue: 5, max: 5, 'onUpdate:modelValue': maj });
        t.expect(w.get('.plus').disabled).toBe(true);
        t.expect(w.get('.moins').disabled).toBe(false);
        const w2 = await t.mount({ modelValue: 1, 'onUpdate:modelValue': maj });
        t.expect(w2.get('.moins').disabled).toBe(true);
        await w2.get('.moins').click();
        t.expect(maj).not.toHaveBeenCalled();
      },
    },
    {
      nom: 'Sans v-model, part de 1 et reste utilisable',
      aide: 'Donne une valeur par défaut : defineModel({ type: Number, default: 1 }).',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.valeur').text()).toBe('1');
        await w.get('.plus').click();
        t.expect(w.get('.valeur').text()).toBe('2');
      },
    },
  ],
};
