<script setup lang="ts">
const { nombre, total } = usePanier()
</script>

<template>
  <p data-test="resume-panier">
    <template v-if="nombre === 0">Panier vide</template>
    <template v-else>
      Panier : <span data-test="panier-nombre">{{ nombre }}</span> article(s),
      <span data-test="panier-total">{{ total }} €</span>
    </template>
  </p>
</template>
