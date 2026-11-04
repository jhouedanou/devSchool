// devSchool — point d'entrée : navigation, thème, routeur.
import { html, $ } from './util.js';
import { tousLesParcours, parcours } from './donnees.js';
import { memoriserPage } from './progression.js';
import { pageErreur } from './vues/commun.js';
import { vueAccueil } from './vues/accueil.js';
import { vueParcours } from './vues/parcours.js';
import { vueLecon } from './vues/lecon.js';
import { vueQuiz, vueExamen } from './vues/quiz.js';
import { vueExercice } from './vues/exercice.js';
import { vueTp, vueInstallation } from './vues/tp.js';
import { vueProgression } from './vues/progression.js';

const main = document.getElementById('contenu');
let nettoyage = null;
let compteurNavigation = 0;

const ROUTES = [
  [/^\/?$/, () => vueAccueil(main)],
  [/^\/progression$/, () => vueProgression(main)],
  [/^\/([\w-]+)$/, (p) => vueParcours(main, p)],
  [/^\/([\w-]+)\/lecon\/([\w-]+)$/, (p, id) => vueLecon(main, p, id)],
  [/^\/([\w-]+)\/quiz\/([\w-]+)$/, (p, id) => vueQuiz(main, p, id)],
  [/^\/([\w-]+)\/examen$/, (p) => vueExamen(main, p)],
  [/^\/([\w-]+)\/exercice\/([\w-]+)$/, (p, id) => vueExercice(main, p, id)],
  [/^\/([\w-]+)\/tp\/([\w-]+)$/, (p, id) => vueTp(main, p, id)],
  [/^\/([\w-]+)\/installation$/, (p) => vueInstallation(main, p)],
];

async function naviguer() {
  const hash = location.hash || '#/';
  if (!hash.startsWith('#/') && hash !== '#') return;
  const chemin = hash.slice(1).split('?')[0];
  const numero = ++compteurNavigation;

  if (nettoyage) {
    try { nettoyage(); } catch { /* rien */ }
    nettoyage = null;
  }

  let trouve = null;
  for (const [motif, vue] of ROUTES) {
    const m = chemin.match(motif);
    if (m) { trouve = { vue, args: m.slice(1) }; break; }
  }

  try {
    let args = [];
    if (trouve && trouve.args.length) {
      const p = await parcours(trouve.args[0]);
      if (!p) {
        trouve = null;
      } else {
        args = [p, ...trouve.args.slice(1)];
        appliquerCouleur(p);
      }
    } else {
      appliquerCouleur(null);
    }
    if (numero !== compteurNavigation) return;
    if (!trouve) {
      pageErreur(main, 'Page introuvable', "Cette adresse ne correspond à aucune page de devSchool.");
    } else {
      main.innerHTML = '<div class="chargement-page">Chargement…</div>';
      const resultat = await trouve.vue(...args);
      if (numero !== compteurNavigation) { if (typeof resultat === 'function') resultat(); return; }
      if (typeof resultat === 'function') nettoyage = resultat;
      memoriserPage(hash);
    }
  } catch (e) {
    console.error(e);
    if (numero !== compteurNavigation) return;
    pageErreur(main, 'Impossible de charger cette page', e.message || String(e));
  }
  majNavigation(chemin);
  window.scrollTo(0, 0);
}

function appliquerCouleur(p) {
  const racine = document.body;
  if (p) {
    racine.style.setProperty('--couleur', p.couleur);
    racine.style.setProperty('--sur-couleur', '#0b0f14');
    racine.dataset.parcours = p.id;
  } else {
    racine.style.removeProperty('--couleur');
    racine.style.removeProperty('--sur-couleur');
    delete racine.dataset.parcours;
  }
}

async function construireNavigation() {
  const nav = $('#nav-principale');
  const liste = await tousLesParcours();
  nav.innerHTML = html`<ol>${liste.map((p, i) => html`<li><a href="#/${p.id}" data-parcours="${p.id}" style="--couleur:${p.couleur}">
    <span class="nav-ordre">${i + 1}</span>${p.titre}</a></li>`)}</ol>`.s;
  majNavigation((location.hash || '#/').slice(1));
}

function majNavigation(chemin) {
  const actif = (chemin.match(/^\/([\w-]+)/) || [])[1];
  document.querySelectorAll('#nav-principale a').forEach((a) => {
    if (a.dataset.parcours === actif) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function brancherTheme() {
  const bouton = $('#bouton-theme');
  bouton.addEventListener('click', () => {
    const racine = document.documentElement;
    const actuel = racine.getAttribute('data-theme')
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const suivant = actuel === 'dark' ? 'light' : 'dark';
    racine.setAttribute('data-theme', suivant);
    try { localStorage.setItem('devschool:theme', suivant); } catch { /* rien */ }
  });
}

// Liens d'ancre internes (#section) : défilement sans changer de page.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (href.startsWith('#/') || href === '#') return;
  const cible = document.getElementById(decodeURIComponent(href.slice(1)));
  if (cible) {
    e.preventDefault();
    cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

window.addEventListener('hashchange', naviguer);
brancherTheme();
construireNavigation().catch((e) => console.error(e));
naviguer();
