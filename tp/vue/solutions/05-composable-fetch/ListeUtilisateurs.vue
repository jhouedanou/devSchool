<script setup>
import { useFetch } from './useFetch.js'

// La galerie (npm run dev) sert ce fichier : public/api/utilisateurs.json
const { url = '/api/utilisateurs.json' } = defineProps({
  url: String,
})

// On passe un getter : si la prop « url » change, useFetch relance la requête.
const { data: utilisateurs, error, loading, refresh } = useFetch(() => url)
</script>

<template>
  <section class="utilisateurs">
    <button type="button" data-test="recharger" :disabled="loading" @click="refresh">Recharger</button>

    <p v-if="loading" data-test="chargement">Chargement…</p>
    <p v-else-if="error" data-test="erreur" class="erreur">
      Impossible de charger les utilisateurs : {{ error.message }}
    </p>
    <ul v-else-if="utilisateurs" class="liste">
      <li v-for="utilisateur in utilisateurs" :key="utilisateur.id" data-test="utilisateur">
        <strong>{{ utilisateur.nom }}</strong> — {{ utilisateur.email }}
      </li>
    </ul>
  </section>
</template>

<style scoped>
.utilisateurs {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}
.erreur {
  color: #c0392b;
}
</style>
