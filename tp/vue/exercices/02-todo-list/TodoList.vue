<script setup>
import { computed, ref } from 'vue'

const texte = ref('')
// Chaque tâche : { id: 1, texte: 'Acheter du pain', fait: false }
const taches = ref([])
let prochainId = 1

// TODO 1 : ajoute une tâche { id, texte, fait: false }.
//          - nettoie le texte avec trim() ;
//          - refuse un texte vide ;
//          - vide le champ après l'ajout.
function ajouter() {}

// TODO 2 : supprime la tâche qui a cet id (filter).
function supprimer(id) {}

// TODO 3 : crée un ref « filtre » ('toutes', 'actives' ou 'terminees')
//          et un computed « tachesVisibles » qui applique ce filtre.

// TODO 4 : crée un computed qui compte les tâches pas encore faites, puis le texte :
//          « 0 tâche restante », « 1 tâche restante », « 2 tâches restantes »…
</script>

<template>
  <section class="todo">
    <form class="ajout" @submit.prevent="ajouter">
      <input
        v-model="texte"
        data-test="nouvelle-tache"
        placeholder="Nouvelle tâche"
        aria-label="Nouvelle tâche"
      />
      <button type="submit" data-test="ajouter">Ajouter</button>
    </form>

    <ul class="liste">
      <!-- TODO 5 : une ligne par tâche visible (v-for avec :key) :
           <li data-test="tache">
             <input type="checkbox" data-test="case">  liée à tache.fait avec v-model
             <span data-test="texte">                  le texte de la tâche
             <button data-test="supprimer">Supprimer</button>
           </li> -->
    </ul>

    <nav class="filtres">
      <!-- TODO 6 : au clic, change le filtre -->
      <button type="button" data-test="filtre-toutes">Toutes</button>
      <button type="button" data-test="filtre-actives">Actives</button>
      <button type="button" data-test="filtre-terminees">Terminées</button>
    </nav>

    <!-- TODO 7 : affiche le texte du TODO 4 -->
    <p data-test="restantes">0 tâche restante</p>
  </section>
</template>

<style scoped>
.ajout,
.filtres {
  display: flex;
  gap: 0.5rem;
}
.liste {
  padding: 0;
  list-style: none;
}
.liste li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}
.fait [data-test='texte'] {
  text-decoration: line-through;
  opacity: 0.6;
}
</style>
