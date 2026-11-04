<script setup>
import { computed, ref, watch } from 'vue'
import { tps } from './tps.js'

// Dossier affiché : exercices/ (npm run dev) ou solutions/ (npm run dev:solutions).
const dossier = import.meta.env.MODE === 'solution' ? 'solutions' : 'exercices'

// On retient le dernier TP ouvert (si le navigateur le permet).
const CLE = 'devschool-tp-vue:tp'
function lireChoix() {
  try {
    return localStorage.getItem(CLE)
  } catch {
    return null
  }
}
const choixEnregistre = lireChoix()
const choisi = ref(tps.some((t) => t.id === choixEnregistre) ? choixEnregistre : tps[0].id)

const tp = computed(() => tps.find((t) => t.id === choisi.value))

// Journal des événements émis par le composant du TP (ex. « inscrit » au TP 04).
const journal = ref([])
const ecouteurs = computed(() =>
  Object.fromEntries(
    (tp.value.evenements ?? []).map((nom) => [
      nom,
      (...valeurs) => {
        journal.value.unshift({
          nom,
          heure: new Date().toLocaleTimeString('fr-FR'),
          valeur: JSON.stringify(valeurs.length === 1 ? valeurs[0] : valeurs),
        })
      },
    ]),
  ),
)

watch(choisi, (id) => {
  journal.value = []
  try {
    localStorage.setItem(CLE, id)
  } catch {
    // Stockage indisponible : tant pis, on garde le choix en mémoire.
  }
})
</script>

<template>
  <div class="galerie">
    <aside class="menu">
      <h1>TP Vue <small>devSchool</small></h1>
      <p class="dossier" :class="dossier">
        Dossier : <code>{{ dossier }}/</code>
      </p>
      <nav>
        <button
          v-for="t in tps"
          :key="t.id"
          type="button"
          class="entree"
          :aria-current="t.id === choisi ? 'page' : undefined"
          @click="choisi = t.id"
        >
          <span class="numero">{{ t.id.slice(0, 2) }}</span>
          <span class="titre">{{ t.titre }}</span>
          <span class="niveau" :title="`Niveau ${t.niveau}`">{{ '●'.repeat(t.niveau) }}</span>
        </button>
      </nav>
    </aside>

    <main class="contenu">
      <header class="entete">
        <h2>{{ tp.titre }}</h2>
        <p>
          Code : <code>{{ dossier }}/{{ tp.id }}/</code> · Énoncé :
          <code>enonces/{{ tp.id }}.md</code> · Tests : <code>npm test -- {{ tp.id }}</code>
        </p>
      </header>

      <div class="scene">
        <component :is="tp.composant" :key="tp.id" v-bind="tp.props ?? {}" v-on="ecouteurs" />
      </div>

      <section v-if="tp.evenements" class="journal">
        <h3>Événements émis</h3>
        <p v-if="journal.length === 0" class="discret">Aucun pour l'instant.</p>
        <ol v-else>
          <li v-for="(ligne, i) in journal" :key="journal.length - i">
            <span class="discret">{{ ligne.heure }}</span> · <strong>{{ ligne.nom }}</strong>
            <code>{{ ligne.valeur }}</code>
          </li>
        </ol>
      </section>
    </main>
  </div>
</template>
