(function () {
  const PER_PAGE = 4;

  // ── fuse.js config ─────────────────────────────────────────────────────────
  const fuse = new Fuse(resumeData, {
    keys: [
      { name: "title",    weight: 0.4 },
      { name: "body",     weight: 0.3 },
      { name: "tag",      weight: 0.1 },
      { name: "keywords", weight: 0.2 },
    ],
    threshold:        0.4,   // 0 = exact, 1 = match anything — 0.4 is a good middle ground
    ignoreLocation:   true,  // don't penalise matches that aren't near the start of the string
    minMatchCharLength: 2,
  });

  // ── mount ──────────────────────────────────────────────────────────────────
  const mount = document.getElementById("search-mount");
  if (!mount) return;

  mount.innerHTML = `
    <span id="search-label">query</span>
    <div id="search-wrapper">
      <span id="search-caret">›</span>
      <input
        id="search-input"
        type="text"
        placeholder='try "python", "aws", "rag", "hackathon" ...'
        autocomplete="off"
        spellcheck="false"
      />
      <span id="search-hints">
        <kbd>↑↓</kbd> navigate &nbsp;<kbd>esc</kbd> clear
      </span>
    </div>
    <div id="results-meta"></div>
    <div id="results-list"></div>
    <div id="pagination" style="display:none;">
      <button class="page-btn" id="btn-prev">← prev</button>
      <span id="page-indicator"></span>
      <button class="page-btn" id="btn-next">next →</button>
    </div>
    <div id="search-suggestions">
      <span>try:</span>
      <span class="suggestion-chip" data-q="machine learning">machine learning</span>
      <span style="color:#ccc">·</span>
      <span class="suggestion-chip" data-q="kubernetes">kubernetes</span>
      <span style="color:#ccc">·</span>
      <span class="suggestion-chip" data-q="react">react</span>
      <span style="color:#ccc">·</span>
      <span class="suggestion-chip" data-q="nasa">nasa</span>
      <span style="color:#ccc">·</span>
      <span class="suggestion-chip" data-q="python">python</span>
    </div>
  `;

  // ── refs ───────────────────────────────────────────────────────────────────
  const input      = document.getElementById("search-input");
  const meta       = document.getElementById("results-meta");
  const list       = document.getElementById("results-list");
  const pagination = document.getElementById("pagination");
  const btnPrev    = document.getElementById("btn-prev");
  const btnNext    = document.getElementById("btn-next");
  const pageLabel  = document.getElementById("page-indicator");

  // ── state ──────────────────────────────────────────────────────────────────
  let currentResults = [];
  let currentPage    = 1;
  let focusedIndex   = -1;

  // ── search ─────────────────────────────────────────────────────────────────
  function search(query) {
    query = query.trim();
    if (!query) return [];
    return fuse.search(query).map((r) => r.item);
  }

  // ── highlight ──────────────────────────────────────────────────────────────
  function highlight(text, query) {
    if (!query) return text;
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark>$1</mark>");
  }

  // ── render page ────────────────────────────────────────────────────────────
  function renderPage() {
    list.innerHTML = "";
    focusedIndex   = -1;

    const totalPages = Math.ceil(currentResults.length / PER_PAGE);
    const start      = (currentPage - 1) * PER_PAGE;
    const pageItems  = currentResults.slice(start, start + PER_PAGE);
    const query      = input.value.trim();

    pageItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.tabIndex  = -1;
      card.innerHTML = `
        <div class="result-card-top">
          <span class="result-tag">${item.tag}</span>
          ${item.period ? `<span class="result-period">${item.period}</span>` : ""}
        </div>
        <div class="result-title">${highlight(item.title, query)}</div>
        <div class="result-body">${highlight(item.body, query)}</div>
      `;
      list.appendChild(card);
    });

    if (totalPages > 1) {
      pagination.style.display = "flex";
      pageLabel.textContent    = `${currentPage} / ${totalPages}`;
      btnPrev.disabled         = currentPage === 1;
      btnNext.disabled         = currentPage === totalPages;
    } else {
      pagination.style.display = "none";
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────
  function render(results, query) {
    currentResults = results;
    currentPage    = 1;

    if (!query.trim()) {
      meta.textContent         = "";
      list.innerHTML           = "";
      pagination.style.display = "none";
      return;
    }

    meta.textContent =
      results.length === 0
        ? `no results for "${query}"`
        : `${results.length} result${results.length > 1 ? "s" : ""} for "${query}"`;

    renderPage();
  }

  // ── keyboard nav ───────────────────────────────────────────────────────────
  function setFocus(index) {
    const cards = list.querySelectorAll(".result-card");
    cards.forEach((c) => c.classList.remove("focused"));
    if (index >= 0 && index < cards.length) {
      cards[index].classList.add("focused");
      cards[index].scrollIntoView({ block: "nearest" });
      focusedIndex = index;
    }
  }

  // ── events ─────────────────────────────────────────────────────────────────
  let debounceTimer;
  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      render(search(input.value), input.value);
    }, 120);
  });

  input.addEventListener("keydown", (e) => {
    const cards = list.querySelectorAll(".result-card");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocus(Math.min(focusedIndex + 1, cards.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocus(Math.max(focusedIndex - 1, 0));
    } else if (e.key === "Escape") {
      input.value = "";
      render([], "");
    }
  });

  btnPrev.addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; renderPage(); }
  });

  btnNext.addEventListener("click", () => {
    if (currentPage < Math.ceil(currentResults.length / PER_PAGE)) { currentPage++; renderPage(); }
  });

  document.querySelectorAll(".suggestion-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      input.value = chip.dataset.q;
      input.dispatchEvent(new Event("input"));
      input.focus();
    });
  });

  input.focus();
})();