(function () {
  document.documentElement.classList.add('js');

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-nav');

  if (!toggle || !nav) {
    return;
  }

  var openLabel = toggle.getAttribute('aria-label') || 'Open menu';
  var closeLabel = openLabel === 'Open menu' ? 'Close menu' : 'Fermer le menu';

  var closeMenu = function () {
    nav.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', openLabel);
  };

  var openMenu = function () {
    nav.setAttribute('data-open', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', closeLabel);
  };

  closeMenu();

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 920) {
      nav.removeAttribute('data-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', openLabel);
    }
  });
})();

(function () {
  var root = document.querySelector('[data-boot-game]');

  if (!root) {
    return;
  }

  var form = root.querySelector('[data-game-form]');
  var stepTitle = root.querySelector('[data-game-step-title]');
  var stepDesc = root.querySelector('[data-game-step-desc]');
  var stepHint = root.querySelector('[data-game-step-hint]');
  var progressFill = root.querySelector('[data-game-progress]');
  var progressText = root.querySelector('[data-game-progress-text]');
  var qualityValue = root.querySelector('[data-game-quality]');
  var scoreValue = root.querySelector('[data-game-score]');
  var resultBox = root.querySelector('[data-game-result]');
  var logList = root.querySelector('[data-game-log]');
  var restartButton = root.querySelector('[data-game-restart]');
  var actionButtons = root.querySelectorAll('[data-game-action]');
  var lang = root.getAttribute('data-lang') === 'en' ? 'en' : 'fr';

  if (
    !form ||
    !stepTitle ||
    !stepDesc ||
    !stepHint ||
    !progressFill ||
    !progressText ||
    !qualityValue ||
    !scoreValue ||
    !resultBox ||
    !logList ||
    !restartButton ||
    actionButtons.length === 0
  ) {
    return;
  }

  var texts = {
    fr: {
      progressLabel: 'Étape',
      actionHintPrefix: 'Action recommandée:',
      initialTitle: 'Sélectionne des matériaux pour commencer.',
      initialDesc: 'La botte passera par 6 étapes: forme, couture de tige, pose de trépointe, piqûre trépointe/semelle, collage semelle, finitions.',
      initialHint: 'Choisis la bonne action à chaque étape pour maximiser la qualité.',
      doneTitle: 'Botte terminée.',
      doneDesc: 'Le contrôle qualité de l’atelier est terminé.',
      doneHint: 'Tu peux recommencer avec une nouvelle configuration.',
      resultTitle: 'Résultat final',
      qualityLabel: 'Qualité',
      scoreLabel: 'Score',
      configLabel: 'Configuration',
      pointsSuffix: 'pts',
      readyLog: 'Prêt pour une nouvelle fabrication.',
      startLog: 'Fabrication lancée.',
      configLog: 'Matériaux retenus',
      successLog: '%action% validé sur "%stage%".',
      failLog: '%action% n’était pas adapté sur "%stage%". Geste attendu: %expected%.',
      finishLog: 'Contrôle final: %grade%.',
      actionLabels: {
        coudre: 'Coudre',
        coller: 'Coller',
        assembler: 'Assembler'
      },
      fieldLabels: {
        upper: 'Tige',
        welt: 'Trépointe',
        outsole: 'Semelle',
        thread: 'Fil',
        glue: 'Colle'
      },
      grades: [
        {
          min: 90,
          name: 'Maître bottier',
          description: 'Montage premium, propre et durable. Excellente base pour de futurs ressemelages.'
        },
        {
          min: 78,
          name: 'Atelier solide',
          description: 'Très bonne botte de tous les jours, avec un niveau de finition fiable.'
        },
        {
          min: 64,
          name: 'Botte fonctionnelle',
          description: 'La botte est portable, mais certaines étapes techniques peuvent être améliorées.'
        },
        {
          min: 0,
          name: 'À reprendre',
          description: 'Retour à l’établi conseillé avant de livrer cette paire.'
        }
      ]
    },
    en: {
      progressLabel: 'Step',
      actionHintPrefix: 'Recommended action:',
      initialTitle: 'Pick materials to begin.',
      initialDesc: 'The boot goes through 6 steps: lasting, upper stitching, welt positioning, welt stitching, sole bonding, and finishing.',
      initialHint: 'Choose the right action at each stage to maximize quality.',
      doneTitle: 'Boot complete.',
      doneDesc: 'Workshop quality control is done.',
      doneHint: 'You can restart with a new setup.',
      resultTitle: 'Final result',
      qualityLabel: 'Quality',
      scoreLabel: 'Score',
      configLabel: 'Build setup',
      pointsSuffix: 'pts',
      readyLog: 'Ready for a new boot build.',
      startLog: 'Build started.',
      configLog: 'Selected materials',
      successLog: '%action% was correct on "%stage%".',
      failLog: '%action% was not right on "%stage%". Expected: %expected%.',
      finishLog: 'Final check: %grade%.',
      actionLabels: {
        coudre: 'Stitch',
        coller: 'Glue',
        assembler: 'Assemble'
      },
      fieldLabels: {
        upper: 'Upper',
        welt: 'Welt',
        outsole: 'Outsole',
        thread: 'Thread',
        glue: 'Glue'
      },
      grades: [
        {
          min: 90,
          name: 'Master bootmaker',
          description: 'Premium build quality with strong durability and resoling potential.'
        },
        {
          min: 78,
          name: 'Solid workshop build',
          description: 'Reliable everyday boot with a very good finish.'
        },
        {
          min: 64,
          name: 'Functional boot',
          description: 'Wearable result, but a few technical steps need refinement.'
        },
        {
          min: 0,
          name: 'Needs rework',
          description: 'This pair should go back to the bench before delivery.'
        }
      ]
    }
  };

  var stages = {
    fr: [
      {
        id: 'lasting',
        title: 'Mise en forme sur la forme',
        description: 'On positionne la tige sur la forme pour installer le volume de la botte.',
        expected: 'assembler'
      },
      {
        id: 'upper-stitch',
        title: 'Couture de la tige',
        description: 'Les pièces de tige sont réunies pour créer la structure de l’empeigne.',
        expected: 'coudre'
      },
      {
        id: 'welt-seat',
        title: 'Pose de la trépointe',
        description: 'La trépointe est placée avec précision avant couture pour préparer le futur ressemelage.',
        expected: 'coller'
      },
      {
        id: 'welt-stitch',
        title: 'Piqûre trépointe / semelle',
        description: 'La couture fixe la trépointe à la semelle intermédiaire et verrouille la construction.',
        expected: 'coudre'
      },
      {
        id: 'sole-bond',
        title: 'Collage semelle extérieure',
        description: 'Encollage et pressage de la semelle extérieure avant la finition mécanique.',
        expected: 'coller'
      },
      {
        id: 'finish',
        title: 'Assemblage talon et finitions',
        description: 'Le talon est monté et la botte est finalisée pour le contrôle qualité.',
        expected: 'assembler'
      }
    ],
    en: [
      {
        id: 'lasting',
        title: 'Lasting the upper',
        description: 'The upper is pulled over the last to define the boot shape.',
        expected: 'assembler'
      },
      {
        id: 'upper-stitch',
        title: 'Upper stitching',
        description: 'Upper sections are stitched together to build the boot shell.',
        expected: 'coudre'
      },
      {
        id: 'welt-seat',
        title: 'Welt positioning',
        description: 'The welt is positioned accurately before stitching for future resoles.',
        expected: 'coller'
      },
      {
        id: 'welt-stitch',
        title: 'Welt to sole stitching',
        description: 'The stitch locks welt and mid-layer together to secure the construction.',
        expected: 'coudre'
      },
      {
        id: 'sole-bond',
        title: 'Outsole bonding',
        description: 'Glue is applied and pressed before final outsole finishing.',
        expected: 'coller'
      },
      {
        id: 'finish',
        title: 'Heel assembly and finishing',
        description: 'The heel is assembled and the pair is prepared for final inspection.',
        expected: 'assembler'
      }
    ]
  };

  var materialScores = {
    upper: {
      calfskin: 14,
      waxed: 16,
      roughout: 12
    },
    welt: {
      goodyear270: 13,
      storm360: 15,
      norwegian: 17
    },
    outsole: {
      leather: 9,
      dainite: 13,
      commando: 14
    },
    thread: {
      linen: 8,
      polyester: 6,
      aramid: 10
    },
    glue: {
      neoprene: 9,
      waterbased: 7,
      resin: 11
    }
  };

  var t = texts[lang];
  var stageList = stages[lang];
  var fieldOrder = ['upper', 'welt', 'outsole', 'thread', 'glue'];
  var state = {
    active: false,
    finished: false,
    stageIndex: 0,
    quality: 0,
    score: 0,
    choices: null,
    choiceLabels: null
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(input) {
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function template(message, replacements) {
    var output = message;
    Object.keys(replacements).forEach(function (key) {
      output = output.replace('%' + key + '%', replacements[key]);
    });
    return output;
  }

  function setActionButtonsDisabled(disabled) {
    for (var i = 0; i < actionButtons.length; i += 1) {
      actionButtons[i].disabled = disabled;
    }
  }

  function resetResult() {
    resultBox.innerHTML = '';
    resultBox.removeAttribute('data-state');
  }

  function appendLog(message) {
    var item = document.createElement('li');
    item.textContent = message;
    logList.appendChild(item);

    while (logList.children.length > 12) {
      logList.removeChild(logList.firstElementChild);
    }
  }

  function resetLog(message) {
    logList.innerHTML = '';
    appendLog(message);
  }

  function readChoices() {
    return {
      upper: form.elements.upper.value,
      welt: form.elements.welt.value,
      outsole: form.elements.outsole.value,
      thread: form.elements.thread.value,
      glue: form.elements.glue.value
    };
  }

  function readChoiceLabels() {
    return {
      upper: form.elements.upper.options[form.elements.upper.selectedIndex].text,
      welt: form.elements.welt.options[form.elements.welt.selectedIndex].text,
      outsole: form.elements.outsole.options[form.elements.outsole.selectedIndex].text,
      thread: form.elements.thread.options[form.elements.thread.selectedIndex].text,
      glue: form.elements.glue.options[form.elements.glue.selectedIndex].text
    };
  }

  function computeSynergy(choices) {
    var bonus = 0;

    if (choices.welt === 'storm360' && choices.outsole === 'commando') {
      bonus += 6;
    }
    if (choices.welt === 'goodyear270' && choices.outsole === 'leather') {
      bonus += 5;
    }
    if (choices.welt === 'norwegian' && choices.thread === 'aramid') {
      bonus += 5;
    }
    if (
      choices.glue === 'resin' &&
      (choices.outsole === 'commando' || choices.outsole === 'dainite')
    ) {
      bonus += 4;
    }
    if (choices.glue === 'waterbased' && choices.outsole === 'leather') {
      bonus += 4;
    }
    if (choices.upper === 'waxed' && choices.welt === 'storm360') {
      bonus += 3;
    }
    if (choices.upper === 'calfskin' && choices.outsole === 'leather') {
      bonus += 3;
    }
    if (choices.upper === 'roughout' && choices.outsole === 'commando') {
      bonus += 3;
    }

    return bonus;
  }

  function computeBaseQuality(choices) {
    var base = 34;
    for (var i = 0; i < fieldOrder.length; i += 1) {
      var key = fieldOrder[i];
      base += materialScores[key][choices[key]];
    }
    base += computeSynergy(choices);
    return clamp(base, 20, 95);
  }

  function stageBonus(stageId, choices) {
    if (stageId === 'lasting') {
      if (choices.upper === 'roughout') {
        return 2;
      }
      if (choices.upper === 'waxed') {
        return 1;
      }
      return 1;
    }

    if (stageId === 'upper-stitch') {
      if (choices.thread === 'aramid') {
        return 4;
      }
      if (choices.thread === 'linen') {
        return 3;
      }
      return 2;
    }

    if (stageId === 'welt-seat') {
      if (choices.glue === 'resin') {
        return 4;
      }
      if (choices.glue === 'neoprene') {
        return 3;
      }
      return 2;
    }

    if (stageId === 'welt-stitch') {
      var stitchBonus = choices.thread === 'aramid' ? 4 : choices.thread === 'linen' ? 3 : 2;
      if (choices.welt === 'norwegian' && choices.thread === 'aramid') {
        stitchBonus += 2;
      }
      return stitchBonus;
    }

    if (stageId === 'sole-bond') {
      var bondBonus = choices.glue === 'resin' ? 4 : choices.glue === 'neoprene' ? 3 : 2;
      if (choices.outsole === 'commando' && choices.glue === 'resin') {
        bondBonus += 2;
      }
      if (choices.outsole === 'leather' && choices.glue === 'waterbased') {
        bondBonus += 1;
      }
      return bondBonus;
    }

    if (stageId === 'finish') {
      return choices.outsole === 'leather' ? 3 : 2;
    }

    return 1;
  }

  function gradeForQuality(quality) {
    for (var i = 0; i < t.grades.length; i += 1) {
      if (quality >= t.grades[i].min) {
        return t.grades[i];
      }
    }
    return t.grades[t.grades.length - 1];
  }

  function updateDashboard() {
    var completed = state.stageIndex;
    var progress = (completed / stageList.length) * 100;

    progressText.textContent = t.progressLabel + ' ' + completed + '/' + stageList.length;
    progressFill.style.width = progress.toFixed(2) + '%';

    if (!state.active && !state.finished) {
      qualityValue.textContent = '--';
      scoreValue.textContent = '--';
      return;
    }

    qualityValue.textContent = Math.round(state.quality) + ' / 100';
    scoreValue.textContent = Math.round(state.score) + ' ' + t.pointsSuffix;
  }

  function renderCurrentStage() {
    if (state.active) {
      var current = stageList[state.stageIndex];
      stepTitle.textContent = current.title;
      stepDesc.textContent = current.description;
      stepHint.textContent = t.actionHintPrefix + ' ' + t.actionLabels[current.expected] + '.';
      return;
    }

    if (state.finished) {
      stepTitle.textContent = t.doneTitle;
      stepDesc.textContent = t.doneDesc;
      stepHint.textContent = t.doneHint;
      return;
    }

    stepTitle.textContent = t.initialTitle;
    stepDesc.textContent = t.initialDesc;
    stepHint.textContent = t.initialHint;
  }

  function renderResult() {
    var grade = gradeForQuality(state.quality);
    var items = '';

    for (var i = 0; i < fieldOrder.length; i += 1) {
      var key = fieldOrder[i];
      items += '<li><strong>' + t.fieldLabels[key] + ':</strong> ' + escapeHtml(state.choiceLabels[key]) + '</li>';
    }

    resultBox.innerHTML =
      '<h3>' + escapeHtml(t.resultTitle) + ': ' + escapeHtml(grade.name) + '</h3>' +
      '<p>' +
      escapeHtml(t.qualityLabel) + ': <strong>' + Math.round(state.quality) + '/100</strong> · ' +
      escapeHtml(t.scoreLabel) + ': <strong>' + Math.round(state.score) + ' ' + escapeHtml(t.pointsSuffix) + '</strong>' +
      '</p>' +
      '<p>' + escapeHtml(grade.description) + '</p>' +
      '<p><strong>' + escapeHtml(t.configLabel) + ':</strong></p>' +
      '<ul>' + items + '</ul>';

    resultBox.setAttribute('data-state', 'success');
    appendLog(template(t.finishLog, { grade: grade.name }));
  }

  function finishBuild() {
    state.active = false;
    state.finished = true;
    setActionButtonsDisabled(true);
    renderCurrentStage();
    updateDashboard();
    renderResult();
  }

  function handleAction(action) {
    if (!state.active) {
      return;
    }

    var current = stageList[state.stageIndex];
    var success = action === current.expected;

    if (success) {
      var gain = 6 + stageBonus(current.id, state.choices);
      state.quality = clamp(state.quality + gain, 0, 100);
      state.score = clamp(state.score + 10 + gain, 0, 999);
      appendLog(template(t.successLog, {
        action: t.actionLabels[action],
        stage: current.title
      }));
    } else {
      state.quality = clamp(state.quality - 8, 0, 100);
      state.score = clamp(state.score - 6, 0, 999);
      appendLog(template(t.failLog, {
        action: t.actionLabels[action],
        stage: current.title,
        expected: t.actionLabels[current.expected]
      }));
    }

    state.stageIndex += 1;

    if (state.stageIndex >= stageList.length) {
      finishBuild();
      return;
    }

    renderCurrentStage();
    updateDashboard();
  }

  function startBuild(event) {
    event.preventDefault();

    state.choices = readChoices();
    state.choiceLabels = readChoiceLabels();
    state.active = true;
    state.finished = false;
    state.stageIndex = 0;
    state.quality = computeBaseQuality(state.choices);
    state.score = Math.round(state.quality / 2);

    resetResult();
    resetLog(t.startLog);
    appendLog(t.configLog + ': ' + fieldOrder.map(function (key) {
      return t.fieldLabels[key] + ' = ' + state.choiceLabels[key];
    }).join(', '));
    setActionButtonsDisabled(false);
    renderCurrentStage();
    updateDashboard();
  }

  function resetGame() {
    form.reset();
    state.active = false;
    state.finished = false;
    state.stageIndex = 0;
    state.quality = 0;
    state.score = 0;
    state.choices = null;
    state.choiceLabels = null;

    setActionButtonsDisabled(true);
    resetResult();
    resetLog(t.readyLog);
    renderCurrentStage();
    updateDashboard();
  }

  form.addEventListener('submit', startBuild);

  for (var i = 0; i < actionButtons.length; i += 1) {
    actionButtons[i].addEventListener('click', function (event) {
      handleAction(event.currentTarget.getAttribute('data-game-action'));
    });
  }

  restartButton.addEventListener('click', resetGame);

  resetGame();
})();
