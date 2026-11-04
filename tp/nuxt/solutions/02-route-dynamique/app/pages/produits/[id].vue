<script setup lang="ts">
const route = useRoute()
const produit = trouverProduit(Number(route.params.id))

if (!produit) {
  // fatal: true affiche la page d'erreur, même lors d'une navigation côté client.
  throw createError({ status: 404, statusText: 'Produit introuvable', fatal: true })
}
</script>

<template>
  <article v-if="produit">
    <h1>{{ produit.nom }}</h1>
    <p data-test="prix">{{ produit.prix }} €</p>
    <p>{{ produit.description }}</p>
    <NuxtLink to="/produits">Retour aux produits</NuxtLink>
  </article>
</template>
