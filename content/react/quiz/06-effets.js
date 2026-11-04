export default [
  {
    type: 'unique',
    question: 'À quoi sert useEffect ?',
    choix: [
      'Synchroniser le composant avec un système extérieur (DOM, réseau, minuteur…)',
      'Calculer une valeur à partir des props',
      'Remplacer useState',
      'Réagir à un clic',
    ],
    reponse: 0,
    explication: 'Un effet s\'exécute après l\'affichage pour se synchroniser avec l\'extérieur. Les calculs se font pendant le rendu, les clics dans les gestionnaires.',
  },
  {
    type: 'unique',
    question: 'Quand s\'exécute useEffect(fn, []) ?',
    choix: [
      'Une seule fois, après le premier rendu',
      'Avant chaque rendu',
      'Après chaque rendu',
      'Jamais',
    ],
    reponse: 0,
    explication: 'Un tableau vide veut dire « aucune dépendance » : l\'effet tourne au montage (et son nettoyage au démontage).',
  },
  {
    type: 'texte',
    question: 'Complète le tableau de dépendances.',
    code: `useEffect(() => {
  document.title = prenom + ' (' + age + ')';
}, [____]);`,
    langage: 'jsx',
    acceptees: ['prenom, age', 'age, prenom', 'prenom,age', 'age,prenom'],
    explication: 'Toutes les valeurs du composant utilisées dans l\'effet vont dans le tableau : ici prenom et age.',
  },
  {
    type: 'unique',
    question: 'Quand React appelle-t-il la fonction de nettoyage renvoyée par un effet ?',
    choix: [
      'Avant de relancer l\'effet, et quand le composant disparaît',
      'Seulement au premier rendu',
      'Jamais en développement',
      'Après chaque clic',
    ],
    reponse: 0,
    explication: 'Le nettoyage arrête ce que l\'effet a démarré : écouteur, minuteur, connexion…',
  },
  {
    type: 'unique',
    question: 'Pourquoi ce code est-il incorrect ?',
    code: `useEffect(async () => {
  const res = await fetch(url);
  setData(await res.json());
}, [url]);`,
    langage: 'jsx',
    choix: [
      'Une fonction async renvoie une promesse, alors qu\'un effet doit renvoyer rien ou une fonction de nettoyage',
      'fetch est interdit dans un effet',
      'url ne doit pas être une dépendance',
      'await est interdit dans un composant React',
    ],
    reponse: 0,
    explication: 'Déclare une fonction async DANS l\'effet, puis appelle-la : useEffect(() => { async function charger() {…} charger(); }, [url]).',
  },
  {
    type: 'unique',
    question: 'À quoi sert ce drapeau ?',
    code: `useEffect(() => {
  let ignore = false;
  fetch('/api/users/' + id)
    .then((r) => r.json())
    .then((u) => { if (!ignore) setUser(u); });
  return () => { ignore = true; };
}, [id]);`,
    langage: 'jsx',
    choix: [
      'Ignorer la réponse d\'une ancienne requête quand id a changé',
      'Annuler la requête réseau',
      'Éviter le double rendu de StrictMode',
      'Cacher les erreurs réseau',
    ],
    reponse: 0,
    explication: 'Si id change, le nettoyage marque l\'ancienne requête comme périmée. Sa réponse, même tardive, n\'écrase pas la bonne. AbortController, lui, annule vraiment la requête.',
  },
  {
    type: 'multiple',
    question: 'Dans quels cas n\'as-tu PAS besoin d\'un effet ?',
    choix: [
      'Calculer nomComplet à partir de prenom et nom',
      'Envoyer un formulaire quand l\'utilisateur clique sur « Envoyer »',
      'Écouter l\'événement resize de window',
      'Démarrer un setInterval',
      'Filtrer une liste selon une recherche',
    ],
    reponses: [0, 1, 4],
    explication: 'Un calcul se fait pendant le rendu. Une réaction à un clic va dans le gestionnaire d\'événement. Écouter window ou lancer un minuteur, c\'est se synchroniser avec l\'extérieur : là, il faut un effet.',
  },
  {
    type: 'unique',
    question: 'En développement, ton effet s\'exécute deux fois au montage. Pourquoi ?',
    choix: [
      'StrictMode monte, démonte puis remonte le composant pour vérifier le nettoyage',
      'C\'est un bug de React',
      'Le tableau de dépendances est vide',
      'Vite recharge le module',
    ],
    reponse: 0,
    explication: 'C\'est voulu, et seulement en développement. Si cela casse quelque chose, il manque une fonction de nettoyage.',
  },
  {
    type: 'unique',
    question: 'Pourquoi ce code provoque-t-il une boucle infinie ?',
    code: `useEffect(() => {
  setCompte(compte + 1);
});`,
    langage: 'jsx',
    choix: [
      'Sans tableau de dépendances, l\'effet tourne après chaque rendu et en provoque un nouveau',
      'setCompte est asynchrone',
      'compte n\'est pas initialisé',
      'Il manque un return dans l\'effet',
    ],
    reponse: 0,
    explication: 'Rendu → effet → setCompte → rendu → effet… Ajoute un tableau de dépendances, ou supprime l\'effet si c\'est un calcul.',
  },
];
