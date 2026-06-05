const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const ROOT_DIR = path.resolve(__dirname, '..');
const EXCEL_PATH = path.join(ROOT_DIR, 'data', 'publications.xlsx');
const JSON_PATH = path.join(ROOT_DIR, 'data', 'publications.json');
const SHEETS = ['dissertation', 'thesis', 'journal', 'conference', 'patnts'];

function cleanKey(key) {
  return String(key || '').trim();
}

function cleanValue(value, key) {
  if (value === undefined || value === null) return '';

  if (key === 'sort_order') {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? '' : numberValue;
  }

  if (key === 'is_new') {
    if (typeof value === 'boolean') return value;
    const text = String(value).trim().toLowerCase();
    return ['true', 'yes', 'y', '1', 'new'].includes(text);
  }

  return String(value).trim();
}

function isNonEmptyRow(row) {
  return Object.values(row).some((value) => String(value).trim() !== '');
}

function readSheet(workbook, sheetName) {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    console.warn(`Warning: sheet "${sheetName}" was not found. It will be exported as an empty list.`);
    return [];
  }

  return XLSX.utils.sheet_to_json(worksheet, { defval: '' })
    .map((row) => {
      const cleaned = {};
      Object.entries(row).forEach(([rawKey, rawValue]) => {
        const key = cleanKey(rawKey);
        if (!key) return;
        cleaned[key] = cleanValue(rawValue, key);
      });
      return cleaned;
    })
    .filter(isNonEmptyRow)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Cannot find ${EXCEL_PATH}`);
  }

  const workbook = XLSX.readFile(EXCEL_PATH, { cellDates: false });
  const publications = {};

  SHEETS.forEach((sheetName) => {
    publications[sheetName] = readSheet(workbook, sheetName);
  });

  fs.writeFileSync(JSON_PATH, JSON.stringify(publications, null, 2) + '\n', 'utf8');
  console.log(`Generated ${path.relative(ROOT_DIR, JSON_PATH)} from ${path.relative(ROOT_DIR, EXCEL_PATH)}`);
}

main();
