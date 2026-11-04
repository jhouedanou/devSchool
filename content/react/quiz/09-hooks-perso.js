export default [
  {
    type: 'unique',
    question: 'Qu\'est-ce qu\'un hook personnalisé ?',
    choix: [
      'Une fonction dont le nom commence par use et qui appelle d\'autres hooks',
      'Un composant qui ne renvoie pas de JSX',
      'Une méthode d\'un class component',
      'Un plugin de Vite',
    ],
    reponse: 0,
    explication: 'Le préfixe use indique à React et au linter que les règles des hooks s\'appliquent à cette fonction.',
  },
  {
    type: 'unique',
    question: 'Pourquoi faut-il appeler les hooks au premier niveau du composant ?',
    choix: [
      'React retrouve chaque état grâce à l\'ordre d\'appel des hooks',
      'Pour améliorer les performances',
      'Parce que les if sont interdits dans un composant',
      'Pour le référencement',
    ],
    reponse: 0,
    explication: 'Si un hook est sauté à un rendu, l\'ordre change et tous les états suivants se décalent.',
  },
  {
    type: 'multiple',
    question: 'Lesquels cassent les règles des hooks ?',
    code: `function Profil({ user }) {
  if (!user) return null;
  // …
}`,
    langage: 'jsx',
    choix: [
      'Appeler useState dans un if',
      'Appeler useEffect après le return anticipé ci-dessus',
      'Appeler useState en haut du composant',
      'Appeler useContext dans une fonction utilitaire normale (pas un hook)',
      'Appeler useToggle dans un autre hook personnalisé',
    ],
    reponses: [0, 1, 3],
    explication: 'Les hooks s\'appellent toujours, dans le même ordre, en haut d\'un composant ou d\'un hook. Un hook peut en appeler un autre.',
  },
  {
    type: 'unique',
    question: 'Deux composants appellent useToggle(). Partagent-ils la même valeur ?',
    choix: [
      'Non : chaque appel a son propre état',
      'Oui, toujours',
      'Oui, si le hook est déclaré dans le même fichier',
      'Seulement en React 19',
    ],
    reponse: 0,
    explication: 'Un hook partage de la logique, pas de l\'état. Pour partager un état, remonte-le dans un parent ou utilise un contexte.',
  },
  {
    type: 'texte',
    question: 'Complète useToggle.',
    code: `function useToggle(initial = false) {
  const [valeur, setValeur] = useState(initial);
  const basculer = () => setValeur((v) => ____);
  return [valeur, basculer];
}`,
    langage: 'jsx',
    acceptees: ['!v'],
    explication: 'La mise à jour fonctionnelle part de la dernière valeur et renvoie son inverse.',
  },
  {
    type: 'unique',
    question: 'Dans useLocalStorage, pourquoi passer une fonction à useState ?',
    code: 'const [valeur, setValeur] = useState(() => JSON.parse(localStorage.getItem(cle)));',
    langage: 'jsx',
    choix: [
      'La fonction ne s\'exécute qu\'au premier rendu',
      'Pour rendre la valeur réactive',
      'Parce que localStorage exige une fonction',
      'Pour éviter d\'utiliser JSON.stringify',
    ],
    reponse: 0,
    explication: 'C\'est l\'initialisation paresseuse : la lecture du stockage n\'est pas refaite à chaque rendu.',
  },
  {
    type: 'unique',
    question: 'Quelles dépendances mettre dans l\'effet de useFetch(url) ?',
    choix: ['[url]', '[]', '[data]', 'Aucun tableau'],
    reponse: 0,
    explication: 'L\'effet utilise url : il doit se relancer quand l\'URL change. [] ne rechargerait jamais, sans tableau il rechargerait à chaque rendu.',
  },
  {
    type: 'unique',
    question: 'En React 19, quelle fonction échappe à la règle « pas de hook dans un if » ?',
    choix: ['use()', 'useState()', 'useEffect()', 'useContext()'],
    reponse: 0,
    explication: 'use() (pour lire une promesse ou un contexte) peut être appelé dans une condition. Les autres hooks, non.',
  },
  {
    type: 'unique',
    question: 'Une fonction formate un prix sans appeler aucun hook. Comment la nommer ?',
    choix: [
      'formaterPrix : une fonction normale suffit',
      'useFormaterPrix : toute fonction réutilisable commence par use',
      'useFormaterPrix : sinon React ne peut pas l\'appeler',
      'FormaterPrix, avec une majuscule',
    ],
    reponse: 0,
    explication: 'Le préfixe use est réservé aux fonctions qui appellent des hooks. Sinon, il impose des règles inutiles.',
  },
];
