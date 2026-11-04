<script setup>
import Compteur from '@tp/01-compteur/Compteur.vue'

// Le même composant avec des props différentes.
const exemples = [
  { legende: 'Par défaut (min 0, max 10, pas 1)', props: {} },
  { legende: 'initial 4, pas 3', props: { initial: 4, pas: 3 } },
  { legende: 'min -5, max 5, initial 0', props: { min: -5, max: 5, initial: 0 } },
]
</script>

<template>
  <div class="demo-compteur">
    <figure v-for="exemple in exemples" :key="exemple.legende">
      <figcaption>{{ exemple.legende }}</figcaption>
      <Compteur v-bind="exemple.props" />
    </figure>
  </div>
</template>

<style scoped>
.demo-compteur {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
figure {
  margin: 0;
}
figcaption {
  margin-bottom: 0.4rem;
  color: var(--discret);
  font-size: 0.9rem;
}
</style>
