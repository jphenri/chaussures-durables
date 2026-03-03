const ui = {
  dayChip: document.getElementById("day-chip"),
  reputationChip: document.getElementById("reputation-chip"),
  levelChip: document.getElementById("level-chip"),
  scoreChip: document.getElementById("score-chip"),
  diagnosticText: document.getElementById("diagnostic-text"),
  severity: document.getElementById("diagnostic-severity"),
  selectedPartLabel: document.getElementById("selected-part-label"),
  actionsList: document.getElementById("actions-list"),
  historyList: document.getElementById("history-list"),
  resetBtn: document.getElementById("reset-ui-btn"),
  svgShell: document.getElementById("svg-shell"),
  tooltip: document.getElementById("part-tooltip"),
  parts: Array.from(document.querySelectorAll(".shoe-part[data-part]")),
};

const PARTS = {
  semelle: {
    label: "Semelle",
    severity: "critical",
    diagnosis:
      "Usure avancee et perte d'adherence detectees sur la semelle. Intervention rapide conseillee.",
    actions: ["Changer semelle", "Poser patin antiderapant"],
  },
  talon: {
    label: "Talon",
    severity: "medium",
    diagnosis:
      "Talon tasse avec appui instable. Le remplacement du bloc talon est recommande.",
    actions: ["Remplacer talon", "Reequilibrer appui"],
  },
  couture: {
    label: "Couture",
    severity: "critical",
    diagnosis:
      "Couture fragilisee sur le flanc. Risque d'ouverture complete si non traitee.",
    actions: ["Renforcer coutures", "Reprendre piquage complet"],
  },
  empeigne: {
    label: "Empeigne",
    severity: "good",
    diagnosis:
      "Cuir fatigue mais recuperable. Un soin nourrissant prolonge la durabilite.",
    actions: ["Nourrir cuir", "Lustrer protection"],
  },
};

const SEVERITY_LABEL = {
  neutral: "Aucun",
  good: "Bon",
  medium: "Moyen",
  critical: "Critique",
};

const SCORE_EFFECT = {
  "Changer semelle": { score: 18, reputation: 4 },
  "Poser patin antiderapant": { score: 10, reputation: 2 },
  "Remplacer talon": { score: 14, reputation: 3 },
  "Reequilibrer appui": { score: 11, reputation: 2 },
  "Renforcer coutures": { score: 16, reputation: 4 },
  "Reprendre piquage complet": { score: 20, reputation: 5 },
  "Nourrir cuir": { score: 9, reputation: 2 },
  "Lustrer protection": { score: 8, reputation: 1 },
};

const state = {
  day: 1,
  reputation: 50,
  level: "Apprenti",
  score: 0,
  selectedPart: null,
  selectedSeverity: "neutral",
  history: [],
};

// Optional bridge: if legacy business hooks exist, call them.
function callLegacyHook(name, payload) {
  const fn = window[name];
  if (typeof fn === "function") {
    try {
      fn(payload);
    } catch (_error) {
      // Keep the new UI resilient even if legacy code throws.
    }
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function setLevelFromScore() {
  if (state.score >= 140) {
    state.level = "Maitre";
    return;
  }
  if (state.score >= 70) {
    state.level = "Atelier Local";
    return;
  }
  state.level = "Apprenti";
}

function setSeverityBadge(severity) {
  ui.severity.classList.remove(
    "severity-neutral",
    "severity-good",
    "severity-medium",
    "severity-critical"
  );

  ui.severity.classList.add(`severity-${severity}`);
  ui.severity.textContent = SEVERITY_LABEL[severity] || SEVERITY_LABEL.neutral;
}

function appendHistory(entry) {
  state.history.unshift(entry);
  if (state.history.length > 14) {
    state.history.length = 14;
  }
}

function handlePartSelection(partKey) {
  const part = PARTS[partKey];
  if (!part) {
    return;
  }

  state.selectedPart = partKey;
  state.selectedSeverity = part.severity;

  appendHistory({
    type: "part",
    label: part.label,
    timestamp: new Date().toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }),
  });

  callLegacyHook("updateStats", {
    selectedPart: state.selectedPart,
    severity: state.selectedSeverity,
  });

  render();
}

function handleAction(actionLabel) {
  const selected = state.selectedPart ? PARTS[state.selectedPart] : null;
  if (!selected) {
    return;
  }

  const effect = SCORE_EFFECT[actionLabel] || { score: 0, reputation: 0 };
  state.score += effect.score;
  state.reputation = clamp(state.reputation + effect.reputation, 0, 100);
  setLevelFromScore();

  appendHistory({
    type: "action",
    label: actionLabel,
    part: selected.label,
    timestamp: new Date().toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" }),
  });

  callLegacyHook("applyRepair", {
    part: state.selectedPart,
    action: actionLabel,
    score: state.score,
    reputation: state.reputation,
  });

  render();
}

function resetUi() {
  state.selectedPart = null;
  state.selectedSeverity = "neutral";
  state.score = 0;
  state.reputation = 50;
  state.level = "Apprenti";
  state.history = [];
  state.day = 1;

  callLegacyHook("nextCustomer", { reset: true });
  callLegacyHook("updateStats", {
    selectedPart: null,
    severity: "neutral",
  });

  hideTooltip();
  render();
}

function renderHeader() {
  ui.dayChip.textContent = String(state.day);
  ui.reputationChip.textContent = String(state.reputation);
  ui.levelChip.textContent = state.level;
  ui.scoreChip.textContent = String(state.score);
}

function renderDiagnostic() {
  if (!state.selectedPart) {
    ui.selectedPartLabel.textContent = "-";
    ui.diagnosticText.textContent =
      "Selectionnez une partie de la chaussure pour analyser son etat.";
    setSeverityBadge("neutral");
    return;
  }

  const part = PARTS[state.selectedPart];
  ui.selectedPartLabel.textContent = part.label;
  ui.diagnosticText.textContent = part.diagnosis;
  setSeverityBadge(part.severity);
}

function renderActions() {
  ui.actionsList.innerHTML = "";

  if (!state.selectedPart) {
    const note = document.createElement("p");
    note.className = "empty-note";
    note.textContent = "Choisissez une zone du SVG pour afficher les actions pertinentes.";
    ui.actionsList.appendChild(note);
    return;
  }

  const actions = PARTS[state.selectedPart].actions;

  actions.forEach((actionLabel) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "action-btn";
    button.textContent = actionLabel;
    button.setAttribute("aria-label", `Appliquer l'action ${actionLabel}`);
    button.addEventListener("click", () => handleAction(actionLabel));

    ui.actionsList.appendChild(button);
  });
}

function renderHistory() {
  ui.historyList.innerHTML = "";

  if (!state.history.length) {
    const item = document.createElement("li");
    item.className = "empty-note";
    item.textContent = "Aucune interaction pour l'instant.";
    ui.historyList.appendChild(item);
    return;
  }

  state.history.forEach((entry) => {
    const item = document.createElement("li");

    if (entry.type === "part") {
      item.innerHTML = `<strong>${entry.timestamp}</strong> - Piece inspectee: ${entry.label}`;
    } else {
      item.innerHTML = `<strong>${entry.timestamp}</strong> - Action: ${entry.label} (${entry.part})`;
    }

    ui.historyList.appendChild(item);
  });
}

function renderSvgState() {
  ui.parts.forEach((partNode) => {
    const isActive = partNode.dataset.part === state.selectedPart;
    partNode.classList.toggle("is-active", isActive);
    partNode.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function render() {
  renderHeader();
  renderDiagnostic();
  renderActions();
  renderHistory();
  renderSvgState();
}

function showTooltip(event, label) {
  const shellRect = ui.svgShell.getBoundingClientRect();

  let x = 0;
  let y = 0;

  if (event instanceof MouseEvent) {
    x = event.clientX - shellRect.left + 12;
    y = event.clientY - shellRect.top - 8;
  } else {
    const rect = event.currentTarget.getBoundingClientRect();
    x = rect.left - shellRect.left + rect.width / 2;
    y = rect.top - shellRect.top - 8;
  }

  ui.tooltip.textContent = label;
  ui.tooltip.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  ui.tooltip.classList.add("show");
}

function hideTooltip() {
  ui.tooltip.classList.remove("show");
  ui.tooltip.style.transform = "translate3d(-999px, -999px, 0)";
}

function bindSvgParts() {
  ui.parts.forEach((partNode) => {
    const partKey = partNode.dataset.part;
    const label = PARTS[partKey]?.label || partKey;

    partNode.addEventListener("click", () => handlePartSelection(partKey));

    partNode.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handlePartSelection(partKey);
      }
    });

    partNode.addEventListener("mouseenter", (event) => showTooltip(event, label));
    partNode.addEventListener("mousemove", (event) => showTooltip(event, label));
    partNode.addEventListener("mouseleave", hideTooltip);
    partNode.addEventListener("focus", (event) => showTooltip(event, label));
    partNode.addEventListener("blur", hideTooltip);
  });
}

function init() {
  bindSvgParts();
  ui.resetBtn.addEventListener("click", resetUi);
  render();
}

init();
