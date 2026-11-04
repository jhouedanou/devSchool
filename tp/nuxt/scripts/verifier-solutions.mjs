// Vérifie que les solutions des TP passent les tests.
//
// Le script copie le projet dans un dossier temporaire (node_modules est un lien vers celui du projet),
// applique les solutions dans l'ordre (01 → 06), puis lance les tests. Ton code n'est jamais modifié.
//
// Usage (depuis tp/nuxt) :
//   node scripts/verifier-solutions.mjs               applique toutes les solutions et lance tous les tests
//   node scripts/verifier-solutions.mjs --jusqua=03   applique les solutions 01 à 03 et lance les tests de ces TP
//   node scripts/verifier-solutions.mjs --build       lance aussi « nuxt build » une fois les solutions appliquées
//   node scripts/verifier-solutions.mjs --depart      n'applique aucune solution : chaque fichier de test doit échouer
//   node scripts/verifier-solutions.mjs --garder      ne supprime pas le dossier temporaire à la fin
//
// Code de sortie : 0 si tout est bon, 1 sinon.
import { spawnSync } from 'node:child_process'
import {
  cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, rmdirSync, symlinkSync, unlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = resolve(fileURLToPath(new URL('..', import.meta.url)))
const IGNORES = new Set(['node_modules', '.nuxt', '.output', '.data', '.nitro', '.cache', '.git', 'solutions'])

const args = process.argv.slice(2)
const option = (nom) => args.includes(`--${nom}`)
const valeur = (nom) => args.find((a) => a.startsWith(`--${nom}=`))?.split('=')[1]

const depart = option('depart')
const build = option('build')
const garder = option('garder')
const jusqua = valeur('jusqua')

const numero = (id) => Number.parseInt(id, 10)

if (!existsSync(join(RACINE, 'node_modules'))) {
  console.error('✗ node_modules est absent. Lance d\'abord « npm install » dans tp/nuxt.')
  process.exit(1)
}

const tousLesTp = readdirSync(join(RACINE, 'solutions'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()

const tps = depart ? [] : tousLesTp.filter((id) => !jusqua || numero(id) <= numero(jusqua))
if (jusqua && !tps.length) {
  console.error(`✗ Aucun TP ne correspond à --jusqua=${jusqua}.`)
  process.exit(1)
}

// 1. Copie du projet (sans node_modules, fichiers générés ni solutions).
const dossier = mkdtempSync(join(tmpdir(), 'devschool-tp-nuxt-'))
console.log(`▸ Copie du projet dans ${dossier}`)
cpSync(RACINE, dossier, {
  recursive: true,
  filter: (source) => {
    const chemin = relative(RACINE, source)
    return !chemin || !IGNORES.has(chemin.split(sep)[0])
  },
})
const lienModules = join(dossier, 'node_modules')
symlinkSync(join(RACINE, 'node_modules'), lienModules, process.platform === 'win32' ? 'junction' : 'dir')

// Vite refuse par défaut de lire des fichiers hors du dossier du projet.
// Or node_modules pointe vers tp/nuxt/node_modules : on l'autorise dans une config dédiée à la copie.
const configVerification = join(dossier, 'vitest.verification.config.ts')
writeFileSync(configVerification, [
  "import { mergeConfig } from 'vitest/config'",
  "import config from './vitest.config.ts'",
  '',
  `export default mergeConfig(config, { server: { fs: { allow: ['.', ${JSON.stringify(realpathSync(lienModules))}] } } })`,
  '',
].join('\n'))

// Ctrl+C : on laisse le processus enfant s'arrêter, puis on nettoie.
process.on('SIGINT', () => {})

function nettoyer() {
  if (garder) {
    console.log(`▸ Dossier temporaire conservé : ${dossier}`)
    return
  }
  // On retire d'abord le lien vers node_modules, sans jamais toucher à sa cible.
  try { unlinkSync(lienModules) } catch { try { rmdirSync(lienModules) } catch { /* déjà retiré */ } }
  rmSync(dossier, { recursive: true, force: true })
}

function lancer(commande, options = []) {
  const resultat = spawnSync(process.execPath, [commande, ...options], {
    cwd: dossier,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? '1' },
  })
  return resultat.status ?? 1
}

const vitest = join(lienModules, 'vitest', 'vitest.mjs')
const nuxt = join(lienModules, 'nuxt', 'bin', 'nuxt.mjs')
let code = 0

try {
  // 2. Application des solutions, dans l'ordre.
  for (const id of tps) {
    console.log(`▸ Solution appliquée : ${id}`)
    cpSync(join(RACINE, 'solutions', id), dossier, { recursive: true, force: true })
  }

  if (depart) {
    // 3a. Projet de départ : chaque fichier de test doit avoir au moins un échec.
    console.log('▸ Tests du projet de départ (chaque fichier doit échouer)\n')
    const rapport = join(dossier, 'resultats-depart.json')
    lancer(vitest, ['run', '--config', configVerification, '--reporter=default', '--reporter=json', `--outputFile.json=${rapport}`])
    const { testResults = [] } = JSON.parse(readFileSync(rapport, 'utf8'))
    const fichiers = readdirSync(join(dossier, 'tests')).filter((f) => f.endsWith('.test.ts')).sort()
    console.log('\n▸ Bilan du projet de départ')
    for (const fichier of fichiers) {
      const resultat = testResults.find((r) => r.name.endsWith(`tests/${fichier}`) || r.name.endsWith(`tests\\${fichier}`))
      const echecs = resultat
        ? resultat.assertionResults.filter((t) => t.status === 'failed').length || (resultat.status === 'failed' ? 1 : 0)
        : 0
      const total = resultat?.assertionResults.length ?? 0
      if (echecs > 0) {
        console.log(`  ✓ ${fichier} : ${echecs}/${total} test(s) en échec, comme prévu`)
      } else {
        console.log(`  ✗ ${fichier} : aucun échec (les tests devraient échouer au départ)`)
        code = 1
      }
    }
  } else {
    // 3b. Solutions appliquées : tous les tests doivent passer.
    const filtres = jusqua ? tps : []
    console.log(`▸ Tests ${jusqua ? `des TP ${tps.join(', ')}` : 'de tous les TP'}\n`)
    code = lancer(vitest, ['run', '--config', configVerification, ...filtres])

    if (code === 0 && build) {
      console.log('\n▸ Construction de l\'application (nuxt build)\n')
      code = lancer(nuxt, ['build'])
    }
  }
} finally {
  nettoyer()
}

console.log(code === 0 ? '\n✓ Vérification réussie.' : '\n✗ Vérification en échec.')
process.exit(code)
