<script setup>
import { computed, ref } from 'vue'
import ProduitCarte from './ProduitCarte.vue'
import { formaterPrix } from './prix.js'

const { produits } = defineProps({
  produits: { type: Array, required: true },
})

const recherche = ref('')

// TODO 1 : crée un computed « produitsFiltres » : les produits dont le nom
//          contient le texte cherché, sans tenir compte des majuscules.
//          Astuce : toLowerCase() et includes().

// TODO 2 : garde les produits ajoutés dans un ref (par exemple un tableau d'ids)
//          et calcule le total du panier avec un computed.

function ajouterAuPanier(id) {
  // TODO 3 : ajoute ce produit au panier.
}
</script>

<template>
  <section class="catalogue">
    <input
      v-model="recherche"
      type="search"
      data-test="recherche"
      placeholder="Rechercher un produit"
      aria-label="Rechercher un produit"
    />

    <div class="grille">
      <!-- TODO 4 : affiche « produitsFiltres » et écoute l'événement « ajouter » -->
      <ProduitCarte v-for="produit in produits" :key="produit.id" :produit="produit" />
    </div>

    <!-- TODO 5 : si aucun produit ne correspond, affiche :
         <p data-test="aucun-resultat">Aucun produit ne correspond à ta recherche.</p> -->

    <!-- TODO 6 : affiche le vrai total -->
    <p class="panier">
      Total du panier : <strong data-test="total">{{ formaterPrix(0) }}</strong>
    </p>
  </section>
</template>

<style scoped>
.catalogue {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.grille {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
}
.panier {
  font-size: 1.1rem;
}
</style>
