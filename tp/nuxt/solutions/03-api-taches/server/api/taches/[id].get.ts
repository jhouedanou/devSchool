// GET /api/taches/:id
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const tache = trouverTache(id)

  if (!tache) {
    throw createError({ status: 404, message: 'Tâche introuvable.' })
  }
  return tache
})
