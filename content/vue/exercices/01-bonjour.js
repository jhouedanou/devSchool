export default {
  id: '01-bonjour',
  titre: 'Bonjour Vue',
  type: 'vue',
  consigne: `Affiche une petite fiche de profil avec l'interpolation \`{{ }}\`.

1. Dans \`<script setup>\`, déclare \`prenom\` (valeur \`'Ada'\`) et \`langages\` (valeur \`['Vue', 'JavaScript', 'CSS']\`).
2. Dans le \`<h1>\`, affiche \`Bonjour Ada !\` avec \`{{ prenom }}\`.
3. Dans \`.nombre\`, affiche \`Ada connaît 3 langages.\` avec \`langages.length\`.
4. Dans \`.prefere\`, affiche \`Langage préféré : Vue\` (le premier élément du tableau).
5. Dans le \`<footer>\`, affiche \`© \` suivi de l'année en cours, calculée avec \`new Date().getFullYear()\`.

Écris des expressions dans \`{{ }}\` : n'écris pas les valeurs à la main dans le HTML.`,
  depart: `<script setup>
// TODO 1 : déclare prenom ('Ada') et langages (['Vue', 'JavaScript', 'CSS'])
</script>

<template>
  <article class="profil">
    <!-- TODO 2 : « Bonjour Ada ! » avec {{ prenom }} -->
    <h1>Bonjour !</h1>

    <!-- TODO 3 : « Ada connaît 3 langages. » avec langages.length -->
    <p class="nombre"></p>

    <!-- TODO 4 : « Langage préféré : Vue » (premier élément du tableau) -->
    <p class="prefere"></p>

    <!-- TODO 5 : « © » suivi de l'année en cours -->
    <footer></footer>
  </article>
</template>

<style scoped>
.profil {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
}
h1 {
  color: #42b883;
}
</style>
`,
  solution: `<script setup>
const prenom = 'Ada'
const langages = ['Vue', 'JavaScript', 'CSS']
</script>

<template>
  <article class="profil">
    <h1>Bonjour {{ prenom }} !</h1>
    <p class="nombre">{{ prenom }} connaît {{ langages.length }} langages.</p>
    <p class="prefere">Langage préféré : {{ langages[0] }}</p>
    <footer>© {{ new Date().getFullYear() }}</footer>
  </article>
</template>

<style scoped>
.profil {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
}
h1 {
  color: #42b883;
}
</style>
`,
  indices: [
    'Une variable déclarée au premier niveau de <script setup> est utilisable directement dans le template.',
    'Entre {{ }}, tu peux écrire une expression : {{ langages.length }}, {{ langages[0] }}, {{ new Date().getFullYear() }}.',
  ],
  tests: [
    {
      nom: 'Le titre affiche « Bonjour Ada ! »',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('h1').text()).toBe('Bonjour Ada !');
      },
    },
    {
      nom: 'Le nombre de langages est affiché',
      aide: 'Utilise {{ langages.length }} pour le nombre.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.nombre').text()).toBe('Ada connaît 3 langages.');
      },
    },
    {
      nom: 'Le langage préféré est le premier du tableau',
      aide: 'Le premier élément d\'un tableau : langages[0].',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.prefere').text()).toBe('Langage préféré : Vue');
      },
    },
    {
      nom: "L'année en cours est dans le pied de page",
      aide: 'Écris {{ new Date().getFullYear() }} dans le <footer>.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('footer').text()).toBe('© ' + new Date().getFullYear());
      },
    },
  ],
};
