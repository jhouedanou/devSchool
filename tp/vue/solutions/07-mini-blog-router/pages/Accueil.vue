<script setup>
import { articles } from '../articles.js'
</script>

<template>
  <section>
    <h1>Derniers articles</h1>
    <ul>
      <li v-for="article in articles" :key="article.id">
        <!-- Route nommée : l'adresse est construite par le routeur. -->
        <RouterLink :to="{ name: 'article', params: { id: article.id } }" data-test="lien-article">
          {{ article.titre }}
        </RouterLink>
      </li>
    </ul>
  </section>
</template>
