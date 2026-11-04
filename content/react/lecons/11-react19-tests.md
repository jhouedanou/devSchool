# React 19 et les tests

## Objectifs

- Connaître les nouveautés de React 19 : `use`, les actions, `useOptimistic`, `ref` comme prop, les métadonnées.
- Savoir ce qui a été supprimé par rapport à React 18.
- Installer Vitest et Testing Library dans un projet Vite.
- Écrire un test : `render`, `screen`, `userEvent`, requêtes par rôle.

## Vue d'ensemble

| Avant (React 18) | Maintenant (React 19) |
|------------------|-----------------------|
| `forwardRef((props, ref) => …)` | `ref` est une prop normale |
| `<Ctx.Provider value>` | `<Ctx value>` (l'ancien marche encore) |
| `useEffect` + état pour lire une promesse | `use(promesse)` + `<Suspense>` |
| `onSubmit` + `preventDefault` + états « en cours » | `<form action>`, `useActionState`, `useFormStatus` |
| bibliothèque pour `<title>` (react-helmet) | `<title>` et `<meta>` directement dans le composant |
| `ReactDOM.render`, `propTypes`, `defaultProps` (fonctions), refs en chaîne | supprimés |

## `use` : lire une promesse ou un contexte

`use(promesse)` lit le résultat d'une promesse. Pendant l'attente, le composant **suspend** : React affiche le `fallback` du `<Suspense>` le plus proche.

```jsx
import { Suspense, use } from 'react';

function Commentaires({ commentairesPromesse }) {
  const commentaires = use(commentairesPromesse);
  return <ul>{commentaires.map((c) => <li key={c.id}>{c.texte}</li>)}</ul>;
}

export default function Article({ commentairesPromesse }) {
  return (
    <Suspense fallback={<p>Chargement des commentaires…</p>}>
      <Commentaires commentairesPromesse={commentairesPromesse} />
    </Suspense>
  );
}
```

- La promesse doit être créée **en dehors** du rendu (par un loader, un framework ou une bibliothèque avec cache). Une promesse créée dans le composant serait recréée à chaque rendu.
- Si la promesse échoue, l'erreur va au Error Boundary le plus proche.
- `use(MonContexte)` lit un contexte, comme `useContext`.
- Contrairement aux autres hooks, `use` peut être appelé dans un `if`.

## Les actions

Une **action** est une fonction (souvent `async`) lancée dans une transition. React suit son état « en cours » pour toi.

```jsx
import { useState, useTransition } from 'react';

function ModifierNom() {
  const [nom, setNom] = useState('');
  const [erreur, setErreur] = useState(null);
  const [enCours, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const err = await enregistrerNom(nom);
      if (err) setErreur(err);
    });
  }

  return (
    <>
      <input value={nom} onChange={(e) => setNom(e.target.value)} />
      <button onClick={handleClick} disabled={enCours}>Enregistrer</button>
      {erreur && <p>{erreur}</p>}
    </>
  );
}
```

En React 19, `startTransition` accepte une fonction `async`. Pour les formulaires, `<form action>`, `useActionState` et `useFormStatus` font ce travail (voir la [leçon 5](#/react/lecon/05-formulaires)).

## `useOptimistic`

`useOptimistic` affiche le résultat **attendu** tout de suite, pendant que l'action tourne. À la fin de l'action, React revient à la vraie valeur.

```jsx
import { useOptimistic } from 'react';

function Messages({ messages, envoyer }) {
  const [affiches, ajouterOptimiste] = useOptimistic(
    messages,
    (etat, texte) => [...etat, { id: 'temp', texte, enCours: true }]
  );

  async function action(formData) {
    const texte = formData.get('texte');
    ajouterOptimiste(texte);     // affiché tout de suite
    await envoyer(texte);        // le parent met à jour messages
  }

  return (
    <>
      <ul>
        {affiches.map((m) => (
          <li key={m.id}>{m.texte} {m.enCours && <small>(envoi…)</small>}</li>
        ))}
      </ul>
      <form action={action}>
        <input name="texte" />
        <button>Envoyer</button>
      </form>
    </>
  );
}
```

Si l'envoi échoue, le message optimiste disparaît tout seul.

## `ref` comme prop

Un composant fonction reçoit `ref` comme une prop normale. `forwardRef` n'est plus nécessaire (il sera déprécié).

```jsx
function Champ({ label, ref, ...props }) {
  return (
    <label>
      {label} <input ref={ref} {...props} />
    </label>
  );
}

function Formulaire() {
  const champRef = useRef(null);
  return (
    <>
      <Champ label="Nom" ref={champRef} />
      <button onClick={() => champRef.current.focus()}>Modifier</button>
    </>
  );
}
```

Une **ref callback** peut maintenant renvoyer une fonction de nettoyage :

```jsx
<div ref={(noeud) => {
  const obs = new ResizeObserver(() => console.log('taille changée'));
  obs.observe(noeud);
  return () => obs.disconnect();
}} />
```

## Les métadonnées dans les composants

Écris `<title>`, `<meta>` ou `<link>` dans n'importe quel composant. React les place dans le `<head>` de la page.

```jsx
function PageArticle({ article }) {
  return (
    <article>
      <title>{article.titre} – Mon blog</title>
      <meta name="description" content={article.resume} />
      <h1>{article.titre}</h1>
      <p>{article.contenu}</p>
    </article>
  );
}
```

> [!NOTE]
> **Après React 19.0** : la 19.2 a ajouté `<Activity>` (cacher une partie de l'écran en gardant son état) et `useEffectEvent`. La 19.3 (septembre 2026) a rendu stables `<ViewTransition>` (animations entre deux états) et les refs sur `<Fragment>`.

## Tester avec Vitest et Testing Library

**Vitest** lance les tests (il utilise la configuration de Vite). **Testing Library** affiche un composant dans un faux DOM (jsdom) et le manipule **comme un utilisateur** : par les textes, les rôles, les labels.

### Installation

```bash
npm i -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom
```

```js
// vite.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
```

```js
// src/setupTests.js
import '@testing-library/jest-dom/vitest';
```

Ajoute `"test": "vitest"` dans les scripts de `package.json`. `npm test` relance les tests à chaque modification ; `npx vitest run` les lance une fois.

### Un premier test

```jsx
// src/Compteur.test.jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Compteur from './Compteur';

test('le compteur augmente au clic', async () => {
  const user = userEvent.setup();
  render(<Compteur />);

  expect(screen.getByText('Valeur : 0')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '+1' }));
  expect(screen.getByText('Valeur : 1')).toBeInTheDocument();
});
```

- `render` affiche le composant.
- `screen` cherche dans tout le document.
- `userEvent` simule de vraies actions (clic, saisie). Chaque action renvoie une promesse : mets `await`.
- `toBeInTheDocument()` vient de `jest-dom`.

### Les requêtes

Cherche les éléments comme un utilisateur les voit. Ordre conseillé :

1. `getByRole('button', { name: 'Envoyer' })` : rôle + nom accessible ;
2. `getByLabelText('Email')` : champ de formulaire par son label ;
3. `getByText('Bonjour')` : texte visible ;
4. `getByTestId('panier')` : en dernier recours (`data-testid`).

| Préfixe | Si absent | Usage |
|---------|-----------|-------|
| `getBy…` | lève une erreur | l'élément doit être là |
| `queryBy…` | renvoie `null` | vérifier qu'un élément **n'est pas** là |
| `findBy…` | attend (promesse) | élément qui arrive plus tard (fetch) |

Les versions `getAllBy…`, `queryAllBy…`, `findAllBy…` renvoient un tableau.

### Tester un formulaire et un callback

```jsx
test('envoie la tâche saisie', async () => {
  const user = userEvent.setup();
  const onAjout = vi.fn();
  render(<FormulaireTache onAjout={onAjout} />);

  await user.type(screen.getByLabelText('Tâche'), 'Lire la doc');
  await user.click(screen.getByRole('button', { name: 'Ajouter' }));

  expect(onAjout).toHaveBeenCalledWith('Lire la doc');
  expect(screen.queryByText('Le champ est vide')).not.toBeInTheDocument();
});
```

### Tester un chargement avec fetch

Remplace `fetch` par une fausse fonction, puis attends le résultat avec `findBy…`.

```jsx
afterEach(() => vi.restoreAllMocks());

test('affiche les utilisateurs', async () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => [{ id: 1, nom: 'Ada' }],
  });
  render(<ListeUsers />);

  expect(screen.getByText('Chargement…')).toBeInTheDocument();
  expect(await screen.findByText('Ada')).toBeInTheDocument();
});
```

## Pièges fréquents

- **`use` avec une promesse créée dans le composant** : nouvelle promesse à chaque rendu, le composant suspend sans fin.
- **`useFormStatus` dans le composant qui rend le `<form>`** : place-le dans un enfant du formulaire.
- **Oublier `await`** devant `user.click` ou `user.type` : le test vérifie avant la mise à jour.
- **`getBy…` pour vérifier une absence** : il lève une erreur. Utilise `queryBy…`.
- **`getBy…` pour un résultat de fetch** : utilise `findBy…`, qui attend.
- **Tester les détails internes** (nom d'un état, classe CSS) : teste ce que l'utilisateur voit et fait.
- **`toBeInTheDocument` inconnu** : le fichier de setup avec `jest-dom` manque dans `setupFiles`.

## Résumé

- `use(promesse)` + `<Suspense>` lit une promesse ; `use(Contexte)` lit un contexte, même dans un `if`.
- Les actions sont des fonctions `async` dans une transition : `useTransition`, `<form action>`, `useActionState`, `useFormStatus`.
- `useOptimistic` affiche le résultat attendu pendant l'action.
- `ref` est une prop normale ; `<title>` et `<meta>` s'écrivent dans les composants.
- Vitest + Testing Library : `render`, `screen.getByRole`, `userEvent.setup()`, `findBy…` pour l'asynchrone.

## Pour pratiquer

Pas d'exercice dans le navigateur : ces API demandent React 19 et un vrai projet. Fais le TP [Formulaire avec useActionState (React 19)](#/react/tp/08-actions-react19). Tous les TP React ont des tests Vitest + Testing Library : lis-les pour voir des exemples de requêtes par rôle.
