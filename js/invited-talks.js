(function () {
  "use strict";

  const tableBody = document.getElementById("invited-talks-table-body");
  if (!tableBody) return;

  const root = document.body.getAttribute("data-root") || "";
  const jsonPath = `${root}data/invited-talks.json`;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const formatUpdateLabel = (items) => {
    const dates = items
      .map((item) => String(item.date || "").trim())
      .filter(Boolean)
      .sort()
      .reverse();

    if (!dates.length) return "";

    const latest = dates[0];
    const match = latest.match(/^(\d{4})[\/-](\d{1,2})/);
    if (!match) return "";

    const year = match[1];
    const monthIndex = Number(match[2]) - 1;
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    return `(update: ${monthNames[monthIndex]} ${year})`;
  };

  const renderRows = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      tableBody.innerHTML = "";
      return;
    }

    tableBody.innerHTML = items
      .map((item) => `
        <tr>
          <td>${escapeHtml(item.organization)}</td>
          <td>${escapeHtml(item.topic)}</td>
          <td>${escapeHtml(item.place)}</td>
          <td>${escapeHtml(item.date)}</td>
        </tr>
      `)
      .join("");

    const updateLabel = document.getElementById("invited-talks-update-label");
    if (updateLabel) {
      const label = formatUpdateLabel(items);
      if (label) updateLabel.textContent = label;
    }
  };

  fetch(jsonPath, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${jsonPath}`);
      }
      return response.json();
    })
    .then((data) => {
      renderRows(data.invited_talks || []);
    })
    .catch((error) => {
      console.error(error);
      tableBody.innerHTML = "";
    });
})();
