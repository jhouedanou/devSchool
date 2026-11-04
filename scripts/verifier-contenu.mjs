// Vérifie la structure de tout le contenu (sans navigateur).
// Usage : node scripts/verifier-contenu.mjs [vue nuxt react laravel]
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';

const RACINE = resolve(fileURLToPath(new URL('..', import.meta.url)));
const { default: catalogue } = await import(pathToFileURL(join(RACINE, 'content/catalogue.js')));
const demandes = process.argv.slice(2);
const parcours = demandes.length ? demandes : catalogue;

let erreurs = 0;
let avertissements = 0;
const erreur = (m) => { erreurs++; console.log('  ✗ ' + m); };
const avert = (m) => { avertissements++; console.log('  ! ' + m); };
const existe = (p) => stat(join(RACINE, p)).then((s) => s.isFile()).catch(() => false);

const TYPES_EXERCICE = ['js', 'vue', 'nuxt', 'react'];
const TYPES_QUESTION = ['unique', 'multiple', 'texte'];

function verifierQuestion(q, ou) {
  if (!q || typeof q !== 'object') return erreur(`${ou} : question invalide`);
  if (!TYPES_QUESTION.includes(q.type)) erreur(`${ou} : type « ${q.type} » inconnu (${TYPES_QUESTION.join(', ')})`);
  if (typeof q.question !== 'string' || !q.question.trim()) erreur(`${ou} : champ « question » manquant`);
  if (typeof q.explication !== 'string' || !q.explication.trim()) erreur(`${ou} : champ « explication » manquant`);
  if (q.code !== undefined && typeof q.code !== 'string') erreur(`${ou} : « code » doit être une chaîne`);
  if (q.type === 'unique' || q.type === 'multiple') {
    if (!Array.isArray(q.choix) || q.choix.length < 2) return erreur(`${ou} : il faut au moins 2 « choix »`);
    if (new Set(q.choix).size !== q.choix.length) erreur(`${ou} : deux choix identiques`);
  }
  if (q.type === 'unique') {
    if (!Number.isInteger(q.reponse) || q.reponse < 0 || q.reponse >= q.choix.length) erreur(`${ou} : « reponse » doit être un index valide`);
  }
  if (q.type === 'multiple') {
    if (!Array.isArray(q.reponses) || !q.reponses.length) erreur(`${ou} : « reponses » doit être un tableau non vide`);
    else if (q.reponses.some((i) => !Number.isInteger(i) || i < 0 || i >= q.choix.length)) erreur(`${ou} : index hors limites dans « reponses »`);
  }
  if (q.type === 'texte') {
    if (!Array.isArray(q.acceptees) || !q.acceptees.length) erreur(`${ou} : « acceptees » doit être un tableau non vide`);
  }
}

function verifierExercice(ex, id, ou) {
  if (!ex || typeof ex !== 'object') return erreur(`${ou} : export default manquant`);
  if (ex.id !== id) erreur(`${ou} : id « ${ex.id} » ≠ nom du fichier « ${id} »`);
  if (!ex.titre) erreur(`${ou} : « titre » manquant`);
  if (!TYPES_EXERCICE.includes(ex.type)) erreur(`${ou} : type « ${ex.type} » inconnu (${TYPES_EXERCICE.join(', ')})`);
  for (const champ of ['consigne', 'depart', 'solution']) {
    if (typeof ex[champ] !== 'string' || !ex[champ].trim()) erreur(`${ou} : « ${champ} » manquant`);
  }
  if (ex.depart && ex.depart === ex.solution) erreur(`${ou} : « depart » et « solution » sont identiques`);
  if (ex.indices !== undefined && !Array.isArray(ex.indices)) erreur(`${ou} : « indices » doit être un tableau`);
  if (!Array.isArray(ex.tests) || !ex.tests.length) return erreur(`${ou} : « tests » doit être un tableau non vide`);
  ex.tests.forEach((t, i) => {
    if (!t.nom) erreur(`${ou} : test ${i + 1} sans « nom »`);
    if (typeof t.run !== 'function') erreur(`${ou} : test ${i + 1} sans fonction « run »`);
    else if (!/^\s*(async\s*)?(\(|\w+\s*=>|function|run\s*\()/.test(t.run.toString())) erreur(`${ou} : test ${i + 1} : « run » doit être une fonction (async (t) => { … })`);
  });
}

for (const id of parcours) {
  console.log(`\n▸ ${id}`);
  let p;
  try {
    p = (await import(pathToFileURL(join(RACINE, `content/${id}/index.js`)))).default;
  } catch (e) {
    erreur(`content/${id}/index.js : ${e.message}`);
    continue;
  }
  for (const champ of ['id', 'titre', 'version', 'couleur', 'description']) if (!p[champ]) erreur(`index.js : « ${champ} » manquant`);
  if (p.id !== id) erreur(`index.js : id « ${p.id} » ≠ « ${id} »`);
  if (!Array.isArray(p.lecons) || !p.lecons.length) { erreur('index.js : aucune leçon'); continue; }
  const idsTp = new Set((p.tps || []).map((t) => t.id));
  const idsExos = new Set();
  let nbQuestions = 0;

  for (const l of p.lecons) {
    const ou = `leçon ${l.id}`;
    if (!l.id || !l.titre) erreur(`${ou} : « id » et « titre » obligatoires`);
    const md = `content/${id}/lecons/${l.id}.md`;
    if (!(await existe(md))) erreur(`${md} introuvable`);
    else {
      const texte = await readFile(join(RACINE, md), 'utf8');
      if (texte.trim().length < 400) avert(`${md} est très court (${texte.trim().length} caractères)`);
      if (!/^# /.test(texte)) avert(`${md} devrait commencer par « # Titre »`);
    }
    const quiz = `content/${id}/quiz/${l.id}.js`;
    if (!(await existe(quiz))) erreur(`${quiz} introuvable`);
    else {
      try {
        const qs = (await import(pathToFileURL(join(RACINE, quiz)))).default;
        if (!Array.isArray(qs) || qs.length < 4) erreur(`${quiz} : il faut au moins 4 questions`);
        else { qs.forEach((q, i) => verifierQuestion(q, `${quiz} #${i + 1}`)); nbQuestions += qs.length; }
      } catch (e) { erreur(`${quiz} : ${e.message}`); }
    }
    for (const ex of l.exercices || []) {
      if (idsExos.has(ex)) erreur(`exercice ${ex} utilisé deux fois`);
      idsExos.add(ex);
      const f = `content/${id}/exercices/${ex}.js`;
      if (!(await existe(f))) { erreur(`${f} introuvable`); continue; }
      try { verifierExercice((await import(pathToFileURL(join(RACINE, f)))).default, ex, f); } catch (e) { erreur(`${f} : ${e.message}`); }
    }
    for (const tp of l.tps || []) if (!idsTp.has(tp)) erreur(`${ou} : TP « ${tp} » absent de la liste tps`);
  }
  for (const tp of p.tps || []) {
    if (!tp.id || !tp.titre) erreur(`TP sans id/titre`);
    const f = `tp/${id}/enonces/${tp.id}.md`;
    if (!(await existe(f))) avert(`${f} introuvable (énoncé du TP)`);
  }
  console.log(`  ${p.lecons.length} leçons · ${nbQuestions} questions · ${idsExos.size} exercices · ${(p.tps || []).length} TP`);
}

// Liens internes (#/parcours/type/id) dans les leçons et les énoncés de TP
console.log('\n▸ liens internes');
const index = {};
for (const id of catalogue) {
  try {
    const p = (await import(pathToFileURL(join(RACINE, `content/${id}/index.js`)))).default;
    index[id] = {
      lecon: new Set(p.lecons.map((l) => l.id)),
      quiz: new Set(p.lecons.map((l) => l.id)),
      exercice: new Set(p.lecons.flatMap((l) => l.exercices || [])),
      tp: new Set((p.tps || []).map((t) => t.id)),
    };
  } catch { /* parcours absent : déjà signalé */ }
}
const { readdir } = await import('node:fs/promises');
async function fichiersMd(dossier) {
  const liste = await readdir(join(RACINE, dossier)).catch(() => []);
  return liste.filter((f) => f.endsWith('.md')).map((f) => `${dossier}/${f}`);
}
let nbLiens = 0;
for (const id of parcours) {
  const fichiers = [...await fichiersMd(`content/${id}/lecons`), ...await fichiersMd(`tp/${id}/enonces`)];
  if (await existe(`tp/${id}/README.md`)) fichiers.push(`tp/${id}/README.md`);
  for (const f of fichiers) {
    const texte = await readFile(join(RACINE, f), 'utf8');
    for (const m of texte.matchAll(/\]\(#\/([\w-]+)(?:\/(lecon|quiz|exercice|tp|examen|installation)(?:\/([\w-]+))?)?\)/g)) {
      nbLiens++;
      const [lien, p, type, cible] = m;
      if (!index[p]) { erreur(`${f} : parcours inconnu dans ${lien.slice(2)}`); continue; }
      if (cible && !index[p][type]?.has(cible)) erreur(`${f} : lien cassé ${lien.slice(2)}`);
    }
  }
}
console.log(`  ${nbLiens} liens vérifiés`);

console.log(`\n${erreurs ? '✗' : '✓'} ${erreurs} erreur(s), ${avertissements} avertissement(s)`);
process.exit(erreurs ? 1 : 0);
