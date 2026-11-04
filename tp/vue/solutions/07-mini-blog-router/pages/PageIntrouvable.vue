<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section data-test="page-introuvable">
    <h1>Page introuvable</h1>
    <p>L'adresse <code>{{ route.fullPath }}</code> n'existe pas.</p>
    <RouterLink to="/">← Retour à l'accueil</RouterLink>
  </section>
</template>
