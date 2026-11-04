# Liste de tâches

## Objectif

Tu construis une liste de tâches. On peut ajouter une tâche, la cocher, la supprimer et filtrer la liste. Un compteur indique le nombre de tâches restantes.

## Ce que tu vas pratiquer

- Un champ contrôlé et l'envoi d'un formulaire (`onSubmit`, `preventDefault`).
- Un tableau d'objets dans l'état, modifié avec `map` et `filter`.
- Les valeurs dérivées : calculées pendant le rendu, pas stockées dans l'état.
- Des clés (`key`) stables pour les listes.

Revois si besoin [la leçon sur les conditions et les listes](#/react/lecon/04-conditions-listes) et [la leçon sur l'état](#/react/lecon/03-etat-evenements).

## Fichiers à modifier

- `exercices/02-todo-list/TodoList.jsx`

## Étapes

1. Rends le champ « Nouvelle tâche » contrôlé avec l'état `texte`.
2. Dans `ajouter`, retire les espaces autour du texte. Ignore un texte vide. Sinon, ajoute `{ id, texte, faite: false }` et vide le champ.
3. Donne à chaque tâche un id unique avec `crypto.randomUUID()`. Utilise-le comme `key`.
4. Écris `basculer(id)` et `supprimer(id)`. Branche la case à cocher et le bouton « Supprimer ».
5. Branche les boutons de filtre. `aria-pressed` vaut `true` pour le filtre actif et `false` pour les autres : `aria-pressed={filtre === nom}`.
6. Calcule `tachesVisibles` selon le filtre, et `restantes` (tâches pas faites).
7. Affiche « 1 tâche restante » au singulier (0 ou 1) et « 2 tâches restantes » au pluriel.

Garde ces textes, les tests les utilisent :

| Élément | Texte exact |
|---------|-------------|
| Champ | label `Nouvelle tâche` |
| Bouton d'ajout | `Ajouter` (type `submit`) |
| Filtres | `Toutes`, `Actives`, `Terminées` |
| Liste | `<ul aria-label="Tâches">` |
| Case à cocher | dans un `<label>` qui contient le texte de la tâche |
| Suppression | bouton avec `aria-label="Supprimer <texte>"` |
| Compteur | `0 tâche restante`, `1 tâche restante`, `2 tâches restantes` |

> [!WARNING]
> Avec `key={index}`, React réutilise une ligne pour une autre tâche quand tu supprimes un élément. Un test vérifie que tes clés sont stables.

## Lancer les tests

Depuis le dossier `tp/react` :

```bash
npm test -- 02-todo-list
```

## Critères de réussite

- Le bouton « Ajouter » ajoute la tâche et vide le champ.
- La touche Entrée ajoute aussi la tâche.
- Une tâche vide (ou faite d'espaces) est ignorée. Les espaces autour du texte sont retirés.
- Cocher une tâche coche la case et met à jour le compteur de tâches restantes.
- « Supprimer » retire la tâche.
- Les filtres « Toutes », « Actives » et « Terminées » affichent les bonnes tâches.
- Le filtre actif a `aria-pressed="true"`, les autres `aria-pressed="false"`.
- Les clés sont stables : supprimer une tâche ne déplace pas les autres lignes.

## Pour aller plus loin

- Ajoute un bouton « Supprimer les tâches terminées ».
- Permets de modifier le texte d'une tâche avec un double-clic.
- Garde les tâches après un rechargement de la page (tu feras un hook pour ça dans le TP 06).
