# useRef, useMemo, useCallback, useReducer

## Objectifs

- Accéder à un élément du DOM avec `useRef`.
- Garder une valeur entre les rendus sans déclencher de rendu.
- Mémoïser un calcul avec `useMemo` et une fonction avec `useCallback`.
- Savoir ce que fait le React Compiler.
- Centraliser la logique d'état avec `useReducer`.

## useRef

`useRef(valeurInitiale)` renvoie un objet `{ current: valeurInitiale }`. Cet objet reste le même pendant toute la vie du composant.

Changer `ref.current` **ne déclenche pas** de nouveau rendu. C'est la différence avec l'état.

### Accéder au DOM

Passe la ref à l'attribut `ref` d'un élément. Après l'affichage, `ref.current` contient l'élément du DOM.

```jsx
import { useRef } from 'react';

export default function Recherche() {
  const champRef = useRef(null);

  return (
    <>
      <input ref={champRef} placeholder="Rechercher…" />
      <button onClick={() => champRef.current.focus()}>Aller au champ</button>
    </>
  );
}
```

Usages courants : donner le focus, faire défiler (`scrollIntoView`), mesurer un élément, piloter une vidéo.

### Garder une valeur

Une ref garde aussi une valeur qui n'a pas besoin d'être affichée : l'id d'un minuteur, une valeur précédente, un compteur interne.

```jsx
import { useRef, useState } from 'react';

export default function Chrono() {
  const [secondes, setSecondes] = useState(0);
  const intervalRef = useRef(null);

  function demarrer() {
    if (intervalRef.current) return;          // déjà lancé
    intervalRef.current = setInterval(() => setSecondes((s) => s + 1), 1000);
  }

  function arreter() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  return (
    <>
      <p>{secondes} s</p>
      <button onClick={demarrer}>Démarrer</button>
      <button onClick={arreter}>Arrêter</button>
    </>
  );
}
```

| | `useState` | `useRef` |
|--|-----------|----------|
| Garde la valeur entre les rendus | oui | oui |
| Un changement déclenche un rendu | oui | non |
| Se lit pendant le rendu | oui | non (seulement dans les événements et effets) |

> [!WARNING]
> Ne lis pas et n'écris pas `ref.current` pendant le rendu (dans le corps du composant). Fais-le dans un gestionnaire d'événement ou un effet.

> [!NOTE]
> En React 19, un composant fonction reçoit `ref` comme une prop normale : `forwardRef` n'est plus nécessaire (leçon 11).

## useMemo

`useMemo` garde en cache le résultat d'un calcul. React le recalcule seulement quand une dépendance change.

```jsx
import { useMemo, useState } from 'react';

export default function Catalogue({ produits }) {
  const [recherche, setRecherche] = useState('');
  const [sombre, setSombre] = useState(false);

  const visibles = useMemo(
    () => produits.filter((p) => p.nom.toLowerCase().includes(recherche.toLowerCase())),
    [produits, recherche]
  );

  return (
    <div className={sombre ? 'sombre' : ''}>
      <button onClick={() => setSombre(!sombre)}>Thème</button>
      <input value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      <p>{visibles.length} produits</p>
    </div>
  );
}
```

Cliquer sur « Thème » refait le rendu, mais le filtre n'est pas recalculé : `produits` et `recherche` n'ont pas changé.

Utilise `useMemo` pour un calcul **coûteux** (gros tableau, calcul lourd). Pour un calcul simple, il n'apporte rien.

## useCallback et memo

`useCallback` garde en cache une **fonction**. Elle reste la même entre les rendus tant que ses dépendances ne changent pas.

```jsx
const handleSupprimer = useCallback((id) => {
  setTaches((taches) => taches.filter((t) => t.id !== id));
}, []);
```

`useCallback(fn, deps)` équivaut à `useMemo(() => fn, deps)`.

C'est utile dans deux cas :

1. la fonction est passée à un enfant enveloppé dans `memo` ;
2. la fonction est une dépendance d'un effet.

`memo` évite le rendu d'un composant si ses props n'ont pas changé :

```jsx
import { memo } from 'react';

const LigneTache = memo(function LigneTache({ tache, onSupprimer }) {
  return <li>{tache.texte} <button onClick={() => onSupprimer(tache.id)}>×</button></li>;
});
```

Sans `useCallback`, le parent crée une nouvelle fonction à chaque rendu : `memo` verrait une prop différente et referait le rendu quand même.

> [!NOTE]
> **React Compiler** (stable depuis octobre 2025) analyse ton code à la compilation et ajoute la mémoïsation tout seul. Avec lui, tu écris rarement `useMemo`, `useCallback` ou `memo` à la main. Sans lui, n'en mets que là où tu mesures un problème de performance.

## useReducer

Quand l'état a plusieurs valeurs liées et beaucoup de façons de changer, `useReducer` regroupe toute la logique dans une seule fonction : le **reducer**.

```jsx
const [state, dispatch] = useReducer(reducer, etatInitial);
```

- `state` : l'état actuel.
- `dispatch(action)` : envoie une **action** (un objet qui décrit ce qui s'est passé).
- `reducer(state, action)` : fonction **pure** qui renvoie le nouvel état.

### Un panier

```jsx
const etatInitial = { articles: [] };

function panierReducer(state, action) {
  switch (action.type) {
    case 'ajouter': {
      const existe = state.articles.find((a) => a.id === action.article.id);
      if (existe) {
        return {
          ...state,
          articles: state.articles.map((a) =>
            a.id === action.article.id ? { ...a, quantite: a.quantite + 1 } : a
          ),
        };
      }
      return { ...state, articles: [...state.articles, { ...action.article, quantite: 1 }] };
    }
    case 'retirer':
      return { ...state, articles: state.articles.filter((a) => a.id !== action.id) };
    case 'vider':
      return etatInitial;
    default:
      throw new Error(`Action inconnue : ${action.type}`);
  }
}
```

```jsx
import { useReducer } from 'react';

export default function Panier() {
  const [state, dispatch] = useReducer(panierReducer, etatInitial);
  const total = state.articles.reduce((s, a) => s + a.prix * a.quantite, 0);

  return (
    <>
      <button onClick={() => dispatch({ type: 'ajouter', article: { id: 1, nom: 'Livre', prix: 12 } })}>
        Ajouter un livre
      </button>
      <button onClick={() => dispatch({ type: 'vider' })}>Vider</button>
      <p>Total : {total} €</p>
    </>
  );
}
```

Le composant dit **ce qui s'est passé** (`'ajouter'`). Le reducer décide **comment** l'état change.

### Un reducer est pur

- Il ne modifie pas `state` : il renvoie un nouvel objet.
- Il ne fait pas d'appel réseau, pas de `Math.random()`, pas de `Date.now()`.
- Il se teste sans React : `panierReducer(etat, action)` renvoie une valeur.

### useState ou useReducer ?

| Choisis `useState` | Choisis `useReducer` |
|--------------------|----------------------|
| une ou deux valeurs simples | plusieurs valeurs liées |
| peu de façons de changer | beaucoup d'actions différentes |
| logique courte | logique à tester à part |

## Pièges fréquents

- **Attendre un rendu après `ref.current = …`** : une ref ne déclenche jamais de rendu. Pour afficher une valeur, utilise l'état.
- **`ref.current` lu pendant le rendu** : la valeur peut être `null` ou périmée.
- **`useMemo` partout** : du code en plus pour rien. Réserve-le aux calculs coûteux, ou utilise React Compiler.
- **Dépendances oubliées** dans `useMemo` ou `useCallback` : la valeur en cache est périmée.
- **Muter l'état dans le reducer** : `state.articles.push(…)` casse le rendu. Renvoie une copie.
- **Oublier le `default`** dans le `switch` : une faute de frappe dans `type` passe inaperçue.

## Résumé

- `useRef` : un objet `{ current }` stable, pour le DOM ou une valeur qui ne s'affiche pas. Pas de rendu quand il change.
- `useMemo(() => calcul, deps)` : met en cache un calcul coûteux.
- `useCallback(fn, deps)` : met en cache une fonction, utile avec `memo` ou dans les dépendances d'un effet.
- React Compiler ajoute la mémoïsation automatiquement.
- `useReducer(reducer, etatInitial)` : `dispatch({ type, … })` et un reducer pur `(state, action) => nouvelEtat`.

## Pour pratiquer

Fais les exercices [Reducer de panier](#/react/exercice/09-reducer-panier) et [Chronomètre](#/react/exercice/10-chronometre). Ensuite, fais le TP [Panier avec useReducer](#/react/tp/07-panier-reducer).
