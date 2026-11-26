import {
  loadData,
  brandIcon,
  element,
  calendarDate,
  timeNode,
  linkOrText,
  scrollToLoadedAnchor,
} from './content.js';

const PAGE_SIZE = 12;
const list = document.querySelector('#invited-talks-list');
const pagination = document.querySelector('#invited-talks-pagination');
async function init() {
  const data = await loadData('invited-talks');
  const talks = [...data.invited_talks].sort((a, b) =>
    calendarDate(b.date).iso.localeCompare(calendarDate(a.date).iso),
  );
  const today = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  if (data.last_updated)
    document
      .querySelector('#invited-talks-update-label')
      .append('Updated ', timeNode(data.last_updated));
  const pageCount = Math.max(1, Math.ceil(talks.length / PAGE_SIZE));
  let page = 1;
  function render() {
    list.replaceChildren();
    for (const talk of talks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)) {
      const row = element('article', null, 'talk');
      const body = element('div');
      if (calendarDate(talk.date).iso > today) body.append(element('span', 'Upcoming', 'status-label'));
      const title = element('h3');
      const titleLabel = talk.topic || 'Title pending';
      const titleLink = linkOrText(titleLabel, talk.url);
      if (titleLink instanceof HTMLAnchorElement && talk.link_style === 'plain-new-tab') {
        titleLink.target = '_blank';
        titleLink.rel = 'noopener noreferrer';
      }
      title.append(titleLink);
      body.append(title, element('p', talk.organization));
      const meta = element('div', null, 'talk-meta');
      if (talk.place) {
        const place = element('span', null, 'place icon-label');
        place.append(brandIcon('location'), element('span', talk.place));
        meta.append(place);
      }
      meta.append(timeNode(talk.date));
      row.append(body, meta);
      list.append(row);
    }
    if (!talks.length) list.append(element('p', 'No invited talks listed.'));
    const inner = element('div', null, 'pagination-inner');
    inner.append(element('span', 'Page ' + page + ' of ' + pageCount + ' · ' + talks.length + ' talks'));
    const pager = element('div', null, 'pager');
    function control(label, target, disabled, current = false) {
      const button = element('button', label);
      button.type = 'button';
      button.disabled = disabled;
      if (current) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => {
        page = target;
        render();
        document.querySelector('#talks-title').focus();
      });
      pager.append(button);
    }
    if (pageCount > 1) control('First', 1, page === 1);
    control('Previous', page - 1, page === 1);
    for (let n = 1; n <= pageCount; n++) control(String(n), n, false, n === page);
    control('Next', page + 1, page === pageCount);
    if (pageCount > 1) control('Last', pageCount, page === pageCount);
    inner.append(pager);
    pagination.replaceChildren(inner);
  }
  render();
  if (location.hash.includes('invited-talks')) scrollToLoadedAnchor();
}
init().catch(() => {
  list.textContent = 'The talk archive could not be loaded. Please reload the page.';
});


// Preserve the education bookmark after moving those records into Biography.
function resolveEducationBookmark() {
  if (location.hash === '#education') location.replace(new URL('../index.html#education', import.meta.url));
}
window.addEventListener('hashchange', resolveEducationBookmark);
resolveEducationBookmark();
