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

  function cleanSpacing(text) {
    return String(text || '')
      .replace(/\s+([,，])/g, '$1')
      .replace(/([,，])(?=\S)/g, '$1 ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function renderAuthors(value) {
    var text = cleanSpacing(value);
    if (!text) return '';

    var escaped = escapeHtml(text);
    return escaped
      .replace(/Woan-Shiuan Chien/g, '<b><u>Woan-Shiuan Chien</u></b>')
      .replace(/簡婉軒/g, '<b><u>簡婉軒</u></b>');
  }

  function makeTitleLink(label, url) {
    var href = hasValue(url) ? String(url).trim() : '#';
    return '<a class="a2" href="' + escapeHtml(href) + '" target="_blank" rel="noopener">' + escapeHtml(label) + '</a>';
  }

  function makeVenueBadge(label, url) {
    if (!hasValue(label)) return '';

    var safeLabel = escapeHtml(label);
    var href = hasValue(url) ? String(url).trim() : '#';

    return [
      '<abbr class="badge">',
      '<a href="' + escapeHtml(href) + '" target="_blank" rel="noopener">' + safeLabel + '</a>',
      '</abbr> '
    ].join('');
  }

  function renderTags(value, className) {
    if (!hasValue(value)) return '';

    return String(value)
      .split(/\r?\n/)
      .map(function (tag) { return tag.trim(); })
      .filter(Boolean)
      .map(function (tag) {
        return '<code><span class="' + className + '">' + escapeHtml(tag) + '</span></code>';
      })
      .join('\n');
  }

  function renderNewBadge(item) {
    if (!normalizeBoolean(item.is_new)) return '';

    return '<img src="' + root + 'images/New.png" title="new" alt="new" height="20" draggable="false" class="animated flash infinite pub-new-badge">';
  }

  function renderDegreeSection(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var html = sortByOrder(items).map(function (item) {
      var lines = [];

      if (hasValue(item.title_en) || hasValue(item.degree_info_en)) {
        lines.push(
          '<div class="title">' +
          (hasValue(item.title_en) ? '<strong class="pub-title-main">&quot;' + escapeHtml(item.title_en) + '&quot;</strong>' : '') +
          (hasValue(item.degree_info_en) ? ' , ' + escapeHtml(item.degree_info_en) : '') +
          '</div>'
        );
      }

      if (hasValue(item.title_zh) || hasValue(item.degree_info_zh)) {
        lines.push(
          '<div class="title">' +
          (hasValue(item.title_zh) ? escapeHtml(item.title_zh) : '') +
          (hasValue(item.degree_info_zh) ? ', ' + escapeHtml(item.degree_info_zh) : '') +
          '</div>'
        );
      }

      if (hasValue(item.award_tags)) {
        lines.push(renderTags(item.award_tags, 'text-award'));
      }

      return [
        '<ol class="bibliography">',
        '<div class="row">',
        '<div id="chien-emo" class="col-sm-11">',
        lines.join('\n'),
        '</div>',
        '</div>',
        '</ol>',
        '<br>'
      ].join('\n');
    }).join('\n');

    container.innerHTML = html;
  }

  function renderPaperItem(item) {
    var titleHtml = makeTitleLink(item.title, item.url);
    var newBadge = renderNewBadge(item);
    var authorsHtml = hasValue(item.authors) ? renderAuthors(item.authors) : '';
    var venueHtml = makeVenueBadge(item.venue_abbr, item.venue_url);
    var descriptionHtml = hasValue(item.description) ? '<em>' + escapeHtml(item.description) + '</em>' : '';
    var awardHtml = renderTags(item.award_tags, 'text-award');
    var infoHtml = renderTags(item.info_tags, 'text-info-blue');

    return [
      '<div class="row"><li>',
      '<div id="chien-emo" class="col-sm-12">',
      '<div class="title"><b>' + titleHtml + '</b>' + newBadge + '</div>',
      authorsHtml ? '<div class="author">' + authorsHtml + '</div>' : '',
      (venueHtml || descriptionHtml || awardHtml || infoHtml) ? [
        '<div class="periodical">',
        venueHtml,
        descriptionHtml,
        awardHtml ? '\n' + awardHtml : '',
        infoHtml ? '\n' + infoHtml : '',
        '</div>'
      ].join('') : '',
      '</div>',
      '</div></li>'
    ].join('\n');
  }

  function renderPaperList(containerId, items) {
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = [
      '<ol class="bibliography">',
      sortByOrder(items).map(renderPaperItem).join('\n'),
      '</ol>',
      '<br>'
    ].join('\n');
  }

  function renderPatentItem(item) {
    var titleHtml = makeTitleLink(item.title, item.url);
    var authorsHtml = hasValue(item.authors) ? renderAuthors(item.authors) : '';
    var descriptionHtml = hasValue(item.description) ? '<em>' + escapeHtml(item.description) + '</em>' : '';

    return [
      '<div class="row"><li>',
      '<div id="chien-emo" class="col-sm-12">',
      '<div class="title"><b>' + titleHtml + '</b></div>',
      authorsHtml ? '<div class="author">' + authorsHtml + '</div>' : '',
      descriptionHtml,
      '</div>',
      '</div></li>'
    ].join('\n');
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

    var runningStart = 1;
    container.innerHTML = groups.map(function (group) {
      var html = [
        '<span class="text-accent"><b><em>' + escapeHtml(group.name) + '</em></b></span><br>',
        '<ol class="bibliography"' + (runningStart > 1 ? ' start="' + runningStart + '"' : '') + '>',
        group.items.map(renderPatentItem).join('\n'),
        '</ol>'
      ].join('\n');

      runningStart += group.items.length;
      return html;
    }).join('\n') + '<br>';
  }

  function showLoadError(error) {
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
