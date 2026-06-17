/**
 * Custom JavaScript for FixIt blog site.
 * 拦截 Giscus 自动加载，改成「点击加载评论」按钮
 * @author Supper2002
 */
class FixItBlog {
  /**
   * initialize
   * @returns {FixItBlog}
   */
  init() {
    this.deferGiscus();
    return this;
  }

  /**
   * 把 Giscus 的自动加载改成点击触发
   * 原因：giscus.app 在国内访问慢，避免每个访客都被动等待
   */
  deferGiscus() {
    const container = document.getElementById('giscus');
    if (!container) return;

    const scriptEl = container.querySelector('script[src*="giscus"]');
    if (!scriptEl) return;

    // 保存原 script 标签的全部属性，供点击后重建
    const attrs = {};
    for (const attr of scriptEl.attributes) {
      attrs[attr.name] = attr.value;
    }

    // 清空容器：阻止 client.js 继续加载，移除可能已经创建的 iframe
    container.innerHTML = '';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '加载评论';
    Object.assign(btn.style, {
      display: 'block',
      margin: '1.5rem auto',
      padding: '0.55rem 1.6rem',
      fontSize: '0.95rem',
      fontFamily: 'inherit',
      color: 'currentColor',
      background: 'transparent',
      border: '1px solid currentColor',
      borderRadius: '6px',
      cursor: 'pointer',
      opacity: '0.7',
      transition: 'opacity 0.2s ease',
    });

    btn.addEventListener('mouseenter', () => (btn.style.opacity = '1'));
    btn.addEventListener('mouseleave', () => (btn.style.opacity = '0.7'));
    btn.addEventListener('click', () => {
      btn.remove();
      const s = document.createElement('script');
      for (const [k, v] of Object.entries(attrs)) {
        s.setAttribute(k, v);
      }
      container.appendChild(s);
    });

    container.appendChild(btn);
  }
}

/**
 * immediate execution
 */
(() => {
  window.fixitBlog = new FixItBlog();
  document.addEventListener('DOMContentLoaded', () => {
    window.fixitBlog.init();
  });
})();
