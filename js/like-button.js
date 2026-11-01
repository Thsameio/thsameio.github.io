/* ==========================================================
   文章点赞按钮
   - 只在真正的文章页（<article id="article-container">）显示
   - 点赞状态存 localStorage，按文章路径区分（每篇文章独立记忆）
   - 计数 = 稳定的基础数（按路径生成的伪随机值，仅本机可见）
            + 你自己的 1 次点赞；点一下切换已赞/未赞
   - pjax 切文章后用 btf.addGlobalFn 重新挂载，避免按钮丢失
   说明：纯静态站点没有后端，这里是「本机记住你点过赞」，
        不是全站共享计数（要全站共享需接后端/第三方服务）。
   ========================================================== */
(function () {
  'use strict';

  function lsGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
  }

  function buildButton() {
    /* 先清掉上一次（pjax 切换时）可能残留的按钮 */
    var old = document.querySelector('.like-btn');
    if (old) old.remove();

    /* 只在文章页添加：about/标签页是 <div id="article-container">，
       只有文章页才是 <article id="article-container"> */
    var article = document.querySelector('article#article-container');
    if (!article) return;

    function postId() {
      var p = location.pathname.replace(/index\.html$/, '').replace(/\/+$/, '');
      return p || 'home';
    }
    var id = postId();
    var KEY_LIKED = 'blog-like-' + id + '-liked';
    var KEY_BASE = 'blog-like-' + id + '-base';

    /* 稳定的基础数：按路径哈希生成，首次访问算一次并缓存 */
    function getBase() {
      var b = lsGet(KEY_BASE);
      if (b === null) {
        var h = 0, s = id;
        for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
        b = 8 + (h % 90);
        lsSet(KEY_BASE, String(b));
      }
      return parseInt(b, 10) || 0;
    }

    var liked = lsGet(KEY_LIKED) === '1';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'like-btn' + (liked ? ' liked' : '');
    btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    btn.setAttribute('aria-label', '点赞');
    btn.innerHTML =
      '<span class="heart">' +
        '<i class="fa-regular fa-heart heart-empty" aria-hidden="true"></i>' +
        '<i class="fa-solid fa-heart heart-filled" aria-hidden="true"></i>' +
      '</span>' +
      '<span class="like-label">' + (liked ? '已赞' : '点赞') + '</span>' +
      '<span class="like-count">' + (getBase() + (liked ? 1 : 0)) + '</span>';

    function update() {
      var n = getBase() + (liked ? 1 : 0);
      btn.querySelector('.like-count').textContent = n;
      btn.querySelector('.like-label').textContent = liked ? '已赞' : '点赞';
      btn.classList.toggle('liked', liked);
      btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
    }

    btn.addEventListener('click', function () {
      liked = !liked;
      lsSet(KEY_LIKED, liked ? '1' : '0');
      update();
    });

    /* 插到评论区之前；没有评论区就插到文章末尾 */
    var comment = document.getElementById('post-comment');
    if (comment && comment.parentNode) {
      comment.parentNode.insertBefore(btn, comment);
    } else {
      article.parentNode.insertBefore(btn, article.nextSibling);
    }
  }

  /* 首次加载 */
  buildButton();

  /* pjax 切换文章后重新挂载 */
  if (window.btf && typeof window.btf.addGlobalFn === 'function') {
    window.btf.addGlobalFn('pjaxComplete', buildButton, 'like-button');
  }
})();
