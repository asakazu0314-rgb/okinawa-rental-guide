// MTG資料：入金売上・セッション数・入会・カウンセリング・稼働組数を、週ごと（1〜5週目）に表にする
// データ：セッションCSV・チケット一覧（app.js が読み込んだもの）＋このiPadに保存した手入力（目標・流入経路・カウンセリング・備考）
(function () {
  var K = window.KPI; if (!K) return;
  var $ = function (id) { return document.getElementById(id); };
  var esc = K.esc, yen = K.yen;
  var CH = ['オフィシャルLP', 'オフィシャル電話', 'Instagram', 'Threads', '紹介', 'その他'];
  function L(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }
  function S(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var channels = L('kpi-channel', {});   // チケットID → 流入経路（入会）
  var counsel = L('kpi-counsel', {});    // 月 → [{id, date, staff, ch, st:'予定'|'済'}]
  var cfg = L('kpi-mtgcfg', { week: 'thu', staff: '' });
  if (!cfg.weekSet) cfg.week = 'thu'; // 店のMT（毎週木曜）区切りを初期にする
  var month = '';

  // ---- 週の区切り ----
  function weeks(m) {
    var y = +m.slice(0, 4), mo = +m.slice(5, 7), days = new Date(y, mo, 0).getDate(), W = [];
    if (cfg.week === 'thu') {
      // 毎週木曜のMTまで：1週目＝1日〜最初の木曜、2週目＝金〜木 …
      var s0 = 1;
      while (s0 <= days) {
        var dw = new Date(y, mo - 1, s0).getDay(), e0 = Math.min(days, s0 + ((4 - dw + 7) % 7));
        W.push([s0, e0]); s0 = e0 + 1;
      }
      while (W.length > 5) { var lt = W.pop(); W[W.length - 1][1] = lt[1]; }
    } else if (cfg.week === 'mon') {
      var d = 1;
      while (d <= days) {
        var dow = new Date(y, mo - 1, d).getDay(), end = Math.min(days, d + ((7 - dow) % 7)); // 日曜まで
        W.push([d, end]); d = end + 1;
      }
      while (W.length > 5) { var last = W.pop(); W[W.length - 1][1] = last[1]; } // 6週目は5週目にまとめる
    } else {
      for (var s = 1; s <= days; s += 7) W.push([s, Math.min(days, s + 6)]);
      if (W.length > 5) { var l2 = W.pop(); W[W.length - 1][1] = l2[1]; }
    }
    while (W.length < 5) W.push(null);
    return W;
  }
  // 週2／週1の判定に使う期間：月初から7日ずつ（1〜7日／8〜14日…。29日以降は5週目）
  function chunks7(m) {
    var y = +m.slice(0, 4), mo = +m.slice(5, 7), days = new Date(y, mo, 0).getDate(), C = [];
    for (var s1 = 1; s1 <= days && C.length < 5; s1 += 7) C.push([s1, Math.min(days, s1 + 6)]);
    if (C.length === 5) C[4][1] = days;
    while (C.length < 5) C.push(null);
    return C;
  }
  function wk(date, W) { var d = +date.slice(8, 10); for (var i = 0; i < 5; i++) if (W[i] && d >= W[i][0] && d <= W[i][1]) return i; return -1; }
  function wlabel(W, i) { var t = (i + 1) + '週目' + (cfg.week === 'thu' ? 'MT時点' : ''); return W[i] ? t + '<small>' + +month.slice(5, 7) + '/' + W[i][0] + '〜' + W[i][1] + '</small>' : t + '<small>—</small>'; }

  // ---- 実績の集計 ----
  function inStaff(id) { return !cfg.staff || id === cfg.staff; }
  function sessRows() {
    var useS = K.useSrc(month);
    return K.rows.filter(function (r) { return r.date.slice(0, 7) === month && inStaff(r.staffId) && (!useS || r.src === 'session'); });
  }
  function sessions(W) {
    var t = K.today(), done = [[], [], [], [], []], book = [[], [], [], [], []];
    sessRows().forEach(function (r) {
      var i = wk(r.date, W); if (i < 0) return;
      if (r.st === K.DONE || (r.st === K.BOOKED && r.date <= t)) done[i].push(r);
      else if (r.st === K.BOOKED) book[i].push(r);
    });
    var D = done.map(function (l) { return K.countSlots(l).n; }), B = book.map(function (l) { return K.countSlots(l).n; });
    // 各MT時点の着地見込み：その週までに終わった週は実数値、今の週は今日時点の着地見込み、これからの週は空欄
    var tw = wk(t, W), land = sum(D) + sum(B), wsum = W.map(function (w, i) { return !w ? null : (tw < 0 || i <= tw ? land : null); });
    return { done: D, book: B, wsum: wsum };
  }
  function monthTickets() {
    var ow = K.owners();
    return K.tickets.filter(function (k) {
      if (k.date.slice(0, 7) !== month || !K.isCourse(k) || ow[k.cust] === K.EXCL) return false;
      return !cfg.staff || K.ownerOf(k.cust) === cfg.staff;
    });
  }
  function payments(W) {
    var a = [0, 0, 0, 0, 0];
    monthTickets().forEach(function (k) { var i = wk(k.date, W); if (i >= 0) a[i] += k.price; });
    return a;
  }
  function newMembers(W) {
    var a = [0, 0, 0, 0, 0], byCh = {}, seen = {}, list = [];
    monthTickets().forEach(function (k) {
      if (!K.isNewTicket(k) || seen[k.cust]) return;
      seen[k.cust] = 1; list.push(k);
      var i = wk(k.date, W); if (i < 0) return;
      a[i]++;
      var c = channels[k.id] || '未設定';
      byCh[c] = byCh[c] || [0, 0, 0, 0, 0]; byCh[c][i]++;
    });
    return { a: a, byCh: byCh, list: list };
  }
  function counselings(W) {
    var done = [0, 0, 0, 0, 0], plan = [0, 0, 0, 0, 0], byCh = {};
    (counsel[month] || []).forEach(function (c) {
      if (!inStaff(c.staff)) return;
      var i = wk(c.date, W); if (i < 0) return;
      if (c.st === '済') {
        done[i]++;
        byCh[c.ch] = byCh[c.ch] || [0, 0, 0, 0, 0]; byCh[c.ch][i]++;
      } else plan[i]++;
    });
    return { done: done, plan: plan, byCh: byCh };
  }
  // 稼働組数：ペア・3人で一緒に受けているお客様は1組。週のセッション（実施済み＋予約）が2回以上＝週2ペース、1回＝週1ペース
  function activeGroups(W) {
    var rs = sessRows().filter(function (r) { return r.st !== K.CANCEL; }), parent = {};
    function f(x) { while (parent[x] && parent[x] !== x) x = parent[x]; return x; }
    function u(a, b) { a = f(a); b = f(b); if (a !== b) parent[b] = a; }
    var slots = {};
    rs.forEach(function (r) { var k = r.staffId + '|' + r.date + '|' + r.start; (slots[k] = slots[k] || {})[r.cust] = r; });
    Object.keys(slots).forEach(function (k) {
      var g = Object.keys(slots[k]).filter(function (c) { return K.isGroupMenu(slots[k][c].menu); });
      if (g.length >= 2) g.slice(1).forEach(function (c) { u(g[0], c); });
    });
    // 稼働組数：その月に来た（予約を含む）組の数
    var all = {}; Object.keys(slots).forEach(function (k) { Object.keys(slots[k]).forEach(function (c) { all[f(c)] = 1; }); });
    var res = [], monthTotal = Object.keys(all).length;
    for (var i = 0; i < 5; i++) {
      var cnt = {};
      Object.keys(slots).forEach(function (k) {
        var any = slots[k][Object.keys(slots[k])[0]]; if (wk(any.date, W) !== i) return;
        var seen = {};
        Object.keys(slots[k]).forEach(function (c) { var g = f(c); if (!seen[g]) { seen[g] = 1; cnt[g] = (cnt[g] || 0) + 1; } });
      });
      var two = 0, one = 0; Object.keys(cnt).forEach(function (g) { if (cnt[g] >= 2) two++; else one++; });
      res.push(W[i] ? { two: two, one: one, total: monthTotal } : null);
    }
    return res;
  }

  // ---- 目標（週ごと・トレーナーごと） ----
  function gobj(id) { var g = K.goals; g[month] = g[month] || {}; g[month][id] = g[month][id] || {}; var o = g[month][id]; o.W = o.W || {}; return o; }
  function weekGoals(key) {
    var ids = cfg.staff ? [cfg.staff] : K.staffList().map(function (p) { return p.id; }), a = [0, 0, 0, 0, 0], any = false;
    ids.forEach(function (id) { var w = (gobj(id).W[key] || []); for (var i = 0; i < 5; i++) if (w[i] != null && w[i] !== '') { a[i] += +w[i]; any = true; } });
    return any ? a : null;
  }
  function sum(a) { return a.reduce(function (x, y) { return x + (+y || 0); }, 0); }
  function pctS(a, g) { return g ? Math.round(a / g * 100) + '%' : '—'; }
  function cls(a, g) { if (!g) return ''; var p = a / g; return p >= 1 ? 'ok' : p >= 0.8 ? 'warn' : 'bad'; }

  // ---- 表 ----
  function table(o) {
    // o: {key, title, unit(fmt), goal[], actual[], extraRows: [[label, arr, fmt?]]}
    var W = o.W, fmt = o.fmt, editable = !!cfg.staff, G = o.goal, gt = G ? sum(G) : 0, at = sum(o.actual);
    var h = '<table class="mt"><thead><tr><th></th>' + [0, 1, 2, 3, 4].map(function (i) { return '<th>' + wlabel(W, i) + '</th>'; }).join('') + '<th>合計</th><th>達成率</th></tr></thead><tbody>';
    h += '<tr><th>今月目標</th>' + [0, 1, 2, 3, 4].map(function (i) {
      var v = cfg.staff ? ((gobj(cfg.staff).W[o.key] || [])[i]) : (G ? G[i] : null);
      return '<td>' + (editable && W[i] ? '<input type="number" inputmode="numeric" min="0" data-g="' + o.key + '" data-i="' + i + '" value="' + (v != null && v !== '' ? v : '') + '">' : (v ? fmt(v) : '')) + '</td>';
    }).join('') + '<td><b>' + (G ? fmt(gt) : '—') + '</b></td><td></td></tr>';
    h += '<tr class="act"><th>実数値</th>' + o.actual.map(function (v, i) { return '<td>' + (W[i] ? fmt(v) : '') + '</td>'; }).join('') +
      '<td><b>' + fmt(at) + '</b></td><td><b class="' + cls(at, gt) + '">' + pctS(at, gt) + '</b></td></tr>';
    (o.extra || []).forEach(function (x) {
      h += '<tr class="sub2"><th>' + x[0] + '</th>' + x[1].map(function (v, i) { return '<td>' + (W[i] && v != null ? (x[2] || fmt)(v) : '') + '</td>'; }).join('') + '<td>' + (x[3] != null ? x[3] : (x[2] || fmt)(sum(x[1]))) + '</td><td></td></tr>';
    });
    return h + '</tbody></table>';
  }
  function chTable(W, byCh, label) {
    var keys = CH.concat(Object.keys(byCh).filter(function (c) { return CH.indexOf(c) < 0; }));
    return '<table class="mt ch"><thead><tr><th>' + label + '</th>' + [0, 1, 2, 3, 4].map(function (i) { return '<th>' + (i + 1) + '週目</th>'; }).join('') + '<th>合計</th></tr></thead><tbody>' +
      keys.map(function (c) { var a = byCh[c] || [0, 0, 0, 0, 0]; return '<tr' + (c === '未設定' ? ' class="warnrow"' : '') + '><th>' + esc(c) + '</th>' + a.map(function (v, i) { return '<td>' + (W[i] ? v : '') + '</td>'; }).join('') + '<td><b>' + sum(a) + '</b></td></tr>'; }).join('') +
      '</tbody></table>';
  }
  function note(key) {
    var v = cfg.staff ? (gobj(cfg.staff)[key] || '') : '';
    return '<label class="mnote">備考<textarea data-n="' + key + '" rows="2"' + (cfg.staff ? '' : ' disabled placeholder="トレーナーを選ぶと書けます"') + '>' + esc(v) + '</textarea></label>';
  }
  function n(v) { return String(v); }
  function sessFormula(two, one) { return two * 8 + one * 2; } // 管理表と同じ：週2×8＋週1×2
  function sumGoalField(f) { var t = 0, any = false; K.staffList().forEach(function (p) { var v = gobj(p.id)[f]; if (v != null && v !== '') { t += +v; any = true; } }); return any ? t : null; }
  function weekNotes(key, title, W) {
    var o = cfg.staff ? gobj(cfg.staff) : null, arr = o ? (o[key] || []) : [];
    return '<h3 class="mh">' + title + '</h3>' + [0, 1, 2, 3, 4].map(function (i) {
      return '<label class="mnote wn"><span>' + wlabel(W, i) + '</span><textarea rows="2" data-wn="' + key + '" data-i="' + i + '"' + (o ? '' : ' disabled placeholder="トレーナーを選ぶと書けます"') + '>' + esc(arr[i] || '') + '</textarea></label>';
    }).join('');
  }

  function render(m) {
    month = m; if (!month) return;
    var box = $('mtg'); if (!box) return;
    var st = K.staffList();
    if (cfg.staff && !st.some(function (p) { return p.id === cfg.staff; })) cfg.staff = '';
    if (!cfg.staff && st.length === 1 && !cfg.chose) cfg.staff = st[0].id; // トレーナーが1人なら、その人を最初から選ぶ
    $('mstaff').innerHTML = '<option value="">店舗合計（目標は見るだけ）</option>' + st.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === cfg.staff ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
    $('mweek').value = cfg.week;
    var W = weeks(month), P = payments(W), SE = sessions(W), NM = newMembers(W), CO = counselings(W), C7 = chunks7(month), AG = activeGroups(C7);
    var payLand = cfg.staff ? gobj(cfg.staff).payLand : null;
    var sessLand = sum(SE.done) + sum(SE.book), sg = weekGoals('sess'), pg = weekGoals('pay');
    var h = '';
    h += '<h3 class="mh">【入金売上】</h3>' + '<div class="tablewrap">' + table({ key: 'pay', W: W, fmt: yen, goal: pg, actual: P }) + '</div>' +
      '<p class="land">今月着地予定：' + (cfg.staff ? '<input type="number" inputmode="numeric" min="0" class="landin" data-l="payLand" value="' + (payLand != null && payLand !== '' ? payLand : '') + '" placeholder="' + sum(P) + '"> 円' : yen(sum(P))) +
      (pg && (payLand || sum(P)) ? '　<b class="' + cls(+payLand || sum(P), sum(pg)) + '">' + pctS(+payLand || sum(P), sum(pg)) + '</b>' : '') + '<small>（空欄なら実数値と同じ）</small></p>' + note('payNote');
    h += '<h3 class="mh">【セッション数】</h3>' + '<div class="tablewrap">' + table({ key: 'sess', W: W, fmt: n, goal: sg, actual: SE.done, extra: [['予約（これから）', SE.book]] }) + '</div>' +
      '<p class="land">今月着地予定：<b>' + sessLand + '本</b>' + (sg ? '　<b class="' + cls(sessLand, sum(sg)) + '">' + pctS(sessLand, sum(sg)) + '</b>' : '') + '<small>（実数値＋これからの予約。実数値は本日分を含む）</small></p>' + note('sessNote');
    // 【入会目標及び実数値】当月新規目標は月で1つ。週ごとの実数値を流入経路別に
    var ng = cfg.staff ? gobj(cfg.staff).newGoal : sumGoalField('newGoal');
    h += '<h3 class="mh">【入会目標及び実数値】<small>新規獲得目標件数と、達成するための行動も備考に</small></h3><div class="tablewrap"><table class="mt"><thead><tr><th></th><th>当月新規目標</th>' +
      [0, 1, 2, 3, 4].map(function (i) { return '<th>' + wlabel(W, i) + '</th>'; }).join('') + '<th>合計</th><th>達成率</th></tr></thead><tbody>' +
      '<tr class="act"><th>合計</th><td>' + (cfg.staff ? '<input type="number" inputmode="numeric" min="0" data-f="newGoal" value="' + (ng != null && ng !== '' ? ng : '') + '">' : (ng || '—')) + '</td>' +
      NM.a.map(function (v, i) { return '<td>' + (W[i] ? v : '') + '</td>'; }).join('') + '<td><b>' + sum(NM.a) + '</b></td><td><b class="' + cls(sum(NM.a), +ng) + '">' + pctS(sum(NM.a), +ng) + '</b></td></tr>' +
      CH.concat(NM.byCh['未設定'] ? ['未設定'] : []).map(function (c) { var a2 = NM.byCh[c] || [0, 0, 0, 0, 0]; return '<tr' + (c === '未設定' ? ' class="warnrow"' : '') + '><th>' + c + '</th><td></td>' + a2.map(function (v, i) { return '<td>' + (W[i] ? v : '') + '</td>'; }).join('') + '<td>' + sum(a2) + '</td><td></td></tr>'; }).join('') +
      '</tbody></table></div>' + note('newNote');
    if (NM.list.length) {
      h += '<p class="sub">今月の入会（新規）に流入経路を選んでください：</p>' + NM.list.map(function (k) {
        return '<label class="row unk">' + esc(k.date.slice(5).replace('-', '/')) + ' ' + esc(k.custName || k.cust) + '<select data-ch="' + esc(k.id) + '"><option value="">未設定</option>' +
          CH.map(function (c) { return '<option' + (channels[k.id] === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>';
      }).join('');
    }
    // 【カウンセリング対応数】※カウンセリングと無料体験は同義。済を経路別に、予定は「今後予定」に
    h += '<h3 class="mh">【カウンセリング対応数】<small>※カウンセリングと無料体験は同義</small></h3><div class="tablewrap"><table class="mt"><thead><tr><th></th>' +
      [0, 1, 2, 3, 4].map(function (i) { return '<th>' + wlabel(W, i) + '</th>'; }).join('') + '<th>合計</th></tr></thead><tbody>' +
      '<tr class="act"><th>合計（済）</th>' + CO.done.map(function (v, i) { return '<td><b>' + (W[i] ? v : '') + '</b></td>'; }).join('') + '<td><b>' + sum(CO.done) + '</b></td></tr>' +
      CH.map(function (c) { var a3 = CO.byCh[c] || [0, 0, 0, 0, 0]; return '<tr><th>' + c + '</th>' + a3.map(function (v, i) { return '<td>' + (W[i] ? v : '') + '</td>'; }).join('') + '<td>' + sum(a3) + '</td></tr>'; }).join('') +
      '<tr class="sub2"><th>今後予定しているカウンセリング・無料体験</th>' + CO.plan.map(function (v, i) { return '<td>' + (W[i] ? v : '') + '</td>'; }).join('') + '<td>' + sum(CO.plan) + '</td></tr>' +
      '</tbody></table></div>' + counselForm();
    // 【セッション頻度表】稼働組数・アフター・週2/週1・セッション数（理想は手入力）
    var GO = cfg.staff ? gobj(cfg.staff) : {}, ideal = GO.ideal || {}, after = GO.after || [];
    function inp(field, i, v) { return cfg.staff ? '<input type="number" inputmode="numeric" min="0" data-' + field + '="' + i + '" value="' + (v != null && v !== '' ? v : '') + '">' : (v || ''); }
    h += '<h3 class="mh">【セッション頻度表】</h3><p class="sub">ペア・3人で一緒に受けている人は1組。アフター組数と「理想」の稼働組数・週2組数・アフター組数は手入力。</p>' +
      '<div class="tablewrap"><table class="mt"><thead><tr><th></th><th>稼働組数</th><th>アフター抜いた総数</th><th>週2組数</th><th>週1組数</th><th>アフター組数</th><th>セッション数</th></tr></thead><tbody>' +
      '<tr><th>理想</th><td>' + inp('ideal', 'act', ideal.act) + '</td><td>' + ((+ideal.act || 0) - (+ideal.after || 0) || '') + '</td><td>' + inp('ideal', 'two', ideal.two) + '</td><td>' +
      (ideal.act ? (+ideal.act - (+ideal.after || 0) - (+ideal.two || 0)) : '') + '</td><td>' + inp('ideal', 'after', ideal.after) + '</td><td><b>' +
      (ideal.act ? sessFormula(+ideal.two || 0, +ideal.act - (+ideal.after || 0) - (+ideal.two || 0)) : '') + '</b></td></tr>' +
      AG.map(function (g, i) {
        var rl = '<th>' + (i + 1) + '週目MT時点<small>' + (C7[i] ? +month.slice(5, 7) + '/' + C7[i][0] + '〜' + C7[i][1] + 'で判定' : '—') + '</small></th>';
        if (!g) return '<tr>' + rl + '<td colspan="6"></td></tr>';
        var tot = g.total, af = +after[i] || 0, net = tot - af, one = net - g.two;
        return '<tr>' + rl + '<td><b>' + tot + '</b></td><td>' + net + '</td><td>' + g.two + '</td><td>' + one + '</td><td>' + inp('after', i, after[i]) + '</td><td><b>' + sessFormula(g.two, one) + '</b></td></tr>';
      }).join('') + '</tbody></table></div><p class="sub">稼働組数＝その月に来た（予約を含む）組。週2組数＝その7日間に2回以上来た組。週1組数＝アフターを抜いた総数−週2組数。セッション数＝週2組数×8＋週1組数×2（店の管理表と同じ計算）。</p>';
    // 【既存会員へのアプローチ】【先週店舗MT振り返り（行動アクション＆結果）】週ごとのメモ
    h += weekNotes('appr', '【既存会員へのアプローチ】', W) + weekNotes('rev', '【先週店舗MT振り返り（行動アクション＆結果）】', W);
    box.innerHTML = h;
    $('report').textContent = reportText(W, P, pg, payLand, SE, sg, sessLand, NM, CO, AG);
  }
  function counselForm() {
    var list = (counsel[month] || []).filter(function (c) { return inStaff(c.staff); }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var t = K.today(), def = t.slice(0, 7) === month ? t : month + '-01';
    return '<div class="cform"><p class="sub">カウンセリングを追加（名前は入れません）：</p><div class="row cadd">' +
      '<input type="date" id="cdate" value="' + def + '" min="' + month + '-01" max="' + month + '-31">' +
      '<select id="cch">' + CH.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select>' +
      '<select id="cst"><option>予定</option><option>済</option></select>' +
      (cfg.staff ? '' : '<select id="cstaff">' + K.staffList().map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>'; }).join('') + '</select>') +
      '<button type="button" class="mini" id="cadd">追加</button></div>' +
      (list.length ? '<div class="clist">' + list.map(function (c) {
        return '<div class="row unk">' + esc(c.date.slice(5).replace('-', '/')) + '　' + esc(c.ch) +
          '<select data-cst="' + c.id + '"><option' + (c.st === '予定' ? ' selected' : '') + '>予定</option><option' + (c.st === '済' ? ' selected' : '') + '>済</option></select>' +
          '<button type="button" class="ghost mini" data-cdel="' + c.id + '">削除</button></div>';
      }).join('') + '</div>' : '') + '</div>';
  }
  function reportText(W, P, pg, payLand, SE, sg, sessLand, NM, CO, AG) {
    var st = K.staffList(), who = cfg.staff ? (st.filter(function (p) { return p.id === cfg.staff; })[0] || {}).name : '店舗合計';
    function row(a, f) { return [0, 1, 2, 3, 4].map(function (i) { return W[i] ? (i + 1) + '週 ' + f(a[i]) : ''; }).filter(Boolean).join('／'); }
    var land = +payLand || sum(P), out = '【' + +month.slice(5, 7) + '月 予実】' + who + '\n';
    out += '■入金売上\n　実数値：' + row(P, yen) + '／合計 ' + yen(sum(P)) + (pg ? '（目標 ' + yen(sum(pg)) + '・達成率 ' + pctS(sum(P), sum(pg)) + '）' : '') + '\n　今月着地予定：' + yen(land) + (pg ? '（' + pctS(land, sum(pg)) + '）' : '') + '\n';
    if (cfg.staff && gobj(cfg.staff).payNote) out += '　備考：' + gobj(cfg.staff).payNote + '\n';
    out += '■セッション数\n　実数値：' + row(SE.done, n) + '／合計 ' + sum(SE.done) + '本' + (sg ? '（目標 ' + sum(sg) + '本・達成率 ' + pctS(sum(SE.done), sum(sg)) + '）' : '') + '\n　今月着地予定：' + sessLand + '本' + (sg ? '（' + pctS(sessLand, sum(sg)) + '）' : '') + '\n';
    if (cfg.staff && gobj(cfg.staff).sessNote) out += '　備考：' + gobj(cfg.staff).sessNote + '\n';
    var ng = cfg.staff ? gobj(cfg.staff).newGoal : sumGoalField('newGoal');
    out += '■入会：' + sum(NM.a) + '人' + (ng ? '（当月新規目標 ' + ng + '人・' + pctS(sum(NM.a), +ng) + '）' : '') + chLine(NM.byCh) + '\n';
    out += '■カウンセリング対応：' + sum(CO.done) + '件' + chLine(CO.byCh) + '／今後予定 ' + sum(CO.plan) + '件\n';
    var tw2 = wk(K.today(), W), gi = AG[tw2 >= 0 ? tw2 : 0], af2 = cfg.staff ? +((gobj(cfg.staff).after || [])[tw2 >= 0 ? tw2 : 0]) || 0 : 0;
    if (gi) { var net2 = gi.total - af2, one2 = net2 - gi.two; out += '■セッション頻度：稼働 ' + gi.total + '組（アフター抜き ' + net2 + '・週2 ' + gi.two + '・週1 ' + one2 + '）／セッション数 ' + sessFormula(gi.two, one2) + '\n'; }
    return out;
  }
  function chLine(by) { var p = Object.keys(by).map(function (c) { return c + ' ' + sum(by[c]); }); return p.length ? '　経路：' + p.join('、') : ''; }

  // ---- 操作 ----
  function saveAndRender() { S('kpi-mtgcfg', cfg); K.saveGoals(); K.rerender(); }
  function syncTotals() { // 予実カード（トレーナーごと）用の月の目標も、週の合計で更新しておく
    var o = gobj(cfg.staff);
    ['sess', 'pay', 'new'].forEach(function (k) { var w = o.W[k] || []; if (w.some(function (v) { return v != null && v !== ''; })) o[k === 'new' ? 'newGoal' : k] = sum(w); });
  }
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'mstaff') { cfg.staff = t.value; cfg.chose = true; saveAndRender(); return; }
    if (t.id === 'mweek') { cfg.week = t.value; cfg.weekSet = true; saveAndRender(); return; }
    if (t.dataset.g && cfg.staff) { var o = gobj(cfg.staff); o.W[t.dataset.g] = o.W[t.dataset.g] || []; o.W[t.dataset.g][+t.dataset.i] = t.value === '' ? null : +t.value; syncTotals(); saveAndRender(); return; }
    if (t.dataset.l && cfg.staff) { gobj(cfg.staff)[t.dataset.l] = t.value === '' ? null : +t.value; saveAndRender(); return; }
    if (t.dataset.f && cfg.staff) { gobj(cfg.staff)[t.dataset.f] = t.value === '' ? null : +t.value; saveAndRender(); return; }
    if (t.dataset.ideal && cfg.staff) { var g1 = gobj(cfg.staff); g1.ideal = g1.ideal || {}; g1.ideal[t.dataset.ideal] = t.value === '' ? null : +t.value; saveAndRender(); return; }
    if (t.dataset.after != null && cfg.staff && t.tagName === 'INPUT') { var g2 = gobj(cfg.staff); g2.after = g2.after || []; g2.after[+t.dataset.after] = t.value === '' ? null : +t.value; saveAndRender(); return; }
    if (t.dataset.wn && cfg.staff) { var g3 = gobj(cfg.staff); g3[t.dataset.wn] = g3[t.dataset.wn] || []; g3[t.dataset.wn][+t.dataset.i] = t.value; K.saveGoals(); return; }
    if (t.dataset.n && cfg.staff) { gobj(cfg.staff)[t.dataset.n] = t.value; K.saveGoals(); K.rerender(); return; }
    if (t.dataset.ch) { if (t.value) channels[t.dataset.ch] = t.value; else delete channels[t.dataset.ch]; S('kpi-channel', channels); K.rerender(); return; }
    if (t.dataset.cst) { (counsel[month] || []).forEach(function (c) { if (c.id === t.dataset.cst) c.st = t.value; }); S('kpi-counsel', counsel); K.rerender(); }
  });
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.id === 'cadd') {
      var d = $('cdate').value; if (!d || d.slice(0, 7) !== month) { alert('この月の日付を選んでください'); return; }
      var staff = cfg.staff || ($('cstaff') || {}).value || '';
      counsel[month] = counsel[month] || [];
      counsel[month].push({ id: 'c' + Date.now(), date: d, staff: staff, ch: $('cch').value, st: $('cst').value });
      S('kpi-counsel', counsel); K.rerender(); return;
    }
    if (t.dataset && t.dataset.cdel) {
      if (!confirm('このカウンセリングを削除しますか？')) return;
      counsel[month] = (counsel[month] || []).filter(function (c) { return c.id !== t.dataset.cdel; });
      S('kpi-counsel', counsel); K.rerender();
    }
  });
  window.renderMTG = render;
})();
