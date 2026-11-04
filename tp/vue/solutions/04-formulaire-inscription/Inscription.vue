<script setup>
import { computed, reactive } from 'vue'

const emit = defineEmits(['inscrit'])

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

// Un message par champ. Chaîne vide = pas d'erreur.
const erreurs = computed(() => ({
  nom: form.nom.trim() === '' ? 'Le nom est obligatoire.' : '',
  email: REGEX_EMAIL.test(form.email.trim()) ? '' : "L'adresse email n'est pas valide.",
  motDePasse:
    form.motDePasse.length >= 8 ? '' : 'Le mot de passe doit contenir au moins 8 caractères.',
  confirmation:
    form.confirmation === form.motDePasse ? '' : 'Les mots de passe ne correspondent pas.',
}))

const valide = computed(
  () => Object.values(erreurs.value).every((message) => message === '') && form.cgu,
)

function envoyer() {
  if (!valide.value) {
    // Touche Entrée sur un formulaire incomplet : on montre toutes les erreurs.
    Object.keys(touche).forEach((champ) => (touche[champ] = true))
    return
  }
  // On n'envoie jamais le mot de passe dans l'événement.
  emit('inscrit', { nom: form.nom.trim(), email: form.email.trim() })
}
</script>

<template>
  <form class="inscription" novalidate @submit.prevent="envoyer">
    <label>
      Nom
      <input
        v-model="form.nom"
        data-test="nom"
        autocomplete="name"
        :aria-invalid="touche.nom && !!erreurs.nom"
        @blur="touche.nom = true"
      />
    </label>
    <p v-if="touche.nom && erreurs.nom" class="erreur" data-test="erreur-nom">{{ erreurs.nom }}</p>

    <label>
      Email
      <input
        v-model="form.email"
        type="email"
        data-test="email"
        autocomplete="email"
        :aria-invalid="touche.email && !!erreurs.email"
        @blur="touche.email = true"
      />
    </label>
    <p v-if="touche.email && erreurs.email" class="erreur" data-test="erreur-email">
      {{ erreurs.email }}
    </p>

    <label>
      Mot de passe
      <input
        v-model="form.motDePasse"
        type="password"
        data-test="mot-de-passe"
        autocomplete="new-password"
        :aria-invalid="touche.motDePasse && !!erreurs.motDePasse"
        @blur="touche.motDePasse = true"
      />
    </label>
    <p v-if="touche.motDePasse && erreurs.motDePasse" class="erreur" data-test="erreur-mot-de-passe">
      {{ erreurs.motDePasse }}
    </p>

    <label>
      Confirmation du mot de passe
      <input
        v-model="form.confirmation"
        type="password"
        data-test="confirmation"
        autocomplete="new-password"
        :aria-invalid="touche.confirmation && !!erreurs.confirmation"
        @blur="touche.confirmation = true"
      />
    </label>
    <p
      v-if="touche.confirmation && erreurs.confirmation"
      class="erreur"
      data-test="erreur-confirmation"
    >
      {{ erreurs.confirmation }}
    </p>

    <label class="cgu">
      <input v-model="form.cgu" type="checkbox" data-test="cgu" />
      J'accepte les conditions générales d'utilisation
    </label>

    <button type="submit" data-test="envoyer" :disabled="!valide">Créer mon compte</button>
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
[aria-invalid='true'] {
  border-color: #c0392b;
}
</style>
