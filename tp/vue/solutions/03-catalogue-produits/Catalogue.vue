<script setup>
import { computed, ref } from 'vue'
import ProduitCarte from './ProduitCarte.vue'
import { formaterPrix } from './prix.js'

const { produits } = defineProps({
  produits: { type: Array, required: true },
})

const recherche = ref('')

// Ids des produits ajoutés au panier (un id par clic).
const panier = ref([])

const produitsFiltres = computed(() => {
  const texte = recherche.value.trim().toLowerCase()
  return produits.filter((produit) => produit.nom.toLowerCase().includes(texte))
})

const total = computed(() =>
  panier.value.reduce((somme, id) => {
    const produit = produits.find((p) => p.id === id)
    return somme + (produit ? produit.prix : 0)
  }, 0),
)

function ajouterAuPanier(id) {
  panier.value.push(id)
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
      <ProduitCarte
        v-for="produit in produitsFiltres"
        :key="produit.id"
        :produit="produit"
        @ajouter="ajouterAuPanier"
      />
    </div>

    <p v-if="produitsFiltres.length === 0" data-test="aucun-resultat">
      Aucun produit ne correspond à ta recherche.
    </p>

    <p class="panier">
      Total du panier : <strong data-test="total">{{ formaterPrix(total) }}</strong>
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
