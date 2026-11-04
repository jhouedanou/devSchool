export default [
  {
    type: 'unique',
    question: 'Que reçoit l\'enfant dans la prop age ?',
    code: '<Carte nom="Ada" age="36" />',
    langage: 'jsx',
    choix: ['Le nombre 36', 'La chaîne "36"', 'undefined', 'true'],
    reponse: 1,
    explication: 'Entre guillemets, c\'est toujours une chaîne. Pour un nombre, écris age={36}.',
  },
  {
    type: 'texte',
    question: 'Complète pour que role vaille « Invité » quand la prop est absente.',
    code: 'function Carte({ nom, role ____ }) {',
    langage: 'jsx',
    acceptees: ["= 'Invité'", '= "Invité"', "='Invité'", '="Invité"'],
    explication: 'La valeur par défaut s\'écrit dans la déstructuration : { role = \'Invité\' }. Elle s\'applique quand la prop vaut undefined.',
  },
  {
    type: 'unique',
    question: 'Que contient la prop children de Panneau ?',
    code: `<Panneau titre="Info">
  <p>Bonjour</p>
</Panneau>`,
    langage: 'jsx',
    choix: [
      'L\'élément <p>Bonjour</p>',
      'La chaîne "Info"',
      'Un tableau vide',
      'undefined : il faut la déclarer avant',
    ],
    reponse: 0,
    explication: 'children contient tout ce qui est écrit entre la balise ouvrante et la balise fermante du composant.',
  },
  {
    type: 'unique',
    question: 'Quel est le problème de ce bouton ?',
    code: '<button onClick={onSupprimer(id)}>Supprimer</button>',
    langage: 'jsx',
    choix: [
      'onSupprimer est appelée pendant le rendu, pas au clic',
      'onClick doit s\'écrire onclick',
      'id doit être entre guillemets',
      'Il n\'y a aucun problème',
    ],
    reponse: 0,
    explication: 'Les parenthèses appellent la fonction tout de suite. Écris onClick={() => onSupprimer(id)}.',
  },
  {
    type: 'multiple',
    question: 'Lesquelles sont vraies à propos des props ?',
    choix: [
      'Elles sont en lecture seule',
      'Un enfant modifie une prop pour prévenir son parent',
      'Elles peuvent contenir des fonctions',
      'Elles peuvent contenir du JSX',
      'L\'enfant peut lire props.key',
    ],
    reponses: [0, 2, 3],
    explication: 'On ne modifie jamais une prop. Pour prévenir le parent, l\'enfant appelle une fonction reçue en prop. key est réservée à React : props.key vaut undefined.',
  },
  {
    type: 'unique',
    question: 'Comment un enfant prévient-il son parent qu\'un bouton a été cliqué ?',
    choix: [
      'Il appelle une fonction que le parent lui a passée en prop (onXxx)',
      'Il modifie une prop du parent',
      'Il appelle emit(\'clic\')',
      'Il lit directement l\'état du parent',
    ],
    reponse: 0,
    explication: 'Les données descendent par les props, les événements remontent par des fonctions passées en props. emit() appartient à Vue, pas à React.',
  },
  {
    type: 'unique',
    question: 'Que fait <Carte {...user} /> avec user = { nom: \'Ada\', age: 36 } ?',
    choix: [
      'Il passe les props nom et age',
      'Il passe une seule prop appelée user',
      'Il provoque une erreur de syntaxe',
      'Il copie user dans l\'état de Carte',
    ],
    reponse: 0,
    explication: 'La syntaxe {...objet} transmet chaque propriété de l\'objet comme une prop : nom="Ada" et age={36}.',
  },
  {
    type: 'unique',
    question: 'En React 19, comment donner une valeur par défaut à une prop d\'un composant fonction ?',
    choix: [
      'Avec = valeur dans la déstructuration des props',
      'Avec Carte.defaultProps = { … }',
      'Avec Carte.propTypes',
      'Avec useState(valeur)',
    ],
    reponse: 0,
    explication: 'defaultProps ne marche plus pour les composants fonctions en React 19, et propTypes est ignoré. Utilise la déstructuration.',
  },
  {
    type: 'texte',
    question: 'Complète pour récupérer toutes les autres props dans un objet reste.',
    code: `function Bouton({ variante, ____ }) {
  return <button className={variante} {...reste} />;
}`,
    langage: 'jsx',
    acceptees: ['...reste'],
    explication: 'La syntaxe ...reste dans la déstructuration rassemble les props restantes (onClick, type, disabled…).',
  },
];
