// Progression de l'élève, stockée dans le navigateur (localStorage).
// Tout est enveloppé dans try/catch : en navigation privée, le stockage peut être bloqué.

const CLE = 'devschool:progression:v1';
const PREFIXE_CODE = 'devschool:code:';
export const SEUIL_REUSSITE = 70; // % pour réussir un quiz ou un examen

function vide() {
  return { lecons: {}, quiz: {}, exercices: {}, tps: {}, examens: {}, derniere: null };
}

function lire() {
  try {
    const brut = localStorage.getItem(CLE);
    if (!brut) return vide();
    return Object.assign(vide(), JSON.parse(brut));
  } catch {
    return vide();
  }
}

let etat = lire();

function ecrire() {
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch { /* stockage indisponible */ }
  window.dispatchEvent(new CustomEvent('progression'));
}

const cle = (p, id) => `${p}/${id}`;
const maintenant = () => new Date().toISOString();

export function memoriserPage(route) {
  etat.derniere = route;
  try { localStorage.setItem(CLE, JSON.stringify(etat)); } catch { /* rien */ }
}

/* Leçons */
export const estLue = (p, id) => !!etat.lecons[cle(p, id)];
export function marquerLue(p, id, valeur = true) {
  if (valeur) etat.lecons[cle(p, id)] = { date: maintenant() };
  else delete etat.lecons[cle(p, id)];
  ecrire();
}

/* Quiz */
export const resultatQuiz = (p, id) => etat.quiz[cle(p, id)] || null;
export const quizReussi = (p, id) => (resultatQuiz(p, id)?.meilleur ?? 0) >= SEUIL_REUSSITE;
export function enregistrerQuiz(p, id, pourcentage) {
  const avant = etat.quiz[cle(p, id)] || { meilleur: 0, tentatives: 0 };
  etat.quiz[cle(p, id)] = {
    meilleur: Math.max(avant.meilleur, pourcentage),
    dernier: pourcentage,
    tentatives: avant.tentatives + 1,
    date: maintenant(),
  };
  ecrire();
}

/* Examens */
export const resultatExamen = (p) => etat.examens[p] || null;
export const examenReussi = (p) => (resultatExamen(p)?.meilleur ?? 0) >= SEUIL_REUSSITE;
export function enregistrerExamen(p, pourcentage) {
  const avant = etat.examens[p] || { meilleur: 0, tentatives: 0 };
  etat.examens[p] = {
    meilleur: Math.max(avant.meilleur, pourcentage),
    dernier: pourcentage,
    tentatives: avant.tentatives + 1,
    date: maintenant(),
  };
  ecrire();
}

/* Exercices */
export const exerciceReussi = (p, id) => !!etat.exercices[cle(p, id)];
export function marquerExercice(p, id) {
  if (!etat.exercices[cle(p, id)]) {
    etat.exercices[cle(p, id)] = { date: maintenant() };
    ecrire();
  }
}

/* TP */
export const tpFait = (p, id) => !!etat.tps[cle(p, id)];
export function marquerTp(p, id, valeur = true) {
  if (valeur) etat.tps[cle(p, id)] = { date: maintenant() };
  else delete etat.tps[cle(p, id)];
  ecrire();
}

/* Code des exercices (brouillons) */
export function lireCode(p, id) {
  try { return localStorage.getItem(PREFIXE_CODE + cle(p, id)); } catch { return null; }
}
export function sauverCode(p, id, code) {
  try { localStorage.setItem(PREFIXE_CODE + cle(p, id), code); } catch { /* rien */ }
}
export function effacerCode(p, id) {
  try { localStorage.removeItem(PREFIXE_CODE + cle(p, id)); } catch { /* rien */ }
}

/* Statistiques */
export function statsParcours(p) {
  const lecons = p.lecons.length;
  const lues = p.lecons.filter((l) => estLue(p.id, l.id)).length;
  const quizOk = p.lecons.filter((l) => quizReussi(p.id, l.id)).length;
  const exos = p.lecons.flatMap((l) => l.exercices);
  const exosOk = exos.filter((e) => exerciceReussi(p.id, e)).length;
  const tps = p.tps.length;
  const tpsOk = p.tps.filter((t) => tpFait(p.id, t.id)).length;
  const total = lecons * 2 + exos.length + tps;
  const faits = lues + quizOk + exosOk + tpsOk;
  return {
    lecons, lues, quizOk, exercices: exos.length, exosOk, tps, tpsOk,
    total, faits,
    pourcentage: total ? Math.round((faits / total) * 100) : 0,
    examen: resultatExamen(p.id),
  };
}

/** Prochaine chose à faire dans un parcours (ou null si tout est fait). */
export function prochaineEtape(p) {
  for (const l of p.lecons) {
    if (!estLue(p.id, l.id)) return { type: 'lecon', lien: `#/${p.id}/lecon/${l.id}`, titre: l.titre, lecon: l };
    if (!quizReussi(p.id, l.id)) return { type: 'quiz', lien: `#/${p.id}/quiz/${l.id}`, titre: `Quiz : ${l.titre}`, lecon: l };
    for (const e of l.exercices) {
      if (!exerciceReussi(p.id, e)) return { type: 'exercice', lien: `#/${p.id}/exercice/${e}`, titre: 'Exercice de la leçon ' + l.numero, lecon: l };
    }
    for (const t of l.tps) {
      const tp = p.tps.find((x) => x.id === t);
      if (tp && !tpFait(p.id, t)) return { type: 'tp', lien: `#/${p.id}/tp/${t}`, titre: `TP : ${tp.titre}`, lecon: l };
    }
  }
  for (const tp of p.tps) {
    if (!tpFait(p.id, tp.id)) return { type: 'tp', lien: `#/${p.id}/tp/${tp.id}`, titre: `TP : ${tp.titre}` };
  }
  if (!examenReussi(p.id)) return { type: 'examen', lien: `#/${p.id}/examen`, titre: 'Examen final' };
  return null;
}

/* Sauvegarde / restauration */
export function exporter() {
  const codes = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIXE_CODE)) codes[k.slice(PREFIXE_CODE.length)] = localStorage.getItem(k);
    }
  } catch { /* rien */ }
  return JSON.stringify({ format: 'devschool', version: 1, date: maintenant(), progression: etat, codes }, null, 2);
}

export function importer(texteJson) {
  const donnees = JSON.parse(texteJson);
  if (!donnees || donnees.format !== 'devschool' || !donnees.progression) {
    throw new Error('Ce fichier ne vient pas de devSchool.');
  }
  etat = Object.assign(vide(), donnees.progression);
  for (const [k, v] of Object.entries(donnees.codes || {})) {
    try { localStorage.setItem(PREFIXE_CODE + k, v); } catch { /* rien */ }
  }
  ecrire();
}

export function reinitialiser() {
  etat = vide();
  try {
    const cles = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIXE_CODE)) cles.push(k);
    }
    cles.forEach((k) => localStorage.removeItem(k));
  } catch { /* rien */ }
  ecrire();
}
