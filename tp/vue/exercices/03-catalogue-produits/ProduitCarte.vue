<script setup>
import { computed } from 'vue'
import { formaterPrix } from './prix.js'

// TODO 1 : déclare la prop « produit » (objet obligatoire) avec defineProps.
//          Un produit : { id: 1, nom: 'Clavier', prix: 89.9, stock: 5 }

// TODO 2 : déclare l'événement « ajouter » avec defineEmits.

// TODO 3 : crée un computed « enRupture » : true quand le stock est à 0.
</script>

<template>
  <article class="carte" data-test="produit">
    <!-- TODO 4 : affiche le nom dans <h3 data-test="nom"> -->
    <!-- TODO 5 : affiche le prix avec formaterPrix() dans <p data-test="prix"> -->
    <!-- TODO 6 : si le stock est à 0, affiche <p data-test="rupture">Rupture de stock</p> -->
    <p>Produit à afficher</p>

    <!-- TODO 7 : au clic, émets « ajouter » avec l'id du produit.
                  Désactive le bouton si le produit est en rupture. -->
    <button type="button" data-test="ajouter">Ajouter au panier</button>
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
</style>
