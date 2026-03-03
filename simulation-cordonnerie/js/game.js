import {
  REPAIR_OPTIONS,
  createDayQueue,
  getDiagnosticQuestions,
  getRepairById,
  resolveQuestion,
} from "./levels.js";
import { createScoreSystem } from "./score.js";

const ui = {
  dayValue: document.getElementById("day-value"),
  scoreValue: document.getElementById("score-value"),
  reputationValue: document.getElementById("reputation-value"),
  streakValue: document.getElementById("streak-value"),
  queueValue: document.getElementById("queue-value"),
  clientCard: document.getElementById("client-card"),
  startDayBtn: document.getElementById("start-day-btn"),
  diagnosticProgress: document.getElementById("diagnostic-progress"),
  diagnosticQuestions: document.getElementById("diagnostic-questions"),
  diagnosticFeedback: document.getElementById("diagnostic-feedback"),
  toRepairBtn: document.getElementById("to-repair-btn"),
  repairOptions: document.getElementById("repair-options"),
  validateRepairBtn: document.getElementById("validate-repair-btn"),
  resultBox: document.getElementById("result-box"),
  nextClientBtn: document.getElementById("next-client-btn"),
  timerValue: document.getElementById("timer-value"),
  eventLog: document.getElementById("event-log"),
  atelierCanvas: document.getElementById("atelier-canvas"),
};

const scoreSystem = createScoreSystem({
  score: 0,
  reputation: 50,
});

const diagnosticQuestions = getDiagnosticQuestions();
const canvasCtx = ui.atelierCanvas.getContext("2d");

const state = {
  day: 1,
  mode: "idle",
  clients: [],
  dayQueue: [],
  queueIndex: 0,
  currentScenario: null,
  visualClockMs: 0,
  rafId: 0,
  previousTime: performance.now(),
};

function safeText(text) {
  return String(text || "").replace(/[<>]/g, "");
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
}

function renderQueue() {
  const remaining = Math.max(0, state.dayQueue.length - state.queueIndex);
  ui.queueValue.textContent = `File: ${remaining}`;
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

  ui.clientCard.classList.remove("empty-state");
  ui.clientCard.innerHTML = `
    <h3>${safeText(scenario.client.name)} - ${safeText(scenario.client.shoeType)}</h3>
    <p><strong>Profil:</strong> ${safeText(scenario.client.profile)}</p>
    <p><strong>Urgence:</strong> ${safeText(scenario.client.urgency)}</p>
    <p><strong>Demande:</strong> ${safeText(scenario.client.quote)}</p>
    <p><strong>Symptome observe:</strong> ${safeText(scenario.problem.symptom)}</p>
  `;
}

function renderDiagnosticProgress() {
  const scenario = state.currentScenario;
  if (!scenario) {
    ui.diagnosticProgress.textContent = "Indices: 0 / 2";
    return;
  }

  ui.diagnosticProgress.textContent = `Indices: ${scenario.discoveredClues.length} / ${scenario.problem.requiredClues}`;
}

function renderDiagnosticButtons() {
  const scenario = state.currentScenario;
  ui.diagnosticQuestions.innerHTML = "";

  diagnosticQuestions.forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn choice-btn";
    button.textContent = question.label;
    button.dataset.questionId = question.id;

    const alreadyAsked = Boolean(
      scenario && scenario.askedQuestionIds.includes(question.id)
    );
    button.disabled = state.mode !== "diagnostic" || !scenario || alreadyAsked;

    if (alreadyAsked) {
      button.classList.add("active");
      button.textContent = `${question.label} (deja analysee)`;
    }

    ui.diagnosticQuestions.appendChild(button);
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
    button.textContent = `${repair.label} (${repair.timeCost} min)`;
    button.title = repair.description;

    if (scenario && scenario.selectedRepairId === repair.id) {
      button.classList.add("active");
    }

    button.disabled = !scenario || state.mode !== "repair";
    ui.repairOptions.appendChild(button);
  });

  ui.validateRepairBtn.disabled = !(
    scenario && state.mode === "repair" && scenario.selectedRepairId
  );
}

function resetPanelsForNewClient() {
  ui.diagnosticFeedback.textContent = "";
  ui.resultBox.textContent = "";
  ui.resultBox.classList.remove("success", "fail");
  ui.toRepairBtn.disabled = true;
  ui.nextClientBtn.disabled = true;
  ui.nextClientBtn.textContent = "Client suivant";
  ui.timerValue.classList.remove("status-warn", "status-danger");
}

function updateTimerBadge() {
  const scenario = state.currentScenario;
  if (!scenario) {
    ui.timerValue.textContent = "Temps: 0s";
    ui.timerValue.classList.remove("status-warn", "status-danger");
    return;
  }

  const elapsedSeconds = Math.floor(scenario.elapsedMs / 1000);
  const remaining = Math.max(0, scenario.timeLimit - elapsedSeconds);
  ui.timerValue.textContent = `Temps: ${remaining}s`;

  ui.timerValue.classList.remove("status-warn", "status-danger");
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

  const enoughClues = scenario.discoveredClues.length >= scenario.problem.requiredClues;
  const enoughQuestions = scenario.askedQuestionIds.length >= 3;
  return enoughClues || enoughQuestions;
}

function renderControlsState() {
  const scenario = state.currentScenario;
  ui.startDayBtn.disabled = state.mode !== "idle";
  ui.toRepairBtn.disabled = !(state.mode === "diagnostic" && canMoveToRepair(scenario));
  ui.nextClientBtn.disabled = !(
    state.mode === "result" || state.mode === "gameover"
  );

  renderRepairButtons();
}

function setMode(nextMode) {
  state.mode = nextMode;
  renderControlsState();
}

function showScenario(index) {
  if (index >= state.dayQueue.length) {
    state.currentScenario = null;
    setMode("idle");
    state.day += 1;
    renderHud();
    renderQueue();
    setClientWaitingState(
      `Journee terminee. Pret pour le jour ${state.day}.`
    );
    ui.startDayBtn.textContent = `Demarrer le jour ${state.day}`;
    ui.diagnosticFeedback.textContent = "";
    ui.resultBox.textContent =
      "Debrief: accordez-vous 30 secondes pour relire les conseils metier du journal.";
    pushLog("Journee terminee. L'atelier prepare le prochain service.");
    return;
  }

  state.queueIndex = index;
  state.currentScenario = state.dayQueue[index];
  state.currentScenario.elapsedMs = 0;

  resetPanelsForNewClient();
  renderCurrentClientCard();
  renderDiagnosticProgress();
  renderDiagnosticButtons();
  updateTimerBadge();
  renderQueue();
  setMode("diagnostic");

  pushLog(`Nouveau client: ${state.currentScenario.client.name}.`);
}

function startDay() {
  if (!state.clients.length) {
    pushLog("Impossible de demarrer: la base clients est vide.", "danger");
    return;
  }

  state.dayQueue = createDayQueue(state.clients, state.day);
  state.queueIndex = 0;

  if (!state.dayQueue.length) {
    pushLog("Aucun scenario genere pour cette journee.", "danger");
    return;
  }

  ui.startDayBtn.textContent = "Journee en cours";
  showScenario(0);
}

function askDiagnosticQuestion(questionId) {
  const scenario = state.currentScenario;
  if (!scenario || state.mode !== "diagnostic") {
    return;
  }

  if (scenario.askedQuestionIds.includes(questionId)) {
    return;
  }

  scenario.askedQuestionIds.push(questionId);

  const answer = resolveQuestion(scenario.problem, questionId);
  ui.diagnosticFeedback.textContent = answer.text;

  if (answer.useful) {
    scenario.discoveredClues.push(answer.text);
  }

  renderDiagnosticProgress();
  renderDiagnosticButtons();
  renderControlsState();

  if (answer.useful) {
    pushLog("Indice utile obtenu pendant le diagnostic.");
  } else {
    pushLog("Question analysee, mais indice faible.");
  }
}

function moveToRepair() {
  if (!state.currentScenario || state.mode !== "diagnostic") {
    return;
  }

  setMode("repair");
  ui.diagnosticFeedback.textContent =
    "Diagnostic clos. Selectionnez la reparation la plus adaptee.";

  pushLog("Passage en zone reparation.");
}

function selectRepair(repairId) {
  const scenario = state.currentScenario;
  if (!scenario || state.mode !== "repair") {
    return;
  }

  scenario.selectedRepairId = repairId;
  renderRepairButtons();
}

function renderOutcome(outcome, scenario, chosenRepair, timedOut = false) {
  ui.resultBox.classList.remove("success", "fail");

  const correctRepair = getRepairById(scenario.problem.correctRepair);
  let message = "";

  if (timedOut) {
    ui.resultBox.classList.add("fail");
    message = `Temps ecoule. Score ${outcome.deltaScore}, reputation ${outcome.reputationDelta}. Reparation attendue: ${correctRepair?.label || "inconnue"}.`;
  } else if (outcome.success) {
    ui.resultBox.classList.add("success");
    message = `Succes. ${chosenRepair?.label || "Reparation"} validee. +${outcome.deltaScore} points, reputation ${outcome.reputationDelta >= 0 ? "+" : ""}${outcome.reputationDelta}. Conseil: ${scenario.problem.tip}`;
  } else {
    ui.resultBox.classList.add("fail");
    message = `Erreur de diagnostic. ${chosenRepair?.label || "Intervention"} n'etait pas adaptee. ${outcome.deltaScore} points, reputation ${outcome.reputationDelta}. Reparation correcte: ${correctRepair?.label || "inconnue"}.`;
  }

  ui.resultBox.textContent = message;
}

function finishScenario({ timedOut = false } = {}) {
  const scenario = state.currentScenario;
  if (!scenario) {
    return;
  }

  let outcome;
  let chosenRepair = null;

  if (timedOut) {
    outcome = scoreSystem.applyTimeoutPenalty();
  } else {
    if (!scenario.selectedRepairId) {
      ui.resultBox.textContent = "Selectionnez une reparation avant validation.";
      return;
    }

    chosenRepair = getRepairById(scenario.selectedRepairId);
    const success = scenario.selectedRepairId === scenario.problem.correctRepair;
    const elapsedSeconds = Math.floor(scenario.elapsedMs / 1000);
    const timeSpent = elapsedSeconds + (chosenRepair?.timeCost || 10);

    outcome = scoreSystem.applyRepairOutcome({
      success,
      baseScore: scenario.problem.baseScore,
      timeSpent,
      timeLimit: scenario.timeLimit,
      cluesFound: scenario.discoveredClues.length,
      cluesRequired: scenario.problem.requiredClues,
      reputationImpact: scenario.problem.reputation,
    });

    if (success && scenario.discoveredClues.length >= scenario.problem.requiredClues) {
      scoreSystem.addEducationalBonus(8);
      pushLog("Bonus pedagogique accorde pour diagnostic complet.");
    }
  }

  renderOutcome(outcome, scenario, chosenRepair, timedOut);
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
    pushLog("Client mecontent, revoir la methode.", "warn");
  }
}

function validateRepair() {
  if (state.mode !== "repair") {
    return;
  }
  finishScenario({ timedOut: false });
}

function nextClient() {
  if (state.mode === "gameover") {
    scoreSystem.reset({ score: 0, reputation: 50, streak: 0 });
    state.day = 1;
    state.dayQueue = [];
    state.queueIndex = 0;
    state.currentScenario = null;
    ui.startDayBtn.textContent = "Demarrer la journee";
    setMode("idle");
    renderHud();
    renderQueue();
    renderDiagnosticProgress();
    renderDiagnosticButtons();
    renderRepairButtons();
    updateTimerBadge();
    setClientWaitingState(
      "Atelier reouvert. Cliquez sur Demarrer la journee pour reprendre."
    );
    ui.resultBox.textContent = "";
    ui.nextClientBtn.textContent = "Client suivant";
    ui.nextClientBtn.disabled = true;
    pushLog("Nouvelle partie lancee apres fermeture temporaire.");
    return;
  }

  if (state.mode !== "result") {
    return;
  }

  showScenario(state.queueIndex + 1);
}

function tick(seconds) {
  const scenarioActive =
    (state.mode === "diagnostic" || state.mode === "repair") &&
    state.currentScenario;

  state.visualClockMs += seconds * 1000;

  if (!scenarioActive) {
    return;
  }

  state.currentScenario.elapsedMs += seconds * 1000;
  updateTimerBadge();

  if (state.currentScenario.elapsedMs >= state.currentScenario.timeLimit * 1000) {
    finishScenario({ timedOut: true });
  }
}

function drawWorkshop() {
  const ctx = canvasCtx;
  const width = ui.atelierCanvas.width;
  const height = ui.atelierCanvas.height;

  ctx.clearRect(0, 0, width, height);

  // Background light and workshop floor.
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, "#f9e5bf");
  bg.addColorStop(1, "#d0a674");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#7d5f3b";
  ctx.fillRect(0, height - 46, width, 46);

  // Workbench.
  ctx.fillStyle = "#5f3f27";
  ctx.fillRect(85, 108, 285, 16);
  ctx.fillRect(95, 124, 12, 46);
  ctx.fillRect(348, 124, 12, 46);

  // Shelves.
  ctx.fillStyle = "#8f6b44";
  ctx.fillRect(520, 58, 250, 10);
  ctx.fillRect(520, 92, 250, 10);

  // Decorative boxes.
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

  // Shoe icon indicates active customer.
  ctx.fillStyle = waitingClient && blink ? "#2f6b45" : "#3f3428";
  ctx.beginPath();
  ctx.ellipse(260, 100, 52, 20, -0.16, 0, Math.PI * 2);
  ctx.fill();

  // Counter text.
  ctx.fillStyle = "#1f2a22";
  ctx.font = "bold 19px Trebuchet MS";
  ctx.fillText(`Mode: ${state.mode}`, 25, 33);

  const rep = scoreSystem.getState().reputation;
  const repWidth = Math.round((Math.max(0, rep) / 100) * 180);

  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.fillRect(24, 44, 180, 16);
  ctx.fillStyle = rep > 35 ? "#2f6b45" : "#8f2d2d";
  ctx.fillRect(24, 44, repWidth, 16);
  ctx.strokeStyle = "#58462f";
  ctx.strokeRect(24, 44, 180, 16);

  if (state.currentScenario) {
    const elapsed = Math.floor(state.currentScenario.elapsedMs / 1000);
    const timeText = `Chrono client: ${elapsed}s / ${state.currentScenario.timeLimit}s`;
    ctx.fillStyle = "#1f2a22";
    ctx.font = "15px Trebuchet MS";
    ctx.fillText(timeText, 25, 86);
  }
}

function frame(time) {
  const deltaSeconds = Math.min(0.1, (time - state.previousTime) / 1000);
  state.previousTime = time;

  tick(deltaSeconds);
  drawWorkshop();
  state.rafId = window.requestAnimationFrame(frame);
}

function installHooksForTesting() {
  window.render_game_to_text = () => {
    const scenario = state.currentScenario;
    const payload = {
      coordinateSystem: "canvas origin top-left, x right, y down",
      mode: state.mode,
      day: state.day,
      queue: {
        currentIndex: state.queueIndex,
        total: state.dayQueue.length,
      },
      currentClient: scenario
        ? {
            name: scenario.client.name,
            shoeType: scenario.client.shoeType,
            issue: scenario.problem.title,
            elapsedSeconds: Math.floor(scenario.elapsedMs / 1000),
            timeLimitSeconds: scenario.timeLimit,
            askedQuestions: [...scenario.askedQuestionIds],
            cluesFound: scenario.discoveredClues.length,
            selectedRepairId: scenario.selectedRepairId,
          }
        : null,
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

  ui.diagnosticQuestions.addEventListener("click", (event) => {
    const target = event.target.closest("button[data-question-id]");
    if (!target) {
      return;
    }

    askDiagnosticQuestion(target.dataset.questionId);
  });

  ui.repairOptions.addEventListener("click", (event) => {
    const target = event.target.closest("button[data-repair-id]");
    if (!target) {
      return;
    }

    selectRepair(target.dataset.repairId);
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
  renderDiagnosticProgress();
  renderDiagnosticButtons();
  renderRepairButtons();
  updateTimerBadge();
  setMode("idle");

  loadClients();
  drawWorkshop();

  if (state.rafId) {
    window.cancelAnimationFrame(state.rafId);
  }
  state.previousTime = performance.now();
  state.rafId = window.requestAnimationFrame(frame);
}

init();
