export default {
  id: '08-use-fetch',
  titre: 'Un composable useFetch',
  type: 'vue',
  consigne: `Écris un composable \`useFetch(url)\` qui charge du JSON. Le composant l'utilise déjà pour afficher des utilisateurs page par page.

\`url\` peut être une chaîne, une ref ou un getter (\`() => ...\`). \`toValue(url)\` donne toujours la valeur.

1. Dans un \`watchEffect\` (fonction \`async\`) :
   - lis l'adresse avec \`toValue(url)\` **avant** tout \`await\` : Vue suit seulement ce qui est lu avant le premier \`await\` ;
   - remets \`erreur\` à \`null\` et passe \`chargement\` à \`true\` ;
   - appelle \`fetch(adresse)\`. Si \`reponse.ok\` est faux, lance \`new Error('Erreur ' + reponse.status)\` ;
   - range le JSON dans \`donnees\`, ou le message de l'erreur dans \`erreur\` ;
   - à la fin (\`finally\`), \`chargement\` repasse à \`false\`.
2. Dans \`<script setup>\`, remplace les trois refs vides par l'appel du composable :

\`\`\`js
const { donnees: utilisateurs, erreur, chargement } = useFetch(
  () => \`/api/utilisateurs?page=\${page.value}\`,
)
\`\`\`

Comme l'URL est un getter qui lit \`page\`, le bouton « Page suivante » relance la requête tout seul.`,
  depart: `<script>
import { ref, watchEffect, toValue } from 'vue'

// Dans un vrai projet : src/composables/useFetch.js
export function useFetch(url) {
  const donnees = ref(null)
  const erreur = ref(null)
  const chargement = ref(false)

  // TODO 1 : watchEffect(async () => { ... })
  //   - const adresse = toValue(url)   (avant tout await)
  //   - erreur à null, chargement à true
  //   - fetch(adresse) ; si !reponse.ok → throw new Error('Erreur ' + reponse.status)
  //   - donnees.value = await reponse.json()   ou   erreur.value = e.message
  //   - finally : chargement à false

  return { donnees, erreur, chargement }
}
</script>

<script setup>
import { ref } from 'vue'

const page = ref(1)

// TODO 2 : remplace ces trois lignes par :
// const { donnees: utilisateurs, erreur, chargement } = useFetch(() => \`/api/utilisateurs?page=\${page.value}\`)
const utilisateurs = ref(null)
const erreur = ref(null)
const chargement = ref(false)
</script>

<template>
  <section class="utilisateurs">
    <p v-if="chargement" class="chargement">Chargement…</p>
    <p v-else-if="erreur" class="erreur">{{ erreur }}</p>
    <ul v-else-if="utilisateurs">
      <li v-for="u in utilisateurs" :key="u.id">{{ u.nom }}</li>
    </ul>
    <button class="suivante" @click="page++">Page suivante</button>
  </section>
</template>
`,
  solution: `<script>
import { ref, watchEffect, toValue } from 'vue'

// Dans un vrai projet : src/composables/useFetch.js
export function useFetch(url) {
  const donnees = ref(null)
  const erreur = ref(null)
  const chargement = ref(false)

  watchEffect(async () => {
    const adresse = toValue(url)
    erreur.value = null
    chargement.value = true
    try {
      const reponse = await fetch(adresse)
      if (!reponse.ok) throw new Error('Erreur ' + reponse.status)
      donnees.value = await reponse.json()
    } catch (e) {
      erreur.value = e.message
    } finally {
      chargement.value = false
    }
  })

  return { donnees, erreur, chargement }
}
</script>

<script setup>
import { ref } from 'vue'

const page = ref(1)

const { donnees: utilisateurs, erreur, chargement } = useFetch(() => \`/api/utilisateurs?page=\${page.value}\`)
</script>

<template>
  <section class="utilisateurs">
    <p v-if="chargement" class="chargement">Chargement…</p>
    <p v-else-if="erreur" class="erreur">{{ erreur }}</p>
    <ul v-else-if="utilisateurs">
      <li v-for="u in utilisateurs" :key="u.id">{{ u.nom }}</li>
    </ul>
    <button class="suivante" @click="page++">Page suivante</button>
  </section>
</template>
`,
  indices: [
    'watchEffect(async () => { const adresse = toValue(url); ... }) : la lecture de toValue(url) en premier permet à Vue de suivre page.',
    'fetch ne lève pas d\'erreur pour un statut 404 ou 500 : teste reponse.ok toi-même.',
    'Avec try / catch / finally, chargement repasse à false dans tous les cas.',
  ],
  tests: [
    {
      nom: 'Affiche les utilisateurs reçus',
      run: async (t) => {
        t.mockFetch({ '/api/utilisateurs': [{ id: 1, nom: 'Ada' }, { id: 2, nom: 'Grace' }] });
        const w = await t.mount();
        await t.wait(() => t.expect(w.findAll('li')).toHaveLength(2));
        t.expect(w.findAll('li')[1].text()).toBe('Grace');
      },
    },
    {
      nom: 'Affiche « Chargement… » pendant la requête',
      aide: 'Passe chargement.value à true avant le fetch, et à false dans finally.',
      run: async (t) => {
        t.mockFetch(() => new Promise((ok) => setTimeout(() => ok([{ id: 1, nom: 'Ada' }]), 200)));
        const w = await t.mount();
        t.expect(w.find('.chargement').exists()).toBe(true);
        await t.wait(() => t.expect(w.find('.chargement').exists()).toBe(false));
        t.expect(w.get('li').text()).toBe('Ada');
      },
    },
    {
      nom: "Affiche un message en cas d'erreur HTTP",
      aide: "fetch ne lève pas d'erreur pour un statut 500 : vérifie reponse.ok et lance new Error('Erreur ' + reponse.status).",
      run: async (t) => {
        t.mockFetch({ '/api/utilisateurs': t.reponse({ message: 'Panne' }, 500) });
        const w = await t.mount();
        await t.wait(() => t.expect(w.get('.erreur').text()).toBe('Erreur 500'));
        t.expect(w.find('ul').exists()).toBe(false);
      },
    },
    {
      nom: "Accepte une URL sous forme de chaîne ou de ref (toValue)",
      run: async (t) => {
        const V = t.window.Vue;
        const appels = t.mockFetch((url) => [{ id: 1, nom: url }]);
        const simple = t.module.useFetch('/api/simple');
        await t.wait(() => t.expect(simple.donnees.value).toEqual([{ id: 1, nom: '/api/simple' }]));
        const adresse = V.ref('/api/a');
        const avecRef = t.module.useFetch(adresse);
        await t.wait(() => t.expect(avecRef.donnees.value[0].nom).toBe('/api/a'));
        adresse.value = '/api/b';
        await t.wait(() => t.expect(avecRef.donnees.value[0].nom).toBe('/api/b'));
        t.expect(appels).toHaveLength(3);
      },
    },
    {
      nom: '« Page suivante » recharge avec page=2',
      aide: 'Passe un getter à useFetch : () => `/api/utilisateurs?page=${page.value}`.',
      run: async (t) => {
        const appels = t.mockFetch((url) =>
          url.includes('page=2') ? [{ id: 3, nom: 'Linus' }] : [{ id: 1, nom: 'Ada' }],
        );
        const w = await t.mount();
        await t.wait(() => t.expect(w.get('li').text()).toBe('Ada'));
        await w.get('.suivante').click();
        await t.wait(() => t.expect(w.get('li').text()).toBe('Linus'));
        t.expect(appels[appels.length - 1].url).toContain('page=2');
      },
    },
  ],
};
