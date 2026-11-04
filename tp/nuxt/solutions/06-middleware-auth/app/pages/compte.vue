<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { utilisateur, deconnecter } = useAuth()

async function seDeconnecter() {
  deconnecter()
  await navigateTo('/connexion')
}
</script>

<template>
  <div>
    <h1>Mon compte</h1>
    <p data-test="bienvenue">Bonjour {{ utilisateur?.nom }} !</p>
    <button type="button" data-test="deconnexion" @click="seDeconnecter">Se déconnecter</button>
  </div>
</template>
