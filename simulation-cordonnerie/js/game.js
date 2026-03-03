import {
  REPAIR_OPTIONS,
  createDayQueue,
  getLevelByXp,
  getRepairById,
  resolveZoneInspection,
} from "./levels.js";
import { Player } from "./score.js";

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

const PART_LABELS = {
  semelle: "Semelle",
  talon: "Talon",
  couture: "Couture",
  empeigne: "Empeigne",
};

const PART_TO_ZONE_IDS = {
  semelle: ["sole_zone"],
  talon: ["heel_zone"],
  couture: ["stitch_zone", "eyelet_zone"],
  empeigne: ["leather_zone", "lining_zone"],
};

const PART_TO_REPAIR_IDS = {
  semelle: ["resole"],
  talon: ["heel_replace"],
  couture: ["restitch", "eyelet_swap"],
  empeigne: ["condition_leather", "dehumidify"],
};

const SEVERITY_LABEL = {
  neutral: "Aucun",
  good: "Bon",
  medium: "Moyen",
  critical: "Critique",
};

const DEFAULT_STOCK = {
  semelles: 4,
  fil: 8,
  cuir: 6,
  colle: 5,
};

class InventoryManager {
  constructor(initialStock = DEFAULT_STOCK) {
    this.initialStock = { ...initialStock };
    this.stock = { ...initialStock };
  }

  reset() {
    this.stock = { ...this.initialStock };
  }

  getSnapshot() {
    return { ...this.stock };
  }

  canConsume(requirements = {}) {
    return Object.entries(requirements).every(([resource, amount]) => {
      return (this.stock[resource] || 0) >= Math.max(0, Number(amount) || 0);
    });
  }

  consume(requirements = {}) {
    if (!this.canConsume(requirements)) {
      return false;
    }

    Object.entries(requirements).forEach(([resource, amount]) => {
      const value = Math.max(0, Number(amount) || 0);
      this.stock[resource] = Math.max(0, (this.stock[resource] || 0) - value);
    });

    return true;
  }

  formatCompact() {
    return `Semelles ${this.stock.semelles} | Fil ${this.stock.fil} | Cuir ${this.stock.cuir} | Colle ${this.stock.colle}`;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function callLegacyHook(name, payload) {
  const fn = window[name];
  if (typeof fn === "function") {
    try {
      fn(payload);
    } catch (_error) {
      // Keep the new UI resilient if an old hook fails.
    }
  }
}

function safeText(text) {
  return String(text || "").replace(/[<>]/g, "");
}

function formatNow() {
  return new Date().toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
}

class Game {
  constructor(dom) {
    this.ui = dom;
    this.player = new Player({ score: 0, reputation: 50, xp: 0, streak: 0 });
    this.level = getLevelByXp(this.player.xp);
    this.inventory = new InventoryManager(DEFAULT_STOCK);

    this.clients = [];
    this.day = 1;
    this.waitingQueue = [];
    this.currentScenario = null;

    this.selectedPart = null;
    this.selectedSeverity = "neutral";
    this.lastInspectionText = "";
    this.bannerText = "Chargement des clients en cours...";
    this.history = [];

    this.timerIntervalId = null;
    this.transitionTimeoutId = null;
    this.isTransitioning = false;
  }

  async init() {
    this.bindSvgParts();
    this.bindControls();
    this.installHooksForTesting();
    await this.loadClients();
    this.prepareQueueIfNeeded();
    this.pickNextScenario();
    this.render();
  }

  async loadClients() {
    try {
      const response = await fetch("./data/clients.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      this.clients = Array.isArray(payload?.clients) ? payload.clients : [];
    } catch (_error) {
      this.clients = [
        {
          id: "fallback-client",
          name: "Client de test",
          shoeType: "Botte urbaine",
          exigence: "moyenne",
          dialogueBeforeRepair: "Je veux une reparation fiable et durable.",
          reputationImpact: { success: 6, failure: -8 },
          problemPool: ["sole_loose", "stitch_open"],
        },
      ];
      this.bannerText = "Mode secours: donnees clients indisponibles.";
    }
  }

  prepareQueueIfNeeded() {
    if (this.waitingQueue.length > 0 || this.clients.length === 0) {
      return;
    }

    this.waitingQueue = createDayQueue(this.clients, this.day, this.level);
  }

  pickNextScenario() {
    this.prepareQueueIfNeeded();
    this.currentScenario = this.waitingQueue.shift() || null;

    this.selectedPart = null;
    this.selectedSeverity = "neutral";
    this.lastInspectionText = "";
    this.isTransitioning = false;

    if (this.currentScenario) {
      const intro = this.currentScenario.client.dialogueBeforeRepair
        || "Pouvez-vous verifier l'etat de ma chaussure ?";
      this.bannerText =
        `Client: ${safeText(this.currentScenario.client.name)} | ${safeText(this.currentScenario.problem.title)}. `
        + `${safeText(intro)}`;
      this.startTimer();
    } else {
      this.stopTimer();
      this.day += 1;
      this.prepareQueueIfNeeded();
      this.currentScenario = this.waitingQueue.shift() || null;

      if (this.currentScenario) {
        this.bannerText = `Nouveau jour (${this.day}) - ${safeText(this.currentScenario.client.name)} arrive a l'atelier.`;
        this.startTimer();
      } else {
        this.bannerText = "Aucun client disponible.";
      }
    }

    callLegacyHook("nextCustomer", {
      day: this.day,
      level: this.level.name,
      clientId: this.currentScenario?.id || null,
    });
  }

  startTimer() {
    this.stopTimer();

    if (!this.level.timerEnabled || !this.currentScenario) {
      return;
    }

    this.timerIntervalId = window.setInterval(() => {
      if (!this.currentScenario || this.isTransitioning) {
        return;
      }

      this.currentScenario.elapsedMs += 1000;

      if (this.currentScenario.elapsedMs >= this.currentScenario.timeLimit * 1000) {
        this.handleTimeout();
        return;
      }

      this.renderHeader();
      this.renderDiagnostic();
    }, 1000);
  }

  stopTimer() {
    if (this.timerIntervalId) {
      window.clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }

  computeSeverity(problem, inspection) {
    if (!inspection) {
      return "neutral";
    }

    if (inspection.primaryMatch && problem?.complexity >= 3) {
      return "critical";
    }

    if (inspection.primaryMatch) {
      return "medium";
    }

    if (inspection.useful) {
      return "medium";
    }

    return "good";
  }

  resolveZoneForPart(partKey, correctZoneId) {
    const mappedZoneIds = PART_TO_ZONE_IDS[partKey] || [];
    if (mappedZoneIds.includes(correctZoneId)) {
      return correctZoneId;
    }

    return mappedZoneIds[0] || null;
  }

  appendHistory(text) {
    this.history.unshift({
      time: formatNow(),
      text,
    });

    if (this.history.length > 18) {
      this.history.length = 18;
    }
  }

  selectPart(partKey) {
    if (!this.currentScenario || this.isTransitioning) {
      return;
    }

    const label = PART_LABELS[partKey] || partKey;
    const zoneId = this.resolveZoneForPart(partKey, this.currentScenario.problem.correctZoneId);

    this.selectedPart = partKey;
    this.currentScenario.selectedZoneId = zoneId;

    const inspection = resolveZoneInspection(this.currentScenario.problem, zoneId);
    this.lastInspectionText = inspection.text;
    this.selectedSeverity = this.computeSeverity(this.currentScenario.problem, inspection);

    if (zoneId && !this.currentScenario.inspectedZoneIds.includes(zoneId)) {
      this.currentScenario.inspectedZoneIds.push(zoneId);
    }

    if (inspection.useful && !this.currentScenario.discoveredClues.includes(inspection.text)) {
      this.currentScenario.discoveredClues.push(inspection.text);
    }

    this.appendHistory(`Piece inspectee: ${label}.`);

    callLegacyHook("updateStats", {
      selectedPart: partKey,
      severity: this.selectedSeverity,
      cluesFound: this.currentScenario.discoveredClues.length,
    });

    this.render();
  }

  getRepairOptionsForPart(partKey) {
    const repairIds = PART_TO_REPAIR_IDS[partKey] || [];
    return repairIds
      .map((repairId) => getRepairById(repairId))
      .filter(Boolean);
  }

  consumeInventoryOrFail(repair) {
    if (!this.level.inventoryEnabled) {
      return true;
    }

    if (this.inventory.canConsume(repair.resources)) {
      this.inventory.consume(repair.resources);
      return true;
    }

    const penalty = this.player.applyInventoryBlockPenalty();
    this.bannerText = `Stock vide sur cette reparation. Reputation ${penalty.reputationDelta}.`;
    this.appendHistory("Reparation impossible: stock insuffisant.");
    return false;
  }

  applyRepair(repairId) {
    if (!this.currentScenario || !this.selectedPart || this.isTransitioning) {
      return;
    }

    const repair = getRepairById(repairId);
    if (!repair) {
      return;
    }

    const inventoryOk = this.consumeInventoryOrFail(repair);
    if (!inventoryOk) {
      this.syncLevel();
      this.render();
      return;
    }

    const scenario = this.currentScenario;
    scenario.selectedRepairId = repair.id;

    const diagnosticOk = scenario.selectedZoneId === scenario.problem.correctZoneId;
    const repairOk = repair.id === scenario.problem.correctRepair;

    let outcome = null;

    if (!diagnosticOk || !repairOk) {
      outcome = this.player.applyWrongDiagnostic({
        baseScore: scenario.problem.baseScore,
        penaltyMultiplier: this.level.reputationPenaltyMultiplier,
        scorePenaltyMultiplier: scenario.personality.scorePenaltyMultiplierOnFailure,
        reputationFailureDelta: scenario.personality.reputationFailureDelta,
      });

      this.bannerText = diagnosticOk
        ? "Mauvaise reparation: le client est mecontent."
        : "Mauvais diagnostic: penalite reputation appliquee.";

      this.appendHistory(
        `Echec sur ${PART_LABELS[this.selectedPart]} (${repair.label}). Reputation ${outcome.reputationDelta}.`
      );
    } else {
      const perfectRepair =
        scenario.discoveredClues.length >= scenario.problem.requiredClues;

      outcome = this.player.applySuccessfulRepair({
        baseScore: scenario.problem.baseScore,
        timeSpent: Math.floor(scenario.elapsedMs / 1000),
        timeLimit: scenario.timeLimit,
        cluesFound: scenario.discoveredClues.length,
        cluesRequired: scenario.problem.requiredClues,
        perfectRepair,
        demandingClient: scenario.demanding,
        scoreMultiplier: scenario.personality.scoreMultiplierOnSuccess,
        reputationSuccessDelta: scenario.personality.reputationSuccessDelta,
      });

      this.bannerText = perfectRepair
        ? "Reparation parfaite: bonus score applique."
        : "Reparation validee avec succes.";

      this.appendHistory(
        `Succes sur ${PART_LABELS[this.selectedPart]} (${repair.label}). Score +${outcome.deltaScore}.`
      );
    }

    callLegacyHook("applyRepair", {
      part: this.selectedPart,
      repairId: repair.id,
      success: Boolean(diagnosticOk && repairOk),
      score: this.player.score,
      reputation: this.player.reputation,
      xp: this.player.xp,
    });

    this.syncLevel();
    this.transitionToNextScenario();
  }

  handleTimeout() {
    if (!this.currentScenario || this.isTransitioning) {
      return;
    }

    const penalty = this.player.applyTimeoutPenalty({
      penaltyMultiplier: this.level.reputationPenaltyMultiplier,
    });

    this.bannerText = "Temps ecoule: mission echouee.";
    this.appendHistory(`Timeout mission. Reputation ${penalty.reputationDelta}.`);
    this.syncLevel();
    this.transitionToNextScenario();
  }

  syncLevel() {
    const nextLevel = getLevelByXp(this.player.xp);
    if (nextLevel.id !== this.level.id) {
      this.appendHistory(`Niveau atteint: ${nextLevel.name}.`);
    }
    this.level = nextLevel;
  }

  transitionToNextScenario() {
    this.isTransitioning = true;
    this.stopTimer();
    this.render();

    if (this.transitionTimeoutId) {
      window.clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }

    this.transitionTimeoutId = window.setTimeout(() => {
      this.pickNextScenario();
      this.render();
    }, 850);
  }

  reset() {
    if (this.transitionTimeoutId) {
      window.clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }

    this.stopTimer();
    this.player.reset({ score: 0, reputation: 50, xp: 0, streak: 0 });
    this.level = getLevelByXp(this.player.xp);
    this.inventory.reset();

    this.day = 1;
    this.waitingQueue = [];
    this.currentScenario = null;
    this.selectedPart = null;
    this.selectedSeverity = "neutral";
    this.lastInspectionText = "";
    this.bannerText = "Session reinitialisee.";
    this.history = [];
    this.isTransitioning = false;

    this.prepareQueueIfNeeded();
    this.pickNextScenario();
    this.render();

    callLegacyHook("nextCustomer", { reset: true });
  }

  setSeverityBadge(severity) {
    this.ui.severity.classList.remove(
      "severity-neutral",
      "severity-good",
      "severity-medium",
      "severity-critical"
    );
    this.ui.severity.classList.add(`severity-${severity}`);
    this.ui.severity.textContent = SEVERITY_LABEL[severity] || SEVERITY_LABEL.neutral;
  }

  renderHeader() {
    this.ui.dayChip.textContent = String(this.day);
    this.ui.reputationChip.textContent = String(clamp(this.player.reputation, 0, 100));
    this.ui.levelChip.textContent = this.level.name;
    this.ui.scoreChip.textContent = String(this.player.score);
  }

  renderDiagnostic() {
    const scenario = this.currentScenario;

    if (!scenario) {
      this.ui.selectedPartLabel.textContent = "-";
      this.ui.diagnosticText.textContent = this.bannerText;
      this.setSeverityBadge("neutral");
      return;
    }

    const timerText = this.level.timerEnabled
      ? `Timer: ${Math.max(0, scenario.timeLimit - Math.floor(scenario.elapsedMs / 1000))}s`
      : "Timer: OFF";
    const stockText = this.level.inventoryEnabled
      ? `Stock: ${this.inventory.formatCompact()}`
      : "Stock: OFF (niveau 1)";

    if (!this.selectedPart) {
      this.ui.selectedPartLabel.textContent = "-";
      this.ui.diagnosticText.textContent =
        `${this.bannerText}\n${safeText(scenario.problem.symptom)}\n${timerText} | ${stockText}`;
      this.setSeverityBadge("neutral");
      return;
    }

    this.ui.selectedPartLabel.textContent = PART_LABELS[this.selectedPart] || this.selectedPart;
    this.ui.diagnosticText.textContent =
      `${safeText(this.lastInspectionText)}\n${timerText} | ${stockText}`;
    this.setSeverityBadge(this.selectedSeverity);
  }

  renderActions() {
    this.ui.actionsList.innerHTML = "";
    const scenario = this.currentScenario;

    if (!scenario) {
      const note = document.createElement("p");
      note.className = "empty-note";
      note.textContent = "Aucune mission active.";
      this.ui.actionsList.appendChild(note);
      return;
    }

    if (!this.selectedPart) {
      const note = document.createElement("p");
      note.className = "empty-note";
      note.textContent = "Selectionnez une piece dans le SVG pour afficher les actions.";
      this.ui.actionsList.appendChild(note);
      return;
    }

    const repairOptions = this.getRepairOptionsForPart(this.selectedPart);

    repairOptions.forEach((repair) => {
      const button = document.createElement("button");
      const stockOk = !this.level.inventoryEnabled || this.inventory.canConsume(repair.resources);
      const blocked = this.isTransitioning || !stockOk;

      button.type = "button";
      button.className = "action-btn";
      button.disabled = blocked;
      button.textContent = stockOk
        ? `${repair.label} (${repair.timeCost} min)`
        : `${repair.label} (Stock insuffisant)`;

      button.addEventListener("click", () => this.applyRepair(repair.id));
      this.ui.actionsList.appendChild(button);
    });
  }

  renderHistory() {
    this.ui.historyList.innerHTML = "";

    if (!this.history.length) {
      const item = document.createElement("li");
      item.className = "empty-note";
      item.textContent = "Aucune interaction pour l'instant.";
      this.ui.historyList.appendChild(item);
      return;
    }

    this.history.forEach((entry) => {
      const item = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = entry.time;
      item.appendChild(strong);
      item.appendChild(document.createTextNode(` - ${entry.text}`));
      this.ui.historyList.appendChild(item);
    });
  }

  renderSvgState() {
    this.ui.parts.forEach((partNode) => {
      const isActive = partNode.dataset.part === this.selectedPart;
      partNode.classList.toggle("is-active", isActive);
      partNode.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  render() {
    this.renderHeader();
    this.renderDiagnostic();
    this.renderActions();
    this.renderHistory();
    this.renderSvgState();
  }

  showTooltip(event, label) {
    const shellRect = this.ui.svgShell.getBoundingClientRect();
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

    this.ui.tooltip.textContent = label;
    this.ui.tooltip.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
    this.ui.tooltip.classList.add("show");
  }

  hideTooltip() {
    this.ui.tooltip.classList.remove("show");
    this.ui.tooltip.style.transform = "translate3d(-999px, -999px, 0)";
  }

  bindSvgParts() {
    this.ui.parts.forEach((partNode) => {
      const partKey = partNode.dataset.part;
      const label = PART_LABELS[partKey] || partKey;

      partNode.addEventListener("click", () => this.selectPart(partKey));

      partNode.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.selectPart(partKey);
        }
      });

      partNode.addEventListener("mouseenter", (event) => this.showTooltip(event, label));
      partNode.addEventListener("mousemove", (event) => this.showTooltip(event, label));
      partNode.addEventListener("mouseleave", () => this.hideTooltip());
      partNode.addEventListener("focus", (event) => this.showTooltip(event, label));
      partNode.addEventListener("blur", () => this.hideTooltip());
    });
  }

  bindControls() {
    this.ui.resetBtn.addEventListener("click", () => this.reset());
  }

  installHooksForTesting() {
    window.render_game_to_text = () => {
      return JSON.stringify({
        mode: this.selectedPart ? "repair" : "diagnostic",
        day: this.day,
        level: { id: this.level.id, name: this.level.name, timerEnabled: this.level.timerEnabled },
        selectedPart: this.selectedPart,
        currentClient: this.currentScenario
          ? {
              id: this.currentScenario.id,
              name: this.currentScenario.client.name,
              problem: this.currentScenario.problem.title,
              elapsedSeconds: Math.floor(this.currentScenario.elapsedMs / 1000),
              timeLimitSeconds: this.currentScenario.timeLimit,
            }
          : null,
        inventory: this.inventory.getSnapshot(),
        player: this.player.getState(),
        queueRemaining: this.waitingQueue.length,
      });
    };

    window.advanceTime = (ms) => {
      if (!this.currentScenario || !this.level.timerEnabled) {
        return;
      }

      const safeMs = Math.max(0, Number(ms) || 0);
      this.currentScenario.elapsedMs += safeMs;

      if (this.currentScenario.elapsedMs >= this.currentScenario.timeLimit * 1000) {
        this.handleTimeout();
      } else {
        this.renderHeader();
        this.renderDiagnostic();
      }
    };

    window.resetCobblerSimulation = () => this.reset();
  }
}

const game = new Game(ui);
game.init();
