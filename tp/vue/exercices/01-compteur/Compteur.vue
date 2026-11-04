<script setup>
import { computed, ref } from 'vue'

// Les props sont prêtes. Vue 3.5 permet de les déstructurer avec une valeur
// par défaut : « min » vaut 0 si le parent ne le donne pas.
const { min = 0, max = 10, pas = 1, initial } = defineProps({
  min: Number,
  max: Number,
  pas: Number,
  initial: Number,
})

// TODO 1 : la valeur de départ est « initial », ou « min » si initial est absent.
//          Elle doit rester entre min et max.
//          Astuce : écris une fonction borner(nombre) avec Math.min et Math.max.
const valeur = ref(0)

// TODO 2 : retire « pas » à la valeur, sans descendre sous min.
function diminuer() {}

// TODO 3 : ajoute « pas » à la valeur, sans dépasser max.
function augmenter() {}

// TODO 4 : remets la valeur de départ.
function reinitialiser() {}

// TODO 5 : crée deux computed, « auMin » et « auMax » (true quand la valeur
//          est à la borne), puis utilise-les dans :disabled plus bas.
</script>

<template>
  <div class="compteur">
    <!-- TODO 5 : ajoute :disabled sur « − » et sur « + » -->
    <button type="button" data-test="moins" aria-label="Diminuer" @click="diminuer">−</button>
    <output data-test="valeur" class="valeur">{{ valeur }}</output>
    <button type="button" data-test="plus" aria-label="Augmenter" @click="augmenter">+</button>
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
