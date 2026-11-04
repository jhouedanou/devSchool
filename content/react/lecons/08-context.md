# Le contexte

## Objectifs

- Reconnaître le problème du « prop drilling ».
- Créer un contexte avec `createContext`.
- Fournir une valeur avec un Provider (et la syntaxe de React 19).
- Lire la valeur avec `useContext`.
- Combiner contexte et `useReducer` pour un état partagé.

## Le problème : le prop drilling

Le **prop drilling**, c'est passer une prop à travers plusieurs composants qui ne s'en servent pas, juste pour qu'elle arrive en bas.

```jsx
function App() {
  const [theme, setTheme] = useState('clair');
  return <Page theme={theme} />;
}
function Page({ theme }) {
  return <Barre theme={theme} />;       // Page n'utilise pas theme
}
function Barre({ theme }) {
  return <Bouton theme={theme} />;      // Barre non plus
}
function Bouton({ theme }) {
  return <button className={theme}>OK</button>;
}
```

Le **contexte** permet à un composant de lire une valeur fournie par un ancêtre, sans passer par tous les intermédiaires.

## 1. Créer le contexte

Crée le contexte dans son propre fichier pour l'importer partout.

```jsx
// src/ThemeContext.js
import { createContext } from 'react';

export const ThemeContext = createContext('clair');
```

L'argument de `createContext` est la **valeur par défaut**. Elle sert seulement quand aucun Provider ne se trouve au-dessus du composant.

## 2. Fournir la valeur

Enveloppe une partie de l'arbre avec le Provider et donne-lui `value`.

```jsx
import { ThemeContext } from './ThemeContext';

export default function App() {
  const [theme, setTheme] = useState('clair');
  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}
```

> [!NOTE]
> **Nouveau en React 19** : le contexte sert lui-même de Provider. Tu peux écrire `<ThemeContext value={theme}>…</ThemeContext>`. `<ThemeContext.Provider>` marche toujours (et c'est la seule syntaxe en React 18). Les exercices du site utilisent `.Provider` car ils tournent en React 18.3.

## 3. Lire la valeur

N'importe quel composant **sous** le Provider lit la valeur avec `useContext`.

```jsx
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

function Bouton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>OK</button>;
}
```

`Page` et `Barre` n'ont plus besoin de la prop. Quand `value` change, tous les composants qui lisent le contexte refont leur rendu.

> [!NOTE]
> En React 19, `use(ThemeContext)` lit aussi un contexte. Contrairement à `useContext`, `use` peut être appelé dans un `if`.

## Partager l'état ET la fonction pour le modifier

Pour qu'un enfant change la valeur, mets aussi la fonction dans `value`.

```jsx
export default function App() {
  const [theme, setTheme] = useState('clair');
  const basculer = () => setTheme((t) => (t === 'clair' ? 'sombre' : 'clair'));

  return (
    <ThemeContext.Provider value={{ theme, basculer }}>
      <Page />
    </ThemeContext.Provider>
  );
}

function BoutonTheme() {
  const { theme, basculer } = useContext(ThemeContext);
  return <button onClick={basculer}>Thème : {theme}</button>;
}
```

## Un composant Provider et un hook

On range souvent le contexte, son Provider et un hook dans le même fichier. Le reste de l'application n'a plus à connaître `useContext`.

```jsx
// src/theme.jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('clair');
  const basculer = () => setTheme((t) => (t === 'clair' ? 'sombre' : 'clair'));
  return (
    <ThemeContext.Provider value={{ theme, basculer }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const valeur = useContext(ThemeContext);
  if (!valeur) throw new Error('useTheme doit être utilisé dans <ThemeProvider>');
  return valeur;
}
```

```jsx
// src/main.jsx
<ThemeProvider>
  <App />
</ThemeProvider>

// n'importe où dans l'application
const { theme, basculer } = useTheme();
```

L'erreur explicite te prévient tout de suite si tu oublies le Provider.

## Contexte + useReducer

Pour un état partagé plus riche (panier, utilisateur connecté), combine `useReducer` et le contexte. On sépare souvent l'état et `dispatch` dans deux contextes : les composants qui ne font qu'envoyer des actions ne refont pas leur rendu quand l'état change.

```jsx
const PanierContext = createContext(null);
const PanierDispatchContext = createContext(null);

export function PanierProvider({ children }) {
  const [panier, dispatch] = useReducer(panierReducer, { articles: [] });
  return (
    <PanierContext.Provider value={panier}>
      <PanierDispatchContext.Provider value={dispatch}>
        {children}
      </PanierDispatchContext.Provider>
    </PanierContext.Provider>
  );
}

export const usePanier = () => useContext(PanierContext);
export const usePanierDispatch = () => useContext(PanierDispatchContext);
```

```jsx
function BoutonAjouter({ produit }) {
  const dispatch = usePanierDispatch();
  return <button onClick={() => dispatch({ type: 'ajouter', article: produit })}>Ajouter</button>;
}
```

## Quand utiliser le contexte ?

Le contexte est fait pour des données utilisées **à beaucoup d'endroits** : thème, langue, utilisateur connecté, panier.

Avant de créer un contexte, essaie :

1. **passer les props** : deux ou trois niveaux, c'est normal et lisible ;
2. **la composition** : passe le composant final en `children` pour éviter les intermédiaires.

```jsx
// Page n'a plus besoin de connaître user : elle affiche ses children
<Page>
  <Avatar user={user} />
</Page>
```

Pour des données venant du serveur, une bibliothèque de requêtes (TanStack Query) ou les loaders du routeur sont souvent plus adaptés.

## Pièges fréquents

- **Provider oublié** : `useContext` renvoie la valeur par défaut, sans erreur. Le hook avec `throw` évite ce piège.
- **Composant au-dessus du Provider** : seuls les descendants du Provider lisent sa valeur.
- **Nouvel objet à chaque rendu** : `value={{ theme, basculer }}` change à chaque rendu du Provider, donc tous les lecteurs refont leur rendu. Ce n'est un problème que si l'arbre est gros. React Compiler ou `useMemo` règlent le cas.
- **Un seul contexte géant** : découpe par sujet (thème, utilisateur, panier).
- **Contexte pour tout** : les props restent la solution par défaut.

## Résumé

- Le contexte évite le prop drilling : un ancêtre fournit une valeur, les descendants la lisent.
- `createContext(defaut)` crée le contexte.
- `<MonContexte.Provider value={…}>` fournit la valeur. En React 19 : `<MonContexte value={…}>`.
- `useContext(MonContexte)` lit la valeur la plus proche au-dessus.
- Mets l'état et ses fonctions dans `value`, et range le tout dans un composant Provider + un hook `useXxx`.
- Contexte + `useReducer` = un état partagé simple, sans bibliothèque.

## Pour pratiquer

Fais l'exercice [Thème avec un contexte](#/react/exercice/11-theme-contexte). Ensuite, fais le TP [Thème clair/sombre avec Context](#/react/tp/05-theme-context).
