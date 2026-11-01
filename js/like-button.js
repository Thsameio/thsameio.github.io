/* ==========================================================
   文章点赞按钮 v5
   - 只在真正的文章页（<article id="article-container">）显示
   - 心形容器类名用 .lk-heart：不能叫 .heart！Butterfly 的
     「点击爱心特效」(click_heart) 会注入全局 .heart 样式
     （红方块 rotate(45deg) + 两个圆形伪元素），类名撞车会把
     按钮爱心污染成一坨红色圆块（v4 之前一直背这个锅）。
   - 心形是"单颗 SVG"：空心描边，悬停/已赞变实心红。
   - 样式由本脚本注入 <style>（自兜底）：就算 like-button.css
     被浏览器/CDN 缓存成旧版，按钮也不会错乱。
   - 点赞状态存 localStorage，按文章路径区分（每篇文章独立记忆）
   - 计数 = 稳定基础数（按路径生成的伪随机值，仅本机可见）
            + 你自己的 1 次点赞；点一下切换已赞/未赞
   - pjax 切文章后用 btf.addGlobalFn 重新挂载，避免按钮丢失
   说明：纯静态站点没有后端，这里是「本机记住你点过赞」，
        不是全站共享计数（要全站共享需接后端/第三方服务）。
   ========================================================== */
(function () {
  'use strict';

  /* ---------- 自注入样式（与 like-button.css v5 保持一致） ---------- */
  var STYLE_ID = 'like-button-style';
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.like-btn{display:flex;align-items:center;justify-content:center;width:fit-content;' +
      'margin:30px auto 10px;padding:14px 28px 14px 26px;' +
      'box-shadow:rgba(10,37,64,.35) 0 -2px 6px 0 inset;background-color:#e8e8e8;' +
      'border-color:#ffe2e2;border-style:solid;border-width:9px;border-radius:35px;' +
      'font-size:20px;cursor:pointer;font-weight:900;color:rgb(134,124,124);' +
      'font-family:monospace;word-spacing:-2px;position:relative;' +
      'transition:transform 400ms cubic-bezier(.68,-.55,.27,2.5),border-color 400ms ease-in-out,background-color 400ms ease-in-out}' +
      '.like-btn .lk-heart{position:relative;display:inline-block;width:26px;height:26px;' +
      'margin-right:10px;flex:0 0 auto}' +
      '.like-btn .lk-heart svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;' +
      'fill:none;stroke:#ff6b6b;stroke-width:2.2;' +
      'transition:fill 200ms ease-in-out,stroke 200ms ease-in-out}' +
      '.like-btn:hover .lk-heart svg{fill:#ff6b6b;stroke:#ff6b6b}' +
      '.like-btn.liked .lk-heart svg{fill:#ff4040;stroke:#ff4040;animation:beatingHeart 1.2s infinite}' +
      '@keyframes movingBorders{0%{border-color:#fce4e4}50%{border-color:#ffd8d8}90%{border-color:#fce4e4}}' +
      '.like-btn:hover{background-color:#eee;transform:scale(105%);animation:movingBorders 3s infinite}' +
      '.like-btn .like-label{margin-right:8px}' +
      '.like-btn .like-count{font-variant-numeric:tabular-nums}' +
      '@keyframes beatingHeart{0%,60%,100%{transform:scale(1)}30%{transform:scale(1.15)}45%{transform:scale(1)}}';
    document.head.appendChild(style);
  }

  function lsGet(k) {
    try { return localStorage.getItem(k); } catch (e) { return null; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, v); } catch (e) {}
  }

  var HEART_PATH = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';

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
      '<span class="lk-heart">' +
        '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<path d="' + HEART_PATH + '"/>' +
        '</svg>' +
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
