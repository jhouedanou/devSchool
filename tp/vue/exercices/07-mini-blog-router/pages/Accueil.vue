<script setup>
import { articles } from '../articles.js'
</script>

<template>
  <section>
    <h1>Derniers articles</h1>
    <!-- TODO : une liste <ul> avec un <li> par article.
         Dans chaque <li>, un <RouterLink data-test="lien-article"> vers /articles/:id
         qui affiche le titre de l'article.
         Astuce : :to="{ name: 'article', params: { id: article.id } }" -->
    <p>{{ articles.length }} articles à afficher.</p>
  </section>
</template>
