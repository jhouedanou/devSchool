<script setup>
import { storeToRefs } from 'pinia'
import { usePanierStore } from './stores/panier.js'

const panier = usePanierStore()

// TODO 1 : récupère articles, total et nombreArticles avec storeToRefs(panier)
//          (sinon, ils perdent leur réactivité quand on les déstructure).
// TODO 2 : récupère les actions retirer et vider (directement depuis « panier »).

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
</script>

<template>
  <section class="panier">
    <!-- TODO 3 : affiche le nombre d'articles dans <span data-test="nombre"> -->
    <h2>Mon panier</h2>

    <!-- TODO 4 : affiche ce message seulement si le panier est vide -->
    <p data-test="vide">Ton panier est vide.</p>

    <!-- TODO 5 : sinon, affiche :
         - un <li data-test="article"> par article : nom,
           quantité dans <span data-test="quantite">, prix × quantité (euros.format),
           bouton <button data-test="retirer">Retirer</button> ;
         - le total dans <strong data-test="total"> (euros.format) ;
         - un bouton <button data-test="vider">Vider le panier</button>. -->
  </section>
</template>

<style scoped>
.lignes {
  padding: 0;
  list-style: none;
}
.lignes li {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 1rem;
  padding: 0.25rem 0;
}
</style>
