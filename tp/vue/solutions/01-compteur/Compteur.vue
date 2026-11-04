<script setup>
import { computed, ref } from 'vue'

// Vue 3.5 : on peut déstructurer les props et leur donner une valeur par défaut.
// Elles restent réactives (le compilateur remplace « min » par « props.min »).
const { min = 0, max = 10, pas = 1, initial } = defineProps({
  min: Number,
  max: Number,
  pas: Number,
  initial: Number,
})

// Ramène un nombre entre min et max.
function borner(nombre) {
  return Math.min(max, Math.max(min, nombre))
}

// Valeur de départ : « initial », ou « min » si initial est absent.
const depart = computed(() => borner(initial ?? min))
const valeur = ref(depart.value)

const auMin = computed(() => valeur.value <= min)
const auMax = computed(() => valeur.value >= max)

function diminuer() {
  valeur.value = borner(valeur.value - pas)
}

function augmenter() {
  valeur.value = borner(valeur.value + pas)
}

function reinitialiser() {
  valeur.value = depart.value
}
</script>

<template>
  <div class="compteur">
    <button type="button" data-test="moins" aria-label="Diminuer" :disabled="auMin" @click="diminuer">
      −
    </button>
    <output data-test="valeur" class="valeur">{{ valeur }}</output>
    <button type="button" data-test="plus" aria-label="Augmenter" :disabled="auMax" @click="augmenter">
      +
    </button>
    <button type="button" data-test="reinitialiser" @click="reinitialiser">Réinitialiser</button>
  </div>
</template>

<style scoped>
.compteur {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.valeur {
  min-width: 3ch;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
}
</style>
