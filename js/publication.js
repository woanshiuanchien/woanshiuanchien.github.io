import { brandIcon, element, enabled, linkOrText, loadData, scrollToLoadedAnchor } from './content.js';

function ordered(items = []) {
  return [...items].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

// Prefer the editor's short label. Recognize known venues only in the venue citation.
const venues = [
  ['TAFFC', /IEEE Transactions on Affective Computing/i],
  ['ICASSP', /\bICASSP\b|International Conference on Acoustics,? Speech and Signal Processing/i],
  ['EMBC', /\bEMBC\b|Engineering in Medicine and Biology Society/i],
  ['Interspeech', /\bInterspeech\b|Conference of the International Speech Communication Association/i],
  ['ACII', /\bACII\b|Affective Computing (?:and|&) Intelligent Interaction/i],
  ['BSN', /\bBSN\b|Conference on Body Sensor Networks/i],
  ['ISBI', /\bISBI\b|International Symposium on Biomedical Imaging/i],
  ['MLSP', /\bMLSP\b|Workshop on Machine Learning for Signal Processing/i],
  ['ICMI', /\bICMI\b|Conference on Multimodal Interaction/i],
  ['ACL', /\bACL\b|Annual Meeting of the Association for Computational Linguistics/i],
  ['ACMMM', /ACM International Conference on Multimedia/i],
  ['ICBIP', /\bICBIP\b|Conference on Biomedical Signal and Image Processing/i],
];

function venueLabel(item) {
  return item.venue_abbr?.trim() || venues.find(([, pattern]) => pattern.test(item.description))?.[0];
}

function renderSnapshot(papers) {
  const panel = document.querySelector('.venue-snapshot');
  const counts = new Map();
  for (const paper of papers) {
    const label = venueLabel(paper) || 'Other venues';
    const key = label.toLowerCase();
    const entry = counts.get(key) || { label, count: 0 };
    entry.count++;
    counts.set(key, entry);
  }
  const ranked = [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'en'));
  panel.querySelector('.snapshot-venues').replaceChildren(...ranked.map(({ label, count }) => {
    const chip = element('li');
    chip.append(label, ' ', element('span', count, 'snapshot-count'));
    return chip;
  }));
  panel.querySelector('.snapshot-total').textContent = papers.length + (papers.length === 1 ? ' conference paper' : ' conference papers');
  panel.hidden = false;
}

function badge(text, kind, url) {
  const chip = element('span', null, 'citation-badge badge-' + kind);
  if (kind === 'award') chip.append(brandIcon('honors'), ' ');
  chip.append(linkOrText(text, url));
  return chip;
}

function notes(row, item) {
  for (const [key, kind] of [['info_tags', 'info'], ['award_tags', 'award']]) {
    for (const line of String(item[key] || '').split(/\r?\n/)) {
      if (line.trim()) row.append(' ', badge(line.trim(), kind));
    }
  }
  for (const [field, label] of [['doi_url', 'DOI'], ['pdf_url', 'PDF'], ['project_url', 'Project']]) {
    if (/^https?:\/\//i.test(item[field] || '')) row.append(' ', linkOrText(label, item[field]));
  }
}

function degree(item) {
  const row = element('div', null, 'citation');
  for (const [lang, title, details] of [
    ['en', item.title_en || item.title, item.degree_info_en],
    ['zh-Hant', item.title_zh, item.degree_info_zh],
  ]) {
    if (!title && !details) continue;
    const line = element('p');
    line.lang = lang;
    if (title) {
      const name = element('strong', null, 'degree-title');
      name.append(lang === 'en' ? linkOrText(title, item.url) : title);
      line.append(name);
    }
    if (details) line.append(title ? ' · ' : '', element('span', details, 'citation-venue'));
    row.append(line);
  }
  notes(row, item);
  return row;
}

function citation(item, paper = true) {
  const row = element('li', null, 'citation');
  const title = element('p', null, 'citation-title');
  title.append(linkOrText(item.title, item.url));
  if (enabled(item.is_new)) title.append('\u00a0', element('sup', 'NEW', 'citation-new'));
  row.append(title);
  const authors = element('p', null, 'citation-authors');
  const namePattern = /(Woan-Shiuan Chien|簡婉軒|简婉轩)/g;
  const names = String(item.authors || '').replace(/\s+([,，])/g, '$1');
  for (const [index, part] of names.split(namePattern).entries()) {
    authors.append(index % 2 ? element('strong', part) : part);
  }
  row.append(authors);
  const venue = element('p', null, 'citation-venue');
  const shortName = paper ? venueLabel(item) : item.venue_abbr?.trim();
  if (shortName) venue.append(badge(shortName, 'venue', item.venue_url), ' ');
  venue.append(element('cite', item.description || ''));
  if (item.year && !String(item.description || '').includes(String(item.year))) venue.append(' ', String(item.year));
  notes(venue, item);
  row.append(venue);
  return row;
}

async function render() {
  const data = await loadData('publications');
  for (const key of ['dissertation', 'thesis', 'journal', 'conference']) {
    const list = document.querySelector('#publication-' + key + ' .citation-list');
    const renderItem = key === 'dissertation' || key === 'thesis' ? degree : citation;
    list.replaceChildren(...ordered(data[key]).map(item => renderItem(item)));
  }
  renderSnapshot(data.conference || []);
  const groups = new Map();
  for (const item of ordered(data.patnts || data.patents)) {
    const name = item.group || 'Patents';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(item);
  }
  const patents = document.querySelector('.patent-groups');
  let start = 1;
  for (const [name, items] of groups) {
    const list = element('ol', null, 'citation-list');
    list.start = start;
    list.append(...items.map(item => citation(item, false)));
    patents.append(element('h3', name), list);
    start += items.length;
  }
  scrollToLoadedAnchor();
}
render().catch(() => {
  const link = document.createElement('a');
  link.href = '../data/publications.json';
  link.textContent = 'Open the publication data';
  document.querySelector('#bibliography').prepend('The bibliography could not be loaded. ', link);
});
