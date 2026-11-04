# Composable useFetch

## Objectif

Tu écris un composable `useFetch(url)` qui charge des données JSON.
Il renvoie trois refs : `data`, `error` et `loading`, plus une fonction `refresh()`.
Si l'URL change, la requête repart toute seule.
Ensuite, tu l'utilises dans un composant qui affiche une liste d'utilisateurs.

## Ce que tu vas pratiquer

- écrire un composable (une fonction `useXxx` qui utilise la réactivité) ;
- `toValue()` pour accepter une chaîne, un ref ou un getter ;
- `watchEffect()` pour relancer un traitement quand ses dépendances changent ;
- `fetch()`, `async` / `await` et la gestion d'erreur ;
- les états « chargement », « erreur » et « liste » avec `v-if` / `v-else-if`.

Leçons utiles : [les composables](#/vue/lecon/08-composables), [watch et le cycle de vie](#/vue/lecon/07-watch-cycle-de-vie) et [les tests](#/vue/lecon/11-tests-typescript).

## Fichiers à modifier

- `exercices/05-composable-fetch/useFetch.js`
- `exercices/05-composable-fetch/ListeUtilisateurs.vue`

## Étapes

1. Dans `refresh()`, lis l'URL avec `toValue(url)`, avant le premier `await`.
2. Remets `data` et `error` à `null`, puis passe `loading` à `true`.
3. Dans un `try / catch / finally` :
   - appelle `fetch(adresse)` ;
   - si `reponse.ok` est faux (404, 500…), lève une `Error` ;
   - sinon, mets `await reponse.json()` dans `data` ;
   - en cas d'erreur, mets-la dans `error` ;
   - dans `finally`, repasse `loading` à `false`.
4. Appelle `refresh()` dans un `watchEffect`.
5. Dans `ListeUtilisateurs.vue`, appelle `useFetch(() => url)`. Le getter permet de suivre la prop.
6. Affiche « Chargement… », ou le message d'erreur, ou la liste. Ajoute le bouton « Recharger ».

Les tests utilisent ces sélecteurs :

| Élément | Sélecteur |
|---------|-----------|
| Message de chargement | `[data-test="chargement"]` |
| Message d'erreur | `[data-test="erreur"]` |
| Un utilisateur (`<li>`) | `[data-test="utilisateur"]` |
| Bouton « Recharger » | `[data-test="recharger"]` |

> [!WARNING]
> `fetch()` ne lève pas d'erreur pour une réponse 404 ou 500. Il faut tester `reponse.ok` toi-même.

> [!NOTE]
> Les tests ne font aucune vraie requête. Ils remplacent `fetch` par une fausse fonction avec `vi.stubGlobal('fetch', …)`, puis attendent les promesses avec `flushPromises()`. Lis `tests/05-composable-fetch.test.js` pour voir comment.

## Lancer les tests

Depuis le dossier `tp/vue` :

```bash
npm test -- 05-composable-fetch
```

Dans la galerie (`npm run dev`), le composant charge `public/api/utilisateurs.json`.

## Critères de réussite

- Pendant la requête, `loading` vaut `true` ; ensuite `data` contient le JSON et `error` vaut `null`.
- Une réponse 500 remplit `error`, laisse `data` à `null` et remet `loading` à `false`.
- Une erreur réseau remplit `error`, laisse `data` à `null` et remet `loading` à `false`.
- Quand l'URL (un ref) change, la requête repart avec la nouvelle URL.
- `refresh()` relance la requête.
- Le composant affiche « Chargement… » pendant la requête.
- Le composant affiche un `<li>` par utilisateur.
- Le composant affiche un message en cas d'erreur.
- Le bouton « Recharger » relance la requête.
- Quand la prop `url` change, la requête repart.

## Pour aller plus loin

- Annule la requête précédente avec un `AbortController` quand l'URL change vite.
- Ajoute une option `{ immediate: false }` pour ne pas lancer la requête tout de suite.
- Garde les réponses en cache, par URL, pour ne pas recharger deux fois la même chose.
