<script setup>
import { computed } from 'vue'
import { formaterPrix } from './prix.js'

// produit : { id, nom, prix, stock }
const { produit } = defineProps({
  produit: { type: Object, required: true },
})

const emit = defineEmits(['ajouter'])

const enRupture = computed(() => produit.stock <= 0)
</script>

<template>
  <article class="carte" data-test="produit">
    <h3 data-test="nom">{{ produit.nom }}</h3>
    <p data-test="prix" class="prix">{{ formaterPrix(produit.prix) }}</p>
    <p v-if="enRupture" data-test="rupture" class="rupture">Rupture de stock</p>
    <p v-else class="stock">En stock : {{ produit.stock }}</p>
    <!-- Le parent décide quoi faire : la carte envoie seulement l'id. -->
    <button type="button" data-test="ajouter" :disabled="enRupture" @click="emit('ajouter', produit.id)">
      Ajouter au panier
    </button>
  </article>
</template>

<style scoped>
.carte {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem;
  border: 1px solid var(--bord, #ddd);
  border-radius: 8px;
}
.carte h3,
.carte p {
  margin: 0;
}
.carte button {
  margin-top: auto;
}
.prix {
  font-size: 1.25rem;
  font-weight: 700;
}
.rupture {
  color: #c0392b;
}
.stock {
  color: #2e7d32;
}
</style>
