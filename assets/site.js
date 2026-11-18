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
  var DECK_LINKS = [['magus', 'Magus Lucea Kane'], ['truthsayer', 'Truthsayer'], ['occult', "Be'lakor"]];
  function header() {
    var here = PAGE === 'deck' ? 'deck-' + document.body.getAttribute('data-deck') : PAGE;
    var nav = el('nav', { class: 'nav', id: 'nav', 'aria-label': 'Main' });
    DECK_LINKS.forEach(function (d) {
      nav.appendChild(el('a', { href: ROOT + 'decks/' + d[0] + '/', text: d[1], 'aria-current': here === 'deck-' + d[0] ? 'page' : null }));
    });
    nav.appendChild(el('a', { href: ROOT + 'about/', text: 'About', 'aria-current': here === 'about' ? 'page' : null }));
    var icons = el('span', { class: 'icon-row' }, [
      el('a', { class: 'icon-btn', href: INSTAGRAM, target: '_blank', rel: 'noopener', 'aria-label': 'Instagram', html: ICON.insta }),
      el('button', { class: 'icon-btn theme-btn', type: 'button', onclick: function () { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); } })
    ]);
    nav.appendChild(icons);
    var menu = el('button', { class: 'icon-btn menu-btn', type: 'button', 'aria-label': 'Menu', 'aria-expanded': 'false', 'aria-controls': 'nav', html: ICON.menu,
      onclick: function () { var o = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', o ? 'true' : 'false'); } });
    var h = el('header', { class: 'site-head' }, [el('div', { class: 'wrap' }, [
      el('a', { class: 'wordmark', href: ROOT, html: 'Untap <b>Foundry</b>' }), menu, nav
    ])]);
    document.body.insertBefore(h, document.body.firstChild);
    setTheme(getTheme());
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
        el('h4', { text: 'Decks' }),
        el('ul', null, DECK_LINKS.map(function (d) { return el('li', null, [el('a', { href: ROOT + 'decks/' + d[0] + '/', text: d[1] })]); }))
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
      fetch(ROOT + 'data/cards.json').then(function (r) { return r.json(); }),
      fetch(ROOT + 'data/content.json').then(function (r) { return r.json(); })
    ]).then(function (res) {
      var data = res[0];
      data.content = res[1];
      data.byId = {};
      data.cards.forEach(function (c, i) { c.order = i; data.byId[c.id] = c; });
      data.deck = {};
      data.decks.forEach(function (d) { data.deck[d.id] = d; });
      return data;
    });
  }
  function frameName(data, code) { var f = data.content.frames[code]; return f ? f.name : code.charAt(0) + code.slice(1).toLowerCase(); }
  function versionsOf(data, c) {
    return data.cards.filter(function (x) { return x.deck === c.deck && x.card === c.card; });
  }
  function versionLabel(c, all) {
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
      caption === false ? null : el('figcaption', null, [el('b', { text: c.name }), caption || (frameName(data, c.frame) + (c.version ? ' · ' + c.version : ''))])
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
      if (d) kids.push(el('p', { class: 'eyebrow' }, [el('a', { href: ROOT + 'decks/' + d.id + '/', text: d.title + ' deck', style: 'text-decoration:none' })]));
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
  function pips(cols) { return el('span', { class: 'pips' }, cols.map(function (k) { return el('span', { class: 'pip ' + k, title: COLOUR_NAMES[k] }); })); }

  function deckTiles(data, decks) {
    return el('div', { class: 'decks' }, decks.map(function (d) {
      var cmd = commanderOf(data, d.id), info = data.content.decks[d.id] || {};
      return el('a', { class: 'deck-tile', href: ROOT + 'decks/' + d.id + '/' }, [
        el('div', { class: 'mtg' }, [el('img', { src: ROOT + cmd.img + '-400.jpg', alt: '', loading: 'lazy', draggable: 'false' })]),
        el('div', null, [
          el('h3', { text: d.title }),
          el('p', { text: info.tagline || '' }),
          el('p', { style: 'margin-top:8px' }, [pips(info.colours || []), '  ' + d.made + ' cards' + (d.updated ? ' · updated ' + fmtDate(d.updated) : '')]),
          d.finished ? null : el('span', { class: 'badge', text: 'In progress' })
        ])
      ]);
    }));
  }

  function home(data) {
    var c = cardOfTheDay(data);
    var slot = $('#cotd');
    if (c && slot) {
      var list = [c];
      var w = el('div', { class: 'tilt' }, [cardButton(c, function () { viewer.open(data, list, 0); }, { eager: true })]);
      slot.replaceChildren(
        el('div', { class: 'label', text: 'Card of the day' }), w,
        el('div', { class: 'meta' }, [el('b', { text: c.name }), ' · ' + data.deck[c.deck].title + ' deck'])
      );
      tilt(w);
    }

    var lt = latest(data, 10), row = $('#latest');
    if (row) row.replaceChildren.apply(row, lt.map(function (x, i) {
      return tile(data, x, lt, i, data.deck[x.deck].title + (x.added ? ' · ' + fmtDate(x.added) : ''));
    }));

    var decks = data.decks.slice().sort(function (a, b) { return a.updated < b.updated ? 1 : -1; });
    var dt = $('#decks');
    if (dt) dt.replaceChildren(deckTiles(data, decks));

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

    var hero = $('#deck-hero');
    var w = el('div', { class: 'tilt' }, [cardButton(cmd, function () { viewer.open(data, [cmd], 0); }, { eager: true })]);
    var frameCodes = {};
    mine.forEach(function (c) { frameCodes[c.frame] = 1; });
    hero.replaceChildren(w, el('div', null, [
      el('p', { class: 'eyebrow', text: d.finished ? 'Commander deck' : 'Commander deck · in progress' }),
      el('h1', { text: d.title }),
      el('p', { class: 'lede', text: info.tagline || '' })
    ].concat((info.intro || []).map(function (p) { return el('p', { text: p }); })).concat([
      el('ul', { class: 'stats' }, [
        el('li', null, [el('b', { text: String(d.made) }), d.finished ? 'cards' : 'of ' + d.size + ' cards made']),
        el('li', null, [el('b', { text: String(Object.keys(frameCodes).length) }), 'frames']),
        el('li', null, [el('b', null, [pips(info.colours || [])]), 'colours'])
      ])
    ])));
    tilt(w);

    // the frames and what inspired them
    var fs = $('#deck-frames');
    if (fs) {
      var codes = (info.frames || []).filter(function (k) { return frameCodes[k]; });
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
      fs.replaceChildren.apply(fs, kids);
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

    var order = ['Creature', 'Planeswalker', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Battle', 'Other', 'Land'];
    var sorted = mine.slice().sort(function (a, b) {
      if (a.commander !== b.commander) return a.commander ? -1 : 1;
      var k = order.indexOf(a.kind) - order.indexOf(b.kind);
      return k || a.card.localeCompare(b.card) || a.order - b.order;
    });
    function render() {
      var on = Object.keys(state.colours).filter(function (k) { return state.colours[k]; });
      var shown = sorted.filter(function (c) {
        if (state.q && (c.name + ' ' + c.card + ' ' + c.type + ' ' + c.art).toLowerCase().indexOf(state.q) < 0) return false;
        if (state.kind && c.kind !== state.kind) return false;
        if (state.frame && c.frame !== state.frame) return false;
        if (on.length && !on.every(function (k) { return c.colours.indexOf(k) >= 0; })) return false;
        return true;
      });
      count.textContent = shown.length + ' shown';
      var g = $('#grid');
      if (!shown.length) { g.replaceChildren(el('p', { class: 'empty', text: 'No cards match these filters.' })); return; }
      g.replaceChildren.apply(g, shown.map(function (c, i) {
        return tile(data, c, shown, i, frameName(data, c.frame) + (c.version ? ' · ' + c.version : ''));
      }));
    }
    render();
  }

  /* ---------- start ---------- */
  header();
  footer();
  guard();
  if (PAGE === 'home' || PAGE === 'deck') {
    load().then(function (data) {
      if (PAGE === 'home') home(data);
      else deckPage(data);
    }).catch(function (e) {
      console.error(e);
      var m = $('main');
      if (m) m.appendChild(el('p', { class: 'wrap empty', text: 'The cards could not be loaded. Please try again later.' }));
    });
  }
})();
