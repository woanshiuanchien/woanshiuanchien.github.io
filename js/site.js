/* Shared website utilities for Woan-Shiuan Chien's personal site. */
(function () {
  "use strict";

  const profile = {
    name: "Woan-Shiuan Chien",
    title: "Assistant Professor",
    affiliation: "Social Lab, NYCU",
    social: [
      { label: "Google Scholar", href: "https://scholar.google.com.tw/citations?user=udbwr2sAAAAJ&hl=zh-TW&authuser=1", icon: "fa-brands fa-google-scholar" },
      { label: "ORCID", href: "https://orcid.org/0000-0003-2235-4080", icon: "fa-brands fa-orcid" },
      { label: "Scopus", href: "https://www.scopus.com/authid/detail.uri?authorId=57203713867", icon: "fa-solid fa-book" },
      { label: "GitHub", href: "https://github.com/woanshiuanchien", icon: "fa-brands fa-github" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/woan-shiuan-chien-3ab8641ba/", icon: "fa-brands fa-linkedin-in" }
    ]
  };

  const categoryTitles = {
    dissertation: "PhD Dissertation",
    thesis: "MS Thesis",
    journal: "International Journal",
    conference: "International Conference",
    patent: "Patents"
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeRoot(root) {
    if (!root || root === ".") return "";
    return root.replace(/\/$/, "");
  }

  function path(root, value) {
    root = normalizeRoot(root);
    if (!value) return "";
    if (/^https?:\/\//.test(value) || value.startsWith("mailto:")) return value;
    if (!root) return value;
    return `${root}/${value.replace(/^\//, "")}`;
  }

  function homeAnchor(root, section) {
    root = normalizeRoot(root);
    return root ? `${root}/index.html#${section}` : `#${section}`;
  }

  function renderSidebar() {
    const aside = document.getElementById("colorlib-aside");
    if (!aside) return;

    const root = normalizeRoot(document.body.dataset.root || "");
    const page = document.body.dataset.page || "home";
    const navItems = [
      { key: "home", label: "About Me", href: homeAnchor(root, "about"), section: "about", external: page !== "home" },
      { key: "research", label: "Research", href: path(root, "pages/research.html"), external: true },
      { key: "experience", label: "Experience", href: path(root, "pages/experience.html"), external: true },
      { key: "publication", label: "Publication", href: path(root, "pages/publication.html"), external: true },
      { key: "contact", label: "Contact", href: homeAnchor(root, "Contact"), section: "Contact", external: page !== "home" }
    ];

    const nav = navItems.map(item => {
      const active = item.key === page || (page === "home" && item.key === "home") ? "active" : "";
      const external = item.external ? "external" : "";
      const section = page === "home" && !item.external && item.section ? ` data-nav-section="${item.section}"` : "";
      return `<li class="${active}"><a href="${item.href}" class="${external}"${section}>${item.label}</a></li>`;
    }).join("");

    const socialLinks = profile.social.map(item => `
      <li><a href="${item.href}" target="_blank" rel="noopener" aria-label="${item.label}"><i class="${item.icon}"></i></a></li>
    `).join("");

    aside.innerHTML = `
      <div class="text-center profile-block">
        <div class="author-img" style="background-image: url(${path(root, "images/profile.jpg")});"></div>
        <h1 id="colorlib-logo"><a href="${path(root, "index.html")}">${profile.name}</a></h1>
        <span class="position"><a href="#">${profile.title}</a><br>@ <a href="#">${profile.affiliation}</a></span>
      </div>

      <nav id="colorlib-main-menu" role="navigation" class="navbar site-nav">
        <div id="navbar" class="collapse">
          <ul>${nav}</ul>
        </div>
      </nav>

      <div class="colorlib-footer social-footer">
        <ul>${socialLinks}</ul>
      </div>

      <div class="colorlib-footer template-credit">
        <p><small>&copy; <span data-current-year></span> Woan-Shiuan Chien. Template adapted from <a href="https://colorlib.com" target="_blank" rel="noopener">Colorlib</a>.</small></p>
      </div>
    `;
  }

  function setCurrentYear() {
    document.querySelectorAll("[data-current-year]").forEach(node => {
      node.textContent = new Date().getFullYear();
    });
  }

  function formatAuthors(authors) {
    return escapeHtml(authors)
      .replace(/Woan-Shiuan Chien/g, "<strong><u>Woan-Shiuan Chien</u></strong>")
      .replace(/簡婉軒/g, "<strong><u>簡婉軒</u></strong>");
  }

  function normaliseLocalHref(href) {
    if (!href) return "";
    if (/^https?:\/\//.test(href)) return href;
    return `../${href.replace(/^\.\.\//, "").replace(/^\//, "")}`;
  }

  function titleHtml(item) {
    const title = escapeHtml(item.title);
    const titleContent = `<strong>${title}</strong>`;
    const href = item.url || item.pdf || "";
    const titleNode = href
      ? `<a class="a2 pub-title-link" href="${escapeHtml(normaliseLocalHref(href))}" target="_blank" rel="noopener">${titleContent}</a>`
      : `<span class="pub-title-text">${titleContent}</span>`;
    const newBadge = item.is_new ? `<span class="pub-new-text">NEW</span>` : "";
    return `${titleNode}${newBadge}`;
  }

  function codeBadge(text, className) {
    if (!text) return "";
    return `<code class="${className}">${escapeHtml(text)}</code>`;
  }

  function badgeHtml(item, className) {
    if (!Array.isArray(item.badges) || item.badges.length === 0) return "";
    return item.badges.map(badge => codeBadge(badge, className)).join(" ");
  }

  function venueCode(item) {
    if (!item.venue) return "";
    const venue = escapeHtml(item.venue);
    if (item.venue_url) {
      return `<a class="pub-venue-link" href="${escapeHtml(item.venue_url)}" target="_blank" rel="noopener"><code class="pub-venue-code">${venue}</code></a>`;
    }
    return `<code class="pub-venue-code">${venue}</code>`;
  }

  function publicationItem(item) {
    const venue = venueCode(item);
    const details = item.details ? `<em>${escapeHtml(item.details)}</em>` : "";
    const badges = badgeHtml(item, "pub-info-code");
    const metaParts = [venue, details, badges].filter(Boolean).join(" ");
    return `
      <li class="pub-item" id="${escapeHtml(item.id)}">
        <div class="pub-title">${titleHtml(item)}</div>
        ${item.authors ? `<div class="pub-authors">${formatAuthors(item.authors)}</div>` : ""}
        ${metaParts ? `<div class="pub-meta">${metaParts}</div>` : ""}
      </li>
    `;
  }

  function renderPublicationList(container, title, items) {
    if (!items.length) return;
    container.insertAdjacentHTML("beforeend", `
      <h2 class="colorlib-heading animate-box">${title}</h2>
      <ol class="bibliography pub-list">${items.map(publicationItem).join("")}</ol>
    `);
  }

  function renderDegreeItem(item) {
    const title = escapeHtml(item.title);
    const venue = escapeHtml(item.venue);
    const date = escapeHtml(item.date || item.year || "");
    const degreeLine = `"<strong>${title}</strong>"${venue ? `, ${venue}` : ""}${date ? `, ${date}.` : ""}`;
    const zh = item.title_zh || item.details ? `<p class="degree-zh">${escapeHtml(item.title_zh || item.details)}</p>` : "";
    const details = item.title_zh && item.details ? `<p class="degree-zh">${escapeHtml(item.details)}</p>` : "";
    const awards = badgeHtml(item, "degree-award-code");
    return `
      <div class="degree-item" id="${escapeHtml(item.id)}">
        <p class="degree-main">${degreeLine}</p>
        ${zh}
        ${details}
        ${awards ? `<p class="degree-awards">${awards}</p>` : ""}
      </div>
    `;
  }

  function renderDegreeSection(container, title, items) {
    if (!items.length) return;
    container.insertAdjacentHTML("beforeend", `
      <h2 class="colorlib-heading animate-box">${title}</h2>
      <div class="degree-list">${items.map(renderDegreeItem).join("")}</div>
    `);
  }

  function renderPatentList(container, title, items, start) {
    if (!items.length) return 0;
    container.insertAdjacentHTML("beforeend", `
      <h3 class="pub-subheading">${title}</h3>
      <ol class="bibliography pub-list" start="${start}">${items.map(publicationItem).join("")}</ol>
    `);
    return items.length;
  }

  async function renderPublications() {
    const container = document.getElementById("publication-list");
    if (!container) return;
    try {
      const response = await fetch("../data/publications.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const items = await response.json();

      const byCategory = category => items.filter(item => item.category === category)
        .sort((a, b) => (Number(a.sort_order) || 9999) - (Number(b.sort_order) || 9999));

      renderDegreeSection(container, categoryTitles.dissertation, byCategory("dissertation"));
      renderDegreeSection(container, categoryTitles.thesis, byCategory("thesis"));
      renderPublicationList(container, categoryTitles.journal, byCategory("journal"));
      renderPublicationList(container, categoryTitles.conference, byCategory("conference"));

      const patents = byCategory("patent");
      if (patents.length) {
        container.insertAdjacentHTML("beforeend", `<h2 class="colorlib-heading animate-box">${categoryTitles.patent}</h2>`);
        let start = 1;
        const groups = [...new Set(patents.map(item => item.group).filter(Boolean))];
        if (groups.length) {
          groups.forEach(group => {
            start += renderPatentList(container, group, patents.filter(item => item.group === group), start);
          });
          const ungrouped = patents.filter(item => !item.group);
          if (ungrouped.length) renderPatentList(container, "Other Patents", ungrouped, start);
        } else {
          renderPatentList(container, "", patents, start);
        }
      }
    } catch (error) {
      container.innerHTML = `
        <div class="publication-error">
          Publications could not be loaded. On GitHub Pages this should work normally; for local preview, run <code>python -m http.server</code> instead of opening the HTML file directly.
        </div>
      `;
      console.error("Publication loading failed:", error);
    }
  }

  renderSidebar();
  setCurrentYear();
  renderPublications();
})();
