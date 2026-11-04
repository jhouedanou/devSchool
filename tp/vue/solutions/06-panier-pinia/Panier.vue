<script setup>
import { storeToRefs } from 'pinia'
import { usePanierStore } from './stores/panier.js'

const panier = usePanierStore()

// storeToRefs garde la réactivité quand on déstructure l'état et les getters.
const { articles, total, nombreArticles } = storeToRefs(panier)
// Les actions se déstructurent directement.
const { retirer, vider } = panier

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
</script>

<template>
  <section class="panier">
    <h2>Mon panier (<span data-test="nombre">{{ nombreArticles }}</span>)</h2>

    <p v-if="articles.length === 0" data-test="vide">Ton panier est vide.</p>

    <template v-else>
      <ul class="lignes">
        <li v-for="article in articles" :key="article.id" data-test="article">
          <span class="nom">{{ article.nom }}</span>
          <span>× <span data-test="quantite">{{ article.quantite }}</span></span>
          <span>{{ euros.format(article.prix * article.quantite) }}</span>
          <button type="button" data-test="retirer" @click="retirer(article.id)">Retirer</button>
        </li>
      </ul>
      <p>
        Total : <strong data-test="total">{{ euros.format(total) }}</strong>
      </p>
      <button type="button" data-test="vider" @click="vider">Vider le panier</button>
    </template>
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
