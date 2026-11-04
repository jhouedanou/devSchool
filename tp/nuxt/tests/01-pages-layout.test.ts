// TP 01 · Pages et layout
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { h } from 'vue'
import { chargerComposant } from './outils'

describe('TP 01 · Pages et layout', () => {
  it('la page d\'accueil (app/pages/index.vue) affiche le titre « Accueil »', async () => {
    const Page = await chargerComposant('app/pages/index.vue')
    const page = await mountSuspended(Page)
    expect(page.find('h1').text()).toBe('Accueil')
  })

  it('la page /a-propos affiche le titre « À propos »', async () => {
    const Page = await chargerComposant('app/pages/a-propos.vue')
    const page = await mountSuspended(Page)
    expect(page.find('h1').text()).toBe('À propos')
  })

  it('la page /contact affiche le titre « Contact »', async () => {
    const Page = await chargerComposant('app/pages/contact.vue')
    const page = await mountSuspended(Page)
    expect(page.find('h1').text()).toBe('Contact')
  })

  it('le layout default.vue a une navigation avec des liens vers /, /a-propos et /contact', async () => {
    const Layout = await chargerComposant('app/layouts/default.vue')
    const layout = await mountSuspended(Layout)
    const liens = layout.findAll('nav a').map((lien) => lien.attributes('href'))
    expect(liens).toEqual(expect.arrayContaining(['/', '/a-propos', '/contact']))
  })

  it('les liens de la navigation sont des <NuxtLink>', async () => {
    const Layout = await chargerComposant('app/layouts/default.vue')
    const layout = await mountSuspended(Layout)
    const nuxtLinks = layout.findAllComponents({ name: 'NuxtLink' })
    expect(nuxtLinks.length).toBeGreaterThanOrEqual(3)
  })

  it('le layout affiche le contenu de la page dans <main> grâce à <slot />', async () => {
    const Layout = await chargerComposant('app/layouts/default.vue')
    const layout = await mountSuspended(Layout, {
      slots: { default: () => h('p', { 'data-test': 'contenu' }, 'Contenu de la page') },
    })
    expect(layout.find('main [data-test="contenu"]').exists()).toBe(true)
  })

  it('app.vue affiche la page demandée à l\'intérieur du layout', async () => {
    const App = await chargerComposant('app/app.vue')
    const app = await mountSuspended(App, { route: '/a-propos' })
    expect(app.find('nav').exists(), 'la navigation du layout doit être affichée').toBe(true)
    expect(app.find('main h1').text()).toBe('À propos')
  })
})
