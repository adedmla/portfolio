(function () {
  const FILTERS = ["all", "infra", "full-stack", "ai", "leadership"];
  const mount = document.getElementById("work-mount");
  if (!mount || typeof resumeData === "undefined") return;

  const timeline = resumeData.filter((item) => item.timeline);
  const featured = resumeData.find((item) => item.featured);

  let activeFilter = "all";
  let openIds = new Set();

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function matchesFilter(item, filter) {
    if (filter === "all") return true;
    return (item.facets || []).includes(filter);
  }

  function runbookBody(item) {
    const chips = (item.stack || [])
      .map((tech) => `<span class="stack-chip">${escapeHtml(tech)}</span>`)
      .join("");
    const query = encodeURIComponent(`tell me about ${item.org || item.shortTitle}`);
    const metric = item.metric
      ? `<p class="runbook-metric">${escapeHtml(item.metric)}</p>`
      : "";

    return `
      <div class="runbook-body">
        <div class="runbook-body-inner">
          ${metric}
          <p class="runbook-copy">${escapeHtml(item.body)}</p>
          ${chips ? `<div class="stack-row">${chips}</div>` : ""}
          <a class="runbook-query" href="query.html?q=${query}">query this →</a>
        </div>
      </div>
    `;
  }

  function runbookRow(item, opts) {
    const open = openIds.has(item.id);
    const compact = opts && opts.compact;
    const year = item.year || "";
    const title = compact
      ? `${item.org}: ${item.shortTitle}`
      : item.shortTitle;
    const org = compact ? "" : item.org || "";

    return `
      <article
        class="runbook${open ? " is-open" : ""}${compact ? " is-compact" : ""}"
        id="${escapeHtml(item.id)}"
        data-id="${escapeHtml(item.id)}"
      >
        <button
          class="runbook-toggle"
          type="button"
          aria-expanded="${open ? "true" : "false"}"
          aria-controls="${escapeHtml(item.id)}-body"
        >
          ${
            compact
              ? `<span class="bullet-point">*</span>`
              : `<span class="runbook-year">${escapeHtml(year)}</span>
                 <span class="line"></span>`
          }
          <span class="runbook-title">${escapeHtml(title)}</span>
          ${org ? `<span class="company-name">${escapeHtml(org)}</span>` : ""}
          <span class="runbook-chevron" aria-hidden="true">${open ? "▾" : "▸"}</span>
        </button>
        <div id="${escapeHtml(item.id)}-body">
          ${runbookBody(item)}
        </div>
      </article>
    `;
  }

  function featuredBlock(item) {
    const nodes = (item.diagram || [])
      .map((node, index) => {
        const arrow =
          index < item.diagram.length - 1
            ? `<span class="sys-arrow" aria-hidden="true">→</span>`
            : "";
        return `<span class="sys-node">${escapeHtml(node)}</span>${arrow}`;
      })
      .join("");

    const open = openIds.has(item.id);

    return `
      <section class="featured-system${open ? " is-open" : ""}" id="${escapeHtml(item.id)}" data-id="${escapeHtml(item.id)}">
        <p class="work-kicker">featured system</p>
        <button
          class="featured-toggle"
          type="button"
          aria-expanded="${open ? "true" : "false"}"
        >
          <span>
            <span class="featured-name">${escapeHtml(item.shortTitle)}</span>
            <span class="featured-metric">${escapeHtml(item.metric || item.org)}</span>
          </span>
          <span class="runbook-chevron" aria-hidden="true">${open ? "▾" : "▸"}</span>
        </button>
        ${
          nodes
            ? `<div class="sys-diagram" aria-hidden="true">${nodes}</div>`
            : ""
        }
        <div class="runbook-body">
          <div class="runbook-body-inner">
            <p class="runbook-copy">${escapeHtml(item.body)}</p>
            <div class="stack-row">
              ${(item.stack || [])
                .map((tech) => `<span class="stack-chip">${escapeHtml(tech)}</span>`)
                .join("")}
            </div>
            <a class="runbook-query" href="query.html?q=${encodeURIComponent(
              "tell me about the clinic optimization platform"
            )}">query this →</a>
          </div>
        </div>
      </section>
    `;
  }

  function render() {
    const filtered = timeline
      .filter((item) => matchesFilter(item, activeFilter))
      .sort((a, b) => b.sort - a.sort);

    const showFeatured =
      featured && matchesFilter(featured, activeFilter);

    const primary = filtered.filter((item) => {
      if (showFeatured && item.id === featured.id) return false;
      if (activeFilter === "all") return item.tag !== "leadership";
      return true;
    });

    const leadership =
      activeFilter === "all"
        ? timeline.filter((item) => item.tag === "leadership")
        : [];

    mount.innerHTML = `
      <div class="work-header">
        <p class="work-title">runbooks</p>
        <p class="work-meta">${filtered.length} system${filtered.length === 1 ? "" : "s"}</p>
      </div>
      <div class="facet-row" role="tablist" aria-label="filter runbooks">
        ${FILTERS.map(
          (filter) => `
            <button
              class="facet-chip${filter === activeFilter ? " is-active" : ""}"
              type="button"
              data-filter="${filter}"
              role="tab"
              aria-selected="${filter === activeFilter ? "true" : "false"}"
            >${filter}</button>
          `
        ).join("")}
      </div>
      ${showFeatured ? featuredBlock(featured) : ""}
      <div class="runbook-list">
        ${primary.map((item) => runbookRow(item)).join("") || `<p class="work-empty">no runbooks in this facet</p>`}
      </div>
      ${
        leadership.length
          ? `<div class="work-section school-leadership">
              <p class="work-title">school leadership</p>
              ${leadership.map((item) => runbookRow(item, { compact: true })).join("")}
            </div>`
          : ""
      }
    `;

    bind();
  }

  function toggle(id) {
    if (openIds.has(id)) openIds.delete(id);
    else openIds.add(id);
    render();
  }

  function bind() {
    mount.querySelectorAll("[data-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeFilter = chip.dataset.filter;
        render();
      });
    });

    mount.querySelectorAll(".runbook").forEach((row) => {
      const button = row.querySelector(".runbook-toggle");
      button.addEventListener("click", () => toggle(row.dataset.id));
    });

    const featuredEl = mount.querySelector(".featured-system");
    if (featuredEl) {
      featuredEl.querySelector(".featured-toggle").addEventListener("click", () => {
        toggle(featuredEl.dataset.id);
      });
    }
  }

  function honorHash() {
    const id = (location.hash || "").replace("#", "");
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    target.classList.add("is-target");
    target.scrollIntoView({ block: "center" });
    window.setTimeout(() => target.classList.remove("is-target"), 1200);
  }

  window.addEventListener("hashchange", () => {
    const id = (location.hash || "").replace("#", "");
    if (!id) return;
    openIds.add(id);
    render();
    honorHash();
  });

  const initial = (location.hash || "").replace("#", "");
  if (initial) openIds.add(initial);
  render();
  if (initial) honorHash();
})();
