// 画面の切り替え（タブ）と、読み込み直しボタン
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var panels = ['stepM', 'stepF', 'step3', 'step2', 'step4'];
  function get() { try { return localStorage.getItem('kpi-tab') || 'stepM'; } catch (e) { return 'stepM'; } }
  function set(t) { try { localStorage.setItem('kpi-tab', t); } catch (e) {} }
  function open(t) {
    if (panels.indexOf(t) < 0) t = 'stepM';
    panels.forEach(function (id) { $(id).hidden = id !== t; });
    document.querySelectorAll('.tabs .tab').forEach(function (b) { b.classList.toggle('on', b.dataset.tab === t); });
    set(t);
  }
  document.querySelector('.tabs').addEventListener('click', function (e) {
    var b = e.target.closest('.tab'); if (!b) return;
    open(b.dataset.tab); window.scrollTo(0, 0);
  });
  $('reload').addEventListener('click', function () { $('welcome').hidden = !$('welcome').hidden; window.scrollTo(0, 0); });
  window.UI = {
    show: function () { $('welcome').hidden = true; $('ui').hidden = false; $('reload').hidden = false; open(get()); },
    // 確認・修正タブの数字：担当が決まっていない入金＋直前キャンセルの件数
    refresh: function () {
      var n = document.querySelectorAll('#unknown .unk.need').length + document.querySelectorAll('#late input[data-waive]').length;
      var b = $('fixbadge'); b.hidden = !n; b.textContent = n;
    }
  };
})();
