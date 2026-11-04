<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

function retourAccueil() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="conteneur">
    <h1 data-test="code-erreur">{{ props.error.status }}</h1>
    <p data-test="message-erreur">{{ props.error.statusText || props.error.message }}</p>
    <button type="button" data-test="retour-accueil" @click="retourAccueil">Retour à l'accueil</button>
  </div>
</template>
