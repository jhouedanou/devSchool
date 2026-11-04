<script setup lang="ts">
type Filtre = 'toutes' | 'faites' | 'a-faire'

const filtre = ref<Filtre>('toutes')

// Query réactive : useFetch relance la requête quand le filtre change.
const query = computed(() => {
  if (filtre.value === 'faites') return { fait: 'true' }
  if (filtre.value === 'a-faire') return { fait: 'false' }
  return {}
})

const { data: taches, status, error, refresh } = await useFetch('/api/taches', { query })

const titre = ref('')
const erreurAjout = ref('')

async function ajouter() {
  erreurAjout.value = ''
  try {
    await $fetch('/api/taches', { method: 'POST', body: { titre: titre.value } })
    titre.value = ''
    await refresh()
  }
  catch (e) {
    // Le serveur renvoie { message: '…' } en cas d'erreur 400.
    const message = (e as { data?: { message?: string } }).data?.message
    erreurAjout.value = message || 'Impossible d\'ajouter la tâche.'
  }
}
</script>

<template>
  <div>
    <h1>Tâches</h1>

    <label>
      Afficher :
      <select v-model="filtre" data-test="filtre">
        <option value="toutes">Toutes</option>
        <option value="faites">Faites</option>
        <option value="a-faire">À faire</option>
      </select>
    </label>

    <p v-if="status === 'pending'" data-test="chargement">Chargement…</p>
    <p v-else-if="error" data-test="erreur">Impossible de charger les tâches.</p>
    <ul v-else>
      <li v-for="tache in taches" :key="tache.id" data-test="tache">
        {{ tache.titre }}<span v-if="tache.fait"> ✓</span>
      </li>
    </ul>

    <form data-test="formulaire" @submit.prevent="ajouter">
      <input v-model="titre" data-test="titre" placeholder="Nouvelle tâche" aria-label="Titre de la tâche">
      <button type="submit">Ajouter</button>
    </form>
    <p v-if="erreurAjout" data-test="erreur-ajout">{{ erreurAjout }}</p>
  </div>
</template>
