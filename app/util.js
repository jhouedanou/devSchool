// Petits outils partagés par toutes les vues.

class Brut {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}

/** Marque une chaîne HTML comme sûre (pas d'échappement). */
export const brut = (s) => new Brut(String(s ?? ''));

export function echapper(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function rendre(v) {
  if (v === null || v === undefined || v === false) return '';
  if (v instanceof Brut) return v.s;
  if (Array.isArray(v)) return v.map(rendre).join('');
  return echapper(v);
}

/** Gabarit HTML : les valeurs sont échappées, sauf si elles viennent de html`` ou brut(). */
export function html(chaines, ...valeurs) {
  let sortie = '';
  chaines.forEach((s, i) => {
    sortie += s;
    if (i < valeurs.length) sortie += rendre(valeurs[i]);
  });
  return new Brut(sortie);
}

export function slug(texte) {
  return String(texte)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[#\w]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function melanger(tableau) {
  const t = tableau.slice();
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

/** Normalise une réponse tapée : minuscules, espaces réduits, sans guillemets autour. */
export function normaliserReponse(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/["`’]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/\s*([(){}\[\],;:=<>+\-*/.'!?@$|&])\s*/g, '$1')
    .replace(/;+$/, '');
}

export function duree(minutes) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}

export function pluriel(n, singulier, pluriel = singulier + 's') {
  return `${n} ${n > 1 ? pluriel : singulier}`;
}

export function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

const scriptsCharges = new Map();
export function chargerScript(src) {
  if (!scriptsCharges.has(src)) {
    scriptsCharges.set(src, new Promise((ok, ko) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = () => { scriptsCharges.delete(src); ko(new Error('Impossible de charger ' + src)); };
      document.head.appendChild(s);
    }));
  }
  return scriptsCharges.get(src);
}

export const $ = (sel, racine = document) => racine.querySelector(sel);
export const $$ = (sel, racine = document) => Array.from(racine.querySelectorAll(sel));

export const NIVEAUX = { 1: 'Facile', 2: 'Moyen', 3: 'Avancé' };

export function icone(nom) {
  const chemins = {
    lecon: '<path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h6M8 11h6"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5h.01"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
    tp: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    examen: '<path d="M12 3l8 4-8 4-8-4z"/><path d="M6 9v5c0 1.7 2.7 3 6 3s6-1.3 6-3V9M20 7v6"/>',
    ok: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    ko: '<path d="M6 6l12 12M18 6L6 18"/>',
    fleche: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    retour: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    lecture: '<path d="M7 4.5v15l12-7.5z"/>',
    temps: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    ampoule: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    oeil: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    reinit: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
    copier: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
    dossier: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    terminal: '<path d="M4 6l6 6-6 6M12 18h8"/>',
    etoile: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  };
  return brut(`<svg class="icone" viewBox="0 0 24 24" aria-hidden="true">${chemins[nom] || ''}</svg>`);
}
