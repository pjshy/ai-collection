const REVIEW_STORAGE_KEY = "obsidian-audit-review-status";

/** @type {Array<AuditCase>} */
let allCases = [];
let selectedTags = new Set();
let selectedId = null;

const state = {
  expected: "all",
  failedOnly: false,
  keyword: "",
};

const nodes = {
  metrics: document.getElementById("metrics"),
  expectedFilter: document.getElementById("expectedFilter"),
  failedOnly: document.getElementById("failedOnly"),
  keyword: document.getElementById("keyword"),
  tagFilters: document.getElementById("tagFilters"),
  casesBody: document.getElementById("casesBody"),
  detailPanel: document.getElementById("detailPanel"),
};

init();

async function init() {
  const dataset = await loadDataset();
  const reviewMap = readReviewMap();

  allCases = dataset.map((item) => {
    const predicted = predictTrigger(item.input);
    const pass = predicted === item.expected;
    const reviewStatus = reviewMap[item.id] ?? "unreviewed";
    return { ...item, predicted, pass, reviewStatus };
  });

  bindEvents();
  renderTagFilters();
  render();
}

async function loadDataset() {
  const response = await fetch("./dataset.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load dataset.json: ${response.status}`);
  }
  return response.json();
}

function bindEvents() {
  nodes.expectedFilter.addEventListener("change", (e) => {
    state.expected = e.target.value;
    render();
  });

  nodes.failedOnly.addEventListener("change", (e) => {
    state.failedOnly = e.target.checked;
    render();
  });

  nodes.keyword.addEventListener("input", (e) => {
    state.keyword = e.target.value.trim().toLowerCase();
    render();
  });
}

function render() {
  const filtered = filterCases(allCases);
  renderMetrics(filtered);
  renderTable(filtered);

  if (!selectedId || !filtered.find((c) => c.id === selectedId)) {
    selectedId = filtered[0]?.id ?? null;
  }

  const picked = allCases.find((c) => c.id === selectedId);
  renderDetail(picked);
}

function filterCases(list) {
  return list.filter((item) => {
    if (state.expected !== "all" && item.expected !== state.expected) return false;
    if (state.failedOnly && item.pass) return false;

    if (state.keyword) {
      const blob = `${item.id} ${item.title} ${item.input}`.toLowerCase();
      if (!blob.includes(state.keyword)) return false;
    }

    if (selectedTags.size > 0) {
      const hasAny = item.tags.some((tag) => selectedTags.has(tag));
      if (!hasAny) return false;
    }

    return true;
  });
}

function renderMetrics(list) {
  const m = calculateMetrics(list);
  const cards = [
    ["Total", m.total],
    ["Pass", m.pass],
    ["Fail", m.fail],
    ["Accuracy", toPct(m.accuracy)],
    ["Precision", toPct(m.precision)],
    ["Recall", toPct(m.recall)],
    ["F1", toPct(m.f1)],
  ];

  nodes.metrics.innerHTML = cards
    .map(
      ([label, value]) => `
      <article class="metric">
        <div class="label">${label}</div>
        <div class="value">${value}</div>
      </article>
    `
    )
    .join("");
}

function renderTable(list) {
  if (!list.length) {
    nodes.casesBody.innerHTML = `<tr><td colspan="9" class="muted">No matching cases</td></tr>`;
    return;
  }

  nodes.casesBody.innerHTML = list
    .map(
      (item) => `
      <tr data-id="${item.id}" data-pass="${String(item.pass)}">
        <td>${item.id}</td>
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml(shorten(item.input, 70))}</td>
        <td><span class="badge ${item.expected}">${item.expected}</span></td>
        <td><span class="badge ${item.predicted}">${item.predicted}</span></td>
        <td><span class="badge ${item.pass ? "pass" : "failed"}">${item.pass ? "pass" : "fail"}</span></td>
        <td><span class="badge ${item.priority}">${item.priority}</span></td>
        <td>
          <div class="tags">${item.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        </td>
        <td>
          <select class="review-select" data-review-id="${item.id}">
            ${renderReviewOptions(item.reviewStatus)}
          </select>
        </td>
      </tr>
    `
    )
    .join("");

  nodes.casesBody.querySelectorAll("tr[data-id]").forEach((tr) => {
    tr.addEventListener("click", (e) => {
      if (e.target instanceof HTMLSelectElement) return;
      selectedId = tr.dataset.id;
      const picked = allCases.find((c) => c.id === selectedId);
      renderDetail(picked);
    });
  });

  nodes.casesBody.querySelectorAll("select[data-review-id]").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const id = e.target.dataset.reviewId;
      const reviewStatus = e.target.value;
      const target = allCases.find((c) => c.id === id);
      if (target) {
        target.reviewStatus = reviewStatus;
        persistReviewStatus(id, reviewStatus);
        if (selectedId === id) renderDetail(target);
      }
    });
  });
}

function renderDetail(item) {
  if (!item) {
    nodes.detailPanel.innerHTML = `<h2>Details</h2><p class="muted">No case selected.</p>`;
    return;
  }

  const destructiveWarning = hasDestructiveIntent(item.input)
    ? `<p class="warn">This input includes destructive intent (delete/删除). Any write/delete action must require explicit user confirmation.</p>`
    : "";

  const mismatchReason = item.pass
    ? "Matches expected result."
    : explainMismatch(item.input, item.expected, item.predicted);

  nodes.detailPanel.innerHTML = `
    <h2>${item.id} · ${escapeHtml(item.title)}</h2>
    <p><strong>Expected:</strong> <span class="badge ${item.expected}">${item.expected}</span></p>
    <p><strong>Predicted:</strong> <span class="badge ${item.predicted}">${item.predicted}</span></p>
    <p><strong>Priority:</strong> <span class="badge ${item.priority}">${item.priority}</span></p>
    <p><strong>Review Status:</strong> ${item.reviewStatus}</p>
    <p><strong>Source:</strong> ${escapeHtml(item.source)}</p>
    ${destructiveWarning}
    <p><strong>User Input</strong></p>
    <pre>${escapeHtml(item.input)}</pre>
    <p><strong>Notes</strong>: ${escapeHtml(item.notes || "-")}</p>
    <p><strong>Mismatch Analysis</strong>: ${escapeHtml(mismatchReason)}</p>
  `;
}

function renderTagFilters() {
  const tags = [...new Set(allCases.flatMap((c) => c.tags))].sort();
  nodes.tagFilters.innerHTML = tags
    .map(
      (tag) => `
      <label>
        <input type="checkbox" value="${escapeHtml(tag)}" />
        <span class="tag">${escapeHtml(tag)}</span>
      </label>
    `
    )
    .join("");

  nodes.tagFilters.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const { value, checked } = e.target;
      if (checked) selectedTags.add(value);
      else selectedTags.delete(value);
      render();
    });
  });
}

function calculateMetrics(list) {
  const total = list.length;
  const pass = list.filter((x) => x.pass).length;
  const fail = total - pass;

  // trigger as positive class
  let tp = 0;
  let fp = 0;
  let fn = 0;

  list.forEach((x) => {
    if (x.predicted === "trigger" && x.expected === "trigger") tp += 1;
    if (x.predicted === "trigger" && x.expected !== "trigger") fp += 1;
    if (x.predicted !== "trigger" && x.expected === "trigger") fn += 1;
  });

  const accuracy = total ? pass / total : 0;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

  return { total, pass, fail, accuracy, precision, recall, f1 };
}

function toPct(v) {
  return `${(v * 100).toFixed(1)}%`;
}

function renderReviewOptions(current) {
  const statuses = ["unreviewed", "approved", "needs_fix"];
  return statuses
    .map((s) => `<option value="${s}" ${s === current ? "selected" : ""}>${s}</option>`)
    .join("");
}

function readReviewMap() {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistReviewStatus(id, status) {
  const map = readReviewMap();
  map[id] = status;
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(map));
}

/**
 * Heuristic v1 predictor for routing decision.
 * Future versions can replace this with real router logic, keeping same return contract.
 * @param {string} input
 * @returns {'trigger' | 'no_trigger'}
 */
export function predictTrigger(input) {
  const text = input.toLowerCase();

  const hardNo = [
    "don't use obsidian",
    "do not use obsidian",
    "don't run commands",
    "do not run commands",
    "no commands",
    "just explain",
    "methodology",
    "knowledge management",
    "settings page",
    "theme switch",
    "menu",
    "polish",
    "copywriting",
    "export to pdf",
    "不要用 obsidian",
    "不要执行命令",
    "不执行任何命令",
    "只想听",
    "知识管理",
    "知识体系",
    "方法论",
    "设置页",
    "主题怎么",
    "菜单",
    "润色",
    "文案",
    "导出成 pdf",
  ];

  const strongTrigger = [
    "obsidian cli",
    "obsidian ",
    "daily",
    "daily note",
    "create",
    "read",
    "search",
    "append",
    "prepend",
    "move",
    "delete",
    "path",
    "vault",
    "unknown subcommand",
    "command not found: obsidian",
    "plugin:install",
    "创建",
    "读取",
    "搜索",
    "删除",
  ];

  const hasHardNo = hardNo.some((k) => text.includes(k));
  const hits = strongTrigger.filter((k) => text.includes(k)).length;

  // Mixed intent rule: keep trigger when explicit safe vault operation intent is present.
  const safeIntent = ["search", "read", "create", "daily", "搜索", "读取", "创建"].some((k) => text.includes(k));

  if (hasHardNo && !safeIntent) return "no_trigger";
  return hits >= 1 ? "trigger" : "no_trigger";
}

function hasDestructiveIntent(input) {
  const text = input.toLowerCase();
  return text.includes("delete") || text.includes("删除");
}

function explainMismatch(input, expected, predicted) {
  if (expected === "no_trigger" && predicted === "trigger") {
    return "Likely false positive: the input appears methodology/UI/non-vault focused, but heuristic CLI keywords were matched.";
  }
  if (expected === "trigger" && predicted === "no_trigger") {
    return "Likely false negative: the input contains vault-operation intent, but the heuristic rules did not capture it.";
  }
  return `expected=${expected}, predicted=${predicted}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function shorten(str, max) {
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1)}…`;
}

/**
 * @typedef {Object} AuditCase
 * @property {string} id
 * @property {string} title
 * @property {string} input
 * @property {'trigger' | 'no_trigger'} expected
 * @property {'trigger' | 'no_trigger'} predicted
 * @property {boolean} pass
 * @property {'high' | 'medium' | 'low'} priority
 * @property {string[]} tags
 * @property {string} notes
 * @property {string} source
 * @property {'unreviewed' | 'approved' | 'needs_fix'} reviewStatus
 */
