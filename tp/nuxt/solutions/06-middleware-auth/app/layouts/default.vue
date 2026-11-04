<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">Accueil</NuxtLink>
        <NuxtLink to="/produits">Produits</NuxtLink>
        <NuxtLink to="/taches">Tâches</NuxtLink>
        <NuxtLink to="/compte">Mon compte</NuxtLink>
        <NuxtLink to="/a-propos">À propos</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>
      <ResumePanier />
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
