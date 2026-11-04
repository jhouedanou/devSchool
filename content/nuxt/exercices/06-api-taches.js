export default {
  id: '06-api-taches',
  titre: 'Des handlers Nitro pour une API de tâches',
  type: 'js',
  consigne: `Tu écris la logique de trois fichiers serveur. Dans un vrai projet, ce seraient :

- \`server/utils/validerTache.ts\` → la fonction \`validerTache\` ;
- \`server/api/taches.post.ts\` → le handler \`creerTache\` (POST /api/taches) ;
- \`server/api/taches/[id].get.ts\` → le handler \`lireTache\` (GET /api/taches/:id).

1. \`validerTache(corps)\` : renvoie \`{ titre }\` avec le titre sans espaces autour (\`trim()\`). Si le titre manque ou est vide, **lève une erreur** (\`throw new Error('Le titre est obligatoire')\`).
2. \`creerTache\` : lis le corps avec \`readValidatedBody(event, validerTache)\`, ajoute \`{ id, titre, faite: false }\` dans \`taches\` (id = taille du tableau + 1), passe le statut à 201 avec \`setResponseStatus(event, 201)\` et renvoie la tâche.
3. \`lireTache\` : lis l'id avec \`getRouterParam(event, 'id')\` (c'est une chaîne !). Si la tâche n'existe pas, \`throw createError({ status: 404, statusText: 'Tâche introuvable' })\`. Sinon, renvoie-la.

> Simulation : il n'y a pas de serveur. Le haut du fichier imite les helpers de Nitro (h3), auto-importés dans un vrai projet. Un « event » est ici un simple objet \`{ body, params }\`. Ne modifie pas cette partie.`,
  depart: `// ─── Simulation de Nitro : ne modifie pas cette partie ───
function defineEventHandler(handler) { return handler }
async function readBody(event) { return event.body }
async function readValidatedBody(event, valider) {
  const corps = await readBody(event)
  try {
    const resultat = await valider(corps)
    if (resultat === false) throw new Error('Validation Error')
    return resultat === true ? corps : resultat
  } catch (e) {
    throw createError({ status: 400, statusText: 'Validation Error', message: e.message })
  }
}
function getRouterParam(event, nom) { return event.params ? event.params[nom] : undefined }
function setResponseStatus(event, code) { event.statut = code }
function createError({ status, statusText, message }) {
  const erreur = new Error(message || statusText)
  erreur.statusCode = status
  erreur.statusMessage = statusText
  return erreur
}
const taches = [{ id: 1, titre: 'Lire la doc de Nitro', faite: false }]
// ─────────────────────────────────────────────────────────

// server/utils/validerTache.ts
export function validerTache(corps) {
  // TODO 1
}

// server/api/taches.post.ts
export const creerTache = defineEventHandler(async (event) => {
  // TODO 2
})

// server/api/taches/[id].get.ts
export const lireTache = defineEventHandler((event) => {
  // TODO 3
})
`,
  solution: `// ─── Simulation de Nitro : ne modifie pas cette partie ───
function defineEventHandler(handler) { return handler }
async function readBody(event) { return event.body }
async function readValidatedBody(event, valider) {
  const corps = await readBody(event)
  try {
    const resultat = await valider(corps)
    if (resultat === false) throw new Error('Validation Error')
    return resultat === true ? corps : resultat
  } catch (e) {
    throw createError({ status: 400, statusText: 'Validation Error', message: e.message })
  }
}
function getRouterParam(event, nom) { return event.params ? event.params[nom] : undefined }
function setResponseStatus(event, code) { event.statut = code }
function createError({ status, statusText, message }) {
  const erreur = new Error(message || statusText)
  erreur.statusCode = status
  erreur.statusMessage = statusText
  return erreur
}
const taches = [{ id: 1, titre: 'Lire la doc de Nitro', faite: false }]
// ─────────────────────────────────────────────────────────

// server/utils/validerTache.ts
export function validerTache(corps) {
  const titre = typeof corps?.titre === 'string' ? corps.titre.trim() : ''
  if (!titre) throw new Error('Le titre est obligatoire')
  return { titre }
}

// server/api/taches.post.ts
export const creerTache = defineEventHandler(async (event) => {
  const { titre } = await readValidatedBody(event, validerTache)
  const tache = { id: taches.length + 1, titre, faite: false }
  taches.push(tache)
  setResponseStatus(event, 201)
  return tache
})

// server/api/taches/[id].get.ts
export const lireTache = defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const tache = taches.find((t) => t.id === id)
  if (!tache) {
    throw createError({ status: 404, statusText: 'Tâche introuvable' })
  }
  return tache
})
`,
  indices: [
    'Dans `validerTache`, vérifie `typeof corps?.titre === \'string\'` avant d\'appeler `trim()`.',
    '`readValidatedBody` renvoie ce que renvoie `validerTache` : `const { titre } = await readValidatedBody(event, validerTache)`.',
    '`getRouterParam` renvoie `"1"` (une chaîne) : compare avec `Number(…)`.',
  ],
  tests: [
    {
      nom: 'validerTache nettoie le titre',
      run: async (t) => {
        t.expect(t.module.validerTache({ titre: '  Acheter du pain  ' })).toEqual({ titre: 'Acheter du pain' });
      },
    },
    {
      nom: 'validerTache refuse un titre vide ou absent',
      aide: 'Lève une erreur avec `throw new Error(…)` quand le titre est vide après `trim()`.',
      run: async (t) => {
        t.expect(() => t.module.validerTache({ titre: '   ' })).toThrow();
        t.expect(() => t.module.validerTache({})).toThrow();
        t.expect(() => t.module.validerTache(undefined)).toThrow();
      },
    },
    {
      nom: 'creerTache renvoie la nouvelle tâche avec le statut 201',
      run: async (t) => {
        const event = { body: { titre: 'Pain' } };
        const tache = await t.module.creerTache(event);
        t.expect(tache).toEqual({ id: 2, titre: 'Pain', faite: false });
        t.expect(event.statut).toBe(201);
      },
    },
    {
      nom: 'creerTache répond 400 si le corps est invalide',
      aide: 'Utilise `readValidatedBody(event, validerTache)` : il transforme l\'erreur de validation en erreur 400.',
      run: async (t) => {
        let erreur;
        try {
          await t.module.creerTache({ body: { titre: '' } });
        } catch (e) {
          erreur = e;
        }
        t.expect(erreur).toBeDefined();
        t.expect(erreur.statusCode).toBe(400);
      },
    },
    {
      nom: 'lireTache renvoie la tâche demandée',
      aide: 'Le paramètre de route est une chaîne : convertis-le avec `Number()`.',
      run: async (t) => {
        const tache = await t.module.lireTache({ params: { id: '1' } });
        t.expect(tache.titre).toBe('Lire la doc de Nitro');
      },
    },
    {
      nom: 'lireTache répond 404 si la tâche n\'existe pas',
      run: async (t) => {
        let erreur;
        try {
          await t.module.lireTache({ params: { id: '99' } });
        } catch (e) {
          erreur = e;
        }
        t.expect(erreur).toBeDefined();
        t.expect(erreur.statusCode).toBe(404);
      },
    },
  ],
};
