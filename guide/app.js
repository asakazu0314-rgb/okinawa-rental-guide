// 出発前ガイドの表示プログラム
// URLの使い方：
//   ?lang=en / ?lang=ja       … 言語（指定がなければ英語。選んだ言語は覚えておく）
//   ?page=return / insurance  … 表示するページ
//   ?review=1                 … 店長向けの確認シート（日本語）
(function () {
  var G = window.GUIDE;
  var params = new URLSearchParams(location.search);
  var PH = /(\[Shop sets[^\]]*\]|［店が記入[^］]*］)/g;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  // ページごとのHTMLファイル（body の data-*）で表示内容を決める。URLの ?lang= などがあればそちらを優先
  var d = document.body.dataset;
  var lang = params.get('lang') || d.lang || store('guide-lang') || 'en';
  if (lang !== 'ja') lang = 'en';
  var page = (params.get('page') || d.page) === 'insurance' ? 'insurance' : 'return';
  var review = params.get('review') === '1' || d.review === '1';

  // ページとリンクの対応（?を使わないファイル名にする。リンクを共有したときにクエリが消えても困らないように）
  function href(pg, lg) {
    return (pg === 'insurance' ? 'insurance' : 'index') + (lg === 'ja' ? '-ja' : '') + '.html';
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
  function fmt(s) {
    return esc(s).replace(PH, '<mark class="ph">$1</mark>');
  }
  function tx(o) { return o[lang]; }

  function countPlaceholders() {
    // 今の言語・今のページの差し替え欄だけを数える
    var n = 0;
    var re = lang === 'ja' ? /［店が記入[^］]*］/g : /\[Shop sets[^\]]*\]/g;
    JSON.stringify(G.pages[page]).replace(re, function () { n++; });
    return n;
  }

  // ---- 4方向の写真の図 ----
  function carPhotos() {
    var L = lang === 'ja' ? ['① 前', '② 後ろ', '③ 左', '④ 右'] : ['① Front', '② Back', '③ Left', '④ Right'];
    return '<div class="carphotos" aria-label="' + (lang === 'ja' ? '車を4方向から撮影' : 'Take 4 photos of the car') + '">' +
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
        return '<div class="summary"' + a + '>' + b.items.map(function (it) {
          return '<a class="sum-row" href="#' + it.jump + '">' + icon(it.icon) + '<span>' + fmt(tx(it)) + '</span></a>';
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
          '<a class="btn secondary" href="#">' + icon('pin', 'inbtn') + '<span>' + (lang === 'ja' ? 'Googleマップで開く' : 'Open in Google Maps') + '</span></a></div>';
      case 'carphotos': return carPhotos();
      case 'table':
        return '<table class="tbl' + (b.important ? ' money' : '') + '"' + a + '><thead><tr>' + b.head[lang].map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
          '</tr></thead><tbody>' + b.rows.map(function (r) {
            return '<tr>' + r[lang].map(function (c) { return '<td>' + fmt(c) + '</td>'; }).join('') + '</tr>';
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
    function langBtn(code, label) {
      return '<a class="lang' + (lang === code ? ' on' : '') + '" href="' + href(page, code) + '">' + label + '</a>';
    }
    function tab(name) {
      return '<a class="tab' + (page === name ? ' on' : '') + '" href="' + href(name, lang) + '">' + esc(tx(G.ui.tabs[name])) + '</a>';
    }
    return '<header><span class="shop">' + esc(tx(G.shop)) + '</span><span class="langs">' + langBtn('en', 'EN') + langBtn('ja', '日本語') + '</span></header>' +
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

  function renderReview(root) {
    var items = flatten();
    var saved = {};
    try { saved = JSON.parse(store('guide-review') || '{}') || {}; } catch (e) { saved = {}; }
    function save() { store('guide-review', JSON.stringify(saved)); }

    var html = '<header><span class="shop">' + esc(G.shop.ja) + '　確認シート（' + G.version + '）</span></header>' +
      '<main class="review"><p class="lead">各文を読んで「確認済み」か「修正したい」を押してください。<b>お金と事故に関わる文（重要）</b>を必ず確認してください。最後に「結果をコピー」を押して、LINEに貼って送ってください。</p>' +
      '<p class="progress" id="progress"></p>' +
      '<label class="onlyimp"><input type="checkbox" id="onlyimp"> 重要な文だけ表示する</label>';
    items.forEach(function (it) {
      html += '<div class="rcard' + (it.important ? ' imp' : '') + '" data-id="' + it.id + '">' +
        '<div class="rid">' + it.id + (it.important ? ' <span class="tag">重要</span>' : '') + '</div>' +
        '<p class="rja">' + fmt(it.ja) + '</p>' +
        '<details><summary>英語を見る</summary><p>' + fmt(it.en) + '</p></details>' +
        '<div class="rbtns"><button data-v="ok">確認済み</button><button data-v="fix">修正したい</button>' +
        (it.optional ? '<button data-v="skip">当店では使わない</button>' : '') + '</div>' +
        '<textarea placeholder="どう直したいですか（短くてOK）。金額などの記入もここに"></textarea></div>';
    });
    html += '<div class="rfoot"><button class="btn" id="copy">結果をコピー（LINEに貼る）</button><p class="note" id="copied"></p></main>';
    root.innerHTML = html;

    function refresh() {
      var ok = 0;
      root.querySelectorAll('.rcard').forEach(function (c) {
        var s = saved[c.dataset.id] || {};
        c.querySelectorAll('.rbtns button').forEach(function (bt) { bt.classList.toggle('on', bt.dataset.v === s.v); });
        var ta = c.querySelector('textarea');
        ta.style.display = s.v === 'fix' ? 'block' : 'none';
        if (ta.value !== (s.note || '')) ta.value = s.note || '';
        if (s.v) ok++;
      });
      document.getElementById('progress').textContent = '確認した文：' + ok + '／' + items.length + '件';
    }
    root.addEventListener('click', function (e) {
      var bt = e.target.closest('.rbtns button');
      if (!bt) return;
      var id = bt.closest('.rcard').dataset.id;
      saved[id] = saved[id] || {};
      saved[id].v = saved[id].v === bt.dataset.v ? '' : bt.dataset.v;
      save(); refresh();
    });
    root.addEventListener('input', function (e) {
      if (e.target.tagName !== 'TEXTAREA') return;
      var id = e.target.closest('.rcard').dataset.id;
      saved[id] = saved[id] || {}; saved[id].note = e.target.value; save();
    });
    document.getElementById('onlyimp').addEventListener('change', function (e) {
      root.querySelectorAll('.rcard').forEach(function (c) { c.style.display = e.target.checked && !c.classList.contains('imp') ? 'none' : ''; });
    });
    document.getElementById('copy').addEventListener('click', function () {
      var ok = [], fix = [], skip = [], none = [];
      items.forEach(function (it) {
        var s = saved[it.id] || {};
        if (s.v === 'ok') ok.push(it.id);
        else if (s.v === 'fix') fix.push('【修正】' + it.id + '：' + (s.note || '（内容未記入）'));
        else if (s.v === 'skip') skip.push(it.id);
        else none.push(it.id);
      });
      var d = new Date();
      var text = G.shop.ja + ' 確認結果 ' + G.version + '（' + (d.getMonth() + 1) + '/' + d.getDate() + '）\n' +
        '確認済み ' + ok.length + '件／修正したい ' + fix.length + '件／使わない ' + skip.length + '件／未確認 ' + none.length + '件\n' +
        fix.join('\n') + (skip.length ? '\n【使わない】' + skip.join(', ') : '') + (none.length ? '\n【未確認】' + none.join(', ') : '');
      var done = function () { document.getElementById('copied').textContent = 'コピーしました。LINEに貼り付けて送ってください。'; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
      } else { fallback(text); done(); }
    });
    function fallback(text) {
      var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(t);
    }
    refresh();
  }

  // ---- 表示 ----
  var root = document.getElementById('app');
  document.documentElement.lang = review ? 'ja' : lang;
  if (review) { renderReview(root); return; }
  store('guide-lang', lang);
  var n = countPlaceholders();
  root.innerHTML = header() +
    (n ? '<div class="unfilled">' + esc(tx(G.ui.unfilled)) + ' (' + n + ')</div>' : '') +
    '<main>' + G.pages[page].map(block).join('') + '</main>';
  document.title = tx(G.shop) + ' — ' + tx(G.ui.tabs[page]);
})();
