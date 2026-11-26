const gallery = document.getElementById('moments');
const track = gallery.querySelector('.moments-track');
const photos = [...track.querySelectorAll('figure')];
const controls = gallery.querySelector('.moments-controls');
const pages = gallery.querySelector('.moments-pages');
const status = gallery.querySelector('.moments-status');
const play = gallery.querySelector('.moments-play');
const viewer = gallery.querySelector('dialog');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const ratios = photos.map(figure => {
  const image = figure.querySelector('img');
  return Number(image.getAttribute('width')) / Number(image.getAttribute('height'));
});
let stops = [];
let currentPage = 0;
let previousWidth = 0;
let paused = reducedMotion.matches;
let hovered = false;
let inView = false;
let explicitlyPlaying = false;
let timer;

function schedule() {
  clearTimeout(timer);
  const focused = gallery.contains(document.activeElement) && !(explicitlyPlaying && document.activeElement === play);
  if (!paused && !hovered && !focused && !viewer.open && inView && !document.hidden && stops.length > 1) {
    timer = setTimeout(() => navigate(currentPage + 1), 7000);
  }
}

function setPaused(value) {
  paused = value;
  play.dataset.paused = String(value);
  const label = value ? 'Play slideshow' : 'Pause slideshow';
  play.setAttribute('aria-label', label);
  play.title = label;
  schedule();
}

function updatePage() {
  const nearest = stops.reduce((best, x, index) =>
    Math.abs(x - track.scrollLeft) < Math.abs(stops[best] - track.scrollLeft) ? index : best, 0);
  currentPage = nearest;
  Array.from(pages.children).forEach((button, index) => {
    if (index === nearest) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function navigate(index, manual = false) {
  if (!stops.length) return;
  if (manual) setPaused(true);
  const target = (index + stops.length) % stops.length;
  track.scrollTo({left: stops[target], behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  if (manual) status.textContent = 'Photo page ' + (target + 1) + ' of ' + stops.length;
  schedule();
}

function layout() {
  if (!track.clientWidth || track.clientWidth === previousWidth) return;
  previousWidth = track.clientWidth;
  const count = Math.min(Number(getComputedStyle(gallery).getPropertyValue('--photos-in-view')) || 2, photos.length);
  // A common height derived from the widest group keeps every photograph uncropped.
  const sums = ratios.slice(0, ratios.length - count + 1).map((_, i) =>
    ratios.slice(i, i + count).reduce((sum, ratio) => sum + ratio, 0));
  const gap = parseFloat(getComputedStyle(track).columnGap);
  const height = (track.clientWidth - gap * (count - 1) - 1) / Math.max(...sums);
  gallery.style.setProperty('--photo-height', height + 'px');
  const firstX = photos[0].getBoundingClientRect().left;
  const maximum = track.scrollWidth - track.clientWidth;
  stops = [];
  for (let i = 0; i < photos.length; i += count) {
    const position = Math.min(maximum, photos[i].getBoundingClientRect().left - firstX);
    if (!stops.length || position > stops[stops.length - 1] + 2) stops.push(position);
  }
  if (maximum > stops[stops.length - 1] + 2) stops.push(maximum);
  pages.replaceChildren(...stops.map((_, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Show photo page ' + (i + 1) + ' of ' + stops.length);
    button.setAttribute('aria-controls', track.id);
    button.addEventListener('click', () => navigate(i, true));
    return button;
  }));
  pages.hidden = controls.hidden = stops.length <= 1;
  gallery.dataset.ready = 'true';
  updatePage();
  schedule();
}

gallery.querySelector('.moments-prev').addEventListener('click', () => navigate(currentPage - 1, true));
gallery.querySelector('.moments-next').addEventListener('click', () => navigate(currentPage + 1, true));
play.addEventListener('click', () => {
  explicitlyPlaying = paused;
  setPaused(!paused);
});
track.addEventListener('scroll', updatePage, {passive: true});
track.addEventListener('pointerdown', () => setPaused(true));
track.addEventListener('wheel', () => setPaused(true), {passive: true});
track.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    navigate(currentPage + (event.key === 'ArrowRight' ? 1 : -1), true);
  }
});
gallery.addEventListener('pointerenter', event => { hovered = event.pointerType === 'mouse'; schedule(); });
gallery.addEventListener('pointerleave', () => { hovered = false; schedule(); });
gallery.addEventListener('focusin', schedule);
gallery.addEventListener('focusout', () => requestAnimationFrame(schedule));
document.addEventListener('visibilitychange', schedule);
reducedMotion.addEventListener('change', () => setPaused(reducedMotion.matches || paused));

track.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !viewer.showModal) return;
  event.preventDefault();
  setPaused(true);
  const image = viewer.querySelector('img');
  image.src = link.href;
  image.alt = link.querySelector('img').alt;
  viewer.querySelector('figcaption').textContent = link.closest('figure').querySelector('figcaption').textContent;
  viewer.showModal();
});
viewer.addEventListener('click', event => {
  if (event.target === viewer) viewer.close();
});
new IntersectionObserver(entries => {
  inView = entries[0].isIntersecting;
  schedule();
}).observe(gallery);
new ResizeObserver(layout).observe(track);
setPaused(paused);
layout();
