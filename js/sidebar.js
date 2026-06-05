/* =======================================================
 * Shared sidebar component
 * Update sidebar profile, navigation, and social links here.
 * This keeps GitHub Pages fully static: no server-side include needed.
 * ======================================================= */
(function () {
  'use strict';

  var body = document.body;
  var root = body.getAttribute('data-root');
  var activePage = body.getAttribute('data-page') || '';

  if (root === null) {
    root = /\/pages\//.test(window.location.pathname) ? '../' : '';
  }

  var profile = {
    name: 'Woan-Shiuan Chien',
    title: 'Assistant Professor',
    lab: 'Social Lab, NYCU',
    labUrl: '#'
  };

  var navItems = [
    { key: 'about', label: 'About Me', section: 'about', url: 'index.html#about' },
    { key: 'research', label: 'Research', url: 'pages/research.html' },
    { key: 'experience', label: 'Experience', url: 'pages/experience.html' },
    { key: 'publication', label: 'Publication', url: 'pages/publication.html' },
    { key: 'contact', label: 'Contact', section: 'Contact', url: 'index.html#Contact' }
  ];

  var socialLinks = [
    {
      label: 'Google Scholar',
      url: 'https://scholar.google.com.tw/citations?user=udbwr2sAAAAJ&hl=zh-TW&authuser=1',
      icon: 'fa-brands fa-google-scholar'
    },
    {
      label: 'ORCID',
      url: 'https://orcid.org/my-orcid?orcid=0000-0003-2235-4080',
      icon: 'fa-brands fa-orcid'
    },
    {
      label: 'Scopus',
      url: 'https://www.scopus.com/authid/detail.uri?authorId=57203713867',
      icon: 'fa-solid fa-book'
    },
    {
      label: 'GitHub',
      url: 'https://github.com/woanshiuanchien',
      icon: 'icon-github'
    },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/woan-shiuan-chien-3ab8641ba/',
      icon: 'icon-linkedin2'
    }
  ];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function rootUrl(path) {
    return root + path;
  }

  function navItemHtml(item) {
    var isActive = item.key === activePage;
    var liClass = isActive ? ' class="active"' : '';
    var attrs;

    if (activePage === 'home' && item.section) {
      attrs = 'href="#" data-nav-section="' + escapeHtml(item.section) + '"';
    } else {
      attrs = 'href="' + escapeHtml(rootUrl(item.url)) + '" class="external"';
    }

    return '<li' + liClass + '><a ' + attrs + '>' + escapeHtml(item.label) + '</a></li>';
  }

  function socialItemHtml(item) {
    return [
      '<li>',
      '<a href="', escapeHtml(item.url), '" target="_blank" rel="noopener" aria-label="', escapeHtml(item.label), '">',
      '<i class="', escapeHtml(item.icon), '"></i>',
      '</a>',
      '</li>'
    ].join('');
  }

  function renderSidebar() {
    var mount = document.getElementById('site-sidebar');
    if (!mount) return;

    mount.outerHTML = [
      '<aside id="colorlib-aside" role="complementary" class="border js-fullheight">',
      '  <div class="text-center">',
      '    <div class="author-img site-author-img"></div>',
      '    <h1 id="colorlib-logo"><a href="', escapeHtml(rootUrl('index.html')), '">', escapeHtml(profile.name), '</a></h1>',
      '    <span class="position">',
      '      <a href="#">', escapeHtml(profile.title), '</a><br>',
      '      @ <a href="', escapeHtml(profile.labUrl), '" target="_blank" rel="noopener">', escapeHtml(profile.lab), '</a>',
      '    </span>',
      '  </div>',
      '',
      '  <nav id="colorlib-main-menu" role="navigation" class="navbar">',
      '    <div id="navbar" class="collapse">',
      '      <ul>', navItems.map(navItemHtml).join(''), '</ul>',
      '    </div>',
      '  </nav>',
      '',
      '  <nav class="colorlib-social-menu" aria-label="Academic and social links">',
      '    <div class="colorlib-footer">',
      '      <ul>', socialLinks.map(socialItemHtml).join(''), '</ul>',
      '    </div>',
      '  </nav>',
      '',
      '  <div class="colorlib-footer">',
      '    <p><small>',
      '      &copy; Copyright ', new Date().getFullYear(),
      '      All rights reserved | This template is made with <i class="icon-heart" aria-hidden="true"></i> by ',
      '      <a href="https://colorlib.com" target="_blank" rel="noopener">Colorlib</a>',
      '    </small></p>',
      '  </div>',
      '</aside>'
    ].join('');
  }

  renderSidebar();
}());
