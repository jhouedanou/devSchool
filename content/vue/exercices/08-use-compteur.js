export default {
  id: '08-use-compteur',
  titre: 'Mon premier composable : useCompteur',
  type: 'vue',
  consigne: `Extrais la logique d'un compteur dans un composable \`useCompteur\`.

Dans un vrai projet, il serait dans \`src/composables/useCompteur.js\`. Ici, le bloc \`<script>\` (sans \`setup\`) joue le rôle de ce fichier : il **exporte** la fonction.

1. Dans \`useCompteur(initial, { min, max })\` :
   - crée l'état \`compte\` avec \`ref(initial)\` ;
   - crée \`auMin\` et \`auMax\` avec \`computed\` : vrai quand \`compte\` atteint \`min\` ou \`max\` ;
   - écris \`incrementer()\` et \`decrementer()\` (sans sortir des bornes) et \`reinitialiser()\` (retour à \`initial\`) ;
   - retourne un objet : \`{ compte, auMin, auMax, incrementer, decrementer, reinitialiser }\`.
2. Dans \`<script setup>\`, appelle \`useCompteur(1, { min: 1, max: 5 })\` et déstructure le résultat.
3. Relie le template : affiche \`compte\`, désactive « − » avec \`auMin\` et « + » avec \`auMax\`, branche les trois boutons.`,
  depart: `<script>
import { ref, computed } from 'vue'

// Dans un vrai projet : src/composables/useCompteur.js
export function useCompteur(initial = 0, { min = -Infinity, max = Infinity } = {}) {
  // TODO 1 : crée l'état « compte » avec ref(initial)
  // TODO 2 : auMin et auMax avec computed (vrai quand compte atteint min / max)
  // TODO 3 : incrementer() et decrementer() sans sortir des bornes, reinitialiser()
  // TODO 4 : retourne { compte, auMin, auMax, incrementer, decrementer, reinitialiser }
  return {}
}
</script>

<script setup>
// TODO 5 : const { ... } = useCompteur(1, { min: 1, max: 5 })
</script>

<template>
  <div class="billets">
    <p>Nombre de billets</p>
    <!-- TODO 6 : relie les boutons et la valeur au composable -->
    <button class="moins">−</button>
    <span class="valeur">1</span>
    <button class="plus">+</button>
    <button class="reset">Réinitialiser</button>
  </div>
</template>
`,
  solution: `<script>
import { ref, computed } from 'vue'

// Dans un vrai projet : src/composables/useCompteur.js
export function useCompteur(initial = 0, { min = -Infinity, max = Infinity } = {}) {
  const compte = ref(initial)

  const auMin = computed(() => compte.value <= min)
  const auMax = computed(() => compte.value >= max)

  function incrementer() {
    if (!auMax.value) compte.value++
  }
  function decrementer() {
    if (!auMin.value) compte.value--
  }
  function reinitialiser() {
    compte.value = initial
  }

  return { compte, auMin, auMax, incrementer, decrementer, reinitialiser }
}
</script>

<script setup>
const { compte, auMin, auMax, incrementer, decrementer, reinitialiser } = useCompteur(1, { min: 1, max: 5 })
</script>

<template>
  <div class="billets">
    <p>Nombre de billets</p>
    <button class="moins" :disabled="auMin" @click="decrementer">−</button>
    <span class="valeur">{{ compte }}</span>
    <button class="plus" :disabled="auMax" @click="incrementer">+</button>
    <button class="reset" @click="reinitialiser">Réinitialiser</button>
  </div>
</template>
`,
  indices: [
    'Un composable est une simple fonction : elle crée des refs, des computed et des fonctions, puis les retourne.',
    'Retourne un objet de refs (pas un reactive) : on peut alors le déstructurer sans perdre la réactivité.',
    'Dans le composable, un computed se lit avec .value : if (!auMax.value) compte.value++.',
  ],
  tests: [
    {
      nom: 'useCompteur est exporté et retourne une ref « compte »',
      run: async (t) => {
        t.expect(t.module.useCompteur).toBeTypeOf('function');
        const c = t.module.useCompteur(3);
        t.expect(t.window.Vue.isRef(c.compte)).toBe(true);
        t.expect(c.compte.value).toBe(3);
      },
    },
    {
      nom: 'incrementer, decrementer et reinitialiser',
      run: async (t) => {
        const c = t.module.useCompteur(0);
        c.incrementer();
        c.incrementer();
        t.expect(c.compte.value).toBe(2);
        c.decrementer();
        t.expect(c.compte.value).toBe(1);
        c.reinitialiser();
        t.expect(c.compte.value).toBe(0);
      },
    },
    {
      nom: 'Respecte min et max (auMin, auMax)',
      aide: 'auMin = computed(() => compte.value <= min) ; incrementer ne fait rien si auMax.value est vrai.',
      run: async (t) => {
        const c = t.module.useCompteur(1, { min: 0, max: 2 });
        c.incrementer();
        c.incrementer();
        c.incrementer();
        t.expect(c.compte.value).toBe(2);
        t.expect(c.auMax.value).toBe(true);
        for (let i = 0; i < 5; i++) c.decrementer();
        t.expect(c.compte.value).toBe(0);
        t.expect(c.auMin.value).toBe(true);
        t.expect(c.auMax.value).toBe(false);
      },
    },
    {
      nom: 'Chaque appel crée un état indépendant',
      aide: 'Crée la ref À L\'INTÉRIEUR de la fonction, pas en dehors.',
      run: async (t) => {
        const a = t.module.useCompteur(0);
        const b = t.module.useCompteur(0);
        a.incrementer();
        t.expect(a.compte.value).toBe(1);
        t.expect(b.compte.value).toBe(0);
      },
    },
    {
      nom: 'Le composant utilise le composable (1 à 5 billets)',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.valeur').text()).toBe('1');
        t.expect(w.get('.moins').disabled).toBe(true);
        for (let i = 0; i < 6; i++) await w.get('.plus').click();
        t.expect(w.get('.valeur').text()).toBe('5');
        t.expect(w.get('.plus').disabled).toBe(true);
        await w.get('.reset').click();
        t.expect(w.get('.valeur').text()).toBe('1');
      },
    },
  ],
};
