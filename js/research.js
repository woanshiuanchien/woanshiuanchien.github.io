import { loadData, scrollToLoadedAnchor } from './content.js';
import { records, entry } from './bibliography.js';
const container = document.querySelector('#selected-works');
async function selected() {
  const items = records(await loadData('publications'));
  const works = [];
  for (const key of ['spoken', 'health', 'trust']) {
    const selection = items.filter((item) => item.selected_for === key);
    for (const [index, item] of selection.entries()) {
      const article = entry(item, true);
      if (index === 0) article.id = 'work-' + key;
      works.push(article);
    }
    if (!selection.length) {
      // Keep the pillar link useful if the maintainer removes its last selection.
      const fallback = document.createElement('p');
      fallback.id = 'work-' + key;
      const link = document.createElement('a');
      link.href = 'publication.html';
      link.textContent = 'Browse the full bibliography';
      fallback.append(link);
      works.push(fallback);
    }
  }
  container.replaceChildren(...works);
  if (location.hash.startsWith('#work-')) scrollToLoadedAnchor();
}
selected().catch(() => {
  /* The static bibliography link remains available. */
});
