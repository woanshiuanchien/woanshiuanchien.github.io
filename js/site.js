const shell = document.querySelector('.portfolio');
const rail = document.querySelector('.identity-rail');
const railToggle = document.querySelector('.rail-toggle');
const openButton = document.querySelector('.drawer-toggle');
const closeButton = document.querySelector('.drawer-close');
const backdrop = document.querySelector('.drawer-backdrop');
const mobileBar = document.querySelector('.mobile-bar');
const readingPane = document.querySelector('.reading-pane');
const layout = getComputedStyle(document.documentElement);
const narrow = matchMedia('(max-width:' + layout.getPropertyValue('--breakpoint-drawer').trim() + ')');
const smallDesktop = matchMedia('(max-width:' + layout.getPropertyValue('--breakpoint-rail').trim() + ')');
const tip = document.createElement('div');
tip.className = 'rail-tip';
tip.setAttribute('aria-hidden','true');
tip.hidden = true;
document.body.append(tip);
let preference;
try { preference = localStorage.getItem('winnie-sidebar'); } catch { /* Storage is optional. */ }
function setCompact(compact) {
  shell.dataset.compact = String(compact);
  railToggle.setAttribute('aria-expanded',String(!compact));
  railToggle.title = compact ? 'Expand sidebar' : 'Collapse sidebar';
  railToggle.setAttribute('aria-label',railToggle.title);
  tip.hidden = true;
}
function drawer(open, restoreFocus = false) {
  const modal = open && narrow.matches;
  shell.dataset.open = String(modal);
  rail.inert = narrow.matches && !modal;
  readingPane.inert = mobileBar.inert = modal;
  document.querySelector('.back-to-top').inert = modal;
  backdrop.hidden = !modal;
  openButton.setAttribute('aria-expanded',String(modal));
  document.body.classList.toggle('drawer-open',modal);
  if (modal) {
    rail.setAttribute('role','dialog');
    rail.setAttribute('aria-modal','true');
    closeButton.focus();
  } else {
    rail.removeAttribute('role');
    rail.removeAttribute('aria-modal');
    if (restoreFocus && narrow.matches) openButton.focus();
  }
}
function adapt() {
  document.documentElement.classList.add('has-rail');
  railToggle.hidden = narrow.matches;
  openButton.hidden = closeButton.hidden = !narrow.matches;
  setCompact(!narrow.matches && (preference === 'compact' || (preference !== 'full' && smallDesktop.matches)));
  drawer(false);
}
railToggle.addEventListener('click',() => {
  const compact = shell.dataset.compact !== 'true';
  preference = compact ? 'compact' : 'full';
  try { localStorage.setItem('winnie-sidebar',preference); } catch { /* Current page still works. */ }
  setCompact(compact);
});
openButton.addEventListener('click',() => drawer(true));
closeButton.addEventListener('click',() => drawer(false,true));
backdrop.addEventListener('click',() => drawer(false,true));
rail.addEventListener('click',event => { if (event.target.closest('a') && shell.dataset.open === 'true') drawer(false,true); });
document.addEventListener('keydown',event => {
  if (event.key === 'Escape') tip.hidden = true;
  if (shell.dataset.open !== 'true') return;
  if (event.key === 'Escape') { drawer(false,true); return; }
  if (event.key !== 'Tab') return;
  const available = [...rail.querySelectorAll('a[href],button')].filter(el => el.getClientRects().length);
  const first = available[0], last = available[available.length-1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
function showTip(event) {
  const link = event.target.closest('.rail-nav a');
  if (!link || shell.dataset.compact !== 'true') { tip.hidden = true; return; }
  const bounds = link.getBoundingClientRect();
  tip.textContent = link.getAttribute('aria-label');
  tip.hidden = false;
  const placedAtSide = shell.dataset.compact === 'true';
  const x = placedAtSide ? bounds.right + 5 : bounds.left + (bounds.width - tip.offsetWidth) / 2;
  const y = placedAtSide ? bounds.top : bounds.top - tip.offsetHeight - 4;
  tip.style.left = Math.max(4, Math.min(innerWidth - tip.offsetWidth - 4, x)) + 'px';
  tip.style.top = Math.max(4, Math.min(innerHeight - tip.offsetHeight - 4, y)) + 'px';
}
rail.addEventListener('pointerover',showTip);
rail.addEventListener('focusin',showTip);
for (const event of ['pointerleave','focusout','scroll']) rail.addEventListener(event,() => { tip.hidden = true; });
narrow.addEventListener('change',adapt);
smallDesktop.addEventListener('change',adapt);
window.addEventListener('pageshow',adapt);
adapt();

const map = document.querySelector('.map-details');
map?.addEventListener('toggle', () => {
  if (map.open && !map.querySelector('iframe')) {
    map.append(document.querySelector('#map-template').content.cloneNode(true));
  }
});
const copy = document.querySelector('#copy-email');
copy?.addEventListener('click', async () => {
  const address = document.querySelector('#email-address');
  const feedback = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(address.textContent);
    feedback.textContent = 'Email address copied.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(address);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    feedback.textContent = 'Address selected. Use your device’s Copy command.';
  }
});

const backToTop = document.querySelector('.back-to-top');
function updateTopControl() {
  backToTop.hidden = window.scrollY < Math.min(440, window.innerHeight * 0.65);
}
if (backToTop) {
  window.addEventListener('scroll', updateTopControl, {passive:true});
  window.addEventListener('pageshow', updateTopControl);
  backToTop.addEventListener('click', () => {
    (narrow.matches ? openButton : document.querySelector('.signature-link')).focus({preventScroll:true});
    window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  updateTopControl();
}

// A platform tooltip can be dismissed while its link keeps keyboard focus.
for (const link of document.querySelectorAll('.platform-profiles a')) {
  for (const event of ['pointerenter', 'focus']) {
    link.addEventListener(event, () => delete link.dataset.dismissed);
  }
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    for (const link of document.querySelectorAll('.platform-profiles a:is(:hover, :focus)')) {
      link.dataset.dismissed = '';
    }
  }
});
