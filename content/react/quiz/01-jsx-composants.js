export default [
  {
    type: 'unique',
    question: 'Quelle commande crée un nouveau projet React aujourd\'hui ?',
    choix: [
      'npx create-react-app mon-app',
      'npm create vite@latest mon-app -- --template react',
      'npm install react --init',
      'npx react-new mon-app',
    ],
    reponse: 1,
    explication: 'Create React App est déprécié depuis février 2025. On utilise Vite avec le template react (ou react-ts).',
  },
  {
    type: 'unique',
    question: 'Pourquoi ce composant ne compile pas ?',
    code: `function Carte() {
  return (
    <h1>Titre</h1>
    <p>Texte</p>
  );
}`,
    langage: 'jsx',
    choix: [
      'Il renvoie deux éléments sans parent commun',
      'Il manque className sur le <h1>',
      'Les balises doivent être en majuscules',
      'Il manque import React from \'react\'',
    ],
    reponse: 0,
    explication: 'Un composant renvoie un seul élément racine. Entoure les deux éléments d\'un fragment <>…</> ou d\'une <div>.',
  },
  {
    type: 'texte',
    question: 'Complète pour donner la classe CSS « intro » au paragraphe.',
    code: '<p ____="intro">Bonjour</p>',
    langage: 'jsx',
    acceptees: ['className'],
    explication: 'En JSX, l\'attribut class s\'écrit className, comme la propriété du DOM en JavaScript.',
  },
  {
    type: 'multiple',
    question: 'Lesquelles de ces lignes sont du JSX correct ?',
    choix: [
      '<img src={url} alt="Logo" />',
      '<input type="text">',
      '<div style={{ color: \'red\' }}>Alerte</div>',
      '<label for="email">Email</label>',
      '<br />',
    ],
    reponses: [0, 2, 4],
    explication: 'En JSX, toutes les balises sont fermées (<input />). L\'attribut for s\'écrit htmlFor. style reçoit un objet.',
  },
  {
    type: 'unique',
    question: 'Que se passe-t-il avec ce code ?',
    code: `const user = { prenom: 'Ada' };
return <p>{user}</p>;`,
    langage: 'jsx',
    choix: [
      'Le paragraphe affiche « Ada »',
      'Le paragraphe affiche « [object Object] »',
      'React lève une erreur : un objet ne peut pas être affiché',
      'Le paragraphe est vide',
    ],
    reponse: 2,
    explication: 'React affiche les chaînes et les nombres, pas les objets. Écris {user.prenom}.',
  },
  {
    type: 'unique',
    question: 'Pourquoi le nom d\'un composant commence-t-il par une majuscule ?',
    choix: [
      'Pour que React le distingue d\'une balise HTML',
      'C\'est une simple convention, sans effet',
      'Pour pouvoir l\'exporter par défaut',
      'Pour activer StrictMode',
    ],
    reponse: 0,
    explication: '<avatar /> est lu comme une balise HTML. <Avatar /> est lu comme ton composant.',
  },
  {
    type: 'unique',
    question: 'En développement, un console.log placé dans ton composant s\'affiche deux fois. Pourquoi ?',
    choix: [
      'StrictMode exécute deux fois le rendu pour révéler les bugs',
      'Vite charge chaque fichier deux fois',
      'Le composant est exporté deux fois',
      'React 19 fait toujours deux rendus, même en production',
    ],
    reponse: 0,
    explication: '<StrictMode> double certains appels en développement seulement. En production, il n\'a aucun effet.',
  },
  {
    type: 'texte',
    question: 'Complète pour importer l\'export nommé PetitAvatar.',
    code: "import ____ from './Avatar.jsx';",
    langage: 'jsx',
    acceptees: ['{ PetitAvatar }', '{PetitAvatar}'],
    explication: 'Un export nommé s\'importe entre accolades, avec son nom exact. Un export par défaut s\'importe sans accolades.',
  },
  {
    type: 'unique',
    question: 'En React 19, quelle ligne affiche l\'application dans la page ?',
    choix: [
      "ReactDOM.render(<App />, document.getElementById('root'))",
      "createRoot(document.getElementById('root')).render(<App />)",
      "React.mount(<App />, '#root')",
      "new App(document.getElementById('root'))",
    ],
    reponse: 1,
    explication: 'createRoot vient de react-dom/client (depuis React 18). ReactDOM.render a été supprimé en React 19.',
  },
];
