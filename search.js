(function () {
  const PER_PAGE = 4;
  const AI_MODE = true;
  const API_URL = "https://weg7pdzoa0.execute-api.us-east-1.amazonaws.com/query";
  const EMAIL = "adedamolaadejumobi2027@northwestern.edu";
  const DEMO_QUERY = "what internships has ade done?";

  const COMMANDS = [
    {
      id: "/contact",
      hint: "email, linkedin, github",
      run: renderContact,
    },
    {
      id: "/resume",
      hint: "open work runbooks",
      run: renderResume,
    },
    {
      id: "/stack",
      hint: "languages and tools",
      run: renderStack,
    },
  ];

  const mount = document.getElementById("search-mount");
  if (!mount || typeof resumeData === "undefined") return;

  const fuse =
    typeof Fuse === "undefined"
      ? null
      : new Fuse(resumeData, {
          keys: [
            { name: "title", weight: 0.4 },
            { name: "body", weight: 0.3 },
            { name: "tag", weight: 0.1 },
            { name: "keywords", weight: 0.2 },
            { name: "org", weight: 0.2 },
            { name: "stack", weight: 0.15 },
          ],
          threshold: 0.4,
          ignoreLocation: true,
          minMatchCharLength: 2,
        });

  const placeholder = AI_MODE
    ? "ask anything about ade, or /contact"
    : "try python, aws, rag, hackathon ...";
  const chipA = AI_MODE ? DEMO_QUERY : "kubernetes";
  const chipB = AI_MODE ? "what has ade built with python?" : "machine learning";

  mount.innerHTML = `
    <div class="session-header">
      <span id="search-label">${AI_MODE ? "ask ai" : "query"}</span>
      <span id="session-status">nova micro · idle</span>
    </div>
    <div id="search-wrapper">
      <span id="search-caret">›</span>
      <input
        id="search-input"
        type="text"
        placeholder="${placeholder}"
        autocomplete="off"
        spellcheck="false"
        aria-label="query"
      />
    </div>
    <div id="command-menu" hidden></div>
    <div id="results-meta" role="status" aria-live="polite"></div>
    <div id="empty-state">
      <p class="session-idle">session ready</p>
      <button class="demo-line" id="demo-line" type="button">
        <span id="demo-caret">›</span>
        <span id="demo-text"></span>
        <span class="blink-block" id="demo-blink">█</span>
      </button>
      <p class="empty-hint">enter to run · /contact · /resume · /stack · esc to clear</p>
    </div>
    <div id="results-list"></div>
    <div id="pagination" hidden>
      <button class="page-btn" id="btn-prev">← prev</button>
      <span id="page-indicator"></span>
      <button class="page-btn" id="btn-next">next →</button>
    </div>
    <div id="search-suggestions">
      <span>try:</span>
      <span class="suggestion-chip" data-q="${chipA}">${chipA}</span>
      <span class="dot-sep">·</span>
      <span class="suggestion-chip" data-q="${chipB}">${chipB}</span>
      <span class="dot-sep">·</span>
      <span class="suggestion-chip" data-q="/contact">/contact</span>
      <span class="dot-sep">·</span>
      <span class="suggestion-chip" data-q="/stack">/stack</span>
    </div>
  `;

  const input = document.getElementById("search-input");
  const meta = document.getElementById("results-meta");
  const list = document.getElementById("results-list");
  const empty = document.getElementById("empty-state");
  const status = document.getElementById("session-status");
  const pagination = document.getElementById("pagination");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const pageLabel = document.getElementById("page-indicator");
  const commandMenu = document.getElementById("command-menu");
  const demoText = document.getElementById("demo-text");
  const demoBlink = document.getElementById("demo-blink");
  const demoLine = document.getElementById("demo-line");

  let currentResults = [];
  let currentPage = 1;
  let focusedIndex = -1;
  let commandIndex = 0;
  let abortDemo = false;
  let typingToken = 0;
  let lastMs = null;
  let waitTimer = null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function showEmpty(on) {
    empty.hidden = !on;
    if (on) list.innerHTML = "";
  }

  function citationsFor(query) {
    return search(query)
      .filter((item) => item.timeline && item.id)
      .slice(0, 3);
  }

  function citationMarkup(items) {
    if (!items.length) return "";
    return `
      <div class="citation-row">
        <p class="citation-label">cited runbooks</p>
        ${items
          .map(
            (item) => `
              <a class="citation-link" href="work.html#${encodeURIComponent(item.id)}">
                <span class="result-tag">${escapeHtml(item.tag)}</span>
                <span>${escapeHtml(item.shortTitle || item.title)}</span>
                <span class="citation-org">${escapeHtml(item.org || "")}</span>
              </a>
            `
          )
          .join("")}
      </div>
    `;
  }

  function search(query) {
    query = query.trim();
    if (!query) return [];
    if (fuse) {
      const hits = fuse.search(query).map((result) => result.item);
      if (hits.length) return hits;
    }
    const words = query
      .toLowerCase()
      .split(/\W+/)
      .filter((word) => word.length > 2);
    return resumeData.filter((item) => {
      const hay = [
        item.title,
        item.body,
        item.tag,
        item.org,
        ...(item.keywords || []),
      ]
        .join(" ")
        .toLowerCase();
      return words.some(
        (word) => hay.includes(word) || hay.includes(word.replace(/s$/, ""))
      );
    });
  }

  function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return escapeHtml(text).replace(
      new RegExp(`(${escaped})`, "gi"),
      "<mark>$1</mark>"
    );
  }

  function renderPage() {
    list.innerHTML = "";
    focusedIndex = -1;
    const totalPages = Math.ceil(currentResults.length / PER_PAGE);
    const start = (currentPage - 1) * PER_PAGE;
    const pageItems = currentResults.slice(start, start + PER_PAGE);
    const query = input.value.trim();

    pageItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "result-card";
      card.tabIndex = -1;
      const href = item.id && item.timeline ? `work.html#${item.id}` : "";
      card.innerHTML = `
        <div class="result-card-top">
          <span class="result-tag">${escapeHtml(item.tag)}</span>
          ${item.period ? `<span class="result-period">${escapeHtml(item.period)}</span>` : ""}
        </div>
        <div class="result-title">${
          href
            ? `<a href="${href}">${highlight(item.title, query)}</a>`
            : highlight(item.title, query)
        }</div>
        <div class="result-body">${highlight(item.body, query)}</div>
      `;
      list.appendChild(card);
    });

    if (totalPages > 1) {
      pagination.hidden = false;
      pagination.style.display = "flex";
      pageLabel.textContent = `${currentPage} / ${totalPages}`;
      btnPrev.disabled = currentPage === 1;
      btnNext.disabled = currentPage === totalPages;
    } else {
      pagination.hidden = true;
      pagination.style.display = "none";
    }
  }

  function render(results, query) {
    currentResults = results;
    currentPage = 1;
    pagination.style.display = "none";

    if (!query.trim()) {
      meta.textContent = "";
      showEmpty(true);
      setStatus("nova micro · idle");
      return;
    }

    showEmpty(false);
    meta.textContent =
      results.length === 0
        ? `no results for "${query}"`
        : `${results.length} result${results.length > 1 ? "s" : ""} for "${query}"`;
    renderPage();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function typeInto(el, text, token) {
    el.textContent = "";
    const chunks = text.split(/(\s+)/);
    for (const chunk of chunks) {
      if (token !== typingToken) return;
      el.textContent += chunk;
      await sleep(chunk.trim() ? 18 : 8);
    }
  }

  function stopWaitTimer() {
    if (waitTimer) {
      clearInterval(waitTimer);
      waitTimer = null;
    }
  }

  async function queryAI(query) {
    stopWaitTimer();
    typingToken += 1;
    const token = typingToken;
    showEmpty(false);
    pagination.style.display = "none";
    list.innerHTML = "";

    const started = performance.now();
    let elapsed = 0;
    setStatus("nova micro · querying");
    meta.textContent = "querying · 0.0s";
    waitTimer = setInterval(() => {
      elapsed = (performance.now() - started) / 1000;
      meta.textContent = `querying · ${elapsed.toFixed(1)}s`;
    }, 100);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      stopWaitTimer();
      lastMs = Math.round(performance.now() - started);
      setStatus(`nova micro · ${lastMs}ms`);

      if (!data.answer) {
        showLocal(query, "ai returned empty — local results");
        return;
      }

      if (token !== typingToken) return;
      meta.textContent = `response for "${query}"`;
      const card = document.createElement("div");
      card.className = "result-card is-ai";
      card.innerHTML = `
        <div class="result-card-top">
          <span class="result-tag">ai</span>
          <span class="result-period">nova micro · aws bedrock · ${lastMs}ms</span>
        </div>
        <div class="result-body stream-body"></div>
        ${citationMarkup(citationsFor(query))}
      `;
      list.appendChild(card);
      const body = card.querySelector(".stream-body");
      await typeInto(body, data.answer, token);
    } catch (err) {
      stopWaitTimer();
      showLocal(query, "ai unreachable — local results");
    }
  }

  function showLocal(query, reason) {
    render(search(query), query);
    setStatus("local · fuse");
    meta.textContent = reason;
  }

  function renderContact() {
    showEmpty(false);
    pagination.style.display = "none";
    setStatus("local · /contact");
    meta.textContent = "command · /contact";
    list.innerHTML = `
      <div class="result-card">
        <div class="result-card-top">
          <span class="result-tag">contact</span>
        </div>
        <p class="result-title">adedamola adejumobi</p>
        <p class="result-body">${EMAIL}</p>
        <div class="command-actions">
          <button class="page-btn" id="copy-email" type="button">copy email</button>
          <a class="page-btn" href="mailto:${EMAIL}">mailto</a>
          <a class="page-btn" href="https://www.linkedin.com/in/adedamola-adejumobi-358492213/" target="_blank" rel="noreferrer">linkedin</a>
          <a class="page-btn" href="https://github.com/adedmla" target="_blank" rel="noreferrer">github</a>
        </div>
      </div>
    `;
    const copyBtn = document.getElementById("copy-email");
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(EMAIL);
        copyBtn.textContent = "copied";
      } catch (err) {
        copyBtn.textContent = EMAIL;
      }
    });
  }

  function renderResume() {
    showEmpty(false);
    pagination.style.display = "none";
    setStatus("local · /resume");
    meta.textContent = "command · /resume";
    const items = resumeData
      .filter((item) => item.timeline)
      .sort((a, b) => b.sort - a.sort);
    list.innerHTML = `
      <div class="result-card">
        <div class="result-card-top">
          <span class="result-tag">resume</span>
          <span class="result-period">${items.length} runbooks</span>
        </div>
        <div class="resume-list">
          ${items
            .map(
              (item) => `
                <a class="citation-link" href="work.html#${encodeURIComponent(item.id)}">
                  <span class="result-tag">${escapeHtml(item.tag)}</span>
                  <span>${escapeHtml(item.shortTitle)}</span>
                  <span class="citation-org">${escapeHtml(item.org || "")}</span>
                </a>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  function renderStack() {
    showEmpty(false);
    pagination.style.display = "none";
    setStatus("local · /stack");
    meta.textContent = "command · /stack";
    const skills = resumeData.filter((item) => item.tag === "skills");
    list.innerHTML = skills
      .map(
        (item) => `
          <div class="result-card">
            <div class="result-card-top">
              <span class="result-tag">${escapeHtml(item.title)}</span>
            </div>
            <div class="stack-row">
              ${(item.stack || [])
                .map((tech) => `<span class="stack-chip">${escapeHtml(tech)}</span>`)
                .join("")}
            </div>
          </div>
        `
      )
      .join("");
  }

  function matchingCommands(value) {
    const q = value.trim().toLowerCase();
    if (!q.startsWith("/")) return [];
    return COMMANDS.filter((cmd) => cmd.id.startsWith(q));
  }

  function renderCommandMenu(value) {
    const matches = matchingCommands(value);
    if (!matches.length || !value.startsWith("/")) {
      commandMenu.hidden = true;
      commandMenu.innerHTML = "";
      return;
    }
    commandMenu.hidden = false;
    commandMenu.innerHTML = matches
      .map(
        (cmd, index) => `
          <button class="command-item${index === commandIndex ? " is-active" : ""}" type="button" data-cmd="${cmd.id}">
            <span>${cmd.id}</span>
            <span class="command-hint">${cmd.hint}</span>
          </button>
        `
      )
      .join("");
    commandMenu.querySelectorAll(".command-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        input.value = btn.dataset.cmd;
        submit(btn.dataset.cmd);
      });
    });
  }

  function submit(raw) {
    abortDemo = true;
    commandMenu.hidden = true;
    const query = (raw == null ? input.value : raw).trim();
    input.value = query;
    if (!query) {
      render([], "");
      return;
    }

    const command = COMMANDS.find((cmd) => cmd.id === query);
    if (command) {
      command.run();
      return;
    }

    if (AI_MODE) queryAI(query);
    else render(search(query), query);
  }

  function clearSession() {
    typingToken += 1;
    stopWaitTimer();
    input.value = "";
    commandMenu.hidden = true;
    lastMs = null;
    render([], "");
  }

  async function playDemo() {
    abortDemo = false;
    demoText.textContent = "";
    for (let i = 0; i < DEMO_QUERY.length; i += 1) {
      if (abortDemo) return;
      demoText.textContent += DEMO_QUERY[i];
      await sleep(42);
    }
    if (abortDemo) return;
    demoBlink.style.display = "none";
  }

  input.addEventListener("input", () => {
    abortDemo = true;
    commandIndex = 0;
    renderCommandMenu(input.value);
    if (!AI_MODE) {
      clearTimeout(input._debounce);
      input._debounce = setTimeout(() => {
        render(search(input.value), input.value);
      }, 120);
    }
  });

  input.addEventListener("keydown", (e) => {
    const matches = matchingCommands(input.value);
    const cards = list.querySelectorAll(".result-card, .citation-link");

    if (e.key === "Enter") {
      e.preventDefault();
      if (!commandMenu.hidden && matches.length) {
        submit(matches[Math.min(commandIndex, matches.length - 1)].id);
        return;
      }
      submit();
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      clearSession();
      return;
    }

    if (!commandMenu.hidden && matches.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      commandIndex =
        e.key === "ArrowDown"
          ? (commandIndex + 1) % matches.length
          : (commandIndex - 1 + matches.length) % matches.length;
      renderCommandMenu(input.value);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocus(Math.min(focusedIndex + 1, cards.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocus(Math.max(focusedIndex - 1, 0));
    }
  });

  function setFocus(index) {
    const cards = list.querySelectorAll(".result-card, .citation-link");
    cards.forEach((card) => card.classList.remove("focused"));
    if (index >= 0 && index < cards.length) {
      cards[index].classList.add("focused");
      cards[index].scrollIntoView({ block: "nearest" });
      focusedIndex = index;
    }
  }

  btnPrev.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderPage();
    }
  });

  btnNext.addEventListener("click", () => {
    if (currentPage < Math.ceil(currentResults.length / PER_PAGE)) {
      currentPage += 1;
      renderPage();
    }
  });

  document.querySelectorAll(".suggestion-chip").forEach((chip) => {
    chip.addEventListener("click", () => submit(chip.dataset.q));
  });

  demoLine.addEventListener("click", () => submit(DEMO_QUERY));

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });

  const params = new URLSearchParams(location.search);
  const preset = params.get("q") || (location.hash.startsWith("#/") ? location.hash.slice(1) : "");

  input.focus();
  if (preset) {
    abortDemo = true;
    submit(preset);
  } else {
    playDemo();
  }
})();
