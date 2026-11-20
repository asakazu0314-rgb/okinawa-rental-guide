// セッション頻度表：取り込んだCSV（app.js が読み込んだもの）から、会員ごとの頻度を自動で計算して表にする
//  ・主データ＝セッション日のファイル：今月回数・週別回数・平均間隔・週あたり回数（キャンセルは除外）
//  ・補助データ＝予約実行日のファイル：次回予約日だけに使う（回数には数えない。IDの重複は1回）
//  ・先月のセッション日のファイルがあれば、先月の平均間隔と比べて頻度UP/DOWN
//  ・手入力は区分・ランク・目標回数だけ（このiPadの localStorage に、顧客IDで保存）
(function () {
  var K = window.KPI; if (!K) return;
  var $ = function (id) { return document.getElementById(id); };
  var esc = K.esc;
  var KBN = ['既存', '法人契約', '新規', '休会', '離脱'], RANK = ['S', 'A', 'B', 'C', 'D'];
  function L(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }
  function S(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var store = L('kpi-freq', {});              // 顧客ID → { kbn, rank, goal: { 'YYYY-MM': 回数 } }
  var ui = { sort: null, dir: 1, q: '', kbn: '' };
  var month = '', last = [];

  function setting(id) { return store[id] || {}; }
  function save(id, k, v) { store[id] = store[id] || {}; store[id][k] = v; S('kpi-freq', store); }
  function daysIn(m) { return new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate(); }
  function prevMonth(m) { var d = new Date(+m.slice(0, 4), +m.slice(5, 7) - 2, 1); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2); }
  function dayDiff(a, b) { return (Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000; }
  function avgGap(dates) { if (dates.length < 2) return null; var t = 0; for (var i = 1; i < dates.length; i++) t += dayDiff(dates[i - 1], dates[i]); return t / (dates.length - 1); }
  function f1(v) { return v == null || !isFinite(v) ? '—' : v.toFixed(1); }
  // ランクは自動：D＝離脱（区分）、S＝週3以上（平均間隔2.5日以下）、A＝週2（4.0日以下）、B＝週1（8.0日以下）、C＝週1より少ない（それ以上・1回だけ）
  var RANKDEF = { S: '週3以上（平均間隔2.5日以下）', A: '週2（4.0日以下）', B: '週1（8.0日以下）', C: '週1以下（8.0日より長い・今月1回だけ）', D: '離脱' };
  function autoRank(kbn, gap) { if (kbn === '離脱') return 'D'; if (gap == null) return 'C'; return gap <= 2.5 ? 'S' : gap <= 4 ? 'A' : gap <= 8 ? 'B' : 'C'; }
  var WD = ['日', '月', '火', '水', '木', '金', '土'];

  // 主データ（セッション日のファイル）の、ある月の有効な行（キャンセル除外・IDの重複除外）
  function sessionRows(m) {
    var seen = {};
    return K.rows.filter(function (r) {
      if (r.src !== 'session' || r.date.slice(0, 7) !== m || r.st === K.CANCEL) return false;
      if (r.id) { if (seen[r.id]) return false; seen[r.id] = 1; }
      return true;
    });
  }
  function build(m) {
    var rs = sessionRows(m), byC = {}, days = daysIn(m), today = K.today();
    rs.forEach(function (r) { (byC[r.cust] = byC[r.cust] || { id: r.cust, name: r.custName || r.cust, rows: [] }).rows.push(r); });
    // 先月（先月のセッション日のファイルが取り込まれているときだけ）
    var pm = prevMonth(m), prevRows = sessionRows(pm), hasPrev = prevRows.length > 0, prevBy = {};
    prevRows.forEach(function (r) { (prevBy[r.cust] = prevBy[r.cust] || []).push(r.date); });
    // 次回予約日：今日以降でいちばん早い予約（予約実行日のファイル＋セッション日のファイルの予約。IDは1回だけ）
    var next = {}, seenId = {};
    K.rows.forEach(function (r) {
      if (r.st === K.CANCEL || r.date < today || (r.id && seenId[r.id])) return;
      if (r.id) seenId[r.id] = 1;
      if (!next[r.cust] || r.date < next[r.cust]) next[r.cust] = r.date;
    });
    return Object.keys(byC).map(function (id) {
      var c = byC[id];
      c.rows.sort(function (a, b) { return (a.start || a.date) < (b.start || b.date) ? -1 : 1; });
      var dates = c.rows.map(function (r) { return r.date; }), wk = [0, 0, 0, 0, 0];
      dates.forEach(function (d) { wk[Math.min(4, Math.floor((+d.slice(8, 10) - 1) / 7))]++; });
      var gap = avgGap(dates), pd = (prevBy[id] || []).slice().sort(), pg = avgGap(pd);
      var trend = '';
      if (hasPrev && gap != null && pg != null) trend = Math.abs(gap - pg) < 0.5 ? '変わらず' : gap < pg ? '頻度UP' : '頻度DOWN';
      var st = setting(id), goal = (st.goal || {})[m], byDay = {};
      c.rows.forEach(function (r) { var d = +r.date.slice(8, 10), done = r.st === K.DONE || r.date <= today; byDay[d] = byDay[d] || { n: 0, done: true }; byDay[d].n++; if (!done) byDay[d].done = false; });
      return {
        id: id, name: c.name, rows: c.rows, dates: dates, count: dates.length, wk: wk, gap: gap, perWeek: dates.length * 7 / days,
        prevGap: pg, trend: trend, next: next[id] || '', kbn: st.kbn || '既存', rank: autoRank(st.kbn || '既存', gap), byDay: byDay,
        goal: goal != null && goal !== '' ? +goal : null,
        remain: goal != null && goal !== '' ? Math.max(0, +goal - dates.length) : null,
        pace: goal ? days / +goal : null
      };
    }).concat([]).filter(Boolean).map(function (x) { x.hasPrev = hasPrev; return x; });
  }

  // ---- 並び替え・絞り込み ----
  var COLS = [
    ['kbn', '区分'], ['name', '氏名'], ['rank', 'ランク'], ['days', ''],
    ['w0', '1週目'], ['w1', '2週目'], ['w2', '3週目'], ['w3', '4週目'], ['w4', '5週目'],
    ['count', '今月回数'], ['gap', '平均間隔（日）'], ['perWeek', '週あたり回数'], ['prevGap', '前月平均（日）'], ['trend', '頻度UP/DOWN'],
    ['next', '次回予約日'], ['goal', '目標'], ['remain', '残り'], ['pace', '目標ペース（日）']
  ];
  function sortVal(x, k) {
    if (k === 'kbn') return KBN.indexOf(x.kbn);
    if (k === 'rank') return RANK.indexOf(x.rank);
    if (k === 'dates') return x.dates[0] || '';
    if (k[0] === 'w' && k.length === 2) return x.wk[+k[1]];
    var v = x[k]; return v == null || v === '' ? null : v;
  }
  function sorted(list) {
    var k = ui.sort;
    return list.slice().sort(function (a, b) {
      if (!k) { // 初期：区分の順 → 平均間隔の短い順（1回だけの人は後ろ）
        var d = KBN.indexOf(a.kbn) - KBN.indexOf(b.kbn); if (d) return d;
        return (a.gap == null ? 999 : a.gap) - (b.gap == null ? 999 : b.gap) || a.name.localeCompare(b.name, 'ja');
      }
      var va = sortVal(a, k), vb = sortVal(b, k);
      if (va == null && vb == null) return 0; if (va == null) return 1; if (vb == null) return -1; // 空欄は常に下
      return (va < vb ? -1 : va > vb ? 1 : 0) * ui.dir;
    });
  }

  // ---- 表示 ----
  function render(m) {
    month = m || K.month();
    var box = $('freq'); if (!box) return;
    if (!K.rows.length || !month) { box.innerHTML = '<p class="empty">先にCSVを取り込んでください（右上の「CSVを読み込み直す」→ セッション日・予約実行日のファイルを選ぶ）。</p>'; return; }
    var list = build(month);
    if (!list.length) { box.innerHTML = '<p class="empty">' + month.replace('-', '年') + '月のセッション日のファイルが取り込まれていません。セッション日のファイルを取り込んでください。</p>'; return; }
    last = list;
    var hasPrev = list[0].hasPrev, days = daysIn(month);
    // 取り込み元の表示
    var src = K.files.filter(function (f) { return f.src === 'session' && f.months[month]; }).map(function (f) { return esc(f.name) + '／' + month.replace('-', '年') + '月／' + f.rows + '件から作成'; });
    var aux = K.files.filter(function (f) { return f.src === 'booking'; }).map(function (f) { return esc(f.name); });
    var prevF = hasPrev ? K.files.filter(function (f) { return f.src === 'session' && f.months[prevMonth(month)]; }).map(function (f) { return esc(f.name); }) : [];
    // サマリー
    var rankN = { S: 0, A: 0, B: 0, C: 0, D: 0 }, two = 0, one = 0, total = 0;
    list.forEach(function (x) { rankN[x.rank] = (rankN[x.rank] || 0) + 1; total += x.count; if (x.gap != null) { if (x.gap <= 4) two++; else if (x.gap <= 8) one++; } });
    var h = '<p class="srcline">📄 ' + src.join('、') + (aux.length ? '　｜　次回予約日：' + aux.join('、') : '') + (prevF.length ? '　｜　前月：' + prevF.join('、') : '') + '</p>';
    h += '<div class="tiles ftiles">' +
      '<div class="tile"><span class="tl">会員数（組数）</span><span class="tv">' + list.length + '</span></div>' +
      '<div class="tile"><span class="tl">合計セッション数</span><span class="tv">' + total + '</span></div>' +
      '<div class="tile"><span class="tl">週2ペース以上（平均4.0日以下）</span><span class="tv">' + two + '<small>人</small></span></div>' +
      '<div class="tile"><span class="tl">週1ペース（4.0〜8.0日）</span><span class="tv">' + one + '<small>人</small></span></div>' +
      '<div class="tile rtile"><span class="tl">ランク別人数</span><span class="rks">' + RANK.map(function (r) { return '<span class="rk rk-' + r + '" title="' + RANKDEF[r] + '">' + r + ' ' + rankN[r] + '</span>'; }).join('') + '</span></div></div>';
    h += '<div class="fcontrols"><input type="search" id="fq" placeholder="氏名で検索" value="' + esc(ui.q) + '"><select id="fk"><option value="">区分：すべて</option>' +
      KBN.map(function (k) { return '<option' + (ui.kbn === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select>' +
      (ui.sort ? '<button type="button" class="ghost mini" id="fsortreset">並びを初期に戻す</button>' : '') + '<span class="sub">見出しを押すと並び替え。行を押すと詳細。</span></div>';
    var shown = sorted(list).filter(function (x) { return (!ui.q || x.name.indexOf(ui.q) >= 0) && (!ui.kbn || x.kbn === ui.kbn); });
    var cols = COLS.filter(function (c) { return hasPrev || (c[0] !== 'prevGap' && c[0] !== 'trend'); });
    var y = +month.slice(0, 4), mo = +month.slice(5, 7), DAYS = []; for (var dd = 1; dd <= days; dd++) DAYS.push(dd);
    function dayCls(d) { var w = new Date(y, mo - 1, d).getDay(); return 'dc' + (w === 0 ? ' sun' : w === 6 ? ' sat' : '') + (d % 7 === 1 && d > 1 ? ' wkstart' : ''); }
    h += '<div class="ftable"><table class="ft"><thead><tr>' + cols.map(function (c, i) {
      if (c[0] === 'days') return DAYS.map(function (d) { return '<th class="' + dayCls(d) + '">' + d + '<small>' + WD[new Date(y, mo - 1, d).getDay()] + '</small></th>'; }).join('');
      return '<th data-sort="' + c[0] + '" class="' + (i < 2 ? 'stk' + i : '') + (ui.sort === c[0] ? ' sorted' : '') + '">' + c[1] + (ui.sort === c[0] ? (ui.dir > 0 ? ' ▲' : ' ▼') : '') + '</th>';
    }).join('') + '</tr></thead><tbody>' + shown.map(function (x) {
      var td = {
        kbn: '<select data-set="kbn" data-id="' + esc(x.id) + '">' + KBN.map(function (k) { return '<option' + (x.kbn === k ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select>',
        name: '<b>' + esc(x.name) + '</b>',
        rank: '<span class="rk rkbig rk-' + x.rank + '" title="' + RANKDEF[x.rank] + '">' + x.rank + '</span>',
        count: '<b>' + x.count + '</b>', gap: f1(x.gap), perWeek: f1(x.perWeek), prevGap: f1(x.prevGap),
        trend: x.trend ? '<span class="tr tr-' + (x.trend === '頻度UP' ? 'up' : x.trend === '頻度DOWN' ? 'down' : 'flat') + '">' + x.trend + '</span>' : '—',
        next: x.next ? +x.next.slice(5, 7) + '/' + +x.next.slice(8, 10) : '<span class="dim2">未予約</span>',
        goal: '<input type="number" inputmode="numeric" min="0" data-set="goal" data-id="' + esc(x.id) + '" value="' + (x.goal != null ? x.goal : '') + '">',
        remain: x.remain != null ? x.remain : '—', pace: x.pace != null ? x.pace.toFixed(2) : '—'
      };
      return '<tr data-row="' + esc(x.id) + '">' + cols.map(function (c, i) {
        var k = c[0];
        if (k === 'days') return DAYS.map(function (d) { var b = x.byDay[d]; return '<td class="' + dayCls(d) + '">' + (b ? '<span class="dot' + (b.done ? '' : ' bk') + '">' + (b.n > 1 ? b.n : '') + '</span>' : '') + '</td>'; }).join('');
        var v = k[0] === 'w' && k.length === 2 ? (x.wk[+k[1]] || '') : td[k];
        return '<td class="' + (i < 2 ? 'stk' + i : '') + '">' + v + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody></table></div>' +
      '<p class="sub">平均間隔＝隣り合うセッション日の差の平均（1回だけの人は「—」）。週あたり回数＝今月回数×7÷' + days + '日。目標ペース＝' + days + '日÷目標回数（何日に1回なら届くか）。●＝実施済み（本日分含む）、○＝これからの予約、数字＝同じ日に複数回。ランクは自動：S＝週3以上（平均間隔2.5日以下）、A＝週2（4.0日以下）、B＝週1（8.0日以下）、C＝週1以下（それより長い・今月1回だけ）、D＝区分が離脱。</p>';
    // 入力や選択で描き直しても、表示位置（画面と表の横・縦スクロール）が動かないようにする
    var ft = box.querySelector('.ftable'), sx = ft ? ft.scrollLeft : 0, sy = ft ? ft.scrollTop : 0, wy = window.scrollY;
    box.innerHTML = h;
    ft = box.querySelector('.ftable'); if (ft) { ft.scrollLeft = sx; ft.scrollTop = sy; }
    window.scrollTo(window.scrollX, wy);
  }
  // 氏名検索は描き直さずに、行の表示／非表示だけ切り替える（入力中に位置もキーボードも動かない）
  function filterRows() {
    document.querySelectorAll('#freq tbody tr[data-row]').forEach(function (tr) {
      var x = last.filter(function (y) { return y.id === tr.dataset.row; })[0];
      tr.hidden = !!(x && ui.q && x.name.indexOf(ui.q) < 0);
    });
  }
  function detail(id) {
    var x = last.filter(function (y) { return y.id === id; })[0]; if (!x) return;
    var bg = document.createElement('div'); bg.className = 'fmodal';
    bg.innerHTML = '<div class="fbox"><h3>' + esc(x.name) + '<small>' + month.replace('-', '年') + '月　' + x.count + '回</small></h3><table class="ft small"><thead><tr><th>日付</th><th>時刻</th><th>担当スタッフ</th><th>メニュー</th><th>状態</th></tr></thead><tbody>' +
      x.rows.map(function (r) { return '<tr><td>' + +r.date.slice(5, 7) + '/' + +r.date.slice(8, 10) + '</td><td>' + esc((r.start || '').slice(11, 16)) + '</td><td>' + esc(r.staff || '') + '</td><td class="l">' + esc(r.menu || '') + '</td><td>' + esc(r.st) + '</td></tr>'; }).join('') +
      '</tbody></table><button type="button" class="ghost" data-close>閉じる</button></div>';
    bg.addEventListener('click', function (e) { if (e.target === bg || e.target.hasAttribute('data-close')) bg.remove(); });
    document.body.appendChild(bg);
  }

  // ---- 操作 ----
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t.closest || !t.closest('#freq')) return;
    if (t.id === 'fk') { ui.kbn = t.value; render(month); return; }
    if (t.dataset.set) {
      var id = t.dataset.id;
      if (t.dataset.set === 'goal') { var st = setting(id), g = st.goal || {}; if (t.value === '') delete g[month]; else g[month] = +t.value; save(id, 'goal', g); }
      else save(id, t.dataset.set, t.value);
      render(month);
    }
  });
  document.addEventListener('input', function (e) { if (e.target.id === 'fq') { ui.q = e.target.value.trim(); filterRows(); } });
  document.addEventListener('click', function (e) {
    var t = e.target; if (!t.closest || !t.closest('#freq')) return;
    if (t.id === 'fsortreset') { ui.sort = null; ui.dir = 1; render(month); return; }
    var th = t.closest('th[data-sort]');
    if (th) { var k = th.dataset.sort; if (ui.sort === k) ui.dir = -ui.dir; else { ui.sort = k; ui.dir = 1; } render(month); return; }
    if (t.closest('select, input, button')) return;
    var tr = t.closest('tr[data-row]'); if (tr) detail(tr.dataset.row);
  });
  window.renderFreq = render;
})();
