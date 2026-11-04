<script setup>
import { createApp, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import App from '@tp/07-mini-blog-router/App.vue'
import { creerRouteur } from '@tp/07-mini-blog-router/router.js'

// Le mini-blog a son propre routeur : on le monte dans une petite application à part,
// à l'intérieur de la galerie. Les adresses apparaissent dans la barre du navigateur (#/…).
const cible = useTemplateRef('cible')
let app = null

onMounted(() => {
  app = createApp(App)
  app.use(creerRouteur())
  app.mount(cible.value)
})

onBeforeUnmount(() => {
  app?.unmount()
  app = null
})
</script>

<template>
  <p class="astuce">
    Essaie aussi de taper une adresse à la main : <code>#/articles/2</code>,
    <code>#/articles/999</code> ou <code>#/nimporte-quoi</code>.
  </p>
  <div ref="cible" class="blog-hote" />
</template>

<style scoped>
.astuce {
  margin-top: 0;
  color: var(--discret);
  font-size: 0.9rem;
}
</style>
