import './gallery.js';
import { brandIcon, loadData, element, enabled, calendarDate, timeNode, linkOrText } from './content.js';

function legacyContact() {
  if (location.hash.toLowerCase() === '#contact') {
    location.replace(new URL('../pages/contact.html', import.meta.url));
  }
}
legacyContact();
window.addEventListener('hashchange', legacyContact);

const categoryIcons = {
  'Research Spotlight': 'research-spotlight',
  'Faculty Honor': 'faculty-honor',
  'Student Honor': 'student-honor',
  Talk: 'invited-talk',
};
const list = document.querySelector('#news-list');
const tabs = document.querySelector('#news-tabs');
const more = document.querySelector('#news-more');

async function news() {
  const data = await loadData('news');
  const items = data.items
    .filter((item) => enabled(item.is_visible, true))
    .sort(
      (a, b) =>
        calendarDate(b.date).iso.localeCompare(calendarDate(a.date).iso) || a.sort_order - b.sort_order,
    );
  let active = 'All';
  let expanded = false;
  function render() {
    const matches = items.filter((item) => active === 'All' || item.category === active);
    const shown = expanded ? matches : matches.slice(0, 6);
    list.replaceChildren();
    for (const item of shown) {
      const li = element('li');
      const body = element('div', null, 'news-body');
      if (item.text_html) {
        // Optional rich text authored by the website maintainer in the shipped JSON file.
        body.innerHTML = item.text_html;
      } else {
        if (item.prefix) body.append(item.prefix);
        if (item.link_text) body.append(' ', linkOrText(item.link_text, item.link_url));
        if (item.suffix) body.append(/^[.,!?]/.test(item.suffix) ? '' : ' ', item.suffix);
      }
      li.append(timeNode(item.date), brandIcon(item.icon || 'megaphone'), body);
      list.append(li);
    }
    if (!matches.length) list.append(element('li', 'No news in this category yet.'));
    more.hidden = matches.length <= 6;
    more.textContent = expanded ? 'Show less' : 'Show all ' + matches.length + ' items';
    more.setAttribute('aria-expanded', String(expanded));
    document.querySelector('#news-status').textContent =
      shown.length + ' of ' + matches.length + ' news items.';
    for (const button of tabs.children)
      button.setAttribute('aria-pressed', String(button.textContent === active));
  }
  for (const category of ['All', ...data.categories]) {
    const button = element('button', category);
    button.type = 'button';
    if (categoryIcons[category]) button.prepend(brandIcon(categoryIcons[category]));
    button.addEventListener('click', () => {
      active = category;
      expanded = false;
      render();
    });
    tabs.append(button);
  }
  more.setAttribute('aria-controls', 'news-list');
  more.addEventListener('click', () => {
    expanded = !expanded;
    render();
  });
  render();
}
news().catch(() =>
  list.replaceChildren(element('li', 'News could not be loaded. Please reload the page.')),
);
