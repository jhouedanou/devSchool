export default {
  id: '06-theme-provide',
  titre: 'Partager un thème avec provide/inject',
  type: 'vue',
  consigne: `Écris un composant \`FournisseurTheme\` qui partage un thème avec **tous** ses descendants, sans passer de props.

Un descendant l'utilisera ainsi :

\`\`\`js
const { theme, basculer } = inject('theme')
\`\`\`

1. Importe \`provide\` et \`readonly\` depuis \`'vue'\`.
2. Complète \`basculer()\` : \`theme\` passe de \`'clair'\` à \`'sombre'\`, et inversement.
3. Appelle \`provide('theme', { theme: readonly(theme), basculer })\`. Avec \`readonly\`, les descendants lisent le thème mais ne peuvent pas le modifier directement.
4. Ajoute au \`<div>\` la classe \`theme-clair\` ou \`theme-sombre\`.
5. Affiche le contenu reçu du parent avec le slot par défaut (\`<slot />\`), sous le bouton.`,
  depart: `<script setup>
import { ref } from 'vue'
// TODO 1 : importe aussi provide et readonly

const theme = ref('clair')

function basculer() {
  // TODO 2 : passe de 'clair' à 'sombre', et inversement
}

// TODO 3 : fournis { theme: readonly(theme), basculer } sous la clé 'theme'
</script>

<template>
  <!-- TODO 4 : ajoute la classe « theme-clair » ou « theme-sombre » -->
  <div class="app">
    <button class="basculer" @click="basculer">Thème : {{ theme }}</button>
    <!-- TODO 5 : affiche ici le contenu reçu (slot par défaut) -->
  </div>
</template>

<style scoped>
.theme-sombre {
  background: #1e1e1e;
  color: #eee;
}
</style>
`,
  solution: `<script setup>
import { ref, provide, readonly } from 'vue'

const theme = ref('clair')

function basculer() {
  theme.value = theme.value === 'clair' ? 'sombre' : 'clair'
}

provide('theme', { theme: readonly(theme), basculer })
</script>

<template>
  <div class="app" :class="'theme-' + theme">
    <button class="basculer" @click="basculer">Thème : {{ theme }}</button>
    <slot />
  </div>
</template>

<style scoped>
.theme-sombre {
  background: #1e1e1e;
  color: #eee;
}
</style>
`,
  indices: [
    'provide(clé, valeur) se place directement dans <script setup>.',
    'Fournis la ref elle-même (pas theme.value) : les descendants verront ses changements.',
    ':class="\'theme-\' + theme" ajoute une classe calculée.',
  ],
  tests: [
    {
      nom: 'Le bouton bascule le thème et la classe du <div>',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.app').classes('theme-clair')).toBe(true);
        await w.get('.basculer').click();
        t.expect(w.get('.app').classes('theme-sombre')).toBe(true);
        t.expect(w.get('.basculer').text()).toBe('Thème : sombre');
        await w.get('.basculer').click();
        t.expect(w.get('.app').classes('theme-clair')).toBe(true);
      },
    },
    {
      nom: 'Un descendant reçoit le thème avec inject',
      aide: 'Appelle provide(\'theme\', { theme: readonly(theme), basculer }) et affiche <slot />.',
      run: async (t) => {
        const V = t.window.Vue;
        const Enfant = {
          setup() {
            const fourni = V.inject('theme');
            return () => V.h('p', { class: 'enfant' }, fourni.theme.value);
          },
        };
        const w = await t.mount({}, { slots: { default: () => V.h(Enfant) } });
        t.expect(w.get('.enfant').text()).toBe('clair');
      },
    },
    {
      nom: 'Le descendant voit les changements de thème',
      aide: 'Fournis la ref (readonly(theme)), pas sa valeur : sinon le descendant garde l\'ancienne valeur.',
      run: async (t) => {
        const V = t.window.Vue;
        const Enfant = {
          setup() {
            const fourni = V.inject('theme');
            return () => V.h('p', { class: 'enfant' }, fourni.theme.value);
          },
        };
        const w = await t.mount({}, { slots: { default: () => V.h(Enfant) } });
        await w.get('.basculer').click();
        t.expect(w.get('.enfant').text()).toBe('sombre');
      },
    },
    {
      nom: 'Le descendant peut basculer le thème avec la fonction fournie',
      run: async (t) => {
        const V = t.window.Vue;
        const Enfant = {
          setup() {
            const fourni = V.inject('theme');
            return () => V.h('button', { class: 'depuis-enfant', onClick: fourni.basculer }, 'Changer');
          },
        };
        const w = await t.mount({}, { slots: { default: () => V.h(Enfant) } });
        await w.get('.depuis-enfant').click();
        t.expect(w.get('.app').classes('theme-sombre')).toBe(true);
      },
    },
    {
      nom: 'Le thème fourni est en lecture seule',
      aide: 'Enveloppe la ref avec readonly(theme) avant de la fournir.',
      run: async (t) => {
        const V = t.window.Vue;
        let fourni = null;
        const Enfant = {
          setup() {
            fourni = V.inject('theme');
            return () => null;
          },
        };
        await t.mount({}, { slots: { default: () => V.h(Enfant) } });
        t.expect(fourni).toBeTruthy();
        t.expect(V.isReadonly(fourni.theme)).toBe(true);
      },
    },
  ],
};
