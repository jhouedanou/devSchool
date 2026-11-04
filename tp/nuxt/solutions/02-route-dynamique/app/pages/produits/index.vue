<template>
  <div>
    <h1>Produits</h1>
    <ul>
      <li v-for="produit in produits" :key="produit.id" data-test="produit">
        <NuxtLink :to="`/produits/${produit.id}`">{{ produit.nom }}</NuxtLink>
        · {{ produit.prix }} €
      </li>
    </ul>
  </div>
</template>
