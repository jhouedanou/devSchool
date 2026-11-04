<script setup>
import Panier from '@tp/06-panier-pinia/Panier.vue'
import { usePanierStore } from '@tp/06-panier-pinia/stores/panier.js'

// Ce composant et <Panier> utilisent le même store : ils partagent les données.
const panier = usePanierStore()

const produits = [
  { id: 1, nom: 'Stylo', prix: 1.5 },
  { id: 2, nom: 'Cahier', prix: 3.2 },
  { id: 3, nom: 'Trousse', prix: 7.9 },
]
</script>

<template>
  <div class="demo-panier">
    <section>
      <h3>Boutique</h3>
      <ul>
        <li v-for="produit in produits" :key="produit.id">
          {{ produit.nom }}
          <button type="button" @click="panier.ajouter(produit)">Ajouter</button>
        </li>
      </ul>
    </section>
    <Panier />
  </div>
</template>

<style scoped>
.demo-panier {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) 2fr;
  gap: 2rem;
}
ul {
  padding: 0;
  list-style: none;
}
li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.25rem 0;
}
h3 {
  margin-top: 0;
}
</style>
