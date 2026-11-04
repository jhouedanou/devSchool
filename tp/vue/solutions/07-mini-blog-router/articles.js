// Les articles du blog. Dans une vraie application, ils viendraient d'une API.
export const articles = [
  {
    id: 1,
    titre: 'Bienvenue sur le mini-blog',
    contenu:
      'Ce blog sert à pratiquer Vue Router. Chaque article a sa propre adresse : /articles/1, /articles/2…',
  },
  {
    id: 2,
    titre: 'Pourquoi un routeur ?',
    contenu:
      "Un routeur associe une adresse à un composant. L'utilisateur peut garder un lien, revenir en arrière ou recharger la page.",
  },
  {
    id: 3,
    titre: 'Les paramètres de route',
    contenu:
      'Dans /articles/:id, « :id » est un paramètre. On le lit avec useRoute().params.id. Attention : c\'est toujours une chaîne.',
  },
]

// Renvoie l'article qui a cet id, ou undefined.
// « id » peut être une chaîne (paramètre de route) ou un nombre.
export function trouverArticle(id) {
  return articles.find((article) => article.id === Number(id))
}
