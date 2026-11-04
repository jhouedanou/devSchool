import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@tp/07-mini-blog-router/App.vue'
import { routes } from '@tp/07-mini-blog-router/router.js'
import { articles } from '@tp/07-mini-blog-router/articles.js'

// Crée un routeur neuf (historique en mémoire, sans navigateur),
// va à l'adresse demandée, puis monte l'application.
async function monterA(chemin) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  router.push(chemin)
  await router.isReady()
  const wrapper = mount(App, { global: { plugins: [router] } })
  return { wrapper, router }
}

const liens = (wrapper) => wrapper.findAll('[data-test="lien-article"]')
const titre = (wrapper) => wrapper.get('[data-test="titre"]').text()

describe('Mini-blog', () => {
  it("liste tous les articles sur l'accueil", async () => {
    const { wrapper } = await monterA('/')
    expect(liens(wrapper)).toHaveLength(articles.length)
    expect(liens(wrapper).map((lien) => lien.text())).toEqual(articles.map((a) => a.titre))
  })

  it('chaque lien pointe vers /articles/:id', async () => {
    const { wrapper } = await monterA('/')
    const adresses = liens(wrapper).map((lien) => lien.attributes('href'))
    expect(adresses).toEqual(articles.map((a) => `/articles/${a.id}`))
  })

  it("affiche l'article demandé dans l'adresse", async () => {
    const { wrapper } = await monterA('/articles/2')
    expect(titre(wrapper)).toBe(articles[1].titre)
  })

  it('affiche « Article introuvable » pour un id qui n’existe pas', async () => {
    const { wrapper } = await monterA('/articles/999')
    expect(wrapper.text()).toContain('Article introuvable')
    expect(wrapper.find('[data-test="titre"]').exists()).toBe(false)
  })

  it("met la page à jour quand on passe d'un article à l'autre", async () => {
    const { wrapper, router } = await monterA('/articles/1')
    expect(titre(wrapper)).toBe(articles[0].titre)
    await router.push('/articles/3')
    await flushPromises()
    expect(titre(wrapper)).toBe(articles[2].titre)
  })

  it("ouvre l'article quand on clique sur un lien de l'accueil", async () => {
    const { wrapper, router } = await monterA('/')
    await liens(wrapper)[1].trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/articles/2')
    expect(titre(wrapper)).toBe(articles[1].titre)
  })

  it('affiche la page 404 pour une adresse inconnue', async () => {
    const { wrapper } = await monterA('/nimporte/quoi')
    expect(wrapper.text()).toContain('Page introuvable')
  })
})
