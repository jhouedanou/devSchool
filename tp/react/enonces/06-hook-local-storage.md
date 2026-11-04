# Hook useLocalStorage

## Objectif

Tu écris un hook `useLocalStorage`. Il s'utilise comme `useState`, mais il garde la valeur dans `localStorage`. La valeur survit donc à un rechargement de la page. Tu l'utilises ensuite dans un composant `Preferences`.

## Ce que tu vas pratiquer

- Écrire un hook personnalisé qui combine `useState` et `useEffect`.
- L'initialisation paresseuse : `useState(() => …)`.
- `JSON.stringify`, `JSON.parse` et `try` / `catch`.
- Tester un hook seul avec `renderHook` et `act`.

Revois si besoin [la leçon sur les hooks personnalisés](#/react/lecon/09-hooks-perso) et [la leçon sur les effets](#/react/lecon/06-effets).

## Fichiers à modifier

- `exercices/06-hook-local-storage/useLocalStorage.js`
- `exercices/06-hook-local-storage/Preferences.jsx`

## Étapes

1. Dans `useLocalStorage(cle, valeurInitiale)`, passe une fonction à `useState`. Elle lit `localStorage.getItem(cle)` une seule fois, au premier rendu.
2. Si rien n'est stocké (`null`), utilise `valeurInitiale`. Si `valeurInitiale` est une fonction, appelle-la (comme `useState`).
3. Sinon, décode la valeur avec `JSON.parse`. Si le JSON est invalide, attrape l'erreur et utilise `valeurInitiale`.
4. Avec `useEffect`, écris `JSON.stringify(valeur)` dans `localStorage` à chaque changement de `valeur` (ou de `cle`).
5. Renvoie `[valeur, setValeur]`. Le `setValeur` de `useState` accepte déjà une valeur ou une fonction `(v) => …`.
6. Dans `Preferences.jsx`, remplace les deux `useState` par `useLocalStorage`.

Garde ces noms, les tests les utilisent :

| Élément | Valeur exacte |
|---------|---------------|
| Export du hook | `export function useLocalStorage(cle, valeurInitiale)` |
| Clés de `Preferences` | `preferences.pseudo` et `preferences.compact` |
| Champs de `Preferences` | label `Pseudo`, case `Mode compact` |
| Message | `Bonjour Léa !` (ou `Bonjour inconnu !` sans pseudo) |

> [!TIP]
> `useState(lire())` appelle `lire()` à chaque rendu. `useState(() => lire())` ne l'appelle qu'au premier. Lire `localStorage` à chaque rendu est inutile.

## Lancer les tests

Depuis le dossier `tp/react` :

```bash
npm test -- 06-hook-local-storage
```

## Critères de réussite

- Le hook renvoie la valeur initiale quand rien n'est stocké, et une fonction pour la changer.
- Il lit la valeur déjà présente dans `localStorage` (en JSON).
- Il écrit la nouvelle valeur en JSON dans `localStorage`.
- Il accepte une fonction de mise à jour, comme `useState`.
- Il accepte une fonction comme valeur initiale, comme `useState`.
- Il garde la valeur initiale si le contenu stocké n'est pas du JSON valide.
- `Preferences` retrouve le pseudo et le mode compact après un démontage puis un nouveau rendu.

## Pour aller plus loin

- Entoure aussi `localStorage.setItem` d'un `try` / `catch` (stockage plein ou interdit).
- Écoute l'événement `storage` de `window` pour synchroniser plusieurs onglets.
- Ajoute une fonction `effacer()` en troisième valeur du tableau.
- Utilise ton hook dans le TP 02 pour garder les tâches.
