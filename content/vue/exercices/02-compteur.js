export default {
  id: '02-compteur',
  titre: 'Un compteur réactif',
  type: 'vue',
  consigne: `Le code de départ utilise une variable normale : quand tu cliques, l'écran ne bouge pas. Rends-le réactif.

1. Importe \`ref\` et \`computed\` depuis \`'vue'\`.
2. Remplace \`let compte = 0\` par \`const compte = ref(0)\`.
3. Dans les fonctions, modifie \`compte.value\` :
   - \`incrementer\` ajoute 1 ;
   - \`decrementer\` retire 1 ;
   - \`remettreAZero\` remet à 0.
4. Crée \`double\` avec \`computed\` : le double de \`compte\`. Affiche-le dans \`.double\`.
5. Crée \`parite\` avec \`computed\` : \`'pair'\` ou \`'impair'\`. Affiche-le dans \`.parite\`.`,
  depart: `<script setup>
// TODO 1 : importe ref et computed depuis 'vue'

// TODO 2 : cette variable n'est pas réactive. Remplace-la par ref(0).
let compte = 0

function incrementer() {
  compte++ // TODO 3 : avec une ref, il faut modifier compte.value
}

function decrementer() {
  // TODO 3 : retire 1
}

function remettreAZero() {
  // TODO 3 : remets à 0
}

// TODO 4 : const double = computed(() => ...)
// TODO 5 : const parite = computed(() => ...) → 'pair' ou 'impair'
</script>

<template>
  <div class="compteur">
    <p class="valeur">{{ compte }}</p>
    <button class="moins" @click="decrementer">−</button>
    <button class="plus" @click="incrementer">+</button>
    <button class="zero" @click="remettreAZero">0</button>

    <!-- TODO 6 : affiche double et parite -->
    <p>Double : <span class="double"></span></p>
    <p>Parité : <span class="parite"></span></p>
  </div>
</template>
`,
  solution: `<script setup>
import { ref, computed } from 'vue'

const compte = ref(0)

function incrementer() {
  compte.value++
}

function decrementer() {
  compte.value--
}

function remettreAZero() {
  compte.value = 0
}

const double = computed(() => compte.value * 2)
const parite = computed(() => (compte.value % 2 === 0 ? 'pair' : 'impair'))
</script>

<template>
  <div class="compteur">
    <p class="valeur">{{ compte }}</p>
    <button class="moins" @click="decrementer">−</button>
    <button class="plus" @click="incrementer">+</button>
    <button class="zero" @click="remettreAZero">0</button>

    <p>Double : <span class="double">{{ double }}</span></p>
    <p>Parité : <span class="parite">{{ parite }}</span></p>
  </div>
</template>
`,
  indices: [
    'Dans <script setup>, une ref se lit et se modifie avec .value : compte.value++. Dans le template, pas de .value.',
    'Le reste d\'une division par 2 : compte.value % 2 vaut 0 pour un nombre pair.',
  ],
  tests: [
    {
      nom: 'Affiche 0 au départ',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.valeur').text()).toBe('0');
      },
    },
    {
      nom: '« + » ajoute 1',
      aide: 'compte doit être une ref, et incrementer doit modifier compte.value.',
      run: async (t) => {
        const w = await t.mount();
        await w.get('.plus').click();
        await w.get('.plus').click();
        t.expect(w.get('.valeur').text()).toBe('2');
      },
    },
    {
      nom: '« − » retire 1',
      run: async (t) => {
        const w = await t.mount();
        await w.get('.plus').click();
        await w.get('.moins').click();
        await w.get('.moins').click();
        t.expect(w.get('.valeur').text()).toBe('-1');
      },
    },
    {
      nom: '« 0 » remet le compteur à zéro',
      run: async (t) => {
        const w = await t.mount();
        await w.get('.plus').click();
        await w.get('.plus').click();
        await w.get('.zero').click();
        t.expect(w.get('.valeur').text()).toBe('0');
      },
    },
    {
      nom: 'Le double et la parité suivent le compteur',
      aide: 'Utilise computed() et affiche {{ double }} et {{ parite }}.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.parite').text()).toBe('pair');
        await w.get('.plus').click();
        await w.get('.plus').click();
        await w.get('.plus').click();
        t.expect(w.get('.double').text()).toBe('6');
        t.expect(w.get('.parite').text()).toBe('impair');
      },
    },
  ],
};
