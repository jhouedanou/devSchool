export default {
  id: '07-middleware-auth',
  titre: 'Un middleware d\'authentification',
  type: 'js',
  consigne: `Tu écris le middleware global \`app/middleware/auth.global.ts\`. Il s'exécute avant chaque changement de page et reçoit la route d'arrivée \`to\`.

Règles :

1. Les pages protégées commencent par \`/compte\` ou \`/admin\`.
2. Un visiteur (\`utilisateur.value\` vaut \`null\`) qui va sur une page protégée est redirigé : \`return navigateTo('/connexion')\`.
3. Un utilisateur connecté **sans** le rôle \`'admin'\` qui va sur \`/admin…\` est bloqué : \`return abortNavigation(createError({ status: 403, statusText: 'Accès refusé' }))\`.
4. Un utilisateur connecté qui va sur \`/connexion\` est envoyé sur \`/compte\`.
5. Dans tous les autres cas, ne renvoie rien : la navigation continue.

> Simulation : en haut du fichier, des versions simplifiées de \`defineNuxtRouteMiddleware\`, \`navigateTo\`, \`abortNavigation\` et \`createError\` (auto-importés dans Nuxt), et un composable \`useUtilisateur()\`. Les tests appellent ton middleware avec un objet \`to\` comme \`{ path: '/compte' }\`.`,
  depart: `// ─── Simulation de Nuxt : ne modifie pas cette partie ───
function defineNuxtRouteMiddleware(middleware) { return middleware }
function navigateTo(chemin) { return { redirection: chemin } }
function abortNavigation(erreur) { return { annulation: true, erreur } }
function createError({ status, statusText }) {
  const e = new Error(statusText)
  e.statusCode = status
  e.statusMessage = statusText
  return e
}
// Dans Nuxt : app/composables/useUtilisateur.ts → useState('utilisateur', () => null)
const utilisateur = { value: null }
function useUtilisateur() { return utilisateur }
export function connecter(u) { utilisateur.value = u }
// ────────────────────────────────────────────────────────

// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const utilisateur = useUtilisateur()
  // TODO : applique les règles de la consigne
})
`,
  solution: `// ─── Simulation de Nuxt : ne modifie pas cette partie ───
function defineNuxtRouteMiddleware(middleware) { return middleware }
function navigateTo(chemin) { return { redirection: chemin } }
function abortNavigation(erreur) { return { annulation: true, erreur } }
function createError({ status, statusText }) {
  const e = new Error(statusText)
  e.statusCode = status
  e.statusMessage = statusText
  return e
}
// Dans Nuxt : app/composables/useUtilisateur.ts → useState('utilisateur', () => null)
const utilisateur = { value: null }
function useUtilisateur() { return utilisateur }
export function connecter(u) { utilisateur.value = u }
// ────────────────────────────────────────────────────────

// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const utilisateur = useUtilisateur()
  const protegee = to.path.startsWith('/compte') || to.path.startsWith('/admin')

  if (!utilisateur.value) {
    if (protegee) return navigateTo('/connexion')
    return
  }

  if (to.path === '/connexion') {
    return navigateTo('/compte')
  }

  if (to.path.startsWith('/admin') && utilisateur.value.role !== 'admin') {
    return abortNavigation(createError({ status: 403, statusText: 'Accès refusé' }))
  }
})
`,
  indices: [
    'Teste le chemin avec `to.path.startsWith(\'/compte\')`.',
    'N\'oublie pas `return` devant `navigateTo()` et `abortNavigation()` : c\'est la valeur renvoyée qui change la navigation.',
    'Ne redirige jamais un visiteur qui va déjà sur `/connexion` : tu créerais une boucle infinie.',
  ],
  tests: [
    {
      nom: 'Un visiteur est redirigé de /compte vers /connexion',
      aide: 'Si `utilisateur.value` est `null` et que la page est protégée : `return navigateTo(\'/connexion\')`.',
      run: async (t) => {
        const resultat = await t.module.default({ path: '/compte' }, { path: '/' });
        t.expect(resultat).toEqual({ redirection: '/connexion' });
      },
    },
    {
      nom: 'Les pages /admin… sont aussi protégées',
      run: async (t) => {
        const resultat = await t.module.default({ path: '/admin/stats' }, { path: '/' });
        t.expect(resultat).toEqual({ redirection: '/connexion' });
      },
    },
    {
      nom: 'Pages publiques : pas de redirection (ni de boucle)',
      aide: 'Ne renvoie rien pour `/` et `/connexion` quand l\'utilisateur n\'est pas connecté.',
      run: async (t) => {
        t.expect(await t.module.default({ path: '/' }, { path: '/' })).toBeUndefined();
        t.expect(await t.module.default({ path: '/connexion' }, { path: '/compte' })).toBeUndefined();
      },
    },
    {
      nom: 'Un membre est bloqué sur /admin (erreur 403)',
      aide: '`return abortNavigation(createError({ status: 403, statusText: \'Accès refusé\' }))`',
      run: async (t) => {
        t.module.connecter({ nom: 'Léa', role: 'membre' });
        const resultat = await t.module.default({ path: '/admin' }, { path: '/' });
        t.expect(resultat && resultat.annulation).toBe(true);
        t.expect(resultat.erreur.statusCode).toBe(403);
      },
    },
    {
      nom: 'Un admin et un membre accèdent à leurs pages',
      run: async (t) => {
        t.module.connecter({ nom: 'Ada', role: 'admin' });
        t.expect(await t.module.default({ path: '/admin' }, { path: '/' })).toBeUndefined();
        t.module.connecter({ nom: 'Léa', role: 'membre' });
        t.expect(await t.module.default({ path: '/compte' }, { path: '/' })).toBeUndefined();
      },
    },
    {
      nom: 'Un utilisateur connecté qui va sur /connexion part sur /compte',
      run: async (t) => {
        t.module.connecter({ nom: 'Léa', role: 'membre' });
        const resultat = await t.module.default({ path: '/connexion' }, { path: '/' });
        t.expect(resultat).toEqual({ redirection: '/compte' });
      },
    },
  ],
};
