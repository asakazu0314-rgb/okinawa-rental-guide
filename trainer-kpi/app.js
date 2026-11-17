// 予実まとめ（試作）
// 予約システムのCSVを読み込み、トレーナーごとの予実を計算して、MTG用の報告文を作る。
// CSVはブラウザの中だけで読む（サーバーに送らない・保存もしない）。目標の数字だけを、この端末に保存する。
(function () {
  var COL = { id: 'ID', st: '状態', date: 'セッション日付', price: 'セッション単価', staffId: 'スタッフ ID', staff: 'スタッフ 名前', cust: '顧客 ID', shop: '店舗 名前', start: 'セッション開始', menu: 'メニュー 名前', custName: '顧客 名前' };
  var DONE = '受講済み', BOOKED = '予約中', CANCEL = 'キャンセル';
  var rows = [];
  var fileNotes = [];  // 読み込んだファイルごとのメモ（期間など）        // 読み込んだセッション（ID で重複を除く）
  var $ = function (id) { return document.getElementById(id); };

  // ---- CSV ----
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    var out = [], row = [], f = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
        else f += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(f); out.push(row); row = []; f = '';
      } else f += c;
    }
    if (f || row.length) { row.push(f); out.push(row); }
    return out.filter(function (r) { return r.length > 1 || r[0]; });
  }
  function addCSV(text, name) {
    var t = parseCSV(text);
    if (!t.length) return 0;
    var head = t[0].map(function (h) { return h.trim(); });
    var need = [COL.st, COL.date, COL.price, COL.staff];
    var miss = need.filter(function (h) { return head.indexOf(h) < 0; });
    if (miss.length) { alert(name + '：この列が見つかりません → ' + miss.join('、')); return 0; }
    var idx = {}; Object.keys(COL).forEach(function (k) { idx[k] = head.indexOf(COL[k]); });
    var seen = {}; rows.forEach(function (r) { if (r.id) seen[r.id] = 1; });
    var n = 0;
    t.slice(1).forEach(function (c) {
      var r = {
        id: idx.id >= 0 ? c[idx.id] : '', st: c[idx.st], date: (c[idx.date] || '').slice(0, 10),
        price: Number(String(c[idx.price] || '0').replace(/[^\d.-]/g, '')) || 0,
        staffId: idx.staffId >= 0 ? c[idx.staffId] : c[idx.staff], staff: c[idx.staff],
        cust: idx.cust >= 0 ? c[idx.cust] : '', shop: idx.shop >= 0 ? c[idx.shop] : '',
        start: idx.start >= 0 ? c[idx.start] : '', menu: idx.menu >= 0 ? c[idx.menu] : '', custName: idx.custName >= 0 ? c[idx.custName] : '',
      };
      if (!r.date || (r.id && seen[r.id])) return;
      if (r.id) seen[r.id] = 1;
      rows.push(r); n++;
    });
    // ファイルの期間を確かめる。セッション日付が2か月以上にまたがるファイルは「予約日時」で書き出した可能性がある
    var ds = t.slice(1).map(function (c) { return (c[idx.date] || '').slice(0, 10); }).filter(Boolean).sort();
    if (ds.length) {
      var span = {}; ds.forEach(function (x) { span[x.slice(0, 7)] = 1; });
      fileNotes.push(name + '：セッション日付 ' + ds[0] + '〜' + ds[ds.length - 1] + '（' + (t.length - 1) + '行）' +
        (Object.keys(span).length > 1 ? ' ⚠️ 月をまたいでいます。「予約日時」で書き出したCSVかもしれません。月の報告には「セッション日付」で書き出したCSVだけを使ってください' : ''));
    }
    return n;
  }

  // ---- 目標（この端末に保存） ----
  function loadGoals() { try { return JSON.parse(localStorage.getItem('kpi-goals') || '{}') || {}; } catch (e) { return {}; } }
  function saveGoals(g) { try { localStorage.setItem('kpi-goals', JSON.stringify(g)); } catch (e) {} }
  var goals = loadGoals();

  // ---- 計算 ----
  function yen(n) { return '¥' + Math.round(n).toLocaleString('ja-JP'); }
  function pct(a, b) { return b ? Math.round(a / b * 100) : null; }
  function staffList() {
    var m = {};
    rows.forEach(function (r) { m[r.staffId] = r.staff; });
    return Object.keys(m).map(function (id) { return { id: id, name: m[id] }; }).sort(function (a, b) { return a.name.localeCompare(b.name, 'ja'); });
  }
  function months() {
    var m = {}; rows.forEach(function (r) { m[r.date.slice(0, 7)] = 1; });
    return Object.keys(m).sort();
  }
  // ---- セッション数の数え方（Gymsのエクスポート用） ----
  // ・集計は必ず「セッション日付／セッション開始」を基準にする（「予約日時」は申し込んだ日なので使わない）
  // ・同じトレーナー・同じセッション日付・同じ開始時刻を「1つの枠」とみる
  // ・枠の中で、メニュー名に「ペア」「3人」を含むお客様が2人以上 → ペア／グループとして1本
  // ・メニューがマンツーマンのお客様は、同じ時間でも別々の1人セッション → 1人ずつ1本
  //   （設定「同じ時間のマンツーマンも1本」をオンにすると、枠ごとに1本）
  // ・同じお客様が同じ枠に何行もある（キャンセル→再予約など）ときは1人として数える
  // 売上は、お客様ごとのセッション単価の合計（同じ枠の重複行は1回）
  function isGroupMenu(m) { return /ペア|3人/.test(m || ''); }
  function soloAsOne() { try { return localStorage.getItem('kpi-solo-one') !== '0'; } catch (e) { return true; } }
  function countSlots(list) {
    var slots = {}, n = 0, sales = 0, groups = 0, shared = 0, one = soloAsOne();
    list.forEach(function (r, i) {
      var k = r.staffId + '|' + r.date + '|' + (r.start || ('row' + i));
      var who = r.cust || r.custName || ('row' + i);
      slots[k] = slots[k] || {};
      if (!slots[k][who]) slots[k][who] = r;
    });
    Object.keys(slots).forEach(function (k) {
      var people = Object.keys(slots[k]).map(function (w) { return slots[k][w]; });
      people.forEach(function (r) { sales += r.price; });
      var grp = people.filter(function (r) { return isGroupMenu(r.menu); });
      var solo = people.length - grp.length;
      if (grp.length >= 2) { n += 1; groups++; } else n += grp.length;
      if (solo >= 2) shared++;
      n += one && solo >= 2 ? 1 : solo;
    });
    return { n: n, sales: sales, groups: groups, shared: shared };
  }
  function today() { var t = new Date(); return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }
  function calc(month, staffId) {
    var d = [], b = [], c = [], cust = {};
    rows.forEach(function (r) {
      if (r.date.slice(0, 7) !== month || (staffId && r.staffId !== staffId)) return;
      // 実施済みは「本日分を含む」：今日の予約中も実施済みに入れる
      if (r.st === DONE || (r.st === BOOKED && r.date <= today())) { d.push(r); cust[r.cust] = 1; }
      else if (r.st === BOOKED) { b.push(r); cust[r.cust] = 1; }
      else if (r.st === CANCEL) c.push(r);
    });
    var D = countSlots(d), B = countSlots(b), Cn = countSlots(c);
    var s = { done: D.n, doneSales: D.sales, booked: B.n, bookedSales: B.sales, cancel: Cn.n,
      groups: D.groups + B.groups, shared: D.shared + B.shared };
    s.clients = Object.keys(cust).filter(Boolean).length;
    s.sess = s.done + s.booked; s.sales = s.doneSales + s.bookedSales;
    return s;
  }
  // 月の何日目まで来たか（今日を含む）
  function progress(month) {
    var y = +month.slice(0, 4), mo = +month.slice(5, 7), days = new Date(y, mo, 0).getDate();
    var t = new Date(), cur = t.getFullYear() === y && t.getMonth() + 1 === mo;
    var past = new Date(y, mo - 1, 1) < new Date(t.getFullYear(), t.getMonth(), 1);
    var d = cur ? t.getDate() : past ? days : 0;
    return { days: days, day: d, rate: d / days, left: Math.max(days - d, 0) };
  }
  function goalOf(month, id) { return ((goals[month] || {})[id]) || {}; }

  // ---- 画面 ----
  function renderGoals(month) {
    var st = staffList();
    var h = '<tr><th>トレーナー</th><th>セッション目標</th><th>売上目標（円）</th><th>新規 目標</th><th>新規 実績</th></tr>';
    st.forEach(function (p) {
      var g = goalOf(month, p.id);
      h += '<tr><td>' + esc(p.name) + '</td>' + ['sess', 'sales', 'newGoal', 'newAct'].map(function (k) {
        return '<td><input type="number" inputmode="numeric" min="0" data-id="' + esc(p.id) + '" data-k="' + k + '" value="' + (g[k] != null ? g[k] : '') + '"></td>';
      }).join('') + '</tr>';
    });
    $('goals').innerHTML = h;
  }
  function metric(label, actual, forecast, goal, fmt, pace) {
    var a = pct(actual, goal), f = pct(forecast, goal);
    var cls = f == null ? '' : f >= 100 ? 'ok' : f >= 90 ? 'warn' : 'bad';
    return '<div class="metric"><div class="lbl"><span>' + label + '</span><span>目標 ' + (goal ? fmt(goal) : '未入力') + '</span></div>' +
      '<div class="val">' + fmt(actual) + ' <span class="small">実施済み（本日分含む）' + (a != null ? '（' + a + '%）' : '') + '</span></div>' +
      (goal ? '<div class="bar"><b style="width:' + Math.min(f, 100) + '%"></b><i style="width:' + Math.min(a, 100) + '%"></i><span class="pace" style="left:' + Math.min(pace * 100, 100) + '%"></span></div>' : '') +
      '<div class="small">予約済み ' + fmt(forecast - actual) + '　着地見込み ' + fmt(forecast) + (f != null ? ' <b class="' + cls + '">（' + f + '%）</b>' : '') + '</div></div>';
  }
  function card(name, s, g, pr, total) {
    var newLine = (g.newGoal || g.newAct) ? '<div class="small">新規：' + (g.newAct || 0) + '人' + (g.newGoal ? ' ／ 目標 ' + g.newGoal + '人（' + pct(g.newAct || 0, g.newGoal) + '%）' : '') + '</div>' : '';
    var need = g.sess && pr.left ? Math.max(g.sess - s.sess, 0) : 0;
    return '<div class="kc' + (total ? ' total' : '') + '"><h3><span>' + esc(name) + '</span><span class="small">お客様 ' + s.clients + '人</span></h3>' +
      metric('売上', s.doneSales, s.sales, +g.sales || 0, yen, pr.rate) +
      metric('セッション', s.done, s.sess, +g.sess || 0, function (n) { return n + '本'; }, pr.rate) +
      newLine + '<div class="small">ペア・グループ ' + s.groups + '本' + (s.shared ? '　同じ時間のマンツーマン ' + s.shared + '枠' : '') + '</div><div class="small">キャンセル ' + s.cancel + '件' + (need ? '　／　目標まであと ' + need + '本（予約で）' : '') + '</div></div>';
  }
  function sumGoals(month, st) {
    var t = { sess: 0, sales: 0, newGoal: 0, newAct: 0 };
    st.forEach(function (p) { var g = goalOf(month, p.id); Object.keys(t).forEach(function (k) { t[k] += +g[k] || 0; }); });
    return t;
  }
  function render() {
    var month = $('month').value; if (!month) return;
    var st = staffList(), pr = progress(month);
    $('asof').textContent = month.replace('-', '年') + '月　' + (pr.day ? pr.day + '日目／' + pr.days + '日（グラフの黒い線＝今日までの日数の割合）' : 'まだ始まっていない月です');
    var tot = calc(month), tg = sumGoals(month, st);
    $('cards').innerHTML = card('店舗合計', tot, tg, pr, true) + st.map(function (p) { return card(p.name, calc(month, p.id), goalOf(month, p.id), pr); }).join('');
    $('report').textContent = report(month, st, pr, tot, tg);
  }
  function line(name, s, g) {
    var out = '■' + name + '\n' +
      '　売上　実績 ' + yen(s.doneSales) + (g.sales ? '（' + pct(s.doneSales, g.sales) + '%）' : '') + '／予約済み ' + yen(s.bookedSales) + '／着地見込み ' + yen(s.sales) + (g.sales ? '（' + pct(s.sales, g.sales) + '%）／目標 ' + yen(g.sales) : '') + '\n' +
      '　セッション　実施済み（本日分含む） ' + s.done + '本／予約済み ' + s.booked + '本／着地見込み ' + s.sess + '本' + (g.sess ? '（' + pct(s.sess, g.sess) + '%）／目標 ' + g.sess + '本' : '') + '\n';
    if (g.newGoal || g.newAct) out += '　新規 ' + (g.newAct || 0) + '人' + (g.newGoal ? '／目標 ' + g.newGoal + '人' : '') + '\n';
    out += '　キャンセル ' + s.cancel + '件　お客様 ' + s.clients + '人\n';
    return out;
  }
  function report(month, st, pr, tot, tg) {
    var m = +month.slice(5, 7), d = new Date();
    var head = '【' + m + '月 予実】' + (pr.day && pr.day < pr.days ? (d.getMonth() + 1) + '/' + d.getDate() + '時点（' + pr.day + '/' + pr.days + '日）' : '') + '\n';
    var body = line('店舗合計', tot, tg) + st.map(function (p) { return line(p.name, calc(month, p.id), goalOf(month, p.id)); }).join('');
    var gap = st.map(function (p) {
      var g = goalOf(month, p.id), s = calc(month, p.id);
      return g.sess && s.sess < g.sess ? '・' + p.name + '：目標まであと ' + (g.sess - s.sess) + '本の予約が必要' : '';
    }).filter(Boolean);
    return head + body + (gap.length ? '■要点（着地見込みが目標に届いていない人）\n' + gap.join('\n') : '');
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function afterLoad() {
    var ms = months();
    $('loaded').innerHTML = esc(rows.length + '件のセッションを読み込みました（トレーナー ' + staffList().length + '人）') + '<br>' + fileNotes.map(esc).join('<br>');
    if (!ms.length) return;
    var now = new Date(), cur = now.getFullYear() + '-' + ('0' + (now.getMonth() + 1)).slice(-2);
    $('month').innerHTML = ms.map(function (m) { return '<option value="' + m + '"' + (m === cur ? ' selected' : '') + '>' + m.replace('-', '年') + '月</option>'; }).join('');
    ['step2', 'step3', 'step4'].forEach(function (id) { $(id).hidden = false; });
    renderGoals($('month').value); render();
  }

  // ---- 操作 ----
  $('files').addEventListener('change', function (e) {
    var fs = Array.prototype.slice.call(e.target.files), left = fs.length;
    fs.forEach(function (f) {
      var rd = new FileReader();
      rd.onload = function () { addCSV(rd.result, f.name); if (!--left) afterLoad(); };
      rd.readAsText(f, 'utf-8');
    });
    e.target.value = '';
  });
  $('demo').addEventListener('click', function () {
    Promise.all(['demo-a.csv', 'demo-b.csv', 'demo-c.csv'].map(function (u) { return fetch(u).then(function (r) { return r.text(); }); }))
      .then(function (ts) {
        rows = []; fileNotes = []; ts.forEach(function (t, i) { addCSV(t, 'demo' + i); });
        // 架空の目標（試す用）
        var m = '2026-11';
        if (!goals[m]) { goals[m] = { S01: { sess: 160, sales: 650000, newGoal: 4, newAct: 2 }, S02: { sess: 110, sales: 420000, newGoal: 3, newAct: 3 }, S03: { sess: 90, sales: 360000, newGoal: 3, newAct: 1 } }; saveGoals(goals); }
        afterLoad();
      }).catch(function () { alert('架空のデータを読み込めませんでした'); });
  });
  var soloBox = $('soloone');
  if (soloBox) { soloBox.checked = soloAsOne(); soloBox.addEventListener('change', function () { try { localStorage.setItem('kpi-solo-one', soloBox.checked ? '1' : '0'); } catch (e) {} render(); }); }
  $('month').addEventListener('change', function () { renderGoals($('month').value); render(); });
  $('goals').addEventListener('input', function (e) {
    var el = e.target; if (!el.dataset.id) return;
    var m = $('month').value; goals[m] = goals[m] || {}; goals[m][el.dataset.id] = goals[m][el.dataset.id] || {};
    goals[m][el.dataset.id][el.dataset.k] = el.value === '' ? null : Number(el.value);
    saveGoals(goals); render();
  });
  $('copy').addEventListener('click', function () {
    var t = $('report').textContent, ok = function () { $('copymsg').textContent = 'コピーしました。LINEやメールに貼り付けてください。'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, ok); else ok();
  });
  $('print').addEventListener('click', function () { window.print(); });
})();
