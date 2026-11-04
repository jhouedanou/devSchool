<script setup>
import { useFetch } from './useFetch.js'

// La galerie (npm run dev) sert ce fichier : public/api/utilisateurs.json
const { url = '/api/utilisateurs.json' } = defineProps({
  url: String,
})

// TODO 1 : appelle useFetch avec un getter, () => url, pour suivre la prop.
//          Récupère data (renomme-le « utilisateurs »), error, loading et refresh.
</script>

<template>
  <section class="utilisateurs">
    <!-- TODO 2 : bouton <button data-test="recharger">Recharger</button> qui appelle refresh -->

    <!-- TODO 3 : pendant le chargement : <p data-test="chargement">Chargement…</p> -->

    <!-- TODO 4 : en cas d'erreur : <p data-test="erreur"> avec error.message -->

    <!-- TODO 5 : sinon, la liste : un <li data-test="utilisateur"> par utilisateur
                  (nom et email). Utilise v-if / v-else-if. -->
    <p>À toi de jouer : branche useFetch sur ce composant.</p>
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
