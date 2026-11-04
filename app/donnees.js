// Chargement du contenu (avec cache).
import catalogueIds from '../content/catalogue.js';

const cache = new Map();

function memo(cle, fabrique) {
  if (!cache.has(cle)) {
    const p = fabrique().catch((e) => {
      cache.delete(cle);
      throw e;
    });
    cache.set(cle, p);
  }
  return cache.get(cle);
}

export const IDS_PARCOURS = catalogueIds;

export function parcours(id) {
  if (!IDS_PARCOURS.includes(id)) return Promise.resolve(null);
  return memo(`parcours:${id}`, async () => {
    const mod = await import(`../content/${id}/index.js`);
    const p = mod.default;
    p.lecons = p.lecons || [];
    p.tps = p.tps || [];
    p.lecons.forEach((l, i) => {
      l.numero = i + 1;
      l.exercices = l.exercices || [];
      l.tps = l.tps || [];
    });
    return p;
  });
}

/** Tous les parcours qui existent (un parcours absent est ignoré). */
export function tousLesParcours() {
  return memo('tous', async () => {
    const liste = await Promise.all(IDS_PARCOURS.map((id) => parcours(id).catch(() => null)));
    return liste.filter(Boolean);
  });
}

export function texte(url) {
  return memo(`texte:${url}`, async () => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url} introuvable (${r.status})`);
    return r.text();
  });
}

export const lecon = (p, id) => texte(`content/${p}/lecons/${id}.md`);
export const enonceTp = (p, id) => texte(`tp/${p}/enonces/${id}.md`);
export const guideTp = (p) => texte(`tp/${p}/README.md`);

export function quiz(p, id) {
  return memo(`quiz:${p}/${id}`, async () => (await import(`../content/${p}/quiz/${id}.js`)).default);
}

export function exercice(p, id) {
  return memo(`exercice:${p}/${id}`, async () => (await import(`../content/${p}/exercices/${id}.js`)).default);
}

/** Exercices d'un parcours, dans l'ordre des leçons. */
export function listeExercices(p) {
  return p.lecons.flatMap((l) => l.exercices.map((id) => ({ id, lecon: l })));
}
