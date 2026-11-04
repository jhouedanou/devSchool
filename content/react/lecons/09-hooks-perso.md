# Hooks personnalisés

## Objectifs

- Connaître les deux règles des hooks et leur raison.
- Extraire de la logique dans un hook personnalisé.
- Écrire `useToggle`, `useFetch` et `useLocalStorage`.
- Comprendre qu'un hook partage de la logique, pas de l'état.

## Les règles des hooks

Deux règles, pour tous les hooks (`useState`, `useEffect`, les tiens…) :

1. **Appelle-les au premier niveau** du composant : pas dans un `if`, une boucle, une fonction imbriquée, ni après un `return` anticipé.
2. **Appelle-les seulement dans un composant ou dans un autre hook**, jamais dans une fonction JavaScript normale.

```jsx
function Profil({ user }) {
  if (!user) return null;
  const [ouvert, setOuvert] = useState(false); // ✗ après un return anticipé
  // …
}

function Profil({ user }) {
  const [ouvert, setOuvert] = useState(false); // ✓ en haut, toujours appelé
  if (!user) return null;
  // …
}
```

**Pourquoi ?** React ne connaît pas le nom de tes variables. Il retrouve chaque état grâce à l'**ordre d'appel** des hooks. Si un hook est sauté au rendu suivant, tous les états se décalent.

Le plugin `eslint-plugin-react-hooks` vérifie ces règles pour toi.

> [!NOTE]
> Exception en React 19 : `use()` (pour lire une promesse ou un contexte) peut être appelé dans un `if`. Ce n'est pas le cas des autres hooks.

## Qu'est-ce qu'un hook personnalisé ?

Un hook personnalisé est une **fonction dont le nom commence par `use`** et qui appelle d'autres hooks. Il sert à réutiliser de la logique entre composants.

```jsx
import { useState } from 'react';

export function useToggle(initial = false) {
  const [valeur, setValeur] = useState(initial);
  const basculer = () => setValeur((v) => !v);
  return [valeur, basculer];
}
```

```jsx
function Faq({ question, reponse }) {
  const [ouvert, basculer] = useToggle();
  return (
    <div>
      <button onClick={basculer}>{question}</button>
      {ouvert && <p>{reponse}</p>}
    </div>
  );
}
```

- Le préfixe `use` est obligatoire : il dit à React et au linter que les règles des hooks s'appliquent.
- Renvoie ce que tu veux : une valeur, un tableau (`[valeur, set]`, comme `useState`) ou un objet (`{ data, loading }`).

### Logique partagée, état séparé

Chaque appel d'un hook a **son propre état**. Deux composants qui appellent `useToggle()` ne partagent rien.

```jsx
const [menuOuvert, basculerMenu] = useToggle();
const [aideOuverte, basculerAide] = useToggle(); // indépendant du premier
```

Pour partager un état entre composants, remonte-le dans un parent ou utilise un contexte (leçon 8).

## useFetch

Tu as déjà écrit la logique de chargement dans un effet (leçon 6). Extrais-la dans un hook pour la réutiliser.

```jsx
import { useEffect, useState } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        return res.json();
      })
      .then((json) => { if (!ignore) setData(json); })
      .catch((e) => { if (!ignore) setError(e.message); })
      .finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [url]);

  return { data, loading, error };
}
```

```jsx
function ListeArticles() {
  const { data, loading, error } = useFetch('/api/articles');
  if (loading) return <p>Chargement…</p>;
  if (error) return <p className="erreur">{error}</p>;
  return <ul>{data.map((a) => <li key={a.id}>{a.titre}</li>)}</ul>;
}
```

Le composant devient court et lisible. Quand `url` change, le hook recharge tout seul.

## useLocalStorage

Ce hook se comporte comme `useState`, mais garde la valeur dans le `localStorage` du navigateur.

```jsx
import { useEffect, useState } from 'react';

export function useLocalStorage(cle, valeurInitiale) {
  const [valeur, setValeur] = useState(() => {
    try {
      const brut = localStorage.getItem(cle);
      return brut !== null ? JSON.parse(brut) : valeurInitiale;
    } catch {
      return valeurInitiale;
    }
  });

  useEffect(() => {
    localStorage.setItem(cle, JSON.stringify(valeur));
  }, [cle, valeur]);

  return [valeur, setValeur];
}
```

```jsx
const [theme, setTheme] = useLocalStorage('theme', 'clair');
```

- La fonction passée à `useState` lit le stockage **une seule fois**, au premier rendu.
- `JSON.stringify` / `JSON.parse` permettent de stocker des nombres, des tableaux, des objets.
- `try/catch` protège contre un JSON abîmé ou un stockage bloqué.
- L'effet enregistre la valeur à chaque changement : écrire dans `localStorage`, c'est se synchroniser avec l'extérieur.

## Quand créer un hook ?

- Tu copies-colles la même combinaison de `useState` + `useEffect` dans plusieurs composants.
- Un composant devient long et tu veux nommer une partie de sa logique (`useFiltres`, `useMinuteur`).
- Tu veux cacher un détail technique (API du navigateur, abonnement).

Ne crée pas un hook pour une simple fonction sans hook : une fonction normale suffit (`formaterPrix(prix)` n'a pas besoin de `use`).

> [!TIP]
> Avant d'écrire un hook, regarde s'il existe déjà : React Router (`useParams`, `useNavigate`) ou TanStack Query (`useQuery`) en fournissent beaucoup.

## Pièges fréquents

- **Hook dans un `if` ou après un `return`** : les états se décalent, React lève une erreur.
- **Nom sans `use`** : `toggle()` qui appelle `useState` casse la règle et le linter ne peut plus t'aider.
- **Croire que l'état est partagé** : chaque appel crée un état neuf.
- **Oublier les dépendances** dans l'effet du hook (`[url]`) : le hook ne recharge pas quand l'URL change.
- **Lire `localStorage` à chaque rendu** : utilise l'initialisation paresseuse `useState(() => …)`.

## Résumé

- Règles : hooks au premier niveau, et seulement dans un composant ou un hook.
- React retrouve les états grâce à l'ordre d'appel des hooks.
- Un hook personnalisé est une fonction `useXxx` qui appelle d'autres hooks.
- Il partage de la logique ; chaque appel a son propre état.
- Exemples classiques : `useToggle`, `useFetch(url)`, `useLocalStorage(cle, initiale)`.

## Pour pratiquer

Fais les exercices [Hook useToggle](#/react/exercice/12-use-toggle) et [Hook useFetch](#/react/exercice/13-use-fetch). Ensuite, fais le TP [Hook useLocalStorage](#/react/tp/06-hook-local-storage).
