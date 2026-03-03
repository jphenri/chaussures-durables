import {
  REPAIR_OPTIONS,
  createDayQueue,
  getDiagnosticZoneById,
  getDiagnosticZones,
  getLevelByXp,
  getRepairById,
  resolveZoneInspection,
} from "./levels.js";
import { Player } from "./score.js";

const RESOURCE_KEYS = ["semelles", "fil", "cuir", "colle"];
const RESOURCE_LABELS = {
  semelles: "Semelles",
  fil: "Fil",
  cuir: "Cuir",
  colle: "Colle",
};

const ui = {
  levelName: document.getElementById("level-name"),
  dayValue: document.getElementById("day-value"),
  scoreValue: document.getElementById("score-value"),
  reputationValue: document.getElementById("reputation-value"),
  reputationMeter: document.getElementById("reputation-meter"),
  reputationMeterFill: document.getElementById("reputation-meter-fill"),
  streakValue: document.getElementById("streak-value"),
  xpValue: document.getElementById("xp-value"),
  xpFill: document.getElementById("xp-fill"),
  xpNextLabel: document.getElementById("xp-next-label"),
  queueValue: document.getElementById("queue-value"),
  activeClients: document.getElementById("active-clients"),
  missionDialogueBox: document.getElementById("mission-dialogue-box"),
  missionDialogueText: document.getElementById("mission-dialogue-text"),
  acceptMissionBtn: document.getElementById("accept-mission-btn"),
  contrastToggle: document.getElementById("contrast-toggle"),
  clientCard: document.getElementById("client-card"),
  startDayBtn: document.getElementById("start-day-btn"),
  resetGameBtn: document.getElementById("reset-game-btn"),
  diagnosticProgress: document.getElementById("diagnostic-progress"),
  diagnosticCanvas: document.getElementById("diagnostic-canvas"),
  zoneLegend: document.getElementById("zone-legend"),
  tutorialBox: document.getElementById("tutorial-box"),
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

  reset() {
    this.stock = { ...this.initialStock };
    return this.getStockSnapshot();
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

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#f7efdf");
    bg.addColorStop(1, "#e8d3b1");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Light grid reference to make the diagnostic board look technical.
    ctx.strokeStyle = "rgba(103, 79, 56, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 26) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.fillStyle = "#8e6641";
    ctx.beginPath();
    ctx.moveTo(40, 156);
    ctx.bezierCurveTo(130, 45, 440, 18, 589, 84);
    ctx.bezierCurveTo(629, 106, 630, 148, 585, 166);
    ctx.lineTo(78, 173);
    ctx.bezierCurveTo(58, 173, 42, 166, 40, 156);
    ctx.fill();

    ctx.fillStyle = "#d9bf9d";
    ctx.beginPath();
    ctx.moveTo(112, 147);
    ctx.bezierCurveTo(206, 81, 424, 66, 563, 109);
    ctx.lineTo(563, 143);
    ctx.lineTo(112, 147);
    ctx.fill();

    ctx.fillStyle = "rgba(60, 42, 25, 0.22)";
    ctx.fillRect(102, 146, 462, 8);

    this.zones.forEach((zone) => {
      const inspected = inspectedZoneIds.includes(zone.id);
      const hovered = hoveredZoneId === zone.id;

      ctx.fillStyle = inspected ? "rgba(41, 107, 64, 0.32)" : "rgba(48, 36, 24, 0.12)";
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

      ctx.lineWidth = hovered ? 2.8 : 1.3;
      ctx.strokeStyle = hovered ? "#1f6a45" : "#6f573c";
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

      ctx.fillStyle = hovered ? "#1f6a45" : "#4e3926";
      ctx.font = "12px Trebuchet MS";
      ctx.fillText(zone.label, zone.x + 6, zone.y + 16);
    });

    if (!active) {
      ctx.fillStyle = "rgba(35, 26, 18, 0.34)";
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(255, 241, 217, 0.7)";
      ctx.setLineDash([8, 6]);
      ctx.strokeRect(122, 74, 402, 60);
      ctx.setLineDash([]);

      ctx.fillStyle = "#fff3dd";
      ctx.font = "bold 16px Trebuchet MS";
      ctx.fillText("Diagnostic en attente", 242, 107);
      ctx.font = "13px Trebuchet MS";
      ctx.fillText("Acceptez une mission pour lancer l'analyse", 193, 126);
    }
  }
}

class StitchPrecisionMiniGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.maxDurationMs = 16000;
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

    const yCurve = [95, 91, 88, 86, 88, 91, 95, 99];
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

    if (timerEnabled) {
      this.elapsedMs += ms;
      if (this.elapsedMs >= this.maxDurationMs) {
        this.timeUp = true;
        this.active = false;
      }
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
  }
}

class Game {
  constructor(uiRefs) {
    this.ui = uiRefs;
    this.player = new Player({
      score: 0,
      reputation: 50,
      xp: 0,
      streak: 0,
    });

    this.level = getLevelByXp(0);
    this.inventory = new InventoryManager();
    this.diagnosticBoard = new DiagnosticZoneBoard(
      this.ui.diagnosticCanvas,
      getDiagnosticZones()
    );
    this.stitchMiniGame = new StitchPrecisionMiniGame(this.ui.stitchCanvas);
    this.workshopCtx = this.ui.atelierCanvas.getContext("2d");

    this.day = 1;
    this.clients = [];
    this.waitingQueue = [];
    this.activeScenarios = [];
    this.selectedScenarioId = null;
    this.stitchScenarioId = null;
    this.hoveredZoneId = null;
    this.dayRunning = false;
    this.gameOver = false;

    this.visualClockMs = 0;
    this.previousTime = performance.now();
    this.rafId = 0;
  }

  getSelectedScenario() {
    if (!this.selectedScenarioId) {
      return null;
    }

    return this.activeScenarios.find((scenario) => scenario.id === this.selectedScenarioId) || null;
  }

  getCurrentMode() {
    if (this.gameOver) {
      return "gameover";
    }

    if (!this.dayRunning) {
      return "idle";
    }

    const scenario = this.getSelectedScenario();
    return scenario?.phase || "idle";
  }

  pushLog(message, tone = "") {
    const entry = document.createElement("li");
    entry.textContent = `J${this.day} - ${message}`;
    if (tone) {
      entry.classList.add(`status-${tone}`);
    }

    this.ui.eventLog.prepend(entry);

    while (this.ui.eventLog.children.length > 12) {
      this.ui.eventLog.removeChild(this.ui.eventLog.lastChild);
    }
  }

  setHighContrast(enabled) {
    document.body.classList.toggle("high-contrast", Boolean(enabled));

    if (this.ui.contrastToggle) {
      this.ui.contrastToggle.checked = Boolean(enabled);
      this.ui.contrastToggle.setAttribute("aria-checked", enabled ? "true" : "false");
    }
  }

  async loadClients() {
    try {
      const dataUrl = new URL("../data/clients.json", import.meta.url);
      const response = await fetch(dataUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      this.clients = Array.isArray(payload.clients) ? payload.clients : [];

      if (!this.clients.length) {
        throw new Error("liste clients vide");
      }

      this.pushLog(`${this.clients.length} fiches clients chargees.`);
    } catch (error) {
      this.pushLog(
        `Echec du chargement clients (${safeText(error.message)}). Lancez via un serveur local ou GitHub Pages.`,
        "danger"
      );
    }
  }

  setClientWaitingState(message) {
    this.ui.clientCard.classList.add("empty-state");
    this.ui.clientCard.innerHTML = `<p>${safeText(message)}</p>`;
  }

  initScenarioForPlay(scenario) {
    scenario.phase = "briefing";
    scenario.finished = false;
    scenario.inspectedZoneIds = [];
    scenario.discoveredClues = [];
    scenario.selectedZoneId = null;
    scenario.selectedRepairId = null;
    scenario.stitchResult = null;
    scenario.elapsedMs = 0;
    scenario.resultText = "";
    scenario.resultTone = "";
    return scenario;
  }

  fillActiveSlots() {
    while (
      this.activeScenarios.length < this.level.maxConcurrentClients &&
      this.waitingQueue.length > 0
    ) {
      const scenario = this.initScenarioForPlay(this.waitingQueue.shift());
      this.activeScenarios.push(scenario);
    }

    if (!this.selectedScenarioId && this.activeScenarios.length > 0) {
      this.selectedScenarioId = this.activeScenarios[0].id;
    }

    const selected = this.getSelectedScenario();
    if (!selected && this.activeScenarios.length > 0) {
      this.selectedScenarioId = this.activeScenarios[0].id;
    }
  }

  startDay() {
    if (!this.clients.length) {
      this.pushLog("Impossible de demarrer: base clients vide.", "danger");
      return;
    }

    this.dayRunning = true;
    this.gameOver = false;

    this.waitingQueue = createDayQueue(this.clients, this.day, this.level);
    this.activeScenarios = [];
    this.selectedScenarioId = null;
    this.stitchScenarioId = null;

    if (this.level.inventoryEnabled) {
      this.inventory.restock({ semelles: 1, fil: 1, cuir: 1, colle: 1 });
      this.pushLog("Niveau avec inventaire actif: reassort journalier +1.", "warn");
    }

    this.fillActiveSlots();

    if (!this.activeScenarios.length) {
      this.dayRunning = false;
      this.pushLog("Aucun scenario genere pour ce jour.", "danger");
      return;
    }

    this.ui.startDayBtn.textContent = "Journee en cours";
    this.pushLog(
      `${this.level.name}: ${this.level.maxConcurrentClients} client(s) simultane(s).`
    );
    this.pushLog("Generation aleatoire des clients du jour effectuee.");

    this.renderAll();
  }

  acceptMission() {
    const scenario = this.getSelectedScenario();
    if (!scenario || scenario.phase !== "briefing") {
      return;
    }

    scenario.phase = "diagnostic";
    this.ui.diagnosticFeedback.textContent =
      "Mission acceptee. Demarrez le diagnostic en cliquant les zones.";
    this.pushLog(`Mission acceptee pour ${scenario.client.name}.`);
    this.renderAll();
  }

  canMoveToRepair(scenario) {
    if (!scenario) {
      return false;
    }

    const hasCoreZone = scenario.selectedZoneId === scenario.problem.correctZoneId;
    const enoughClues = scenario.discoveredClues.length >= scenario.problem.requiredClues;
    const enoughExploration = scenario.inspectedZoneIds.length >= 4;

    return hasCoreZone || enoughClues || enoughExploration;
  }

  inspectZone(zoneId) {
    const scenario = this.getSelectedScenario();

    if (!scenario || scenario.phase !== "diagnostic") {
      return;
    }

    if (scenario.inspectedZoneIds.includes(zoneId)) {
      this.ui.diagnosticFeedback.textContent = "Cette zone a deja ete inspectee.";
      return;
    }

    scenario.inspectedZoneIds.push(zoneId);

    const answer = resolveZoneInspection(scenario.problem, zoneId);
    this.ui.diagnosticFeedback.textContent = answer.text;

    if (answer.useful && !scenario.discoveredClues.includes(answer.text)) {
      scenario.discoveredClues.push(answer.text);
    }

    if (answer.primaryMatch) {
      scenario.selectedZoneId = zoneId;
    }

    if (answer.primaryMatch) {
      this.pushLog(`Zone critique identifiee pour ${scenario.client.name}.`);
    }

    this.renderAll();
  }

  moveToRepair() {
    const scenario = this.getSelectedScenario();
    if (!scenario || scenario.phase !== "diagnostic") {
      return;
    }

    scenario.phase = "repair";
    this.ui.diagnosticFeedback.textContent =
      "Diagnostic termine. Choisissez la reparation adaptee.";

    this.pushLog(`Passage en reparation pour ${scenario.client.name}.`);
    this.renderAll();
  }

  selectRepair(repairId) {
    const scenario = this.getSelectedScenario();
    if (!scenario || scenario.phase !== "repair") {
      return;
    }

    scenario.selectedRepairId = repairId;
    this.renderAll();
  }

  launchStitchMiniGame(scenario) {
    this.stitchScenarioId = scenario.id;
    scenario.phase = "stitching";

    this.stitchMiniGame.start();
    this.ui.stitchingPanel.classList.remove("hidden");

    this.ui.resultBox.classList.remove("success", "fail");
    this.ui.resultBox.textContent =
      "Mini-jeu couture actif: cliquez les reperes avec precision.";

    this.pushLog(`Mini-jeu couture lance pour ${scenario.client.name}.`);
    this.renderStitchStats();
    this.renderAll();
  }

  applyLevelFromXp() {
    const previous = this.level;
    this.level = getLevelByXp(this.player.xp);

    if (previous.id !== this.level.id) {
      this.pushLog(`Nouveau niveau atteint: ${this.level.name}.`, "warn");

      if (this.dayRunning) {
        this.fillActiveSlots();
      }
    }
  }

  completeScenarioRepair(scenario, stitchResult = null) {
    const selectedRepair = getRepairById(scenario.selectedRepairId);
    if (!selectedRepair) {
      this.ui.resultBox.classList.remove("success", "fail");
      this.ui.resultBox.textContent = "Selectionnez une reparation avant validation.";
      return;
    }

    if (this.level.inventoryEnabled && !this.inventory.canConsume(selectedRepair.resources)) {
      const missing = this.inventory.getMissingResources(selectedRepair.resources);
      const inventoryPenalty = this.player.applyInventoryBlockPenalty();

      this.ui.resultBox.classList.remove("success");
      this.ui.resultBox.classList.add("fail");
      this.ui.resultBox.textContent =
        `Stock vide: reparation impossible (${missing.join(", ")}). Reputation ${inventoryPenalty.reputationDelta}.`;

      this.pushLog("Stock insuffisant: intervention bloquee.", "danger");
      this.renderAll();
      return;
    }

    if (this.level.inventoryEnabled) {
      this.inventory.consume(selectedRepair.resources);
    }

    const needsComplexFlow = this.level.shouldUseComplexRepair(
      selectedRepair,
      scenario.problem
    );

    let success = scenario.selectedRepairId === scenario.problem.correctRepair;

    if (needsComplexFlow) {
      success = success && Boolean(stitchResult?.completed);
    }

    const elapsedSeconds = this.level.timerEnabled
      ? Math.floor(scenario.elapsedMs / 1000)
      : 0;

    const timeSpent = elapsedSeconds + selectedRepair.timeCost;

    let outcome;

    if (success) {
      const perfectRepair = Boolean(stitchResult?.perfect) || (
        !needsComplexFlow &&
        scenario.selectedZoneId === scenario.problem.correctZoneId &&
        scenario.discoveredClues.length >= scenario.problem.requiredClues
      );

      outcome = this.player.applySuccessfulRepair({
        baseScore: scenario.problem.baseScore,
        timeSpent,
        timeLimit: scenario.timeLimit,
        cluesFound: scenario.discoveredClues.length,
        cluesRequired: scenario.problem.requiredClues,
        perfectRepair,
        demandingClient: scenario.demanding,
        scoreMultiplier: scenario.personality?.scoreMultiplierOnSuccess ?? 1,
        reputationSuccessDelta: scenario.personality?.reputationSuccessDelta ?? 6,
      });

      scenario.resultTone = "success";
      scenario.resultText = `Succes. +${outcome.deltaScore} points, +${outcome.xpGained} XP.${outcome.perfectBonus ? " Reparation parfaite." : ""} Client ${scenario.personality?.exigenceLabel || "Moyen"}: reputation ${outcome.reputationDelta >= 0 ? "+" : ""}${outcome.reputationDelta}. Conseil: ${scenario.problem.tip}`;
    } else {
      outcome = this.player.applyWrongDiagnostic({
        baseScore: scenario.problem.baseScore,
        penaltyMultiplier: this.level.reputationPenaltyMultiplier,
        scorePenaltyMultiplier: scenario.personality?.scorePenaltyMultiplierOnFailure ?? 1,
        reputationFailureDelta: scenario.personality?.reputationFailureDelta ?? -10,
      });

      scenario.resultTone = "fail";
      scenario.resultText = `Mauvais diagnostic. ${outcome.deltaScore} points, reputation ${outcome.reputationDelta}. Regle appliquee: minimum -10, ajustee selon personnalite client.`;
    }

    scenario.outcome = outcome;
    scenario.finished = true;
    scenario.phase = "result";

    this.stitchScenarioId = null;
    this.ui.stitchingPanel.classList.add("hidden");
    this.stitchMiniGame.reset();

    this.applyLevelFromXp();

    if (this.player.reputation <= 0) {
      this.gameOver = true;
      this.dayRunning = false;
      this.pushLog("Reputation a zero: fermeture temporaire.", "danger");
    } else if (outcome.success) {
      this.pushLog(`Client satisfait: ${scenario.client.name}.`);
    } else {
      this.pushLog(`Client mecontent: ${scenario.client.name}.`, "warn");
    }

    this.renderAll();
  }

  validateRepair() {
    const scenario = this.getSelectedScenario();
    if (!scenario || scenario.phase !== "repair") {
      return;
    }

    const selectedRepair = getRepairById(scenario.selectedRepairId);
    if (!selectedRepair) {
      this.ui.resultBox.classList.remove("success", "fail");
      this.ui.resultBox.textContent = "Selectionnez une reparation avant validation.";
      return;
    }

    const needsComplexFlow = this.level.shouldUseComplexRepair(
      selectedRepair,
      scenario.problem
    );

    if (needsComplexFlow) {
      this.launchStitchMiniGame(scenario);
      return;
    }

    this.completeScenarioRepair(scenario, null);
  }

  finishStitchMiniGame() {
    if (!this.stitchScenarioId) {
      return;
    }

    const scenario = this.activeScenarios.find((entry) => entry.id === this.stitchScenarioId);
    if (!scenario) {
      return;
    }

    const stitchResult = this.stitchMiniGame.finalizeResult();
    scenario.stitchResult = stitchResult;
    this.completeScenarioRepair(scenario, stitchResult);
  }

  applyTimeoutToScenario(scenario) {
    if (!scenario || scenario.finished || !this.level.timerEnabled) {
      return;
    }

    scenario.finished = true;
    scenario.phase = "result";

    const outcome = this.player.applyTimeoutPenalty({
      penaltyMultiplier: this.level.reputationPenaltyMultiplier,
    });

    scenario.outcome = outcome;
    scenario.resultTone = "fail";
    scenario.resultText =
      `Temps ecoule. ${outcome.deltaScore} points, reputation ${outcome.reputationDelta}.`;

    if (this.stitchScenarioId === scenario.id) {
      this.stitchScenarioId = null;
      this.ui.stitchingPanel.classList.add("hidden");
      this.stitchMiniGame.reset();
    }

    if (this.player.reputation <= 0) {
      this.gameOver = true;
      this.dayRunning = false;
      this.pushLog("Reputation epuisee apres timeout.", "danger");
    } else {
      this.pushLog(`Temps depasse pour ${scenario.client.name}.`, "warn");
    }
  }

  nextClient() {
    if (this.gameOver) {
      this.reset();
      return;
    }

    const scenario = this.getSelectedScenario();
    if (!scenario || !scenario.finished) {
      return;
    }

    this.activeScenarios = this.activeScenarios.filter((entry) => entry.id !== scenario.id);

    if (this.stitchScenarioId === scenario.id) {
      this.stitchScenarioId = null;
      this.ui.stitchingPanel.classList.add("hidden");
      this.stitchMiniGame.reset();
    }

    this.fillActiveSlots();

    if (!this.activeScenarios.length && this.waitingQueue.length === 0) {
      this.dayRunning = false;
      this.day += 1;
      this.selectedScenarioId = null;
      this.ui.startDayBtn.textContent = `Demarrer le jour ${this.day}`;
      this.pushLog("Journee terminee. Passez au jour suivant.");
    }

    if (!this.selectedScenarioId && this.activeScenarios.length > 0) {
      this.selectedScenarioId = this.activeScenarios[0].id;
    }

    this.renderAll();
  }

  manualRestock() {
    if (!this.level.inventoryEnabled) {
      this.pushLog("Inventaire desactive a ce niveau.", "warn");
      return;
    }

    this.inventory.restock({ semelles: 1, fil: 1, cuir: 1, colle: 1 });
    this.pushLog("Reassort manuel effectue (+1).", "warn");
    this.renderAll();
  }

  selectScenario(scenarioId) {
    const exists = this.activeScenarios.some((scenario) => scenario.id === scenarioId);
    if (!exists) {
      return;
    }

    this.selectedScenarioId = scenarioId;
    this.renderAll();
  }

  reset() {
    this.player.reset({
      score: 0,
      reputation: 50,
      xp: 0,
      streak: 0,
      resolvedClients: 0,
      failedClients: 0,
    });

    this.level = getLevelByXp(0);
    this.inventory.reset();

    this.day = 1;
    this.waitingQueue = [];
    this.activeScenarios = [];
    this.selectedScenarioId = null;
    this.stitchScenarioId = null;
    this.hoveredZoneId = null;
    this.dayRunning = false;
    this.gameOver = false;

    this.ui.startDayBtn.textContent = "Demarrer la journee";
    this.ui.stitchingPanel.classList.add("hidden");
    this.stitchMiniGame.reset();

    this.pushLog("Progression reinitialisee.", "warn");
    this.renderAll();
  }

  renderHud() {
    const playerState = this.player.getState();

    this.ui.levelName.textContent = this.level.name;
    this.ui.dayValue.textContent = String(this.day);
    this.ui.scoreValue.textContent = String(playerState.score);
    this.ui.reputationValue.textContent = String(playerState.reputation);
    this.ui.streakValue.textContent = String(playerState.streak);

    if (this.ui.reputationMeterFill) {
      this.ui.reputationMeterFill.style.width = `${clamp(playerState.reputation, 0, 100)}%`;
    }

    if (this.ui.reputationMeter) {
      this.ui.reputationMeter.setAttribute("aria-valuenow", String(playerState.reputation));
      this.ui.reputationMeter.setAttribute(
        "aria-valuetext",
        `${playerState.reputation} sur 100`
      );
    }
  }

  renderProgress() {
    const playerState = this.player.getState();
    const currentXp = playerState.xp;

    this.ui.xpValue.textContent = `XP: ${currentXp}`;

    if (this.level.xpToNext == null) {
      this.ui.xpFill.style.width = "100%";
      this.ui.xpNextLabel.textContent = "Niveau maximum atteint";
      return;
    }

    const min = this.level.minXp;
    const max = this.level.xpToNext;
    const ratio = clamp((currentXp - min) / Math.max(1, max - min), 0, 1);

    this.ui.xpFill.style.width = `${Math.round(ratio * 100)}%`;
    this.ui.xpNextLabel.textContent = `Prochain niveau: ${max} XP`;
  }

  renderQueue() {
    this.ui.queueValue.textContent = `En attente: ${this.waitingQueue.length}`;
  }

  renderActiveClients() {
    this.ui.activeClients.innerHTML = "";

    if (!this.activeScenarios.length) {
      return;
    }

    this.activeScenarios.forEach((scenario) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "client-tab";
      button.dataset.scenarioId = scenario.id;

      const stateLabel =
        scenario.phase === "result"
          ? "pret"
          : scenario.phase === "briefing"
            ? "briefing"
          : scenario.phase === "repair"
            ? "reparation"
            : scenario.phase === "stitching"
              ? "couture"
              : "diagnostic";

      button.textContent = `${scenario.client.name} - ${stateLabel}${scenario.demanding ? " *" : ""}`;

      if (scenario.id === this.selectedScenarioId) {
        button.classList.add("active");
      }

      this.ui.activeClients.appendChild(button);
    });
  }

  renderClientCard() {
    const scenario = this.getSelectedScenario();

    if (!scenario) {
      this.setClientWaitingState(
        this.dayRunning
          ? "Aucun client actif. Attendez le prochain passage." 
          : "Cliquez sur Demarrer la journee pour accueillir le premier client."
      );
      return;
    }

    const selectedZoneLabel = scenario.selectedZoneId
      ? getDiagnosticZoneById(scenario.selectedZoneId)?.label || "Inconnue"
      : "Aucune";

    this.ui.clientCard.classList.remove("empty-state");
    this.ui.clientCard.innerHTML = `
      <h3>${safeText(scenario.client.name)} - ${safeText(scenario.client.shoeType)}</h3>
      <p><strong>Histoire:</strong> ${safeText(scenario.client.story || scenario.client.profile || "Client habitue de l'atelier.")}</p>
      <p><strong>Exigence:</strong> ${safeText(scenario.personality?.exigenceLabel || scenario.client.exigence || "Moyenne")}</p>
      <p><strong>Impact reputation:</strong> ${safeText(String(scenario.personality?.reputationSuccessDelta ?? scenario.client.reputationImpact?.success ?? 0))} / ${safeText(String(scenario.personality?.reputationFailureDelta ?? scenario.client.reputationImpact?.failure ?? 0))}</p>
      <p><strong>Symptome:</strong> ${safeText(scenario.problem.symptom)}</p>
      <p><strong>Zone suspecte:</strong> ${safeText(selectedZoneLabel)}</p>
      <p><strong>Niveau client:</strong> ${scenario.demanding ? "Exigeant" : "Standard"}</p>
    `;
  }

  renderDiagnosticProgress() {
    const scenario = this.getSelectedScenario();

    if (!scenario) {
      this.ui.diagnosticProgress.textContent = "Indices: 0 / 2";
      return;
    }

    const zoneLabel = scenario.selectedZoneId
      ? getDiagnosticZoneById(scenario.selectedZoneId)?.label || "Inconnue"
      : "Aucune";

    this.ui.diagnosticProgress.textContent =
      `Indices: ${scenario.discoveredClues.length} / ${scenario.problem.requiredClues} | Zone: ${zoneLabel}`;
  }

  renderTutorial() {
    const scenario = this.getSelectedScenario();

    if (!this.level.guidedTutorial || !scenario || !this.dayRunning) {
      this.ui.tutorialBox.textContent =
        "Tutoriel inactif. La progression automatique ajuste la difficulte.";
      return;
    }

    if (scenario.phase === "briefing") {
      this.ui.tutorialBox.textContent =
        "Tutoriel: lisez le dialogue client puis cliquez sur Accepter la mission.";
      return;
    }

    this.ui.tutorialBox.textContent = this.level.getTutorialText(scenario);
  }

  renderMissionDialogue() {
    const scenario = this.getSelectedScenario();

    if (!scenario) {
      this.ui.missionDialogueText.textContent =
        "Le dialogue client apparaitra ici avant le debut de la mission.";
      this.ui.acceptMissionBtn.disabled = true;
      return;
    }

    const intro = scenario.client.dialogueBeforeRepair
      || "Pouvez-vous regarder ma paire avant la prochaine sortie ?";
    const reputationHint = scenario.client.reputationImpact
      ? `Impact reputation: +${scenario.client.reputationImpact.success} / ${scenario.client.reputationImpact.failure}`
      : "Impact reputation standard";

    this.ui.missionDialogueText.textContent =
      `${intro} (${reputationHint})`;

    this.ui.acceptMissionBtn.disabled = scenario.phase !== "briefing";
  }

  renderZoneLegend() {
    const scenario = this.getSelectedScenario();
    const inspectedZoneIds = scenario?.inspectedZoneIds || [];

    this.ui.zoneLegend.innerHTML = "";

    this.diagnosticBoard.zones.forEach((zone) => {
      const chip = document.createElement("span");
      chip.className = "zone-pill";
      chip.textContent = zone.label;

      if (inspectedZoneIds.includes(zone.id)) {
        chip.classList.add("active");
      }

      if (zone.id === this.hoveredZoneId) {
        chip.classList.add("hovered");
      }

      this.ui.zoneLegend.appendChild(chip);
    });
  }

  renderInventory() {
    this.ui.inventoryGrid.innerHTML = "";

    if (!this.level.inventoryEnabled) {
      const item = document.createElement("article");
      item.className = "inventory-item";
      item.innerHTML = "<h4>Inventaire</h4><p>OFF</p>";
      this.ui.inventoryGrid.appendChild(item);
      return;
    }

    const snapshot = this.inventory.getStockSnapshot();

    RESOURCE_KEYS.forEach((resource) => {
      const amount = snapshot[resource] || 0;
      const item = document.createElement("article");
      item.className = "inventory-item";

      if (amount <= 0) {
        item.classList.add("empty");
      } else if (amount <= 1) {
        item.classList.add("low");
      }

      item.innerHTML = `<h4>${RESOURCE_LABELS[resource]}</h4><p>${amount}</p>`;
      this.ui.inventoryGrid.appendChild(item);
    });
  }

  renderRepairButtons() {
    const scenario = this.getSelectedScenario();
    const isRepairPhase = scenario && scenario.phase === "repair";

    this.ui.repairOptions.innerHTML = "";

    REPAIR_OPTIONS.forEach((repair) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn choice-btn";
      button.dataset.repairId = repair.id;

      const resourceLabel = formatResourceSummary(repair.resources);
      const stockOk = this.level.inventoryEnabled
        ? this.inventory.canConsume(repair.resources)
        : true;

      button.textContent = stockOk
        ? `${repair.label} (${repair.timeCost} min) | ${resourceLabel}`
        : `${repair.label} (${repair.timeCost} min) | Stock insuffisant`;

      button.title = repair.description;

      if (scenario && scenario.selectedRepairId === repair.id) {
        button.classList.add("active");
      }

      button.disabled = !isRepairPhase || !stockOk;
      this.ui.repairOptions.appendChild(button);
    });

    const selectedRepair = scenario ? getRepairById(scenario.selectedRepairId) : null;
    const selectedInStock = selectedRepair
      ? !this.level.inventoryEnabled || this.inventory.canConsume(selectedRepair.resources)
      : false;

    this.ui.validateRepairBtn.disabled = !(isRepairPhase && selectedRepair && selectedInStock);
  }

  renderTimerBadge() {
    const scenario = this.getSelectedScenario();

    this.ui.timerValue.classList.remove("status-warn", "status-danger");

    if (!scenario) {
      this.ui.timerValue.textContent = "Temps: 0s";
      return;
    }

    if (!this.level.timerEnabled) {
      this.ui.timerValue.textContent = "Temps: OFF";
      return;
    }

    const elapsedSeconds = Math.floor(scenario.elapsedMs / 1000);
    const remaining = Math.max(0, scenario.timeLimit - elapsedSeconds);

    this.ui.timerValue.textContent = `Temps: ${remaining}s`;

    if (remaining <= 18 && remaining > 8) {
      this.ui.timerValue.classList.add("status-warn");
    }

    if (remaining <= 8) {
      this.ui.timerValue.classList.add("status-danger");
    }
  }

  renderResultBox() {
    const scenario = this.getSelectedScenario();

    this.ui.resultBox.classList.remove("success", "fail");

    if (!scenario) {
      this.ui.resultBox.textContent = "";
      return;
    }

    this.ui.resultBox.textContent = scenario.resultText || "";

    if (scenario.resultTone) {
      this.ui.resultBox.classList.add(scenario.resultTone);
    }
  }

  renderStitchStats() {
    const snap = this.stitchMiniGame.getSnapshot();
    const quality = Math.round(snap.quality * 100);

    this.ui.stitchStats.textContent =
      `Precision: ${quality}% | Hits: ${snap.hits}/${Math.max(1, snap.attempts)} | Restant: ${snap.remainingSeconds}s`;

    const scenario = this.getSelectedScenario();
    const isActive = Boolean(
      scenario && scenario.id === this.stitchScenarioId && scenario.phase === "stitching"
    );

    this.ui.finishStitchBtn.disabled = !(isActive && (snap.completed || snap.timeUp));
  }

  renderControlStates() {
    const mode = this.getCurrentMode();
    const scenario = this.getSelectedScenario();

    this.ui.startDayBtn.disabled = this.dayRunning;
    this.ui.resetGameBtn.disabled = false;

    this.ui.restockBtn.disabled = !this.level.inventoryEnabled;

    this.ui.toRepairBtn.disabled = !(
      scenario &&
      scenario.phase === "diagnostic" &&
      this.canMoveToRepair(scenario)
    );

    this.ui.nextClientBtn.disabled = !(this.gameOver || (scenario && scenario.finished));
    this.ui.nextClientBtn.textContent = this.gameOver ? "Recommencer" : "Client suivant";

    this.ui.diagnosticCanvas.style.pointerEvents =
      mode === "diagnostic" ? "auto" : "none";
  }

  renderAll() {
    this.renderHud();
    this.renderProgress();
    this.renderQueue();
    this.renderActiveClients();
    this.renderMissionDialogue();
    this.renderClientCard();
    this.renderDiagnosticProgress();
    this.renderTutorial();
    this.renderZoneLegend();
    this.renderInventory();
    this.renderRepairButtons();
    this.renderTimerBadge();
    this.renderResultBox();
    this.renderStitchStats();
    this.renderControlStates();
  }

  drawWorkshop() {
    const ctx = this.workshopCtx;
    const width = this.ui.atelierCanvas.width;
    const height = this.ui.atelierCanvas.height;

    ctx.clearRect(0, 0, width, height);

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#f3e1bf");
    bg.addColorStop(1, "#d5b080");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Warm light cone from a workshop lamp.
    const lampGlow = ctx.createRadialGradient(180, 8, 10, 180, 24, 170);
    lampGlow.addColorStop(0, "rgba(255, 248, 224, 0.55)");
    lampGlow.addColorStop(1, "rgba(255, 248, 224, 0)");
    ctx.fillStyle = lampGlow;
    ctx.fillRect(0, 0, 360, 170);

    // Subtle wall slats for depth.
    ctx.strokeStyle = "rgba(108, 73, 41, 0.12)";
    for (let x = 0; x <= width; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - 48);
      ctx.stroke();
    }

    // Floor.
    ctx.fillStyle = "#7b5a34";
    ctx.fillRect(0, height - 52, width, 52);
    ctx.fillStyle = "rgba(43, 29, 15, 0.16)";
    ctx.fillRect(0, height - 52, width, 6);

    // Workbench.
    ctx.fillStyle = "#5f3d22";
    ctx.fillRect(76, 104, 316, 17);
    ctx.fillRect(90, 121, 14, 52);
    ctx.fillRect(358, 121, 14, 52);
    ctx.fillStyle = "rgba(25, 18, 10, 0.22)";
    ctx.fillRect(82, 121, 300, 6);

    // Shelves.
    ctx.fillStyle = "#8f683f";
    ctx.fillRect(512, 56, 276, 11);
    ctx.fillRect(512, 92, 276, 11);

    // Boxes and tools silhouettes.
    ctx.fillStyle = "#c1904c";
    ctx.fillRect(542, 36, 54, 20);
    ctx.fillRect(620, 36, 54, 20);
    ctx.fillRect(698, 36, 54, 20);
    ctx.fillRect(566, 70, 62, 22);
    ctx.fillRect(654, 70, 78, 22);
    ctx.fillStyle = "#6e4b2a";
    ctx.fillRect(748, 68, 16, 24);
    ctx.fillRect(770, 64, 8, 28);

    const waitingClient = Boolean(
      this.activeScenarios.some((scenario) => !scenario.finished)
    );

    const blink = Math.floor(this.visualClockMs / 360) % 2 === 0;

    // Shoe icon on table, highlighted when a client is waiting.
    ctx.fillStyle = waitingClient && blink ? "#2f6b45" : "#3f3326";
    ctx.beginPath();
    ctx.ellipse(252, 92, 56, 23, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(22, 18, 13, 0.22)";
    ctx.beginPath();
    ctx.ellipse(254, 102, 60, 10, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // Top status chips.
    ctx.fillStyle = "rgba(33, 24, 15, 0.84)";
    ctx.fillRect(22, 16, 238, 28);
    ctx.fillRect(268, 16, 138, 28);
    ctx.fillRect(412, 16, 116, 28);
    ctx.fillStyle = "#f8e7cb";
    ctx.font = "bold 15px Trebuchet MS";
    ctx.fillText(`Niveau: ${this.level.name}`, 30, 35);
    ctx.fillText(`Timer: ${this.level.timerEnabled ? "ON" : "OFF"}`, 276, 35);
    ctx.fillText(`Jour: ${this.day}`, 422, 35);

    const rep = this.player.reputation;
    const repWidth = Math.round((Math.max(0, rep) / 100) * 202);

    ctx.fillStyle = "rgba(255, 246, 228, 0.82)";
    ctx.fillRect(22, 52, 202, 14);
    ctx.fillStyle = rep > 35 ? "#2f6b45" : "#8f2d2d";
    ctx.fillRect(22, 52, repWidth, 14);
    ctx.strokeStyle = "#4e3a23";
    ctx.strokeRect(22, 52, 202, 14);
    ctx.fillStyle = "#2e2116";
    ctx.font = "12px Trebuchet MS";
    ctx.fillText("Reputation", 22, 78);

    const scenario = this.getSelectedScenario();
    if (scenario) {
      const elapsed = Math.floor(scenario.elapsedMs / 1000);
      ctx.fillStyle = "rgba(32, 24, 16, 0.82)";
      ctx.fillRect(22, 84, 306, 48);
      ctx.fillStyle = "#f6e4c9";
      ctx.font = "14px Trebuchet MS";
      ctx.fillText(`Client actif: ${scenario.client.name}`, 32, 103);
      ctx.fillText(`Chrono: ${elapsed}s / ${scenario.timeLimit}s`, 32, 122);
    }
  }

  drawBoards() {
    const scenario = this.getSelectedScenario();

    this.diagnosticBoard.draw({
      active: Boolean(scenario && scenario.phase === "diagnostic"),
      inspectedZoneIds: scenario?.inspectedZoneIds || [],
      hoveredZoneId: this.hoveredZoneId,
    });

    if (scenario && scenario.phase === "stitching") {
      this.stitchMiniGame.draw();
    }
  }

  tick(seconds) {
    this.visualClockMs += seconds * 1000;

    if (!this.dayRunning) {
      return;
    }

    const deltaMs = seconds * 1000;
    let stateChanged = false;

    this.activeScenarios.forEach((scenario) => {
      if (scenario.finished) {
        return;
      }

      const missionActivePhases = ["diagnostic", "repair", "stitching"];

      if (this.level.timerEnabled && missionActivePhases.includes(scenario.phase)) {
        scenario.elapsedMs += deltaMs;

        if (scenario.elapsedMs >= scenario.timeLimit * 1000) {
          this.applyTimeoutToScenario(scenario);
          stateChanged = true;
        }
      }
    });

    if (this.stitchScenarioId) {
      this.stitchMiniGame.advance(deltaMs, this.level.timerEnabled);
      this.renderStitchStats();
    }

    if (stateChanged) {
      this.renderAll();
    }
  }

  frame(time) {
    const deltaSeconds = Math.min(0.1, (time - this.previousTime) / 1000);
    this.previousTime = time;

    this.tick(deltaSeconds);
    this.drawWorkshop();
    this.drawBoards();
    this.renderTimerBadge();
    this.renderStitchStats();

    this.rafId = window.requestAnimationFrame((next) => this.frame(next));
  }

  bindEvents() {
    this.ui.startDayBtn.addEventListener("click", () => this.startDay());
    this.ui.resetGameBtn.addEventListener("click", () => this.reset());
    this.ui.acceptMissionBtn.addEventListener("click", () => this.acceptMission());
    this.ui.toRepairBtn.addEventListener("click", () => this.moveToRepair());
    this.ui.validateRepairBtn.addEventListener("click", () => this.validateRepair());
    this.ui.nextClientBtn.addEventListener("click", () => this.nextClient());
    this.ui.restockBtn.addEventListener("click", () => this.manualRestock());
    this.ui.finishStitchBtn.addEventListener("click", () => this.finishStitchMiniGame());

    if (this.ui.contrastToggle) {
      this.ui.contrastToggle.addEventListener("change", () => {
        const enabled = Boolean(this.ui.contrastToggle.checked);
        this.setHighContrast(enabled);
        try {
          window.localStorage.setItem("cordonnerie:high-contrast", enabled ? "1" : "0");
        } catch (_error) {
          // Ignore storage issues in private mode.
        }
      });
    }

    this.ui.activeClients.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-scenario-id]");
      if (!button) {
        return;
      }

      this.selectScenario(button.dataset.scenarioId);
    });

    this.ui.repairOptions.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-repair-id]");
      if (!button) {
        return;
      }

      this.selectRepair(button.dataset.repairId);
    });

    this.ui.diagnosticCanvas.addEventListener("mousemove", (event) => {
      const zone = this.diagnosticBoard.getZoneAtEvent(event);
      this.hoveredZoneId = zone?.id || null;
      this.renderZoneLegend();
      this.drawBoards();
    });

    this.ui.diagnosticCanvas.addEventListener("mouseleave", () => {
      this.hoveredZoneId = null;
      this.renderZoneLegend();
      this.drawBoards();
    });

    this.ui.diagnosticCanvas.addEventListener("click", (event) => {
      const scenario = this.getSelectedScenario();
      if (!scenario || scenario.phase !== "diagnostic") {
        return;
      }

      const zone = this.diagnosticBoard.getZoneAtEvent(event);
      if (!zone) {
        this.ui.diagnosticFeedback.textContent =
          "Cliquez sur une zone coloree de la chaussure.";
        return;
      }

      this.inspectZone(zone.id);
    });

    this.ui.stitchCanvas.addEventListener("mousemove", (event) => {
      const scenario = this.getSelectedScenario();
      if (!scenario || scenario.phase !== "stitching") {
        return;
      }

      this.stitchMiniGame.handleMove(event);
      this.renderStitchStats();
    });

    this.ui.stitchCanvas.addEventListener("click", (event) => {
      const scenario = this.getSelectedScenario();
      if (!scenario || scenario.phase !== "stitching") {
        return;
      }

      this.stitchMiniGame.handleClick(event);
      this.renderStitchStats();
      this.drawBoards();
    });
  }

  installHooksForTesting() {
    window.render_game_to_text = () => {
      const selected = this.getSelectedScenario();

      return JSON.stringify({
        coordinateSystem: {
          workshopCanvas: "origin top-left, x right, y down",
          diagnosticCanvas: "origin top-left, x right, y down",
          stitchCanvas: "origin top-left, x right, y down",
        },
        mode: this.getCurrentMode(),
        day: this.day,
        level: {
          id: this.level.id,
          name: this.level.name,
          timerEnabled: this.level.timerEnabled,
          maxConcurrentClients: this.level.maxConcurrentClients,
          inventoryEnabled: this.level.inventoryEnabled,
          reputationPenaltyMultiplier: this.level.reputationPenaltyMultiplier,
        },
        queue: {
          waiting: this.waitingQueue.length,
          active: this.activeScenarios.length,
        },
        selectedClient: selected
          ? {
              id: selected.id,
              name: selected.client.name,
              issue: selected.problem.title,
              phase: selected.phase,
              elapsedSeconds: Math.floor(selected.elapsedMs / 1000),
              timeLimitSeconds: selected.timeLimit,
              inspectedZoneIds: [...selected.inspectedZoneIds],
              selectedZoneId: selected.selectedZoneId,
              selectedRepairId: selected.selectedRepairId,
              personality: selected.personality,
              finished: selected.finished,
            }
          : null,
        inventory: this.inventory.getStockSnapshot(),
        stitching: this.stitchMiniGame.getSnapshot(),
        player: this.player.getState(),
      });
    };

    window.advanceTime = (ms) => {
      const frameMs = 1000 / 60;
      const steps = Math.max(1, Math.round(ms / frameMs));

      for (let i = 0; i < steps; i += 1) {
        this.tick(frameMs / 1000);
      }

      this.drawWorkshop();
      this.drawBoards();
      this.renderAll();
    };

    window.resetCobblerSimulation = () => {
      this.reset();
    };
  }

  async init() {
    this.bindEvents();
    this.installHooksForTesting();

    this.setClientWaitingState(
      "Cliquez sur Demarrer la journee pour accueillir le premier client."
    );

    this.ui.stitchingPanel.classList.add("hidden");

    let highContrastSaved = false;
    try {
      highContrastSaved = window.localStorage.getItem("cordonnerie:high-contrast") === "1";
    } catch (_error) {
      highContrastSaved = false;
    }
    this.setHighContrast(highContrastSaved);

    await this.loadClients();

    this.renderAll();
    this.drawWorkshop();
    this.drawBoards();

    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
    }

    this.previousTime = performance.now();
    this.rafId = window.requestAnimationFrame((time) => this.frame(time));
  }
}

const game = new Game(ui);
game.init();
