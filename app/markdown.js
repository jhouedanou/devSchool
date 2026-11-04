// Rendu Markdown : marked + highlight.js, encadrés, boutons « Copier ».
import { echapper, slug } from './util.js';

const ALIAS = {
  vue: 'xml', html: 'xml', svg: 'xml', blade: 'php-template',
  js: 'javascript', mjs: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash',
  yml: 'yaml', env: 'ini', dotenv: 'ini', txt: 'plaintext', text: 'plaintext',
};

const LIBELLES = {
  js: 'JavaScript', javascript: 'JavaScript', ts: 'TypeScript', typescript: 'TypeScript',
  vue: 'Vue', jsx: 'JSX', tsx: 'TSX', html: 'HTML', css: 'CSS', php: 'PHP', blade: 'Blade',
  bash: 'Terminal', sh: 'Terminal', shell: 'Terminal', json: 'JSON', sql: 'SQL', yaml: 'YAML',
  env: '.env', ini: 'INI', text: 'Texte', txt: 'Texte', plaintext: 'Texte',
};

export function colorer(code, langage) {
  const l = ALIAS[langage] || langage;
  const hljs = window.hljs;
  if (hljs && l && hljs.getLanguage(l)) {
    try { return hljs.highlight(code, { language: l, ignoreIllegals: true }).value; } catch { /* rien */ }
  }
  return echapper(code);
}

export function blocCode(code, langage) {
  const libelle = LIBELLES[langage] || langage || '';
  return `<div class="bloc-code"><div class="bloc-code-entete"><span>${echapper(libelle)}</span>`
    + `<button type="button" class="copier" aria-label="Copier le code">Copier</button></div>`
    + `<pre><code class="hljs">${colorer(code.replace(/\n$/, ''), langage)}</code></pre></div>`;
}

let configure = false;
function configurer() {
  if (configure || !window.marked) return;
  configure = true;
  window.marked.use({
    gfm: true,
    renderer: {
      code({ text, lang }) {
        return blocCode(text, (lang || '').trim().split(/\s+/)[0].toLowerCase());
      },
      // Le HTML brut est affiché tel quel (évite qu'un « <template> » écrit hors code disparaisse).
      html({ text }) {
        return echapper(text);
      },
      heading({ tokens, depth }) {
        const contenu = this.parser.parseInline(tokens);
        const id = slug(contenu);
        return `<h${depth} id="${id}">${contenu}</h${depth}>\n`;
      },
    },
  });
}

const TYPES_ENCADRE = {
  TIP: ['astuce', 'Astuce'],
  NOTE: ['note', 'À savoir'],
  WARNING: ['attention', 'Attention'],
  CAUTION: ['attention', 'Attention'],
  IMPORTANT: ['important', 'Important'],
};

/** Transforme le Markdown en HTML puis enrichit le DOM. */
export function rendreMarkdown(md, conteneur, { base = '' } = {}) {
  configurer();
  const htmlRendu = window.marked ? window.marked.parse(md) : `<pre>${echapper(md)}</pre>`;
  conteneur.innerHTML = htmlRendu;
  ameliorer(conteneur, base);
  return conteneur;
}

export function markdownEnLigne(md) {
  configurer();
  return window.marked ? window.marked.parseInline(md) : echapper(md);
}

export function markdownEnHtml(md) {
  configurer();
  return window.marked ? window.marked.parse(md) : `<pre>${echapper(md)}</pre>`;
}

export function ameliorer(conteneur, base = '') {
  // Encadrés > [!TIP]
  conteneur.querySelectorAll('blockquote').forEach((bq) => {
    const p = bq.querySelector('p');
    if (!p) return;
    const m = p.innerHTML.match(/^\s*\[!(TIP|NOTE|WARNING|CAUTION|IMPORTANT)\]\s*(<br>)?\s*/i);
    if (!m) return;
    const [classe, titre] = TYPES_ENCADRE[m[1].toUpperCase()];
    p.innerHTML = p.innerHTML.slice(m[0].length);
    if (!p.innerHTML.trim()) p.remove();
    const aside = document.createElement('aside');
    aside.className = `encadre encadre-${classe}`;
    aside.innerHTML = `<p class="encadre-titre">${titre}</p>`;
    while (bq.firstChild) aside.appendChild(bq.firstChild);
    bq.replaceWith(aside);
  });
  // Liens relatifs (ex. vers un fichier du TP) : résolus depuis le dossier du fichier Markdown.
  if (base) {
    const racine = new URL(base, location.href);
    conteneur.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href || /^([a-z]+:|#|\/)/i.test(href)) return;
      a.setAttribute('href', new URL(href, racine).href);
    });
  }
  // Liens externes et fichiers dans un nouvel onglet
  conteneur.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (/^https?:\/\//.test(href)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
  });
  // Tableaux défilants sur mobile
  conteneur.querySelectorAll('table').forEach((t) => {
    if (t.parentElement.classList.contains('tableau')) return;
    const div = document.createElement('div');
    div.className = 'tableau';
    t.replaceWith(div);
    div.appendChild(t);
  });
}

// Boutons « Copier » (délégation globale)
document.addEventListener('click', async (e) => {
  const bouton = e.target.closest('.bloc-code .copier');
  if (!bouton) return;
  const code = bouton.closest('.bloc-code').querySelector('code').innerText;
  try {
    await navigator.clipboard.writeText(code);
    bouton.textContent = 'Copié ✓';
  } catch {
    bouton.textContent = 'Échec';
  }
  setTimeout(() => { bouton.textContent = 'Copier'; }, 1500);
});
