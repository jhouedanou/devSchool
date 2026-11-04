export default {
  id: '04-liste-taches',
  titre: 'Charger et ajouter des tâches',
  type: 'nuxt',
  consigne: `Tu affiches les tâches de l'API \`/api/taches\`. Les tests simulent cette API.

1. Remplace les trois \`ref\` par **un seul** appel : \`await useFetch('/api/taches')\`. Renomme \`data\` en \`taches\` et récupère aussi \`status\`, \`error\` et \`refresh\`.
2. Dans \`ajouter()\`, envoie la tâche avec \`$fetch('/api/taches', { method: 'POST', body: { titre: titre.value } })\`.
3. Ensuite, vide le champ et recharge la liste avec \`refresh()\`.

Rappel : \`useFetch\` pour charger les données de la page, \`$fetch\` pour une action de l'utilisateur (un clic, un envoi de formulaire).`,
  depart: `<script setup lang="ts">
type Tache = { id: number; titre: string; faite: boolean }

// TODO 1 : remplace ces trois lignes par un appel à useFetch('/api/taches')
const taches = ref<Tache[]>([])
const status = ref('success')
const error = ref(undefined)

const titre = ref('')

async function ajouter() {
  if (!titre.value.trim()) return
  // TODO 2 : envoie un POST avec $fetch
  // TODO 3 : vide le champ, puis appelle refresh()
}
</script>

<template>
  <section>
    <p v-if="error" class="erreur">Impossible de charger les tâches.</p>
    <ul v-else>
      <li v-for="tache in taches" :key="tache.id">{{ tache.titre }}</li>
    </ul>
    <p v-if="status === 'pending'" class="chargement">Chargement…</p>

    <form @submit.prevent="ajouter">
      <input v-model="titre" placeholder="Nouvelle tâche">
      <button type="submit">Ajouter</button>
    </form>
  </section>
</template>
`,
  solution: `<script setup lang="ts">
type Tache = { id: number; titre: string; faite: boolean }

const { data: taches, status, error, refresh } = await useFetch<Tache[]>('/api/taches')

const titre = ref('')

async function ajouter() {
  if (!titre.value.trim()) return
  await $fetch('/api/taches', {
    method: 'POST',
    body: { titre: titre.value },
  })
  titre.value = ''
  await refresh()
}
</script>

<template>
  <section>
    <p v-if="error" class="erreur">Impossible de charger les tâches.</p>
    <ul v-else>
      <li v-for="tache in taches" :key="tache.id">{{ tache.titre }}</li>
    </ul>
    <p v-if="status === 'pending'" class="chargement">Chargement…</p>

    <form @submit.prevent="ajouter">
      <input v-model="titre" placeholder="Nouvelle tâche">
      <button type="submit">Ajouter</button>
    </form>
  </section>
</template>
`,
  indices: [
    '`const { data: taches, status, error, refresh } = await useFetch(\'/api/taches\')`',
    '`$fetch` renvoie une promesse : écris `await $fetch(…)` avant de recharger la liste.',
  ],
  tests: [
    {
      nom: 'Affiche les tâches reçues de /api/taches',
      aide: 'Utilise `useFetch(\'/api/taches\')` et renomme `data` en `taches`.',
      run: async (t) => {
        const appels = t.mockFetch({
          '/api/taches': [
            { id: 1, titre: 'Lire la doc', faite: false },
            { id: 2, titre: 'Coder', faite: true },
          ],
        });
        const w = await t.mount();
        t.expect(appels.length).toBeGreaterThan(0);
        t.expect(w.findAll('li')).toHaveLength(2);
        t.expect(w.findAll('li')[0].text()).toBe('Lire la doc');
      },
    },
    {
      nom: 'Affiche un message si l\'API renvoie une erreur',
      aide: 'Récupère `error` depuis `useFetch` : il est rempli quand la requête échoue.',
      run: async (t) => {
        t.mockFetch(() => t.reponse({ message: 'Erreur serveur' }, 500));
        const w = await t.mount();
        t.expect(w.find('.erreur').exists()).toBe(true);
      },
    },
    {
      nom: 'Ajouter envoie un POST avec le titre',
      aide: 'Appelle `$fetch(\'/api/taches\', { method: \'POST\', body: { titre: titre.value } })`.',
      run: async (t) => {
        const liste = [{ id: 1, titre: 'Lire la doc', faite: false }];
        const appels = t.mockFetch((url, init) => {
          if (init.method === 'POST') {
            const nouvelle = { id: 2, titre: JSON.parse(init.body).titre, faite: false };
            liste.push(nouvelle);
            return nouvelle;
          }
          return liste;
        });
        const w = await t.mount();
        await w.get('input').setValue('Pain');
        await w.get('form').submit();
        await t.wait(() => {
          const post = appels.find((a) => a.method === 'POST');
          t.expect(post).toBeDefined();
          t.expect(post.url).toContain('/api/taches');
          t.expect(post.json).toEqual({ titre: 'Pain' });
        });
      },
    },
    {
      nom: 'La liste est rechargée après l\'ajout',
      aide: 'Après le POST, appelle `refresh()` : `useFetch` refait la requête GET.',
      run: async (t) => {
        const liste = [{ id: 1, titre: 'Lire la doc', faite: false }];
        const appels = t.mockFetch((url, init) => {
          if (init.method === 'POST') {
            const nouvelle = { id: 2, titre: JSON.parse(init.body).titre, faite: false };
            liste.push(nouvelle);
            return nouvelle;
          }
          return liste;
        });
        const w = await t.mount();
        await w.get('input').setValue('Pain');
        await w.get('form').submit();
        await t.wait(() => {
          t.expect(appels.filter((a) => a.method === 'GET')).toHaveLength(2);
          t.expect(w.findAll('li')).toHaveLength(2);
        });
      },
    },
    {
      nom: 'Le champ est vidé après l\'ajout',
      run: async (t) => {
        t.mockFetch((url, init) => (init.method === 'POST' ? { id: 2, titre: 'Pain', faite: false } : []));
        const w = await t.mount();
        await w.get('input').setValue('Pain');
        await w.get('form').submit();
        await t.wait(() => t.expect(w.get('input').value).toBe(''));
      },
    },
  ],
};
