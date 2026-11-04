export default [
  {
    type: 'unique',
    question: 'Qu\'est-ce que le « prop drilling » ?',
    choix: [
      'Passer une prop à travers des composants qui ne l\'utilisent pas',
      'Modifier une prop dans un enfant',
      'Créer trop de contextes',
      'Passer des fonctions en props',
    ],
    reponse: 0,
    explication: 'Les composants intermédiaires transmettent la prop sans s\'en servir. Le contexte évite ce passage.',
  },
  {
    type: 'texte',
    question: 'Complète pour créer le contexte avec la valeur par défaut « clair ».',
    code: "export const ThemeContext = ____('clair');",
    langage: 'jsx',
    acceptees: ['createContext'],
    explication: 'createContext est importé de react. Son argument est la valeur par défaut.',
  },
  {
    type: 'unique',
    question: 'Quand la valeur par défaut passée à createContext est-elle utilisée ?',
    choix: [
      'Quand aucun Provider ne se trouve au-dessus du composant',
      'Toujours au premier rendu',
      'Quand le Provider reçoit value={null}',
      'Jamais en production',
    ],
    reponse: 0,
    explication: 'Avec un Provider au-dessus, c\'est sa value qui est lue, même si elle vaut null.',
  },
  {
    type: 'unique',
    question: 'En React 19, quelle écriture fournit la valeur d\'un contexte ?',
    choix: [
      '<ThemeContext value={theme}>…</ThemeContext>',
      '<ThemeContext.Consumer value={theme}>…</ThemeContext.Consumer>',
      '<Provider context={ThemeContext}>…</Provider>',
      "provide('theme', theme)",
    ],
    reponse: 0,
    explication: 'En React 19, le contexte sert lui-même de Provider. <ThemeContext.Provider value> marche toujours. provide() appartient à Vue.',
  },
  {
    type: 'multiple',
    question: 'Lesquelles lisent la valeur d\'un contexte dans un composant ?',
    choix: [
      'useContext(ThemeContext)',
      'use(ThemeContext), en React 19',
      'ThemeContext.value',
      'useState(ThemeContext)',
    ],
    reponses: [0, 1],
    explication: 'useContext et, en React 19, use() lisent la valeur du Provider le plus proche. use() peut même être appelé dans un if.',
  },
  {
    type: 'unique',
    question: 'Quelle valeur lit Bouton ?',
    code: `const ThemeContext = createContext('clair');

<>
  <Bouton />
  <ThemeContext.Provider value="sombre">
    <Page />
  </ThemeContext.Provider>
</>`,
    langage: 'jsx',
    choix: ["'clair'", "'sombre'", 'undefined', 'Une erreur'],
    reponse: 0,
    explication: 'Bouton n\'est pas sous le Provider : il reçoit la valeur par défaut. Seuls les descendants du Provider lisent « sombre ».',
  },
  {
    type: 'unique',
    question: 'Pourquoi écrire un hook useTheme() qui lève une erreur quand le contexte vaut null ?',
    choix: [
      'Pour repérer tout de suite un Provider oublié',
      'Pour accélérer le rendu',
      'Parce que useContext ne marche pas seul',
      'Pour éviter le prop drilling',
    ],
    reponse: 0,
    explication: 'Sans Provider, useContext renvoie la valeur par défaut sans prévenir. Le message d\'erreur explicite montre le problème.',
  },
  {
    type: 'unique',
    question: 'Avec contexte + useReducer, pourquoi mettre l\'état et dispatch dans deux contextes séparés ?',
    choix: [
      'Les composants qui envoient seulement des actions ne refont pas leur rendu quand l\'état change',
      'React interdit de mettre deux valeurs dans value',
      'dispatch change à chaque rendu',
      'useReducer l\'exige',
    ],
    reponse: 0,
    explication: 'dispatch ne change jamais. Un composant qui ne lit que le contexte de dispatch n\'est pas concerné par les changements d\'état.',
  },
  {
    type: 'multiple',
    question: 'Pour quelles données un contexte est-il un bon choix ?',
    choix: [
      'Le thème de l\'application',
      'L\'utilisateur connecté',
      'La langue de l\'interface',
      'La saisie d\'un champ utilisée par un seul composant',
      'Une valeur passée à un enfant direct',
    ],
    reponses: [0, 1, 2],
    explication: 'Le contexte sert pour des données utilisées à beaucoup d\'endroits. Pour un seul composant ou un enfant direct, l\'état local et les props suffisent.',
  },
];
