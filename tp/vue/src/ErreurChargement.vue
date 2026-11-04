<script setup>
defineProps({ error: { type: Error, default: null } })
</script>

<template>
  <div class="erreur-chargement">
    <p><strong>Impossible d'afficher ce TP.</strong></p>
    <p v-if="error"><code>{{ error.message }}</code></p>
    <p>Regarde le terminal où tourne <code>npm run dev</code> et la console du navigateur (F12).</p>
  </div>
</template>
