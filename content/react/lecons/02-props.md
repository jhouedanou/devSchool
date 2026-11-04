# Props et composition

## Objectifs

- Passer des données à un composant avec les props.
- Déstructurer les props et leur donner des valeurs par défaut.
- Utiliser `children` pour emballer du contenu.
- Passer une fonction pour que l'enfant prévienne le parent.
- Composer des composants au lieu d'utiliser l'héritage.

## Les props

Les **props** (propriétés) sont les paramètres d'un composant. Le parent les écrit comme des attributs. L'enfant les reçoit dans un objet.

```jsx
function Carte(props) {
  return <h2>{props.nom} ({props.age} ans)</h2>;
}

export default function App() {
  return <Carte nom="Ada" age={36} />;
}
```

- Une chaîne s'écrit entre guillemets : `nom="Ada"`.
- Tout le reste s'écrit entre accolades : `age={36}`, `actif={false}`, `tags={['js', 'react']}`.
- Une prop sans valeur vaut `true` : `<Carte actif />` équivaut à `actif={true}`.

## Déstructurer les props

On déstructure directement dans les paramètres. C'est plus court et on voit tout de suite ce que le composant attend.

```jsx
function Carte({ nom, age }) {
  return <h2>{nom} ({age} ans)</h2>;
}
```

### Valeurs par défaut

Une valeur par défaut s'écrit avec `=` dans la déstructuration. Elle s'applique quand la prop est absente (ou `undefined`).

```jsx
function Bouton({ texte, couleur = 'bleu', taille = 'moyen' }) {
  return <button className={`btn ${couleur} ${taille}`}>{texte}</button>;
}

<Bouton texte="Envoyer" />            // couleur = 'bleu', taille = 'moyen'
<Bouton texte="Annuler" couleur="gris" />
```

> [!NOTE]
> **Ce qui a changé** : `Composant.defaultProps` ne marche plus pour les composants fonctions en React 19. Les `propTypes` sont aussi ignorés. Utilise les valeurs par défaut de la déstructuration et TypeScript pour vérifier les types.

### Transmettre toutes les props

La syntaxe `{...objet}` passe toutes les propriétés d'un objet comme props.

```jsx
const user = { nom: 'Ada', age: 36 };
<Carte {...user} />   // équivaut à <Carte nom="Ada" age={36} />
```

Utilise-la avec modération : on ne voit plus quelles props passent.

## Les props sont en lecture seule

Un composant ne modifie **jamais** ses props. Pour une valeur qui change, on utilise l'état (leçon suivante).

```jsx
function Carte({ nom }) {
  nom = nom.toUpperCase();         // ✗ ne modifie pas une prop
  const nomAffiche = nom.toUpperCase(); // ✓ crée une nouvelle variable
  return <h2>{nomAffiche}</h2>;
}
```

## La prop `children`

Le contenu placé **entre** les balises d'un composant arrive dans la prop `children`.

```jsx
function Panneau({ titre, children }) {
  return (
    <section className="panneau">
      <h2>{titre}</h2>
      <div className="contenu">{children}</div>
    </section>
  );
}

export default function App() {
  return (
    <Panneau titre="Bienvenue">
      <p>Ceci est le contenu du panneau.</p>
      <button>Commencer</button>
    </Panneau>
  );
}
```

`children` peut contenir du texte, des éléments, d'autres composants. C'est l'équivalent du `<slot>` de Vue.

## Passer des fonctions

Les données descendent du parent vers l'enfant. Pour remonter une information, le parent passe une **fonction** en prop et l'enfant l'appelle.

```jsx
function Article({ id, titre, onSupprimer }) {
  return (
    <li>
      {titre}
      <button onClick={() => onSupprimer(id)}>Supprimer</button>
    </li>
  );
}

export default function Liste() {
  function handleSupprimer(id) {
    console.log('Supprimer', id);
  }
  return (
    <ul>
      <Article id={1} titre="Lait" onSupprimer={handleSupprimer} />
      <Article id={2} titre="Pain" onSupprimer={handleSupprimer} />
    </ul>
  );
}
```

Convention de nommage :

- la prop s'appelle `onQuelqueChose` (`onSupprimer`, `onChange`) ;
- la fonction du parent s'appelle `handleQuelqueChose`.

> [!WARNING]
> `onClick={onSupprimer(id)}` **appelle** la fonction pendant le rendu. Écris `onClick={() => onSupprimer(id)}` pour passer une fonction qui sera appelée au clic.

## Composition plutôt qu'héritage

En React, on ne crée pas de composant qui « hérite » d'un autre. On **compose** : un composant en utilise d'autres et leur passe des props.

### Spécialiser un composant

```jsx
function Bouton({ variante = 'normal', children, ...reste }) {
  return <button className={`btn btn-${variante}`} {...reste}>{children}</button>;
}

function BoutonDanger(props) {
  return <Bouton variante="danger" {...props} />;
}

<BoutonDanger onClick={supprimer}>Supprimer</BoutonDanger>
```

`...reste` récupère les autres props (`onClick`, `type`, `disabled`…) pour les passer au `<button>`.

### Plusieurs emplacements

Une prop peut contenir du JSX. Tu peux ainsi créer plusieurs « emplacements » dans une mise en page.

```jsx
function MiseEnPage({ entete, barre, children }) {
  return (
    <div className="page">
      <header>{entete}</header>
      <aside>{barre}</aside>
      <main>{children}</main>
    </div>
  );
}

<MiseEnPage entete={<Menu />} barre={<Filtres />}>
  <ListeProduits />
</MiseEnPage>
```

## Typer les props (aperçu TypeScript)

Avec le template `react-ts`, tu décris les props avec un type.

```tsx
type CarteProps = {
  nom: string;
  age?: number;          // ? = facultative
  onContacter: (nom: string) => void;
};

function Carte({ nom, age = 0, onContacter }: CarteProps) {
  return <button onClick={() => onContacter(nom)}>{nom} ({age})</button>;
}
```

## Pièges fréquents

- **Nombre entre guillemets** : `age="36"` donne la chaîne `"36"`. Écris `age={36}`.
- **Appeler au lieu de passer** : `onClick={fn()}` s'exécute au rendu. Écris `onClick={fn}` ou `onClick={() => fn(id)}`.
- **Modifier une prop** : interdit. Calcule une nouvelle variable ou utilise l'état.
- **Oublier `children`** : si le composant n'affiche pas `{children}`, le contenu entre les balises disparaît.
- **`key` n'est pas une prop** : React la garde pour lui. `props.key` vaut `undefined` dans l'enfant.
- **`defaultProps` sur une fonction** : ignoré en React 19. Utilise `= valeur` dans la déstructuration.

## Résumé

- Les props passent des données du parent à l'enfant : `<Carte nom="Ada" age={36} />`.
- On les déstructure : `function Carte({ nom, age = 0 })`.
- Les props sont en lecture seule.
- `children` contient ce qui est écrit entre les balises du composant.
- Pour remonter une information, le parent passe une fonction `onXxx` que l'enfant appelle.
- On compose les composants (spécialisation, emplacements) au lieu d'hériter.

## Pour pratiquer

Fais l'exercice [Carte de profil](#/react/exercice/02-carte-profil). Les TP locaux commencent après la leçon 3 avec le [Compteur avec historique](#/react/tp/01-compteur).
