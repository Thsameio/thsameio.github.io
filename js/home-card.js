/* ==========================================================
   首页个人名片卡 - 自动插入到文章列表上方
   只在首页第一页显示；不改动主题源文件
   ========================================================== */
(function () {
  'use strict';

  /* 只在首页显示（排除 /page/2/ 等分页） */
  var path = location.pathname.replace(/index\.html$/, '');
  if (path !== '/' && path !== '') return;

  var host = document.getElementById('recent-posts');
  if (!host || document.getElementById('hc-card')) return;

  /* ---------- 个人信息（改这里就行） ---------- */
  var INFO = {
    avatar: '/img/123.jpg',
    name: '曹璐逸',
    slogan: '大连理工大学 2026 级 · 正在和 C 语言死磕，也在学着把想法做成看得见的东西。这里记录我的折腾、踩坑和一些没头没脑的日常。',
    github: 'https://github.com/Thsameio',
    email: 'mailto:1085807014@qq.com',
    since: '2025-10-31'          /* 建站日期，用于计算建站天数 */
  };
  /* ------------------------------------------ */

  /* ---------- 日期 ---------- */
  var now = new Date();
  var WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  var dateText = now.getFullYear() + ' 年 ' + (now.getMonth() + 1) + ' 月 ' + now.getDate() + ' 日';
  var weekText = WEEK[now.getDay()];

  /* 今年已过百分比 */
  var yearStart = new Date(now.getFullYear(), 0, 1);
  var yearEnd = new Date(now.getFullYear() + 1, 0, 1);
  var yearProg = Math.floor((now - yearStart) / (yearEnd - yearStart) * 100);

  /* 建站天数 */
  var sinceDate = new Date(INFO.since);
  var runDays = isNaN(sinceDate.getTime())
    ? 0
    : Math.max(1, Math.floor((now - sinceDate) / 86400000));

  /* ---------- 从侧边栏读取站点统计 ---------- */
  function pickStat(keywords) {
    var items = document.querySelectorAll('#aside-content .webinfo-item');
    for (var i = 0; i < items.length; i++) {
      var nameEl = items[i].querySelector('.item-name');
      var countEl = items[i].querySelector('.item-count');
      if (!nameEl || !countEl) continue;
      var name = nameEl.textContent || '';
      for (var k = 0; k < keywords.length; k++) {
        if (name.indexOf(keywords[k]) > -1) return countEl.textContent.trim();
      }
    }
    return null;
  }

  var postCount = pickStat(['文章', 'Article', 'Posts']);
  var wordCount = pickStat(['字数', 'Word']);

  var stats = [];
  if (postCount) stats.push({ num: postCount, label: '篇文章' });
  if (wordCount) stats.push({ num: wordCount, label: '总字数' });
  stats.push({ num: runDays, label: '建站天数' });

  var statsHtml = stats.map(function (s) {
    return '<div class="hc-stat"><b>' + s.num + '</b><span>' + s.label + '</span></div>';
  }).join('');

  /* ---------- 组装卡片 ---------- */
  var card = document.createElement('div');
  card.className = 'hc-card';
  card.id = 'hc-card';
  card.innerHTML =
    '<div class="hc-avatar"><img src="' + INFO.avatar + '" alt="' + INFO.name + '"></div>' +
    '<div class="hc-body">' +
      '<div class="hc-name">' + INFO.name + '<span class="hc-wave">👋</span></div>' +
      '<p class="hc-slogan">' + INFO.slogan + '</p>' +
      '<div class="hc-date">' +
        '<i class="far fa-calendar-alt"></i>' +
        '<span>' + dateText + '</span>' +
        '<span class="hc-sep">·</span>' +
        '<span>' + weekText + '</span>' +
        '<span class="hc-sep">·</span>' +
        '<span class="hc-prog">' + yearProg + '%</span>' +
        '<span>已过</span>' +
      '</div>' +
      '<div class="hc-stats">' + statsHtml + '</div>' +
    '</div>' +
    '<div class="hc-social">' +
      '<a class="hc-btn" href="' + INFO.github + '" target="_blank" rel="noopener">' +
        '<i class="fab fa-github"></i>GitHub</a>' +
      '<a class="hc-btn hc-mail" href="' + INFO.email + '">' +
        '<i class="fas fa-envelope"></i>邮箱</a>' +
      '<a class="hc-btn hc-more" href="/about/">' +
        '<i class="fas fa-user"></i>关于我</a>' +
    '</div>';

  /* 插入到左栏内部最前面：#content-inner 是 flex 容器，
     插在外面会被当作 flex item 压缩成竖条 */
  host.insertBefore(card, host.firstChild);

  /* ---------- 无封面卡片：取消固定高度，消除大片留白 ---------- */
  var items = document.querySelectorAll('#recent-posts .recent-post-item');
  for (var i = 0; i < items.length; i++) {
    if (items[i].querySelector('.recent-post-info.no-cover')) {
      items[i].classList.add('hc-nocover');
    }
  }
})();
