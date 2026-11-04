<script setup>
import { computed, reactive } from 'vue'

// TODO 1 : déclare l'événement « inscrit » avec defineEmits.

const form = reactive({
  nom: '',
  email: '',
  motDePasse: '',
  confirmation: '',
  cgu: false,
})

// Un champ est « touché » quand l'utilisateur l'a quitté (événement blur).
// On n'affiche son erreur qu'à partir de ce moment.
const touche = reactive({
  nom: false,
  email: false,
  motDePasse: false,
  confirmation: false,
})

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// TODO 2 : un message par champ. Chaîne vide = pas d'erreur.
//   nom          : obligatoire (pense à trim)  → « Le nom est obligatoire. »
//   email        : REGEX_EMAIL.test(...)       → « L'adresse email n'est pas valide. »
//   motDePasse   : 8 caractères minimum        → « Le mot de passe doit contenir au moins 8 caractères. »
//   confirmation : égale au mot de passe       → « Les mots de passe ne correspondent pas. »
const erreurs = computed(() => ({
  nom: '',
  email: '',
  motDePasse: '',
  confirmation: '',
}))

// TODO 3 : le formulaire est valide s'il n'y a aucune erreur ET si les CGU sont cochées.
const valide = computed(() => true)

function envoyer() {
  // TODO 4 : si le formulaire est valide, émets « inscrit » avec { nom, email }.
  //          N'envoie jamais le mot de passe.
}
</script>

<template>
  <form class="inscription" novalidate @submit.prevent="envoyer">
    <!-- Exemple complet pour le champ « nom ». Fais pareil pour les autres. -->
    <label>
      Nom
      <input v-model="form.nom" data-test="nom" autocomplete="name" @blur="touche.nom = true" />
    </label>
    <p v-if="touche.nom && erreurs.nom" class="erreur" data-test="erreur-nom">{{ erreurs.nom }}</p>

    <!-- TODO 5 : @blur + message <p data-test="erreur-email"> -->
    <label>
      Email
      <input v-model="form.email" type="email" data-test="email" autocomplete="email" />
    </label>

    <!-- TODO 6 : @blur + message <p data-test="erreur-mot-de-passe"> -->
    <label>
      Mot de passe
      <input
        v-model="form.motDePasse"
        type="password"
        data-test="mot-de-passe"
        autocomplete="new-password"
      />
    </label>

    <!-- TODO 7 : @blur + message <p data-test="erreur-confirmation"> -->
    <label>
      Confirmation du mot de passe
      <input
        v-model="form.confirmation"
        type="password"
        data-test="confirmation"
        autocomplete="new-password"
      />
    </label>

    <label class="cgu">
      <input v-model="form.cgu" type="checkbox" data-test="cgu" />
      J'accepte les conditions générales d'utilisation
    </label>

    <!-- TODO 8 : désactive le bouton tant que le formulaire n'est pas valide -->
    <button type="submit" data-test="envoyer">Créer mon compte</button>
  </form>
</template>

<style scoped>
.inscription {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 360px;
}
.inscription label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.inscription .cgu {
  flex-direction: row;
  align-items: center;
}
.erreur {
  margin: 0;
  color: #c0392b;
  font-size: 0.9rem;
}
</style>
