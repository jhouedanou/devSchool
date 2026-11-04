export default {
  id: '07-minuteur',
  titre: 'Un minuteur propre (watch + cycle de vie)',
  type: 'vue',
  consigne: `Écris un minuteur qui compte à rebours. Pour que les tests soient rapides, un « tic » dure 100 ms (la constante \`TIC\`).

1. Dans \`onMounted\`, lance \`setInterval\` : à chaque tic, \`restant\` perd 1. Garde l'identifiant dans \`intervalle\`.
2. Avec \`watch\`, surveille \`restant\`. Quand il arrive à \`0\` : arrête l'intervalle (\`clearInterval\`) et émets l'événement \`fini\`.
3. Dans \`onUnmounted\`, arrête l'intervalle. Sinon, il continue de tourner après la disparition du composant.

Le paragraphe \`Terminé !\` est déjà dans le template.`,
  depart: `<script setup>
import { ref } from 'vue'
// TODO : importe aussi watch, onMounted et onUnmounted

const props = defineProps({
  duree: { type: Number, default: 3 },
})
const emit = defineEmits(['fini'])

const TIC = 100 // 100 ms au lieu de 1 s, pour des tests rapides
const restant = ref(props.duree)
let intervalle = null

// TODO 1 : onMounted → intervalle = setInterval(() => { ... }, TIC)

// TODO 2 : watch(restant, ...) → à 0 : clearInterval(intervalle) et emit('fini')

// TODO 3 : onUnmounted → clearInterval(intervalle)
</script>

<template>
  <div class="minuteur">
    <p class="restant">{{ restant }}</p>
    <p v-if="restant === 0" class="fini">Terminé !</p>
  </div>
</template>
`,
  solution: `<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  duree: { type: Number, default: 3 },
})
const emit = defineEmits(['fini'])

const TIC = 100 // 100 ms au lieu de 1 s, pour des tests rapides
const restant = ref(props.duree)
let intervalle = null

onMounted(() => {
  intervalle = setInterval(() => {
    restant.value--
  }, TIC)
})

watch(restant, (valeur) => {
  if (valeur === 0) {
    clearInterval(intervalle)
    emit('fini')
  }
})

onUnmounted(() => {
  clearInterval(intervalle)
})
</script>

<template>
  <div class="minuteur">
    <p class="restant">{{ restant }}</p>
    <p v-if="restant === 0" class="fini">Terminé !</p>
  </div>
</template>
`,
  indices: [
    'setInterval(fonction, TIC) retourne un identifiant : range-le dans intervalle.',
    'watch(restant, (valeur) => { ... }) : valeur est la nouvelle valeur de restant.',
    'onUnmounted(() => clearInterval(intervalle)) évite une fuite de mémoire.',
  ],
  tests: [
    {
      nom: 'Affiche la durée au départ',
      run: async (t) => {
        const w = await t.mount({ duree: 5 });
        t.expect(w.get('.restant').text()).toBe('5');
        t.expect(w.find('.fini').exists()).toBe(false);
      },
    },
    {
      nom: 'Compte à rebours jusqu\'à 0, puis affiche « Terminé ! »',
      aide: 'Lance setInterval dans onMounted et retire 1 à restant.value à chaque tic.',
      run: async (t) => {
        const w = await t.mount({ duree: 3 });
        await t.wait(() => t.expect(w.get('.restant').text()).toBe('0'));
        t.expect(w.get('.fini').text()).toBe('Terminé !');
      },
    },
    {
      nom: 'S\'arrête à 0 (pas de valeur négative)',
      aide: 'Quand restant arrive à 0, appelle clearInterval(intervalle).',
      run: async (t) => {
        const w = await t.mount({ duree: 2 });
        await t.wait(() => t.expect(w.get('.restant').text()).toBe('0'));
        await t.pause(350);
        t.expect(w.get('.restant').text()).toBe('0');
      },
    },
    {
      nom: 'Émet « fini » une seule fois',
      run: async (t) => {
        const onFini = t.fn();
        await t.mount({ duree: 2, onFini });
        await t.wait(() => t.expect(onFini).toHaveBeenCalled());
        await t.pause(300);
        t.expect(onFini).toHaveBeenCalledTimes(1);
      },
    },
    {
      nom: 'Arrête l\'intervalle au démontage (onUnmounted)',
      aide: 'Sans clearInterval dans onUnmounted, l\'intervalle continue de tourner.',
      run: async (t) => {
        const w = t.window;
        const setOrigine = w.setInterval;
        const clearOrigine = w.clearInterval;
        const crees = [];
        const arretes = [];
        w.setInterval = (fn, ms) => {
          const id = setOrigine.call(w, fn, ms);
          crees.push(id);
          return id;
        };
        w.clearInterval = (id) => {
          arretes.push(id);
          return clearOrigine.call(w, id);
        };
        try {
          const m = await t.mount({ duree: 50 });
          await t.pause(150);
          await m.unmount();
          t.expect(crees.length).toBeGreaterThan(0);
          t.expect(arretes).toContain(crees[0]);
        } finally {
          w.setInterval = setOrigine;
          w.clearInterval = clearOrigine;
        }
      },
    },
  ],
};
