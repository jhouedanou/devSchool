# Thème clair/sombre avec Context

## Objectif

Tu partages un thème (`clair` ou `sombre`) entre plusieurs composants, sans le passer en props. Un bouton change le thème. Les cartes lisent le thème et changent de classe CSS.

## Ce que tu vas pratiquer

- `createContext` et un composant Provider.
- Un hook personnalisé `useTheme` qui lit le contexte avec `useContext`.
- Une erreur claire quand le hook est utilisé hors du Provider.
- La syntaxe React 19 : `<ThemeContext value={…}>` sans `.Provider`.
- `renderHook` et `act` dans les tests.

Revois si besoin [la leçon sur le contexte](#/react/lecon/08-context).

## Fichiers à modifier

- `exercices/05-theme-context/ThemeContext.jsx`
- `exercices/05-theme-context/BoutonTheme.jsx`
- `exercices/05-theme-context/Carte.jsx`

## Étapes

1. Dans `ThemeProvider`, crée un état `theme` qui vaut `themeInitial` au départ (`'clair'` par défaut).
2. Écris `basculer()` : `'clair'` devient `'sombre'`, et inversement.
3. Renvoie `<ThemeContext value={{ theme, basculer }}>{children}</ThemeContext>`.
4. Dans `useTheme`, si le contexte vaut `null`, lève une erreur avec le message exact `useTheme doit être utilisé dans un ThemeProvider.` Sinon, renvoie la valeur. Supprime la valeur de secours du code de départ.
5. Dans `BoutonTheme`, appelle `basculer` au clic. Le texte dépend du thème.
6. Dans `Carte`, lis le thème et ajoute la classe `theme-clair` ou `theme-sombre` à l'`<article>`.

Garde ces textes, les tests les utilisent :

| Élément | Valeur exacte |
|---------|---------------|
| Bouton en thème clair | `Passer en mode sombre` |
| Bouton en thème sombre | `Passer en mode clair` |
| Classe de la carte | `carte theme-clair` ou `carte theme-sombre` |
| Valeur du contexte | `{ theme, basculer }` |
| Prop du Provider | `themeInitial` (`'clair'` par défaut) |

> [!TIP]
> Avec `createContext(null)`, `useContext` renvoie `null` quand aucun Provider n'est au-dessus. C'est ce qui permet de lever une erreur utile au lieu d'un bug silencieux.

## Lancer les tests

Depuis le dossier `tp/react` :

```bash
npm test -- 05-theme-context
```

## Critères de réussite

- Les cartes sont en thème clair par défaut (classe `theme-clair`).
- Le bouton affiche « Passer en mode sombre » au départ.
- Un clic passe toutes les cartes en thème sombre et change le texte du bouton.
- Un deuxième clic revient au thème clair.
- `ThemeProvider` accepte un thème de départ avec la prop `themeInitial`.
- `useTheme()` renvoie `{ theme, basculer }` dans un `ThemeProvider`.
- `useTheme()` lève l'erreur « useTheme doit être utilisé dans un ThemeProvider. » hors d'un Provider.

## Pour aller plus loin

- Mémorise la valeur du contexte avec `useMemo` et `basculer` avec `useCallback`. Quand est-ce utile ?
- Garde le thème choisi dans `localStorage` (voir le TP 06).
- Au premier chargement, utilise la préférence du système : `window.matchMedia('(prefers-color-scheme: dark)')`.
