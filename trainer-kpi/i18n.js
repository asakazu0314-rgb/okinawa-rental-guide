// 英語表示（EN）：画面の日本語を、辞書で英語に置き換えて表示する。
// 計算や保存の中身は変えない（表示の文字だけ）。日本語に戻すとページを読み直す。
(function () {
  function getLang() { try { return localStorage.getItem('kpi-lang') || 'ja'; } catch (e) { return 'ja'; } }
  var lang = getLang();
  // 長い言葉から順に置き換える
  var D = [
    // 説明文（よく出るもの）
    ['Driveの「Gym\'s データ」→「latest」から、', 'From Drive "Gym\'s data" → "latest", '],
    ['3つのファイル', 'the 3 files'], ['をまとめて選びます。', ' — select them together.'],
    ['🔒 CSVはこのiPadの中だけで計算し、どこにも送りません。', '🔒 CSV files are processed only on this device and never sent anywhere.'],
    ['実数値＝MT時点までに終わった分（本日分を含む）。月末着地予定＝実数値＋これからの予約', 'Actual = sessions done so far (incl. today). Month-end forecast = actual + upcoming bookings'],
    ['新規獲得目標件数と、達成するための行動も備考に記載', 'Write the new-member goal and the actions to reach it in Notes'],
    ['※カウンセリングと無料体験は同義', '*Counseling = free trial'], ['（カウンセリング及び無料体験は同義）', '(counseling = free trial)'],
    ['稼働組数＝その月に来た組（予約を含む）。週2＝その7日間に2回以上。週1＝アフター抜いた総数−週2。セッション数＝週2×8＋週1×2', 'Active = clients who came this month (incl. bookings). 2x/week = 2+ sessions in that 7-day period. 1x/week = active excl. aftercare − 2x/week. Sessions = 2x/week × 8 + 1x/week × 2'],
    ['自動の判定が違うときだけ直します。直した内容はこのiPadに保存され、次の月も使われます。', 'Fix only when the automatic result is wrong. Fixes are saved on this device and reused next month.'],
    ['見出しを押すと並び替え。行を押すと詳細。', 'Tap a header to sort. Tap a row for details.'],
    ['カウンセリング・無料体験の記録', 'Counseling / free trial log'],
    ['（「済」は対応数、「予定」は今後予定に入ります。名前は入れません）', '("Done" counts as handled, "Planned" goes to upcoming. No names.)'],
    // 見出し・項目
    ['今後予定しているカウンセリング・無料体験', 'Upcoming counseling / free trials'],
    ['先週店舗MT振り返り（行動アクション＆結果）', 'Last week\'s store meeting review (actions & results)'],
    ['既存会員へのアプローチ', 'Approach to existing members'],
    ['入会目標及び実数値', 'New members: goal & actual'], ['カウンセリング対応数', 'Counseling handled'], ['カウンセリング対応', 'Counseling handled'],
    ['セッション頻度表', 'Session frequency'], ['予実まとめ（試作）', 'KPI Summary (beta)'], ['予実まとめ', 'KPI Summary'],
    ['CSVを読み込み直す', 'Reload CSV'], ['CSVを読み込む', 'Load CSV'], ['CSVを選ぶ', 'Choose CSV'], ['架空のデータで試す', 'Try with sample data'],
    ['報告文をコピー', 'Copy report'], ['印刷・PDF', 'Print / PDF'], ['MTG報告（コピー用）', 'Meeting report (to copy)'],
    ['MTG資料', 'Meeting report'], ['予実カード', 'Trainer cards'], ['確認・修正', 'Check & fix'], ['報告文', 'Report text'],
    ['入金（月末着地予定）', 'Payments (month-end forecast)'], ['セッション 着地見込み', 'Session forecast'],
    ['月末着地予定', 'Month-end forecast'], ['今月着地予定', 'Month-end forecast'], ['着地予定÷目標', 'forecast ÷ goal'], ['着地見込み', 'forecast'],
    ['当月新規目標', 'New-member goal'], ['今月目標', 'Goal'], ['実数値', 'Actual'], ['達成率', 'Rate'], ['備考', 'Notes'], ['合計', 'Total'],
    ['入金売上', 'Payments'], ['セッション数', 'Sessions'], ['入会', 'New members'],
    ['稼働組数', 'Active'], ['アフター抜いた総数', 'Excl. aftercare'], ['週2組数', '2x/week'], ['週1組数', '1x/week'], ['アフター組数', 'Aftercare'], ['理想', 'Ideal'],
    ['会員数（組数）', 'Clients'], ['合計セッション数', 'Total sessions'], ['週2ペース以上（平均4.0日以下）', '2x/week+ (avg ≤ 4.0 days)'], ['週1ペース（4.0〜8.0日）', '1x/week (4.0–8.0 days)'], ['ランク別人数', 'By rank'],
    ['セッション日一覧', 'Session dates'], ['平均間隔（日）', 'Avg gap (days)'], ['週あたり回数', 'Per week'], ['前月平均（日）', 'Last month avg'], ['頻度UP/DOWN', 'Trend'],
    ['次回予約日', 'Next booking'], ['目標ペース（日）', 'Goal pace (days)'], ['今月回数', 'This month'], ['氏名で検索', 'Search name'], ['区分：すべて', 'Type: all'], ['並びを初期に戻す', 'Reset sort'],
    ['頻度UP', 'Up'], ['頻度DOWN', 'Down'], ['変わらず', 'Same'], ['未予約', 'Not booked'], ['予約あり', 'booked'],
    ['区分', 'Type'], ['氏名', 'Name'], ['ランク', 'Rank'], ['目標', 'Goal'], ['残り', 'Left'],
    ['既存', 'Existing'], ['法人契約', 'Corporate'], ['休会', 'Paused'], ['離脱', 'Left gym'],
    ['オフィシャルLP', 'Official LP'], ['オフィシャル電話', 'Official phone'], ['紹介', 'Referral'], ['その他', 'Other'], ['未設定', 'Not set'],
    ['今後予定', 'upcoming'], ['カウンセリング', 'Counseling'], ['予定', 'Planned'], ['済', 'Done'], ['追加', 'Add'], ['削除', 'Delete'], ['閉じる', 'Close'],
    ['担当スタッフ', 'Staff'], ['メニュー', 'Menu'], ['日付', 'Date'], ['時刻', 'Time'], ['状態', 'Status'], ['受講済み', 'Done'], ['予約中', 'Booked'], ['キャンセル', 'Cancelled'],
    ['店舗合計', 'Store total'], ['全員', 'Everyone'], ['表示', 'View'], ['週', 'Week'],
    ['1〜7日／8〜14日…', 'Days 1–7 / 8–14 …'], ['毎週木曜のMT時点', 'Weekly Thursday meeting'], ['月曜はじまり', 'Starting Monday'],
    ['予約実行日', 'Booking date'], ['セッション日', 'Session date'], ['チケット付与日', 'Ticket date'],
    ['担当・新規の判定', 'Trainer & new-member check'], ['実施済み・予約・着地見込み', 'Done, booked, forecast'], ['入金・新規', 'Payments & new members'],
    ['実施済み（本日分含む）', 'Done (incl. today)'], ['実施済み', 'Done'], ['予約済み', 'Booked'], ['（今月）', ' (this month)'], ['（先月）', ' (last month)'],
    ['今月（済）', 'This month (done)'], ['今月', 'This month'], ['目標 未入力', 'No goal yet'], ['未入力', 'not set'],
    ['入金', 'Payments'], ['セッション', 'Sessions'], ['新規', 'New'], ['お客様', 'Clients'], ['ペア・グループ', 'Pair/group'], ['同じ時間のマンツーマン', 'Same-time 1-on-1'],
    ['サンプル顧客', 'Sample client '], ['トレーナー', 'Trainer '], ['サンプル店', 'Sample gym'],
    ['平均間隔＝隣り合うセッション日の差の平均（1回だけの人は「—」）。', 'Avg gap = average days between sessions ("—" if only once). '],
    ['週あたり回数＝今月回数×7÷', 'Per week = sessions × 7 ÷ '], ['日。残り＝目標回数−実施済み（本日分含む）。目標ペース＝', ' days. Left = goal − done (incl. today). Goal pace = '],
    ['日÷目標回数（何日に1回なら届くか）。', ' days ÷ goal (one session every N days reaches it). '],
    ['●＝実施済み（本日分含む）、○＝これからの予約、数字＝同じ日に複数回。', '● = done (incl. today), ○ = upcoming booking, number = several on the same day. '],
    ['ランクは自動：S＝週3以上（平均間隔2.5日以下）、A＝週2（4.0日以下）、B＝週1（8.0日以下）、C＝週1以下（それより長い・今月1回だけ）、D＝区分が離脱。', 'Rank is automatic: S = 3x/week+ (avg gap ≤ 2.5 days), A = 2x/week (≤ 4.0), B = 1x/week (≤ 8.0), C = less than weekly (longer, or only once), D = left the gym.'],
    ['入会の流入経路：', 'New-member source: '], ['で判定', ' basis'], ['■セッション頻度', '■ Session frequency'], ['アフター抜き', 'excl. aftercare'], ['稼働', 'Active'],
    ['日目／', ' of '], ['（グラフの黒い線＝今日までの日数の割合）', ' days (black line = share of the month passed)'], ['目標まであと', 'to goal: '], ['本（予約で）', ' (by booking)'],
    ['この月の入金', 'Payments this month'], ['件（担当を確かめてください）', ' (please check the trainer)'],
    ['新規のお客様だけ「新規」にチェックを入れてください（外すと更新・追加）。', 'Tick "New" only for new clients (untick = renewal/add-on). '],
    ['担当の「自動」はセッションCSVから判定したものです。違っていたら選び直してください。他のトレーナーの担当で集計しないものは「集計から外す」。選んだ内容はこのiPadに保存され、次の月も使われます。', '"Auto" trainer comes from the session CSV. Change it if wrong; choose "Exclude" for other trainers\' clients. Saved on this device.'],
    ['担当が決まっていない入金が', 'Payments without a trainer: '], ['件あります。', ''], ['集計から外す（他のトレーナーなど）', 'Exclude (other trainer etc.)'], ['選ぶ（担当不明）', 'Choose (unknown)'],
    ['直前キャンセル（前日22:00より後）', 'Late cancellations (after 22:00 the day before)'],
    ['チェックが入っているものは「消化扱い」で実施に数えます。会員様の事情で消化にしないものは、チェックを外してください（このiPadに保存）。', 'Ticked = counted as a used session. Untick if you waive it for the client (saved on this device).'],
    ['消化扱い', 'Counted'], ['計算のルール', 'Calculation rules'], ['自動：', 'Auto: '], ['更新・追加', 'Renewal/add-on'], ['マンツーマン', '1-on-1'], ['ペア', 'Pair'], ['券', ' pass'], ['回コース', '-session course'],
    ['次回予約なし（離脱を除く）', 'No next booking (excl. left)'], ['押すと、その人だけ表示', 'Tap to show only them'], ['次回予約なしだけ', 'No next booking only'], ['入会（実数値）', 'New members (actual)'], ['実数値÷目標', 'Actual ÷ goal'], ['参考（CSVからの自動判定）：新規チケット ', 'Reference (auto from CSV): new tickets '], ['。実数値は手入力の数字を使います。', '. Actual uses the numbers you type.'], ['実数/目標：', 'actual/goal: '], ['なし', 'None'],
    ['✓ 自動保存しました', '✓ Saved'], ['試作', 'beta'], ['枠', ' slots'], ['分', ''],
    ['件から作成', ' rows'], ['次回予約日：', 'Next booking: '], ['前月：', 'Last month: ']
  ].sort(function (a, b) { return b[0].length - a[0].length; });
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var WD = { '日': 'Su', '月': 'Mo', '火': 'Tu', '水': 'We', '木': 'Th', '金': 'Fr', '土': 'Sa', '本': '', '件': '', '人': '', '組': '' };
  function tr(s) {
    if (!s || !/[\u3040-\u30ff\u3400-\u9fff【】（）／：、。・]/.test(s)) return s; // 英語にした後は何もしない（無限ループ防止）
    var t = s.trim(); if (WD[t]) return s.replace(t, WD[t]);
    s = s.replace(/(\d{4})年(\d{1,2})月/g, function (m, y, mo) { return MON[+mo - 1] + ' ' + y; });
    s = s.replace(/【(\d{1,2})月】/g, function (m, mo) { return '[' + MON[+mo - 1] + '] '; });
    s = s.replace(/(\d)週目(MT時点)?/g, 'Week $1').replace(/(\d)週 /g, 'W$1 ');
    D.forEach(function (p) { if (s.indexOf(p[0]) >= 0) s = s.split(p[0]).join(p[1]); });
    s = s.replace(/(\d+)本/g, '$1').replace(/(\d+)件/g, '$1').replace(/(\d+)人/g, '$1').replace(/(\d+)組/g, '$1').replace(/(\d+)回/g, '$1x');
    return s.replace(/■(?! )/g, '■ ').replace(/（/g, ' (').replace(/）/g, ')').replace(/／/g, ' / ').replace(/：/g, ': ').replace(/、/g, ', ').replace(/。/g, '. ').replace(/・/g, ', ');
  }
  var busy = false;
  function run(root) {
    if (lang !== 'en' || busy) return; busy = true;
    var w = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (x) { if (x.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/.test(x.parentNode.nodeName)) return; var v = tr(x.nodeValue); if (v !== x.nodeValue) x.nodeValue = v; });
    (root || document).querySelectorAll('[placeholder],[title],[aria-label]').forEach(function (el) { ['placeholder', 'title', 'aria-label'].forEach(function (a) { var v = el.getAttribute(a); if (v) { var t = tr(v); if (t !== v) el.setAttribute(a, t); } }); });
    document.title = tr(document.title); busy = false;
  }
  // 言語ボタン（右上）
  function addButton() {
    var top = document.querySelector('.top'); if (!top) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'topbtn langbtn'; b.textContent = lang === 'en' ? '日本語' : 'English';
    b.addEventListener('click', function () { try { localStorage.setItem('kpi-lang', lang === 'en' ? 'ja' : 'en'); } catch (e) {} location.reload(); });
    top.appendChild(b);
  }
  addButton();
  if (lang === 'en') {
    document.documentElement.lang = 'en';
    run();
    new MutationObserver(function () { if (!busy) run(); }).observe(document.body, { childList: true, subtree: true, characterData: true });
    // 報告文のコピーも英語にする
    var copy = document.getElementById('copy');
    if (copy) copy.addEventListener('click', function () { var r = document.getElementById('report'); if (r) r.textContent = tr(r.textContent); }, true);
  }
})();
