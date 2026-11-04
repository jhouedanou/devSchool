# JSX et composants

## Objectifs

- Créer un projet React avec Vite.
- Écrire du JSX valide : une racine, `className`, accolades, fragments.
- Écrire des composants fonctions et les ranger dans des fichiers.
- Savoir à quoi sert `<StrictMode>`.

## Créer un projet avec Vite

Vite est l'outil standard pour démarrer un projet React. Il lance un serveur de développement rapide et construit la version de production.

```bash
npm create vite@latest mon-app -- --template react
cd mon-app
npm install
npm run dev
```

Pour TypeScript, prends le template `react-ts`.

> [!NOTE]
> **Ce qui a changé** : Create React App (`npx create-react-app`) est déprécié depuis février 2025. Utilise Vite. Pour une grosse application avec routage et rendu serveur, la doc officielle conseille un framework (Next.js ou React Router en mode framework).

Les fichiers importants :

```
mon-app/
  index.html      ← la page, avec <div id="root"></div>
  src/
    main.jsx      ← point d'entrée : affiche <App /> dans #root
    App.jsx       ← ton premier composant
```

Le point d'entrée `src/main.jsx` :

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

> [!NOTE]
> `ReactDOM.render()` n'existe plus en React 19. On utilise `createRoot()` (depuis React 18).

## Le JSX

Le JSX est une syntaxe qui ressemble à du HTML, écrite dans du JavaScript. Vite le transforme en appels de fonctions JavaScript.

```jsx
const titre = <h1 className="titre">Bonjour</h1>;
// devient à peu près : jsx('h1', { className: 'titre', children: 'Bonjour' })
```

> [!NOTE]
> Depuis React 17, tu n'as plus besoin d'écrire `import React from 'react'` en haut de chaque fichier pour utiliser le JSX.

### Règle 1 : une seule racine

Un composant renvoie un seul élément. Pour regrouper plusieurs éléments sans ajouter de `<div>`, utilise un **fragment** `<>…</>`.

```jsx
// ✗ Erreur : deux éléments côte à côte
return (
  <h1>Titre</h1>
  <p>Texte</p>
);

// ✓ Un fragment les regroupe
return (
  <>
    <h1>Titre</h1>
    <p>Texte</p>
  </>
);
```

### Règle 2 : toutes les balises sont fermées

En HTML, `<img>` ou `<br>` restent ouvertes. En JSX, tu dois les fermer.

```jsx
<img src="/logo.svg" alt="Logo" />
<input type="text" />
<br />
```

### Règle 3 : les attributs sont en camelCase

Les attributs JSX suivent les noms du DOM en JavaScript. Les plus courants :

| HTML | JSX |
|------|-----|
| `class` | `className` |
| `for` | `htmlFor` |
| `onclick` | `onClick` |
| `tabindex` | `tabIndex` |
| `style="color: red"` | `style={{ color: 'red' }}` |

Les attributs `aria-*` et `data-*` gardent leur tiret : `aria-label`, `data-id`.

### Règle 4 : les accolades pour le JavaScript

Entre `{ }`, tu mets une **expression** JavaScript : une variable, un calcul, un appel de fonction, un ternaire.

```jsx
const user = { prenom: 'Ada', avatar: '/ada.png' };
const notes = [12, 15, 18];

return (
  <div>
    <img src={user.avatar} alt={user.prenom} />
    <p>Bonjour {user.prenom.toUpperCase()} !</p>
    <p>Moyenne : {notes.reduce((a, b) => a + b, 0) / notes.length}</p>
  </div>
);
```

- Pas de guillemets autour des accolades : `src={url}`, pas `src="{url}"`.
- Pas de `if` ni de `for` dans les accolades (ce sont des instructions, pas des expressions).
- Les chaînes et les nombres s'affichent. `true`, `false`, `null` et `undefined` n'affichent rien.
- Un objet ne s'affiche pas : `{user}` provoque une erreur.

Les doubles accolades de `style={{ color: 'red' }}` sont : les accolades du JSX + un objet JavaScript.

### Les commentaires

```jsx
return (
  <div>
    {/* Un commentaire dans le JSX */}
    <p>Texte</p>
  </div>
);
```

## Les composants

Un composant est une **fonction qui renvoie du JSX**. Son nom commence par une majuscule.

```jsx
function Avatar() {
  return <img className="avatar" src="/ada.png" alt="Ada Lovelace" />;
}

export default function Profil() {
  return (
    <section>
      <h2>Ada Lovelace</h2>
      <Avatar />
      <Avatar />
    </section>
  );
}
```

- La majuscule est obligatoire : `<avatar />` serait lu comme une balise HTML inconnue.
- Un composant peut en utiliser d'autres : c'est comme ça qu'on construit une interface.
- Le code du composant s'exécute à chaque **rendu** (chaque fois que React calcule son affichage).

> [!WARNING]
> Ne déclare jamais un composant à l'intérieur d'un autre composant. Il serait recréé à chaque rendu et perdrait son état. Déclare-les tous au premier niveau du fichier.

## Importer et exporter

Range un composant par fichier, avec l'extension `.jsx`.

```jsx
// src/components/Avatar.jsx
export default function Avatar() {
  return <img className="avatar" src="/ada.png" alt="Ada" />;
}

export function PetitAvatar() {
  return <img className="avatar petit" src="/ada.png" alt="Ada" />;
}
```

```jsx
// src/App.jsx
import Avatar, { PetitAvatar } from './components/Avatar.jsx';
```

| Export | Import |
|--------|--------|
| `export default function Avatar()` | `import Avatar from './Avatar.jsx'` (nom libre) |
| `export function PetitAvatar()` | `import { PetitAvatar } from './Avatar.jsx'` (nom exact) |

## StrictMode

`<StrictMode>` aide à trouver des bugs **en développement seulement**. Il n'a aucun effet en production.

- Il exécute deux fois le code de tes composants : un `console.log` s'affiche donc deux fois.
- Il monte, démonte puis remonte chaque composant pour vérifier que tes effets se nettoient bien (leçon 6).

Garde-le : un composant correct se comporte pareil avec ou sans lui.

## Reconnaître un class component

Avant les hooks (2019), on écrivait souvent des classes. Tu en verras dans du vieux code.

```jsx
class Bonjour extends React.Component {
  render() {
    return <h1>Bonjour {this.props.nom}</h1>;
  }
}
```

Elles marchent toujours, mais écris des **fonctions** : tout ce parcours utilise des composants fonctions et des hooks.

> [!NOTE]
> Les exercices du site tournent avec React 18.3. Tout ce qu'ils utilisent marche de la même façon en React 19. Les nouveautés propres à React 19 se pratiquent dans les TP, en local.

## Pièges fréquents

- **`class` au lieu de `className`** : React affiche un avertissement dans la console.
- **Balise non fermée** : `<input>` au lieu de `<input />` provoque une erreur de compilation.
- **Nom en minuscule** : `function avatar()` utilisé comme `<avatar />` n'affiche pas ton composant.
- **Afficher un objet** : `{user}` donne l'erreur « Objects are not valid as a React child ». Affiche une propriété : `{user.prenom}`.
- **Oublier les parenthèses** après `return` sur plusieurs lignes : `return` suivi d'un saut de ligne renvoie `undefined`.
- **`console.log` en double** : c'est StrictMode en développement, pas un bug.

## Résumé

- `npm create vite@latest mon-app -- --template react` crée un projet. Create React App est déprécié.
- `createRoot(...).render(<App />)` affiche l'application dans la page.
- Le JSX : une seule racine (ou un fragment `<>…</>`), balises fermées, attributs en camelCase (`className`).
- `{ }` contient une expression JavaScript.
- Un composant est une fonction avec un nom en majuscule qui renvoie du JSX.
- `export default` / `export` nommé pour partager les composants entre fichiers.
- `<StrictMode>` double certains appels en développement pour révéler les bugs.

## Pour pratiquer

Fais l'exercice [Mon premier composant](#/react/exercice/01-premier-composant). Le premier TP local arrive après la leçon 3 : [Compteur avec historique](#/react/tp/01-compteur).
