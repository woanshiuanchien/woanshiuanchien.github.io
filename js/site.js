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

  function titleHtml(item) {
    const title = escapeHtml(item.title);
    const newBadge = item.is_new ? `<img src="../images/New.png" title="new" height="20" draggable="false" class="pub-new-badge animated flash infinite" alt="New">` : "";
    if (item.url) {
      return `<a class="a2 pub-title-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${title}</a>${newBadge}`;
    }
    return `${title}${newBadge}`;
  }

  function venueHtml(item) {
    if (!item.venue) return "";
    const venue = escapeHtml(item.venue);
    if (item.venue_url) {
      return `<a class="pub-venue" href="${escapeHtml(item.venue_url)}" target="_blank" rel="noopener">${venue}</a>`;
    }
    return `<span class="pub-venue">${venue}</span>`;
  }

  function linksHtml(item) {
    const links = [];
    if (item.url) links.push(`<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Link</a>`);
    if (item.pdf) links.push(`<a href="../${escapeHtml(item.pdf)}" target="_blank" rel="noopener">PDF</a>`);
    if (!links.length) return "";
    return `<div class="pub-links">${links.join("")}</div>`;
  }

  function badgeHtml(item) {
    if (!Array.isArray(item.badges) || item.badges.length === 0) return "";
    return `<div class="pub-badges">${item.badges.map(badge => `<code>${escapeHtml(badge)}</code>`).join("")}</div>`;
  }

  function publicationItem(item) {
    const venue = venueHtml(item);
    const details = item.details ? `<em>${escapeHtml(item.details)}</em>` : "";
    return `
      <li class="pub-item" id="${escapeHtml(item.id)}">
        <div class="pub-title"><strong>${titleHtml(item)}</strong></div>
        ${item.authors ? `<div class="pub-authors">${formatAuthors(item.authors)}</div>` : ""}
        <div class="pub-meta">${venue}${venue && details ? " " : ""}${details}</div>
        ${badgeHtml(item)}
        ${linksHtml(item)}
      </li>
    `;
  }

  function renderList(container, title, items) {
    if (!items.length) return;
    container.insertAdjacentHTML("beforeend", `
      <h2 class="colorlib-heading animate-box">${title}</h2>
      <ol class="bibliography pub-list">${items.map(publicationItem).join("")}</ol>
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

      const byCategory = category => items.filter(item => item.category === category);
      renderList(container, "PhD Dissertation", byCategory("dissertation"));
      renderList(container, "MS Thesis", byCategory("thesis"));
      renderList(container, "International Journal", byCategory("journal"));
      renderList(container, "International Conference", byCategory("conference"));

      const patents = byCategory("patent");
      if (patents.length) {
        container.insertAdjacentHTML("beforeend", `<h2 class="colorlib-heading animate-box">Patents</h2>`);
        let start = 1;
        start += renderPatentList(container, "US Patents", patents.filter(item => item.group === "US Patents"), start);
        renderPatentList(container, "TW Patents", patents.filter(item => item.group === "TW Patents"), start);
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
