/* ==========================================================
   标题动态效果（站点级，全站生效）
   - 离开当前标签页：标题变成「你溜啦？快回来~」
   - 切回标签页：先闪一下「欢迎回来！」，1.6s 后复原原标题
   配合 Butterfly 的 pjax 也能正常工作：
   每次隐藏时重新记录当前真实标题，避免 pjax 跳转后复原成旧标题
   ========================================================== */
(function () {
  'use strict';

  var AWAY = '（╹□╹）你溜啦？快回来~ ';
  var BACK = '（◡‿◡）欢迎回来！';

  /* 记录"当前真实标题"，隐藏时刷新，避免 pjax 后被旧标题覆盖 */
  var currentTitle = document.title;

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      currentTitle = document.title;
      document.title = AWAY + currentTitle;
    } else {
      document.title = BACK;
      clearTimeout(window.__titleFlipTimer);
      window.__titleFlipTimer = setTimeout(function () {
        document.title = currentTitle;
      }, 1600);
    }
  });
})();
