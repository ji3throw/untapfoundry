/* Untap Foundry: the shared header and footer, the card pop-up, the home page and the deck pages. */
(function () {
  'use strict';

  var ROOT = document.body.getAttribute('data-root') || './';
  var PAGE = document.body.getAttribute('data-page') || '';
  var INSTAGRAM = 'https://www.instagram.com/untapfoundry/';
  var MAIL = ['untapfoundry', 'gmail.com'];
  var WATERMARK = '@untapfoundry';
  var COLOUR_NAMES = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green', C: 'Colourless' };

  /* ---------- small helpers ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T12:00:00Z');
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function today() {
    try { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  var ICON = {
    logo: '<svg class="logo" viewBox="60 84 384 358" aria-hidden="true"><path d="M72 292 C118 282 156 278 190 278 L432 278 L432 322 L398 322 C372 326 352 340 344 362 L344 382 L384 412 L384 430 L160 430 L160 412 L200 382 L200 362 C192 342 176 330 156 326 C124 320 94 310 72 292 Z" fill="currentColor"/><g transform="rotate(45 272 186)"><rect x="220" y="113" width="104" height="146" rx="10" fill="var(--accent)"/><rect x="231" y="124" width="82" height="124" rx="5" fill="none" stroke="#121214" stroke-opacity=".28" stroke-width="5"/></g><g stroke="var(--accent)" stroke-width="13" stroke-linecap="round" fill="none"><path d="M192 119 L166 97"/><path d="M170 168 L136 162"/><path d="M374 168 L408 162"/><path d="M352 119 L378 97"/></g></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg>'
  };

  /* ---------- theme ---------- */
  function getTheme() { try { return localStorage.getItem('uf-theme') || 'dark'; } catch (e) { return 'dark'; } }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('uf-theme', t); } catch (e) { /* private mode */ }
    var b = $('.theme-btn');
    if (b) { b.innerHTML = t === 'dark' ? ICON.sun : ICON.moon; b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); }
  }

  /* ---------- header and footer ---------- */
  var SMALL_SERIES = 5;   // a series this size or smaller is shown on the Series & one-offs page, not on a page of its own
  function pageOf(d) {
    if (d.kind === 'series') return d.count <= SMALL_SERIES ? ROOT + 'collections/#' + d.id : ROOT + 'series/' + d.id + '/';
    return ROOT + 'decks/' + d.id + '/';
  }
  var CURRENT = document.body.getAttribute('data-deck') || '';

  function header() {
    var nav = el('nav', { class: 'nav', id: 'nav', 'aria-label': 'Main' });
    // Decks: a menu filled in once the data is loaded, so every new deck shows up by itself
    var panel = el('div', { class: 'menu-panel', id: 'deck-menu', hidden: true }, [
      el('div', { class: 'menu-list', id: 'deck-menu-list' }, [el('span', { class: 'muted', text: 'Loading…' })]),
      el('a', { class: 'menu-all', href: ROOT + 'decks/', text: 'All decks →' })
    ]);
    var toggle = el('button', { class: 'menu-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'deck-menu',
      'aria-current': PAGE === 'decks' || (PAGE === 'collection' && document.body.getAttribute('data-kind') === 'deck') ? 'page' : null,
      html: 'Decks <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>' });
    function setOpen(o) { panel.hidden = !o; toggle.setAttribute('aria-expanded', o ? 'true' : 'false'); }
    toggle.addEventListener('click', function (e) { e.stopPropagation(); setOpen(panel.hidden); });
    document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); } });
    nav.appendChild(el('div', { class: 'menu' }, [toggle, panel]));
    nav.appendChild(el('a', { href: ROOT + 'collections/', text: 'Series & one-offs',
      'aria-current': PAGE === 'collections' || document.body.getAttribute('data-kind') === 'series' ? 'page' : null }));
    nav.appendChild(el('a', { href: ROOT + 'cards/', text: 'All cards', 'aria-current': PAGE === 'cards' ? 'page' : null }));
    nav.appendChild(el('a', { href: ROOT + 'about/', text: 'About', 'aria-current': PAGE === 'about' ? 'page' : null }));
    nav.appendChild(el('span', { class: 'icon-row' }, [
      el('a', { class: 'icon-btn', href: INSTAGRAM, target: '_blank', rel: 'noopener', 'aria-label': 'Instagram', html: ICON.insta }),
      el('button', { class: 'icon-btn theme-btn', type: 'button', onclick: function () { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); } })
    ]));
    var menu = el('button', { class: 'icon-btn menu-btn', type: 'button', 'aria-label': 'Menu', 'aria-expanded': 'false', 'aria-controls': 'nav', html: ICON.menu,
      onclick: function () { var o = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', o ? 'true' : 'false'); } });
    var h = el('header', { class: 'site-head' }, [el('div', { class: 'wrap' }, [
      el('a', { class: 'wordmark', href: ROOT, html: ICON.logo + '<span>Untap <b>Foundry</b></span>' }), menu, nav
    ])]);
    document.body.insertBefore(h, document.body.firstChild);
    setTheme(getTheme());
  }

  function fillMenu(data) {
    var list = $('#deck-menu-list');
    if (!list) return;
    var decks = data.decks.filter(function (d) { return d.kind === 'deck'; })
      .sort(function (a, b) { return a.updated < b.updated ? 1 : -1; });
    list.replaceChildren.apply(list, decks.map(function (d) {
      var cmd = commanderOf(data, d.id), info = data.content.decks[d.id] || {};
      return el('a', { class: 'menu-item', href: pageOf(d), 'aria-current': d.id === CURRENT ? 'page' : null }, [
        el('span', { class: 'mtg mini' }, [el('img', { src: ROOT + cmd.img + '-400.jpg', alt: '', loading: 'lazy', draggable: 'false' })]),
        el('span', null, [el('b', { text: d.title }), el('small', null, [pips(colsOf(data, d.id, info)), ' ' + (info.tagline || '') + (d.finished ? '' : ' · in progress')])])
      ]);
    }));
  }

  function emailButton() {
    var b = el('button', { class: 'email-btn', type: 'button', text: 'Show email address' });
    b.addEventListener('click', function () {
      var a = MAIL.join('@');
      b.replaceWith(el('a', { href: 'mailto:' + a, text: a }));
    });
    return b;
  }

  function footer() {
    var f = el('footer', { class: 'site-foot' }, [el('div', { class: 'wrap' }, [
      el('div', null, [
        el('h4', { text: 'Untap Foundry' }),
        el('p', { class: 'fcp', text: 'Untap Foundry is unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards of the Coast LLC.' }),
        el('p', { class: 'fcp', html: 'Card frames and designs © Untap Foundry. These are not official Magic cards and are not for sale. <a href="' + ROOT + 'legal/">Legal and credits</a>' })
      ]),
      el('div', null, [
        el('h4', { text: 'Explore' }),
        el('ul', null, [
          el('li', null, [el('a', { href: ROOT + 'cards/', text: 'All cards' })]),
          el('li', null, [el('a', { href: ROOT + 'decks/', text: 'All decks' })]),
          el('li', null, [el('a', { href: ROOT + 'collections/', text: 'Series & one-offs' })]),
          el('li', null, [el('a', { href: ROOT + 'about/', text: 'About' })]),
          el('li', null, [el('a', { href: ROOT + 'legal/', text: 'Legal and credits' })])
        ])
      ]),
      el('div', null, [
        el('h4', { text: 'Contact' }),
        el('ul', null, [
          el('li', null, [el('a', { href: INSTAGRAM, target: '_blank', rel: 'noopener', text: 'Instagram @untapfoundry' })]),
          el('li', null, [emailButton()]),
          el('li', { class: 'fcp', text: 'The address is hidden behind a button to keep spam bots away.' })
        ])
      ])
    ])]);
    document.body.appendChild(f);
  }

  /* ---------- keep the pictures in the page ---------- */
  function guard() {
    function blocked(t) { return t && t.closest && t.closest('.mtg, .viewer-art, .insta, canvas'); }
    ['contextmenu', 'dragstart', 'selectstart'].forEach(function (ev) {
      document.addEventListener(ev, function (e) { if (blocked(e.target)) e.preventDefault(); });
    });
  }

  /* ---------- data ---------- */
  function load() {
    return Promise.all([
      fetch(ROOT + 'data/cards.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
      fetch(ROOT + 'data/content.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
    ]).then(function (res) {
      var data = res[0];
      data.content = res[1];
      data.byId = {};
      data.cards.forEach(function (c, i) { c.order = i; data.byId[c.id] = c; });
      data.deck = {};
      data.decks.forEach(function (d) {
        data.deck[d.id] = d;
        d.count = data.cards.filter(function (c) { return c.deck === d.id; }).length;
      });
      return data;
    });
  }
  function frameName(data, code) { var f = data.content.frames[code]; return f ? f.name : code.charAt(0) + code.slice(1).toLowerCase(); }
  function versionsOf(data, c) {
    return data.cards.filter(function (x) { return x.deck === c.deck && x.card === c.card; });
  }
  function vtag(c) { return c.version && c.version.toUpperCase() !== c.frame ? ' · ' + c.version : ''; }
  function versionLabel(c, all) {
    if (c.version && c.version.toUpperCase() === c.frame) return frameName({ content: { frames: {} } }, c.frame);
    if (c.version) return c.version.charAt(0).toUpperCase() + c.version.slice(1);
    if (all.length > 1 && all.every(function (x) { return !x.version; })) return '#' + (all.indexOf(c) + 1);
    return 'Standard';
  }

  /* ---------- a card tile ---------- */
  function cardButton(c, onOpen, opts) {
    opts = opts || {};
    var b = el('button', { class: 'mtg', type: 'button', 'aria-label': 'Open ' + c.name + (c.version ? ' (' + c.version + ')' : '') }, [
      el('img', { src: ROOT + c.img + '-400.jpg', alt: c.name, loading: opts.eager ? 'eager' : 'lazy', decoding: 'async', width: 400, height: 559, draggable: 'false' })
    ]);
    b.addEventListener('click', onOpen);
    return b;
  }
  function tile(data, c, list, i, caption) {
    return el('figure', { class: 'tile' }, [
      cardButton(c, function () { viewer.open(data, list, i); }),
      caption === false ? null : el('figcaption', null, [el('b', { text: c.name }), caption || (frameName(data, c.frame) + vtag(c))])
    ]);
  }

  /* ---------- tilt ---------- */
  function tilt(wrapper) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var card = wrapper.querySelector('.mtg');
    if (!card) return;
    if (!card.querySelector('.sheen')) card.appendChild(el('span', { class: 'sheen' }));
    wrapper.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = 'rotateY(' + ((x - .5) * 12).toFixed(2) + 'deg) rotateX(' + ((.5 - y) * 12).toFixed(2) + 'deg)';
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    wrapper.addEventListener('pointerleave', function () { card.style.transform = ''; });
  }

  /* ---------- the pop-up ---------- */
  var viewer = (function () {
    var dlg, art, info, list, idx, data, token = 0;

    function build() {
      dlg = el('dialog', { class: 'viewer', 'aria-label': 'Card' });
      art = el('div', { class: 'viewer-art' });
      info = el('div', { class: 'viewer-info' });
      dlg.appendChild(el('button', { class: 'icon-btn viewer-close', type: 'button', 'aria-label': 'Close', html: ICON.close, onclick: close }));
      dlg.appendChild(el('button', { class: 'icon-btn viewer-nav prev', type: 'button', 'aria-label': 'Previous card', html: ICON.prev, onclick: function () { step(-1); } }));
      dlg.appendChild(el('button', { class: 'icon-btn viewer-nav next', type: 'button', 'aria-label': 'Next card', html: ICON.next, onclick: function () { step(1); } }));
      dlg.appendChild(el('div', { class: 'viewer-body' }, [art, info]));
      dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
      dlg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
      });
      var sx = null;
      art.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      art.addEventListener('touchend', function (e) {
        if (sx == null) return;
        var dx = e.changedTouches[0].clientX - sx; sx = null;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      });
      document.body.appendChild(dlg);
    }
    function close() { dlg.close(); }
    function step(d) {
      if (!list || list.length < 2) return;
      idx = (idx + d + list.length) % list.length;
      show(list[idx]);
    }

    function draw(canvas, img) {
      var w = img.naturalWidth, h = img.naturalHeight;
      canvas.width = w; canvas.height = h;
      var g = canvas.getContext('2d');
      g.drawImage(img, 0, 0, w, h);
      // tiled watermark, about 19% strong
      g.save();
      g.translate(w / 2, h / 2);
      g.rotate(-Math.PI / 6);
      var size = Math.round(w * 0.042);
      g.font = '500 ' + size + 'px Jost, system-ui, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      var stepX = size * 9.5, stepY = size * 3.6, reach = Math.hypot(w, h);
      for (var y = -reach / 2, row = 0; y < reach / 2; y += stepY, row++) {
        for (var x = -reach / 2 + (row % 2 ? stepX / 2 : 0); x < reach / 2; x += stepX) {
          g.fillStyle = 'rgba(0,0,0,0.10)';
          g.fillText(WATERMARK, x + 1.5, y + 1.5);
          g.fillStyle = 'rgba(255,255,255,0.19)';
          g.fillText(WATERMARK, x, y);
        }
      }
      g.restore();
    }

    function show(c) {
      var my = ++token;
      var all = versionsOf(data, c);
      var d = data.deck[c.deck];
      var wrap = el('div', { class: 'tilt' });
      var card = el('div', { class: 'mtg' });
      var canvas = el('canvas', { width: 800, height: 1118, role: 'img', 'aria-label': c.name });
      card.appendChild(canvas);
      wrap.appendChild(card);
      art.replaceChildren(wrap);
      tilt(wrap);
      var img = new Image();
      img.onload = function () { if (my === token) draw(canvas, img); };
      img.src = ROOT + c.img + '-800.jpg';

      var kids = [];
      if (d) kids.push(el('p', { class: 'eyebrow' }, [el('a', { href: pageOf(d), text: d.title + (d.kind === 'deck' ? ' deck' : d.kind === 'series' ? ' series' : ''), style: 'text-decoration:none' })]));
      kids.push(el('h2', { text: c.name }));
      kids.push(el('div', { class: 'type', text: c.type }));
      if (all.length > 1) {
        kids.push(el('div', { class: 'versions', role: 'group', 'aria-label': 'Versions' }, all.map(function (v) {
          return el('button', { type: 'button', text: versionLabel(v, all), 'aria-current': v === c ? 'true' : 'false',
            onclick: function () { var j = list.indexOf(v); if (j >= 0) idx = j; show(v); } });
        })));
      }
      if (c.flavour) kids.push(el('blockquote', { text: c.flavour }));
      var dl = el('dl');
      function row(k, v) { if (v) { dl.appendChild(el('dt', { text: k })); dl.appendChild(el('dd', null, [v])); } }
      var fr = data.content.frames[c.frame];
      row('Frame', frameName(data, c.frame) + (fr && fr.retired ? ' (early frame)' : ''));
      row('Art', c.art);
      row('Colours', el('span', { class: 'pips' }, c.colours.map(function (k) { return el('span', { class: 'pip ' + k, title: COLOUR_NAMES[k] }); })));
      if (c.added) row('Made', fmtDate(c.added));
      kids.push(dl);
      if (fr && fr.text && !fr.retired) kids.push(el('p', { class: 'muted', style: 'font-size:14px', text: fr.text }));
      kids.push(el('p', null, [el('a', { class: 'btn', href: c.scryfall, target: '_blank', rel: 'noopener', text: 'See the official card on Scryfall' })]));
      kids.push(el('p', { class: 'small' }, ['Want a full-size copy, or have a question about this card? Email me: ', emailButton()]));
      info.replaceChildren.apply(info, kids);
      info.scrollTop = 0;
      var many = list && list.length > 1;
      $('.viewer-nav.prev', dlg).hidden = !many;
      $('.viewer-nav.next', dlg).hidden = !many;
    }

    return {
      open: function (d, l, i) {
        if (!dlg) build();
        data = d; list = l; idx = i;
        show(list[idx]);
        if (!dlg.open) dlg.showModal();
      }
    };
  })();

  /* ---------- home ---------- */
  function cardOfTheDay(data) {
    var pool = data.cards.filter(function (c) {
      return data.deck[c.deck] && data.deck[c.deck].finished && !/Basic/.test(c.type) && !/back/i.test(c.version);
    }).sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    return pool.length ? pool[hash(today()) % pool.length] : null;
  }
  function latest(data, n) {
    return data.cards.filter(function (c) { return c.added && !/back/i.test(c.version); })
      .sort(function (a, b) { return a.added === b.added ? b.order - a.order : (a.added < b.added ? 1 : -1); })
      .slice(0, n);
  }
  function commanderOf(data, id) {
    return data.cards.filter(function (c) { return c.deck === id && c.commander; })[0] ||
      data.cards.filter(function (c) { return c.deck === id; })[0];
  }
  function colsOf(data, id, info) {
    if (info && info.colours) return info.colours;
    var seen = {};
    data.cards.forEach(function (c) { if (c.deck === id) c.colours.forEach(function (k) { seen[k] = 1; }); });
    return ['W', 'U', 'B', 'R', 'G', 'C'].filter(function (k) { return seen[k] && (k !== 'C' || Object.keys(seen).length === 1); });
  }
  function pips(cols) { return el('span', { class: 'pips' }, cols.map(function (k) { return el('span', { class: 'pip ' + k, title: COLOUR_NAMES[k] }); })); }

  function deckTiles(data, decks) {
    return el('div', { class: 'decks' }, decks.map(function (d) {
      var cmd = commanderOf(data, d.id), info = data.content.decks[d.id] || {};
      return el('a', { class: 'deck-tile', href: pageOf(d) }, [
        el('div', { class: 'mtg' }, [el('img', { src: ROOT + cmd.img + '-400.jpg', alt: '', loading: 'lazy', draggable: 'false' })]),
        el('div', null, [
          el('h3', { text: d.title }),
          el('p', { text: info.tagline || '' }),
          el('p', { style: 'margin-top:8px' }, [pips(colsOf(data, d.id, info)), '  ' + d.made + ' cards' + (d.updated ? ' · updated ' + fmtDate(d.updated) : '')]),
          d.finished || (d.kind && d.kind !== 'deck') ? null : el('span', { class: 'badge', text: 'In progress' })
        ])
      ]);
    }));
  }

  function newest(data, kind) {
    return data.decks.filter(function (d) { return (d.kind || 'deck') === kind; })
      .sort(function (a, b) { return a.updated === b.updated ? 0 : (a.updated < b.updated ? 1 : -1); });
  }
  function singlesOf(data) {
    var ids = {};
    data.decks.forEach(function (d) { if (d.kind === 'singles') ids[d.id] = 1; });
    return data.cards.filter(function (c) { return ids[c.deck] && !/back/i.test(c.version); })
      .sort(function (a, b) { return a.added === b.added ? b.order - a.order : (a.added < b.added ? 1 : -1); });
  }

  /* ---------- all decks ---------- */
  function decksPage(data) {
    var decks = newest(data, 'deck');
    var list = $('#deck-list');
    var search = el('input', { type: 'search', placeholder: 'Search decks', 'aria-label': 'Search decks' });
    var count = el('span', { class: 'count', 'aria-live': 'polite' });
    $('#deck-filters').replaceChildren(search, count);
    function render() {
      var q = search.value.trim().toLowerCase();
      var shown = decks.filter(function (d) {
        var info = data.content.decks[d.id] || {};
        return !q || (d.title + ' ' + (info.tagline || '')).toLowerCase().indexOf(q) >= 0;
      });
      count.textContent = shown.length + (shown.length === 1 ? ' deck' : ' decks');
      list.replaceChildren(shown.length ? deckTiles(data, shown) : el('p', { class: 'empty', text: 'No decks match.' }));
    }
    search.addEventListener('input', render);
    render();
  }

  /* ---------- series and one-offs ---------- */
  function collectionsPage(data) {
    var series = newest(data, 'series'), singles = singlesOf(data);
    var sl = $('#series-list'), sg = $('#singles');
    var big = series.filter(function (d) { return d.count > SMALL_SERIES; });
    var small = series.filter(function (d) { return d.count <= SMALL_SERIES; });
    var kids = [];
    if (big.length) kids.push(deckTiles(data, big));
    small.forEach(function (d) {
      var info = data.content.decks[d.id] || {};
      var cards = data.cards.filter(function (c) { return c.deck === d.id && !/back/i.test(c.version); });
      kids.push(el('div', { class: 'series-inline', id: d.id }, [
        el('div', { class: 'series-text' }, [
          el('h3', { text: d.title }),
          el('p', { class: 'lede', text: info.tagline || '' })
        ].concat((info.intro || []).map(function (t) { return el('p', { text: t }); }))),
        el('div', { class: 'grid' }, cards.map(function (c, i) { return tile(data, c, cards, i, frameName(data, c.frame) + vtag(c)); }))
      ]));
    });
    if (kids.length) sl.replaceChildren.apply(sl, kids);
    else sl.replaceChildren(el('p', { class: 'muted', text: 'The first series is on its way.' }));
    if (location.hash) { var t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    if (singles.length) {
      sg.replaceChildren.apply(sg, singles.map(function (x, i) { return tile(data, x, singles, i, frameName(data, x.frame)); }));
    } else {
      sg.replaceChildren(el('p', { class: 'muted', style: 'grid-column:1/-1', text: 'No one-off cards yet. They will appear here as they are made.' }));
    }
  }

  function home(data) {
    var c = cardOfTheDay(data);
    var slot = $('#cotd');
    if (c && slot) {
      var list = [c];
      var w = el('div', { class: 'tilt' }, [cardButton(c, function () { viewer.open(data, list, 0); }, { eager: true })]);
      slot.replaceChildren(
        el('div', { class: 'label', text: 'Card of the day' }), w,
        el('div', { class: 'meta' }, [el('b', { text: c.name }), ' · ' + data.deck[c.deck].title])
      );
      tilt(w);
    }

    var lt = latest(data, 10), row = $('#latest');
    if (row) row.replaceChildren.apply(row, lt.map(function (x, i) {
      return tile(data, x, lt, i, data.deck[x.deck].title + (x.added ? ' · ' + fmtDate(x.added) : ''));
    }));

    var decks = newest(data, 'deck');
    var dt = $('#decks');
    if (dt) dt.replaceChildren(deckTiles(data, decks.slice(0, 3)));

    // series and one-offs, once there are any
    var series = newest(data, 'series'), singles = singlesOf(data);
    var sec = $('#extras-section');
    if (sec && (series.length || singles.length)) {
      sec.hidden = false;
      var box = $('#extras');
      var kids = [];
      if (series.length) kids.push(deckTiles(data, series.slice(0, 3)));
      if (singles.length) {
        var sl = singles.slice(0, 8);
        kids.push(el('div', { class: 'row', style: 'margin-top:24px' }, sl.map(function (x, i) { return tile(data, x, sl, i, frameName(data, x.frame)); })));
      }
      box.replaceChildren.apply(box, kids);
    }

    // one card per frame: the frames of the finished decks and the occult deck's current set
    var fl = [], seen = {};
    data.decks.forEach(function (d) {
      ((data.content.decks[d.id] || {}).frames || []).forEach(function (code) {
        if (seen[code]) return;
        var pick = data.cards.filter(function (x) { return x.deck === d.id && x.frame === code && !/back/i.test(x.version); });
        if (!pick.length) return;
        seen[code] = 1;
        fl.push({ code: code, deck: d, card: pick[hash(code + today().slice(0, 7)) % pick.length] });
      });
    });
    var frames = $('#frames'), fcards = fl.map(function (f) { return f.card; });
    if (frames) frames.replaceChildren.apply(frames, fl.map(function (f, i) {
      var fr = data.content.frames[f.code] || {};
      return el('div', { class: 'frame-card' }, [
        cardButton(f.card, function () { viewer.open(data, fcards, i); }),
        el('div', null, [el('span', { class: 'deckname', text: f.deck.title }), el('h3', { text: fr.name || f.code }), el('p', { text: fr.text || '' })])
      ]);
    }));

    var ig = $('#insta');
    if (ig) {
      var posts = (data.insta || []).slice(0, 8);
      if (posts.length) {
        ig.replaceChildren.apply(ig, posts.map(function (p) {
          return el('a', { href: INSTAGRAM, target: '_blank', rel: 'noopener', 'aria-label': p.name + ' on Instagram' }, [el('img', { src: ROOT + p.img, alt: p.name, loading: 'lazy', draggable: 'false' })]);
        }));
      } else {
        ig.replaceChildren.apply(ig, latest(data, 4).map(function (x) {
          return el('a', { class: 'card-post', href: INSTAGRAM, target: '_blank', rel: 'noopener', 'aria-label': x.name + ' on Instagram' }, [el('img', { src: ROOT + x.img + '-400.jpg', alt: x.name, loading: 'lazy', draggable: 'false' })]);
        }));
      }
    }
  }

  /* ---------- deck page ---------- */
  function deckPage(data) {
    var id = document.body.getAttribute('data-deck');
    var d = data.deck[id], info = data.content.decks[id] || {};
    if (!d) return;
    document.title = d.title + ' · Untap Foundry';
    var cmd = commanderOf(data, id);
    var mine = data.cards.filter(function (c) { return c.deck === id; });
    var isDeck = (d.kind || 'deck') === 'deck';

    var hero = $('#deck-hero');
    var w = el('div', { class: 'tilt' }, [cardButton(cmd, function () { viewer.open(data, [cmd], 0); }, { eager: true })]);
    var frameCodes = {};
    mine.forEach(function (c) { frameCodes[c.frame] = 1; });
    hero.replaceChildren(w, el('div', null, [
      el('p', { class: 'eyebrow', text: (isDeck ? 'Commander deck' : 'Series') + (d.finished || !isDeck ? '' : ' · in progress') }),
      el('h1', { text: d.title }),
      el('p', { class: 'lede', text: info.tagline || '' })
    ].concat((info.intro || []).map(function (p) { return el('p', { text: p }); })).concat([
      el('ul', { class: 'stats' }, [
        el('li', null, [el('b', { text: String(d.made) }), d.finished || !isDeck || !d.size ? 'cards' : 'of ' + d.size + ' cards made']),
        el('li', null, [el('b', { text: String(Object.keys(frameCodes).length) }), 'frames']),
        el('li', null, [el('b', null, [pips(colsOf(data, d.id, info))]), 'colours'])
      ])
    ])));
    tilt(w);

    // the frames and what inspired them
    var fs = $('#deck-frames');
    if (fs) {
      var codes = (info.frames || Object.keys(frameCodes)).filter(function (k) { return frameCodes[k] && data.content.frames[k]; });
      var picks = codes.map(function (k) { return mine.filter(function (c) { return c.frame === k && !/back/i.test(c.version); })[0]; });
      var kids = [el('div', { class: 'section-head' }, [el('div', null, [el('p', { class: 'eyebrow', text: 'Behind the frames' }), el('h2', { text: 'Inspirations' })])])];
      if (info.frames_intro) kids.push(el('p', { class: 'lede', style: 'margin-bottom:28px', text: info.frames_intro }));
      kids.push(el('div', { class: 'frames' }, codes.map(function (k, i) {
        var fr = data.content.frames[k] || {};
        var n = mine.filter(function (c) { return c.frame === k; }).length;
        return el('div', { class: 'frame-card' }, [
          cardButton(picks[i], function () { viewer.open(data, picks, i); }),
          el('div', null, [el('span', { class: 'deckname', text: n + (n === 1 ? ' card' : ' cards') }), el('h3', { text: fr.name || k }), el('p', { text: fr.text || '' })])
        ]);
      })));
      if (codes.length && (isDeck || codes.length > 1)) fs.replaceChildren.apply(fs, kids);
      else fs.closest('section').hidden = true;
    }

    // the grid with its filters
    var state = { q: '', colours: {}, kind: '', frame: '' };
    var search = el('input', { type: 'search', placeholder: 'Search cards', 'aria-label': 'Search cards' });
    var chips = el('div', { class: 'chips', role: 'group', 'aria-label': 'Colour' }, ['W', 'U', 'B', 'R', 'G', 'C'].filter(function (k) {
      return mine.some(function (c) { return c.colours.indexOf(k) >= 0; });
    }).map(function (k) {
      var b = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', 'aria-label': COLOUR_NAMES[k], title: COLOUR_NAMES[k] }, [el('span', { class: 'pip ' + k })]);
      b.addEventListener('click', function () {
        state.colours[k] = !state.colours[k];
        b.setAttribute('aria-pressed', state.colours[k] ? 'true' : 'false');
        render();
      });
      return b;
    }));
    function select(label, values, key) {
      var s = el('select', { 'aria-label': label }, [el('option', { value: '', text: label })].concat(values.map(function (v) { return el('option', { value: v[0], text: v[1] }); })));
      s.addEventListener('change', function () { state[key] = s.value; render(); });
      return s;
    }
    var kinds = ['Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Land'].filter(function (k) { return mine.some(function (c) { return c.kind === k; }); });
    var frames = Object.keys(frameCodes).sort(function (a, b) { return frameName(data, a) < frameName(data, b) ? -1 : 1; });
    var count = el('span', { class: 'count', 'aria-live': 'polite' });
    $('#filters').replaceChildren(search, chips,
      select('All types', kinds.map(function (k) { return [k, k + 's']; }), 'kind'),
      select('All frames', frames.map(function (k) { return [k, frameName(data, k)]; }), 'frame'),
      count);
    search.addEventListener('input', function () { state.q = search.value.trim().toLowerCase(); render(); });

    // sections by card type; extra copies and alternate versions of a card go in their own section at the end.
    // A double-faced card's back stays next to its front: it is the same card, not a copy.
    var order = ['Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Battle', 'Other', 'Land'];
    var PLURAL = { Creature: 'Creatures', Planeswalker: 'Planeswalkers', Instant: 'Instants', Sorcery: 'Sorceries', Artifact: 'Artifacts',
      Enchantment: 'Enchantments', Battle: 'Battles', Other: 'Other cards', Land: 'Lands' };
    function isBack(c) { return /back/i.test(c.version); }
    var byCard = {}, firstOf = {};
    mine.forEach(function (c) { (byCard[c.card] = byCard[c.card] || []).push(c); });
    Object.keys(byCard).forEach(function (k) {
      var faces = byCard[k].filter(function (c) { return !isBack(c); });
      firstOf[k] = faces.filter(function (c) { return !c.version || /front/i.test(c.version); })[0] || faces[0] || byCard[k][0];
    });
    function frontOf(c) { return firstOf[c.card]; }
    function isDuplicate(c) { return !isBack(c) && c !== firstOf[c.card]; }
    function sectionOf(c) {
      if (isDuplicate(c)) return 'dup';
      if (frontOf(c).commander) return 'cmd';
      return frontOf(c).kind || 'Other';
    }
    var sorted = mine.slice().sort(function (a, b) {
      var fa = frontOf(a), fb = frontOf(b);
      var k = order.indexOf(fa.kind) - order.indexOf(fb.kind);
      return k || a.card.localeCompare(b.card) || (isBack(a) - isBack(b)) || a.name.localeCompare(b.name, undefined, { numeric: true }) || a.order - b.order;
    });
    var sections = [['cmd', 'Commander']].concat(order.map(function (k) { return [k, PLURAL[k]]; })).concat([['dup', 'Duplicates']]);
    var g = $('#grid');
    g.classList.remove('grid');
    function render() {
      var on = Object.keys(state.colours).filter(function (k) { return state.colours[k]; });
      var shown = sorted.filter(function (c) {
        if (state.q && (c.name + ' ' + c.card + ' ' + c.type + ' ' + c.art).toLowerCase().indexOf(state.q) < 0) return false;
        if (state.kind && frontOf(c).kind !== state.kind) return false;
        if (state.frame && c.frame !== state.frame) return false;
        if (on.length && !on.every(function (k) { return c.colours.indexOf(k) >= 0; })) return false;
        return true;
      });
      count.textContent = shown.length + ' shown';
      if (!shown.length) { g.replaceChildren(el('p', { class: 'empty', text: 'No cards match these filters.' })); return; }
      var groups = sections.map(function (s) { return { key: s[0], title: s[1], cards: shown.filter(function (c) { return sectionOf(c) === s[0]; }) }; })
        .filter(function (s) { return s.cards.length; });
      var list = [];   // the pop-up steps through the cards in the order they are shown
      groups.forEach(function (s) { list = list.concat(s.cards); });
      g.replaceChildren.apply(g, groups.map(function (s) {
        return el('div', { class: 'type-section' + (s.key === 'dup' ? ' dups' : '') }, [
          el('h3', { class: 'type-head' }, [s.title, el('span', { text: String(s.cards.length) })]),
          s.key === 'dup' ? el('p', { class: 'muted small', text: 'Extra copies and alternate versions of cards shown above.' }) : null,
          el('div', { class: 'grid' }, s.cards.map(function (c) {
            return tile(data, c, list, list.indexOf(c), frameName(data, c.frame) + vtag(c));
          }))
        ]);
      }));
    }
    render();
  }

  /* ---------- all cards: one search across every deck, series and one-off ---------- */
  function cardsPage(data) {
    var PAGE_SIZE = 60;
    var KIND_LABEL = { deck: 'Decks', series: 'Series', singles: 'One-offs' };
    // one tile per card in each collection; its other versions are tabs in the pop-up and count for the search
    var groups = {}, cards = [];
    data.cards.forEach(function (c) {
      var key = c.deck + '|' + c.card;
      if (!groups[key]) { groups[key] = []; }
      groups[key].push(c);
    });
    Object.keys(groups).forEach(function (key) {
      var all = groups[key];
      var face = all.filter(function (c) { return !/back/i.test(c.version); })[0] || all[0];
      var d = data.deck[face.deck] || {};
      var hay = all.map(function (c) { return [c.name, c.card, c.type, c.art, frameName(data, c.frame), c.version || ''].join(' '); }).join(' ');
      cards.push({ c: face, all: all, d: d, hay: (hay + ' ' + (d.title || '')).toLowerCase(),
        frames: all.map(function (c) { return c.frame; }),
        added: all.reduce(function (m, c) { return c.added && c.added > m ? c.added : m; }, '') });
    });

    function fold(t) { return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }   // Doré matches dore
    cards.forEach(function (x) { x.hay = fold(x.hay); });
    var params = new URLSearchParams(location.search);
    var state = { q: params.get('q') || '', colours: {}, deck: params.get('in') || '', kind: '', frame: '', sort: 'name', shown: PAGE_SIZE };
    var search = el('input', { type: 'search', placeholder: 'Search all cards', 'aria-label': 'Search all cards', value: state.q });
    var chips = el('div', { class: 'chips', role: 'group', 'aria-label': 'Colour' }, ['W', 'U', 'B', 'R', 'G', 'C'].map(function (k) {
      var b = el('button', { class: 'chip', type: 'button', 'aria-pressed': 'false', 'aria-label': COLOUR_NAMES[k], title: COLOUR_NAMES[k] }, [el('span', { class: 'pip ' + k })]);
      b.addEventListener('click', function () {
        state.colours[k] = !state.colours[k];
        b.setAttribute('aria-pressed', state.colours[k] ? 'true' : 'false');
        reset();
      });
      return b;
    }));
    function select(label, opts, key) {
      var s = el('select', { 'aria-label': label }, [el('option', { value: '', text: label })].concat(opts));
      s.value = state[key];
      s.addEventListener('change', function () { state[key] = s.value; reset(); });
      return s;
    }
    function opt(v, t) { return el('option', { value: v, text: t }); }
    // collections grouped as decks, series and one-offs, in the site's order
    var where = ['deck', 'series', 'singles'].map(function (k) {
      var ds = data.decks.filter(function (d) { return (d.kind || 'deck') === k; });
      return ds.length ? el('optgroup', { label: KIND_LABEL[k] }, ds.map(function (d) { return opt(d.id, d.title); })) : null;
    }).filter(Boolean);
    var kinds = ['Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Battle', 'Land'].filter(function (k) { return data.cards.some(function (c) { return c.kind === k; }); });
    var frameSet = {};
    data.cards.forEach(function (c) { frameSet[c.frame] = 1; });
    var frames = Object.keys(frameSet).sort(function (a, b) { return frameName(data, a).localeCompare(frameName(data, b)); });
    var sort = el('select', { 'aria-label': 'Sort' }, [opt('name', 'A to Z'), opt('new', 'Newest first')]);
    sort.addEventListener('change', function () { state.sort = sort.value; reset(); });
    var count = el('span', { class: 'count', 'aria-live': 'polite' });
    $('#card-filters').replaceChildren(search, chips,
      select('Every deck and series', where, 'deck'),
      select('All types', kinds.map(function (k) { return opt(k, k + 's'); }), 'kind'),
      select('All frames', frames.map(function (k) { return opt(k, frameName(data, k)); }), 'frame'),
      sort, count);
    var timer;
    search.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { state.q = search.value.trim(); reset(); }, 120);
    });

    function keepUrl() {
      var p = new URLSearchParams();
      if (state.q) p.set('q', state.q);
      if (state.deck) p.set('in', state.deck);
      var s = p.toString();
      try { history.replaceState(null, '', location.pathname + (s ? '?' + s : '')); } catch (e) { /* file:// */ }
    }
    function reset() { state.shown = PAGE_SIZE; keepUrl(); render(); }

    function render() {
      var words = fold(state.q).split(/\s+/).filter(Boolean);
      var on = Object.keys(state.colours).filter(function (k) { return state.colours[k]; });
      var hits = cards.filter(function (x) {
        if (!words.every(function (w) { return x.hay.indexOf(w) >= 0; })) return false;
        if (state.deck && x.c.deck !== state.deck) return false;
        if (state.kind && x.c.kind !== state.kind) return false;
        if (state.frame && x.frames.indexOf(state.frame) < 0) return false;
        if (on.length && !on.every(function (k) { return x.c.colours.indexOf(k) >= 0; })) return false;
        return true;
      });
      hits.sort(state.sort === 'new'
        ? function (a, b) { return a.added === b.added ? a.c.card.localeCompare(b.c.card) : (a.added < b.added ? 1 : -1); }
        : function (a, b) { return a.c.card.localeCompare(b.c.card) || (a.d.title || '').localeCompare(b.d.title || ''); });
      count.textContent = hits.length + (hits.length === 1 ? ' card' : ' cards');
      var g = $('#card-grid'), more = $('#card-more');
      if (!hits.length) {
        g.replaceChildren(el('p', { class: 'empty', style: 'grid-column:1/-1', text: 'No cards match. Try fewer words or clear a filter.' }));
        more.replaceChildren();
        return;
      }
      // the pop-up steps through the matching cards; a filtered frame opens on that frame's version
      var list = hits.map(function (x) {
        return state.frame ? x.all.filter(function (c) { return c.frame === state.frame; })[0] || x.c : x.c;
      });
      var page = hits.slice(0, state.shown);
      g.replaceChildren.apply(g, page.map(function (x, i) {
        var n = x.all.filter(function (c) { return !/back/i.test(c.version); }).length;
        return tile(data, list[i], list, i, el('span', null, [
          el('a', { href: pageOf(x.d), text: x.d.title || '', style: 'text-decoration:none;color:inherit' }),
          n > 1 ? ' · ' + n + ' versions' : ''
        ]));
      }));
      if (hits.length > state.shown) {
        more.replaceChildren(el('button', { class: 'btn', type: 'button', text: 'Show more (' + (hits.length - state.shown) + ' left)',
          onclick: function () { state.shown += PAGE_SIZE; render(); } }));
      } else more.replaceChildren();
    }
    render();
  }

  /* ---------- start ---------- */
  header();
  footer();
  guard();
  var VIEWS = { home: home, collection: deckPage, decks: decksPage, collections: collectionsPage, cards: cardsPage };
  load().then(function (data) {
    fillMenu(data);
    if (VIEWS[PAGE]) VIEWS[PAGE](data);
  }).catch(function (e) {
    console.error(e);
    var m = $('main');
    if (m && VIEWS[PAGE]) m.appendChild(el('p', { class: 'wrap empty', text: 'The cards could not be loaded. Please try again later.' }));
  });
})();
