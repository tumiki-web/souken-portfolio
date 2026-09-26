(() => {
  'use strict';
  const demoForm = document.querySelector('#demo-contact');
  if (demoForm) {
    // No named controls, endpoint, storage or network API: this UI never sends data.
    demoForm.addEventListener('submit', event => event.preventDefault());
    document.querySelector('#demo-fields').disabled = false;
    document.querySelector('#demo-submit').addEventListener('click', () => {
      if (!demoForm.reportValidity()) return;
      const result = document.querySelector('#demo-result');
      result.textContent = '入力内容を確認しました。デモフォームのため送信されません。入力内容の保存も行っていません。';
      result.classList.add('notice');
      result.focus();
    });
  }
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-nav');
  const main = document.querySelector('main');
  const footer = document.querySelector('.site-footer');
  const setMenu = (open, restoreFocus = false) => {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (main) main.inert = open;
    if (footer) footer.inert = open;
    if (restoreFocus) toggle.focus();
  };
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (toggle?.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') setMenu(false, true);
    if (event.key === 'Tab') {
      const items = [document.querySelector('.site-header .brand'), toggle, ...menu.querySelectorAll('a')];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
  // Images are intentionally supplied later. Failed assets reveal the designed fallback.
  document.querySelectorAll('img[data-optional]').forEach(img => {
    const fail = () => { img.hidden = true; };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });
})();
