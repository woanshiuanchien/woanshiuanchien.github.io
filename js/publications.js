(function () {
  'use strict';

  var root = document.body.getAttribute('data-root') || '';
  var dataPath = root + 'data/publications.json';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function hasValue(value) {
    return value !== undefined && value !== null && String(value).trim() !== '';
  }

  function isRealUrl(url) {
    return hasValue(url) && String(url).trim() !== '#';
  }

  function normalizeBoolean(value) {
    if (value === true) return true;
    if (value === false) return false;
    var text = String(value == null ? '' : value).trim().toLowerCase();
    return ['true', 'yes', 'y', '1', 'new'].indexOf(text) !== -1;
  }

  function sortByOrder(items) {
    return (items || []).slice().sort(function (a, b) {
      var orderA = Number(a.sort_order || 0);
      var orderB = Number(b.sort_order || 0);
      return orderA - orderB;
    });
  }

  function makeLink(label, url, className) {
    var safeLabel = escapeHtml(label);
    var classes = className ? ' class="' + className + '"' : '';
    if (!isRealUrl(url)) return '<span' + classes + '>' + safeLabel + '</span>';
    return '<a href="' + escapeHtml(url) + '" target="_blank" rel="noopener"' + classes + '>' + safeLabel + '</a>';
  }

  function renderMultiLineTags(value, className) {
    if (!hasValue(value)) return '';
    return String(value)
      .split(/\r?\n/)
      .map(function (tag) { return tag.trim(); })
      .filter(Boolean)
      .map(function (tag) {
        return '<span class="' + className + '">' + escapeHtml(tag) + '</span>';
      })
      .join('<br>');
  }

  function renderDegreeSection(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = sortByOrder(items).map(function (item) {
      var awardHtml = renderMultiLineTags(item.award_tags, 'text-award');
      return [
        '<p>',
        hasValue(item.title_en) ? '<span class="pub-title-main"><strong>' + escapeHtml(item.title_en) + '</strong></span><br>' : '',
        hasValue(item.degree_info_en) ? escapeHtml(item.degree_info_en) + '<br>' : '',
        hasValue(item.title_zh) ? '<span class="text-accent">' + escapeHtml(item.title_zh) + '</span><br>' : '',
        hasValue(item.degree_info_zh) ? escapeHtml(item.degree_info_zh) : '',
        awardHtml ? '<br>' + awardHtml : '',
        '</p>'
      ].join('');
    }).join('');
  }

  function renderPaperItem(item) {
    var title = makeLink(item.title, item.url, 'pub-title-main');
    var newBadge = normalizeBoolean(item.is_new)
      ? ' <img src="' + root + 'images/New.png" alt="New" class="pub-new-badge">'
      : '';
    var venue = hasValue(item.venue_abbr)
      ? '[' + makeLink(item.venue_abbr, item.venue_url, 'publication-subheading') + '] '
      : '';
    var awardHtml = renderMultiLineTags(item.award_tags, 'text-award');
    var infoHtml = renderMultiLineTags(item.info_tags, 'text-info-blue');

    return [
      '<li>',
      '<span class="pub-title-main"><strong>' + title + '</strong></span>' + newBadge,
      hasValue(item.authors) ? '<br>' + escapeHtml(item.authors) + '.' : '',
      hasValue(item.description) || venue ? '<br>' + venue + escapeHtml(item.description) : '',
      awardHtml ? '<br>' + awardHtml : '',
      infoHtml ? '<br>' + infoHtml : '',
      '</li>'
    ].join('');
  }

  function renderPaperList(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '<ol class="publication-list">' + sortByOrder(items).map(renderPaperItem).join('') + '</ol>';
  }

  function renderPatentItem(item) {
    var title = makeLink(item.title, item.url, 'pub-title-main');
    return [
      '<li>',
      '<span class="pub-title-main"><strong>' + title + '</strong></span>',
      hasValue(item.authors) ? '<br>' + escapeHtml(item.authors) + '.' : '',
      hasValue(item.description) ? '<br>' + escapeHtml(item.description) : '',
      '</li>'
    ].join('');
  }

  function renderPatents(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var sorted = sortByOrder(items);
    var groups = [];
    sorted.forEach(function (item) {
      var groupName = hasValue(item.group) ? String(item.group).trim() : 'Patents';
      var group = groups.find(function (g) { return g.name === groupName; });
      if (!group) {
        group = { name: groupName, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });

    container.innerHTML = groups.map(function (group) {
      return [
        '<h4 class="publication-subheading">' + escapeHtml(group.name) + '</h4>',
        '<ol class="publication-list">',
        group.items.map(renderPatentItem).join(''),
        '</ol>'
      ].join('');
    }).join('');
  }

  function showLoadError(error) {
    // Keep the public page from silently failing if data/publications.json or this script is missing.
    // Details are available in the browser console for debugging.
    console.error('Unable to load publication data:', error);
    var container = document.getElementById('publication-dissertation');
    if (container) {
      container.innerHTML = '<p class="text-award">Publication data could not be loaded. Please check data/publications.json and js/publications.js.</p>';
    }
  }

  function renderPublications(data) {
    renderDegreeSection('publication-dissertation', data.dissertation || []);
    renderDegreeSection('publication-thesis', data.thesis || []);
    renderPaperList('publication-journal', data.journal || []);
    renderPaperList('publication-conference', data.conference || []);
    renderPatents('publication-patnts', data.patnts || []);
  }

  fetch(dataPath, { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ' while loading ' + dataPath);
      }
      return response.json();
    })
    .then(renderPublications)
    .catch(showLoadError);
})();
