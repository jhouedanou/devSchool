# Compteur avec historique

## Objectif

Tu construis un compteur avec les boutons +1, -1 et « Remise à zéro ». Le compteur garde la liste des valeurs précédentes. Le bouton « Annuler » revient à la valeur d'avant.

## Ce que tu vas pratiquer

- `useState` avec un nombre et avec un tableau.
- Les gestionnaires d'événements (`onClick`).
- Les mises à jour immuables d'un tableau (`[...tableau, x]`, `slice`).
- L'attribut `disabled` calculé à partir de l'état.
- L'affichage d'une liste avec `map` et `key`.

Revois si besoin [la leçon sur l'état](#/react/lecon/03-etat-evenements) et [la leçon sur les listes](#/react/lecon/04-conditions-listes).

## Fichiers à modifier

- `exercices/01-compteur/Compteur.jsx`

## Étapes

1. Ajoute un état `historique` : un tableau vide au départ.
2. Écris une fonction `changer(nouvelleValeur)`. Elle ajoute la valeur actuelle à la fin de l'historique, puis remplace la valeur.
3. Branche les boutons `-1`, `+1` et `Remise à zéro` sur `changer`.
4. Écris une fonction `annuler()`. Elle remet la dernière valeur de l'historique et la retire du tableau.
5. Désactive « Annuler » quand l'historique est vide.
6. Affiche chaque valeur de l'historique dans un `<li>`.

Garde ces textes, les tests les utilisent :

| Élément | Texte exact |
|---------|-------------|
| Valeur affichée | `Valeur : 0` (dans un seul `<p>`) |
| Boutons | `-1`, `+1`, `Remise à zéro`, `Annuler` |
| Liste | `<ul aria-label="Historique">` (toujours présente, même vide) |

> [!TIP]
> Ne modifie jamais le tableau avec `push` ou `pop`. Crée un nouveau tableau : `[...historique, valeur]` pour ajouter, `historique.slice(0, -1)` pour retirer le dernier.

> [!NOTE]
> Ici, `key={index}` convient : la liste ne change qu'à la fin. Dans le TP suivant, tu verras pourquoi ce n'est pas toujours le cas.

## Lancer les tests

Depuis le dossier `tp/react` :

```bash
npm test -- 01-compteur
```

## Critères de réussite

- Au départ, la valeur est 0, l'historique est vide et « Annuler » est désactivé.
- « +1 » augmente la valeur de 1.
- « -1 » diminue la valeur de 1, même en dessous de zéro.
- « Remise à zéro » remet la valeur à 0.
- L'historique liste les valeurs précédentes, dans l'ordre (la plus ancienne en premier).
- « Annuler » revient à la valeur précédente et la retire de l'historique.
- « Annuler » se désactive quand il n'y a plus rien à annuler.
- « Annuler » après une remise à zéro retrouve la valeur d'avant.

## Pour aller plus loin

- Ajoute un bouton « Rétablir » qui refait ce que « Annuler » a défait.
- Limite l'historique aux 10 dernières valeurs.
- Regroupe `valeur` et `historique` dans un seul état objet. Compare la lisibilité.
