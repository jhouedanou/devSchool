// POST /api/taches avec un corps JSON { "titre": "…" }
export default defineEventHandler(async (event) => {
  const corps = await readBody<{ titre?: unknown } | undefined>(event)
  const titre = typeof corps?.titre === 'string' ? corps.titre.trim() : ''

  if (!titre) {
    throw createError({ status: 400, message: 'Le titre est obligatoire.' })
  }
  if (titre.length < 3) {
    throw createError({ status: 400, message: 'Le titre doit faire au moins 3 caractères.' })
  }

  setResponseStatus(event, 201)
  return ajouterTache(titre)
})
