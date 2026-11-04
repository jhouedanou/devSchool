<script setup lang="ts">
const { connecter } = useAuth()

const nom = ref('')

async function valider() {
  const nomPropre = nom.value.trim()
  if (!nomPropre) {
    return
  }
  connecter(nomPropre)
  await navigateTo('/compte')
}
</script>

<template>
  <div>
    <h1>Connexion</h1>
    <form data-test="formulaire-connexion" @submit.prevent="valider">
      <label>
        Ton nom :
        <input v-model="nom" data-test="nom" autocomplete="name">
      </label>
      <button type="submit">Se connecter</button>
    </form>
  </div>
</template>
