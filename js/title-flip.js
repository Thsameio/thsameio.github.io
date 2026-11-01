/* ==========================================================
   标题动态效果（站点级，全站生效）
   - 离开当前标签页：标题变成「你溜啦？快回来~」
   - 切回标签页：先显示「欢迎回来！」4 秒，再复原原标题
   兼容 Butterfly 的 pjax：每次隐藏时重新读取当前真实标题，
   避免 pjax 跳转后复原成旧标题
   ========================================================== */
(function () {
  'use strict';

  var AWAY = '（╹□╹）你溜啦？快回来~ ';
  var BACK = '（◡‿◡）欢迎回来！';

  /* 记录"当前真实标题"，隐藏时刷新，避免 pjax 后被旧标题覆盖 */
  var currentTitle = document.title;

  function applyAway() {
    currentTitle = document.title;
    document.title = AWAY + currentTitle;
  }

  function applyBack() {
    document.title = BACK;
    if (window.__titleFlipTimer) clearTimeout(window.__titleFlipTimer);
    window.__titleFlipTimer = setTimeout(function () {
      document.title = currentTitle;
    }, 4000);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      applyAway();
    } else {
      applyBack();
    }
  });

  /* 调试用：确认脚本已执行（浏览器控制台可见） */
  if (window.console && console.log) {
    console.log('[title-flip] 已加载，切走/切回标签页试试标题变化');
  }
})();
