<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { trouverArticle } from '../articles.js'

// TODO 1 : récupère la route courante avec useRoute().

// TODO 2 : crée un computed « article » avec trouverArticle(route.params.id).
//          Pourquoi un computed ? Quand on passe de /articles/1 à /articles/2,
//          Vue Router garde le même composant : setup() ne repasse pas.
</script>

<template>
  <!-- TODO 3 : si l'article existe :
         <h1 data-test="titre"> avec le titre
         <p data-test="contenu"> avec le contenu
         un <RouterLink to="/"> pour revenir à l'accueil
       sinon :
         <h1>Article introuvable</h1> et un lien vers l'accueil -->
  <section>
    <p>Page d'un article.</p>
  </section>
</template>
