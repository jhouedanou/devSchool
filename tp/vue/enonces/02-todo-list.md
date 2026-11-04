# Liste de tâches

## Objectif

Tu construis une liste de tâches classique : on ajoute une tâche, on la coche, on la supprime.
Des filtres affichent toutes les tâches, les tâches actives ou les tâches terminées.
Un compteur indique combien de tâches restent à faire.

## Ce que tu vas pratiquer

- `v-model` sur un champ texte et sur une case à cocher ;
- `v-for` avec `:key` ;
- un formulaire avec `@submit.prevent` ;
- des `computed` qui filtrent et qui comptent.

Leçons utiles : [les directives](#/vue/lecon/03-directives) et [les formulaires](#/vue/lecon/04-formulaires).

## Fichiers à modifier

- `exercices/02-todo-list/TodoList.vue`

## Étapes

1. Écris `ajouter()` : nettoie le texte avec `trim()`, refuse un texte vide, ajoute `{ id, texte, fait: false }` puis vide le champ.
2. Affiche les tâches avec `v-for`. Chaque ligne contient une case à cocher liée à `tache.fait`, le texte et un bouton « Supprimer ».
3. Écris `supprimer(id)` avec `filter()`.
4. Crée un ref `filtre` (`'toutes'`, `'actives'` ou `'terminees'`) et un `computed` `tachesVisibles`.
5. Branche les trois boutons de filtre.
6. Crée un `computed` qui compte les tâches pas encore faites et affiche le texte au bon nombre :
   « 0 tâche restante », « 1 tâche restante », « 2 tâches restantes ».

Les tests utilisent ces sélecteurs :

| Élément | Sélecteur |
|---------|-----------|
| Champ de saisie | `[data-test="nouvelle-tache"]` |
| Bouton « Ajouter » (type submit) | `[data-test="ajouter"]` |
| Une ligne de tâche (`<li>`) | `[data-test="tache"]` |
| Case à cocher d'une tâche | `[data-test="case"]` |
| Texte d'une tâche | `[data-test="texte"]` |
| Bouton « Supprimer » | `[data-test="supprimer"]` |
| Filtres | `[data-test="filtre-toutes"]`, `[data-test="filtre-actives"]`, `[data-test="filtre-terminees"]` |
| Compteur | `[data-test="restantes"]` |

> [!TIP]
> Garde le `<form @submit.prevent="ajouter">` : la touche Entrée ajoute alors la tâche, sans code en plus.

## Lancer les tests

Depuis le dossier `tp/vue` :

```bash
npm test -- 02-todo-list
```

Pour voir ta liste dans le navigateur : `npm run dev`.

## Critères de réussite

- Le bouton « Ajouter » ajoute une tâche.
- Le texte est nettoyé avec `trim()`.
- Une tâche vide ou faite d'espaces est refusée.
- Le champ est vidé après l'ajout.
- « Supprimer » enlève la bonne tâche.
- Le compteur affiche « 2 tâches restantes », « 1 tâche restante », « 0 tâche restante ».
- Le filtre « Actives » n'affiche que les tâches à faire.
- Le filtre « Terminées » n'affiche que les tâches cochées, et « Toutes » réaffiche tout.

## Pour aller plus loin

- Ajoute un bouton « Supprimer les tâches terminées ».
- Sauvegarde les tâches dans `localStorage` avec un `watch(taches, …, { deep: true })`.
- Permets de modifier le texte d'une tâche par un double-clic.
