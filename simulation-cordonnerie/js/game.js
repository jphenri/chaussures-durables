import {
  REPAIR_OPTIONS,
  createDayQueue,
  getDiagnosticZoneById,
  getDiagnosticZones,
  getRepairById,
  resolveZoneInspection,
} from "./levels.js";
import { createScoreSystem } from "./score.js";

const RESOURCE_KEYS = ["semelles", "fil", "cuir", "colle"];
const RESOURCE_LABELS = {
  semelles: "Semelles",
  fil: "Fil",
  cuir: "Cuir",
  colle: "Colle",
};

const ui = {
  dayValue: document.getElementById("day-value"),
  scoreValue: document.getElementById("score-value"),
  reputationValue: document.getElementById("reputation-value"),
  streakValue: document.getElementById("streak-value"),
  queueValue: document.getElementById("queue-value"),
  timerState: document.getElementById("timer-state"),
  timerToggle: document.getElementById("timer-toggle"),
  clientCard: document.getElementById("client-card"),
  startDayBtn: document.getElementById("start-day-btn"),
  diagnosticProgress: document.getElementById("diagnostic-progress"),
  diagnosticCanvas: document.getElementById("diagnostic-canvas"),
  zoneLegend: document.getElementById("zone-legend"),
  diagnosticFeedback: document.getElementById("diagnostic-feedback"),
  toRepairBtn: document.getElementById("to-repair-btn"),
  repairOptions: document.getElementById("repair-options"),
  inventoryGrid: document.getElementById("inventory-grid"),
  restockBtn: document.getElementById("restock-btn"),
  validateRepairBtn: document.getElementById("validate-repair-btn"),
  stitchingPanel: document.getElementById("stitching-panel"),
  stitchCanvas: document.getElementById("stitch-canvas"),
  stitchStats: document.getElementById("stitch-stats"),
  finishStitchBtn: document.getElementById("finish-stitch-btn"),
  resultBox: document.getElementById("result-box"),
  nextClientBtn: document.getElementById("next-client-btn"),
  timerValue: document.getElementById("timer-value"),
  eventLog: document.getElementById("event-log"),
  atelierCanvas: document.getElementById("atelier-canvas"),
};

class InventoryManager {
  constructor(initialStock = {}) {
    this.initialStock = {
      semelles: initialStock.semelles ?? 4,
      fil: initialStock.fil ?? 8,
      cuir: initialStock.cuir ?? 6,
      colle: initialStock.colle ?? 5,
    };

    this.stock = { ...this.initialStock };
  }

  getStockSnapshot() {
    return { ...this.stock };
  }

  canConsume(requirements = {}) {
    return Object.entries(requirements).every(([resource, amount]) => {
      const needed = Math.max(0, Number(amount) || 0);
      return (this.stock[resource] || 0) >= needed;
    });
  }

  consume(requirements = {}) {
    if (!this.canConsume(requirements)) {
      return false;
    }

    Object.entries(requirements).forEach(([resource, amount]) => {
      const used = Math.max(0, Number(amount) || 0);
      this.stock[resource] = Math.max(0, (this.stock[resource] || 0) - used);
    });

    return true;
  }

  restock(delta = {}) {
    RESOURCE_KEYS.forEach((resource) => {
      const add = Math.max(0, Math.round(delta[resource] || 0));
      this.stock[resource] = Math.max(0, (this.stock[resource] || 0) + add);
    });

    return this.getStockSnapshot();
  }

  getMissingResources(requirements = {}) {
    const missing = [];
    Object.entries(requirements).forEach(([resource, amount]) => {
      const needed = Math.max(0, Number(amount) || 0);
      const available = this.stock[resource] || 0;
      if (available < needed) {
        missing.push(`${RESOURCE_LABELS[resource] || resource} (${available}/${needed})`);
      }
    });
    return missing;
  }

  reset() {
    this.stock = { ...this.initialStock };
    return this.getStockSnapshot();
  }
}

class DiagnosticZoneBoard {
  constructor(canvas, zones) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.zones = zones;
  }

  eventToCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  getZoneAtPoint(point) {
    if (!point) {
      return null;
    }

    return (
      this.zones.find((zone) => {
        return (
          point.x >= zone.x &&
          point.x <= zone.x + zone.w &&
          point.y >= zone.y &&
          point.y <= zone.y + zone.h
        );
      }) || null
    );
  }

  getZoneAtEvent(event) {
    return this.getZoneAtPoint(this.eventToCanvasPoint(event));
  }

  draw({ active, inspectedZoneIds, hoveredZoneId }) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#fff9eb");
    bg.addColorStop(1, "#f2dec0");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Stylized shoe body used as diagnostic board.
    ctx.fillStyle = "#a47b4f";
    ctx.beginPath();
    ctx.moveTo(44, 152);
    ctx.bezierCurveTo(135, 45, 430, 24, 575, 87);
    ctx.bezierCurveTo(616, 108, 618, 146, 576, 160);
    ctx.lineTo(83, 168);
    ctx.bezierCurveTo(62, 168, 46, 162, 44, 152);
    ctx.fill();

    ctx.fillStyle = "#d4b48a";
    ctx.beginPath();
    ctx.moveTo(116, 144);
    ctx.bezierCurveTo(210, 82, 414, 71, 545, 110);
    ctx.lineTo(545, 138);
    ctx.lineTo(116, 144);
    ctx.fill();

    this.zones.forEach((zone) => {
      const inspected = inspectedZoneIds.includes(zone.id);
      const hovered = hoveredZoneId === zone.id;

      ctx.fillStyle = inspected ? "rgba(47, 107, 69, 0.24)" : "rgba(41, 34, 22, 0.1)";
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

      ctx.lineWidth = hovered ? 2.4 : 1.2;
      ctx.strokeStyle = hovered ? "#2f6b45" : "#7f6649";
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

      ctx.fillStyle = "#2d2117";
      ctx.font = "12px Trebuchet MS";
      ctx.fillText(zone.label, zone.x + 6, zone.y + 16);
    });

    if (!active) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#594934";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Diagnostic en attente d'un client", 190, 106);
    }
  }
}

class StitchPrecisionMiniGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.maxDurationMs = 17000;
    this.hitRadius = 16;
    this.reset();
  }

  reset() {
    this.active = false;
    this.completed = false;
    this.timeUp = false;
    this.attempts = 0;
    this.hits = 0;
    this.misses = 0;
    this.totalDistance = 0;
    this.elapsedMs = 0;
    this.currentIndex = 0;
    this.cursor = null;
    this.points = [];
    this.draw();
  }

  start() {
    this.active = true;
    this.completed = false;
    this.timeUp = false;
    this.attempts = 0;
    this.hits = 0;
    this.misses = 0;
    this.totalDistance = 0;
    this.elapsedMs = 0;
    this.currentIndex = 0;
    this.cursor = null;

    const yCurve = [95, 90, 88, 86, 88, 90, 95, 99];
    this.points = yCurve.map((y, index) => ({
      x: 54 + index * 58,
      y,
    }));

    this.draw();
    return this.getSnapshot();
  }

  eventToCanvasPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  handleMove(event) {
    this.cursor = this.eventToCanvasPoint(event);
    this.draw();
  }

  handleClick(event) {
    if (!this.active || this.completed || this.timeUp) {
      return this.getSnapshot();
    }

    const point = this.eventToCanvasPoint(event);
    if (!point) {
      return this.getSnapshot();
    }

    const target = this.points[this.currentIndex];
    const distance = Math.hypot(point.x - target.x, point.y - target.y);

    this.attempts += 1;

    if (distance <= this.hitRadius) {
      this.hits += 1;
      this.totalDistance += distance;
      this.currentIndex += 1;
      if (this.currentIndex >= this.points.length) {
        this.completed = true;
        this.active = false;
      }
    } else {
      this.misses += 1;
    }

    this.draw();
    return this.getSnapshot();
  }

  advance(ms, timerEnabled) {
    if (!this.active || this.completed || this.timeUp) {
      return this.getSnapshot();
    }

    this.elapsedMs += ms;

    if (timerEnabled && this.elapsedMs >= this.maxDurationMs) {
      this.timeUp = true;
      this.active = false;
    }

    return this.getSnapshot();
  }

  computeQuality() {
    const accuracy = this.hits / Math.max(1, this.attempts);
    const averageDistance = this.hits > 0 ? this.totalDistance / this.hits : this.hitRadius * 2;
    const precision = clamp(1 - averageDistance / this.hitRadius, 0, 1);
    return {
      accuracy,
      precision,
      quality: clamp(accuracy * 0.72 + precision * 0.28, 0, 1),
    };
  }

  finalizeResult() {
    const metrics = this.computeQuality();
    const perfect = this.completed && metrics.quality >= 0.88 && this.misses <= 1;

    return {
      attempts: this.attempts,
      hits: this.hits,
      misses: this.misses,
      completed: this.completed,
      timeUp: this.timeUp,
      quality: metrics.quality,
      accuracy: metrics.accuracy,
      precision: metrics.precision,
      perfect,
    };
  }

  getSnapshot() {
    return {
      active: this.active,
      completed: this.completed,
      timeUp: this.timeUp,
      currentIndex: this.currentIndex,
      totalTargets: this.points.length,
      attempts: this.attempts,
      hits: this.hits,
      misses: this.misses,
      elapsedMs: this.elapsedMs,
      remainingSeconds: Math.max(0, Math.ceil((this.maxDurationMs - this.elapsedMs) / 1000)),
      ...this.computeQuality(),
    };
  }

  draw() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#fff8ef");
    bg.addColorStop(1, "#f1e4d1");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    if (!this.points.length) {
      ctx.fillStyle = "#5e4d38";
      ctx.font = "15px Trebuchet MS";
      ctx.fillText("Mini-jeu couture pret", 180, 92);
      return;
    }

    ctx.strokeStyle = "#7e5e3d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    this.points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    this.points.forEach((point, index) => {
      const done = index < this.currentIndex;
      const active = index === this.currentIndex && this.active;
      ctx.beginPath();
      ctx.arc(point.x, point.y, this.hitRadius, 0, Math.PI * 2);
      ctx.fillStyle = done ? "#2f6b45" : active ? "#d69a3b" : "rgba(94, 77, 56, 0.18)";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#6f583b";
      ctx.stroke();
    });

    if (this.cursor) {
      ctx.strokeStyle = "rgba(31, 42, 34, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.cursor.x, this.cursor.y, 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    const snap = this.getSnapshot();
    ctx.fillStyle = "#2f2519";
    ctx.font = "13px Trebuchet MS";
    ctx.fillText(
      `Points: ${this.currentIndex}/${this.points.length} | Precision: ${Math.round(snap.quality * 100)}%`,
      14,
      22
    );

    if (this.timeUp) {
      ctx.fillStyle = "#8f2d2d";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Temps couture ecoule", 174, 160);
    }

    if (this.completed) {
      ctx.fillStyle = "#2f6b45";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Couture terminee", 198, 160);
    }
  }
}

const scoreSystem = createScoreSystem({
  score: 0,
  reputation: 50,
});

const inventory = new InventoryManager();
const diagnosticBoard = new DiagnosticZoneBoard(ui.diagnosticCanvas, getDiagnosticZones());
const stitchMiniGame = new StitchPrecisionMiniGame(ui.stitchCanvas);
const workshopCtx = ui.atelierCanvas.getContext("2d");

const state = {
  day: 1,
  mode: "idle",
  timerEnabled: true,
  clients: [],
  dayQueue: [],
  queueIndex: 0,
  currentScenario: null,
  hoveredZoneId: null,
  visualClockMs: 0,
  rafId: 0,
  previousTime: performance.now(),
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeText(text) {
  return String(text || "").replace(/[<>]/g, "");
}

function formatResourceSummary(resources = {}) {
  return RESOURCE_KEYS.filter((key) => Number(resources[key]) > 0)
    .map((key) => `${RESOURCE_LABELS[key]}:${resources[key]}`)
    .join(" | ");
}

function pushLog(message, tone = "") {
  const entry = document.createElement("li");
  entry.textContent = `J${state.day} - ${message}`;
  if (tone) {
    entry.classList.add(`status-${tone}`);
  }

  ui.eventLog.prepend(entry);

  while (ui.eventLog.children.length > 12) {
    ui.eventLog.removeChild(ui.eventLog.lastChild);
  }
}

function renderHud() {
  const scoreState = scoreSystem.getState();
  ui.dayValue.textContent = String(state.day);
  ui.scoreValue.textContent = String(scoreState.score);
  ui.reputationValue.textContent = String(scoreState.reputation);
  ui.streakValue.textContent = String(scoreState.streak);
  ui.timerState.textContent = state.timerEnabled ? "ON" : "OFF";
  ui.timerToggle.checked = state.timerEnabled;
}

function renderQueue() {
  const remaining = Math.max(0, state.dayQueue.length - state.queueIndex);
  ui.queueValue.textContent = `File: ${remaining}`;
}

function renderInventory() {
  const snapshot = inventory.getStockSnapshot();
  ui.inventoryGrid.innerHTML = "";

  RESOURCE_KEYS.forEach((resource) => {
    const amount = snapshot[resource] || 0;
    const item = document.createElement("article");
    item.className = "inventory-item";

    if (amount <= 0) {
      item.classList.add("empty");
    } else if (amount <= 1) {
      item.classList.add("low");
    }

    item.innerHTML = `
      <h4>${RESOURCE_LABELS[resource]}</h4>
      <p>${amount}</p>
    `;

    ui.inventoryGrid.appendChild(item);
  });
}

function setClientWaitingState(message) {
  ui.clientCard.classList.add("empty-state");
  ui.clientCard.innerHTML = `<p>${safeText(message)}</p>`;
}

function renderCurrentClientCard() {
  const scenario = state.currentScenario;

  if (!scenario) {
    setClientWaitingState(
      "Aucun client en cours. Lancez une nouvelle journee pour continuer."
    );
    return;
  }

  const selectedZoneLabel = scenario.selectedZoneId
    ? getDiagnosticZoneById(scenario.selectedZoneId)?.label || "Inconnue"
    : "Aucune";

  ui.clientCard.classList.remove("empty-state");
  ui.clientCard.innerHTML = `
    <h3>${safeText(scenario.client.name)} - ${safeText(scenario.client.shoeType)}</h3>
    <p><strong>Profil:</strong> ${safeText(scenario.client.profile)}</p>
    <p><strong>Urgence:</strong> ${safeText(scenario.client.urgency)}</p>
    <p><strong>Demande:</strong> ${safeText(scenario.client.quote)}</p>
    <p><strong>Symptome:</strong> ${safeText(scenario.problem.symptom)}</p>
    <p><strong>Zone suspecte:</strong> ${safeText(selectedZoneLabel)}</p>
  `;
}

function renderDiagnosticProgress() {
  const scenario = state.currentScenario;
  if (!scenario) {
    ui.diagnosticProgress.textContent = "Indices: 0 / 2";
    return;
  }

  const zoneLabel = scenario.selectedZoneId
    ? getDiagnosticZoneById(scenario.selectedZoneId)?.label || "Inconnue"
    : "Aucune";

  ui.diagnosticProgress.textContent = `Indices: ${scenario.discoveredClues.length} / ${scenario.problem.requiredClues} | Zone: ${zoneLabel}`;
}

function renderZoneLegend() {
  const scenario = state.currentScenario;
  const inspectedZoneIds = scenario?.inspectedZoneIds || [];
  ui.zoneLegend.innerHTML = "";

  diagnosticBoard.zones.forEach((zone) => {
    const pill = document.createElement("span");
    pill.className = "zone-pill";
    pill.textContent = zone.label;

    if (inspectedZoneIds.includes(zone.id)) {
      pill.classList.add("active");
    }

    if (state.hoveredZoneId === zone.id) {
      pill.classList.add("hovered");
    }

    ui.zoneLegend.appendChild(pill);
  });
}

function renderRepairButtons() {
  const scenario = state.currentScenario;
  ui.repairOptions.innerHTML = "";

  REPAIR_OPTIONS.forEach((repair) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn choice-btn";
    button.dataset.repairId = repair.id;

    const stockOk = inventory.canConsume(repair.resources);
    const baseLabel = `${repair.label} (${repair.timeCost} min)`;
    const resourceLabel = formatResourceSummary(repair.resources);
    button.textContent = stockOk
      ? `${baseLabel} | ${resourceLabel}`
      : `${baseLabel} | Stock insuffisant`;

    button.title = `${repair.description} - ${resourceLabel}`;

    if (scenario && scenario.selectedRepairId === repair.id) {
      button.classList.add("active");
    }

    button.disabled = !scenario || state.mode !== "repair" || !stockOk;

    ui.repairOptions.appendChild(button);
  });

  const selectedRepair = scenario ? getRepairById(scenario.selectedRepairId) : null;
  const selectedInStock = selectedRepair
    ? inventory.canConsume(selectedRepair.resources)
    : false;

  ui.validateRepairBtn.disabled = !(
    scenario && state.mode === "repair" && selectedRepair && selectedInStock
  );
}

function renderStitchStats() {
  const snap = stitchMiniGame.getSnapshot();
  const quality = Math.round(snap.quality * 100);

  ui.stitchStats.textContent = `Precision: ${quality}% | Hits: ${snap.hits}/${Math.max(
    1,
    snap.attempts
  )} | Restant: ${snap.remainingSeconds}s`;

  ui.finishStitchBtn.disabled = !(
    state.mode === "stitching" && (snap.completed || snap.timeUp)
  );
}

function showStitchingPanel(visible) {
  ui.stitchingPanel.classList.toggle("hidden", !visible);
}

function resetPanelsForNewClient() {
  ui.diagnosticFeedback.textContent = "";
  ui.resultBox.textContent = "";
  ui.resultBox.classList.remove("success", "fail");
  ui.toRepairBtn.disabled = true;
  ui.nextClientBtn.disabled = true;
  ui.nextClientBtn.textContent = "Client suivant";

  stitchMiniGame.reset();
  renderStitchStats();
  showStitchingPanel(false);
}

function updateTimerBadge() {
  const scenario = state.currentScenario;
  if (!scenario) {
    ui.timerValue.textContent = "Temps: 0s";
    ui.timerValue.classList.remove("status-warn", "status-danger");
    return;
  }

  ui.timerValue.classList.remove("status-warn", "status-danger");

  if (!state.timerEnabled) {
    ui.timerValue.textContent = "Temps: OFF";
    return;
  }

  const elapsedSeconds = Math.floor(scenario.elapsedMs / 1000);
  const remaining = Math.max(0, scenario.timeLimit - elapsedSeconds);

  ui.timerValue.textContent = `Temps: ${remaining}s`;

  if (remaining <= 18 && remaining > 8) {
    ui.timerValue.classList.add("status-warn");
  }
  if (remaining <= 8) {
    ui.timerValue.classList.add("status-danger");
  }
}

function canMoveToRepair(scenario) {
  if (!scenario) {
    return false;
  }

  const foundCoreZone = scenario.selectedZoneId === scenario.problem.correctZoneId;
  const enoughClues = scenario.discoveredClues.length >= scenario.problem.requiredClues;
  const enoughExploration = scenario.inspectedZoneIds.length >= 4;

  return foundCoreZone || enoughClues || enoughExploration;
}

function renderControlsState() {
  const scenario = state.currentScenario;
  ui.startDayBtn.disabled = state.mode !== "idle";
  ui.toRepairBtn.disabled = !(state.mode === "diagnostic" && canMoveToRepair(scenario));
  ui.nextClientBtn.disabled = !(state.mode === "result" || state.mode === "gameover");

  renderRepairButtons();
  renderStitchStats();
}

function setMode(nextMode) {
  state.mode = nextMode;
  renderControlsState();
}

function showScenario(index) {
  if (index >= state.dayQueue.length) {
    state.currentScenario = null;
    state.hoveredZoneId = null;
    setMode("idle");
    state.day += 1;

    ui.startDayBtn.textContent = `Demarrer le jour ${state.day}`;
    ui.diagnosticFeedback.textContent = "";
    ui.resultBox.classList.remove("success", "fail");
    ui.resultBox.textContent =
      "Journee terminee. Relisez les conseils avant de reprendre.";

    renderHud();
    renderQueue();
    renderInventory();
    renderDiagnosticProgress();
    renderZoneLegend();
    updateTimerBadge();
    setClientWaitingState(`Journee terminee. Pret pour le jour ${state.day}.`);

    pushLog("Journee terminee. L'atelier prepare la suite.");
    return;
  }

  state.queueIndex = index;
  state.currentScenario = state.dayQueue[index];

  state.currentScenario.elapsedMs = 0;
  state.currentScenario.inspectedZoneIds = [];
  state.currentScenario.discoveredClues = [];
  state.currentScenario.selectedZoneId = null;
  state.currentScenario.selectedRepairId = null;
  state.currentScenario.stitchResult = null;

  state.hoveredZoneId = null;

  resetPanelsForNewClient();
  renderCurrentClientCard();
  renderDiagnosticProgress();
  renderZoneLegend();
  renderQueue();
  updateTimerBadge();

  setMode("diagnostic");
  pushLog(`Nouveau client: ${state.currentScenario.client.name}.`);
}

function startDay() {
  if (!state.clients.length) {
    pushLog("Impossible de demarrer: la base clients est vide.", "danger");
    return;
  }

  // Light daily refill so inventory remains part of the strategy.
  inventory.restock({ semelles: 1, fil: 1, cuir: 1, colle: 1 });

  state.dayQueue = createDayQueue(state.clients, state.day);
  state.queueIndex = 0;

  if (!state.dayQueue.length) {
    pushLog("Aucun scenario genere pour cette journee.", "danger");
    return;
  }

  ui.startDayBtn.textContent = "Journee en cours";
  renderInventory();
  pushLog("Reassort quotidien effectue (+1 par ressource).", "warn");
  showScenario(0);
}

function inspectZone(zoneId) {
  const scenario = state.currentScenario;

  if (!scenario || state.mode !== "diagnostic") {
    return;
  }

  if (scenario.inspectedZoneIds.includes(zoneId)) {
    ui.diagnosticFeedback.textContent = "Cette zone a deja ete inspectee.";
    return;
  }

  scenario.inspectedZoneIds.push(zoneId);

  const answer = resolveZoneInspection(scenario.problem, zoneId);
  ui.diagnosticFeedback.textContent = answer.text;

  if (answer.useful && !scenario.discoveredClues.includes(answer.text)) {
    scenario.discoveredClues.push(answer.text);
  }

  if (answer.primaryMatch) {
    scenario.selectedZoneId = zoneId;
  }

  renderCurrentClientCard();
  renderDiagnosticProgress();
  renderZoneLegend();
  renderControlsState();

  if (answer.primaryMatch) {
    pushLog("Zone critique du diagnostic identifiee.");
  } else if (answer.useful) {
    pushLog("Indice secondaire trouve lors du diagnostic.");
  } else {
    pushLog("Zone analysee, sans indice decisif.");
  }
}

function moveToRepair() {
  if (!state.currentScenario || state.mode !== "diagnostic") {
    return;
  }

  setMode("repair");
  ui.diagnosticFeedback.textContent =
    "Diagnostic clos. Choisissez l'intervention adaptee a la panne.";

  pushLog("Passage en zone reparation.");
}

function selectRepair(repairId) {
  const scenario = state.currentScenario;
  if (!scenario || state.mode !== "repair") {
    return;
  }

  scenario.selectedRepairId = repairId;
  const repair = getRepairById(repairId);

  if (repair?.requiresMiniGame) {
    ui.resultBox.classList.remove("success", "fail");
    ui.resultBox.textContent =
      "Cette intervention inclut un mini-jeu couture de precision souris.";
  }

  renderRepairButtons();
}

function renderOutcome(outcome, scenario, repair, options = {}) {
  const { timedOut = false, stitchResult = null } = options;

  ui.resultBox.classList.remove("success", "fail");

  const expectedRepair = getRepairById(scenario.problem.correctRepair);
  let message = "";

  if (timedOut) {
    ui.resultBox.classList.add("fail");
    message = `Temps ecoule. Score ${outcome.deltaScore}, reputation ${outcome.reputationDelta}. Reparation attendue: ${expectedRepair?.label || "inconnue"}.`;
  } else if (outcome.success) {
    ui.resultBox.classList.add("success");

    const perfectChunk = outcome.perfectBonus
      ? ` Reparation parfaite: +${outcome.perfectBonus} points.`
      : "";

    const stitchChunk = stitchResult
      ? ` Precision couture: ${Math.round(stitchResult.quality * 100)}%.`
      : "";

    message = `Succes. ${repair?.label || "Intervention"} validee. +${outcome.deltaScore} points, reputation ${outcome.reputationDelta >= 0 ? "+" : ""}${outcome.reputationDelta}.${perfectChunk}${stitchChunk} Conseil: ${scenario.problem.tip}`;
  } else {
    ui.resultBox.classList.add("fail");
    message = `Mauvais diagnostic. ${repair?.label || "Intervention"} n'etait pas adaptee. ${outcome.deltaScore} points, reputation ${outcome.reputationDelta} (regle -10). Reparation correcte: ${expectedRepair?.label || "inconnue"}.`;
  }

  ui.resultBox.textContent = message;
}

function completeRepairValidation(selectedRepair, stitchResult = null) {
  const scenario = state.currentScenario;
  if (!scenario) {
    return;
  }

  if (!inventory.consume(selectedRepair.resources)) {
    const missing = inventory.getMissingResources(selectedRepair.resources);
    ui.resultBox.classList.remove("success");
    ui.resultBox.classList.add("fail");
    ui.resultBox.textContent = `Stock vide ou insuffisant: reparation impossible (${missing.join(", " )}).`;
    pushLog("Reparation bloquee: stock insuffisant.", "danger");
    renderRepairButtons();
    return;
  }

  renderInventory();

  const success = scenario.selectedRepairId === scenario.problem.correctRepair;
  const elapsedSeconds = state.timerEnabled ? Math.floor(scenario.elapsedMs / 1000) : 0;
  const timeSpent = elapsedSeconds + (selectedRepair?.timeCost || 10);

  let outcome;

  if (success) {
    const perfectRepair = Boolean(stitchResult?.perfect);

    outcome = scoreSystem.applySuccessfulRepair({
      baseScore: scenario.problem.baseScore,
      timeSpent,
      timeLimit: scenario.timeLimit,
      cluesFound: scenario.discoveredClues.length,
      cluesRequired: scenario.problem.requiredClues,
      perfectRepair,
    });

    if (scenario.discoveredClues.length >= scenario.problem.requiredClues) {
      scoreSystem.addEducationalBonus(8);
      pushLog("Bonus pedagogique accorde pour diagnostic complet.");
    }

    if (perfectRepair) {
      pushLog("Reparation parfaite: bonus de precision applique.");
    }
  } else {
    // Explicit business rule: wrong diagnostic => -10 reputation.
    outcome = scoreSystem.applyWrongDiagnostic({
      baseScore: scenario.problem.baseScore,
    });
  }

  renderOutcome(outcome, scenario, selectedRepair, { stitchResult });
  renderHud();

  if (scoreSystem.getState().reputation <= 0) {
    setMode("gameover");
    ui.nextClientBtn.disabled = false;
    ui.nextClientBtn.textContent = "Recommencer";
    pushLog("Reputation a zero: fermeture temporaire de l'atelier.", "danger");
    return;
  }

  setMode("result");
  ui.nextClientBtn.disabled = false;

  if (outcome.success) {
    pushLog("Client satisfait, reputation en hausse.");
  } else {
    pushLog("Client mecontent: diagnostic incorrect.", "warn");
  }
}

function startStitchMiniGame() {
  if (!state.currentScenario || state.mode !== "repair") {
    return;
  }

  stitchMiniGame.start();
  showStitchingPanel(true);
  setMode("stitching");
  renderStitchStats();

  ui.resultBox.classList.remove("success", "fail");
  ui.resultBox.textContent =
    "Mini-jeu couture lance. Cliquez chaque repere avec precision.";

  pushLog("Mini-jeu couture en cours.");
}

function finishStitchMiniGame() {
  if (!state.currentScenario || state.mode !== "stitching") {
    return;
  }

  const selectedRepair = getRepairById(state.currentScenario.selectedRepairId);
  if (!selectedRepair) {
    return;
  }

  const stitchResult = stitchMiniGame.finalizeResult();
  state.currentScenario.stitchResult = stitchResult;

  showStitchingPanel(false);
  setMode("repair");

  completeRepairValidation(selectedRepair, stitchResult);
}

function validateRepair() {
  const scenario = state.currentScenario;
  if (!scenario || state.mode !== "repair") {
    return;
  }

  const selectedRepair = getRepairById(scenario.selectedRepairId);
  if (!selectedRepair) {
    ui.resultBox.classList.remove("success", "fail");
    ui.resultBox.textContent = "Selectionnez une reparation avant validation.";
    return;
  }

  if (!inventory.canConsume(selectedRepair.resources)) {
    const missing = inventory.getMissingResources(selectedRepair.resources);
    ui.resultBox.classList.remove("success");
    ui.resultBox.classList.add("fail");
    ui.resultBox.textContent = `Stock vide ou insuffisant: reparation impossible (${missing.join(", " )}).`;
    pushLog("Reparation impossible: inventaire insuffisant.", "danger");
    return;
  }

  if (selectedRepair.requiresMiniGame) {
    startStitchMiniGame();
    return;
  }

  completeRepairValidation(selectedRepair, null);
}

function applyTimeoutOutcome() {
  if (!state.currentScenario) {
    return;
  }

  const outcome = scoreSystem.applyTimeoutPenalty();

  showStitchingPanel(false);
  stitchMiniGame.reset();

  renderOutcome(outcome, state.currentScenario, null, { timedOut: true });
  renderHud();

  if (scoreSystem.getState().reputation <= 0) {
    setMode("gameover");
    ui.nextClientBtn.disabled = false;
    ui.nextClientBtn.textContent = "Recommencer";
    pushLog("Reputation epuisee apres depassement du temps.", "danger");
    return;
  }

  setMode("result");
  ui.nextClientBtn.disabled = false;
  pushLog("Temps depasse: client perdu.", "warn");
}

function manualRestock() {
  inventory.restock({ semelles: 1, fil: 1, cuir: 1, colle: 1 });
  renderInventory();
  renderRepairButtons();
  pushLog("Reassort manuel effectue (+1).", "warn");
}

function nextClient() {
  if (state.mode === "gameover") {
    scoreSystem.reset({ score: 0, reputation: 50, streak: 0 });
    inventory.reset();

    state.day = 1;
    state.dayQueue = [];
    state.queueIndex = 0;
    state.currentScenario = null;
    state.hoveredZoneId = null;

    ui.startDayBtn.textContent = "Demarrer la journee";
    ui.nextClientBtn.textContent = "Client suivant";
    ui.nextClientBtn.disabled = true;
    ui.resultBox.textContent = "";
    ui.diagnosticFeedback.textContent = "";

    showStitchingPanel(false);
    stitchMiniGame.reset();

    setMode("idle");
    renderHud();
    renderQueue();
    renderInventory();
    renderDiagnosticProgress();
    renderZoneLegend();
    updateTimerBadge();
    setClientWaitingState(
      "Atelier reouvert. Cliquez sur Demarrer la journee pour reprendre."
    );

    pushLog("Nouvelle partie lancee apres fermeture temporaire.");
    return;
  }

  if (state.mode !== "result") {
    return;
  }

  showScenario(state.queueIndex + 1);
}

function tick(seconds) {
  state.visualClockMs += seconds * 1000;

  const scenarioIsActive =
    state.currentScenario &&
    (state.mode === "diagnostic" || state.mode === "repair" || state.mode === "stitching");

  if (!scenarioIsActive) {
    return;
  }

  const elapsedDeltaMs = seconds * 1000;
  state.currentScenario.elapsedMs += elapsedDeltaMs;

  if (state.mode === "stitching") {
    stitchMiniGame.advance(elapsedDeltaMs, state.timerEnabled);
    renderStitchStats();
  }

  updateTimerBadge();

  if (
    state.timerEnabled &&
    state.currentScenario.elapsedMs >= state.currentScenario.timeLimit * 1000 &&
    state.mode !== "result" &&
    state.mode !== "gameover"
  ) {
    applyTimeoutOutcome();
  }
}

function drawWorkshop() {
  const ctx = workshopCtx;
  const width = ui.atelierCanvas.width;
  const height = ui.atelierCanvas.height;

  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#f9e5bf");
  bg.addColorStop(1, "#d0a674");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#7d5f3b";
  ctx.fillRect(0, height - 46, width, 46);

  ctx.fillStyle = "#5f3f27";
  ctx.fillRect(85, 108, 285, 16);
  ctx.fillRect(95, 124, 12, 46);
  ctx.fillRect(348, 124, 12, 46);

  ctx.fillStyle = "#8f6b44";
  ctx.fillRect(520, 58, 250, 10);
  ctx.fillRect(520, 92, 250, 10);

  ctx.fillStyle = "#c49350";
  ctx.fillRect(540, 38, 52, 20);
  ctx.fillRect(614, 38, 52, 20);
  ctx.fillRect(688, 38, 52, 20);
  ctx.fillRect(560, 72, 60, 20);
  ctx.fillRect(640, 72, 72, 20);

  const waitingClient = Boolean(
    state.currentScenario && (state.mode === "diagnostic" || state.mode === "repair")
  );

  const blink = Math.floor(state.visualClockMs / 360) % 2 === 0;

  ctx.fillStyle = waitingClient && blink ? "#2f6b45" : "#3f3428";
  ctx.beginPath();
  ctx.ellipse(260, 100, 52, 20, -0.16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#1f2a22";
  ctx.font = "bold 19px Trebuchet MS";
  ctx.fillText(`Mode: ${state.mode}`, 25, 33);

  const reputation = scoreSystem.getState().reputation;
  const repWidth = Math.round((Math.max(0, reputation) / 100) * 180);

  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.fillRect(24, 44, 180, 16);
  ctx.fillStyle = reputation > 35 ? "#2f6b45" : "#8f2d2d";
  ctx.fillRect(24, 44, repWidth, 16);
  ctx.strokeStyle = "#58462f";
  ctx.strokeRect(24, 44, 180, 16);

  ctx.fillStyle = "#1f2a22";
  ctx.font = "14px Trebuchet MS";
  ctx.fillText(`Timer: ${state.timerEnabled ? "ON" : "OFF"}`, 220, 57);

  if (state.currentScenario) {
    const elapsed = Math.floor(state.currentScenario.elapsedMs / 1000);
    const timeText = `Chrono client: ${elapsed}s / ${state.currentScenario.timeLimit}s`;
    ctx.fillStyle = "#1f2a22";
    ctx.font = "15px Trebuchet MS";
    ctx.fillText(timeText, 25, 86);
  }
}

function drawBoards() {
  diagnosticBoard.draw({
    active: Boolean(state.currentScenario && state.mode === "diagnostic"),
    inspectedZoneIds: state.currentScenario?.inspectedZoneIds || [],
    hoveredZoneId: state.hoveredZoneId,
  });

  if (state.mode === "stitching") {
    stitchMiniGame.draw();
  }
}

function frame(time) {
  const deltaSeconds = Math.min(0.1, (time - state.previousTime) / 1000);
  state.previousTime = time;

  tick(deltaSeconds);
  drawWorkshop();
  drawBoards();

  state.rafId = window.requestAnimationFrame(frame);
}

function installHooksForTesting() {
  window.render_game_to_text = () => {
    const scenario = state.currentScenario;
    const payload = {
      coordinateSystem: {
        workshopCanvas: "origin top-left, x right, y down",
        diagnosticCanvas: "origin top-left, x right, y down",
        stitchCanvas: "origin top-left, x right, y down",
      },
      mode: state.mode,
      day: state.day,
      timerEnabled: state.timerEnabled,
      queue: {
        currentIndex: state.queueIndex,
        total: state.dayQueue.length,
      },
      inventory: inventory.getStockSnapshot(),
      currentClient: scenario
        ? {
            name: scenario.client.name,
            shoeType: scenario.client.shoeType,
            issue: scenario.problem.title,
            elapsedSeconds: Math.floor(scenario.elapsedMs / 1000),
            timeLimitSeconds: scenario.timeLimit,
            inspectedZoneIds: [...scenario.inspectedZoneIds],
            selectedZoneId: scenario.selectedZoneId,
            cluesFound: scenario.discoveredClues.length,
            selectedRepairId: scenario.selectedRepairId,
            stitchResult: scenario.stitchResult,
          }
        : null,
      stitching: stitchMiniGame.getSnapshot(),
      score: scoreSystem.getState(),
    };

    return JSON.stringify(payload);
  };

  window.advanceTime = (ms) => {
    const frameMs = 1000 / 60;
    const steps = Math.max(1, Math.round(ms / frameMs));

    for (let i = 0; i < steps; i += 1) {
      tick(frameMs / 1000);
    }

    drawWorkshop();
    drawBoards();
  };
}

async function loadClients() {
  try {
    const dataUrl = new URL("../data/clients.json", import.meta.url);
    const response = await fetch(dataUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    state.clients = Array.isArray(payload.clients) ? payload.clients : [];

    if (state.clients.length === 0) {
      throw new Error("liste clients vide");
    }

    pushLog(`${state.clients.length} fiches clients chargees.`);
  } catch (error) {
    pushLog(
      `Echec du chargement des clients (${safeText(error.message)}). Lancez via un serveur local ou GitHub Pages.`,
      "danger"
    );
  }
}

function bindUiEvents() {
  ui.startDayBtn.addEventListener("click", startDay);
  ui.toRepairBtn.addEventListener("click", moveToRepair);
  ui.validateRepairBtn.addEventListener("click", validateRepair);
  ui.nextClientBtn.addEventListener("click", nextClient);
  ui.restockBtn.addEventListener("click", manualRestock);
  ui.finishStitchBtn.addEventListener("click", finishStitchMiniGame);

  ui.timerToggle.addEventListener("change", () => {
    state.timerEnabled = Boolean(ui.timerToggle.checked);
    renderHud();
    updateTimerBadge();
    pushLog(`Timer ${state.timerEnabled ? "active" : "desactive"}.`, "warn");
  });

  ui.repairOptions.addEventListener("click", (event) => {
    const target = event.target.closest("button[data-repair-id]");
    if (!target) {
      return;
    }

    selectRepair(target.dataset.repairId);
  });

  ui.diagnosticCanvas.addEventListener("mousemove", (event) => {
    const zone = diagnosticBoard.getZoneAtEvent(event);
    state.hoveredZoneId = zone?.id || null;
    renderZoneLegend();
    drawBoards();
  });

  ui.diagnosticCanvas.addEventListener("mouseleave", () => {
    state.hoveredZoneId = null;
    renderZoneLegend();
    drawBoards();
  });

  ui.diagnosticCanvas.addEventListener("click", (event) => {
    if (state.mode !== "diagnostic") {
      return;
    }

    const zone = diagnosticBoard.getZoneAtEvent(event);
    if (!zone) {
      ui.diagnosticFeedback.textContent = "Cliquez sur une zone coloree de la chaussure.";
      return;
    }

    inspectZone(zone.id);
  });

  ui.stitchCanvas.addEventListener("mousemove", (event) => {
    if (state.mode !== "stitching") {
      return;
    }

    stitchMiniGame.handleMove(event);
  });

  ui.stitchCanvas.addEventListener("click", (event) => {
    if (state.mode !== "stitching") {
      return;
    }

    stitchMiniGame.handleClick(event);
    renderStitchStats();
  });
}

function init() {
  bindUiEvents();
  installHooksForTesting();

  setClientWaitingState(
    "Cliquez sur Demarrer la journee pour accueillir le premier client."
  );

  renderHud();
  renderQueue();
  renderInventory();
  renderDiagnosticProgress();
  renderZoneLegend();
  renderStitchStats();
  updateTimerBadge();

  setMode("idle");

  loadClients();
  drawWorkshop();
  drawBoards();

  if (state.rafId) {
    window.cancelAnimationFrame(state.rafId);
  }

  state.previousTime = performance.now();
  state.rafId = window.requestAnimationFrame(frame);
}

init();
