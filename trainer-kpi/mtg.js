// MTG資料：店の管理表と同じ見せ方で、項目ごとに「トレーナーごとのブロック」を並べる
//   ■入金売上 ■セッション数 ■入会目標及び実数値 ■カウンセリング対応数 ■今後予定しているカウンセリング・無料体験
//   ■セッション頻度表 ■既存会員へのアプローチ ■先週店舗MT振り返り（行動アクション＆結果）
// 列は「1〜5週目MT時点」（毎週木曜のMTで区切る）＋合計・達成率・備考
// データ：セッションCSV・チケット一覧（app.js が読み込んだもの）＋このiPadに保存した手入力
(function () {
  var K = window.KPI; if (!K) return;
  var $ = function (id) { return document.getElementById(id); };
  var esc = K.esc, yen = K.yen;
  var CH = ['オフィシャルLP', 'オフィシャル電話', 'Instagram', 'Threads', '紹介', 'その他'];
  function L(k, d) { try { return JSON.parse(localStorage.getItem(k) || 'null') || d; } catch (e) { return d; } }
  function S(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var channels = L('kpi-channel', {});   // チケットID → 流入経路（入会）
  var counsel = L('kpi-counsel', {});    // 月 → [{id, date, staff, ch, st:'予定'|'済'}]
  var cfg = L('kpi-mtgcfg', { week: '7', staff: '' });
  if (!cfg.weekSet) cfg.week = '7';      // 報告は月初から7日区切り（オーナー決定 2026-11-20）。画面で木曜MT区切りにも切り替え可
  var month = '', cur = '';              // cur＝今描いているトレーナー
  var I5 = [0, 1, 2, 3, 4];

  // ---- 週の区切り ----
  function weeks(m) {
    var y = +m.slice(0, 4), mo = +m.slice(5, 7), days = new Date(y, mo, 0).getDate(), W = [], d, e;
    if (cfg.week === 'thu' || cfg.week === 'mon') {
      var endDow = cfg.week === 'thu' ? 4 : 0; // 木曜まで／日曜まで
      for (d = 1; d <= days; d = e + 1) { e = Math.min(days, d + ((endDow - new Date(y, mo - 1, d).getDay() + 7) % 7)); W.push([d, e]); }
    } else {
      for (d = 1; d <= days; d += 7) W.push([d, Math.min(days, d + 6)]);
    }
    while (W.length > 5) { var l = W.pop(); W[W.length - 1][1] = l[1]; }
    while (W.length < 5) W.push(null);
    return W;
  }
  // 週2／週1の判定に使う期間：月初から7日ずつ
  function chunks7(m) {
    var y = +m.slice(0, 4), mo = +m.slice(5, 7), days = new Date(y, mo, 0).getDate(), C = [];
    for (var s1 = 1; s1 <= days && C.length < 5; s1 += 7) C.push([s1, Math.min(days, s1 + 6)]);
    if (C.length === 5) C[4][1] = days;
    while (C.length < 5) C.push(null);
    return C;
  }
  function wk(date, W) { var d = +date.slice(8, 10); for (var i = 0; i < 5; i++) if (W[i] && d >= W[i][0] && d <= W[i][1]) return i; return -1; }
  function wlabel(W, i) { var t = (i + 1) + '週目' + (cfg.week === 'thu' ? 'MT時点' : ''); return t + '<small>' + (W[i] ? +month.slice(5, 7) + '/' + W[i][0] + '〜' + W[i][1] : '—') + '</small>'; }

  // ---- 実績の集計（cur のトレーナーの分） ----
  function sessRows() {
    var useS = K.useSrc(month);
    return K.rows.filter(function (r) { return r.date.slice(0, 7) === month && r.staffId === cur && (!useS || r.src === 'session'); });
  }
  function sessions(W) {
    var t = K.today(), done = [[], [], [], [], []], book = [];
    sessRows().forEach(function (r) {
      if (K.isConsumed(r) || (r.st === K.BOOKED && r.date <= t)) { var i = wk(r.date, W); if (i >= 0) done[i].push(r); }
      else if (r.st === K.BOOKED) book.push(r);
    });
    var D = done.map(function (l) { return K.countSlots(l).n; });
    return { done: D, land: sum(D) + K.countSlots(book).n };
  }
  function monthTickets() {
    var ow = K.owners();
    return K.tickets.filter(function (k) { return k.date.slice(0, 7) === month && K.isCourse(k) && ow[k.cust] !== K.EXCL && K.ownerOf(k.cust) === cur; });
  }
  function payments(W) { var a = [0, 0, 0, 0, 0]; monthTickets().forEach(function (k) { var i = wk(k.date, W); if (i >= 0) a[i] += k.price; }); return a; }
  function newMembers(W) {
    var a = [0, 0, 0, 0, 0], byCh = {}, seen = {}, list = [];
    monthTickets().forEach(function (k) {
      if (!K.isNewTicket(k) || seen[k.cust]) return;
      seen[k.cust] = 1; list.push(k);
      var i = wk(k.date, W); if (i < 0) return;
      a[i]++; var c = channels[k.id] || '未設定'; (byCh[c] = byCh[c] || [0, 0, 0, 0, 0])[i]++;
    });
    return { a: a, byCh: byCh, list: list };
  }
  function counselings(W) {
    var done = [0, 0, 0, 0, 0], plan = [0, 0, 0, 0, 0], byCh = {};
    (counsel[month] || []).forEach(function (c) {
      if (c.staff !== cur) return;
      var i = wk(c.date, W); if (i < 0) return;
      if (c.st === '済') { done[i]++; (byCh[c.ch] = byCh[c.ch] || [0, 0, 0, 0, 0])[i]++; } else plan[i]++;
    });
    return { done: done, plan: plan, byCh: byCh };
  }
  // 稼働組数＝その月に来た（予約を含む）組。週2＝その7日間に2回以上来た組。ペア・3人で一緒に受けている人は1組
  function activeGroups(C7) {
    var rs = sessRows().filter(function (r) { return r.st !== K.CANCEL; }), parent = {}, slots = {};
    function f(x) { while (parent[x] && parent[x] !== x) x = parent[x]; return x; }
    rs.forEach(function (r) { var k = r.date + '|' + r.start; (slots[k] = slots[k] || {})[r.cust] = r; });
    Object.keys(slots).forEach(function (k) {
      var g = Object.keys(slots[k]).filter(function (c) { return K.isGroupMenu(slots[k][c].menu); });
      g.slice(1).forEach(function (c) { var a = f(g[0]), b = f(c); if (a !== b) parent[b] = a; });
    });
    var all = {}; Object.keys(slots).forEach(function (k) { Object.keys(slots[k]).forEach(function (c) { all[f(c)] = 1; }); });
    var total = Object.keys(all).length;
    return I5.map(function (i) {
      if (!C7[i]) return null;
      var cnt = {};
      Object.keys(slots).forEach(function (k) {
        if (wk(k.slice(0, 10), C7) !== i) return;
        var seen = {}; Object.keys(slots[k]).forEach(function (c) { var g = f(c); if (!seen[g]) { seen[g] = 1; cnt[g] = (cnt[g] || 0) + 1; } });
      });
      return { total: total, two: Object.keys(cnt).filter(function (g) { return cnt[g] >= 2; }).length };
    });
  }

  // ---- 手入力（トレーナーごと・月ごと） ----
  function gobj(id) { var g = K.goals; g[month] = g[month] || {}; g[month][id] = g[month][id] || {}; var o = g[month][id]; o.W = o.W || {}; return o; }
  function sum(a) { return a.reduce(function (x, y) { return x + (+y || 0); }, 0); }
  function has(v) { return v != null && v !== ''; }
  function pctS(a, g) { return g ? (Math.round(a / g * 1000) / 10).toFixed(1) + '%' : '—'; }
  function cls(a, g) { if (!g) return ''; var p = a / g; return p >= 1 ? 'ok' : p >= 0.8 ? 'warn' : 'bad'; }
  function num(v, attrs) { return '<input type="number" inputmode="numeric" min="0" ' + attrs + ' value="' + (has(v) ? v : '') + '">'; }
  function memo(key, rows) { return '<textarea class="memo" data-n="' + key + '" rows="' + (rows || 3) + '">' + esc(gobj(cur)[key] || '') + '</textarea>'; }
  function sessFormula(two, one) { return two * 8 + one * 2; } // 店の計算：週2×8＋週1×2

  // ---- 表のパーツ（1トレーナー分のブロック） ----
  function head(name, W, extra) {
    return '<tr class="bh"><th>' + esc(name) + '</th>' + (extra || '') + I5.map(function (i) { return '<th>' + wlabel(W, i) + '</th>'; }).join('') + '<th>合計</th>';
  }
  // 入金売上・セッション数：今月目標／実数値／月末着地予定。右に達成率と備考
  function blockGoal(name, W, key, fmt, actual, land, landEditable, noteKey) {
    var o = gobj(cur), G = o.W[key] || [], gt = sum(G), at = sum(actual), lv = landEditable ? (has(o[key + 'Land']) ? +o[key + 'Land'] : at) : land;
    return '<table class="mt blk">' + head(name, W) + '<th>達成率</th><th class="nc">備考</th></tr>' +
      '<tr><th class="ind">今月目標</th>' + I5.map(function (i) { return '<td>' + (W[i] ? num(G[i], 'data-g="' + key + '" data-i="' + i + '"') : '') + '</td>'; }).join('') +
      '<td><b>' + (gt ? fmt(gt) : '') + '</b></td><td rowspan="3" class="rate"><b class="' + cls(lv, gt) + '">' + pctS(lv, gt) + '</b><small>着地予定÷目標</small></td><td rowspan="3" class="nc">' + memo(noteKey, 4) + '</td></tr>' +
      '<tr class="act"><th class="ind">実数値</th>' + actual.map(function (v, i) { return '<td>' + (W[i] ? fmt(v) : '') + '</td>'; }).join('') + '<td><b>' + fmt(at) + '</b></td></tr>' +
      '<tr><th class="ind">月末着地予定</th>' + I5.map(function () { return '<td></td>'; }).join('') + '<td class="land">' +
      (landEditable ? num(o[key + 'Land'], 'data-l="' + key + 'Land" placeholder="' + at + '"') : '<b>' + fmt(land) + '</b>') + '</td></tr></table>';
  }
  function blockNew(name, W, NM) {
    var o = gobj(cur), ng = o.newGoal, keys = CH.concat(NM.byCh['未設定'] ? ['未設定'] : []);
    return '<table class="mt blk">' + head(name, W, '<th>当月新規目標</th>') + '<th>達成率</th><th class="nc">備考</th></tr>' +
      '<tr class="act"><th class="ind">合計</th><td>' + num(ng, 'data-f="newGoal"') + '</td>' + NM.a.map(function (v, i) { return '<td>' + (W[i] ? v : '') + '</td>'; }).join('') +
      '<td><b>' + sum(NM.a) + '</b></td><td rowspan="' + (keys.length + 1) + '" class="rate"><b class="' + cls(sum(NM.a), +ng) + '">' + pctS(sum(NM.a), +ng) + '</b></td><td rowspan="' + (keys.length + 1) + '" class="nc">' + memo('newNote', 6) + '</td></tr>' +
      keys.map(function (c) { var a = NM.byCh[c] || [0, 0, 0, 0, 0]; return '<tr' + (c === '未設定' ? ' class="warnrow"' : '') + '><th class="ind">' + c + '</th><td></td>' + a.map(function (v, i) { return '<td>' + (W[i] && v ? v : '') + '</td>'; }).join('') + '<td>' + sum(a) + '</td></tr>'; }).join('') +
      '</table>' + (NM.list.length ? '<div class="chpick">入会の流入経路：' + NM.list.map(function (k) {
        return '<label>' + esc(k.date.slice(5).replace('-', '/')) + ' ' + esc(k.custName || k.cust) + ' <select data-ch="' + esc(k.id) + '"><option value="">未設定</option>' +
          CH.map(function (c) { return '<option' + (channels[k.id] === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>';
      }).join('') + '</div>' : '');
  }
  function blockCounsel(name, W, CO) {
    return '<table class="mt blk">' + head(name, W) + '<th class="nc">備考</th></tr>' +
      '<tr class="act"><th class="ind">合計</th>' + CO.done.map(function (v, i) { return '<td><b>' + (W[i] ? v : '') + '</b></td>'; }).join('') + '<td><b>' + sum(CO.done) + '</b></td><td rowspan="' + (CH.length + 1) + '" class="nc">' + memo('cslNote', 5) + '</td></tr>' +
      CH.map(function (c) { var a = CO.byCh[c] || [0, 0, 0, 0, 0]; return '<tr><th class="ind">' + c + '</th>' + a.map(function (v, i) { return '<td>' + (W[i] && v ? v : '') + '</td>'; }).join('') + '<td>' + sum(a) + '</td></tr>'; }).join('') + '</table>';
  }
  function blockPlan(name, W, CO) {
    return '<table class="mt blk">' + head(name, W) + '<th class="nc">備考</th></tr>' +
      '<tr><th class="ind">カウンセリング</th>' + CO.plan.map(function (v, i) { return '<td>' + (W[i] && v ? v : '') + '</td>'; }).join('') + '<td><b>' + sum(CO.plan) + '</b></td><td class="nc">' + memo('planNote', 2) + '</td></tr></table>';
  }
  function blockFreq(name, W, C7, AG) {
    var o = gobj(cur), ideal = o.ideal || {}, after = o.after || [];
    var iNet = has(ideal.act) ? +ideal.act - (+ideal.after || 0) : null, iOne = iNet != null ? iNet - (+ideal.two || 0) : null;
    return '<table class="mt blk"><tr class="bh"><th>' + esc(name) + '</th><th>稼働組数</th><th>アフター抜いた総数</th><th>週2組数</th><th>週1組数</th><th>アフター組数</th><th>セッション数</th><th class="nc">備考</th></tr>' +
      '<tr><th class="ind">理想</th><td>' + num(ideal.act, 'data-ideal="act"') + '</td><td>' + (iNet != null ? iNet : '') + '</td><td>' + num(ideal.two, 'data-ideal="two"') + '</td><td>' + (iOne != null ? iOne : '') +
      '</td><td>' + num(ideal.after, 'data-ideal="after"') + '</td><td><b>' + (iNet != null ? sessFormula(+ideal.two || 0, iOne) : '') + '</b></td><td rowspan="6" class="nc">' + memo('freqNote', 6) + '</td></tr>' +
      AG.map(function (g, i) {
        var rl = '<th class="ind">' + (i + 1) + '週目MT時点<small>' + (C7[i] ? +month.slice(5, 7) + '/' + C7[i][0] + '〜' + C7[i][1] + 'で判定' : '—') + '</small></th>';
        if (!g) return '<tr>' + rl + '<td colspan="6"></td></tr>';
        var net = g.total - (+after[i] || 0), one = net - g.two;
        return '<tr>' + rl + '<td><b>' + g.total + '</b></td><td>' + net + '</td><td>' + g.two + '</td><td>' + one + '</td><td>' + num(after[i], 'data-after="' + i + '"') + '</td><td><b>' + sessFormula(g.two, one) + '</b></td></tr>';
      }).join('') + '</table>';
  }
  function blockWeekNotes(name, W, key) {
    var arr = gobj(cur)[key] || [];
    return '<table class="mt blk wnb"><tr class="bh"><th>' + esc(name) + '</th><th></th></tr>' + I5.map(function (i) {
      return '<tr><th class="ind">' + wlabel(W, i) + '</th><td><textarea class="memo" rows="2" data-wn="' + key + '" data-i="' + i + '">' + esc(arr[i] || '') + '</textarea></td></tr>';
    }).join('') + '</table>';
  }

  // ---- 画面全体：項目ごとに、トレーナーのブロックを並べる ----
  function people() { var st = K.staffList(); return cfg.staff ? st.filter(function (p) { return p.id === cfg.staff; }) : st; }
  function render(m) {
    month = m; if (!month) return;
    var box = $('mtg'); if (!box) return;
    var st = K.staffList();
    if (cfg.staff && !st.some(function (p) { return p.id === cfg.staff; })) cfg.staff = '';
    $('mstaff').innerHTML = '<option value="">全員</option>' + st.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === cfg.staff ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('');
    $('mweek').value = cfg.week;
    var ps = people(), W = weeks(month), C7 = chunks7(month), data = {};
    ps.forEach(function (p) { cur = p.id; data[p.id] = { P: payments(W), SE: sessions(W), NM: newMembers(W), CO: counselings(W), AG: activeGroups(C7) }; });
    function sec(title, sub, fn) {
      return '<h3 class="mh">■' + title + (sub ? '<small>' + sub + '</small>' : '') + '</h3><div class="tablewrap">' +
        ps.map(function (p) { cur = p.id; return '<div data-staff="' + esc(p.id) + '">' + fn(p.name, data[p.id]) + '</div>'; }).join('') + '</div>';
    }
    var h = '';
    h += sec('入金売上', '', function (nm, d) { return blockGoal(nm, W, 'pay', yen, d.P, null, true, 'payNote'); });
    h += sec('セッション数', '実数値＝MT時点までに終わった分（本日分を含む）。月末着地予定＝実数値＋これからの予約', function (nm, d) { return blockGoal(nm, W, 'sess', String, d.SE.done, d.SE.land, false, 'sessNote'); });
    h += sec('入会目標及び実数値', '新規獲得目標件数と、達成するための行動も備考に記載', function (nm, d) { return blockNew(nm, W, d.NM); });
    h += sec('カウンセリング対応数', '※カウンセリングと無料体験は同義', function (nm, d) { return blockCounsel(nm, W, d.CO); });
    h += sec('今後予定しているカウンセリング・無料体験', '（カウンセリング及び無料体験は同義）', function (nm, d) { return blockPlan(nm, W, d.CO); });
    h += counselForm(st);
    h += sec('セッション頻度表', '稼働組数＝その月に来た組（予約を含む）。週2＝その7日間に2回以上。週1＝アフター抜いた総数−週2。セッション数＝週2×8＋週1×2', function (nm, d) { return blockFreq(nm, W, C7, d.AG); });
    h += sec('既存会員へのアプローチ', '', function (nm) { return blockWeekNotes(nm, W, 'appr'); });
    h += sec('先週店舗MT振り返り（行動アクション＆結果）', '', function (nm) { return blockWeekNotes(nm, W, 'rev'); });
    box.innerHTML = h;
    $('report').textContent = ps.map(function (p) { cur = p.id; return reportText(p.name, W, data[p.id]); }).join('\n');
  }
  function counselForm(st) {
    var list = (counsel[month] || []).filter(function (c) { return !cfg.staff || c.staff === cfg.staff; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var t = K.today(), def = t.slice(0, 7) === month ? t : month + '-01';
    function nm(id) { var p = st.filter(function (x) { return x.id === id; })[0]; return p ? p.name : ''; }
    return '<div class="cform"><p class="sub"><b>カウンセリング・無料体験の記録</b>（「済」は対応数、「予定」は今後予定に入ります。名前は入れません）</p><div class="row cadd">' +
      '<input type="date" id="cdate" value="' + def + '" min="' + month + '-01" max="' + month + '-31">' +
      '<select id="cstaff">' + st.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === cfg.staff ? ' selected' : '') + '>' + esc(p.name) + '</option>'; }).join('') + '</select>' +
      '<select id="cch">' + CH.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select>' +
      '<select id="cst"><option>予定</option><option>済</option></select>' +
      '<button type="button" class="mini" id="cadd">追加</button></div>' +
      (list.length ? '<div class="clist">' + list.map(function (c) {
        return '<div class="row unk">' + esc(c.date.slice(5).replace('-', '/')) + '　' + esc(nm(c.staff)) + '　' + esc(c.ch) +
          '<select data-cst="' + c.id + '"><option' + (c.st === '予定' ? ' selected' : '') + '>予定</option><option' + (c.st === '済' ? ' selected' : '') + '>済</option></select>' +
          '<button type="button" class="ghost mini" data-cdel="' + c.id + '">削除</button></div>';
      }).join('') + '</div>' : '') + '</div>';
  }
  function reportText(name, W, d) {
    var o = gobj(cur), pg = sum(o.W.pay || []), sg = sum(o.W.sess || []), payLand = has(o.payLand) ? +o.payLand : sum(d.P);
    function row(a, f) { return I5.map(function (i) { return W[i] ? (i + 1) + '週 ' + f(a[i]) : ''; }).filter(Boolean).join('／'); }
    function chLine(by) { var p = Object.keys(by).map(function (c) { return c + ' ' + sum(by[c]); }); return p.length ? '（' + p.join('、') + '）' : ''; }
    var tw = wk(K.today(), W), ti = tw >= 0 ? tw : 0, gi = d.AG[ti], out = '【' + +month.slice(5, 7) + '月】' + name + '\n';
    out += '■入金売上　実数値 ' + row(d.P, yen) + '／合計 ' + yen(sum(d.P)) + '　月末着地予定 ' + yen(payLand) + (pg ? '（目標 ' + yen(pg) + '・' + pctS(payLand, pg) + '）' : '') + '\n';
    if (o.payNote) out += '　備考：' + o.payNote + '\n';
    out += '■セッション数　実数値 ' + row(d.SE.done, String) + '／合計 ' + sum(d.SE.done) + '　月末着地予定 ' + d.SE.land + (sg ? '（目標 ' + sg + '・' + pctS(d.SE.land, sg) + '）' : '') + '\n';
    if (o.sessNote) out += '　備考：' + o.sessNote + '\n';
    out += '■入会 ' + sum(d.NM.a) + '件' + (has(o.newGoal) ? '（当月新規目標 ' + o.newGoal + '・' + pctS(sum(d.NM.a), +o.newGoal) + '）' : '') + chLine(d.NM.byCh) + '\n';
    if (o.newNote) out += '　備考：' + o.newNote + '\n';
    out += '■カウンセリング対応数 ' + sum(d.CO.done) + '件' + chLine(d.CO.byCh) + '／今後予定 ' + sum(d.CO.plan) + '件\n';
    if (gi) { var net = gi.total - (+((o.after || [])[ti]) || 0), one = net - gi.two; out += '■セッション頻度　稼働 ' + gi.total + '組・アフター抜き ' + net + '・週2 ' + gi.two + '・週1 ' + one + '・セッション数 ' + sessFormula(gi.two, one) + '\n'; }
    if ((o.appr || [])[ti]) out += '■既存会員へのアプローチ\n' + o.appr[ti] + '\n';
    if ((o.rev || [])[ti]) out += '■先週店舗MT振り返り\n' + o.rev[ti] + '\n';
    return out;
  }

  // ---- 操作（入力は、そのトレーナーのブロックに保存） ----
  function saveAndRender() { S('kpi-mtgcfg', cfg); K.saveGoals(); K.rerender(); }
  function syncTotals(id) { var o = gobj(id); ['sess', 'pay'].forEach(function (k) { var w = o.W[k] || []; if (w.some(has)) o[k] = sum(w); }); }
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'mstaff') { cfg.staff = t.value; saveAndRender(); return; }
    if (t.id === 'mweek') { cfg.week = t.value; cfg.weekSet = true; saveAndRender(); return; }
    if (t.dataset && t.dataset.cst) { (counsel[month] || []).forEach(function (c) { if (c.id === t.dataset.cst) c.st = t.value; }); S('kpi-counsel', counsel); K.rerender(); return; }
    var blk = t.closest && t.closest('#mtg [data-staff]'); if (!blk) return;
    var id = blk.dataset.staff, o = gobj(id), v = t.value === '' ? null : +t.value;
    if (t.dataset.g) { o.W[t.dataset.g] = o.W[t.dataset.g] || []; o.W[t.dataset.g][+t.dataset.i] = v; syncTotals(id); saveAndRender(); }
    else if (t.dataset.l) { o[t.dataset.l] = v; saveAndRender(); }
    else if (t.dataset.f) { o[t.dataset.f] = v; saveAndRender(); }
    else if (t.dataset.ideal) { o.ideal = o.ideal || {}; o.ideal[t.dataset.ideal] = v; saveAndRender(); }
    else if (t.dataset.after != null && t.tagName === 'INPUT') { o.after = o.after || []; o.after[+t.dataset.after] = v; saveAndRender(); }
    else if (t.dataset.wn) { o[t.dataset.wn] = o[t.dataset.wn] || []; o[t.dataset.wn][+t.dataset.i] = t.value; K.saveGoals(); K.rerender(); }
    else if (t.dataset.n) { o[t.dataset.n] = t.value; K.saveGoals(); K.rerender(); }
    else if (t.dataset.ch) { if (t.value) channels[t.dataset.ch] = t.value; else delete channels[t.dataset.ch]; S('kpi-channel', channels); K.rerender(); }
  });
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.id === 'cadd') {
      var d = $('cdate').value; if (!d || d.slice(0, 7) !== month) { alert('この月の日付を選んでください'); return; }
      counsel[month] = counsel[month] || [];
      counsel[month].push({ id: 'c' + Date.now(), date: d, staff: $('cstaff').value, ch: $('cch').value, st: $('cst').value });
      S('kpi-counsel', counsel); K.rerender(); return;
    }
    if (t.dataset && t.dataset.cdel) {
      if (!confirm('この記録を削除しますか？')) return;
      counsel[month] = (counsel[month] || []).filter(function (c) { return c.id !== t.dataset.cdel; });
      S('kpi-counsel', counsel); K.rerender();
    }
  });
  window.renderMTG = render;
})();
