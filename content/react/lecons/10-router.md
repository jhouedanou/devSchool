# React Router

## Objectifs

- Installer React Router 7 et choisir un mode (déclaratif ou data).
- Déclarer des routes et naviguer avec `Link` et `NavLink`.
- Lire un paramètre d'URL avec `useParams` et naviguer par le code avec `useNavigate`.
- Créer des routes imbriquées avec `<Outlet>` et une page 404.
- Charger les données d'une page avec un loader.

## Installation

React ne gère pas les URL. React Router associe une URL à un composant, sans recharger la page.

```bash
npm i react-router
```

> [!NOTE]
> **Ce qui a changé en v7** : on installe et on importe `react-router` (plus `react-router-dom`, qui ne fait que ré-exporter pour le vieux code). React Router 7 propose trois modes : **déclaratif** (comme la v6 avec `<Routes>`), **data** (`createBrowserRouter`, avec loaders et actions) et **framework** (l'ancien Remix, avec `npx create-react-router@latest`). Cette leçon couvre les deux premiers.

## Mode déclaratif

### Le routeur

Enveloppe l'application dans `<BrowserRouter>`, dans `src/main.jsx`.

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
```

### Les routes

`<Routes>` choisit la première `<Route>` qui correspond à l'URL et affiche son `element`.

```jsx
import { Routes, Route } from 'react-router';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/a-propos" element={<APropos />} />
      <Route path="/users/:id" element={<UserDetail />} />
      <Route path="*" element={<PageIntrouvable />} />
    </Routes>
  );
}
```

- `:id` est un **segment dynamique** : il correspond à n'importe quelle valeur (`/users/3`, `/users/ada`).
- `path="*"` correspond à toutes les URL restantes : c'est la page 404.

## Les liens

### `Link`

`<Link to>` change l'URL **sans recharger la page**. Il affiche une balise `<a>` normale.

```jsx
import { Link } from 'react-router';

<nav>
  <Link to="/">Accueil</Link>
  <Link to="/users/3">Utilisateur 3</Link>
</nav>
```

> [!WARNING]
> `<a href="/users/3">` recharge toute la page et perd l'état de l'application. Utilise `<Link>` pour les liens internes.

### `NavLink`

`NavLink` sait si son lien est **actif**. Il ajoute la classe `active` et `aria-current="page"`. Tu peux aussi choisir la classe avec une fonction.

```jsx
import { NavLink } from 'react-router';

<NavLink to="/" end>Accueil</NavLink>
<NavLink to="/users" className={({ isActive }) => (isActive ? 'lien actif' : 'lien')}>
  Utilisateurs
</NavLink>
```

`end` rend le lien actif seulement sur l'URL exacte. Sans lui, `/` serait actif sur toutes les pages.

## Lire les paramètres : `useParams`

```jsx
import { useParams } from 'react-router';

function UserDetail() {
  const { id } = useParams();        // pour /users/3 → id = '3'
  return <h1>Utilisateur n° {id}</h1>;
}
```

Les paramètres sont **toujours des chaînes**. Convertis avec `Number(id)` si besoin.

Pour les paramètres après `?` (`/recherche?q=vue`), utilise `useSearchParams` :

```jsx
const [searchParams, setSearchParams] = useSearchParams();
const q = searchParams.get('q') ?? '';
```

## Naviguer par le code : `useNavigate`

Après une action (envoi d'un formulaire, déconnexion), `useNavigate` change de page.

```jsx
import { useNavigate } from 'react-router';

function FormulaireConnexion() {
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    await connecter();
    navigate('/tableau-de-bord');
  }

  return <form onSubmit={handleSubmit}>{/* … */}</form>;
}
```

- `navigate(-1)` revient à la page précédente.
- `navigate('/connexion', { replace: true })` remplace l'entrée de l'historique (le bouton Retour ne revient pas ici).

## Routes imbriquées et `<Outlet>`

Une route peut contenir des routes enfants. Le parent affiche une mise en page commune et place `<Outlet />` à l'endroit où l'enfant doit apparaître.

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Accueil />} />
    <Route path="users" element={<Users />} />
    <Route path="users/:id" element={<UserDetail />} />
    <Route path="*" element={<PageIntrouvable />} />
  </Route>
</Routes>
```

```jsx
import { NavLink, Outlet } from 'react-router';

function Layout() {
  return (
    <>
      <header>
        <NavLink to="/" end>Accueil</NavLink>
        <NavLink to="/users">Utilisateurs</NavLink>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
```

- Les chemins enfants sont **relatifs** au parent : `users` donne `/users`.
- `index` marque la route affichée à l'URL du parent (`/`).
- Une route sans `path`, avec seulement `element`, sert de mise en page.

## Mode data : `createBrowserRouter`

En mode data, tu décris les routes avec des objets, **en dehors** des composants. Tu gagnes les loaders, les actions et la gestion des erreurs par route.

```jsx
// src/main.jsx
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    ErrorBoundary: PageErreur,
    children: [
      { index: true, Component: Accueil },
      { path: 'users', Component: Users, loader: chargerUsers },
      { path: 'users/:id', Component: UserDetail, loader: chargerUser },
      { path: '*', Component: PageIntrouvable },
    ],
  },
]);

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);
```

`Component: Layout` équivaut à `element: <Layout />`. Crée le routeur une seule fois, hors de tout composant.

### Les loaders (aperçu)

Un **loader** charge les données **avant** d'afficher la page. Plus besoin d'effet ni d'état de chargement dans le composant.

```jsx
import { useLoaderData } from 'react-router';

async function chargerUser({ params }) {
  const res = await fetch(`/api/users/${params.id}`);
  if (!res.ok) throw new Response('Utilisateur introuvable', { status: 404 });
  return res.json();
}

function UserDetail() {
  const user = useLoaderData();
  return <h1>{user.nom}</h1>;
}
```

- Le loader reçoit `params` (les segments dynamiques) et `request`.
- Ce qu'il renvoie arrive dans `useLoaderData()`.
- Une erreur levée dans le loader affiche l'`ErrorBoundary` de la route (lis l'erreur avec `useRouteError()`).
- `useNavigation().state` vaut `'loading'` pendant le chargement de la page suivante : utile pour afficher un indicateur.

> [!NOTE]
> En v7, un loader renvoie un objet normal : `json()` et `defer()` ne sont plus nécessaires.

## Déployer une application avec routeur

En développement, Vite sert toujours `index.html`. En production, le serveur doit aussi renvoyer `index.html` pour toutes les URL (`/users/3`…). Sinon, recharger une page donne une erreur 404 du serveur. Les hébergeurs (Netlify, Vercel…) ont une option de « rewrite » pour ça.

## Pièges fréquents

- **`<a href>` au lieu de `<Link to>`** : la page se recharge et l'état est perdu.
- **Oublier `<Outlet />`** dans le parent : les routes enfants ne s'affichent pas.
- **`/` toujours actif** dans le menu : ajoute `end` sur ce `NavLink`.
- **`/users` dans une route enfant** : un chemin qui commence par `/` est absolu. Écris `users` pour un chemin relatif au parent.
- **Paramètre traité comme un nombre** : `useParams()` renvoie des chaînes.
- **Mélanger `react-router` et `react-router-dom`** : importe tout depuis `react-router`.
- **Routeur créé dans un composant** (mode data) : il serait recréé à chaque rendu. Crée-le au niveau du module.

## Résumé

- `npm i react-router`, et tous les imports viennent de `react-router` (sauf `RouterProvider` : `react-router/dom`).
- Mode déclaratif : `<BrowserRouter>`, `<Routes>`, `<Route path element>`.
- `<Link to>` et `<NavLink to>` (classe `active`, prop `end`) pour naviguer sans recharger.
- `useParams()` lit `:id` ; `useNavigate()` change de page par le code.
- Routes imbriquées : le parent affiche `<Outlet />` ; `index` pour la route par défaut ; `path="*"` pour la 404.
- Mode data : `createBrowserRouter` + `<RouterProvider>`, avec `loader` et `useLoaderData()`.

## Pour pratiquer

Il n'y a pas d'exercice dans le navigateur pour cette leçon : le routeur a besoin d'un vrai projet. Crée un projet Vite (`npm create vite@latest routes-demo -- --template react`), installe `react-router` et construis :

1. une mise en page avec un menu `NavLink` (Accueil, Utilisateurs) et un `<Outlet />` ;
2. une page `/users` qui liste trois utilisateurs avec des liens `<Link to={'/users/' + id}>` ;
3. une page `/users/:id` qui affiche l'id lu avec `useParams` et un bouton « Retour » avec `navigate(-1)` ;
4. une page 404.

Pour aller plus loin, copie dans ce projet ton composant du TP [Liste d'utilisateurs avec fetch](#/react/tp/04-liste-utilisateurs) et ajoute une page de détail par utilisateur, chargée avec un loader (mode data).
