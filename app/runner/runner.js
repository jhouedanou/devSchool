/*
 * devSchool — exécuteur d'exercices.
 *
 * Ce fichier tourne dans une iframe isolée (sandbox). Il :
 *   1. charge les bibliothèques du type d'exercice (Vue, React, Babel…) ;
 *   2. compile le code de l'élève (SFC Vue, JSX, modules ES) ;
 *   3. affiche un aperçu OU lance les tests, puis renvoie les résultats
 *      à la page parente avec postMessage.
 *
 * URL : runner.html?kind=js|vue|nuxt|react&mode=apercu|tests
 */
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var KIND = params.get('kind') || 'js';
  var MODE = params.get('mode') || 'apercu';

  var CDN = {
    vue: 'https://unpkg.com/vue@3.5.22/dist/vue.global.js',
    sfc: 'https://unpkg.com/@vue/compiler-sfc@3.5.22/dist/compiler-sfc.esm-browser.js',
    react: 'https://unpkg.com/react@18.3.1/umd/react.development.js',
    reactDom: 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
    babel: 'https://unpkg.com/@babel/standalone@7.28.4/babel.min.js'
  };

  var TIMEOUT_TEST = 4000;

  /* ------------------------------------------------------------------ */
  /* Utilitaires                                                         */
  /* ------------------------------------------------------------------ */

  function pause(ms) {
    return new Promise(function (r) { setTimeout(r, ms || 0); });
  }

  function chargerScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('Impossible de charger ' + src + ' (connexion internet ?)')); };
      document.head.appendChild(s);
    });
  }

  function formater(v, profondeur) {
    profondeur = profondeur || 0;
    if (typeof v === 'string') return profondeur ? JSON.stringify(v) : v;
    if (v === undefined) return 'undefined';
    if (v === null) return 'null';
    if (typeof v === 'function') return 'ƒ ' + (v.name || 'anonyme') + '()';
    if (typeof v === 'symbol') return v.toString();
    if (v instanceof Error) return v.name + ': ' + v.message;
    if (typeof Element !== 'undefined' && v instanceof Element) {
      return '<' + v.tagName.toLowerCase() + '>';
    }
    if (typeof v === 'object') {
      try {
        // Les refs Vue s'affichent par leur valeur.
        if (window.Vue && window.Vue.isRef && window.Vue.isRef(v)) return 'Ref(' + formater(v.value, 1) + ')';
        if (window.Vue && window.Vue.toRaw) v = window.Vue.toRaw(v);
        return JSON.stringify(v, function (k, val) {
          if (typeof val === 'function') return 'ƒ ' + (val.name || 'anonyme') + '()';
          if (val === undefined) return '__undefined__';
          return val;
        }).replace(/"__undefined__"/g, 'undefined');
      } catch (e) {
        return String(v);
      }
    }
    return String(v);
  }

  /* ------------------------------------------------------------------ */
  /* Console capturée                                                    */
  /* ------------------------------------------------------------------ */

  var journal = [];
  var IGNORES = [
    /<Suspense> is an experimental feature/,
    /not wrapped in act\(/,
    /The current testing environment is not configured to support act/,
    /Download the React DevTools/,
    /You are running a development build of Vue/,
    /You are using the in-browser Babel transformer/
  ];

  function journaliser(niveau, args) {
    var texte = Array.prototype.map.call(args, function (a) { return formater(a); }).join(' ');
    for (var i = 0; i < IGNORES.length; i++) if (IGNORES[i].test(texte)) return;
    var entree = { niveau: niveau, texte: texte };
    journal.push(entree);
    if (MODE === 'apercu') envoyer({ type: 'log', niveau: niveau, texte: texte });
  }

  ['log', 'info', 'warn', 'error'].forEach(function (niveau) {
    var original = console[niveau].bind(console);
    console[niveau] = function () {
      journaliser(niveau, arguments);
      original.apply(null, arguments);
    };
  });

  window.addEventListener('error', function (e) {
    journaliser('error', [e.error ? e.error : e.message]);
  });
  window.addEventListener('unhandledrejection', function (e) {
    journaliser('error', ['Promesse rejetée :', e.reason]);
  });

  // Pas de boîtes de dialogue bloquantes dans l'exécuteur.
  window.alert = function (m) { journaliser('info', ['[alert] ' + formater(m)]); };
  window.confirm = function (m) { journaliser('info', ['[confirm] ' + formater(m) + ' → true']); return true; };
  window.prompt = function (m) { journaliser('info', ['[prompt] ' + formater(m) + ' → null']); return null; };

  // Un formulaire soumis sans preventDefault() rechargerait la page.
  window.addEventListener('submit', function (e) {
    if (!e.defaultPrevented) {
      journaliser('warn', ['Formulaire soumis sans preventDefault() : dans un vrai navigateur, la page serait rechargée.']);
      e.preventDefault();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Communication avec la page parente                                  */
  /* ------------------------------------------------------------------ */

  function envoyer(message) {
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage(Object.assign({ source: 'devschool-runner' }, message), '*'); } catch (e) { /* rien */ }
    }
  }

  function signalerHauteur() {
    envoyer({ type: 'hauteur', hauteur: document.documentElement.scrollHeight });
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(signalerHauteur).observe(document.body);
  }

  /* ------------------------------------------------------------------ */
  /* Chargement des bibliothèques                                        */
  /* ------------------------------------------------------------------ */

  function chargerBibliotheques() {
    if (KIND === 'vue' || KIND === 'nuxt') {
      return Promise.all([chargerScript(CDN.vue), chargerScript(CDN.babel)])
        .then(function () { return import(CDN.sfc); })
        .then(function (sfc) {
          window.VueSFC = sfc;
          if (KIND === 'nuxt') installerNuxt();
        });
    }
    if (KIND === 'react') {
      return chargerScript(CDN.react)
        .then(function () { return chargerScript(CDN.reactDom); })
        .then(function () { return chargerScript(CDN.babel); })
        .then(function () { window.IS_REACT_ACT_ENVIRONMENT = true; });
    }
    return chargerScript(CDN.babel);
  }

  var pret = chargerBibliotheques();

  /* ------------------------------------------------------------------ */
  /* Simulation de Nuxt (auto-imports + composables principaux)          */
  /* ------------------------------------------------------------------ */

  var nuxt = null;

  function installerNuxt() {
    var V = window.Vue;
    nuxt = {
      etats: {},
      cookies: {},
      navigations: [],
      route: V.reactive({ path: '/', fullPath: '/', name: 'index', params: {}, query: {}, hash: '', meta: {} }),
      head: { title: '' },
      config: { public: {} }
    };

    function versChemin(to) {
      if (typeof to === 'string') return to;
      if (to && to.path) return to.path;
      if (to && to.name) return '/' + String(to.name);
      return '/';
    }

    function navigateTo(to) {
      var chemin = versChemin(to);
      nuxt.navigations.push(chemin);
      var parties = chemin.split('?');
      nuxt.route.path = parties[0];
      nuxt.route.fullPath = chemin;
      nuxt.route.query = Object.fromEntries(new URLSearchParams(parties[1] || ''));
      return Promise.resolve();
    }

    function $fetch(url, options) {
      options = options || {};
      var methode = (options.method || 'GET').toUpperCase();
      var u = String(url);
      var query = options.query || options.params;
      if (query) {
        var qs = new URLSearchParams(V.toRaw(V.unref(query))).toString();
        if (qs) u += (u.indexOf('?') >= 0 ? '&' : '?') + qs;
      }
      var corps = options.body;
      var init = { method: methode, headers: Object.assign({}, options.headers || {}) };
      if (corps !== undefined) {
        if (typeof corps === 'object' && !(corps instanceof FormData)) {
          init.body = JSON.stringify(V.toRaw(corps));
          init.headers['Content-Type'] = 'application/json';
        } else {
          init.body = corps;
        }
      }
      return fetch(u, init).then(function (r) {
        var type = (r.headers && r.headers.get('content-type')) || '';
        var lire = type.indexOf('json') >= 0 ? r.json() : r.text();
        return lire.then(function (donnees) {
          if (!r.ok) {
            var err = new Error('[' + methode + '] "' + u + '": ' + r.status);
            err.statusCode = r.status;
            err.status = r.status;
            err.data = donnees;
            throw err;
          }
          return donnees;
        });
      });
    }

    function creerDonneesAsync(executer, options) {
      options = options || {};
      var data = V.ref(options.default ? options.default() : undefined);
      var status = V.ref('idle');
      var pending = V.ref(false);
      var error = V.ref(undefined);
      function refresh() {
        status.value = 'pending';
        pending.value = true;
        return Promise.resolve()
          .then(executer)
          .then(function (r) {
            data.value = options.transform ? options.transform(r) : r;
            error.value = undefined;
            status.value = 'success';
          })
          .catch(function (e) {
            error.value = e;
            status.value = 'error';
          })
          .then(function () { pending.value = false; });
      }
      var resultat = {
        data: data, status: status, pending: pending, error: error,
        refresh: refresh, execute: refresh,
        clear: function () { data.value = undefined; error.value = undefined; status.value = 'idle'; }
      };
      if (options.watch && options.watch.length) V.watch(options.watch, function () { refresh(); });
      var promesse = (options.immediate === false ? Promise.resolve() : refresh()).then(function () { return resultat; });
      return Object.assign(promesse, resultat);
    }

    function useFetch(url, options) {
      options = options || {};
      var lireUrl = function () { return typeof url === 'function' ? url() : V.unref(url); };
      var sources = [];
      if (typeof url === 'function' || V.isRef(url)) sources.push(lireUrl);
      if (options.query && (V.isRef(options.query) || V.isReactive(options.query))) sources.push(function () { return JSON.stringify(V.unref(options.query)); });
      var opts = Object.assign({}, options, { watch: options.watch === false ? [] : sources.concat(options.watch || []) });
      return creerDonneesAsync(function () {
        return $fetch(lireUrl(), Object.assign({}, options, { query: V.unref(options.query) }));
      }, opts);
    }

    function useAsyncData(cle, executer, options) {
      if (typeof cle === 'function') { options = executer; executer = cle; }
      return creerDonneesAsync(executer, options);
    }

    var shims = {
      useState: function (cle, init) {
        if (typeof cle === 'function') { init = cle; cle = '__anonyme'; }
        if (!(cle in nuxt.etats)) nuxt.etats[cle] = V.ref(init ? init() : undefined);
        return nuxt.etats[cle];
      },
      useFetch: useFetch,
      useLazyFetch: function (u, o) { return useFetch(u, Object.assign({}, o, { lazy: true })); },
      useAsyncData: useAsyncData,
      useLazyAsyncData: useAsyncData,
      $fetch: $fetch,
      useRoute: function () { return nuxt.route; },
      useRouter: function () {
        return {
          push: navigateTo, replace: navigateTo,
          back: function () { nuxt.navigations.push('[back]'); },
          currentRoute: V.computed(function () { return nuxt.route; })
        };
      },
      navigateTo: navigateTo,
      definePageMeta: function () {},
      defineNuxtRouteMiddleware: function (fn) { return fn; },
      defineNuxtPlugin: function (fn) { return fn; },
      useHead: function (h) { var t = h && V.unref(h.title); if (t) { nuxt.head.title = t; document.title = t; } },
      useSeoMeta: function (m) { var t = m && V.unref(m.title); if (t) { nuxt.head.title = t; document.title = t; } },
      useRuntimeConfig: function () { return nuxt.config; },
      useNuxtApp: function () { return { $fetch: $fetch }; },
      useCookie: function (nom, options) {
        if (!(nom in nuxt.cookies)) nuxt.cookies[nom] = V.ref(options && options.default ? options.default() : undefined);
        return nuxt.cookies[nom];
      },
      createError: function (o) {
        o = typeof o === 'string' ? { statusMessage: o } : (o || {});
        var e = new Error(o.statusMessage || o.message || 'Erreur');
        e.statusCode = o.statusCode || 500;
        e.statusMessage = o.statusMessage;
        e.data = o.data;
        return e;
      },
      showError: function (e) { journaliser('error', ['[showError]', e]); },
      clearError: function () {}
    };

    // Auto-imports : les fonctions de Vue et de Nuxt sont disponibles sans import.
    var AUTO_VUE = ['ref', 'reactive', 'computed', 'watch', 'watchEffect', 'onMounted', 'onBeforeMount',
      'onUnmounted', 'onBeforeUnmount', 'onUpdated', 'nextTick', 'toRef', 'toRefs', 'toValue', 'unref',
      'isRef', 'shallowRef', 'readonly', 'provide', 'inject', 'h', 'defineComponent', 'useTemplateRef',
      'useSlots', 'useAttrs', 'markRaw', 'toRaw', 'triggerRef', 'customRef', 'effectScope', 'useId'];
    AUTO_VUE.forEach(function (n) { if (V[n]) window[n] = V[n]; });
    Object.keys(shims).forEach(function (n) { window[n] = shims[n]; });
    window.__nuxtShims = shims;
  }

  function reinitialiserNuxt() {
    if (!nuxt) return;
    nuxt.etats = {};
    nuxt.cookies = {};
    nuxt.navigations.length = 0;
    Object.assign(nuxt.route, { path: '/', fullPath: '/', name: 'index', params: {}, query: {}, hash: '', meta: {} });
    nuxt.head.title = '';
    nuxt.config.public = {};
  }

  function composantsNuxt(app) {
    var V = window.Vue;
    app.component('NuxtLink', {
      name: 'NuxtLink',
      props: { to: [String, Object], href: String },
      setup: function (props, ctx) {
        return function () {
          var cible = props.to || props.href || '/';
          var chemin = typeof cible === 'string' ? cible : (cible.path || '/');
          return V.h('a', {
            href: chemin,
            onClick: function (e) { e.preventDefault(); window.navigateTo(cible); }
          }, ctx.slots.default ? ctx.slots.default() : undefined);
        };
      }
    });
    app.component('ClientOnly', { setup: function (p, ctx) { return function () { return ctx.slots.default ? ctx.slots.default() : null; }; } });
    app.component('NuxtLayout', { setup: function (p, ctx) { return function () { return ctx.slots.default ? ctx.slots.default() : null; }; } });
  }

  /* ------------------------------------------------------------------ */
  /* Compilation                                                         */
  /* ------------------------------------------------------------------ */

  function ErreurCompilation(message) {
    this.name = 'ErreurCompilation';
    this.message = message;
  }
  ErreurCompilation.prototype = Object.create(Error.prototype);

  function messageBabel(e) {
    var m = String(e.message || e);
    return m.replace(/^\/?[\w.]+: /, '');
  }

  function transformer(code, nomFichier, presets) {
    try {
      return window.Babel.transform(code, {
        filename: nomFichier,
        presets: presets || [],
        plugins: ['transform-modules-commonjs'],
        sourceType: 'module',
        retainLines: true
      }).code;
    } catch (e) {
      throw new ErreurCompilation(messageBabel(e));
    }
  }

  function compilerVue(source) {
    var sfc = window.VueSFC;
    var nomFichier = 'Composant.vue';
    var id = 'ex' + Math.random().toString(36).slice(2, 8);
    var analyse = sfc.parse(source, { filename: nomFichier });
    if (analyse.errors.length) {
      throw new ErreurCompilation(analyse.errors.map(function (e) {
        var ligne = e.loc && e.loc.start ? ' (ligne ' + e.loc.start.line + ')' : '';
        return (e.message || String(e)) + ligne;
      }).join('\n'));
    }
    var d = analyse.descriptor;
    var avecScoped = d.styles.some(function (s) { return s.scoped; });
    var bloc = d.scriptSetup || d.script;
    var ts = !!(bloc && bloc.lang === 'ts');
    var code = '';

    try {
      if (bloc) {
        var script = sfc.compileScript(d, {
          id: id,
          inlineTemplate: true,
          genDefaultAs: '__sfc__',
          templateOptions: { scoped: avecScoped }
        });
        code += script.content;
      } else {
        code += 'const __sfc__ = {};';
      }
      if (d.template && !d.scriptSetup) {
        var tpl = sfc.compileTemplate({
          source: d.template.content,
          filename: nomFichier,
          id: id,
          scoped: avecScoped,
          compilerOptions: { scopeId: avecScoped ? 'data-v-' + id : undefined }
        });
        if (tpl.errors && tpl.errors.length) {
          throw new ErreurCompilation(tpl.errors.map(function (e) { return e.message || String(e); }).join('\n'));
        }
        code += '\n' + tpl.code + '\n__sfc__.render = render;';
      }
    } catch (e) {
      if (e instanceof ErreurCompilation) throw e;
      throw new ErreurCompilation(String(e.message || e));
    }
    if (avecScoped) code += '\n__sfc__.__scopeId = "data-v-' + id + '";';
    code += '\nexport default __sfc__;';

    var css = '';
    d.styles.forEach(function (st) {
      var r = sfc.compileStyle({ source: st.content, filename: nomFichier, id: id, scoped: st.scoped });
      css += r.code + '\n';
    });

    var presets = ts ? [['typescript', { allExtensions: true }]] : [];
    return { code: transformer(code, ts ? 'Composant.vue.ts' : 'Composant.vue.js', presets), css: css };
  }

  function compiler(source) {
    if (KIND === 'vue' || KIND === 'nuxt') return compilerVue(source);
    if (KIND === 'react') return { code: transformer(source, 'App.jsx', [['react', { runtime: 'classic' }]]), css: '' };
    return { code: transformer(source, 'exercice.js', []), css: '' };
  }

  function requireSimule(nom) {
    if (nom === 'vue') return window.Vue;
    if (nom === 'react') return window.React;
    if (nom === 'react-dom' || nom === 'react-dom/client') return window.ReactDOM;
    if ((nom === '#app' || nom === '#imports' || nom === 'nuxt/app') && window.__nuxtShims) return Object.assign({}, window.Vue, window.__nuxtShims);
    throw new Error('Le module « ' + nom + ' » n\'est pas disponible dans cet exercice.');
  }

  function executerModule(compile) {
    var module = { exports: {} };
    // eslint-disable-next-line no-new-func
    var fn = new Function('require', 'module', 'exports', 'React', compile.code);
    fn(requireSimule, module, module.exports, window.React);
    return module.exports;
  }

  var styleInjecte = null;
  function injecterCss(css) {
    if (!styleInjecte) {
      styleInjecte = document.createElement('style');
      document.head.appendChild(styleInjecte);
    }
    styleInjecte.textContent = css || '';
  }

  /* ------------------------------------------------------------------ */
  /* Actions + rafraîchissement du rendu                                 */
  /* ------------------------------------------------------------------ */

  function actReact(fn) {
    var act = window.React && window.React.act;
    if (act) return act(fn);
    return Promise.resolve(fn()).then(function () { return pause(0); });
  }

  function agir(fn) {
    if (KIND === 'react') {
      return actReact(function () { fn(); return pause(0); });
    }
    try { fn(); } catch (e) { return Promise.reject(e); }
    if (window.Vue) {
      return window.Vue.nextTick().then(function () { return pause(0); }).then(function () { return window.Vue.nextTick(); });
    }
    return pause(0);
  }

  function tick() { return agir(function () {}); }

  function attendrePendant(ms) {
    if (KIND === 'react') return actReact(function () { return pause(ms); });
    return pause(ms).then(function () { return window.Vue ? window.Vue.nextTick() : null; });
  }

  /* ------------------------------------------------------------------ */
  /* Enveloppes DOM (API proche de Vue Test Utils / Testing Library)    */
  /* ------------------------------------------------------------------ */

  function texteDe(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function Noeud(el, selecteur) {
    this.element = el || null;
    this.el = el || null;
    this.selecteur = selecteur || '?';
  }

  Noeud.prototype._el = function () {
    if (!this.element) throw new Error('Élément introuvable : « ' + this.selecteur + ' »');
    return this.element;
  };
  Noeud.prototype.exists = function () { return !!this.element; };
  Noeud.prototype.text = function () { return texteDe(this._el()); };
  Noeud.prototype.html = function () { return this._el().outerHTML; };
  Noeud.prototype.attributes = function (nom) {
    var el = this._el();
    if (nom !== undefined) return el.getAttribute(nom);
    var r = {};
    Array.prototype.forEach.call(el.attributes, function (a) { r[a.name] = a.value; });
    return r;
  };
  Noeud.prototype.attr = Noeud.prototype.attributes;
  Noeud.prototype.classes = function (nom) {
    var liste = Array.prototype.slice.call(this._el().classList);
    return nom === undefined ? liste : liste.indexOf(nom) >= 0;
  };
  Object.defineProperty(Noeud.prototype, 'value', { get: function () { return this._el().value; } });
  Object.defineProperty(Noeud.prototype, 'checked', { get: function () { return this._el().checked; } });
  Object.defineProperty(Noeud.prototype, 'disabled', { get: function () { return !!this._el().disabled; } });
  Noeud.prototype.isVisible = function () {
    var e = this._el();
    while (e && e.nodeType === 1) {
      if (e.hidden) return false;
      var style = window.getComputedStyle(e);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      e = e.parentElement;
    }
    return true;
  };
  Noeud.prototype.find = function (selecteur) {
    return new Noeud(this._el().querySelector(selecteur), selecteur);
  };
  Noeud.prototype.get = function (selecteur) {
    var n = this.find(selecteur);
    n._el();
    return n;
  };
  Noeud.prototype.findAll = function (selecteur) {
    return Array.prototype.map.call(this._el().querySelectorAll(selecteur), function (e) { return new Noeud(e, selecteur); });
  };
  Noeud.prototype.findByText = function (texte, selecteur) {
    var racine = this._el();
    var candidats = Array.prototype.filter.call(racine.querySelectorAll(selecteur || '*'), function (e) {
      var t = texteDe(e);
      return texte instanceof RegExp ? texte.test(t) : t.indexOf(texte) >= 0;
    });
    // On garde l'élément le plus profond (celui dont aucun enfant ne correspond).
    var plusProfonds = candidats.filter(function (e) {
      return !candidats.some(function (autre) { return autre !== e && e.contains(autre); });
    });
    return new Noeud(plusProfonds[0] || null, 'texte « ' + texte + ' »');
  };
  Noeud.prototype.click = function () {
    var el = this._el();
    return agir(function () { el.click(); });
  };
  Noeud.prototype.trigger = function (type, init) {
    var el = this._el();
    init = Object.assign({ bubbles: true, cancelable: true }, init || {});
    var ev;
    if (/^key/.test(type)) ev = new KeyboardEvent(type, init);
    else if (/^(click|dblclick|mouse|contextmenu)/.test(type)) ev = new MouseEvent(type, init);
    else if (/^(focus|blur)/.test(type)) ev = new FocusEvent(type, init);
    else ev = new Event(type, init);
    return agir(function () { el.dispatchEvent(ev); });
  };
  Noeud.prototype.setValue = function (valeur) {
    var el = this._el();
    return agir(function () {
      if (el.type === 'checkbox' || el.type === 'radio') {
        if (el.checked !== Boolean(valeur)) el.click();
        return;
      }
      var proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype
        : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      var desc = Object.getOwnPropertyDescriptor(proto, 'value');
      desc.set.call(el, valeur === undefined || valeur === null ? '' : String(valeur));
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  };
  Noeud.prototype.submit = function () { return this.trigger('submit'); };

  function Monture(conteneur, api) {
    Noeud.call(this, conteneur, 'composant monté');
    this.api = api;
  }
  Monture.prototype = Object.create(Noeud.prototype);
  Monture.prototype.html = function () { return this._el().innerHTML; };
  Monture.prototype.setProps = function (props) { return this.api.setProps(props); };
  Monture.prototype.unmount = function () { return this.api.unmount(); };

  /* ------------------------------------------------------------------ */
  /* Montage des composants                                              */
  /* ------------------------------------------------------------------ */

  var demontages = [];

  function nouveauConteneur(visible) {
    var app = document.getElementById('app');
    if (visible) {
      app.innerHTML = '';
      return app;
    }
    var c = document.createElement('div');
    c.className = 'monture-test';
    document.body.appendChild(c);
    return c;
  }

  function erreurMontage(e) {
    var m = e && e.message ? e.message : String(e);
    return new Error('Erreur pendant le rendu du composant : ' + m);
  }

  function monterVue(Composant, props, options, visible) {
    var V = window.Vue;
    if (!Composant || (typeof Composant !== 'object' && typeof Composant !== 'function')) {
      return Promise.reject(new Error('Aucun composant exporté. Vérifie le `export default` ou le bloc <script setup>.'));
    }
    options = options || {};
    var conteneur = nouveauConteneur(visible);
    var etat = V.reactive(Object.assign({}, props || {}));
    var slots = {};
    Object.keys(options.slots || {}).forEach(function (nom) {
      var s = options.slots[nom];
      slots[nom] = typeof s === 'function' ? s : function () { return s; };
    });
    var erreurs = [];
    var app = V.createApp({
      render: function () {
        return V.h(V.Suspense, null, {
          default: function () { return V.h(Composant, Object.assign({}, etat), slots); }
        });
      }
    });
    app.config.warnHandler = function (msg) { journaliser('warn', ['[Vue] ' + msg]); };
    app.config.errorHandler = function (err, instance, info) {
      erreurs.push(err);
      journaliser('error', ['[Vue] ' + (err && err.message ? err.message : err) + (info ? ' (' + info + ')' : '')]);
    };
    if (KIND === 'nuxt') composantsNuxt(app);
    (options.plugins || []).forEach(function (p) { app.use(p); });
    if (options.provide) Object.keys(options.provide).forEach(function (k) { app.provide(k, options.provide[k]); });
    try {
      app.mount(conteneur);
    } catch (e) {
      return Promise.reject(erreurMontage(e));
    }
    var demonte = false;
    var api = {
      setProps: function (p) { Object.assign(etat, p); return tick(); },
      unmount: function () { if (!demonte) { demonte = true; app.unmount(); } return Promise.resolve(); }
    };
    demontages.push(api.unmount);
    // On laisse le temps aux composants async (await en haut de <script setup>) de se résoudre.
    return tick().then(function () { return pause(0); }).then(tick).then(function () {
      if (erreurs.length) throw erreurMontage(erreurs[0]);
      return new Monture(conteneur, api);
    });
  }

  function monterReact(Composant, props, options, visible) {
    var R = window.React;
    var RD = window.ReactDOM;
    if (typeof Composant !== 'function' && !(Composant && Composant.$$typeof)) {
      return Promise.reject(new Error('Aucun composant exporté. Ajoute `export default function MonComposant() { … }`.'));
    }
    var conteneur = nouveauConteneur(visible);
    var racine = RD.createRoot(conteneur);
    var propsCourantes = Object.assign({}, props || {});
    var demonte = false;
    function rendre() {
      return actReact(function () { racine.render(R.createElement(Composant, propsCourantes)); });
    }
    var api = {
      setProps: function (p) {
        propsCourantes = Object.assign({}, propsCourantes, p);
        return rendre().then(function () { return pause(0); });
      },
      unmount: function () {
        if (demonte) return Promise.resolve();
        demonte = true;
        return actReact(function () { racine.unmount(); });
      }
    };
    demontages.push(api.unmount);
    return Promise.resolve()
      .then(rendre)
      .then(function () { return actReact(function () { return pause(0); }); })
      .then(function () { return new Monture(conteneur, api); })
      .catch(function (e) { throw erreurMontage(e); });
  }

  function demonterTout() {
    var liste = demontages.splice(0);
    return liste.reduce(function (p, f) {
      return p.then(function () { return Promise.resolve(f()).catch(function () {}); });
    }, Promise.resolve()).then(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.monture-test'), function (c) { c.remove(); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* expect + fn (API inspirée de Vitest)                               */
  /* ------------------------------------------------------------------ */

  function egal(a, b) {
    if (Object.is(a, b)) return true;
    if (window.Vue && window.Vue.toRaw) { a = window.Vue.toRaw(a); b = window.Vue.toRaw(b); }
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    var ka = Object.keys(a).filter(function (k) { return a[k] !== undefined; });
    var kb = Object.keys(b).filter(function (k) { return b[k] !== undefined; });
    if (ka.length !== kb.length) return false;
    return ka.every(function (k) { return egal(a[k], b[k]); });
  }

  function f(v) { return formater(v, 1); }

  function estMock(v) { return typeof v === 'function' && v._estMock; }

  function expect(recu) {
    function creer(negation) {
      function verifier(ok, messageOk, messageKo) {
        if (negation ? ok : !ok) throw new Error(negation ? messageOk : messageKo);
      }
      var m = {
        toBe: function (attendu) {
          verifier(Object.is(recu, attendu),
            'Attendu une valeur différente de ' + f(attendu),
            'Attendu : ' + f(attendu) + '\nReçu : ' + f(recu));
        },
        toEqual: function (attendu) {
          verifier(egal(recu, attendu),
            'Attendu une valeur différente de ' + f(attendu),
            'Attendu : ' + f(attendu) + '\nReçu : ' + f(recu));
        },
        toStrictEqual: function (attendu) { m.toEqual(attendu); },
        toContain: function (attendu) {
          var ok = typeof recu === 'string'
            ? recu.indexOf(attendu) >= 0
            : Array.isArray(recu) && recu.some(function (x) { return egal(x, attendu); });
          verifier(ok,
            f(recu) + ' ne devrait pas contenir ' + f(attendu),
            f(recu) + ' devrait contenir ' + f(attendu));
        },
        toMatch: function (motif) {
          var re = motif instanceof RegExp ? motif : new RegExp(String(motif).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
          verifier(re.test(String(recu)),
            f(recu) + ' ne devrait pas correspondre à ' + re,
            f(recu) + ' devrait correspondre à ' + re);
        },
        toHaveLength: function (n) {
          var l = recu == null ? undefined : recu.length;
          verifier(l === n,
            'La longueur ne devrait pas être ' + n,
            'Longueur attendue : ' + n + '\nLongueur reçue : ' + l);
        },
        toBeTruthy: function () { verifier(!!recu, f(recu) + ' devrait être « faux »', f(recu) + ' devrait être « vrai » (truthy)'); },
        toBeFalsy: function () { verifier(!recu, f(recu) + ' devrait être « vrai »', f(recu) + ' devrait être « faux » (falsy)'); },
        toBeNull: function () { verifier(recu === null, 'Ne devrait pas être null', 'Attendu : null\nReçu : ' + f(recu)); },
        toBeUndefined: function () { verifier(recu === undefined, 'Ne devrait pas être undefined', 'Attendu : undefined\nReçu : ' + f(recu)); },
        toBeDefined: function () { verifier(recu !== undefined, 'Devrait être undefined', 'La valeur est undefined'); },
        toBeGreaterThan: function (n) { verifier(recu > n, f(recu) + ' ne devrait pas être > ' + n, f(recu) + ' devrait être > ' + n); },
        toBeGreaterThanOrEqual: function (n) { verifier(recu >= n, f(recu) + ' ne devrait pas être ≥ ' + n, f(recu) + ' devrait être ≥ ' + n); },
        toBeLessThan: function (n) { verifier(recu < n, f(recu) + ' ne devrait pas être < ' + n, f(recu) + ' devrait être < ' + n); },
        toBeLessThanOrEqual: function (n) { verifier(recu <= n, f(recu) + ' ne devrait pas être ≤ ' + n, f(recu) + ' devrait être ≤ ' + n); },
        toBeCloseTo: function (n, chiffres) {
          var p = Math.pow(10, -(chiffres === undefined ? 2 : chiffres)) / 2;
          verifier(Math.abs(recu - n) < p, f(recu) + ' ne devrait pas être proche de ' + n, f(recu) + ' devrait être proche de ' + n);
        },
        toBeInstanceOf: function (C) { verifier(recu instanceof C, 'Ne devrait pas être une instance de ' + C.name, 'Devrait être une instance de ' + (C && C.name)); },
        toBeTypeOf: function (type) { verifier(typeof recu === type, 'Ne devrait pas être de type ' + type, 'Type attendu : ' + type + '\nType reçu : ' + typeof recu); },
        toThrow: function (attendu) {
          if (typeof recu !== 'function') throw new Error('toThrow() attend une fonction : expect(() => …).toThrow()');
          var leve = false, erreur;
          try { recu(); } catch (e) { leve = true; erreur = e; }
          var ok = leve && (attendu === undefined || (attendu instanceof RegExp ? attendu.test(erreur && erreur.message) : String(erreur && erreur.message).indexOf(attendu) >= 0));
          verifier(ok, 'La fonction ne devrait pas lever d\'erreur', leve
            ? 'Erreur levée : ' + f(erreur && erreur.message) + '\nAttendu : ' + f(attendu)
            : 'La fonction devait lever une erreur, mais rien n\'a été levé');
        },
        toHaveBeenCalled: function () {
          if (!estMock(recu)) throw new Error('toHaveBeenCalled() attend une fonction créée avec t.fn()');
          verifier(recu.mock.calls.length > 0, 'La fonction n\'aurait pas dû être appelée', 'La fonction n\'a jamais été appelée');
        },
        toHaveBeenCalledTimes: function (n) {
          if (!estMock(recu)) throw new Error('toHaveBeenCalledTimes() attend une fonction créée avec t.fn()');
          verifier(recu.mock.calls.length === n, 'Ne devrait pas être appelée ' + n + ' fois',
            'Nombre d\'appels attendu : ' + n + '\nNombre d\'appels reçu : ' + recu.mock.calls.length);
        },
        toHaveBeenCalledWith: function () {
          if (!estMock(recu)) throw new Error('toHaveBeenCalledWith() attend une fonction créée avec t.fn()');
          var args = Array.prototype.slice.call(arguments);
          var ok = recu.mock.calls.some(function (c) { return egal(c, args); });
          verifier(ok, 'Ne devrait pas être appelée avec ' + f(args),
            'Appel attendu avec : ' + f(args) + '\nAppels reçus : ' + f(recu.mock.calls));
        }
      };
      return m;
    }
    var api = creer(false);
    api.not = creer(true);
    return api;
  }

  function fn(implementation) {
    var mock = function () {
      var args = Array.prototype.slice.call(arguments);
      mock.mock.calls.push(args);
      mock.calls = mock.mock.calls;
      var r = implementation ? implementation.apply(this, args) : mock._retour;
      mock.mock.results.push(r);
      return r;
    };
    mock._estMock = true;
    mock.mock = { calls: [], results: [] };
    mock.calls = mock.mock.calls;
    mock.mockReturnValue = function (v) { mock._retour = v; return mock; };
    mock.mockImplementation = function (i) { implementation = i; return mock; };
    return mock;
  }

  /* ------------------------------------------------------------------ */
  /* fetch simulé                                                        */
  /* ------------------------------------------------------------------ */

  var fetchOriginal = window.fetch ? window.fetch.bind(window) : null;

  function reponse(corps, statut, entetes) {
    var texte = typeof corps === 'string' ? corps : JSON.stringify(corps);
    return new Response(texte, {
      status: statut || 200,
      headers: Object.assign({ 'Content-Type': typeof corps === 'string' ? 'text/plain' : 'application/json' }, entetes || {})
    });
  }

  function mockFetch(gestionnaire) {
    var appels = [];
    window.fetch = function (entree, init) {
      init = init || {};
      var url = typeof entree === 'string' ? entree : (entree && entree.url) || String(entree);
      var corps = init.body;
      var json;
      if (typeof corps === 'string') { try { json = JSON.parse(corps); } catch (e) { json = undefined; } }
      appels.push({ url: url, method: (init.method || 'GET').toUpperCase(), options: init, body: corps, json: json });
      return Promise.resolve().then(function () {
        if (typeof gestionnaire === 'function') return gestionnaire(url, init);
        var cles = Object.keys(gestionnaire || {}).sort(function (a, b) { return b.length - a.length; });
        for (var i = 0; i < cles.length; i++) if (url.indexOf(cles[i]) >= 0) return gestionnaire[cles[i]];
        return reponse({ message: 'Introuvable : ' + url }, 404);
      }).then(function (r) {
        return r instanceof Response ? r : reponse(r === undefined ? null : r);
      });
    };
    return appels;
  }

  /* ------------------------------------------------------------------ */
  /* Exécution des tests                                                 */
  /* ------------------------------------------------------------------ */

  function fabriquerTest(source) {
    var s = String(source).trim();
    s = s.replace(/^(async\s+)?run\s*\(/, function (m, a) { return (a || '') + 'function run('; });
    // eslint-disable-next-line no-eval
    return (0, eval)('(' + s + ')');
  }

  function attendre(condition, options) {
    options = options || {};
    var limite = Date.now() + (options.timeout || 1500);
    var intervalle = options.interval || 20;
    var derniere;
    function essai() {
      try {
        var r = condition();
        if (r !== false) return Promise.resolve(r);
      } catch (e) {
        derniere = e;
      }
      if (Date.now() > limite) {
        return Promise.reject(derniere || new Error('La condition n\'est jamais devenue vraie.'));
      }
      return attendrePendant(intervalle).then(essai);
    }
    return Promise.resolve().then(essai);
  }

  function lancerTests(compile, tests) {
    var resultats = [];
    return tests.reduce(function (promesse, test) {
      return promesse.then(function () {
        var debutJournal = journal.length;
        var debut = performance.now();
        reinitialiserNuxt();
        if (fetchOriginal) window.fetch = fetchOriginal;
        var execution = Promise.resolve().then(function () {
          var exportsModule = executerModule(compile);
          var t = {
            module: exportsModule,
            expect: expect,
            fn: fn,
            tick: tick,
            pause: attendrePendant,
            wait: attendre,
            attendre: attendre,
            mockFetch: mockFetch,
            reponse: reponse,
            document: document,
            window: window,
            nuxt: nuxt,
            get logs() { return journal.slice(debutJournal).map(function (l) { return l.texte; }); },
            get journal() { return journal.slice(debutJournal); },
            mount: function (props, options) {
              var C = exportsModule && exportsModule.default;
              if (options && options.composant) C = options.composant;
              return KIND === 'react' ? monterReact(C, props, options, false) : monterVue(C, props, options, false);
            },
            render: function (props, options) { return t.mount(props, options); }
          };
          var testFn = fabriquerTest(test.src);
          return testFn(t);
        });
        var delai = new Promise(function (resolve, reject) {
          setTimeout(function () { reject(new Error('Délai dépassé (' + TIMEOUT_TEST / 1000 + ' s). Une promesse ne se termine jamais ?')); }, TIMEOUT_TEST);
        });
        return Promise.race([execution, delai]).then(function () {
          return { ok: true };
        }, function (e) {
          return { ok: false, message: e && e.message ? e.message : String(e) };
        }).then(function (r) {
          return demonterTout().then(function () {
            resultats.push({
              nom: test.nom,
              ok: r.ok,
              message: r.message || '',
              aide: test.aide || '',
              duree: Math.round(performance.now() - debut),
              logs: journal.slice(debutJournal)
            });
          });
        });
      });
    }, Promise.resolve()).then(function () {
      if (fetchOriginal) window.fetch = fetchOriginal;
      return resultats;
    });
  }

  function apercu(compile) {
    var exportsModule = executerModule(compile);
    var C = exportsModule && exportsModule.default;
    if (KIND === 'js') {
      var app = document.getElementById('app');
      app.innerHTML = '<span class="chargement">Le code a été exécuté. Regarde la console ci-dessous.</span>';
      return Promise.resolve();
    }
    if (!C) {
      document.getElementById('app').innerHTML = '<span class="chargement">Rien à afficher : ajoute un <code>export default</code>.</span>';
      return Promise.resolve();
    }
    return KIND === 'react' ? monterReact(C, {}, {}, true) : monterVue(C, {}, {}, true);
  }

  function executer(message) {
    return pret.then(function () {
      journal.length = 0;
      var compile;
      try {
        compile = compiler(message.code || '');
      } catch (e) {
        return { erreurCompilation: e.message || String(e), resultats: [], logs: [] };
      }
      injecterCss(compile.css);
      if (message.mode === 'tests') {
        return lancerTests(compile, message.tests || []).then(function (resultats) {
          return { resultats: resultats, logs: journal.slice() };
        });
      }
      return apercu(compile).then(function () {
        signalerHauteur();
        return { ok: true, logs: journal.slice() };
      }, function (e) {
        journaliser('error', [e && e.message ? e.message : e]);
        return { erreurExecution: e && e.message ? e.message : String(e), logs: journal.slice() };
      });
    }, function (e) {
      return { erreurChargement: e.message || String(e), resultats: [], logs: [] };
    }).catch(function (e) {
      return { erreurExecution: e && e.message ? e.message : String(e), resultats: [], logs: journal.slice() };
    });
  }

  window.addEventListener('message', function (e) {
    var m = e.data;
    if (!m || m.type !== 'executer') return;
    executer(m).then(function (resultat) {
      envoyer(Object.assign({ type: 'resultat', id: m.id }, resultat));
    });
  });

  // Accès direct (utilisé par scripts/verifier-exercices.mjs).
  window.__devschool = { executer: executer, pret: pret };

  pret.then(function () {
    var app = document.getElementById('app');
    if (app) app.innerHTML = '';
    envoyer({ type: 'pret' });
  }, function (e) {
    var app = document.getElementById('app');
    if (app) app.textContent = e.message;
    envoyer({ type: 'pret', erreur: e.message });
  });
})();
