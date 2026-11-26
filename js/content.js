// Resolve data relative to this module so root and /pages/ routes also work under repository prefixes.
export async function loadData(name) {
  const response = await fetch(new URL('../data/' + name + '.json', import.meta.url));
  if (!response.ok) throw new Error('Unable to load ' + name);
  return response.json();
}
export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function linkOrText(label, target) {
  if (!/^https?:\/\//i.test(String(target || '').trim())) return document.createTextNode(label);
  const link = element('a', label);
  link.href = target.trim();
  return link;
}
export function enabled(value, defaultValue = false) {
  if (value == null || value === '') return defaultValue;
  return /^(true|yes|y|1|new|visible|show)$/i.test(String(value).trim());
}
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function calendarDate(raw) {
  const parts = String(raw || '').match(/^(\d{4})[/-](\d{1,2})(?:[/-](\d{1,2}))?$/);
  if (!parts || !months[Number(parts[2]) - 1]) return { iso: '', label: raw || '' };
  const [, year, month, day] = parts;
  const iso = [year, month, day]
    .filter(Boolean)
    .map((part) => part.padStart(2, '0'))
    .join('-');
  const label = months[Number(month) - 1] + (day ? ' ' + Number(day) + ',' : '') + ' ' + year;
  return { iso, label };
}
export function timeNode(raw) {
  const { iso, label } = calendarDate(raw);
  const node = element('time', label);
  if (iso) node.dateTime = iso;
  return node;
}
export function scrollToLoadedAnchor() {
  if (!location.hash) return;
  let id;
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
}

/** Decorative icon accompanying a text label. All shared geometry is in one local sprite. */
export function brandIcon(name) {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  icon.setAttribute('class', 'brand-icon');
  icon.setAttribute('viewBox', '0 0 32 32');
  icon.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS(namespace, 'use');
  use.setAttribute('href', new URL('../brand/icons.svg#' + name, import.meta.url).href);
  icon.append(use);
  return icon;
}
