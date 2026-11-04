export default [
  {
    type: 'texte',
    question: 'Complète la commande d\'installation de React Router 7.',
    code: 'npm i ____',
    langage: 'bash',
    acceptees: ['react-router'],
    explication: 'En v7, le paquet principal est react-router. react-router-dom ne fait que le ré-exporter pour le vieux code.',
  },
  {
    type: 'unique',
    question: 'Quel lien change de page sans recharger l\'application ?',
    choix: [
      '<Link to="/users">Utilisateurs</Link>',
      '<a href="/users">Utilisateurs</a>',
      '<Route to="/users">Utilisateurs</Route>',
      '<Outlet to="/users" />',
    ],
    reponse: 0,
    explication: '<a href> recharge toute la page et perd l\'état. <Link to> change l\'URL et laisse React Router afficher la bonne route.',
  },
  {
    type: 'unique',
    question: 'À quoi sert la prop end ici ?',
    code: '<NavLink to="/" end>Accueil</NavLink>',
    langage: 'jsx',
    choix: [
      'Le lien n\'est actif que sur l\'URL exacte « / »',
      'Le lien est placé en fin de menu',
      'Elle arrête la navigation',
      'Elle désactive le lien',
    ],
    reponse: 0,
    explication: 'Sans end, « / » correspond au début de toutes les URL : le lien Accueil serait toujours actif.',
  },
  {
    type: 'texte',
    question: 'Complète pour lire le paramètre de la route /users/:id.',
    code: 'const { id } = ____();',
    langage: 'jsx',
    acceptees: ['useParams'],
    explication: 'useParams renvoie un objet avec les segments dynamiques de l\'URL.',
  },
  {
    type: 'unique',
    question: 'Pour l\'URL /users/3, que vaut id lu avec useParams ?',
    choix: ["La chaîne '3'", 'Le nombre 3', 'Un objet { id: 3 }', 'undefined'],
    reponse: 0,
    explication: 'Les paramètres d\'URL sont toujours des chaînes. Convertis avec Number(id) si besoin.',
  },
  {
    type: 'unique',
    question: 'Où s\'affiche une route enfant ?',
    code: `<Route path="/" element={<Layout />}>
  <Route path="users" element={<Users />} />
</Route>`,
    langage: 'jsx',
    choix: [
      'Dans le <Outlet /> placé dans Layout',
      'À la place de Layout',
      'Sous le <Routes>, après Layout',
      'Dans le <head> de la page',
    ],
    reponse: 0,
    explication: 'Le parent garde sa mise en page et place <Outlet /> à l\'endroit où l\'enfant doit apparaître. Sans Outlet, l\'enfant ne s\'affiche pas.',
  },
  {
    type: 'unique',
    question: 'Quelle route affiche une page 404 ?',
    choix: [
      '<Route path="*" element={<PageIntrouvable />} />',
      '<Route path="404" element={<PageIntrouvable />} />',
      '<Route error element={<PageIntrouvable />} />',
      '<Route index element={<PageIntrouvable />} />',
    ],
    reponse: 0,
    explication: 'path="*" correspond à toutes les URL qui n\'ont pas trouvé d\'autre route.',
  },
  {
    type: 'unique',
    question: 'Avec const navigate = useNavigate(), comment revenir à la page précédente ?',
    choix: ['navigate(-1)', "navigate('back')", 'navigate.pop()', 'navigate(0)'],
    reponse: 0,
    explication: 'Un nombre négatif recule dans l\'historique. navigate(\'/chemin\', { replace: true }) remplace l\'entrée actuelle.',
  },
  {
    type: 'unique',
    question: 'Quand s\'affiche Accueil ?',
    code: `<Route path="/" element={<Layout />}>
  <Route index element={<Accueil />} />
  <Route path="users" element={<Users />} />
</Route>`,
    langage: 'jsx',
    choix: [
      'À l\'URL « / », dans l\'Outlet de Layout',
      'Sur toutes les pages',
      'À l\'URL « /index »',
      'Jamais, car la route n\'a pas de path',
    ],
    reponse: 0,
    explication: 'Une route index est la route enfant par défaut : elle s\'affiche à l\'URL exacte du parent.',
  },
  {
    type: 'multiple',
    question: 'Mode data de React Router 7 : lesquelles sont vraies ?',
    choix: [
      'On décrit les routes avec createBrowserRouter([...])',
      'Un loader charge les données avant d\'afficher la page',
      'useLoaderData() lit ce que le loader a renvoyé',
      'On crée le routeur dans un useState du composant App',
      'RouterProvider s\'importe de react-router/dom',
    ],
    reponses: [0, 1, 2, 4],
    explication: 'Le routeur se crée une seule fois, au niveau du module, hors de tout composant. Il est ensuite passé à <RouterProvider router={router} />.',
  },
];
