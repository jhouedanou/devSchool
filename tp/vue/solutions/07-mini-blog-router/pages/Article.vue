<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { trouverArticle } from '../articles.js'

const route = useRoute()

// computed : la page se met à jour si l'id change (/articles/1 → /articles/2).
// Vue Router réutilise le même composant : setup() ne repasse pas.
const article = computed(() => trouverArticle(route.params.id))
</script>

<template>
  <article v-if="article">
    <h1 data-test="titre">{{ article.titre }}</h1>
    <p data-test="contenu">{{ article.contenu }}</p>
    <RouterLink to="/">← Retour à l'accueil</RouterLink>
  </article>

  <section v-else data-test="article-introuvable">
    <h1>Article introuvable</h1>
    <p>Aucun article ne porte le numéro « {{ route.params.id }} ».</p>
    <RouterLink to="/">← Retour à l'accueil</RouterLink>
  </section>
</template>
