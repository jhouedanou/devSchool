# Afficher les tâches avec useFetch

## Objectif

Créer la page `/taches`. Elle charge les tâches depuis l'API du TP 03, permet de les filtrer et d'en ajouter une.
La page gère aussi le chargement et les erreurs.

## Ce que tu vas pratiquer

- `useFetch()` et ses valeurs `data`, `status`, `error`, `refresh` ;
- une `query` réactive qui relance la requête toute seule ;
- `$fetch()` pour envoyer un `POST` ;
- l'affichage des états : chargement, erreur, liste.

Revois si besoin [la leçon sur les données](#/nuxt/lecon/04-donnees).

## Fichiers à créer ou modifier

- `app/pages/taches.vue`
- `app/layouts/default.vue` (à modifier)

## Étapes

1. Crée `app/pages/taches.vue` avec un `<h1>Tâches</h1>`.
2. Crée un filtre : `const filtre = ref('toutes')`. Affiche-le avec un `<select v-model="filtre" data-test="filtre">` et trois options de valeur `toutes`, `faites` et `a-faire`.
3. Crée une `query` calculée à partir du filtre :
   - `faites` → `{ fait: 'true' }` ;
   - `a-faire` → `{ fait: 'false' }` ;
   - `toutes` → `{}`.
4. Charge les tâches : `const { data, status, error, refresh } = await useFetch('/api/taches', { query })`.
5. Affiche un seul de ces trois blocs :
   - si `status === 'pending'` : `<p data-test="chargement">Chargement…</p>` ;
   - sinon, s'il y a une erreur : `<p data-test="erreur">Impossible de charger les tâches.</p>` ;
   - sinon, la liste : un `<li data-test="tache">` par tâche, avec son titre.
6. Ajoute un formulaire `<form data-test="formulaire">` avec `<input data-test="titre">` et un bouton « Ajouter ».
7. À l'envoi du formulaire (`@submit.prevent`) :
   - envoie `await $fetch('/api/taches', { method: 'POST', body: { titre } })` ;
   - vide le champ ;
   - recharge la liste avec `await refresh()`.
8. Si le `POST` échoue, affiche le message du serveur dans `<p data-test="erreur-ajout">`. Le message se trouve dans `e.data.message`.
9. Ajoute un lien « Tâches » vers `/taches` dans la navigation du layout.
10. Lance `npm run dev` et essaie la page. Elle utilise ta vraie API du TP 03.

> [!TIP]
> Passe la `computed` elle-même à `useFetch` (`{ query }`), pas `query.value`. Sinon, la requête ne se relance pas.

## Lancer les tests

Depuis le dossier `tp/nuxt` :

```bash
npm test -- 04-usefetch-taches
```

Les tests n'utilisent pas ta vraie API : `registerEndpoint()` crée une fausse route `/api/taches` pour chaque test.

## Critères de réussite

- La page affiche une ligne `[data-test="tache"]` par tâche renvoyée par `/api/taches`.
- Pendant un chargement, la page affiche `[data-test="chargement"]` avec « Chargement… ».
- Si l'API répond une erreur, la page affiche `[data-test="erreur"]` avec « Impossible de charger les tâches. ».
- Le filtre « faites » appelle `/api/taches?fait=true`, le filtre « a-faire » appelle `/api/taches?fait=false`, et la liste se met à jour.
- Le formulaire envoie `{ titre }` en `POST`, recharge la liste, puis vide le champ.
- Si l'API refuse la tâche, un message s'affiche dans `[data-test="erreur-ajout"]`.

## Pour aller plus loin

- Désactive le bouton « Ajouter » pendant l'envoi.
- Ajoute une case à cocher par tâche et la route `PATCH` du TP 03 pour changer `fait`.
- Garde le filtre dans l'URL (`/taches?filtre=faites`) avec `useRoute()` et `navigateTo()`.
