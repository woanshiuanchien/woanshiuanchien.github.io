/* Invited Talks — static GitHub Pages JSON, with 12 talks per page. */
(function () {
  "use strict";

  const container = document.getElementById("invited-talks-list");
  const pagination = document.getElementById("invited-talks-pagination");
  if (!container || !pagination) return;

  const PAGE_SIZE = 12;
  const root = document.body.getAttribute("data-root") || "";
  const dataUrl = root + "data/invited-talks.json";
  let talks = [];
  let currentPage = 1;

  // Keep dates timezone-independent and sortable on GitHub Pages.
  function dateKey(value) {
    const match = String(value || "").match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (!match) return 0;
    return (+match[1]) * 10000 + (+match[2]) * 100 + (+match[3]);
  }

  function displayDate(value) {
    const match = String(value || "").match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (!match) return String(value || "");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[+match[2] - 1];
    return month ? month + " " + (+match[3]) + ", " + match[1] : String(value);
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content != null) node.textContent = String(content);
    return node;
  }

  function makeTalk(talk) {
    const row = element("article", "invited-talk-item");
    row.setAttribute("role", "listitem");

    const body = element("div", "invited-talk-content");
    const heading = element("h3", "invited-talk-title");
    const link = String(talk.url || "").trim();
    if (/^https?:\/\//i.test(link)) {
      const anchor = element("a", "", talk.topic || "Pending");
      anchor.href = link;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
      heading.appendChild(anchor);
    } else {
      heading.textContent = talk.topic || "Pending";
    }
    body.appendChild(heading);
    body.appendChild(element("p", "invited-talk-organization", talk.organization || ""));

    const badges = element("div", "invited-talk-badges");
    badges.appendChild(element("span", "invited-talk-place", talk.place || ""));
    badges.appendChild(element("time", "invited-talk-date", displayDate(talk.date)));
    badges.lastChild.setAttribute("datetime", String(talk.date || "").replace(/\//g, "-"));

    row.appendChild(body);
    row.appendChild(badges);
    return row;
  }

  function addButton(parent, label, page, disabled, current) {
    const button = element("button", "invited-talk-page-button", label);
    button.type = "button";
    button.disabled = !!disabled;
    if (current) {
      button.classList.add("is-active");
      button.setAttribute("aria-current", "page");
    }
    button.addEventListener("click", function () {
      if (button.disabled || currentPage === page) return;
      currentPage = page;
      render();
      const heading = document.querySelector(".invited-talks-heading");
      if (heading && typeof heading.scrollIntoView === "function") {
        heading.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    parent.appendChild(button);
  }

  function render() {
    const pageCount = Math.max(1, Math.ceil(talks.length / PAGE_SIZE));
    currentPage = Math.max(1, Math.min(currentPage, pageCount));
    container.replaceChildren();
    const pageItems = talks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    if (!pageItems.length) {
      container.appendChild(element("p", "invited-talks-loading", "No invited talks available."));
      pagination.hidden = true;
      return;
    }
    const fragment = document.createDocumentFragment();
    pageItems.forEach(function (talk) { fragment.appendChild(makeTalk(talk)); });
    container.appendChild(fragment);

    pagination.replaceChildren();
    const summary = element("div", "invited-talk-page-summary", pageCount > 1
      ? "Page " + currentPage + " of " + pageCount + " · " + talks.length + " talks"
      : talks.length + " talks");
    pagination.appendChild(summary);
    if (pageCount > 1) {
      const controls = element("div", "invited-talk-page-controls");
      addButton(controls, "«", 1, currentPage === 1, false);
      addButton(controls, "‹", Math.max(1, currentPage - 1), currentPage === 1, false);
      for (let p = 1; p <= pageCount; p++) addButton(controls, String(p), p, false, p === currentPage);
      addButton(controls, "›", Math.min(pageCount, currentPage + 1), currentPage === pageCount, false);
      addButton(controls, "»", pageCount, currentPage === pageCount, false);
      pagination.appendChild(controls);
    }
    pagination.hidden = false;
  }

  fetch(dataUrl, { cache: "no-cache" })
    .then(function (response) {
      if (!response.ok) throw new Error("Cannot load " + dataUrl + " (HTTP " + response.status + ")");
      return response.json();
    })
    .then(function (data) {
      const items = Array.isArray(data.invited_talks) ? data.invited_talks : [];
      talks = items.slice().sort(function (a, b) { return dateKey(b.date) - dateKey(a.date); });
      render();
    })
    .catch(function (error) {
      console.error(error);
      container.replaceChildren(element("p", "invited-talks-loading", "Unable to load invited talks. Please refresh the page."));
      pagination.hidden = true;
    });
})();
