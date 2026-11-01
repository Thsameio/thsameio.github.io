/* ===========================================================
   extras.js —— 博客扩展功能（纯前端）
   1) 阅读进度条  2) 导航滚动阴影  3) 站点运行天数  4) 公告条
   （访客数/浏览量由主题自带 busuanzi 在侧栏展示，此处不重复加载）
   =========================================================== */
(function () {
  'use strict';

  /* ---------- 1) 阅读进度条 ---------- */
  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  document.body.appendChild(bar);

  function updateProgress() {
    var art = document.getElementById('article-container');
    if (!art) { bar.style.width = '0%'; return; }
    var start = art.getBoundingClientRect().top + window.scrollY;
    var total = art.offsetHeight - window.innerHeight;
    if (total <= 0) {
      bar.style.width = (window.scrollY > start ? '100%' : '0%');
      return;
    }
    var pct = (window.scrollY - start) / total * 100;
    pct = Math.max(0, Math.min(100, pct));
    bar.style.width = pct + '%';
  }

  /* ---------- 2) 导航栏滚动阴影 ---------- */
  var nav = document.getElementById('nav');
  function updateNav() {
    if (nav) nav.classList.toggle('nav-scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', function () {
    updateProgress();
    updateNav();
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
  updateNav();

  /* ---------- 3) 站点运行天数（在页脚展示） ---------- */
  // 博客建站时间（可按需修改）
  var START = new Date('2026-10-31T00:00:00+08:00').getTime();
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function runText() {
    var diff = Math.max(0, Date.now() - START);
    var d = Math.floor(diff / 86400000);
    var h = Math.floor(diff % 86400000 / 3600000);
    var m = Math.floor(diff % 3600000 / 60000);
    var s = Math.floor(diff % 60000 / 1000);
    return d + ' 天 ' + pad(h) + ' 时 ' + pad(m) + ' 分 ' + pad(s) + ' 秒';
  }

  /* ---------- 4) 页脚：站点运行天数 ---------- */
  // 注：访客数/浏览量由主题自带 busuanzi(vercount) 在侧栏"网站资讯"展示，这里不重复加载
  var footer = document.getElementById('footer');
  if (footer) {
    var ef = document.createElement('div');
    ef.id = 'extras-footer';
    ef.innerHTML = '本站已安全运行 <span id="run-days">…</span>';
    footer.appendChild(ef);

    var rd = document.getElementById('run-days');
    function tick() { if (rd) rd.textContent = runText(); }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 6) 公告条（可关闭，localStorage 记忆） ---------- */
  try {
    if (!localStorage.getItem('site_announce_dismissed')) {
      var an = document.createElement('div');
      an.id = 'site-announce';
      an.innerHTML =
        '<span class="announce-close" title="关闭">×</span>' +
        '📢 欢迎来到我的博客！这里记录我的学习与生活，有问题欢迎在文章下方留言～';
      document.body.appendChild(an);
      an.querySelector('.announce-close').addEventListener('click', function () {
        an.remove();
        try { localStorage.setItem('site_announce_dismissed', '1'); } catch (e) {}
      });
    }
  } catch (e) {}
})();
