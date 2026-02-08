(function () {
  var root = document.querySelector('[data-cobbler-game]');

  if (!root) {
    return;
  }

  var STORAGE_KEY = 'cobblerWorkshopSaveV1';
  var MAX_LOG_ITEMS = 16;

  var ISSUE_LIBRARY = [
    { key: 'soleLoose', mode: 'clicks' },
    { key: 'heelWorn', mode: 'timing' },
    { key: 'looseStitch', mode: 'clicks' },
    { key: 'dryLeather', mode: 'timing' }
  ];

  var CLIENT_NAMES = {
    fr: ['Camille', 'Nora', 'Amine', 'Lucas', 'Sarah', 'Milo', 'Lina', 'Yanis', 'Jules', 'Maude'],
    en: ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Drew', 'Parker', 'Avery', 'Quinn']
  };

  var I18N = {
    fr: {
      ui: {
        introText: 'Gere ton atelier: diagnostique, repare, finalise, puis fais grimper ta reputation.',
        orderTitle: 'Commande',
        clientLabel: 'Client',
        difficultyLabel: 'Difficulte',
        timerLabel: 'Temps restant',
        issuesTitle: 'Problemes',
        stepsTitle: 'Etapes',
        workshopTitle: 'Atelier',
        toolsTitle: 'Outils',
        toolDiagnostic: 'Diagnostic',
        toolRepair: 'Reparation',
        toolFinish: 'Finition',
        scoreLabel: 'Score',
        bestScoreLabel: 'Meilleur score',
        completedLabel: 'Commandes completees',
        reputationLabel: 'Reputation',
        levelLabel: 'Niveau',
        satisfactionLabel: 'Satisfaction client',
        newOrderBtn: 'Nouveau client',
        resetProgressBtn: 'Reinitialiser progression',
        shortcutsText: 'Raccourcis clavier: N (nouveau client), D (diagnostic), R (reparation), F (finition).',
        logTitle: 'Journal atelier',
        noOrderYet: 'Aucune commande en cours.',
        miniTimingTitle: 'Mini-jeu precision',
        miniTimingAction: 'Valider le geste',
        miniClicksTitle: 'Mini-jeu cadence',
        miniClicksAction: 'Action repetee',
        miniFinishTitle: 'Mini-jeu finition',
        miniFinishAction: 'Finaliser',
        timeShort: 'Temps'
      },
      status: {
        pending: 'en attente',
        fixed: 'repare',
        rough: 'fragile'
      },
      difficulty: {
        single: 'Simple',
        double: 'Double reparation'
      },
      levelWord: 'Niv.',
      steps: {
        diagnosis: 'Diagnostiquer',
        repair: 'Reparer',
        finish: 'Finition'
      },
      stepState: {
        todo: 'a faire',
        doing: 'en cours',
        done: 'ok'
      },
      stage: {
        idleTitle: 'Atelier pret',
        idleDesc: 'Clique sur "Nouveau client" pour lancer une commande.',
        diagnosisTitle: 'Diagnostic',
        diagnosisDesc: 'Utilise l\'outil Diagnostic pour identifier la bonne solution.',
        repairTitle: 'Reparation',
        repairDesc: 'Reparation {index}/{total}: {issue}. Mode: {mode}.',
        finishTitle: 'Finition',
        finishDesc: 'Lance la finition pour livrer une paire propre.',
        doneTitle: 'Commande terminee',
        doneDesc: 'Commande livree. Lance un nouveau client pour continuer.'
      },
      modes: {
        timing: 'barre de timing',
        clicks: 'clics repetes'
      },
      miniText: {
        timing: 'Precision requise pour: {issue}. Clique quand le curseur passe en zone verte.',
        clicks: 'Cadence requise pour: {issue}. Clique vite pour remplir la barre avant la fin.',
        finish: 'Stoppe dans la zone verte pour une finition nette.'
      },
      issues: {
        soleLoose: {
          label: 'Semelle decollee',
          solution: 'Nettoyer, encoller, puis mettre sous presse.'
        },
        heelWorn: {
          label: 'Talon use',
          solution: 'Reformer et poser un nouveau bonbout avec precision.'
        },
        looseStitch: {
          label: 'Couture lache',
          solution: 'Recoudre en tension constante, puis verifier la ligne.'
        },
        dryLeather: {
          label: 'Cuir sec ou craquele',
          solution: 'Nettoyer, nourrir, puis lisser les zones seches.'
        }
      },
      logs: {
        workshopReady: 'Atelier pret pour une nouvelle commande.',
        noOrder: 'Aucune commande active. Lance un nouveau client.',
        miniLocked: 'Mini-jeu en cours: termine l\'action actuelle.',
        newOrder: 'Nouveau client: {client}. Probleme(s): {issues}.',
        diagnosisDone: 'Diagnostic pose: {solutions}.',
        needDiagnosis: 'Mauvaise action: commence par le diagnostic.',
        diagnosisAlreadyDone: 'Diagnostic deja fait. Passe a la reparation.',
        wrongDuringRepair: 'Mauvaise action: termine les reparations avant finition.',
        wrongDuringFinish: 'Mauvaise action pour l\'etape actuelle.',
        repairStarted: 'Reparation lancee sur: {issue}.',
        repairSuccess: 'Reparation reussie: {issue}.',
        repairFail: 'Reparation fragile: {issue}.',
        nextRepair: 'Prochaine reparation: {issue}.',
        allRepairsDone: 'Reparations terminees. Passe en finition.',
        finishSuccess: 'Finition validee.',
        finishFail: 'Finition ratee, rendu irregulier.',
        speedBonus: 'Bonus rapidite: +{points}.',
        timerPenalty: 'Temps ecoule: malus score + satisfaction.',
        orderSummary: 'Commande livree avec {stars} etoiles ({fixed}/{total} reparations solides).',
        levelUp: 'Niveau {level} atteint. Commandes plus difficiles debloquees.',
        progressReset: 'Progression reinitialisee.'
      },
      prompts: {
        reset: 'Reinitialiser score, reputation et commandes sauvegardees ?'
      },
      languageToggleLabel: 'Passer en anglais'
    },
    en: {
      ui: {
        introText: 'Run your workshop: diagnose, repair, finish, and grow your reputation.',
        orderTitle: 'Order',
        clientLabel: 'Client',
        difficultyLabel: 'Difficulty',
        timerLabel: 'Time left',
        issuesTitle: 'Issues',
        stepsTitle: 'Steps',
        workshopTitle: 'Workshop',
        toolsTitle: 'Tools',
        toolDiagnostic: 'Diagnose',
        toolRepair: 'Repair',
        toolFinish: 'Finish',
        scoreLabel: 'Score',
        bestScoreLabel: 'Best score',
        completedLabel: 'Completed orders',
        reputationLabel: 'Reputation',
        levelLabel: 'Level',
        satisfactionLabel: 'Client satisfaction',
        newOrderBtn: 'New client',
        resetProgressBtn: 'Reset progress',
        shortcutsText: 'Keyboard shortcuts: N (new client), D (diagnose), R (repair), F (finish).',
        logTitle: 'Workshop log',
        noOrderYet: 'No active order yet.',
        miniTimingTitle: 'Precision mini-game',
        miniTimingAction: 'Apply move',
        miniClicksTitle: 'Rhythm mini-game',
        miniClicksAction: 'Repeat action',
        miniFinishTitle: 'Finishing mini-game',
        miniFinishAction: 'Finalize',
        timeShort: 'Time'
      },
      status: {
        pending: 'pending',
        fixed: 'fixed',
        rough: 'rough'
      },
      difficulty: {
        single: 'Single issue',
        double: 'Double repair'
      },
      levelWord: 'Lv.',
      steps: {
        diagnosis: 'Diagnose',
        repair: 'Repair',
        finish: 'Finish'
      },
      stepState: {
        todo: 'todo',
        doing: 'doing',
        done: 'done'
      },
      stage: {
        idleTitle: 'Workshop ready',
        idleDesc: 'Press "New client" to start an order.',
        diagnosisTitle: 'Diagnosis',
        diagnosisDesc: 'Use the Diagnose tool to reveal the right solution.',
        repairTitle: 'Repair',
        repairDesc: 'Repair {index}/{total}: {issue}. Mode: {mode}.',
        finishTitle: 'Finishing',
        finishDesc: 'Run finishing to deliver a clean pair.',
        doneTitle: 'Order completed',
        doneDesc: 'Order delivered. Start a new client to continue.'
      },
      modes: {
        timing: 'timing bar',
        clicks: 'repeated clicks'
      },
      miniText: {
        timing: 'Precision required for: {issue}. Click when cursor crosses the green zone.',
        clicks: 'Rhythm required for: {issue}. Click fast to fill the bar before timeout.',
        finish: 'Stop inside the green zone for a clean finish.'
      },
      issues: {
        soleLoose: {
          label: 'Loose outsole',
          solution: 'Clean, glue, and press evenly until bonded.'
        },
        heelWorn: {
          label: 'Worn heel',
          solution: 'Rebuild profile and place a new top lift with precision.'
        },
        looseStitch: {
          label: 'Loose stitching',
          solution: 'Restitch with constant tension and check the seam line.'
        },
        dryLeather: {
          label: 'Dry or cracked leather',
          solution: 'Clean, condition, and smooth the dry sections.'
        }
      },
      logs: {
        workshopReady: 'Workshop ready for a new order.',
        noOrder: 'No active order. Start a new client.',
        miniLocked: 'Mini-game running: finish the current action first.',
        newOrder: 'New client: {client}. Issue(s): {issues}.',
        diagnosisDone: 'Diagnosis complete: {solutions}.',
        needDiagnosis: 'Wrong action: start with diagnosis first.',
        diagnosisAlreadyDone: 'Diagnosis already done. Move to repair.',
        wrongDuringRepair: 'Wrong action: finish repairs before finishing stage.',
        wrongDuringFinish: 'Wrong action for the current stage.',
        repairStarted: 'Repair started on: {issue}.',
        repairSuccess: 'Repair successful: {issue}.',
        repairFail: 'Repair is rough: {issue}.',
        nextRepair: 'Next repair: {issue}.',
        allRepairsDone: 'Repairs done. Move to finishing.',
        finishSuccess: 'Finishing successful.',
        finishFail: 'Finishing failed, uneven output.',
        speedBonus: 'Speed bonus: +{points}.',
        timerPenalty: 'Time expired: score and satisfaction penalty.',
        orderSummary: 'Order delivered with {stars} stars ({fixed}/{total} strong repairs).',
        levelUp: 'Level {level} reached. Harder orders unlocked.',
        progressReset: 'Progress reset complete.'
      },
      prompts: {
        reset: 'Reset saved score, reputation, and completed orders?'
      },
      languageToggleLabel: 'Switch to French'
    }
  };

  var elements = {
    langToggle: root.querySelector('[data-lang-toggle]'),
    orderClient: root.querySelector('[data-order-client]'),
    orderDifficulty: root.querySelector('[data-order-difficulty]'),
    orderTimer: root.querySelector('[data-order-timer]'),
    issuesList: root.querySelector('[data-order-issues]'),
    stepDiagnosis: root.querySelector('[data-step-item="diagnosis"]'),
    stepRepair: root.querySelector('[data-step-item="repair"]'),
    stepFinish: root.querySelector('[data-step-item="finish"]'),
    stageName: root.querySelector('[data-stage-name]'),
    stageDesc: root.querySelector('[data-stage-desc]'),
    miniPanels: {
      timing: root.querySelector('[data-mini="timing"]'),
      clicks: root.querySelector('[data-mini="clicks"]'),
      finish: root.querySelector('[data-mini="finish"]')
    },
    miniTimingText: root.querySelector('[data-mini-timing-text]'),
    miniClicksText: root.querySelector('[data-mini-clicks-text]'),
    miniFinishText: root.querySelector('[data-mini-finish-text]'),
    timingZone: root.querySelector('[data-timing-zone]'),
    timingCursor: root.querySelector('[data-timing-cursor]'),
    finishZone: root.querySelector('[data-finish-zone]'),
    finishCursor: root.querySelector('[data-finish-cursor]'),
    clicksFill: root.querySelector('[data-clicks-fill]'),
    clicksCounter: root.querySelector('[data-clicks-counter]'),
    actionTiming: root.querySelector('[data-action-timing]'),
    actionClicks: root.querySelector('[data-action-clicks]'),
    actionFinish: root.querySelector('[data-action-finish]'),
    toolButtons: Array.prototype.slice.call(root.querySelectorAll('[data-tool]')),
    toolDiagnostic: root.querySelector('[data-tool="diagnostic"]'),
    toolRepair: root.querySelector('[data-tool="repair"]'),
    toolFinish: root.querySelector('[data-tool="finish"]'),
    score: root.querySelector('[data-stat-score]'),
    best: root.querySelector('[data-stat-best]'),
    completed: root.querySelector('[data-stat-completed]'),
    reputation: root.querySelector('[data-stat-reputation]'),
    level: root.querySelector('[data-stat-level]'),
    satisfaction: root.querySelector('[data-stat-satisfaction]'),
    satisfactionStars: root.querySelector('[data-satisfaction-stars]'),
    newOrder: root.querySelector('[data-new-order]'),
    resetSave: root.querySelector('[data-reset-save]'),
    logList: root.querySelector('[data-log-list]')
  };

  if (
    !elements.langToggle ||
    !elements.orderClient ||
    !elements.orderDifficulty ||
    !elements.orderTimer ||
    !elements.issuesList ||
    !elements.stepDiagnosis ||
    !elements.stepRepair ||
    !elements.stepFinish ||
    !elements.stageName ||
    !elements.stageDesc ||
    !elements.miniPanels.timing ||
    !elements.miniPanels.clicks ||
    !elements.miniPanels.finish ||
    !elements.miniTimingText ||
    !elements.miniClicksText ||
    !elements.miniFinishText ||
    !elements.timingZone ||
    !elements.timingCursor ||
    !elements.finishZone ||
    !elements.finishCursor ||
    !elements.clicksFill ||
    !elements.clicksCounter ||
    !elements.actionTiming ||
    !elements.actionClicks ||
    !elements.actionFinish ||
    !elements.toolDiagnostic ||
    !elements.toolRepair ||
    !elements.toolFinish ||
    !elements.score ||
    !elements.best ||
    !elements.completed ||
    !elements.reputation ||
    !elements.level ||
    !elements.satisfaction ||
    !elements.satisfactionStars ||
    !elements.newOrder ||
    !elements.resetSave ||
    !elements.logList
  ) {
    return;
  }

  var state = {
    lang: root.getAttribute('data-lang') === 'en' ? 'en' : 'fr',
    score: 0,
    bestScore: 0,
    completedOrders: 0,
    reputation: 0,
    level: 1,
    currentOrder: null,
    stage: 'idle',
    diagnosed: false,
    repairIndex: 0,
    satisfaction: 5,
    actionLock: false,
    orderSecondsLeft: 0,
    orderSecondsTotal: 0,
    timerIntervalId: 0,
    timerPenaltyApplied: false,
    mini: {
      type: 'none',
      context: 'none',
      issueKey: null,
      rafId: 0,
      intervalId: 0,
      cursor: 0,
      direction: 1,
      speed: 0,
      zoneStart: 0,
      zoneEnd: 0,
      lastTs: 0,
      required: 0,
      progress: 0,
      deadline: 0,
      decayRate: 0,
      gainPerClick: 0
    }
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function pad2(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function formatTimer(seconds) {
    var s = Math.max(0, Math.floor(seconds));
    var mins = Math.floor(s / 60);
    var rem = s % 60;
    return mins + ':' + pad2(rem);
  }

  function starsString(value) {
    var safe = clamp(Math.round(value), 1, 5);
    return '★★★★★'.slice(0, safe) + '☆☆☆☆☆'.slice(0, 5 - safe);
  }

  function levelFromReputation(reputation) {
    return clamp(1 + Math.floor(reputation / 60), 1, 10);
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function interpolate(template, replacements) {
    var output = template;
    Object.keys(replacements).forEach(function (key) {
      output = output.replace(new RegExp('\\{' + key + '\\}', 'g'), replacements[key]);
    });
    return output;
  }

  function langPack() {
    return I18N[state.lang];
  }

  function issueText(issueKey) {
    return langPack().issues[issueKey];
  }

  function modeText(mode) {
    return langPack().modes[mode];
  }

  function issueLabel(issueKey) {
    return issueText(issueKey).label;
  }

  function issueSolution(issueKey) {
    return issueText(issueKey).solution;
  }

  function nowLabel() {
    var date = new Date();
    return pad2(date.getHours()) + ':' + pad2(date.getMinutes()) + ':' + pad2(date.getSeconds());
  }

  function addLog(message) {
    var item = document.createElement('li');
    item.textContent = '[' + nowLabel() + '] ' + message;
    elements.logList.appendChild(item);

    while (elements.logList.children.length > MAX_LOG_ITEMS) {
      elements.logList.removeChild(elements.logList.firstElementChild);
    }

    elements.logList.scrollTop = elements.logList.scrollHeight;
  }

  function clearLogs() {
    elements.logList.innerHTML = '';
  }

  function setIssueVisual(issueKey) {
    root.setAttribute('data-issue', issueKey || 'none');
  }

  function saveProgress() {
    var payload = {
      score: state.score,
      bestScore: state.bestScore,
      completedOrders: state.completedOrders,
      reputation: state.reputation
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      // ignore storage issues
    }
  }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return;
      }

      state.score = Number(parsed.score) || 0;
      state.bestScore = Number(parsed.bestScore) || 0;
      state.completedOrders = Number(parsed.completedOrders) || 0;
      state.reputation = Number(parsed.reputation) || 0;
      state.level = levelFromReputation(state.reputation);
    } catch (error) {
      // ignore malformed storage
    }
  }

  function hideAllMiniPanels() {
    elements.miniPanels.timing.hidden = true;
    elements.miniPanels.clicks.hidden = true;
    elements.miniPanels.finish.hidden = true;
  }

  function stopOrderTimer() {
    if (state.timerIntervalId) {
      window.clearInterval(state.timerIntervalId);
      state.timerIntervalId = 0;
    }
  }

  function clearMini() {
    if (state.mini.rafId) {
      window.cancelAnimationFrame(state.mini.rafId);
    }

    if (state.mini.intervalId) {
      window.clearInterval(state.mini.intervalId);
    }

    state.mini = {
      type: 'none',
      context: 'none',
      issueKey: null,
      rafId: 0,
      intervalId: 0,
      cursor: 0,
      direction: 1,
      speed: 0,
      zoneStart: 0,
      zoneEnd: 0,
      lastTs: 0,
      required: 0,
      progress: 0,
      deadline: 0,
      decayRate: 0,
      gainPerClick: 0
    };

    hideAllMiniPanels();
    state.actionLock = false;
  }

  function updateButtons() {
    var activeOrder = !!state.currentOrder && state.stage !== 'done';

    for (var i = 0; i < elements.toolButtons.length; i += 1) {
      elements.toolButtons[i].disabled = !activeOrder || state.actionLock;
    }

    elements.actionTiming.disabled = !(state.mini.type === 'timing' && state.mini.context === 'repair');
    elements.actionClicks.disabled = !(state.mini.type === 'clicks');
    elements.actionFinish.disabled = !(state.mini.type === 'timing' && state.mini.context === 'finish');
  }

  function applyPenalty(scorePenalty, starPenalty, message) {
    state.score = Math.max(0, state.score - scorePenalty);
    state.satisfaction = clamp(state.satisfaction - starPenalty, 1, 5);
    if (message) {
      addLog(message);
    }
    renderStats();
  }

  function applyReward(scoreGain) {
    state.score = Math.max(0, state.score + scoreGain);
    renderStats();
  }

  function getCurrentIssue() {
    if (!state.currentOrder) {
      return null;
    }
    return state.currentOrder.issues[state.repairIndex] || null;
  }

  function buildStepState(isDone, isActive) {
    var pack = langPack();
    if (isDone) {
      return pack.stepState.done;
    }
    if (isActive) {
      return pack.stepState.doing;
    }
    return pack.stepState.todo;
  }

  function setStepLine(element, label, isDone, isActive) {
    element.textContent = label + ' - ' + buildStepState(isDone, isActive);
    element.classList.toggle('is-done', isDone);
    element.classList.toggle('is-active', isActive);
  }

  function renderSteps() {
    var hasOrder = !!state.currentOrder;
    var totalIssues = hasOrder ? state.currentOrder.issues.length : 0;
    var repairDone = hasOrder && state.repairIndex >= totalIssues && state.stage !== 'repair';

    setStepLine(
      elements.stepDiagnosis,
      langPack().steps.diagnosis,
      state.diagnosed,
      hasOrder && state.stage === 'diagnosis'
    );

    setStepLine(
      elements.stepRepair,
      langPack().steps.repair,
      repairDone,
      hasOrder && state.stage === 'repair'
    );

    setStepLine(
      elements.stepFinish,
      langPack().steps.finish,
      hasOrder && state.stage === 'done',
      hasOrder && state.stage === 'finishing'
    );
  }

  function renderIssues() {
    elements.issuesList.innerHTML = '';

    if (!state.currentOrder) {
      var empty = document.createElement('li');
      empty.textContent = langPack().ui.noOrderYet;
      elements.issuesList.appendChild(empty);
      return;
    }

    for (var i = 0; i < state.currentOrder.issues.length; i += 1) {
      var issue = state.currentOrder.issues[i];
      var line = document.createElement('li');
      line.className = 'cg-issue-item';

      var strong = document.createElement('strong');
      strong.textContent = issueLabel(issue.key);
      line.appendChild(strong);

      var status = document.createElement('span');
      status.className = 'cg-issue-status';
      status.setAttribute('data-status', issue.status);
      status.textContent = langPack().status[issue.status];
      line.appendChild(status);

      if (state.diagnosed) {
        var solution = document.createElement('span');
        solution.className = 'cg-issue-solution';
        solution.textContent = issueSolution(issue.key);
        line.appendChild(solution);
      }

      elements.issuesList.appendChild(line);
    }
  }

  function renderOrderPanel() {
    if (!state.currentOrder) {
      elements.orderClient.textContent = '-';
      elements.orderDifficulty.textContent = '-';
      elements.orderTimer.textContent = '--:--';
      renderIssues();
      renderSteps();
      return;
    }

    var difficultyLabel = state.currentOrder.issues.length > 1
      ? langPack().difficulty.double
      : langPack().difficulty.single;

    elements.orderClient.textContent = state.currentOrder.client;
    elements.orderDifficulty.textContent =
      difficultyLabel + ' · ' + langPack().levelWord + ' ' + state.level;
    elements.orderTimer.textContent = formatTimer(state.orderSecondsLeft);

    renderIssues();
    renderSteps();
  }

  function renderStage() {
    var pack = langPack();

    if (!state.currentOrder) {
      elements.stageName.textContent = pack.stage.idleTitle;
      elements.stageDesc.textContent = pack.stage.idleDesc;
      setIssueVisual('none');
      return;
    }

    if (state.stage === 'diagnosis') {
      elements.stageName.textContent = pack.stage.diagnosisTitle;
      elements.stageDesc.textContent = pack.stage.diagnosisDesc;
      setIssueVisual(state.currentOrder.issues[0].key);
      return;
    }

    if (state.stage === 'repair') {
      var issue = getCurrentIssue();

      if (!issue) {
        elements.stageName.textContent = pack.stage.repairTitle;
        elements.stageDesc.textContent = pack.stage.finishDesc;
        setIssueVisual('none');
        return;
      }

      elements.stageName.textContent = pack.stage.repairTitle;
      elements.stageDesc.textContent = interpolate(pack.stage.repairDesc, {
        index: String(state.repairIndex + 1),
        total: String(state.currentOrder.issues.length),
        issue: issueLabel(issue.key),
        mode: modeText(issue.mode)
      });
      setIssueVisual(issue.key);
      return;
    }

    if (state.stage === 'finishing') {
      elements.stageName.textContent = pack.stage.finishTitle;
      elements.stageDesc.textContent = pack.stage.finishDesc;
      setIssueVisual('none');
      return;
    }

    elements.stageName.textContent = pack.stage.doneTitle;
    elements.stageDesc.textContent = pack.stage.doneDesc;
    setIssueVisual('none');
  }

  function renderStats() {
    elements.score.textContent = String(Math.round(state.score));
    elements.best.textContent = String(Math.round(state.bestScore));
    elements.completed.textContent = String(Math.round(state.completedOrders));
    elements.reputation.textContent = String(Math.round(state.reputation));
    elements.level.textContent = String(Math.round(state.level));
    elements.satisfaction.textContent = state.satisfaction + '/5';
    elements.satisfactionStars.textContent = starsString(state.satisfaction);
    elements.satisfactionStars.setAttribute('aria-label', state.satisfaction + '/5');
  }

  function renderAll() {
    renderOrderPanel();
    renderStage();
    renderStats();
    updateButtons();
  }

  function applyStaticTranslations() {
    var pack = langPack();

    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i += 1) {
      var key = nodes[i].getAttribute('data-i18n');
      if (pack.ui[key]) {
        nodes[i].textContent = pack.ui[key];
      }
    }

    elements.langToggle.textContent = state.lang === 'fr' ? 'EN' : 'FR';
    elements.langToggle.setAttribute('aria-label', pack.languageToggleLabel);

    if (state.mini.type === 'clicks') {
      updateClicksCounter();
    }
  }

  function pickIssueSet(level) {
    var issueCount = 1;
    if (level >= 2) {
      var chance = Math.min(0.35 + level * 0.09, 0.85);
      if (Math.random() < chance) {
        issueCount = 2;
      }
    }

    var pool = ISSUE_LIBRARY.slice();
    var selected = [];

    while (selected.length < issueCount && pool.length > 0) {
      var index = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(index, 1)[0]);
    }

    return selected;
  }

  function buildIssueTask(definition, level, issueCount) {
    var hardness = level + (issueCount - 1) * 1.5;

    return {
      key: definition.key,
      mode: definition.mode,
      status: 'pending',
      timingZone: clamp(34 - hardness * 2.2, 10, 34),
      timingSpeed: 35 + hardness * 5.5,
      requiredClicks: Math.round(10 + hardness * 2.3),
      clickDurationMs: Math.round(clamp(7800 - hardness * 330, 3800, 7800)),
      decayRate: clamp(0.16 + hardness * 0.02, 0.16, 0.42),
      gainPerClick: clamp(1.05 + hardness * 0.05, 1.05, 1.85)
    };
  }

  function generateOrder() {
    var selected = pickIssueSet(state.level);
    var issues = [];

    for (var i = 0; i < selected.length; i += 1) {
      issues.push(buildIssueTask(selected[i], state.level, selected.length));
    }

    var limit = clamp(72 - state.level * 3 - (issues.length - 1) * 8, 32, 72);

    return {
      id: 'CMD-' + Date.now().toString(36).slice(-6).toUpperCase(),
      client: randomItem(CLIENT_NAMES[state.lang]),
      issues: issues,
      timeLimit: Math.round(limit)
    };
  }

  function startOrderTimer() {
    stopOrderTimer();
    state.timerPenaltyApplied = false;

    state.timerIntervalId = window.setInterval(function () {
      if (!state.currentOrder || state.stage === 'done') {
        return;
      }

      state.orderSecondsLeft = Math.max(0, state.orderSecondsLeft - 1);

      if (state.orderSecondsLeft === 0 && !state.timerPenaltyApplied) {
        state.timerPenaltyApplied = true;
        applyPenalty(8, 1, langPack().logs.timerPenalty);
      }

      renderOrderPanel();
      renderStats();
    }, 1000);
  }

  function startNewOrder() {
    clearMini();
    stopOrderTimer();

    state.currentOrder = generateOrder();
    state.stage = 'diagnosis';
    state.diagnosed = false;
    state.repairIndex = 0;
    state.satisfaction = 5;
    state.orderSecondsTotal = state.currentOrder.timeLimit;
    state.orderSecondsLeft = state.currentOrder.timeLimit;

    var issueNames = state.currentOrder.issues.map(function (issue) {
      return issueLabel(issue.key);
    }).join(', ');

    addLog(interpolate(langPack().logs.newOrder, {
      client: state.currentOrder.client,
      issues: issueNames
    }));

    hideAllMiniPanels();
    startOrderTimer();
    renderAll();
  }

  function completeDiagnosis() {
    if (!state.currentOrder) {
      return;
    }

    state.diagnosed = true;
    state.stage = 'repair';
    applyReward(6);

    var solutionText = state.currentOrder.issues.map(function (issue) {
      return issueLabel(issue.key) + ' -> ' + issueSolution(issue.key);
    }).join(' | ');

    addLog(interpolate(langPack().logs.diagnosisDone, {
      solutions: solutionText
    }));

    renderAll();
  }

  function beginTimingMiniGame(context, issue) {
    clearMini();

    state.actionLock = true;
    state.mini.type = 'timing';
    state.mini.context = context;
    state.mini.issueKey = issue ? issue.key : null;
    state.mini.speed = context === 'finish'
      ? 44 + state.level * 3.2
      : issue.timingSpeed;

    var zoneSize = context === 'finish'
      ? clamp(22 - state.level * 1.4, 9, 24)
      : issue.timingZone;

    var zoneStart = Math.random() * (100 - zoneSize);
    state.mini.zoneStart = zoneStart;
    state.mini.zoneEnd = zoneStart + zoneSize;
    state.mini.cursor = Math.random() * 100;
    state.mini.direction = Math.random() > 0.5 ? 1 : -1;
    state.mini.lastTs = 0;

    var zoneElement = context === 'finish' ? elements.finishZone : elements.timingZone;
    var cursorElement = context === 'finish' ? elements.finishCursor : elements.timingCursor;

    zoneElement.style.left = zoneStart.toFixed(2) + '%';
    zoneElement.style.width = zoneSize.toFixed(2) + '%';
    cursorElement.style.left = state.mini.cursor.toFixed(2) + '%';

    if (context === 'finish') {
      elements.miniFinishText.textContent = langPack().miniText.finish;
      elements.miniPanels.finish.hidden = false;
    } else {
      elements.miniTimingText.textContent = interpolate(langPack().miniText.timing, {
        issue: issueLabel(issue.key)
      });
      elements.miniPanels.timing.hidden = false;
    }

    function tick(ts) {
      if (state.mini.type !== 'timing' || state.mini.context !== context) {
        return;
      }

      if (!state.mini.lastTs) {
        state.mini.lastTs = ts;
      }

      var dt = (ts - state.mini.lastTs) / 1000;
      state.mini.lastTs = ts;

      state.mini.cursor += state.mini.direction * state.mini.speed * dt;

      if (state.mini.cursor > 100) {
        state.mini.cursor = 100;
        state.mini.direction = -1;
      }

      if (state.mini.cursor < 0) {
        state.mini.cursor = 0;
        state.mini.direction = 1;
      }

      cursorElement.style.left = state.mini.cursor.toFixed(2) + '%';
      state.mini.rafId = window.requestAnimationFrame(tick);
    }

    state.mini.rafId = window.requestAnimationFrame(tick);
    updateButtons();
  }

  function updateClicksCounter() {
    if (state.mini.type !== 'clicks') {
      elements.clicksCounter.textContent = '0 / 0';
      return;
    }

    var current = Math.max(0, Math.floor(state.mini.progress));
    var seconds = Math.max(0, Math.ceil((state.mini.deadline - Date.now()) / 1000));

    elements.clicksCounter.textContent =
      current + ' / ' + state.mini.required + ' · ' + langPack().ui.timeShort + ' ' + seconds + 's';
  }

  function beginClicksMiniGame(issue) {
    clearMini();

    state.actionLock = true;
    state.mini.type = 'clicks';
    state.mini.context = 'repair';
    state.mini.issueKey = issue.key;
    state.mini.required = issue.requiredClicks;
    state.mini.progress = 0;
    state.mini.deadline = Date.now() + issue.clickDurationMs;
    state.mini.decayRate = issue.decayRate;
    state.mini.gainPerClick = issue.gainPerClick;

    elements.miniClicksText.textContent = interpolate(langPack().miniText.clicks, {
      issue: issueLabel(issue.key)
    });

    elements.clicksFill.style.width = '0%';
    updateClicksCounter();
    elements.miniPanels.clicks.hidden = false;

    state.mini.intervalId = window.setInterval(function () {
      if (state.mini.type !== 'clicks') {
        return;
      }

      state.mini.progress = Math.max(0, state.mini.progress - state.mini.decayRate);

      if (Date.now() >= state.mini.deadline) {
        resolveRepair(false, 0);
        return;
      }

      var ratio = clamp(state.mini.progress / state.mini.required, 0, 1);
      elements.clicksFill.style.width = (ratio * 100).toFixed(2) + '%';
      updateClicksCounter();
    }, 90);

    updateButtons();
  }

  function resolveRepair(success, qualityBonus) {
    var issue = getCurrentIssue();

    if (!issue) {
      clearMini();
      state.stage = 'finishing';
      renderAll();
      return;
    }

    clearMini();

    if (success) {
      issue.status = 'fixed';
      applyReward(24 + state.level * 2 + qualityBonus);
      addLog(interpolate(langPack().logs.repairSuccess, {
        issue: issueLabel(issue.key)
      }));
    } else {
      issue.status = 'rough';
      applyPenalty(14, 1, interpolate(langPack().logs.repairFail, {
        issue: issueLabel(issue.key)
      }));
    }

    state.repairIndex += 1;

    if (state.repairIndex < state.currentOrder.issues.length) {
      state.stage = 'repair';
      addLog(interpolate(langPack().logs.nextRepair, {
        issue: issueLabel(state.currentOrder.issues[state.repairIndex].key)
      }));
    } else {
      state.stage = 'finishing';
      addLog(langPack().logs.allRepairsDone);
    }

    renderAll();
  }

  function finalizeOrder(finishSuccess, finishQualityBonus) {
    clearMini();
    stopOrderTimer();

    if (finishSuccess) {
      applyReward(18 + finishQualityBonus);
      state.satisfaction = clamp(state.satisfaction + 1, 1, 5);
      addLog(langPack().logs.finishSuccess);
    } else {
      applyPenalty(12, 1, langPack().logs.finishFail);
    }

    var speedBonus = Math.round((state.orderSecondsLeft / Math.max(1, state.orderSecondsTotal)) * 24);
    if (speedBonus > 0) {
      applyReward(speedBonus);
      addLog(interpolate(langPack().logs.speedBonus, {
        points: String(speedBonus)
      }));
    }

    var fixed = 0;
    for (var i = 0; i < state.currentOrder.issues.length; i += 1) {
      if (state.currentOrder.issues[i].status === 'fixed') {
        fixed += 1;
      }
    }

    var rough = state.currentOrder.issues.length - fixed;

    state.completedOrders += 1;

    var reputationGain = state.satisfaction * 4 + fixed * 3 + (finishSuccess ? 4 : 0) - rough * 2;
    reputationGain = Math.max(2, reputationGain);

    var previousLevel = state.level;

    state.reputation += reputationGain;
    state.level = levelFromReputation(state.reputation);

    if (state.level > previousLevel) {
      addLog(interpolate(langPack().logs.levelUp, {
        level: String(state.level)
      }));
    }

    state.bestScore = Math.max(state.bestScore, state.score);
    state.stage = 'done';

    addLog(interpolate(langPack().logs.orderSummary, {
      stars: String(state.satisfaction),
      fixed: String(fixed),
      total: String(state.currentOrder.issues.length)
    }));

    saveProgress();
    renderAll();
  }

  function handleTimingHit() {
    if (state.mini.type !== 'timing') {
      return;
    }

    var cursor = state.mini.cursor;
    var start = state.mini.zoneStart;
    var end = state.mini.zoneEnd;
    var center = (start + end) / 2;
    var radius = Math.max(0.001, (end - start) / 2);
    var success = cursor >= start && cursor <= end;
    var distance = Math.abs(cursor - center);
    var quality = success ? Math.round((1 - clamp(distance / radius, 0, 1)) * 14) : 0;

    if (state.mini.context === 'finish') {
      finalizeOrder(success, quality);
    } else {
      resolveRepair(success, quality);
    }
  }

  function handleClicksHit() {
    if (state.mini.type !== 'clicks') {
      return;
    }

    state.mini.progress = Math.min(
      state.mini.required,
      state.mini.progress + state.mini.gainPerClick
    );

    var ratio = clamp(state.mini.progress / state.mini.required, 0, 1);
    elements.clicksFill.style.width = (ratio * 100).toFixed(2) + '%';
    updateClicksCounter();

    if (state.mini.progress >= state.mini.required) {
      var quality = Math.round((Date.now() < state.mini.deadline ? 1 : 0.4) * 12);
      resolveRepair(true, quality);
    }
  }

  function startRepairFromTool() {
    var issue = getCurrentIssue();

    if (!issue) {
      state.stage = 'finishing';
      renderAll();
      return;
    }

    addLog(interpolate(langPack().logs.repairStarted, {
      issue: issueLabel(issue.key)
    }));

    if (issue.mode === 'timing') {
      beginTimingMiniGame('repair', issue);
    } else {
      beginClicksMiniGame(issue);
    }
  }

  function startFinishFromTool() {
    beginTimingMiniGame('finish', null);
  }

  function handleTool(toolName) {
    if (!state.currentOrder || state.stage === 'done') {
      addLog(langPack().logs.noOrder);
      return;
    }

    if (state.actionLock) {
      addLog(langPack().logs.miniLocked);
      return;
    }

    if (toolName === 'diagnostic') {
      if (state.stage !== 'diagnosis') {
        applyPenalty(5, 0, langPack().logs.diagnosisAlreadyDone);
        return;
      }

      completeDiagnosis();
      return;
    }

    if (toolName === 'repair') {
      if (!state.diagnosed) {
        applyPenalty(10, 1, langPack().logs.needDiagnosis);
        return;
      }

      if (state.stage !== 'repair') {
        applyPenalty(8, 1, langPack().logs.wrongDuringFinish);
        return;
      }

      startRepairFromTool();
      return;
    }

    if (toolName === 'finish') {
      if (!state.diagnosed) {
        applyPenalty(10, 1, langPack().logs.needDiagnosis);
        return;
      }

      if (state.stage === 'repair') {
        applyPenalty(10, 1, langPack().logs.wrongDuringRepair);
        return;
      }

      if (state.stage !== 'finishing') {
        applyPenalty(8, 1, langPack().logs.wrongDuringFinish);
        return;
      }

      startFinishFromTool();
    }
  }

  function switchLanguage() {
    state.lang = state.lang === 'fr' ? 'en' : 'fr';
    root.setAttribute('data-lang', state.lang);
    applyStaticTranslations();
    renderAll();
  }

  function resetProgress() {
    if (!window.confirm(langPack().prompts.reset)) {
      return;
    }

    stopOrderTimer();
    clearMini();

    state.score = 0;
    state.bestScore = 0;
    state.completedOrders = 0;
    state.reputation = 0;
    state.level = 1;
    state.currentOrder = null;
    state.stage = 'idle';
    state.diagnosed = false;
    state.repairIndex = 0;
    state.satisfaction = 5;
    state.orderSecondsLeft = 0;
    state.orderSecondsTotal = 0;
    state.timerPenaltyApplied = false;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // ignore storage errors
    }

    clearLogs();
    addLog(langPack().logs.progressReset);
    renderAll();
  }

  function handleShortcuts(event) {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    var target = event.target;
    var tagName = target && target.tagName ? target.tagName.toLowerCase() : '';

    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return;
    }

    if (event.key === 'n' || event.key === 'N') {
      event.preventDefault();
      startNewOrder();
      return;
    }

    if (event.key === 'd' || event.key === 'D') {
      event.preventDefault();
      handleTool('diagnostic');
      return;
    }

    if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      handleTool('repair');
      return;
    }

    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault();
      handleTool('finish');
      return;
    }

    if ((event.key === ' ' || event.key === 'Enter') && tagName !== 'button') {
      if (state.mini.type === 'timing' && state.mini.context === 'repair') {
        event.preventDefault();
        handleTimingHit();
      } else if (state.mini.type === 'timing' && state.mini.context === 'finish') {
        event.preventDefault();
        handleTimingHit();
      } else if (state.mini.type === 'clicks') {
        event.preventDefault();
        handleClicksHit();
      }
    }
  }

  elements.langToggle.addEventListener('click', switchLanguage);

  elements.newOrder.addEventListener('click', startNewOrder);
  elements.resetSave.addEventListener('click', resetProgress);

  elements.toolDiagnostic.addEventListener('click', function () {
    handleTool('diagnostic');
  });

  elements.toolRepair.addEventListener('click', function () {
    handleTool('repair');
  });

  elements.toolFinish.addEventListener('click', function () {
    handleTool('finish');
  });

  elements.actionTiming.addEventListener('click', handleTimingHit);
  elements.actionClicks.addEventListener('click', handleClicksHit);
  elements.actionFinish.addEventListener('click', handleTimingHit);

  document.addEventListener('keydown', handleShortcuts);

  loadProgress();
  clearMini();
  applyStaticTranslations();
  clearLogs();
  addLog(langPack().logs.workshopReady);
  renderAll();
})();
