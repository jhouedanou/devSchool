// Éditeur de code : CodeMirror 5 (chargé à la demande), avec repli sur un <textarea>.
import { chargerScript } from './util.js';

const CM = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/';
const MODULES = [
  'mode/javascript/javascript', 'mode/xml/xml', 'mode/css/css', 'mode/htmlmixed/htmlmixed', 'mode/jsx/jsx',
  'addon/edit/closebrackets', 'addon/edit/matchbrackets', 'addon/edit/closetag', 'addon/comment/comment',
];

let chargement = null;
function chargerCodeMirror() {
  if (!chargement) {
    chargement = chargerScript(CM + 'codemirror.min.js')
      .then(() => Promise.all(MODULES.map((m) => chargerScript(CM + m + '.min.js'))))
      .catch((e) => { chargement = null; throw e; });
  }
  return chargement;
}

const MODES = {
  js: 'javascript',
  react: 'jsx',
  vue: 'htmlmixed',
  nuxt: 'htmlmixed',
};

/**
 * Crée un éditeur dans `conteneur`.
 * Retourne { getValue, setValue, focus, refresh, detruire }.
 */
export async function creerEditeur(conteneur, { valeur, type, auChangement, auLancement, lectureSeule = false }) {
  try {
    await chargerCodeMirror();
  } catch {
    return editeurSimple(conteneur, { valeur, auChangement, auLancement, lectureSeule });
  }
  const CodeMirror = window.CodeMirror;
  conteneur.innerHTML = '';
  const cm = CodeMirror(conteneur, {
    value: valeur,
    mode: MODES[type] || 'javascript',
    theme: 'devschool',
    lineNumbers: true,
    tabSize: 2,
    indentUnit: 2,
    indentWithTabs: false,
    smartIndent: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    autoCloseTags: type === 'vue' || type === 'nuxt' || type === 'react',
    readOnly: lectureSeule,
    viewportMargin: Infinity,
    extraKeys: {
      'Ctrl-Enter': () => auLancement && auLancement(),
      'Cmd-Enter': () => auLancement && auLancement(),
      'Ctrl-S': () => auLancement && auLancement(),
      'Cmd-S': () => auLancement && auLancement(),
      Tab: (ed) => {
        if (ed.somethingSelected()) ed.indentSelection('add');
        else ed.replaceSelection('  ', 'end');
      },
      'Shift-Tab': (ed) => ed.indentSelection('subtract'),
      'Ctrl-/': 'toggleComment',
      'Cmd-/': 'toggleComment',
    },
  });
  if (auChangement) cm.on('change', () => auChangement(cm.getValue()));
  return {
    getValue: () => cm.getValue(),
    setValue: (v) => cm.setValue(v),
    focus: () => cm.focus(),
    refresh: () => cm.refresh(),
    detruire: () => { conteneur.innerHTML = ''; },
  };
}

function editeurSimple(conteneur, { valeur, auChangement, auLancement, lectureSeule }) {
  conteneur.innerHTML = '';
  const zone = document.createElement('textarea');
  zone.className = 'editeur-secours';
  zone.spellcheck = false;
  zone.value = valeur;
  zone.readOnly = lectureSeule;
  zone.setAttribute('aria-label', 'Éditeur de code');
  zone.addEventListener('input', () => auChangement && auChangement(zone.value));
  zone.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'Enter' || e.key === 's')) {
      e.preventDefault();
      if (auLancement) auLancement();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart: d, selectionEnd: f } = zone;
      zone.value = zone.value.slice(0, d) + '  ' + zone.value.slice(f);
      zone.selectionStart = zone.selectionEnd = d + 2;
      if (auChangement) auChangement(zone.value);
    }
  });
  conteneur.appendChild(zone);
  return {
    getValue: () => zone.value,
    setValue: (v) => { zone.value = v; },
    focus: () => zone.focus(),
    refresh: () => {},
    detruire: () => { conteneur.innerHTML = ''; },
  };
}
