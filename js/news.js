(function () {
  'use strict';

  var root = document.body.getAttribute('data-root') || '';
  var dataPath = root + 'data/news.json';
  var activeCategory = 'All';
  var expanded = false;
  var initialLimit = 8;
  var newsData = { categories: [], items: [] };

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

  function normalizeBoolean(value, defaultValue) {
    if (value === true) return true;
    if (value === false) return false;
    if (!hasValue(value)) return defaultValue;
    var text = String(value).trim().toLowerCase();
    return ['true', 'yes', 'y', '1', 'visible', 'show'].indexOf(text) !== -1;
  }

  function sortByOrder(items) {
    return (items || []).slice().sort(function (a, b) {
      var orderA = Number(a.sort_order || 0);
      var orderB = Number(b.sort_order || 0);
      if (orderA !== orderB) return orderA - orderB;
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
  }

  function getCategoryIcon(category) {
    var icons = {
      'All': '☰',
      'Research Spotlight': '✦',
      'Faculty Honor': '🏆',
      'Student Honor': '🌱',
      'Talk': '🎤'
    };
    return icons[category] || '•';
  }

  function buildNewsText(item) {
    if (hasValue(item.text_html)) {
      return String(item.text_html);
    }

    var icon = hasValue(item.icon) ? escapeHtml(item.icon) + ' ' : '';
    var date = hasValue(item.date) ? '<strong>' + escapeHtml(item.date) + ':</strong> ' : '';
    var prefix = hasValue(item.prefix) ? escapeHtml(item.prefix).trim() : '';
    var suffix = hasValue(item.suffix) ? escapeHtml(item.suffix).trim() : '';
    var link = '';

    if (hasValue(item.link_text)) {
      if (hasValue(item.link_url)) {
        link = '<a href="' + escapeHtml(item.link_url) + '" target="_blank" rel="noopener">' + escapeHtml(item.link_text) + '</a>';
      } else {
        link = '<strong>' + escapeHtml(item.link_text) + '</strong>';
      }
    }

    return [date + icon + prefix, link, suffix]
      .filter(function (part) { return hasValue(part); })
      .join(' ')
      .replace(/\s+([,.!?;:])/g, '$1');
  }

  function getVisibleItems() {
    var items = sortByOrder(newsData.items || []).filter(function (item) {
      return normalizeBoolean(item.is_visible, true);
    });

    if (activeCategory === 'All') return items;

    return items.filter(function (item) {
      return String(item.category || '').trim() === activeCategory;
    });
  }

  function renderTabs() {
    var container = document.getElementById('news-tabs');
    if (!container) return;

    var categories = ['All'].concat(newsData.categories || []);

    container.innerHTML = categories.map(function (category) {
      var active = category === activeCategory ? ' active' : '';
      return '<button type="button" class="news-tab' + active + '" data-category="' + escapeHtml(category) + '">' +
        '<span class="news-tab-icon">' + escapeHtml(getCategoryIcon(category)) + '</span> ' + escapeHtml(category) +
        '</button>';
    }).join('');

    Array.prototype.forEach.call(container.querySelectorAll('.news-tab'), function (button) {
      button.addEventListener('click', function () {
        activeCategory = button.getAttribute('data-category') || 'All';
        expanded = false;
        renderNews();
      });
    });
  }

  function renderNewsList() {
    var list = document.getElementById('news-list');
    var moreButton = document.getElementById('news-more');
    if (!list) return;

    var items = getVisibleItems();
    var visibleItems = expanded ? items : items.slice(0, initialLimit);

    if (!items.length) {
      list.innerHTML = '<li class="news-empty">No news in this category yet.</li>';
      if (moreButton) moreButton.classList.add('is-hidden');
      return;
    }

    list.innerHTML = visibleItems.map(function (item) {
      return '<li>' + buildNewsText(item) + '</li>';
    }).join('');

    if (moreButton) {
      if (items.length <= initialLimit) {
        moreButton.classList.add('is-hidden');
      } else {
        moreButton.classList.remove('is-hidden');
        moreButton.textContent = expanded ? 'less' : 'more';
      }
    }
  }

  function renderNews() {
    renderTabs();
    renderNewsList();
  }

  function showLoadError(error) {
    console.error('Unable to load news data:', error);
    var list = document.getElementById('news-list');
    if (list) {
      list.innerHTML = '<li class="news-empty">News data could not be loaded. Please check data/news.json and js/news.js.</li>';
    }
  }

  var moreButton = document.getElementById('news-more');
  if (moreButton) {
    moreButton.addEventListener('click', function () {
      expanded = !expanded;
      renderNewsList();
    });
  }

  fetch(dataPath, { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ' while loading ' + dataPath);
      }
      return response.json();
    })
    .then(function (data) {
      newsData = data || { categories: [], items: [] };
      renderNews();
    })
    .catch(showLoadError);
})();
