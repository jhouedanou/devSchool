# État et événements

## Objectifs

- Réagir aux clics et à la saisie avec les événements.
- Stocker une valeur qui change avec `useState`.
- Utiliser la mise à jour fonctionnelle.
- Mettre à jour un objet ou un tableau sans le modifier (immutabilité).
- Calculer l'état dérivé au lieu de le stocker.

## Les événements

On passe une fonction à une prop d'événement : `onClick`, `onChange`, `onSubmit`, `onKeyDown`…

```jsx
export default function Bouton() {
  function handleClick() {
    alert('Clic !');
  }
  return <button onClick={handleClick}>Clique-moi</button>;
}
```

La fonction reçoit un objet **événement** `e`. Il ressemble à l'événement du DOM.

```jsx
<input onChange={(e) => console.log(e.target.value)} />
<a href="/" onClick={(e) => e.preventDefault()}>Lien bloqué</a>
```

> [!NOTE]
> En React, `onChange` sur un champ texte se déclenche **à chaque frappe** (comme l'événement `input` du DOM), pas seulement quand le champ perd le focus.

## Pourquoi une variable ne suffit pas

```jsx
export default function Compteur() {
  let compte = 0;
  return <button onClick={() => { compte++; }}>{compte}</button>; // reste à 0
}
```

Deux problèmes :

1. Modifier une variable locale ne déclenche pas de nouveau rendu.
2. À chaque rendu, la fonction repart de zéro : `compte` revaut `0`.

## useState

`useState` garde une valeur entre les rendus et déclenche un nouveau rendu quand elle change.

```jsx
import { useState } from 'react';

export default function Compteur() {
  const [compte, setCompte] = useState(0);
  return (
    <button onClick={() => setCompte(compte + 1)}>
      Cliqué {compte} fois
    </button>
  );
}
```

- `useState(0)` : `0` est la valeur initiale, utilisée au premier rendu seulement.
- Il renvoie un tableau de deux éléments : la valeur actuelle et une fonction pour la changer.
- Par convention : `[quelqueChose, setQuelqueChose]`.

Un **hook** est une fonction de React dont le nom commence par `use`. On l'appelle **en haut** du composant, jamais dans un `if` ou une boucle (leçon 9).

Chaque utilisation du composant a son propre état : deux `<Compteur />` comptent séparément.

## Le rendu et la « photo » de l'état

Quand tu appelles `setCompte`, React **planifie** un nouveau rendu. La variable `compte` ne change pas tout de suite : elle garde sa valeur jusqu'au rendu suivant.

```jsx
function handleClick() {
  setCompte(compte + 1);
  console.log(compte); // affiche encore l'ancienne valeur
}
```

### La mise à jour fonctionnelle

Si la nouvelle valeur dépend de l'ancienne, passe une **fonction** à `setCompte`. React lui donne la valeur la plus récente.

```jsx
function ajouterTrois() {
  setCompte(compte + 1);
  setCompte(compte + 1);
  setCompte(compte + 1); // compte n'a pas changé : +1 au total
}

function ajouterTroisBien() {
  setCompte((c) => c + 1);
  setCompte((c) => c + 1);
  setCompte((c) => c + 1); // +3 au total
}
```

> [!NOTE]
> Depuis React 18, toutes les mises à jour d'un même événement sont **regroupées** (« automatic batching ») en un seul rendu, même dans un `setTimeout` ou après un `await`.

### Quand React refait-il le rendu ?

Un composant refait son rendu quand :

- son état change (React compare avec `Object.is` : même valeur = pas de rendu) ;
- son parent refait son rendu ;
- un contexte qu'il lit change (leçon 8).

## Les objets dans l'état

Ne modifie jamais un objet de l'état. Crée une **copie** avec la syntaxe `...` (spread) et remplace-le.

```jsx
const [profil, setProfil] = useState({ nom: 'Ada', ville: 'Londres' });

// ✗ Mutation : React ne voit pas de changement
profil.ville = 'Paris';
setProfil(profil);

// ✓ Nouvel objet
setProfil({ ...profil, ville: 'Paris' });
```

Pour un objet imbriqué, copie chaque niveau modifié :

```jsx
const [user, setUser] = useState({ nom: 'Ada', adresse: { ville: 'Londres', cp: 'W1' } });

setUser({
  ...user,
  adresse: { ...user.adresse, ville: 'Paris' },
});
```

## Les tableaux dans l'état

Même règle : on crée un nouveau tableau.

| Action | ✗ À éviter (modifie) | ✓ À utiliser (copie) |
|--------|----------------------|----------------------|
| Ajouter | `push`, `unshift` | `[...liste, x]`, `[x, ...liste]` |
| Supprimer | `splice`, `pop` | `filter` |
| Modifier | `liste[i] = x` | `map` |
| Trier | `sort`, `reverse` | `toSorted()`, `toReversed()`, `[...liste].sort()` |

```jsx
const [taches, setTaches] = useState([
  { id: 1, texte: 'Lire la doc', faite: false },
]);

function ajouter(texte) {
  setTaches([...taches, { id: Date.now(), texte, faite: false }]);
}

function supprimer(id) {
  setTaches(taches.filter((t) => t.id !== id));
}

function basculer(id) {
  setTaches(taches.map((t) => (t.id === id ? { ...t, faite: !t.faite } : t)));
}
```

## L'état dérivé

Ne stocke pas dans l'état ce que tu peux **calculer** à partir d'autres valeurs. Calcule-le pendant le rendu.

```jsx
// ✗ Deux états à garder synchronisés
const [taches, setTaches] = useState([]);
const [nbRestantes, setNbRestantes] = useState(0);

// ✓ Une seule source de vérité
const [taches, setTaches] = useState([]);
const nbRestantes = taches.filter((t) => !t.faite).length;
```

Moins d'état = moins de bugs de synchronisation.

## Valeur initiale coûteuse

Si la valeur initiale demande un calcul, passe une fonction : elle ne s'exécute qu'au premier rendu.

```jsx
const [notes, setNotes] = useState(() => calculerNotesInitiales());
```

## Pièges fréquents

- **Muter l'état** : `liste.push(x); setListe(liste)` ne déclenche pas de rendu, car c'est le même tableau.
- **Lire l'état juste après `set`** : la variable garde l'ancienne valeur jusqu'au prochain rendu.
- **Plusieurs `set` basés sur la même valeur** : utilise `set((ancien) => …)`.
- **Appeler `set` pendant le rendu** : `setCompte(1)` directement dans le corps du composant crée une boucle infinie.
- **Copier une prop dans l'état** : `useState(props.nom)` ne suit pas les changements de la prop. Utilise la prop directement.
- **`onClick={handleClick()}`** : la fonction s'exécute au rendu au lieu du clic.

## Résumé

- Les événements se gèrent avec des props `onClick`, `onChange`… qui reçoivent une fonction.
- `const [valeur, setValeur] = useState(initiale)` garde une valeur et déclenche un rendu quand elle change.
- La valeur change au rendu suivant. Pour partir de l'ancienne valeur : `setValeur((v) => …)`.
- On ne modifie jamais un objet ou un tableau de l'état : on crée une copie (`...`, `map`, `filter`).
- Ce qui se calcule ne se stocke pas : c'est de l'état dérivé.

## Pour pratiquer

Fais les exercices [Un compteur](#/react/exercice/03-compteur) puis [Réglages du texte](#/react/exercice/04-reglages-texte). Ensuite, fais le TP [Compteur avec historique](#/react/tp/01-compteur).
