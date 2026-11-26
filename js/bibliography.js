import { brandIcon, element, enabled, linkOrText } from './content.js';

export const types = {
  dissertation: 'Ph.D. Dissertation',
  thesis: 'Master’s Thesis',
  journal: 'Journal Articles',
  conference: 'Conference Papers',
  patnts: 'Patents',
};
const singular = { journal: 'Journal article', conference: 'Conference paper', patnts: 'Patent' };

export function records(data) {
  return Object.keys(types)
    .flatMap((type) =>
      (data[type] || (type === 'patnts' ? data.patents : []) || []).map((item) => {
        // The legacy data encodes publication/issue years in the citation. Impact-factor years are separate.
        const dates = (item.description || item.degree_info_en || '').match(/\b(?:19|20)\d{2}\b/g);
        const year = String(item.year || dates?.at(-1) || '');
        return { ...item, type, year };
      }),
    )
    .sort(
      (a, b) =>
        b.year.localeCompare(a.year) ||
        Object.keys(types).indexOf(a.type) - Object.keys(types).indexOf(b.type) ||
        a.sort_order - b.sort_order,
    );
}
function authors(text) {
  const p = element('p', null, 'authors');
  for (const part of String(text).split(/(Woan-Shiuan Chien|簡婉軒|简婉轩)/g)) {
    p.append(/^(Woan-Shiuan Chien|簡婉軒|简婉轩)$/.test(part) ? element('strong', part) : part);
  }
  return p;
}
export function entry(item, includeYear = false) {
  const article = element('article', null, 'pub');
  const label = [includeYear ? item.year : '', item.group || singular[item.type] || types[item.type]]
    .filter(Boolean)
    .join(' · ');
  const kind = element('p', label, 'kind');
  const icons = {dissertation:'dissertation', thesis:'masters-thesis', journal:'journal-paper', conference:'conference-paper', patnts:'patent'};
  kind.prepend(brandIcon(icons[item.type]), ' ');
  article.append(kind);
  const heading = element('h3');
  heading.append(linkOrText(item.title || item.title_en || item.title_zh, item.url));
  const paperLink = heading.querySelector('a');
  if (paperLink) paperLink.append(' ', brandIcon('external-link'));
  article.append(heading);
  if (item.authors) article.append(authors(item.authors));
  const venue = element('p', null, 'venue');
  if (item.venue_abbr) venue.append(linkOrText(item.venue_abbr, item.venue_url), ' · ');
  venue.append(item.description || item.degree_info_en || '');
  if (venue.textContent) article.append(venue);
  if (item.title_zh || item.degree_info_zh) {
    const zh = element('p', [item.title_zh, item.degree_info_zh].filter(Boolean).join(' · '));
    zh.lang = 'zh-Hant';
    article.append(zh);
  }
  const tags = element('div', null, 'tags');
  for (const value of [item.award_tags, item.info_tags, enabled(item.is_new) ? 'New' : '']) {
    for (const tag of String(value || '')
      .split(/\r?\n/)
      .filter(Boolean))
      tags.append(element('span', tag));
  }
  if (tags.childElementCount) article.append(tags);
  for (const [field, label] of [
    ['doi_url', 'DOI'],
    ['pdf_url', 'PDF'],
    ['project_url', 'Project'],
  ]) {
    if (item[field]) article.append(linkOrText(label, item[field]), ' ');
  }
  return article;
}
