<template>
  <div class="blog">
    <header class="entete">
      <RouterLink to="/" class="logo">Mini-blog</RouterLink>
      <nav>
        <RouterLink to="/">Accueil</RouterLink>
      </nav>
    </header>

    <main>
      <!-- Ici s'affiche la page de la route courante. -->
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--bord, #ddd);
}
.logo {
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
}
</style>
