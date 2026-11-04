<script setup>
import { computed, ref } from 'vue'

const texte = ref('')
// Chaque tâche : { id: 1, texte: 'Acheter du pain', fait: false }
const taches = ref([])
let prochainId = 1

const filtres = [
  { valeur: 'toutes', libelle: 'Toutes' },
  { valeur: 'actives', libelle: 'Actives' },
  { valeur: 'terminees', libelle: 'Terminées' },
]
const filtre = ref('toutes')

const tachesVisibles = computed(() => {
  if (filtre.value === 'actives') return taches.value.filter((tache) => !tache.fait)
  if (filtre.value === 'terminees') return taches.value.filter((tache) => tache.fait)
  return taches.value
})

const restantes = computed(() => taches.value.filter((tache) => !tache.fait).length)

// En français, 0 et 1 sont au singulier.
const libelleRestantes = computed(() =>
  restantes.value > 1 ? `${restantes.value} tâches restantes` : `${restantes.value} tâche restante`,
)

function ajouter() {
  const propre = texte.value.trim()
  if (!propre) return
  taches.value.push({ id: prochainId++, texte: propre, fait: false })
  texte.value = ''
}

function supprimer(id) {
  taches.value = taches.value.filter((tache) => tache.id !== id)
}
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
      <li
        v-for="tache in tachesVisibles"
        :key="tache.id"
        data-test="tache"
        :class="{ fait: tache.fait }"
      >
        <label>
          <input v-model="tache.fait" type="checkbox" data-test="case" />
          <span data-test="texte">{{ tache.texte }}</span>
        </label>
        <button type="button" data-test="supprimer" @click="supprimer(tache.id)">Supprimer</button>
      </li>
    </ul>

    <nav class="filtres">
      <button
        v-for="f in filtres"
        :key="f.valeur"
        type="button"
        :data-test="`filtre-${f.valeur}`"
        :aria-pressed="filtre === f.valeur"
        @click="filtre = f.valeur"
      >
        {{ f.libelle }}
      </button>
    </nav>

    <p data-test="restantes">{{ libelleRestantes }}</p>
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
[aria-pressed='true'] {
  font-weight: 700;
}
</style>
