// 出発前ガイドの表示プログラム
// URLの使い方：
//   ?lang=en / ?lang=ja       … 言語（指定がなければ英語。選んだ言語は覚えておく）
//   ?page=return / insurance  … 表示するページ
//   ?review=1                 … 店長向けの確認シート（日本語）
(function () {
  var G = window.GUIDE;
  var params = new URLSearchParams(location.search);
  // 差し替え欄：[ … ]（英語・中国語・韓国語など）と ［店が記入：…］（日本語）
  var PH = /(\[[^\]]*\]|［店が記入[^］]*］)/g;

  // 対応言語（順番＝言語メニューの並び）。翻訳ファイル i18n/*.js があれば取り込む
  var LANGS = (G.langs || [{ code: 'en', label: 'English' }, { code: 'ja', label: '日本語' }]);
  var CODES = LANGS.map(function (l) { return l.code; });
  (function mergeI18n() {
    var T = window.GUIDE_I18N || {};
    Object.keys(T).forEach(function (code) {
      var t = T[code];
      function put(o, key) { if (o && t[key] !== undefined) o[code] = t[key]; }
      put(G.shop, 'shop');
      Object.keys(G.ui).forEach(function (k) {
        if (k === 'tabs') Object.keys(G.ui.tabs).forEach(function (n) { put(G.ui.tabs[n], 'tab.' + n); });
        else put(G.ui[k], 'ui.' + k);
      });
      ['return', 'insurance'].forEach(function (pg) {
        G.pages[pg].forEach(function (b) {
          put(b, b.id);
          (b.items || []).forEach(function (it, i) { put(it, b.id + '-' + (i + 1)); });
          (b.lines || []).forEach(function (l) { put(l, l.id); });
          (b.buttons || []).forEach(function (bt, i) { put(bt, b.id + '-btn' + (i + 1)); });
          if (b.head && t[b.id + '-head']) b.head[code] = t[b.id + '-head'];
          (b.rows || []).forEach(function (r, i) { if (t[b.id + '-' + (i + 1)]) r[code] = t[b.id + '-' + (i + 1)]; });
        });
      });
    });
  })();

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  // ページごとのHTMLファイル（body の data-*）で表示内容を決める。URLの ?lang= などがあればそちらを優先
  var d = document.body.dataset;
  // 言語の決め方：URLの ?lang= → このページのファイルで指定 → 前に選んだ言語 → スマホの言語設定 → 英語
  function fromBrowser() {
    var n = (navigator.language || '').toLowerCase();
    if (n.indexOf('zh') === 0) return /tw|hk|mo|hant/.test(n) ? 'zh-Hant' : 'zh-Hans';
    var short = n.split('-')[0];
    return CODES.indexOf(short) >= 0 ? short : null;
  }
  var lang = params.get('lang') || d.lang || store('guide-lang') || fromBrowser() || 'en';
  if (CODES.indexOf(lang) < 0) lang = 'en';
  var page = (params.get('page') || d.page) === 'insurance' ? 'insurance' : 'return';
  var review = params.get('review') === '1' || d.review === '1';

  // ページとリンクの対応（?を使わないファイル名にする。リンクを共有したときにクエリが消えても困らないように）
  function href(pg, lg) {
    var f = (pg === 'insurance' ? 'insurance' : 'index') + (lg === 'ja' ? '-ja' : '') + '.html';
    return (lg === 'ja' || lg === 'en') ? f : f + '?lang=' + lg;
  }

  // ---- アイコン（線画） ----
  var ICONS = {
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    fuel: '<path d="M4 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15"/><path d="M3 20h12"/><path d="M6 8h6"/><path d="M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    pin: '<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
    message: '<path d="M4 5h16v11H9l-5 4z"/>',
    check: '<path d="M5 12l4 4 10-10"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/>',
    x: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  };
  function icon(name, cls) {
    return '<span class="icon ' + (cls || '') + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || '') + '</svg></span>';
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  // 差し替え欄に色をつける
  var editVals = null; // 確認モードで店長が入れた値 { 'A-14': ['1時間ごとに1,000円', ...] }
  function fmt(s, id) {
    var k = 0;
    return esc(s).replace(PH, function (m) {
      var v = editVals && id && editVals[id] && editVals[id][k];
      k++;
      return v ? '<mark class="ph filled">' + esc(v) + '</mark>' : '<mark class="ph">' + m + '</mark>';
    });
  }
  function tx(o) { return o[lang] !== undefined ? o[lang] : o.en; }
  var LTEXT = window.GUIDE_LTEXT || {};
  function lt(key) { var t = LTEXT[lang] || {}; return (t[key] !== undefined ? t[key] : (LTEXT.en || {})[key]) || key; }

  function countPlaceholders() {
    // 今の言語・今のページの差し替え欄だけを数える
    var n = 0;
    G.pages[page].forEach(function (b) {
      var parts = [tx(b) || ''];
      (b.items || []).concat(b.lines || []).forEach(function (x) { parts.push(tx(x) || ''); });
      (b.rows || []).forEach(function (r) { parts.push((r[lang] || r.en).join(' ')); });
      parts.join(' ').replace(PH, function () { n++; });
    });
    return n;
  }

  // ---- 4方向の写真の図 ----
  function carPhotos() {
    var L = [lt('front'), lt('back'), lt('left'), lt('right')];
    return '<div class="carphotos" aria-label="' + esc(lt('photos4')) + '">' +
      '<svg viewBox="0 0 300 220" aria-hidden="true">' +
      '<rect x="110" y="55" width="80" height="110" rx="22" class="car"/>' +
      '<path d="M122 80h56M122 140h56" class="car-line"/>' +
      '<g class="cam"><path d="M140 22l10 18 10-18"/></g>' +
      '<g class="cam"><path d="M140 198l10-18 10 18"/></g>' +
      '<g class="cam"><path d="M60 100l22 10-22 10"/></g>' +
      '<g class="cam"><path d="M240 100l-22 10 22 10"/></g>' +
      '</svg>' +
      '<span class="lbl t">' + L[0] + '</span><span class="lbl b">' + L[1] + '</span>' +
      '<span class="lbl l">' + L[2] + '</span><span class="lbl r">' + L[3] + '</span></div>';
  }

  // ---- 1ブロックずつ描く ----
  function block(b) {
    var a = ' id="' + b.id + '"';
    switch (b.t) {
      case 'h1': return '<h1' + a + '>' + fmt(tx(b)) + '</h1>';
      case 'lead': return '<p class="lead"' + a + '>' + fmt(tx(b)) + '</p>';
      case 'summary':
        return '<div class="summary"' + a + '>' + b.items.map(function (it, i) {
          return '<a class="sum-row" id="' + b.id + '-' + (i + 1) + '" href="#' + it.jump + '">' + icon(it.icon) + '<span>' + fmt(tx(it)) + '</span></a>';
        }).join('') + '</div>';
      case 'h2': return '<h2' + a + '>' + icon(b.icon) + '<span>' + fmt(tx(b)) + '</span></h2>';
      case 'li':
        var t = fmt(tx(b));
        if (b.link) t = '<a href="' + href(b.link, lang) + '">' + t + '</a>';
        return '<p class="li' + (b.important ? ' money' : '') + '"' + a + '>' + t + '</p>';
      case 'xli': return '<p class="li xli"' + a + '>' + icon('x', 'small') + '<span>' + fmt(tx(b)) + '</span></p>';
      case 'note': return '<p class="note"' + a + '>' + fmt(tx(b)) + '</p>';
      case 'button':
        return '<a class="btn' + (b.secondary ? ' secondary' : '') + '"' + a + ' href="' + b.href + '">' + icon(b.icon, 'inbtn') + '<span>' + fmt(tx(b)) + '</span></a>';
      case 'tip':
        return '<div class="tip"' + a + '><h3>' + fmt(tx(b)) + '</h3>' + b.lines.map(function (l) {
          return '<p id="' + l.id + '">' + fmt(tx(l)) + '</p>';
        }).join('') + '</div>';
      case 'station':
        var p = tx(b).split('|');
        return '<div class="card station"' + a + '><strong>' + fmt(p[0]) + '</strong><p>' + fmt(p[1]) + '</p><p>' + fmt(p[2]) + '</p><p>' + fmt(p[3]) + '</p>' +
          '<a class="btn secondary" href="#">' + icon('pin', 'inbtn') + '<span>' + esc(lt('maps')) + '</span></a></div>';
      case 'carphotos': return carPhotos();
      case 'table':
        return '<table class="tbl' + (b.important ? ' money' : '') + '"' + a + '><thead><tr>' + (b.head[lang] || b.head.en).map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
          '</tr></thead><tbody>' + b.rows.map(function (r, i) {
            return '<tr id="' + b.id + '-' + (i + 1) + '">' + (r[lang] || r.en).map(function (c) { return '<td>' + fmt(c) + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table>';
      case 'example':
        return '<div class="example"' + a + '><span class="badge">' + esc(tx(G.ui.exampleOnly)) + '</span><h3>' + fmt(tx(b)) + '</h3>' +
          b.lines.map(function (l) { return '<p id="' + l.id + '">' + fmt(tx(l)) + '</p>'; }).join('') + '</div>';
      case 'accident':
        return '<div class="accident"' + a + '><h2>' + icon('alert') + '<span>' + fmt(tx(b)) + '</span></h2>' +
          b.lines.map(function (l) { return '<p id="' + l.id + '">' + fmt(tx(l)) + '</p>'; }).join('') +
          '<div class="callrow">' + b.buttons.map(function (c) {
            return '<a class="btn danger" href="' + c.href + '">' + icon('phone', 'inbtn') + '<span>' + esc(tx(c)) + '</span></a>';
          }).join('') + '</div></div>';
      case 'footer': return '<p class="disclaimer"' + a + '>' + icon('doc', 'small') + '<span>' + fmt(tx(b)) + '</span></p>';
      case 'footnote': return '<p class="footnote"' + a + '>' + fmt(tx(b)) + '</p>';
      case 'nav': return '<a class="btn nav"' + a + ' href="' + href(b.to, lang) + '">' + esc(tx(b)) + '</a>';
    }
    return '';
  }

  function header() {
    function langMenu() {
      return '<label class="langsel"><span class="globe" aria-hidden="true">🌐</span><select id="langsel" aria-label="Language">' +
        LANGS.map(function (l) { return '<option value="' + l.code + '"' + (l.code === lang ? ' selected' : '') + '>' + l.label + '</option>'; }).join('') +
        '</select></label>';
    }
    function tab(name) {
      return '<a class="tab' + (page === name ? ' on' : '') + '" href="' + href(name, lang) + '">' + esc(tx(G.ui.tabs[name])) + '</a>';
    }
    return '<header><span class="shop">' + esc(tx(G.shop)) + '</span>' + langMenu() + '</header>' +
      '<nav class="tabs">' + tab('return') + tab('insurance') + '</nav>';
  }

  // ---- 確認シート（店長向け・日本語） ----
  function flatten() {
    var out = [];
    ['return', 'insurance'].forEach(function (pg) {
      G.pages[pg].forEach(function (b) {
        if (b.t === 'summary') b.items.forEach(function (it, i) { out.push({ id: b.id + '-' + (i + 1), ja: it.ja, en: it.en, important: b.important }); });
        else if (b.lines) {
          if (b.ja) out.push({ id: b.id, ja: b.ja, en: b.en, important: b.important });
          b.lines.forEach(function (l) { out.push({ id: l.id, ja: l.ja, en: l.en, important: l.important || b.t === 'example' }); });
        } else if (b.t === 'table') {
          b.rows.forEach(function (r, i) { out.push({ id: b.id + '-' + (i + 1), ja: r.ja.join('：'), en: r.en.join(': '), important: b.important }); });
        } else if (b.t === 'station') {
          out.push({ id: b.id, ja: b.ja.split('|').join('／'), en: b.en.split('|').join(' / ') });
        } else if (b.ja) {
          out.push({ id: b.id, ja: b.ja, en: b.en, important: b.important, optional: b.optional });
        }
      });
    });
    return out;
  }

  // ---- 確認モード：お客様と同じ画面のまま、店長が文をタップして確認・記入する ----
  function setupEdit(root, items) {
    var byId = {};
    items.forEach(function (it) { byId[it.id] = it; });
    var saved = {};
    try { saved = JSON.parse(store('guide-review') || '{}') || {}; } catch (e) { saved = {}; }
    function save() { store('guide-review', JSON.stringify(saved)); }

    // 画面上の文に印をつける
    items.forEach(function (it) {
      var el = document.getElementById(it.id);
      if (el) { el.setAttribute('data-eid', it.id); el.classList.add('ed'); }
    });
    function decorate() {
      var ok = 0, onPage = 0;
      root.querySelectorAll('[data-eid]').forEach(function (el) {
        var id = el.getAttribute('data-eid'), st = saved[id] || {};
        onPage++;
        el.classList.remove('st-ok', 'st-fix', 'st-skip');
        if (st.v) { el.classList.add('st-' + st.v); ok++; }
        var k = 0;
        el.querySelectorAll('mark.ph').forEach(function (m) {
          if (m.closest('[data-eid]') !== el) return;
          if (!m.dataset.orig) m.dataset.orig = m.textContent;
          var v = st.vals && st.vals[k];
          m.textContent = v ? v : m.dataset.orig;
          m.classList.toggle('filled', !!v);
          k++;
        });
      });
      var all = items.filter(function (it) { return (saved[it.id] || {}).v; }).length;
      document.getElementById('ebar-progress').textContent = 'このページ ' + ok + '／' + onPage + '　全体 ' + all + '／' + items.length;
    }

    // 下からせり上がる確認パネル
    var sheet = document.createElement('div');
    sheet.className = 'sheet-wrap';
    sheet.innerHTML = '<div class="sheet" role="dialog" aria-modal="true"><div class="sheet-body"></div></div>';
    document.body.appendChild(sheet);
    var body = sheet.querySelector('.sheet-body');

    function open(id) {
      var it = byId[id], st = saved[id] = saved[id] || {};
      var phs = (it.ja.match(PH) || []);
      st.vals = st.vals || [];
      var h = '<div class="rid">' + id + (it.important ? ' <span class="tag">重要（お金・事故）</span>' : '') + '</div>' +
        '<p class="rja">' + fmt(it.ja) + '</p>' +
        '<details><summary>お客様に見える英語</summary><p>' + fmt(it.en) + '</p></details>';
      phs.forEach(function (ph, i) {
        h += '<label class="phin">' + esc(ph.replace(/^［店が記入：?|］$/g, '') || '記入') +
          '<input type="text" data-i="' + i + '" value="' + esc(st.vals[i] || '') + '" placeholder="例：店のルールを入力"></label>';
      });
      h += '<div class="rbtns"><button data-v="ok">確認済み</button><button data-v="fix">修正したい</button>' +
        (it.optional ? '<button data-v="skip">当店では使わない</button>' : '') + '</div>' +
        '<textarea placeholder="どう直したいですか（短くてOK）"></textarea>' +
        '<button class="btn" data-close>閉じる</button>';
      body.innerHTML = h;
      var ta = body.querySelector('textarea');
      function sync() {
        body.querySelectorAll('.rbtns button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === st.v); });
        ta.style.display = st.v === 'fix' ? 'block' : 'none';
      }
      ta.value = st.note || '';
      body.onclick = function (e) {
        var b = e.target.closest('.rbtns button');
        if (b) { st.v = st.v === b.dataset.v ? '' : b.dataset.v; save(); sync(); }
        if (e.target.closest('[data-close]')) close();
      };
      body.oninput = function (e) {
        if (e.target.tagName === 'TEXTAREA') st.note = e.target.value;
        if (e.target.dataset.i !== undefined) st.vals[+e.target.dataset.i] = e.target.value.trim();
        save();
      };
      sync();
      sheet.classList.add('open');
    }
    function close() { sheet.classList.remove('open'); decorate(); }
    sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });

    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-eid]');
      if (!el || !root.contains(el)) return;
      e.preventDefault();
      open(el.getAttribute('data-eid'));
    });

    // 下の固定バー：進み具合と結果のコピー
    var bar = document.createElement('div');
    bar.className = 'ebar';
    bar.innerHTML = '<span id="ebar-progress"></span><button id="copy">結果をコピー</button>';
    document.body.appendChild(bar);
    document.getElementById('copy').addEventListener('click', function () {
      var ok = [], fix = [], skip = [], none = [], fill = [];
      items.forEach(function (it) {
        var st = saved[it.id] || {};
        (st.vals || []).forEach(function (v, i) {
          if (v) fill.push('【記入】' + it.id + '（' + ((it.ja.match(PH) || [])[i] || '').replace(/^［店が記入：?|］$/g, '') + '）＝' + v);
        });
        if (st.v === 'ok') ok.push(it.id);
        else if (st.v === 'fix') fix.push('【修正】' + it.id + '：' + (st.note || '（内容未記入）'));
        else if (st.v === 'skip') skip.push(it.id);
        else none.push(it.id);
      });
      var dt = new Date();
      var text = G.shop.ja + ' 確認結果 ' + G.version + '（' + (dt.getMonth() + 1) + '/' + dt.getDate() + '）\n' +
        '確認済み ' + ok.length + '件／修正したい ' + fix.length + '件／使わない ' + skip.length + '件／未確認 ' + none.length + '件' +
        (fill.length ? '\n' + fill.join('\n') : '') + (fix.length ? '\n' + fix.join('\n') : '') +
        (skip.length ? '\n【使わない】' + skip.join(', ') : '') + (none.length ? '\n【未確認】' + none.join(', ') : '');
      var done = function () { var b = document.getElementById('copy'); b.textContent = 'コピーしました'; setTimeout(function () { b.textContent = '結果をコピー'; }, 2500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
      } else { fallback(text); done(); }
    });
    function fallback(text) {
      var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t);
    }
    decorate();
  }

  // ---- 表示 ----
  var root = document.getElementById('app');
  if (review) lang = 'ja';
  document.documentElement.lang = lang;
  if (!review) store('guide-lang', lang);
  var n = countPlaceholders();
  var head = header();
  if (review) {
    // 確認モード：言語ボタンの代わりに「お客様の画面を見る」、タブは確認モードのページへ
    head = '<header><span class="shop">' + esc(G.shop.ja) + '　確認モード</span>' +
      '<a class="lang on" href="' + href(page, 'en') + '" target="_blank">英語画面</a></header>' +
      '<nav class="tabs"><a class="tab' + (page === 'return' ? ' on' : '') + '" href="review.html">返却</a>' +
      '<a class="tab' + (page === 'insurance' ? ' on' : '') + '" href="review-insurance.html">保険・NOC</a></nav>' +
      '<div class="ehelp">お客様と同じ画面です。<b>文をタップ</b>すると、確認・修正・黄色い欄への記入ができます。<b>枠が茶色の文（お金・事故）</b>は必ず確認してください。最後に下の「結果をコピー」を押して、LINEで送ってください。</div>';
  }
  var draft = (G.draftLangs || []).indexOf(lang) >= 0 && !review;
  root.innerHTML = head + (draft ? '<div class="draftnote">' + esc(lt('draft')) + '</div>' : '') +
    (n && !review ? '<div class="unfilled">' + esc(tx(G.ui.unfilled)) + ' (' + n + ')</div>' : '') +
    '<main' + (review ? ' class="editing"' : '') + '>' + G.pages[page].map(block).join('') + '<p class="ver">' + G.version + ' / build 6</p></main>';
  document.title = review ? G.shop.ja + ' 確認モード' : tx(G.shop) + ' — ' + tx(G.ui.tabs[page]);
  if (review) setupEdit(root, flatten());
  var sel = document.getElementById('langsel');
  if (sel) sel.addEventListener('change', function () {
    store('guide-lang', sel.value);
    location.href = href(page, sel.value);
  });
})();
