(function () {
  var root = document.querySelector('[data-cobbler-game]');

  if (!root) {
    return;
  }

  var STORAGE_KEY = 'cobblerWorkshopSaveV2';
  var MAX_LOG_ITEMS = 16;

  var ISSUE_LIBRARY = [
    {
      key: 'premiumShine',
      mode: 'timing',
      minLevel: 1,
      difficulty: 1,
      baseSeconds: 60,
      rewardTier: 1,
      risk: 'low',
      text: {
        fr: {
          label: 'Cirage premium',
          brokenDesc: 'Cuir terne sans brillance.',
          solution: 'Brosser, appliquer la creme puis lustrer.',
          miniGame: 'Barre de precision'
        },
        en: {
          label: 'Premium shine',
          brokenDesc: 'Leather looks dull and lacks shine.',
          solution: 'Brush, apply cream, then buff.',
          miniGame: 'Timing bar'
        }
      },
      repairTypes: [
        {
          key: 'premiumPolish',
          text: {
            fr: { label: 'Polissage premium', desc: 'Finition miroir sur cuir lisse.' },
            en: { label: 'Premium polish', desc: 'Mirror-like finish on smooth leather.' }
          },
          materialOptions: ['polishCream', 'conditioningCream', 'nourishingOil'],
          toolOptions: ['horseBrush', 'softCloth', 'burnisher'],
          best: { material: 'polishCream', tool: 'horseBrush' },
          okMaterials: ['conditioningCream'],
          okTools: ['softCloth']
        }
      ]
    },
    {
      key: 'deepCleaning',
      mode: 'clicks',
      minLevel: 1,
      difficulty: 1,
      baseSeconds: 60,
      rewardTier: 1,
      risk: 'none',
      text: {
        fr: {
          label: 'Nettoyage profond',
          brokenDesc: 'Salete et poussiere incrustees sur la tige.',
          solution: 'Nettoyer en passes regulieres puis essuyer.',
          miniGame: 'Glisser et frotter'
        },
        en: {
          label: 'Deep cleaning',
          brokenDesc: 'Embedded dirt and dust on the upper.',
          solution: 'Clean with even passes, then wipe.',
          miniGame: 'Swipe and scrub'
        }
      },
      repairTypes: [
        {
          key: 'deepClean',
          text: {
            fr: { label: 'Nettoyage atelier', desc: 'Retire les impuretes sans abimer la fleur.' },
            en: { label: 'Workshop clean', desc: 'Remove impurities without damaging the grain.' }
          },
          materialOptions: ['leatherCleaner', 'saddleSoap', 'conditioningCream'],
          toolOptions: ['softCloth', 'horseBrush', 'spatula'],
          best: { material: 'leatherCleaner', tool: 'softCloth' },
          okMaterials: ['saddleSoap'],
          okTools: ['horseBrush']
        }
      ]
    },
    {
      key: 'leatherHydration',
      mode: 'clicks',
      minLevel: 1,
      difficulty: 1,
      baseSeconds: 60,
      rewardTier: 1,
      risk: 'none',
      text: {
        fr: {
          label: 'Rehydratation cuir',
          brokenDesc: 'Le cuir est sec et manque de souplesse.',
          solution: 'Appliquer une huile puis travailler en cercles.',
          miniGame: 'Mouvement circulaire'
        },
        en: {
          label: 'Leather rehydration',
          brokenDesc: 'Leather is dry and losing flexibility.',
          solution: 'Apply oil and work in circular motions.',
          miniGame: 'Circular motion'
        }
      },
      repairTypes: [
        {
          key: 'rehydrateLeather',
          text: {
            fr: { label: 'Hydratation profonde', desc: 'Nourrit la fibre pour eviter la casse.' },
            en: { label: 'Deep hydration', desc: 'Feeds fibers to prevent cracking.' }
          },
          materialOptions: ['nourishingOil', 'conditioningCream', 'leatherFiller'],
          toolOptions: ['softCloth', 'horseBrush', 'burnisher'],
          best: { material: 'nourishingOil', tool: 'softCloth' },
          okMaterials: ['conditioningCream'],
          okTools: ['horseBrush']
        }
      ]
    },
    {
      key: 'replaceTopLiftMission',
      mode: 'clicks',
      minLevel: 3,
      difficulty: 2,
      baseSeconds: 120,
      rewardTier: 2,
      risk: 'medium',
      text: {
        fr: {
          label: 'Remplacer top-lift',
          brokenDesc: 'Le talon est use et desequilibre.',
          solution: 'Repositionner puis fixer un nouveau top-lift.',
          miniGame: 'Alignement et clics rapides'
        },
        en: {
          label: 'Replace top-lift',
          brokenDesc: 'Heel is worn and unbalanced.',
          solution: 'Re-align then fix a new top-lift.',
          miniGame: 'Alignment plus fast clicks'
        }
      },
      repairTypes: [
        {
          key: 'topLiftReplaceMission',
          text: {
            fr: { label: 'Pose top-lift', desc: 'Replace le bonbout pour retrouver l equilibre.' },
            en: { label: 'Top-lift fitting', desc: 'Replace heel cap to restore balance.' }
          },
          materialOptions: ['rubberTopLift', 'contactGlue', 'heelNails'],
          toolOptions: ['heelHammer', 'alignmentJig', 'clamp'],
          best: { material: 'rubberTopLift', tool: 'heelHammer' },
          okMaterials: ['contactGlue', 'heelNails'],
          okTools: ['alignmentJig']
        }
      ]
    },
    {
      key: 'halfSoleMission',
      mode: 'timing',
      minLevel: 5,
      difficulty: 3,
      baseSeconds: 180,
      rewardTier: 3,
      risk: 'medium',
      text: {
        fr: {
          label: 'Demi-semelle',
          brokenDesc: 'Avant-pied use avec accroche reduite.',
          solution: 'Poser et presser une demi-semelle ajustee.',
          miniGame: 'Placement precis'
        },
        en: {
          label: 'Half sole',
          brokenDesc: 'Forefoot is worn with reduced grip.',
          solution: 'Place and press a fitted half sole.',
          miniGame: 'Precise placement'
        }
      },
      repairTypes: [
        {
          key: 'halfSoleInstall',
          text: {
            fr: { label: 'Pose demi-semelle', desc: 'Renforce l avant-pied sans ressemelage complet.' },
            en: { label: 'Half sole install', desc: 'Reinforce forefoot without full resole.' }
          },
          materialOptions: ['halfSolePiece', 'contactGlue', 'solePrimer'],
          toolOptions: ['solePress', 'alignmentJig', 'clamp'],
          best: { material: 'halfSolePiece', tool: 'solePress' },
          okMaterials: ['contactGlue', 'solePrimer'],
          okTools: ['alignmentJig']
        }
      ]
    },
    {
      key: 'upperStitchMission',
      mode: 'clicks',
      minLevel: 5,
      difficulty: 3,
      baseSeconds: 180,
      rewardTier: 3,
      risk: 'high',
      text: {
        fr: {
          label: 'Couture tige',
          brokenDesc: 'Couture lache sur la tige.',
          solution: 'Recoudre avec cadence stable et tension constante.',
          miniGame: 'Rythme et sequence'
        },
        en: {
          label: 'Upper stitching',
          brokenDesc: 'Loose stitch line on the upper.',
          solution: 'Restitch with stable pace and constant tension.',
          miniGame: 'Rhythm sequence'
        }
      },
      repairTypes: [
        {
          key: 'upperRestitch',
          text: {
            fr: { label: 'Recousu tige', desc: 'Reprend la ligne de couture sur la tige.' },
            en: { label: 'Upper restitch', desc: 'Rebuild stitch line on the upper.' }
          },
          materialOptions: ['waxedThread', 'seamTape', 'contactGlue'],
          toolOptions: ['curvedNeedle', 'awl', 'stitchPliers'],
          best: { material: 'waxedThread', tool: 'curvedNeedle' },
          okMaterials: ['seamTape'],
          okTools: ['awl', 'stitchPliers']
        }
      ]
    },
    {
      key: 'heelLiningMission',
      mode: 'clicks',
      minLevel: 3,
      difficulty: 2,
      baseSeconds: 120,
      rewardTier: 2,
      risk: 'low',
      text: {
        fr: {
          label: 'Reparer doublure talon',
          brokenDesc: 'Doublure talon usee et decollee.',
          solution: 'Reposer une doublure propre et presser.',
          miniGame: 'Glisser et presser'
        },
        en: {
          label: 'Heel lining repair',
          brokenDesc: 'Heel lining is worn and detached.',
          solution: 'Fit a clean lining and press.',
          miniGame: 'Slide and press'
        }
      },
      repairTypes: [
        {
          key: 'heelLiningPatch',
          text: {
            fr: { label: 'Patch doublure', desc: 'Renove la doublure interne du contrefort.' },
            en: { label: 'Lining patch', desc: 'Refresh inner heel counter lining.' }
          },
          materialOptions: ['heelLiningLeather', 'contactGlue', 'nourishingOil'],
          toolOptions: ['clamp', 'softCloth', 'spatula'],
          best: { material: 'heelLiningLeather', tool: 'clamp' },
          okMaterials: ['contactGlue'],
          okTools: ['softCloth']
        }
      ]
    },
    {
      key: 'recolorMission',
      mode: 'timing',
      minLevel: 5,
      difficulty: 3,
      baseSeconds: 180,
      rewardTier: 3,
      risk: 'medium',
      text: {
        fr: {
          label: 'Recoloration cuir',
          brokenDesc: 'Couleur fanee et nuance irreguliere.',
          solution: 'Teinter de maniere homogene puis fixer.',
          miniGame: 'Melange couleur'
        },
        en: {
          label: 'Leather recolor',
          brokenDesc: 'Color is faded and uneven.',
          solution: 'Apply dye evenly then fix the tone.',
          miniGame: 'Color mixing'
        }
      },
      repairTypes: [
        {
          key: 'recolorUpper',
          text: {
            fr: { label: 'Recoloration complete', desc: 'Restaure une teinte uniforme sur la tige.' },
            en: { label: 'Full recolor', desc: 'Restore consistent color on upper.' }
          },
          materialOptions: ['leatherDye', 'colorFixative', 'conditioningCream'],
          toolOptions: ['softCloth', 'horseBrush', 'spatula'],
          best: { material: 'leatherDye', tool: 'softCloth' },
          okMaterials: ['colorFixative'],
          okTools: ['horseBrush']
        }
      ]
    },
    {
      key: 'fullResoleMission',
      mode: 'timing',
      minLevel: 7,
      difficulty: 4,
      baseSeconds: 300,
      rewardTier: 4,
      risk: 'high',
      text: {
        fr: {
          label: 'Ressemelage complet',
          brokenDesc: 'Semelle usee sur toute la longueur.',
          solution: 'Deposer, recoller, recoudre et presser la nouvelle semelle.',
          miniGame: 'Multi-etapes successives'
        },
        en: {
          label: 'Full resole',
          brokenDesc: 'Outsole is worn across full length.',
          solution: 'Remove, reglue, restitch, and press a new outsole.',
          miniGame: 'Multi-step sequence'
        }
      },
      repairTypes: [
        {
          key: 'fullResole',
          text: {
            fr: { label: 'Ressemelage atelier', desc: 'Remplace totalement la semelle exterieure.' },
            en: { label: 'Workshop resole', desc: 'Complete outsole replacement.' }
          },
          materialOptions: ['newOutsole', 'contactGlue', 'waxedThread'],
          toolOptions: ['stitchMachine', 'solePress', 'awl'],
          best: { material: 'newOutsole', tool: 'stitchMachine' },
          okMaterials: ['contactGlue'],
          okTools: ['solePress']
        }
      ]
    },
    {
      key: 'corkReplaceMission',
      mode: 'timing',
      minLevel: 7,
      difficulty: 4,
      baseSeconds: 240,
      rewardTier: 4,
      risk: 'medium',
      text: {
        fr: {
          label: 'Remplacement liege',
          brokenDesc: 'Confort disparu et amorti interne tasse.',
          solution: 'Redoser le liege puis lisser.',
          miniGame: 'Dosage et lissage'
        },
        en: {
          label: 'Cork replacement',
          brokenDesc: 'Comfort is gone and inner fill collapsed.',
          solution: 'Dose new cork and smooth the bed.',
          miniGame: 'Dose and smooth'
        }
      },
      repairTypes: [
        {
          key: 'replaceCork',
          text: {
            fr: { label: 'Recharge liege', desc: 'Reconstitue le lit de confort interne.' },
            en: { label: 'Cork refill', desc: 'Rebuild internal comfort bed.' }
          },
          materialOptions: ['corkFiller', 'contactGlue', 'solePrimer'],
          toolOptions: ['spatula', 'burnisher', 'clamp'],
          best: { material: 'corkFiller', tool: 'spatula' },
          okMaterials: ['solePrimer'],
          okTools: ['burnisher']
        }
      ]
    },
    {
      key: 'weltRestitchMission',
      mode: 'timing',
      minLevel: 7,
      difficulty: 4,
      baseSeconds: 240,
      rewardTier: 4,
      risk: 'high',
      text: {
        fr: {
          label: 'Reprise couture trepointe',
          brokenDesc: 'Couture welt lache et ouvertures visibles.',
          solution: 'Reprendre la ligne de couture avec precision.',
          miniGame: 'Mini-jeu precision'
        },
        en: {
          label: 'Welt restitch',
          brokenDesc: 'Welt stitch is loose with visible gaps.',
          solution: 'Restitch the welt line with precision.',
          miniGame: 'Precision mini-game'
        }
      },
      repairTypes: [
        {
          key: 'weltRestitch',
          text: {
            fr: { label: 'Recousu trepointe', desc: 'Verrouille la couture entre empeigne et semelle.' },
            en: { label: 'Welt restitching', desc: 'Lock seam between upper and sole.' }
          },
          materialOptions: ['waxedThread', 'seamTape', 'contactGlue'],
          toolOptions: ['awl', 'curvedNeedle', 'stitchMachine'],
          best: { material: 'waxedThread', tool: 'awl' },
          okMaterials: ['seamTape'],
          okTools: ['curvedNeedle']
        }
      ]
    },
    {
      key: 'weltReplaceMission',
      mode: 'clicks',
      minLevel: 9,
      difficulty: 5,
      baseSeconds: 360,
      rewardTier: 5,
      risk: 'veryHigh',
      text: {
        fr: {
          label: 'Remplacement trepointe',
          brokenDesc: 'Welt endommagee et couture compromise.',
          solution: 'Deposer puis reposer une trepointe neuve.',
          miniGame: 'Sequence complexe'
        },
        en: {
          label: 'Welt replacement',
          brokenDesc: 'Welt is damaged and seam is compromised.',
          solution: 'Remove and fit a new welt strip.',
          miniGame: 'Complex sequence'
        }
      },
      repairTypes: [
        {
          key: 'weltReplace',
          text: {
            fr: { label: 'Pose trepointe neuve', desc: 'Remplace la trepointe de bout en bout.' },
            en: { label: 'New welt fitting', desc: 'Replace welt from end to end.' }
          },
          materialOptions: ['newWeltStrip', 'waxedThread', 'contactGlue'],
          toolOptions: ['stitchMachine', 'curvedNeedle', 'alignmentJig'],
          best: { material: 'newWeltStrip', tool: 'stitchMachine' },
          okMaterials: ['waxedThread'],
          okTools: ['curvedNeedle']
        }
      ]
    },
    {
      key: 'shankReplaceMission',
      mode: 'timing',
      minLevel: 9,
      difficulty: 5,
      baseSeconds: 360,
      rewardTier: 5,
      risk: 'veryHigh',
      text: {
        fr: {
          label: 'Remplacement cambrion',
          brokenDesc: 'Instabilite interne et maintien du pied reduit.',
          solution: 'Deposer puis ajuster un nouveau cambrion.',
          miniGame: 'Demontage precis'
        },
        en: {
          label: 'Shank replacement',
          brokenDesc: 'Internal instability with poor arch support.',
          solution: 'Remove and fit a new shank.',
          miniGame: 'Precise disassembly'
        }
      },
      repairTypes: [
        {
          key: 'shankReplace',
          text: {
            fr: { label: 'Pose cambrion', desc: 'Restaure la rigidite structurelle centrale.' },
            en: { label: 'Shank fitting', desc: 'Restore central structural stiffness.' }
          },
          materialOptions: ['steelShank', 'leatherShank', 'contactGlue'],
          toolOptions: ['lastingPliers', 'alignmentJig', 'clamp'],
          best: { material: 'steelShank', tool: 'lastingPliers' },
          okMaterials: ['leatherShank'],
          okTools: ['alignmentJig']
        }
      ]
    },
    {
      key: 'tornLeatherMission',
      mode: 'timing',
      minLevel: 9,
      difficulty: 5,
      baseSeconds: 300,
      rewardTier: 5,
      risk: 'high',
      text: {
        fr: {
          label: 'Reparation cuir dechire',
          brokenDesc: 'Tige abimee avec dechirement visible.',
          solution: 'Poser un patch discret puis lisser la surface.',
          miniGame: 'Placement invisible'
        },
        en: {
          label: 'Torn leather repair',
          brokenDesc: 'Upper is damaged with a visible tear.',
          solution: 'Set an invisible patch and smooth the surface.',
          miniGame: 'Invisible placement'
        }
      },
      repairTypes: [
        {
          key: 'invisiblePatch',
          text: {
            fr: { label: 'Patch invisible', desc: 'Masque la dechirure et reforce la zone.' },
            en: { label: 'Invisible patch', desc: 'Hide tear and reinforce the area.' }
          },
          materialOptions: ['leatherPatch', 'leatherFiller', 'contactGlue'],
          toolOptions: ['spatula', 'burnisher', 'softCloth'],
          best: { material: 'leatherPatch', tool: 'spatula' },
          okMaterials: ['leatherFiller'],
          okTools: ['burnisher']
        }
      ]
    }
  ];

  var ISSUE_MAP = {};
  var REPAIR_TYPE_TEXT = {};
  for (var libraryIndex = 0; libraryIndex < ISSUE_LIBRARY.length; libraryIndex += 1) {
    var issueDef = ISSUE_LIBRARY[libraryIndex];
    ISSUE_MAP[issueDef.key] = issueDef;

    for (var repairTextIndex = 0; repairTextIndex < issueDef.repairTypes.length; repairTextIndex += 1) {
      REPAIR_TYPE_TEXT[issueDef.repairTypes[repairTextIndex].key] =
        issueDef.repairTypes[repairTextIndex].text || null;
    }
  }

  var CLIENT_NAMES = {
    fr: ['Camille', 'Nora', 'Amine', 'Lucas', 'Sarah', 'Milo', 'Lina', 'Yanis', 'Jules', 'Maude'],
    en: ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Drew', 'Parker', 'Avery', 'Quinn']
  };

  var LEVEL_BRACKETS = {
    fr: [
      { min: 1, max: 2, label: 'Debutant' },
      { min: 3, max: 4, label: 'Apprenti' },
      { min: 5, max: 6, label: 'Intermediaire' },
      { min: 7, max: 8, label: 'Expert' },
      { min: 9, max: 10, label: 'Maitre cordonnier' }
    ],
    en: [
      { min: 1, max: 2, label: 'Beginner' },
      { min: 3, max: 4, label: 'Apprentice' },
      { min: 5, max: 6, label: 'Intermediate' },
      { min: 7, max: 8, label: 'Expert' },
      { min: 9, max: 10, label: 'Master cobbler' }
    ]
  };

  var RISK_LABELS = {
    fr: {
      none: 'Aucun',
      low: 'Faible',
      medium: 'Moyen',
      high: 'Eleve',
      veryHigh: 'Tres eleve'
    },
    en: {
      none: 'None',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      veryHigh: 'Very high'
    }
  };

  var ISSUE_VISUAL_MAP = {
    premiumShine: 'dryLeather',
    deepCleaning: 'dryLeather',
    leatherHydration: 'dryLeather',
    replaceTopLiftMission: 'heelWorn',
    halfSoleMission: 'soleLoose',
    upperStitchMission: 'looseStitch',
    heelLiningMission: 'heelWorn',
    recolorMission: 'dryLeather',
    fullResoleMission: 'soleLoose',
    corkReplaceMission: 'soleLoose',
    weltRestitchMission: 'looseStitch',
    weltReplaceMission: 'soleLoose',
    shankReplaceMission: 'heelWorn',
    tornLeatherMission: 'dryLeather'
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
        toolsTitle: 'Action',
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
        shortcutsText: 'Raccourcis clavier: N (nouveau client), A (action principale), Espace/Entree (mini-jeu).',
        logTitle: 'Journal atelier',
        noOrderYet: 'Aucune commande en cours.',
        miniTimingTitle: 'Mini-jeu precision',
        miniTimingAction: 'Valider le geste',
        miniClicksTitle: 'Mini-jeu cadence',
        miniClicksAction: 'Action repetee',
        miniFinishTitle: 'Mini-jeu finition',
        miniFinishAction: 'Finaliser',
        timeShort: 'Temps',
        diagnosisPanelTitle: 'Diagnostic detaille',
        diagnosisPanelHelp: 'Observe ce qui est brise puis choisis un type de reparation pour chaque probleme.',
        chooseRepairTypeLabel: 'Type de reparation',
        chooseRepairTypePlaceholder: 'Choisir un type',
        repairTypeChosenLabel: 'Type choisi',
        repairPlanTitle: 'Plan de reparation',
        repairIssueLabel: 'Probleme cible',
        repairTypeLabel: 'Type choisi',
        repairMaterialLabel: 'Materiel',
        repairToolLabel: 'Outil',
        chooseMaterialPlaceholder: 'Choisir un materiel',
        chooseToolPlaceholder: 'Choisir un outil',
        repairHintDefault: 'Le bon combo materiel + outil facilite le mini-jeu.',
        materialFeedbackDefault: 'Choisis un materiel pour voir pourquoi ce choix est adapte (ou non).',
        toolFeedbackDefault: 'Choisis un outil pour voir pourquoi ce choix est adapte (ou non).',
        materialFeedbackBest: 'Excellent choix materiel: {selected} est ideal pour {repair}.',
        materialFeedbackOk: 'Choix materiel correct: {selected} fonctionne, mais {best} est plus adapte pour {repair}.',
        materialFeedbackBad: 'Mauvais choix materiel: {selected} est mal adapte a {repair}. Utilise {best}.',
        toolFeedbackBest: 'Excellent choix outil: {selected} donne le meilleur controle pour {repair}.',
        toolFeedbackOk: 'Choix outil correct: {selected} peut marcher, mais {best} est plus precis pour {repair}.',
        toolFeedbackBad: 'Mauvais choix outil: {selected} ne convient pas a {repair}. Choisis {best}.',
        noRepairType: 'Aucun type choisi',
        noRepairIssue: 'Aucun probleme actif',
        brokenPrefix: 'Bris',
        selectedRepairPrefix: 'Type',
        mainActionIdle: 'Action indisponible',
        mainActionLocked: 'Action en cours',
        mainActionDiagnosis: 'Valider diagnostic',
        mainActionRepair: 'Lancer reparation',
        mainActionFinish: 'Lancer finition'
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
        diagnosisDesc: 'Lis la description des degats et choisis un type de reparation.',
        repairTitle: 'Reparation',
        repairDesc: 'Reparation {index}/{total}: {issue}. Type: {repairType}. Mode: {mode}.',
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
          brokenDesc: 'La semelle exterieure s\'ouvre a l\'avant et perd son alignement.',
          solution: 'Nettoyer, encoller, puis mettre sous presse.'
        },
        heelWorn: {
          label: 'Talon use',
          brokenDesc: 'Le talon est ecrase sur un cote et la stabilite est reduite.',
          solution: 'Reformer et poser un nouveau bonbout avec precision.'
        },
        looseStitch: {
          label: 'Couture lache',
          brokenDesc: 'La couture de trepointe se detend et laisse des jours visibles.',
          solution: 'Recoudre en tension constante, puis verifier la ligne.'
        },
        dryLeather: {
          label: 'Cuir sec ou craquele',
          brokenDesc: 'Le cuir est sec, mat et presente des micro-fissures.',
          solution: 'Nettoyer, nourrir, puis lisser les zones seches.'
        }
      },
      repairTypes: {
        regluePress: {
          label: 'Reencollage sous presse',
          desc: 'Recolle la semelle en pression uniforme pour restaurer l\'adhesion.'
        },
        stitchResecure: {
          label: 'Recousu de securisation',
          desc: 'Ajoute une couture de maintien pour verrouiller la semelle.'
        },
        topLiftReplace: {
          label: 'Remplacement bonbout',
          desc: 'Change uniquement la partie usee du talon pour retrouver l\'equilibre.'
        },
        heelRebuild: {
          label: 'Reconstruction talon',
          desc: 'Reforme la pile de talon pour corriger la geometrie.'
        },
        lockStitch: {
          label: 'Recousu point bloque',
          desc: 'Refait la ligne de couture en tension stable.'
        },
        doubleStitch: {
          label: 'Double couture renforcee',
          desc: 'Double la couture sur zone fragile pour renforcer la tenue.'
        },
        deepCondition: {
          label: 'Nourrissage profond',
          desc: 'Hydrate le cuir pour retrouver souplesse et resistance.'
        },
        crackFill: {
          label: 'Comblement des fissures',
          desc: 'Comble puis lisse les zones craquelees avant finition.'
        }
      },
      materials: {
        contactGlue: 'Colle contact',
        resinCement: 'Ciment resine',
        solePrimer: 'Primaire semelle',
        waxedThread: 'Fil cire',
        seamTape: 'Ruban renfort couture',
        rubberTopLift: 'Bonbout gomme',
        heelNails: 'Clous de talon',
        heelLeather: 'Cuir de talon',
        conditioningCream: 'Creme nourrissante',
        nourishingOil: 'Huile nourrissante',
        leatherFiller: 'Pate de rebouchage cuir',
        polishCream: 'Creme de cirage',
        leatherCleaner: 'Nettoyant cuir',
        saddleSoap: 'Savon glycerine',
        halfSolePiece: 'Piece demi-semelle',
        heelLiningLeather: 'Doublure cuir talon',
        leatherDye: 'Teinture cuir',
        colorFixative: 'Fixateur couleur',
        newOutsole: 'Semelle neuve',
        corkFiller: 'Liege technique',
        newWeltStrip: 'Trepointe neuve',
        steelShank: 'Cambrion acier',
        leatherShank: 'Cambrion cuir',
        leatherPatch: 'Patch cuir'
      },
      tools: {
        solePress: 'Presse semelle',
        clamp: 'Serre-joint',
        spatula: 'Spatule technique',
        awl: 'Alene',
        curvedNeedle: 'Aiguille courbe',
        stitchPliers: 'Pince de couture',
        heelHammer: 'Marteau de talon',
        edgeTrimmer: 'Coupe-bord',
        sandingBlock: 'Bloc de poncage',
        horseBrush: 'Brosse crin',
        burnisher: 'Lissoir',
        softCloth: 'Chiffon doux',
        alignmentJig: 'Gabarit alignement',
        stitchMachine: 'Machine couture',
        lastingPliers: 'Pince de montage'
      },
      setupRating: {
        excellent: 'excellent',
        good: 'bon',
        risky: 'limite',
        poor: 'faible'
      },
      logs: {
        workshopReady: 'Atelier pret pour une nouvelle commande.',
        noOrder: 'Aucune commande active. Lance un nouveau client.',
        miniLocked: 'Mini-jeu en cours: termine l\'action actuelle.',
        newOrder: 'Nouveau client: {client}. Probleme(s): {issues}.',
        diagnosisDone: 'Diagnostic valide: {solutions}.',
        diagnosisMissingChoice: 'Diagnostic incomplet: choisis un type pour {issues}.',
        needDiagnosis: 'Mauvaise action: commence par le diagnostic.',
        diagnosisAlreadyDone: 'Diagnostic deja fait. Passe a la reparation.',
        wrongDuringRepair: 'Mauvaise action: termine les reparations avant finition.',
        wrongDuringFinish: 'Mauvaise action pour l\'etape actuelle.',
        repairTypeMissing: 'Type de reparation manquant pour {issue}.',
        repairSetupMissing: 'Choisis le materiel et l\'outil avant la reparation.',
        repairSetupLog: 'Setup {issue}: {material} + {tool} ({rating}).',
        repairSetupPenalty: 'Setup fragile: la reparation sera plus difficile.',
        repairMaterialWhy: 'Materiel: {explanation}',
        repairToolWhy: 'Outil: {explanation}',
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
        toolsTitle: 'Action',
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
        shortcutsText: 'Keyboard shortcuts: N (new client), A (main action), Space/Enter (mini-game).',
        logTitle: 'Workshop log',
        noOrderYet: 'No active order yet.',
        miniTimingTitle: 'Precision mini-game',
        miniTimingAction: 'Apply move',
        miniClicksTitle: 'Rhythm mini-game',
        miniClicksAction: 'Repeat action',
        miniFinishTitle: 'Finishing mini-game',
        miniFinishAction: 'Finalize',
        timeShort: 'Time',
        diagnosisPanelTitle: 'Detailed diagnosis',
        diagnosisPanelHelp: 'Inspect what is broken and choose a repair type for each issue.',
        chooseRepairTypeLabel: 'Repair type',
        chooseRepairTypePlaceholder: 'Choose a type',
        repairTypeChosenLabel: 'Selected type',
        repairPlanTitle: 'Repair setup',
        repairIssueLabel: 'Target issue',
        repairTypeLabel: 'Selected type',
        repairMaterialLabel: 'Material',
        repairToolLabel: 'Tool',
        chooseMaterialPlaceholder: 'Choose a material',
        chooseToolPlaceholder: 'Choose a tool',
        repairHintDefault: 'The right material + tool combo makes the mini-game easier.',
        materialFeedbackDefault: 'Select a material to see why this choice fits (or not).',
        toolFeedbackDefault: 'Select a tool to see why this choice fits (or not).',
        materialFeedbackBest: 'Great material choice: {selected} is ideal for {repair}.',
        materialFeedbackOk: 'Acceptable material: {selected} can work, but {best} is better for {repair}.',
        materialFeedbackBad: 'Wrong material: {selected} does not fit {repair}. Use {best}.',
        toolFeedbackBest: 'Great tool choice: {selected} gives best control for {repair}.',
        toolFeedbackOk: 'Acceptable tool: {selected} can work, but {best} is more precise for {repair}.',
        toolFeedbackBad: 'Wrong tool: {selected} does not fit {repair}. Pick {best}.',
        noRepairType: 'No type selected',
        noRepairIssue: 'No active issue',
        brokenPrefix: 'Damage',
        selectedRepairPrefix: 'Type',
        mainActionIdle: 'Action unavailable',
        mainActionLocked: 'Action running',
        mainActionDiagnosis: 'Confirm diagnosis',
        mainActionRepair: 'Start repair',
        mainActionFinish: 'Start finishing'
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
        diagnosisDesc: 'Read each damage description and pick a repair type.',
        repairTitle: 'Repair',
        repairDesc: 'Repair {index}/{total}: {issue}. Type: {repairType}. Mode: {mode}.',
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
          brokenDesc: 'Outsole is peeling at the forefoot and alignment is unstable.',
          solution: 'Clean, glue, and press evenly until bonded.'
        },
        heelWorn: {
          label: 'Worn heel',
          brokenDesc: 'Heel is collapsed on one side and balance is reduced.',
          solution: 'Rebuild profile and place a new top lift with precision.'
        },
        looseStitch: {
          label: 'Loose stitching',
          brokenDesc: 'Welt stitching is loose and openings are visible.',
          solution: 'Restitch with constant tension and check the seam line.'
        },
        dryLeather: {
          label: 'Dry or cracked leather',
          brokenDesc: 'Leather is dry, dull, and shows micro-cracks.',
          solution: 'Clean, condition, and smooth the dry sections.'
        }
      },
      repairTypes: {
        regluePress: {
          label: 'Reglue under press',
          desc: 'Reglue outsole under steady pressure to restore adhesion.'
        },
        stitchResecure: {
          label: 'Security restitch',
          desc: 'Add support stitching to lock the outsole position.'
        },
        topLiftReplace: {
          label: 'Top-lift replacement',
          desc: 'Replace the worn heel cap to recover balance.'
        },
        heelRebuild: {
          label: 'Heel rebuild',
          desc: 'Rebuild heel stack geometry for stability.'
        },
        lockStitch: {
          label: 'Lock stitch repair',
          desc: 'Rework seam line using stable stitch tension.'
        },
        doubleStitch: {
          label: 'Double reinforced stitch',
          desc: 'Double-stitch weak zones to increase hold.'
        },
        deepCondition: {
          label: 'Deep conditioning',
          desc: 'Rehydrate leather to restore flexibility.'
        },
        crackFill: {
          label: 'Crack filling',
          desc: 'Fill and smooth cracked sections before finishing.'
        }
      },
      materials: {
        contactGlue: 'Contact cement',
        resinCement: 'Resin cement',
        solePrimer: 'Sole primer',
        waxedThread: 'Waxed thread',
        seamTape: 'Seam reinforcement tape',
        rubberTopLift: 'Rubber top-lift',
        heelNails: 'Heel nails',
        heelLeather: 'Heel leather',
        conditioningCream: 'Conditioning cream',
        nourishingOil: 'Nourishing oil',
        leatherFiller: 'Leather filler paste',
        polishCream: 'Polish cream',
        leatherCleaner: 'Leather cleaner',
        saddleSoap: 'Saddle soap',
        halfSolePiece: 'Half sole piece',
        heelLiningLeather: 'Heel lining leather',
        leatherDye: 'Leather dye',
        colorFixative: 'Color fixative',
        newOutsole: 'New outsole',
        corkFiller: 'Technical cork',
        newWeltStrip: 'New welt strip',
        steelShank: 'Steel shank',
        leatherShank: 'Leather shank',
        leatherPatch: 'Leather patch'
      },
      tools: {
        solePress: 'Sole press',
        clamp: 'Clamp',
        spatula: 'Technical spatula',
        awl: 'Awl',
        curvedNeedle: 'Curved needle',
        stitchPliers: 'Stitch pliers',
        heelHammer: 'Heel hammer',
        edgeTrimmer: 'Edge trimmer',
        sandingBlock: 'Sanding block',
        horseBrush: 'Horsehair brush',
        burnisher: 'Burnisher',
        softCloth: 'Soft cloth',
        alignmentJig: 'Alignment jig',
        stitchMachine: 'Stitching machine',
        lastingPliers: 'Lasting pliers'
      },
      setupRating: {
        excellent: 'excellent',
        good: 'good',
        risky: 'risky',
        poor: 'poor'
      },
      logs: {
        workshopReady: 'Workshop ready for a new order.',
        noOrder: 'No active order. Start a new client.',
        miniLocked: 'Mini-game running: finish the current action first.',
        newOrder: 'New client: {client}. Issue(s): {issues}.',
        diagnosisDone: 'Diagnosis confirmed: {solutions}.',
        diagnosisMissingChoice: 'Diagnosis incomplete: choose a repair type for {issues}.',
        needDiagnosis: 'Wrong action: start with diagnosis first.',
        diagnosisAlreadyDone: 'Diagnosis already done. Move to repair.',
        wrongDuringRepair: 'Wrong action: finish repairs before finishing stage.',
        wrongDuringFinish: 'Wrong action for the current stage.',
        repairTypeMissing: 'Missing repair type for {issue}.',
        repairSetupMissing: 'Choose material and tool before launching repair.',
        repairSetupLog: 'Setup {issue}: {material} + {tool} ({rating}).',
        repairSetupPenalty: 'Weak setup: repair mini-game is harder.',
        repairMaterialWhy: 'Material: {explanation}',
        repairToolWhy: 'Tool: {explanation}',
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
    diagnosisPanel: root.querySelector('[data-diagnosis-panel]'),
    diagnosisList: root.querySelector('[data-diagnosis-list]'),
    repairPlan: root.querySelector('[data-repair-plan]'),
    repairIssue: root.querySelector('[data-repair-issue]'),
    repairType: root.querySelector('[data-repair-type]'),
    repairMaterial: root.querySelector('[data-repair-material]'),
    repairTool: root.querySelector('[data-repair-tool]'),
    materialFeedback: root.querySelector('[data-material-feedback]'),
    toolFeedback: root.querySelector('[data-tool-feedback]'),
    repairHint: root.querySelector('[data-repair-hint]'),
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
    mainAction: root.querySelector('[data-main-action]'),
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
    !elements.diagnosisPanel ||
    !elements.diagnosisList ||
    !elements.repairPlan ||
    !elements.repairIssue ||
    !elements.repairType ||
    !elements.repairMaterial ||
    !elements.repairTool ||
    !elements.materialFeedback ||
    !elements.toolFeedback ||
    !elements.repairHint ||
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
    !elements.mainAction ||
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
      setupProfile: null,
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

  function starsDifficulty(value) {
    return starsString(clamp(Math.round(value), 1, 5));
  }

  function levelFromReputation(reputation) {
    return clamp(1 + Math.floor(reputation / 60), 1, 10);
  }

  function levelBracketLabel(level) {
    var list = LEVEL_BRACKETS[state.lang] || LEVEL_BRACKETS.fr;

    for (var i = 0; i < list.length; i += 1) {
      if (level >= list[i].min && level <= list[i].max) {
        return list[i].label;
      }
    }

    return list[list.length - 1].label;
  }

  function riskLabel(riskKey) {
    var labels = RISK_LABELS[state.lang] || RISK_LABELS.fr;
    return labels[riskKey] || labels.medium;
  }

  function rewardLabel(tier) {
    var safe = clamp(Math.round(tier || 1), 1, 5);
    return '$$$$$'.slice(0, safe);
  }

  function riskWeight(riskKey) {
    if (riskKey === 'none') {
      return 0;
    }
    if (riskKey === 'low') {
      return 1;
    }
    if (riskKey === 'medium') {
      return 2;
    }
    if (riskKey === 'high') {
      return 3;
    }
    return 4;
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

  function issueDefinition(issueKey) {
    return ISSUE_MAP[issueKey] || null;
  }

  function issueTextFromDefinition(issueKey) {
    var definition = issueDefinition(issueKey);

    if (!definition || !definition.text || !definition.text[state.lang]) {
      return null;
    }

    return definition.text[state.lang];
  }

  function issueText(issueKey) {
    if (langPack().issues[issueKey]) {
      return langPack().issues[issueKey];
    }

    var issueDefinitionText = issueTextFromDefinition(issueKey);

    if (issueDefinitionText) {
      return issueDefinitionText;
    }

    return {
      label: issueKey,
      brokenDesc: issueKey,
      solution: issueKey,
      miniGame: modeText('timing')
    };
  }

  function issueLabel(issueKey) {
    return issueText(issueKey).label;
  }

  function issueBrokenDesc(issueKey) {
    return issueText(issueKey).brokenDesc;
  }

  function issueSolution(issueKey) {
    return issueText(issueKey).solution;
  }

  function issueMiniGame(issueKey, modeKey) {
    var details = issueText(issueKey);
    if (details && details.miniGame) {
      return details.miniGame;
    }
    return modeText(modeKey);
  }

  function modeText(mode) {
    return langPack().modes[mode];
  }

  function repairTypeText(typeKey) {
    if (langPack().repairTypes[typeKey]) {
      return langPack().repairTypes[typeKey];
    }

    if (REPAIR_TYPE_TEXT[typeKey] && REPAIR_TYPE_TEXT[typeKey][state.lang]) {
      return REPAIR_TYPE_TEXT[typeKey][state.lang];
    }

    return {
      label: typeKey,
      desc: ''
    };
  }

  function repairTypeLabel(typeKey) {
    return repairTypeText(typeKey).label;
  }

  function repairTypeDesc(typeKey) {
    return repairTypeText(typeKey).desc;
  }

  function materialLabel(materialKey) {
    return langPack().materials[materialKey] || materialKey;
  }

  function toolLabel(toolKey) {
    return langPack().tools[toolKey] || toolKey;
  }

  function setupRatingLabel(ratingKey) {
    return langPack().setupRating[ratingKey] || ratingKey;
  }

  function repairTypeDefinition(issueKey, repairTypeKey) {
    var definition = issueDefinition(issueKey);

    if (!definition) {
      return null;
    }

    for (var i = 0; i < definition.repairTypes.length; i += 1) {
      if (definition.repairTypes[i].key === repairTypeKey) {
        return definition.repairTypes[i];
      }
    }

    return null;
  }

  function choiceRating(selectedKey, bestKey, okKeys) {
    if (!selectedKey) {
      return 'missing';
    }
    if (selectedKey === bestKey) {
      return 'best';
    }
    if (okKeys && okKeys.indexOf(selectedKey) !== -1) {
      return 'ok';
    }
    return 'bad';
  }

  function choiceScore(choice) {
    if (choice === 'best') {
      return 2;
    }
    if (choice === 'ok') {
      return 1;
    }
    return -2;
  }

  function feedbackClassFromRating(rating) {
    if (rating === 'best') {
      return 'is-good';
    }
    if (rating === 'ok') {
      return 'is-ok';
    }
    if (rating === 'bad') {
      return 'is-bad';
    }
    return 'is-empty';
  }

  function setFeedbackText(element, text, rating) {
    element.className = 'cg-repair-feedback ' + feedbackClassFromRating(rating);
    element.textContent = text;
  }

  function explainMaterialChoice(issue, typeDef) {
    var ui = langPack().ui;
    var selected = issue.selectedMaterial || '';
    var best = typeDef.best.material;
    var rating = choiceRating(selected, best, typeDef.okMaterials || []);

    if (rating === 'missing') {
      return {
        rating: rating,
        text: ui.materialFeedbackDefault
      };
    }

    if (rating === 'best') {
      return {
        rating: rating,
        text: interpolate(ui.materialFeedbackBest, {
          selected: materialLabel(selected),
          repair: repairTypeLabel(issue.selectedRepairType),
          best: materialLabel(best)
        })
      };
    }

    if (rating === 'ok') {
      return {
        rating: rating,
        text: interpolate(ui.materialFeedbackOk, {
          selected: materialLabel(selected),
          repair: repairTypeLabel(issue.selectedRepairType),
          best: materialLabel(best)
        })
      };
    }

    return {
      rating: rating,
      text: interpolate(ui.materialFeedbackBad, {
        selected: materialLabel(selected),
        repair: repairTypeLabel(issue.selectedRepairType),
        best: materialLabel(best)
      })
    };
  }

  function explainToolChoice(issue, typeDef) {
    var ui = langPack().ui;
    var selected = issue.selectedTool || '';
    var best = typeDef.best.tool;
    var rating = choiceRating(selected, best, typeDef.okTools || []);

    if (rating === 'missing') {
      return {
        rating: rating,
        text: ui.toolFeedbackDefault
      };
    }

    if (rating === 'best') {
      return {
        rating: rating,
        text: interpolate(ui.toolFeedbackBest, {
          selected: toolLabel(selected),
          repair: repairTypeLabel(issue.selectedRepairType),
          best: toolLabel(best)
        })
      };
    }

    if (rating === 'ok') {
      return {
        rating: rating,
        text: interpolate(ui.toolFeedbackOk, {
          selected: toolLabel(selected),
          repair: repairTypeLabel(issue.selectedRepairType),
          best: toolLabel(best)
        })
      };
    }

    return {
      rating: rating,
      text: interpolate(ui.toolFeedbackBad, {
        selected: toolLabel(selected),
        repair: repairTypeLabel(issue.selectedRepairType),
        best: toolLabel(best)
      })
    };
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
    root.setAttribute('data-issue', ISSUE_VISUAL_MAP[issueKey] || issueKey || 'none');
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
      setupProfile: null,
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

  function mainActionLabel() {
    var ui = langPack().ui;

    if (!state.currentOrder || state.stage === 'done') {
      return ui.mainActionIdle;
    }

    if (state.actionLock) {
      return ui.mainActionLocked;
    }

    if (state.stage === 'diagnosis') {
      return ui.mainActionDiagnosis;
    }

    if (state.stage === 'repair') {
      return ui.mainActionRepair;
    }

    if (state.stage === 'finishing') {
      return ui.mainActionFinish;
    }

    return ui.mainActionIdle;
  }

  function updateButtons() {
    var activeOrder = !!state.currentOrder && state.stage !== 'done';
    elements.mainAction.disabled = !activeOrder || state.actionLock;
    elements.mainAction.textContent = mainActionLabel();

    elements.actionTiming.disabled = !(state.mini.type === 'timing' && state.mini.context === 'repair');
    elements.actionClicks.disabled = !(state.mini.type === 'clicks');
    elements.actionFinish.disabled = !(state.mini.type === 'timing' && state.mini.context === 'finish');

    var inRepairStage = activeOrder && state.stage === 'repair' && !state.actionLock;
    elements.repairMaterial.disabled = !inRepairStage;
    elements.repairTool.disabled = !inRepairStage;
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

      var broken = document.createElement('span');
      broken.className = 'cg-issue-solution';
      broken.textContent = langPack().ui.brokenPrefix + ': ' + issueBrokenDesc(issue.key);
      line.appendChild(broken);

      var missionMeta = document.createElement('span');
      var missionMinutes = Math.max(1, Math.round((issue.baseSeconds || 60) / 60));
      missionMeta.className = 'cg-issue-solution';
      missionMeta.textContent =
        starsDifficulty(issue.difficulty || 1) +
        ' | ' + missionMinutes + ' min' +
        ' | ' + rewardLabel(issue.rewardTier || 1) +
        ' | ' + riskLabel(issue.risk || 'medium');
      line.appendChild(missionMeta);

      if (issue.selectedRepairType) {
        var chosenType = document.createElement('span');
        chosenType.className = 'cg-issue-solution';
        chosenType.textContent =
          langPack().ui.selectedRepairPrefix + ': ' + repairTypeLabel(issue.selectedRepairType);
        line.appendChild(chosenType);
      }

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

    var avgDifficulty = 1;
    var totalDifficulty = 0;
    for (var i = 0; i < state.currentOrder.issues.length; i += 1) {
      totalDifficulty += state.currentOrder.issues[i].difficulty || 1;
    }
    avgDifficulty = totalDifficulty / Math.max(1, state.currentOrder.issues.length);

    var missionTypeLabel = state.currentOrder.issues.length > 1
      ? langPack().difficulty.double
      : langPack().difficulty.single;

    elements.orderClient.textContent = state.currentOrder.client;
    elements.orderDifficulty.textContent =
      starsDifficulty(avgDifficulty) + ' ' + levelBracketLabel(state.level) + ' | ' +
      missionTypeLabel + ' | ' + langPack().levelWord + ' ' + state.level;
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
        repairType: issue.selectedRepairType ? repairTypeLabel(issue.selectedRepairType) : pack.ui.noRepairType,
        mode: issueMiniGame(issue.key, issue.mode)
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

  function clearSelect(element, placeholderText) {
    element.innerHTML = '';
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = placeholderText;
    element.appendChild(placeholder);
  }

  function populateSelect(element, keys, placeholderText, selectedKey, labelFn) {
    clearSelect(element, placeholderText);

    for (var i = 0; i < keys.length; i += 1) {
      var option = document.createElement('option');
      option.value = keys[i];
      option.textContent = labelFn(keys[i]);
      element.appendChild(option);
    }

    if (selectedKey) {
      element.value = selectedKey;
    }
  }

  function renderDiagnosisPanel() {
    if (!state.currentOrder || state.stage !== 'diagnosis') {
      elements.diagnosisPanel.hidden = true;
      return;
    }

    elements.diagnosisPanel.hidden = false;
    elements.diagnosisList.innerHTML = '';

    for (var i = 0; i < state.currentOrder.issues.length; i += 1) {
      var issue = state.currentOrder.issues[i];
      var issueDef = issueDefinition(issue.key);
      var card = document.createElement('article');
      card.className = 'cg-diagnosis-card';

      var title = document.createElement('h4');
      title.textContent = issueLabel(issue.key);
      card.appendChild(title);

      var broken = document.createElement('p');
      broken.className = 'cg-diagnosis-break';
      broken.textContent = issueBrokenDesc(issue.key);
      card.appendChild(broken);

      var selectLabel = document.createElement('label');
      selectLabel.className = 'cg-diagnosis-label';
      selectLabel.setAttribute('for', 'diag-type-' + i);
      selectLabel.textContent = langPack().ui.chooseRepairTypeLabel;
      card.appendChild(selectLabel);

      var select = document.createElement('select');
      select.id = 'diag-type-' + i;
      select.className = 'cg-diagnosis-select';
      select.setAttribute('data-diagnosis-select', '');
      select.setAttribute('data-issue-index', String(i));

      var placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = langPack().ui.chooseRepairTypePlaceholder;
      select.appendChild(placeholder);

      for (var j = 0; j < issueDef.repairTypes.length; j += 1) {
        var option = document.createElement('option');
        option.value = issueDef.repairTypes[j].key;
        option.textContent = repairTypeLabel(issueDef.repairTypes[j].key);
        select.appendChild(option);
      }

      if (issue.selectedRepairType) {
        select.value = issue.selectedRepairType;
      }

      card.appendChild(select);

      var chosen = document.createElement('p');
      chosen.className = 'cg-diagnosis-choice';
      if (issue.selectedRepairType) {
        chosen.textContent =
          langPack().ui.repairTypeChosenLabel + ': ' + repairTypeLabel(issue.selectedRepairType) +
          ' - ' + repairTypeDesc(issue.selectedRepairType);
      } else {
        chosen.textContent =
          langPack().ui.repairTypeChosenLabel + ': ' + langPack().ui.noRepairType;
      }
      card.appendChild(chosen);

      elements.diagnosisList.appendChild(card);
    }
  }

  function renderRepairPlan() {
    if (!state.currentOrder || state.stage !== 'repair') {
      elements.repairPlan.hidden = true;
      clearSelect(elements.repairMaterial, langPack().ui.chooseMaterialPlaceholder);
      clearSelect(elements.repairTool, langPack().ui.chooseToolPlaceholder);
      elements.repairIssue.textContent = '-';
      elements.repairType.textContent = '-';
      setFeedbackText(elements.materialFeedback, langPack().ui.materialFeedbackDefault, 'missing');
      setFeedbackText(elements.toolFeedback, langPack().ui.toolFeedbackDefault, 'missing');
      elements.repairHint.textContent = langPack().ui.repairHintDefault;
      return;
    }

    var issue = getCurrentIssue();

    if (!issue) {
      elements.repairPlan.hidden = true;
      return;
    }

    elements.repairPlan.hidden = false;
    elements.repairIssue.textContent = issueLabel(issue.key);

    if (!issue.selectedRepairType) {
      elements.repairType.textContent = langPack().ui.noRepairType;
      clearSelect(elements.repairMaterial, langPack().ui.chooseMaterialPlaceholder);
      clearSelect(elements.repairTool, langPack().ui.chooseToolPlaceholder);
      setFeedbackText(elements.materialFeedback, langPack().ui.materialFeedbackDefault, 'missing');
      setFeedbackText(elements.toolFeedback, langPack().ui.toolFeedbackDefault, 'missing');
      elements.repairHint.textContent = langPack().ui.repairHintDefault;
      return;
    }

    var typeDef = repairTypeDefinition(issue.key, issue.selectedRepairType);
    elements.repairType.textContent = repairTypeLabel(issue.selectedRepairType);

    if (!typeDef) {
      clearSelect(elements.repairMaterial, langPack().ui.chooseMaterialPlaceholder);
      clearSelect(elements.repairTool, langPack().ui.chooseToolPlaceholder);
      setFeedbackText(elements.materialFeedback, langPack().ui.materialFeedbackDefault, 'missing');
      setFeedbackText(elements.toolFeedback, langPack().ui.toolFeedbackDefault, 'missing');
      elements.repairHint.textContent = langPack().ui.repairHintDefault;
      return;
    }

    populateSelect(
      elements.repairMaterial,
      typeDef.materialOptions,
      langPack().ui.chooseMaterialPlaceholder,
      issue.selectedMaterial,
      materialLabel
    );

    populateSelect(
      elements.repairTool,
      typeDef.toolOptions,
      langPack().ui.chooseToolPlaceholder,
      issue.selectedTool,
      toolLabel
    );

    var materialFeedback = explainMaterialChoice(issue, typeDef);
    var toolFeedback = explainToolChoice(issue, typeDef);

    setFeedbackText(elements.materialFeedback, materialFeedback.text, materialFeedback.rating);
    setFeedbackText(elements.toolFeedback, toolFeedback.text, toolFeedback.rating);

    elements.repairHint.textContent =
      repairTypeDesc(issue.selectedRepairType) + ' ' + langPack().ui.repairHintDefault;
  }

  function renderWorkshopPanels() {
    renderDiagnosisPanel();
    renderRepairPlan();
  }

  function renderAll() {
    renderOrderPanel();
    renderWorkshopPanels();
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
    if (level >= 4) {
      var chance = Math.min(0.18 + (level - 3) * 0.12, 0.72);
      if (Math.random() < chance) {
        issueCount = 2;
      }
    }

    var pool = ISSUE_LIBRARY.filter(function (definition) {
      return level >= (definition.minLevel || 1);
    });

    if (pool.length === 0) {
      pool = ISSUE_LIBRARY.slice(0, 3);
    }

    var selected = [];

    while (selected.length < issueCount && pool.length > 0) {
      var index = Math.floor(Math.random() * pool.length);
      selected.push(pool.splice(index, 1)[0]);
    }

    return selected;
  }

  function buildIssueTask(definition, level, issueCount) {
    var missionDifficulty = definition.difficulty || 1;
    var hardness = missionDifficulty * 1.8 + level * 0.85 + (issueCount - 1) * 1.7;

    return {
      key: definition.key,
      mode: definition.mode,
      status: 'pending',
      difficulty: missionDifficulty,
      rewardTier: definition.rewardTier || missionDifficulty,
      risk: definition.risk || 'medium',
      baseSeconds: definition.baseSeconds || 60,
      timingZone: clamp(40 - hardness * 2.1, 8, 36),
      timingSpeed: 28 + hardness * 4.6,
      requiredClicks: Math.round(8 + hardness * 2.1),
      clickDurationMs: Math.round(clamp(9200 - hardness * 320, 3000, 9200)),
      decayRate: clamp(0.14 + hardness * 0.018, 0.14, 0.5),
      gainPerClick: clamp(1 + hardness * 0.045, 1, 2.4),
      selectedRepairType: '',
      selectedMaterial: '',
      selectedTool: ''
    };
  }

  function generateOrder() {
    var selected = pickIssueSet(state.level);
    var issues = [];
    var totalSeconds = 0;

    for (var i = 0; i < selected.length; i += 1) {
      var task = buildIssueTask(selected[i], state.level, selected.length);
      totalSeconds += task.baseSeconds;
      issues.push(task);
    }

    var pressureCut = Math.round((state.level - 1) * 3.2);
    var multiRepairCut = Math.round((issues.length - 1) * 14);
    var limit = clamp(totalSeconds - pressureCut - multiRepairCut, 55, 420);

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

    var missing = [];
    for (var i = 0; i < state.currentOrder.issues.length; i += 1) {
      if (!state.currentOrder.issues[i].selectedRepairType) {
        missing.push(issueLabel(state.currentOrder.issues[i].key));
      }
    }

    if (missing.length > 0) {
      applyPenalty(
        6,
        0,
        interpolate(langPack().logs.diagnosisMissingChoice, {
          issues: missing.join(', ')
        })
      );
      renderAll();
      return;
    }

    state.diagnosed = true;
    state.stage = 'repair';
    applyReward(8);

    var solutionText = state.currentOrder.issues.map(function (issue) {
      return issueLabel(issue.key) + ' -> ' + repairTypeLabel(issue.selectedRepairType);
    }).join(' | ');

    addLog(interpolate(langPack().logs.diagnosisDone, {
      solutions: solutionText
    }));

    renderAll();
  }

  function evaluateRepairSetup(issue) {
    var typeDef = repairTypeDefinition(issue.key, issue.selectedRepairType);

    if (!typeDef || !issue.selectedMaterial || !issue.selectedTool) {
      return null;
    }

    var materialFeedback = explainMaterialChoice(issue, typeDef);
    var toolFeedback = explainToolChoice(issue, typeDef);
    var score = choiceScore(materialFeedback.rating) + choiceScore(toolFeedback.rating);

    if (score >= 3) {
      return {
        score: score,
        materialFeedback: materialFeedback,
        toolFeedback: toolFeedback,
        ratingKey: 'excellent',
        qualityBonus: 8,
        zoneDelta: 5,
        speedDelta: -7,
        requiredDelta: -4,
        timeDelta: 1000,
        gainDelta: 0.3,
        startPenalty: 0
      };
    }

    if (score >= 1) {
      return {
        score: score,
        materialFeedback: materialFeedback,
        toolFeedback: toolFeedback,
        ratingKey: 'good',
        qualityBonus: 4,
        zoneDelta: 2,
        speedDelta: -2,
        requiredDelta: -2,
        timeDelta: 400,
        gainDelta: 0.14,
        startPenalty: 0
      };
    }

    if (score >= 0) {
      return {
        score: score,
        materialFeedback: materialFeedback,
        toolFeedback: toolFeedback,
        ratingKey: 'risky',
        qualityBonus: 1,
        zoneDelta: -1,
        speedDelta: 2,
        requiredDelta: 1,
        timeDelta: -220,
        gainDelta: -0.06,
        startPenalty: 1
      };
    }

    return {
      score: score,
      materialFeedback: materialFeedback,
      toolFeedback: toolFeedback,
      ratingKey: 'poor',
      qualityBonus: -3,
      zoneDelta: -4,
      speedDelta: 7,
      requiredDelta: 4,
      timeDelta: -900,
      gainDelta: -0.2,
      startPenalty: 3
    };
  }

  function beginTimingMiniGame(context, issue, setupProfile) {
    clearMini();

    state.actionLock = true;
    state.mini.type = 'timing';
    state.mini.context = context;
    state.mini.issueKey = issue ? issue.key : null;
    state.mini.setupProfile = setupProfile || null;

    var baseSpeed = context === 'finish'
      ? 44 + state.level * 3.2
      : issue.timingSpeed;

    var baseZoneSize = context === 'finish'
      ? clamp(22 - state.level * 1.4, 9, 24)
      : issue.timingZone;

    if (setupProfile) {
      baseSpeed += setupProfile.speedDelta;
      baseZoneSize += setupProfile.zoneDelta;
    }

    state.mini.speed = clamp(baseSpeed, 18, 98);

    var zoneSize = clamp(baseZoneSize, 7, 44);
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
      current + ' / ' + state.mini.required + ' | ' + langPack().ui.timeShort + ' ' + seconds + 's';
  }

  function beginClicksMiniGame(issue, setupProfile) {
    clearMini();

    state.actionLock = true;
    state.mini.type = 'clicks';
    state.mini.context = 'repair';
    state.mini.issueKey = issue.key;
    state.mini.setupProfile = setupProfile || null;

    var required = issue.requiredClicks + (setupProfile ? setupProfile.requiredDelta : 0);
    var duration = issue.clickDurationMs + (setupProfile ? setupProfile.timeDelta : 0);
    var gain = issue.gainPerClick + (setupProfile ? setupProfile.gainDelta : 0);
    var decay = issue.decayRate + (setupProfile && setupProfile.score <= 0 ? 0.04 : 0);

    state.mini.required = Math.round(clamp(required, 6, 44));
    state.mini.progress = 0;
    state.mini.deadline = Date.now() + Math.round(clamp(duration, 2500, 11000));
    state.mini.decayRate = clamp(decay, 0.12, 0.62);
    state.mini.gainPerClick = clamp(gain, 0.55, 2.8);

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
      applyReward(10 + (issue.rewardTier || 1) * 9 + state.level * 2 + qualityBonus);
      addLog(interpolate(langPack().logs.repairSuccess, {
        issue: issueLabel(issue.key)
      }));
    } else {
      var riskPower = riskWeight(issue.risk || 'medium');
      issue.status = 'rough';
      applyPenalty(10 + riskPower * 3, riskPower >= 3 ? 2 : 1, interpolate(langPack().logs.repairFail, {
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
    var tierTotal = 0;
    for (var tierIndex = 0; tierIndex < state.currentOrder.issues.length; tierIndex += 1) {
      tierTotal += state.currentOrder.issues[tierIndex].rewardTier || 1;
    }

    state.completedOrders += 1;

    var reputationGain = state.satisfaction * 4 + fixed * 3 + tierTotal * 2 + (finishSuccess ? 4 : 0) - rough * 2;
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
      return;
    }

    var setupBonus = state.mini.setupProfile ? state.mini.setupProfile.qualityBonus : 0;
    resolveRepair(success, quality + setupBonus);
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
      var setupBonus = state.mini.setupProfile ? state.mini.setupProfile.qualityBonus : 0;
      var quality = Math.round((Date.now() < state.mini.deadline ? 1 : 0.4) * 12);
      resolveRepair(true, quality + setupBonus);
    }
  }

  function startRepairFromTool() {
    var issue = getCurrentIssue();

    if (!issue) {
      state.stage = 'finishing';
      renderAll();
      return;
    }

    if (!issue.selectedRepairType) {
      applyPenalty(
        7,
        0,
        interpolate(langPack().logs.repairTypeMissing, {
          issue: issueLabel(issue.key)
        })
      );
      return;
    }

    if (!issue.selectedMaterial || !issue.selectedTool) {
      applyPenalty(7, 0, langPack().logs.repairSetupMissing);
      return;
    }

    var setupProfile = evaluateRepairSetup(issue);

    if (!setupProfile) {
      applyPenalty(7, 0, langPack().logs.repairSetupMissing);
      return;
    }

    addLog(interpolate(langPack().logs.repairSetupLog, {
      issue: issueLabel(issue.key),
      material: materialLabel(issue.selectedMaterial),
      tool: toolLabel(issue.selectedTool),
      rating: setupRatingLabel(setupProfile.ratingKey)
    }));

    addLog(interpolate(langPack().logs.repairMaterialWhy, {
      explanation: setupProfile.materialFeedback.text
    }));
    addLog(interpolate(langPack().logs.repairToolWhy, {
      explanation: setupProfile.toolFeedback.text
    }));

    if (setupProfile.startPenalty > 0) {
      applyPenalty(setupProfile.startPenalty, 0, langPack().logs.repairSetupPenalty);
    }

    addLog(interpolate(langPack().logs.repairStarted, {
      issue: issueLabel(issue.key)
    }));

    if (issue.mode === 'timing') {
      beginTimingMiniGame('repair', issue, setupProfile);
    } else {
      beginClicksMiniGame(issue, setupProfile);
    }
  }

  function startFinishFromTool() {
    beginTimingMiniGame('finish', null, null);
  }

  function handleMainAction() {
    if (!state.currentOrder || state.stage === 'done') {
      addLog(langPack().logs.noOrder);
      return;
    }

    if (state.actionLock) {
      addLog(langPack().logs.miniLocked);
      return;
    }

    if (state.stage === 'diagnosis') {
      completeDiagnosis();
      return;
    }

    if (state.stage === 'repair') {
      if (!state.diagnosed) {
        applyPenalty(10, 1, langPack().logs.needDiagnosis);
        return;
      }
      startRepairFromTool();
      return;
    }

    if (state.stage === 'finishing') {
      if (!state.diagnosed) {
        applyPenalty(10, 1, langPack().logs.needDiagnosis);
        return;
      }
      startFinishFromTool();
      return;
    }

    applyPenalty(8, 1, langPack().logs.wrongDuringFinish);
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

  function handleDiagnosisSelectionChange(event) {
    var target = event.target;

    if (!target || !target.hasAttribute('data-diagnosis-select')) {
      return;
    }

    if (!state.currentOrder || state.stage !== 'diagnosis') {
      return;
    }

    var issueIndex = Number(target.getAttribute('data-issue-index'));

    if (!Number.isInteger(issueIndex)) {
      return;
    }

    var issue = state.currentOrder.issues[issueIndex];

    if (!issue) {
      return;
    }

    issue.selectedRepairType = target.value || '';
    issue.selectedMaterial = '';
    issue.selectedTool = '';

    renderWorkshopPanels();
    renderIssues();
  }

  function handleRepairMaterialChange() {
    var issue = getCurrentIssue();

    if (!issue || state.stage !== 'repair') {
      return;
    }

    issue.selectedMaterial = elements.repairMaterial.value || '';
    renderRepairPlan();
  }

  function handleRepairToolChange() {
    var issue = getCurrentIssue();

    if (!issue || state.stage !== 'repair') {
      return;
    }

    issue.selectedTool = elements.repairTool.value || '';
    renderRepairPlan();
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

    if (event.key === 'a' || event.key === 'A') {
      event.preventDefault();
      handleMainAction();
      return;
    }

    if (event.key === 'd' || event.key === 'D') {
      event.preventDefault();
      handleMainAction();
      return;
    }

    if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      handleMainAction();
      return;
    }

    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault();
      handleMainAction();
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
  elements.mainAction.addEventListener('click', handleMainAction);

  elements.actionTiming.addEventListener('click', handleTimingHit);
  elements.actionClicks.addEventListener('click', handleClicksHit);
  elements.actionFinish.addEventListener('click', handleTimingHit);

  elements.diagnosisList.addEventListener('change', handleDiagnosisSelectionChange);
  elements.repairMaterial.addEventListener('change', handleRepairMaterialChange);
  elements.repairTool.addEventListener('change', handleRepairToolChange);

  document.addEventListener('keydown', handleShortcuts);

  loadProgress();
  clearMini();
  applyStaticTranslations();
  clearLogs();
  addLog(langPack().logs.workshopReady);
  renderAll();
})();
