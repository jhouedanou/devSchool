// Lance chaque exercice du navigateur deux fois dans Chromium :
//   - avec la SOLUTION : tous les tests doivent passer ;
//   - avec le code de DÉPART : au moins un test doit échouer.
// Usage : node scripts/verifier-exercices.mjs [vue nuxt react laravel] [--exercice=02-compteur]
// Nécessite Playwright (npm i -g playwright, ou déjà présent).
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, join } from 'node:path';
import { demarrerServeur } from './serveur.mjs';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Playwright est introuvable. Installe-le : npm i -g playwright && npx playwright install chromium');
  process.exit(2);
}

const RACINE = resolve(fileURLToPath(new URL('..', import.meta.url)));
const { default: catalogue } = await import(pathToFileURL(join(RACINE, 'content/catalogue.js')));
const args = process.argv.slice(2);
const filtre = (args.find((a) => a.startsWith('--exercice=')) || '').split('=')[1];
const demandes = args.filter((a) => !a.startsWith('--'));
const parcours = demandes.length ? demandes : catalogue;

const serveur = await demarrerServeur(0);
const port = serveur.address().port;
const options = process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {};
const navigateur = await chromium.launch(options);
const pages = {};

async function pageRunner(kind) {
  if (!pages[kind]) {
    const page = await navigateur.newPage();
    await page.goto(`http://127.0.0.1:${port}/app/runner/runner.html?kind=${kind}&mode=tests`);
    await page.evaluate(() => window.__devschool.pret);
    pages[kind] = page;
  }
  return pages[kind];
}

async function executer(kind, code, tests) {
  const page = await pageRunner(kind);
  return page.evaluate((m) => window.__devschool.executer(m), { mode: 'tests', code, tests });
}

let echecs = 0;
let total = 0;

// Auto-test de l'exécuteur : t.wait doit échouer sur un code faux, réussir sur un code lent ;
// setProps doit mettre le rendu à jour.
const AUTOTESTS = {
  react: {
    faux: 'export default function A({ titre }) { return <div><h1>{titre}</h1><ul></ul></div> }',
    lent: `import { useState, useEffect } from 'react'
export default function A({ titre }) { const [n, setN] = useState(0); useEffect(() => { const t = setTimeout(() => setN(2), 200); return () => clearTimeout(t) }, []); return <div><h1>{titre}</h1><ul>{Array.from({ length: n }, (_, i) => <li key={i}>x</li>)}</ul></div> }`,
  },
  vue: {
    faux: '<script setup>\ndefineProps([\'titre\'])\n</script>\n<template><div><h1>{{ titre }}</h1><ul></ul></div></template>',
    lent: `<script setup>
import { ref, onMounted } from 'vue'
defineProps(['titre'])
const n = ref(0)
onMounted(() => setTimeout(() => { n.value = 2 }, 200))
</script>
<template><div><h1>{{ titre }}</h1><ul><li v-for="i in n" :key="i">x</li></ul></div></template>`,
  },
};
const testWait = async (t) => { const w = await t.mount({ titre: 'a' }); await t.wait(() => t.expect(w.findAll('li')).toHaveLength(2)); };
const testProps = async (t) => { const w = await t.mount({ titre: 'a' }); await w.setProps({ titre: 'b' }); t.expect(w.find('h1').text()).toBe('b'); };
const enTests = (...fns) => fns.map((f, i) => ({ nom: 'autotest ' + i, src: f.toString() }));
console.log('▸ auto-test de l\'exécuteur');
for (const [kind, codes] of Object.entries(AUTOTESTS)) {
  const faux = await executer(kind, codes.faux, enTests(testWait));
  const lent = await executer(kind, codes.lent, enTests(testWait, testProps));
  const ok = faux.resultats?.[0]?.ok === false && lent.resultats?.every((r) => r.ok);
  if (!ok) echecs++;
  console.log(`  ${ok ? '✓' : '✗'} ${kind} : t.wait et setProps${ok ? '' : ' → ' + JSON.stringify({ faux: faux.resultats, lent: lent.resultats })}`);
}

for (const id of parcours) {
  const p = (await import(pathToFileURL(join(RACINE, `content/${id}/index.js`)))).default;
  const ids = p.lecons.flatMap((l) => l.exercices || []).filter((e) => !filtre || e === filtre);
  if (!ids.length) continue;
  console.log(`\n▸ ${id} (${ids.length} exercices)`);
  for (const exId of ids) {
    total++;
    const ex = (await import(pathToFileURL(join(RACINE, `content/${id}/exercices/${exId}.js`)))).default;
    const tests = ex.tests.map((t) => ({ nom: t.nom, src: t.run.toString(), aide: t.aide || '' }));
    const problemes = [];

    const sol = await executer(ex.type, ex.solution, tests);
    if (sol.erreurCompilation || sol.erreurChargement || sol.erreurExecution) {
      problemes.push('solution : ' + (sol.erreurCompilation || sol.erreurChargement || sol.erreurExecution));
    } else {
      for (const r of sol.resultats) if (!r.ok) problemes.push(`solution échoue « ${r.nom} » → ${r.message.replace(/\n/g, ' | ')}`);
      const erreursConsole = sol.logs.filter((l) => l.niveau === 'error' || /\[Vue\]|Warning:/.test(l.texte));
      for (const l of erreursConsole.slice(0, 3)) problemes.push(`console (solution) : ${l.texte.slice(0, 160)}`);
    }

    const dep = await executer(ex.type, ex.depart, tests);
    if (dep.erreurChargement) problemes.push('départ : ' + dep.erreurChargement);
    else if (!dep.erreurCompilation && dep.resultats.every((r) => r.ok)) problemes.push('départ : tous les tests passent déjà (le code de départ doit échouer)');
    if (dep.erreurCompilation) problemes.push('départ : erreur de compilation → ' + dep.erreurCompilation.split('\n')[0] + ' (le départ doit compiler)');

    if (problemes.length) {
      echecs++;
      console.log(`  ✗ ${exId}`);
      for (const pb of problemes) console.log(`      ${pb}`);
    } else {
      console.log(`  ✓ ${exId} (${tests.length} tests)`);
    }
  }
}

await navigateur.close();
serveur.close();
console.log(`\n${echecs ? '✗' : '✓'} ${total - echecs}/${total} exercices valides`);
process.exit(echecs ? 1 : 0);
