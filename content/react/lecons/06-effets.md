# Les effets

## Objectifs

- Comprendre à quoi sert `useEffect` : se synchroniser avec l'extérieur.
- Choisir le bon tableau de dépendances.
- Écrire une fonction de nettoyage.
- Charger des données avec `fetch` sans bug de « course ».
- Savoir quand **ne pas** utiliser `useEffect`.

## Qu'est-ce qu'un effet ?

Un composant doit rester **pur** : il calcule son JSX, sans rien modifier autour de lui. Certaines choses doivent pourtant se passer **après** l'affichage :

- changer le titre de l'onglet ;
- démarrer un minuteur ;
- écouter un événement de `window` ;
- charger des données depuis une API.

C'est le rôle de `useEffect` : synchroniser le composant avec un **système extérieur** à React.

```jsx
import { useEffect, useState } from 'react';

export default function Compteur() {
  const [compte, setCompte] = useState(0);

  useEffect(() => {
    document.title = `Compteur : ${compte}`;
  }, [compte]);

  return <button onClick={() => setCompte(compte + 1)}>{compte}</button>;
}
```

React exécute l'effet **après** avoir mis à jour l'écran.

## Le tableau de dépendances

Le deuxième argument dit à React **quand** relancer l'effet.

| Écriture | L'effet s'exécute… |
|----------|--------------------|
| `useEffect(fn)` | après **chaque** rendu |
| `useEffect(fn, [])` | une seule fois, après le premier rendu (montage) |
| `useEffect(fn, [a, b])` | au montage, puis quand `a` ou `b` change |

Règle : mets dans le tableau **toutes** les valeurs du composant (props, état, variables calculées) que l'effet utilise. Le plugin ESLint `eslint-plugin-react-hooks` (inclus dans le template Vite) te prévient si tu en oublies.

> [!WARNING]
> Un objet ou une fonction créés pendant le rendu sont **nouveaux** à chaque rendu. Dans les dépendances, ils relancent l'effet à chaque fois. Crée-les dans l'effet, ou dépends de valeurs simples (`user.id` plutôt que `user`).

## Le nettoyage

Un effet peut renvoyer une **fonction de nettoyage**. React l'appelle :

- avant de relancer l'effet (quand une dépendance change) ;
- quand le composant disparaît (démontage).

```jsx
useEffect(() => {
  function handleResize() {
    setLargeur(window.innerWidth);
  }
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

```jsx
useEffect(() => {
  const id = setInterval(() => setSecondes((s) => s + 1), 1000);
  return () => clearInterval(id);
}, []);
```

Tout ce que l'effet démarre, le nettoyage l'arrête : écouteur, minuteur, connexion, abonnement.

> [!NOTE]
> En développement, `<StrictMode>` monte, démonte puis remonte chaque composant. Ton effet s'exécute donc deux fois, avec un nettoyage entre les deux. Si ça casse quelque chose, c'est que le nettoyage manque.

## Charger des données

L'effet ne peut pas être une fonction `async` (il doit renvoyer rien ou une fonction de nettoyage). Déclare une fonction `async` **dans** l'effet.

```jsx
export default function Profil({ userId }) {
  const [user, setUser] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const donnees = await res.json();
        if (!ignore) setUser(donnees);
      } catch (e) {
        if (!ignore) setErreur(e.message);
      } finally {
        if (!ignore) setChargement(false);
      }
    }

    charger();
    return () => { ignore = true; };
  }, [userId]);

  if (chargement) return <p>Chargement…</p>;
  if (erreur) return <p className="erreur">{erreur}</p>;
  return <h2>{user.nom}</h2>;
}
```

### Pourquoi le drapeau `ignore` ?

Si `userId` passe de 1 à 2, deux requêtes partent. La réponse de 1 peut arriver **après** celle de 2. Sans protection, l'écran afficherait l'utilisateur 1. Le nettoyage met `ignore = true` pour l'ancienne requête : sa réponse est ignorée.

### Variante avec `AbortController`

`AbortController` annule vraiment la requête.

```jsx
useEffect(() => {
  const controleur = new AbortController();
  fetch(`/api/users/${userId}`, { signal: controleur.signal })
    .then((res) => res.json())
    .then(setUser)
    .catch((e) => {
      if (e.name !== 'AbortError') setErreur(e.message);
    });
  return () => controleur.abort();
}, [userId]);
```

> [!TIP]
> Dans une vraie application, on utilise souvent une bibliothèque (TanStack Query, SWR) ou les loaders du routeur (leçon 10). Elles gèrent le cache, les erreurs et les courses pour toi.

## Quand NE PAS utiliser `useEffect`

Si rien d'extérieur n'est concerné, tu n'as probablement pas besoin d'un effet.

### Pour un état dérivé

```jsx
// ✗ Un effet et un état en trop, et un rendu supplémentaire
const [nomComplet, setNomComplet] = useState('');
useEffect(() => {
  setNomComplet(prenom + ' ' + nom);
}, [prenom, nom]);

// ✓ Calcul pendant le rendu
const nomComplet = prenom + ' ' + nom;
```

### Pour réagir à une action de l'utilisateur

```jsx
// ✗ Envoi déclenché par un effet qui surveille un état
useEffect(() => {
  if (envoye) envoyerFormulaire(form);
}, [envoye]);

// ✓ Envoi directement dans le gestionnaire d'événement
function handleSubmit(e) {
  e.preventDefault();
  envoyerFormulaire(form);
}
```

Question à te poser : « Ce code doit-il tourner **parce que le composant est affiché**, ou **parce que l'utilisateur a fait quelque chose** ? ». Dans le second cas, mets-le dans le gestionnaire d'événement.

### Pour réinitialiser l'état quand une prop change

Donne une `key` au composant au lieu d'écrire un effet : `<Profil key={userId} userId={userId} />`.

> [!NOTE]
> **React 19.2** a ajouté `useEffectEvent`. Il crée une fonction qui lit toujours les dernières props et le dernier état, sans être une dépendance de l'effet. Utile quand un effet doit lire une valeur sans se relancer quand elle change.

## Pièges fréquents

- **Boucle infinie** : un effet sans tableau qui appelle `setX` se relance après chaque rendu.
- **Dépendance oubliée** : l'effet garde une ancienne valeur. Écoute le linter.
- **`useEffect(async () => …)`** : interdit, l'effet renverrait une promesse. Mets la fonction `async` dedans.
- **Pas de nettoyage** : écouteurs ou minuteurs en double, fuites de mémoire.
- **Effet pour un calcul** : calcule pendant le rendu.
- **Effet déclenché deux fois en développement** : c'est StrictMode. Ajoute le nettoyage, ne supprime pas StrictMode.

## Résumé

- `useEffect(fn, deps)` exécute du code après l'affichage, pour se synchroniser avec l'extérieur.
- `[]` = au montage ; `[a, b]` = quand `a` ou `b` change ; sans tableau = à chaque rendu.
- L'effet peut renvoyer une fonction de nettoyage, appelée avant le prochain effet et au démontage.
- Pour `fetch` : une fonction `async` dans l'effet, les états chargement/erreur, et un drapeau `ignore` ou un `AbortController`.
- Pas d'effet pour un état dérivé ni pour réagir à un événement.

## Pour pratiquer

Fais les exercices [Titre de l'onglet](#/react/exercice/07-titre-onglet) et [Charger un utilisateur](#/react/exercice/08-charger-utilisateur). Ensuite, fais le TP [Liste d'utilisateurs avec fetch](#/react/tp/04-liste-utilisateurs).
