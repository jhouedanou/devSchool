# Compteur borné

## Objectif

Tu crées un compteur qui reste entre une valeur minimale et une valeur maximale.
Le parent règle le compteur avec des props : `min`, `max`, `pas` et `initial`.

## Ce que tu vas pratiquer

- les props avec `defineProps` et leurs valeurs par défaut (Vue 3.5) ;
- l'état local avec `ref` ;
- les valeurs calculées avec `computed` ;
- les événements `@click` et l'attribut `:disabled`.

Leçons utiles : [la réactivité](#/vue/lecon/02-reactivite), [les directives](#/vue/lecon/03-directives) et [les composants](#/vue/lecon/05-composants).

## Fichiers à modifier

- `exercices/01-compteur/Compteur.vue`

## Étapes

1. Ouvre `Compteur.vue`. Les props sont déjà déclarées : `min` (0 par défaut), `max` (10), `pas` (1) et `initial`.
2. Écris une fonction `borner(nombre)` qui ramène un nombre entre `min` et `max` (avec `Math.min` et `Math.max`).
3. Calcule la valeur de départ : `initial`, ou `min` si `initial` est absent. Passe-la dans `borner()`.
4. Initialise `valeur` avec cette valeur de départ.
5. Écris `augmenter()` et `diminuer()` : elles ajoutent ou retirent `pas`, sans sortir des bornes.
6. Écris `reinitialiser()` : la valeur revient à la valeur de départ.
7. Crée deux `computed`, `auMin` et `auMax`, puis ajoute `:disabled` sur les boutons « − » et « + ».

Garde les attributs `data-test` du code de départ : les tests les utilisent.

| Élément | Sélecteur |
|---------|-----------|
| Valeur affichée | `[data-test="valeur"]` |
| Bouton « − » | `[data-test="moins"]` |
| Bouton « + » | `[data-test="plus"]` |
| Bouton « Réinitialiser » | `[data-test="reinitialiser"]` |

## Lancer les tests

Depuis le dossier `tp/vue` :

```bash
npm test -- 01-compteur
```

Les tests se relancent à chaque sauvegarde. Pour voir ton compteur dans le navigateur, lance `npm run dev` dans un autre terminal.

## Critères de réussite

- La valeur affichée au départ est `initial`.
- Sans `initial`, le compteur commence à `min`.
- Une valeur `initial` hors bornes est ramenée entre `min` et `max`.
- « + » ajoute `pas` et « − » retire `pas`.
- « − » est désactivé quand la valeur est égale à `min`.
- « + » est désactivé quand la valeur atteint `max`.
- La valeur ne dépasse jamais `max` et ne descend jamais sous `min`, même avec un grand `pas`.
- « Réinitialiser » remet la valeur de départ.

## Pour aller plus loin

- Rends le compteur utilisable avec `v-model` grâce à `defineModel()`.
- Ajoute les raccourcis clavier : flèche haut et flèche bas.
- Que se passe-t-il si le parent change `max` pendant que le compteur tourne ? Utilise `watch` pour garder la valeur dans les bornes.
