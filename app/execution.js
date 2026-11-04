// Côté page : pilote l'iframe d'exécution (app/runner/runner.html).

const DELAI_CHARGEMENT = 60000; // téléchargement des bibliothèques (première fois)
const DELAI_EXECUTION = 20000;  // exécution des tests une fois prêt

function creerCadre(kind, mode) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts allow-forms');
  iframe.src = `app/runner/runner.html?kind=${encodeURIComponent(kind)}&mode=${mode}`;
  iframe.title = mode === 'tests' ? 'Exécution des tests' : 'Aperçu du résultat';
  iframe.className = mode === 'tests' ? 'cadre-cache' : 'cadre-apercu';
  iframe.setAttribute('loading', 'eager');
  return iframe;
}

/**
 * Lance les tests dans une iframe neuve, puis la supprime.
 * Résout avec { resultats, logs } ou { erreurCompilation | erreurChargement | erreurExecution }.
 */
export function lancerTests({ kind, code, tests, onPret }) {
  return new Promise((resolve) => {
    const iframe = creerCadre(kind, 'tests');
    const id = Math.random().toString(36).slice(2);
    let fini = false;
    let minuteur = setTimeout(() => terminer({ erreurChargement: "L'environnement d'exécution ne se charge pas. Vérifie ta connexion internet, puis réessaie." }), DELAI_CHARGEMENT);

    function terminer(r) {
      if (fini) return;
      fini = true;
      clearTimeout(minuteur);
      window.removeEventListener('message', ecouter);
      iframe.remove();
      resolve(r);
    }

    function ecouter(e) {
      if (e.source !== iframe.contentWindow) return;
      const m = e.data || {};
      if (m.source !== 'devschool-runner') return;
      if (m.type === 'pret') {
        if (m.erreur) return terminer({ erreurChargement: m.erreur });
        if (onPret) onPret();
        clearTimeout(minuteur);
        minuteur = setTimeout(() => terminer({ erreurExecution: "Les tests ne répondent plus après 20 secondes. Tu as peut-être une boucle infinie (while, for) ou une mise à jour d'état en boucle." }), DELAI_EXECUTION);
        iframe.contentWindow.postMessage({ type: 'executer', id, mode: 'tests', code, tests }, '*');
      } else if (m.type === 'resultat' && m.id === id) {
        terminer(m);
      }
    }

    window.addEventListener('message', ecouter);
    document.body.appendChild(iframe);
  });
}

/**
 * Aperçu : une iframe visible dans `cible`. Chaque appel à `afficher(code)` recrée l'iframe
 * (état propre). `onLog` reçoit les messages de la console.
 */
export class Apercu {
  constructor(cible, kind, { onLog, onEtat } = {}) {
    this.cible = cible;
    this.kind = kind;
    this.onLog = onLog;
    this.onEtat = onEtat;
    this.iframe = null;
    this.ecouter = this.ecouter.bind(this);
    window.addEventListener('message', this.ecouter);
  }

  afficher(code, mocks) {
    if (this.iframe) this.iframe.remove();
    this.code = code;
    this.mocks = mocks || null;
    this.id = Math.random().toString(36).slice(2);
    this.iframe = creerCadre(this.kind, 'apercu');
    this.cible.appendChild(this.iframe);
    if (this.onEtat) this.onEtat('chargement');
  }

  ecouter(e) {
    if (!this.iframe || e.source !== this.iframe.contentWindow) return;
    const m = e.data || {};
    if (m.source !== 'devschool-runner') return;
    if (m.type === 'pret') {
      if (m.erreur) { if (this.onEtat) this.onEtat('erreur', m.erreur); return; }
      this.iframe.contentWindow.postMessage({ type: 'executer', id: this.id, mode: 'apercu', code: this.code, mocks: this.mocks }, '*');
    } else if (m.type === 'log') {
      if (this.onLog) this.onLog(m);
    } else if (m.type === 'hauteur') {
      this.iframe.style.height = Math.max(140, Math.min(640, m.hauteur + 4)) + 'px';
    } else if (m.type === 'resultat' && m.id === this.id) {
      if (this.onEtat) this.onEtat(m.erreurCompilation ? 'erreur' : 'pret', m.erreurCompilation || m.erreurExecution || '');
    }
  }

  detruire() {
    window.removeEventListener('message', this.ecouter);
    if (this.iframe) this.iframe.remove();
    this.iframe = null;
  }
}
