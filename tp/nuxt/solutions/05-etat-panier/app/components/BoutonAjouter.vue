<script setup lang="ts">
import type { Produit } from '~/utils/produits'

const props = defineProps<{ produit: Produit }>()

const { ajouter } = usePanier()
</script>

<template>
  <button type="button" data-test="bouton-ajouter" @click="ajouter(props.produit)">Ajouter au panier</button>
</template>
