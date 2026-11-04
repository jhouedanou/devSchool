export default [
  {
    type: 'unique',
    question: 'Qu\'affiche ce code quand nbMessages vaut 0 ?',
    code: '{nbMessages && <Badge nombre={nbMessages} />}',
    langage: 'jsx',
    choix: ['0', 'Rien', 'Le badge avec 0', 'false'],
    reponse: 0,
    explication: '0 && … vaut 0, et React affiche les nombres. Écris une vraie condition : nbMessages > 0 && ….',
  },
  {
    type: 'unique',
    question: 'Comment un composant indique-t-il qu\'il n\'affiche rien ?',
    choix: ['return null;', 'hide();', 'return \'none\';', 'this.visible = false;'],
    reponse: 0,
    explication: 'Un composant qui renvoie null n\'affiche rien. return \'none\' afficherait le texte « none ».',
  },
  {
    type: 'texte',
    question: 'Complète pour que React identifie chaque élément de la liste.',
    code: '{fruits.map((f) => <li ____={f.id}>{f.nom}</li>)}',
    langage: 'jsx',
    acceptees: ['key'],
    explication: 'Chaque élément d\'une liste a une prop key unique parmi ses frères et stable entre les rendus.',
  },
  {
    type: 'unique',
    question: 'Pourquoi éviter key={index} sur une liste qu\'on peut trier ou dont on supprime des éléments ?',
    choix: [
      'L\'état d\'un élément peut se retrouver sur la mauvaise ligne',
      'React refuse les nombres comme key',
      'L\'index n\'existe pas dans map',
      'Cela ralentit le premier chargement de la page',
    ],
    reponse: 0,
    explication: 'Quand l\'ordre change, l\'index d\'un élément change aussi. React associe alors l\'ancien état (case cochée, saisie) au mauvais élément.',
  },
  {
    type: 'multiple',
    question: 'Lesquelles sont de bonnes keys ?',
    choix: [
      'L\'id du produit venant de la base de données',
      'Math.random()',
      'Un identifiant créé avec crypto.randomUUID() au moment de l\'ajout',
      'L\'index, pour une liste fixe qui ne change jamais',
      'Date.now() appelé pendant le rendu',
    ],
    reponses: [0, 2, 3],
    explication: 'Une key doit être stable. Math.random() ou Date.now() pendant le rendu changent à chaque fois. L\'index est acceptable seulement pour une liste figée.',
  },
  {
    type: 'unique',
    question: 'Où placer la key dans ce code ?',
    code: `{termes.map((t) => (
  <>
    <dt>{t.mot}</dt>
    <dd>{t.definition}</dd>
  </>
))}`,
    langage: 'jsx',
    choix: [
      'Remplacer <> par <Fragment key={t.id}>',
      'Sur le <dt> seulement',
      'Sur le <dd> seulement',
      'Nulle part : les fragments n\'en ont pas besoin',
    ],
    reponse: 0,
    explication: 'La key va sur l\'élément renvoyé par map. La forme courte <> n\'accepte pas de prop : utilise <Fragment key>.',
  },
  {
    type: 'unique',
    question: 'Pourquoi utiliser toSorted() plutôt que sort() sur un tableau reçu en props ?',
    choix: [
      'sort() modifie le tableau d\'origine',
      'toSorted() est beaucoup plus rapide',
      'sort() n\'existe pas en JavaScript moderne',
      'toSorted() trie aussi les objets imbriqués',
    ],
    reponse: 0,
    explication: 'sort() trie sur place et modifierait les props ou l\'état. toSorted() renvoie un nouveau tableau trié.',
  },
  {
    type: 'unique',
    question: 'Comment repartir d\'un état neuf dans <FormulaireProfil> quand userId change ?',
    choix: [
      '<FormulaireProfil key={userId} userId={userId} />',
      'Recharger la page',
      'Appeler FormulaireProfil.reset()',
      'Ce n\'est pas possible en React',
    ],
    reponse: 0,
    explication: 'Quand la key change, React détruit le composant et en crée un nouveau, avec un état neuf.',
  },
  {
    type: 'texte',
    question: 'Complète pour garder seulement les tâches non faites.',
    code: 'const restantes = taches.____((t) => !t.faite);',
    langage: 'js',
    acceptees: ['filter'],
    explication: 'filter renvoie un nouveau tableau avec les éléments pour lesquels la fonction renvoie true.',
  },
];
