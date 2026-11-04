// GET /api/taches, GET /api/taches?fait=true, GET /api/taches?fait=false
export default defineEventHandler((event) => {
  const { fait } = getQuery(event)

  if (fait === 'true') {
    return listerTaches(true)
  }
  if (fait === 'false') {
    return listerTaches(false)
  }
  return listerTaches()
})
