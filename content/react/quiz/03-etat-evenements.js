export default [
  {
    type: 'unique',
    question: 'Que renvoie useState(0) ?',
    choix: [
      'Un tableau : [valeur, fonction pour la changer]',
      'Un objet { value }',
      'Le nombre 0',
      'Une ref { current: 0 }',
    ],
    reponse: 0,
    explication: 'On le déstructure : const [compte, setCompte] = useState(0).',
  },
  {
    type: 'unique',
    question: 'Après un clic, combien vaut compte ?',
    code: `const [compte, setCompte] = useState(0);

function handleClick() {
  setCompte(compte + 1);
  setCompte(compte + 1);
  setCompte(compte + 1);
}`,
    langage: 'jsx',
    choix: ['1', '3', '0', '2'],
    reponse: 0,
    explication: 'Pendant ce rendu, compte vaut 0. Les trois appels demandent tous 0 + 1. Avec setCompte((c) => c + 1), on obtiendrait 3.',
  },
  {
    type: 'texte',
    question: 'Complète la mise à jour fonctionnelle pour ajouter 1 à la dernière valeur.',
    code: 'setCompte((c) => ____);',
    langage: 'jsx',
    acceptees: ['c + 1', 'c+1', '1 + c', '1+c'],
    explication: 'React passe la valeur la plus récente à la fonction. Le résultat devient le nouvel état.',
  },
  {
    type: 'unique',
    question: 'Pourquoi l\'écran ne se met pas à jour ?',
    code: `liste.push(nouvelElement);
setListe(liste);`,
    langage: 'jsx',
    choix: [
      'C\'est le même tableau : React ne voit aucun changement',
      'push n\'existe pas sur les tableaux',
      'Il faut appeler setListe deux fois',
      'Il manque un useEffect',
    ],
    reponse: 0,
    explication: 'React compare l\'ancien et le nouvel état avec Object.is. Crée un nouveau tableau : setListe([...liste, nouvelElement]).',
  },
  {
    type: 'multiple',
    question: 'Lesquelles renvoient un NOUVEAU tableau sans modifier liste ?',
    choix: [
      '[...liste, x]',
      'liste.filter((e) => e.id !== id)',
      'liste.sort()',
      'liste.map((e) => e * 2)',
      'liste.splice(0, 1)',
      'liste.toSorted()',
    ],
    reponses: [0, 1, 3, 5],
    explication: 'sort() et splice() modifient le tableau d\'origine. Le spread, filter, map et toSorted() créent une copie.',
  },
  {
    type: 'unique',
    question: 'Quelle ligne change la ville sans perdre les autres champs du profil ?',
    choix: [
      "setProfil({ ...profil, ville: 'Paris' })",
      "profil.ville = 'Paris'; setProfil(profil)",
      "setProfil({ ville: 'Paris' })",
      "setProfil.ville = 'Paris'",
    ],
    reponse: 0,
    explication: 'On copie l\'objet avec ...profil, puis on remplace ville. La 3e ligne perd les autres champs, la 2e modifie l\'objet existant.',
  },
  {
    type: 'unique',
    question: 'Tu as un état taches. Comment obtenir le nombre de tâches restantes ?',
    choix: [
      'Le calculer pendant le rendu : taches.filter((t) => !t.faite).length',
      'Un deuxième useState mis à jour à chaque modification',
      'Un useEffect qui recalcule un état',
      'Une variable globale hors du composant',
    ],
    reponse: 0,
    explication: 'C\'est un état dérivé : il se calcule à partir de taches. Le stocker crée un risque de désynchronisation.',
  },
  {
    type: 'multiple',
    question: 'Dans quels cas un composant refait-il son rendu ?',
    choix: [
      'Son état change',
      'Son parent refait son rendu',
      'Une variable locale déclarée avec let change',
      'Un contexte qu\'il lit change',
      'On appelle setCompte(5) alors que compte vaut déjà 5',
    ],
    reponses: [0, 1, 3],
    explication: 'Changer une variable locale ne prévient pas React. Si la nouvelle valeur est identique (Object.is), React saute le rendu.',
  },
  {
    type: 'texte',
    question: 'Complète pour lire le texte saisi.',
    code: '<input onChange={(e) => setTexte(e.____.value)} />',
    langage: 'jsx',
    acceptees: ['target'],
    explication: 'e.target est l\'élément qui a déclenché l\'événement. Sa propriété value contient la saisie.',
  },
];
