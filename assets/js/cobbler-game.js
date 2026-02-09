(function () {
  var root = document.querySelector('[data-cobbler-game]');

  if (!root) {
    return;
  }

  var STORAGE_KEY = 'cobblerWorkshopSaveV2';
  var MAX_LOG_ITEMS = 16;
  var WEEK_HOURS_LIMIT = 40;
  var DAY_HOURS_LIMIT = 8;
  var STARTING_CASH = 180;
  var SUPPLY_COOLDOWN_HOURS = 8;
  var QUEUE_WEEK_PENALTY_RATE = 0.3;
  var QUEUE_MAX_ITEMS = 12;
  var MONTHLY_RENT = 700;
  var MARKETING_COST = 180;
  var MARKETING_DURATION_DAYS = 7;
  var START_DATE_ISO = '2026-01-05';

  var STARTING_STOCK = {
    contactGlue: 2,
    resinCement: 1,
    solePrimer: 1,
    waxedThread: 1,
    seamTape: 1,
    rubberTopLift: 0,
    heelNails: 0,
    heelLeather: 0,
    conditioningCream: 3,
    nourishingOil: 3,
    leatherFiller: 1,
    polishCream: 3,
    leatherCleaner: 3,
    saddleSoap: 2,
    halfSolePiece: 0,
    heelLiningLeather: 0,
    leatherDye: 0,
    colorFixative: 0,
    newOutsole: 0,
    corkFiller: 0,
    newWeltStrip: 0,
    steelShank: 0,
    leatherShank: 0,
    leatherPatch: 0
  };

  var SUPPLY_CATALOG = [
    {
      id: 'careCrate',
      cost: 82,
      requires: '',
      stock: {
        polishCream: 6,
        leatherCleaner: 6,
        saddleSoap: 3,
        nourishingOil: 6,
        conditioningCream: 6
      },
      text: {
        fr: {
          label: 'Caisse entretien',
          desc: 'Stock de base pour cirage, nettoyage et nutrition.'
        },
        en: {
          label: 'Care crate',
          desc: 'Core stock for shine, cleaning, and conditioning.'
        }
      }
    },
    {
      id: 'heelPack',
      cost: 146,
      requires: 'heelBench',
      stock: {
        rubberTopLift: 6,
        heelNails: 18,
        contactGlue: 6,
        heelLiningLeather: 3
      },
      text: {
        fr: {
          label: 'Pack talon',
          desc: 'Bonbouts et fixations pour reparations talon.'
        },
        en: {
          label: 'Heel pack',
          desc: 'Top-lifts and fasteners for heel work.'
        }
      }
    },
    {
      id: 'stitchPack',
      cost: 228,
      requires: 'stitchBench',
      stock: {
        halfSolePiece: 6,
        waxedThread: 12,
        seamTape: 9,
        solePrimer: 6,
        contactGlue: 6
      },
      text: {
        fr: {
          label: 'Pack couture',
          desc: 'Materiaux demi-semelle et recousu tige.'
        },
        en: {
          label: 'Stitch pack',
          desc: 'Half-sole and upper stitching materials.'
        }
      }
    },
    {
      id: 'dyePack',
      cost: 264,
      requires: 'dyeStation',
      stock: {
        leatherDye: 9,
        colorFixative: 9,
        conditioningCream: 6,
        nourishingOil: 3
      },
      text: {
        fr: {
          label: 'Pack teinture',
          desc: 'Teinture et fixateur pour recoloration.'
        },
        en: {
          label: 'Dye pack',
          desc: 'Dye and fixative for recolor services.'
        }
      }
    },
    {
      id: 'resolePack',
      cost: 412,
      requires: 'resoleBench',
      stock: {
        newOutsole: 3,
        corkFiller: 6,
        newWeltStrip: 3,
        waxedThread: 12,
        contactGlue: 6
      },
      text: {
        fr: {
          label: 'Pack ressemelage',
          desc: 'Semelle, liege et trepointe pour missions expert.'
        },
        en: {
          label: 'Resole pack',
          desc: 'Outsole, cork, and welt stock for expert jobs.'
        }
      }
    },
    {
      id: 'masterPack',
      cost: 560,
      requires: 'moulin',
      stock: {
        steelShank: 6,
        leatherShank: 6,
        leatherPatch: 6,
        leatherFiller: 6,
        resinCement: 6
      },
      text: {
        fr: {
          label: 'Pack maitre',
          desc: 'Pieces structurelles avancees et patch cuir.'
        },
        en: {
          label: 'Master pack',
          desc: 'Advanced structural parts and leather patch stock.'
        }
      }
    }
  ];

  var SERVICE_MATERIAL_WEAR = {
    premiumShine: { polishCream: 1, conditioningCream: 1 },
    deepCleaning: { leatherCleaner: 1, saddleSoap: 1 },
    leatherHydration: { nourishingOil: 1, conditioningCream: 1 },
    replaceTopLiftMission: { rubberTopLift: 1, heelNails: 2, contactGlue: 1 },
    halfSoleMission: { halfSolePiece: 1, contactGlue: 1, solePrimer: 1 },
    upperStitchMission: { waxedThread: 1, seamTape: 1 },
    heelLiningMission: { heelLiningLeather: 1, contactGlue: 1 },
    recolorMission: { leatherDye: 1, colorFixative: 1 },
    fullResoleMission: { newOutsole: 1, contactGlue: 1, waxedThread: 1 },
    corkReplaceMission: { corkFiller: 1, contactGlue: 1 },
    weltRestitchMission: { waxedThread: 1, seamTape: 1 },
    weltReplaceMission: { newWeltStrip: 1, waxedThread: 1, contactGlue: 1 },
    shankReplaceMission: { steelShank: 1, contactGlue: 1 },
    tornLeatherMission: { leatherPatch: 1, leatherFiller: 1, contactGlue: 1 }
  };

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

  var SERVICE_ECONOMY = {
    premiumShine: { fee: 54, hours: 2, excellenceBonus: 14, unlock: '' },
    deepCleaning: { fee: 48, hours: 2, excellenceBonus: 12, unlock: '' },
    leatherHydration: { fee: 70, hours: 3, excellenceBonus: 18, unlock: 'careKit' },
    replaceTopLiftMission: { fee: 120, hours: 4, excellenceBonus: 24, unlock: 'heelBench' },
    halfSoleMission: { fee: 160, hours: 5, excellenceBonus: 30, unlock: 'stitchBench' },
    upperStitchMission: { fee: 148, hours: 5, excellenceBonus: 28, unlock: 'stitchBench' },
    heelLiningMission: { fee: 98, hours: 4, excellenceBonus: 20, unlock: 'careKit' },
    recolorMission: { fee: 178, hours: 5, excellenceBonus: 32, unlock: 'dyeStation' },
    fullResoleMission: { fee: 270, hours: 8, excellenceBonus: 58, unlock: 'resoleBench' },
    corkReplaceMission: { fee: 228, hours: 7, excellenceBonus: 44, unlock: 'resoleBench' },
    weltRestitchMission: { fee: 248, hours: 7, excellenceBonus: 52, unlock: 'resoleBench' },
    weltReplaceMission: { fee: 340, hours: 9, excellenceBonus: 70, unlock: 'moulin' },
    shankReplaceMission: { fee: 312, hours: 9, excellenceBonus: 66, unlock: 'moulin' },
    tornLeatherMission: { fee: 294, hours: 8, excellenceBonus: 58, unlock: 'moulin' }
  };

  var TOOL_UPGRADES = [
    {
      id: 'careKit',
      cost: 190,
      unlocks: ['leatherHydration', 'heelLiningMission'],
      requires: '',
      text: {
        fr: {
          label: 'Kit entretien cuir',
          desc: 'Debloque rehydratation et doublure talon.'
        },
        en: {
          label: 'Leather care kit',
          desc: 'Unlocks hydration and heel lining services.'
        }
      }
    },
    {
      id: 'heelBench',
      cost: 360,
      unlocks: ['replaceTopLiftMission'],
      requires: '',
      text: {
        fr: {
          label: 'Poste talon',
          desc: 'Debloque remplacement top-lift.'
        },
        en: {
          label: 'Heel bench',
          desc: 'Unlocks top-lift replacement.'
        }
      }
    },
    {
      id: 'stitchBench',
      cost: 620,
      unlocks: ['halfSoleMission', 'upperStitchMission'],
      requires: 'heelBench',
      text: {
        fr: {
          label: 'Atelier couture',
          desc: 'Debloque demi-semelle et couture tige.'
        },
        en: {
          label: 'Stitch bench',
          desc: 'Unlocks half sole and upper stitching.'
        }
      }
    },
    {
      id: 'dyeStation',
      cost: 780,
      unlocks: ['recolorMission'],
      requires: 'careKit',
      text: {
        fr: {
          label: 'Station teinture',
          desc: 'Debloque recoloration cuir.'
        },
        en: {
          label: 'Dye station',
          desc: 'Unlocks leather recolor service.'
        }
      }
    },
    {
      id: 'resoleBench',
      cost: 1180,
      unlocks: ['fullResoleMission', 'corkReplaceMission', 'weltRestitchMission'],
      requires: 'stitchBench',
      text: {
        fr: {
          label: 'Poste ressemelage',
          desc: 'Debloque ressemelage, liege et reprise trepointe.'
        },
        en: {
          label: 'Resole bench',
          desc: 'Unlocks resole, cork refill and welt restitch.'
        }
      }
    },
    {
      id: 'moulin',
      cost: 1960,
      unlocks: ['weltReplaceMission', 'shankReplaceMission', 'tornLeatherMission'],
      requires: 'resoleBench',
      text: {
        fr: {
          label: 'Moulin de couture',
          desc: 'Machine avancee pour services maitre cordonnier.'
        },
        en: {
          label: 'Stitching mill',
          desc: 'Advanced machine for master services.'
        }
      }
    }
  ];

  var ISSUE_MAP = {};
  var REPAIR_TYPE_TEXT = {};
  var UPGRADE_MAP = {};
  for (var libraryIndex = 0; libraryIndex < ISSUE_LIBRARY.length; libraryIndex += 1) {
    var issueDef = ISSUE_LIBRARY[libraryIndex];
    ISSUE_MAP[issueDef.key] = issueDef;

    for (var repairTextIndex = 0; repairTextIndex < issueDef.repairTypes.length; repairTextIndex += 1) {
      REPAIR_TYPE_TEXT[issueDef.repairTypes[repairTextIndex].key] =
        issueDef.repairTypes[repairTextIndex].text || null;
    }
  }

  for (var upgradeIndex = 0; upgradeIndex < TOOL_UPGRADES.length; upgradeIndex += 1) {
    UPGRADE_MAP[TOOL_UPGRADES[upgradeIndex].id] = TOOL_UPGRADES[upgradeIndex];
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

  var ISSUE_SCENE_IMAGE_MAP = {
    premiumShine: {
      active: 'mission-premium-shine.png',
      result: 'scene-polished.png',
      failed: 'scene-worn.png'
    },
    deepCleaning: {
      active: 'mission-deep-cleaning.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    leatherHydration: {
      active: 'mission-leather-hydration.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    replaceTopLiftMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    halfSoleMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    upperStitchMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    heelLiningMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    recolorMission: {
      active: 'scene-worn.png',
      result: 'scene-polished.png',
      failed: 'scene-worn.png'
    },
    fullResoleMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    corkReplaceMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    weltRestitchMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    weltReplaceMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    shankReplaceMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    },
    tornLeatherMission: {
      active: 'scene-worn.png',
      result: 'scene-restored.png',
      failed: 'scene-worn.png'
    }
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
        newOrderBtn: 'Demarrer une commande',
        exitGameBtn: 'Quitter le jeu',
        dateLabel: 'Date',
        dayHoursLabel: 'Heures du jour',
        marketingLabel: 'Marketing',
        marketingNone: 'Aucun',
        marketingActive: 'Actif ({days}j)',
        inventoryTitle: 'Inventaire materiaux',
        inventoryLowTag: 'faible',
        incomingTitle: 'Demandes entrantes',
        incomingSummaryDefault: 'Nouvelles demandes en attente.',
        incomingSummaryTemplate: '{count} demande(s) en attente.',
        incomingEmpty: 'Aucune demande entrante.',
        incomingItemTemplate: '{client} - {service} ({hours} / {price})',
        acceptJobBtn: 'Accepter',
        declineJobBtn: 'Refuser',
        queueTitle: 'File clients',
        queueSelectBtn: 'Choisir',
        queueHoldBtn: 'Mettre en attente',
        queueSelectedBadge: 'Selectionnee',
        queueClientLabel: 'Client',
        queueServiceLabel: 'Service',
        queueAddBtn: 'Ajouter a la file',
        queueEmpty: 'Aucun client en file.',
        queueSummaryDefault: 'Aucun client en file.',
        queueSummaryTemplate: '{count} client(s) en file ({hours}).',
        queueItemTemplate: '{client} - {service} ({hours})',
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
        repairExpectedSetup: 'Setup recommande: {material} + {tool}.',
        repairExpectedResult: 'Resultat attendu: {result}.',
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
        mainActionFinish: 'Lancer finition',
        completionPopupTitle: 'Commande terminee',
        completionPopupDefault: 'Pret pour un nouveau client ?',
        completionPopupAction: 'Demarrer une commande',
        completionPopupSummary: 'Commande livree: {stars}/5 etoiles, {fixed}/{total} reparations solides. Pret pour un nouveau client ?',
        cashLabel: 'Caisse',
        weekLabel: 'Semaine',
        hoursLeftLabel: 'Heures restantes',
        servicesUnlockedLabel: 'Services debloques',
        weekPopupTitle: 'Resume hebdomadaire',
        weekPopupDefault: 'Semaine terminee. Verifie le bilan puis investis dans tes outils.',
        weekPopupSummary: 'Semaine {week}: {orders} commandes traitees. Tu as utilise {hoursUsed}.',
        weekRevenueLabel: 'Revenus services',
        weekBonusLabel: 'Bonus excellence',
        weekRentLabel: 'Loyer atelier',
        weekNetLabel: 'Net de semaine',
        weekQueuePenaltyLabel: 'Penalite file',
        weekCashAfterLabel: 'Caisse finale',
        weekHoursUsedLabel: 'Heures utilisees',
        weekUpgradeTitle: 'Ameliorer les outils',
        weekNextBtn: 'Lancer la semaine suivante',
        shelveOrderBtn: 'Mettre de cote',
        waitNextDayBtn: 'Attendre demain',
        buyMarketingBtn: 'Lancer marketing',
        openSupplyBtn: 'Commander materiaux',
        supplyPopupTitle: 'Commander materiaux',
        supplyPopupDefault: 'Commande possible toutes les 8h. Livraison le lendemain.',
        supplyIncomingLabel: 'Livraisons en attente',
        closeSupplyBtn: 'Fermer',
        supplyBuyBtn: 'Commander',
        supplyMarketingLabel: 'Campagne marketing',
        supplyMarketingDesc: 'Booste les demandes entrantes pendant 7 jours.',
        supplyMarketingMetaTemplate: '{cost} | +{days} jours de demande',
        supplyOwnedStockLabel: 'Stock',
        supplyMetaTemplate: '{cost} | +{items}',
        supplyNeedCashStatus: 'Fonds insuffisants',
        supplyLockedStatus: 'Prerequis manquant',
        supplyCooldownStatus: 'Attendre {hours}',
        supplyReadyStatus: 'Disponible maintenant',
        supplyCooldownReady: 'Commande disponible maintenant.',
        supplyCooldownWait: 'Prochaine commande dans {hours}.',
        upgradeBuyBtn: 'Acheter',
        upgradeOwnedStatus: 'Deja possede',
        upgradeNeedCashStatus: 'Fonds insuffisants',
        upgradeLockedStatus: 'Prerequis manquant',
        noUpgradeLeft: 'Tous les outils disponibles sont deja installes.',
        serviceMetaTemplate: '{stars} | {hours} | {price} | {risk}',
        sceneAltIdle: 'Illustration atelier de cordonnerie.',
        sceneAltIssue: 'Illustration mission: {issue}.',
        sceneAltFinishing: 'Illustration botte en finition.',
        sceneAltDone: 'Illustration botte reparee.'
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
        noQueueOrder: 'Aucune commande acceptee: choisis une demande entrante et accepte-la.',
        weekendClosed: 'Atelier ferme le weekend. Utilise "Attendre demain" pour passer au jour ouvrable.',
        dayNoHoursLeft: 'Journee terminee (8h). Attends demain pour reprendre.',
        miniLocked: 'Mini-jeu en cours: termine l\'action actuelle.',
        newOrder: 'Nouveau client: {client}. Probleme(s): {issues}.',
        incomingAccepted: 'Demande acceptee: {client} ({service}).',
        incomingDeclined: 'Demande refusee: {client} ({service}).',
        queueSelected: 'Commande choisie: {client} ({service}).',
        queueBackToWaiting: 'Commande remise en attente: {client} ({service}).',
        queueAdded: 'Client ajoute a la file: {client} ({service}, {hours}).',
        queueSelectionMissing: 'Selection incomplete: choisis client et service.',
        queueCapacityReached: 'File pleine: termine des commandes avant d\'en ajouter.',
        queueWeekCapacity: 'Cette commande depasse les heures disponibles cette semaine.',
        queueStarted: 'Commande sortie de file: {client} ({service}).',
        orderShelved: 'Commande mise de cote: {client} ({service}).',
        orderResumed: 'Commande reprise: {client} ({service}).',
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
        repairExpected: 'Reference {issue}: materiel {material}, outil {tool}, resultat attendu {result}.',
        repairNoMaterialStock: 'Stock insuffisant pour {material}. Commande des materiaux.',
        repairMissingMaterials: 'Stock insuffisant pour lancer ce service: {materials}.',
        repairMaterialConsumed: 'Consommation atelier: {material} -1 (reste {remaining}).',
        repairMaterialsConsumedBatch: 'Materiaux utilises: {materials}.',
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
        servicePayout: 'Facturation: {amount} pour {hours}.',
        serviceExcellentBonus: 'Service excellent: bonus client {amount}.',
        weekClosed: 'Semaine {week} terminee. Bilan: {net} (revenus {revenue}, bonus {bonus}, loyer {rent}, penalite file {queue}).',
        weekRentPaid: 'Loyer paye: {rent}.',
        weekNoRentDue: 'Pas de loyer cette semaine (paiement toutes les 4 semaines).',
        weekQueuePenalty: 'Commandes non terminees en file: {count}. Penalite: {penalty}.',
        weekStarted: 'Semaine {week} demarree. Capacite: {hours}.',
        weekNeedsSummary: 'Semaine terminee: consulte le resume pour payer le loyer et upgrader.',
        dayAdvanced: 'Jour suivant: {date}.',
        waitBlockedActiveOrder: 'Termine la commande en cours avant d attendre le lendemain.',
        monthRentPaid: 'Loyer mensuel paye: {amount}.',
        supplyBought: 'Commande materiaux: {pack} pour {cost}.',
        supplyOrderedDelivery: 'Commande planifiee: {pack} x{qty}, livraison le {date}.',
        supplyDelivered: 'Livraison recue: {pack} x{qty}.',
        supplyNeedCash: 'Commande refusee: fonds insuffisants pour {pack}.',
        supplyLocked: 'Commande refusee: prerequis manquant pour {pack}.',
        supplyCooldown: 'Commande indisponible. Attends encore {hours}.',
        marketingBought: 'Campagne marketing active pour {days} jours.',
        marketingNeedCash: 'Fonds insuffisants pour lancer le marketing.',
        upgradeBought: 'Outil achete: {upgrade}. Services debloques: {services}.',
        upgradeNeedCash: 'Achat refuse: fonds insuffisants pour {upgrade}.',
        upgradeLocked: 'Achat refuse: prerequis manquant pour {upgrade}.',
        levelUp: 'Niveau {level} atteint. Commandes plus difficiles debloquees.',
        progressReset: 'Progression reinitialisee.'
      },
      prompts: {
        reset: 'Reinitialiser score, reputation et commandes sauvegardees ?',
        supplyQuantity: 'Quantite a commander (1-20) ?'
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
        newOrderBtn: 'Start order',
        exitGameBtn: 'Exit game',
        dateLabel: 'Date',
        dayHoursLabel: 'Day hours',
        marketingLabel: 'Marketing',
        marketingNone: 'None',
        marketingActive: 'Active ({days}d)',
        inventoryTitle: 'Material inventory',
        inventoryLowTag: 'low',
        incomingTitle: 'Incoming requests',
        incomingSummaryDefault: 'New requests waiting for your decision.',
        incomingSummaryTemplate: '{count} request(s) waiting.',
        incomingEmpty: 'No incoming request.',
        incomingItemTemplate: '{client} - {service} ({hours} / {price})',
        acceptJobBtn: 'Accept',
        declineJobBtn: 'Decline',
        queueTitle: 'Client queue',
        queueSelectBtn: 'Select',
        queueHoldBtn: 'Hold',
        queueSelectedBadge: 'Selected',
        queueClientLabel: 'Client',
        queueServiceLabel: 'Service',
        queueAddBtn: 'Add to queue',
        queueEmpty: 'No queued client.',
        queueSummaryDefault: 'No queued client.',
        queueSummaryTemplate: '{count} client(s) in queue ({hours}).',
        queueItemTemplate: '{client} - {service} ({hours})',
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
        repairExpectedSetup: 'Recommended setup: {material} + {tool}.',
        repairExpectedResult: 'Expected result: {result}.',
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
        mainActionFinish: 'Start finishing',
        completionPopupTitle: 'Order completed',
        completionPopupDefault: 'Ready for a new client?',
        completionPopupAction: 'Start order',
        completionPopupSummary: 'Order delivered: {stars}/5 stars, {fixed}/{total} strong repairs. Ready for a new client?',
        cashLabel: 'Cash',
        weekLabel: 'Week',
        hoursLeftLabel: 'Hours left',
        servicesUnlockedLabel: 'Unlocked services',
        weekPopupTitle: 'Weekly summary',
        weekPopupDefault: 'Week completed. Review your results and upgrade tools.',
        weekPopupSummary: 'Week {week}: {orders} orders completed. You used {hoursUsed}.',
        weekRevenueLabel: 'Service revenue',
        weekBonusLabel: 'Excellence bonus',
        weekRentLabel: 'Workshop rent',
        weekNetLabel: 'Weekly net',
        weekQueuePenaltyLabel: 'Queue penalty',
        weekCashAfterLabel: 'Closing cash',
        weekHoursUsedLabel: 'Hours used',
        weekUpgradeTitle: 'Upgrade tools',
        weekNextBtn: 'Start next week',
        shelveOrderBtn: 'Set aside',
        waitNextDayBtn: 'Wait next day',
        buyMarketingBtn: 'Run marketing',
        openSupplyBtn: 'Order materials',
        supplyPopupTitle: 'Order materials',
        supplyPopupDefault: 'You can order every 8 hours. Delivery arrives the next day.',
        supplyIncomingLabel: 'Pending deliveries',
        closeSupplyBtn: 'Close',
        supplyBuyBtn: 'Order',
        supplyMarketingLabel: 'Marketing campaign',
        supplyMarketingDesc: 'Boost incoming requests for 7 days.',
        supplyMarketingMetaTemplate: '{cost} | +{days} days of demand',
        supplyOwnedStockLabel: 'Stock',
        supplyMetaTemplate: '{cost} | +{items}',
        supplyNeedCashStatus: 'Not enough cash',
        supplyLockedStatus: 'Missing prerequisite',
        supplyCooldownStatus: 'Wait {hours}',
        supplyReadyStatus: 'Ready now',
        supplyCooldownReady: 'Supply order is available now.',
        supplyCooldownWait: 'Next supply order in {hours}.',
        upgradeBuyBtn: 'Buy',
        upgradeOwnedStatus: 'Already owned',
        upgradeNeedCashStatus: 'Not enough cash',
        upgradeLockedStatus: 'Missing prerequisite',
        noUpgradeLeft: 'All available tools are already installed.',
        serviceMetaTemplate: '{stars} | {hours} | {price} | {risk}',
        sceneAltIdle: 'Cobbler workshop illustration.',
        sceneAltIssue: 'Mission illustration: {issue}.',
        sceneAltFinishing: 'Boot finishing illustration.',
        sceneAltDone: 'Repaired boot illustration.'
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
        noQueueOrder: 'No accepted order yet: review incoming requests and accept one.',
        weekendClosed: 'Workshop is closed on weekends. Use "Wait next day" to reach a workday.',
        dayNoHoursLeft: 'Workday is full (8h). Wait until tomorrow to continue.',
        miniLocked: 'Mini-game running: finish the current action first.',
        newOrder: 'New client: {client}. Issue(s): {issues}.',
        incomingAccepted: 'Request accepted: {client} ({service}).',
        incomingDeclined: 'Request declined: {client} ({service}).',
        queueSelected: 'Order selected: {client} ({service}).',
        queueBackToWaiting: 'Order moved back to waiting: {client} ({service}).',
        queueAdded: 'Client queued: {client} ({service}, {hours}).',
        queueSelectionMissing: 'Incomplete selection: choose client and service.',
        queueCapacityReached: 'Queue is full: complete orders before adding more.',
        queueWeekCapacity: 'This queued order exceeds remaining weekly hours.',
        queueStarted: 'Order pulled from queue: {client} ({service}).',
        orderShelved: 'Order set aside: {client} ({service}).',
        orderResumed: 'Order resumed: {client} ({service}).',
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
        repairExpected: 'Reference {issue}: material {material}, tool {tool}, expected result {result}.',
        repairNoMaterialStock: 'Not enough stock for {material}. Order materials first.',
        repairMissingMaterials: 'Not enough stock to start this service: {materials}.',
        repairMaterialConsumed: 'Workshop usage: {material} -1 ({remaining} left).',
        repairMaterialsConsumedBatch: 'Materials used: {materials}.',
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
        servicePayout: 'Invoice paid: {amount} for {hours}.',
        serviceExcellentBonus: 'Excellent service: client bonus {amount}.',
        weekClosed: 'Week {week} closed. Net result: {net} (revenue {revenue}, bonus {bonus}, rent {rent}, queue penalty {queue}).',
        weekRentPaid: 'Rent paid: {rent}.',
        weekNoRentDue: 'No rent due this week (rent is charged every 4 weeks).',
        weekQueuePenalty: 'Queued orders missed: {count}. Penalty: {penalty}.',
        weekStarted: 'Week {week} started. Capacity: {hours}.',
        weekNeedsSummary: 'Week completed: open summary to pay rent and upgrade.',
        dayAdvanced: 'Next day: {date}.',
        waitBlockedActiveOrder: 'Finish the current order before waiting for tomorrow.',
        monthRentPaid: 'Monthly rent paid: {amount}.',
        supplyBought: 'Supply order placed: {pack} for {cost}.',
        supplyOrderedDelivery: 'Supply ordered: {pack} x{qty}, delivery on {date}.',
        supplyDelivered: 'Delivery received: {pack} x{qty}.',
        supplyNeedCash: 'Supply blocked: not enough cash for {pack}.',
        supplyLocked: 'Supply blocked: missing prerequisite for {pack}.',
        supplyCooldown: 'Supply unavailable. Wait {hours}.',
        marketingBought: 'Marketing campaign active for {days} days.',
        marketingNeedCash: 'Not enough cash to run marketing.',
        upgradeBought: 'Tool purchased: {upgrade}. Services unlocked: {services}.',
        upgradeNeedCash: 'Purchase blocked: not enough cash for {upgrade}.',
        upgradeLocked: 'Purchase blocked: prerequisite missing for {upgrade}.',
        levelUp: 'Level {level} reached. Harder orders unlocked.',
        progressReset: 'Progress reset complete.'
      },
      prompts: {
        reset: 'Reset saved score, reputation, and completed orders?',
        supplyQuantity: 'Order quantity (1-20)?'
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
    incomingSummary: root.querySelector('[data-incoming-summary]'),
    incomingList: root.querySelector('[data-incoming-list]'),
    queueSummary: root.querySelector('[data-queue-summary]'),
    queueList: root.querySelector('[data-queue-list]'),
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
    sceneImage: root.querySelector('[data-shoe-scene-image]'),
    mainAction: root.querySelector('[data-main-action]'),
    mainActionHeader: root.querySelector('[data-main-action-header]'),
    shelveOrder: root.querySelector('[data-shelve-order]'),
    date: root.querySelector('[data-stat-date]'),
    score: root.querySelector('[data-stat-score]'),
    money: root.querySelector('[data-stat-money]'),
    week: root.querySelector('[data-stat-week]'),
    hoursLeft: root.querySelector('[data-stat-hours-left]'),
    marketing: root.querySelector('[data-stat-marketing]'),
    servicesUnlocked: root.querySelector('[data-stat-services]'),
    inventoryList: root.querySelector('[data-inventory-list]'),
    best: root.querySelector('[data-stat-best]'),
    completed: root.querySelector('[data-stat-completed]'),
    reputation: root.querySelector('[data-stat-reputation]'),
    level: root.querySelector('[data-stat-level]'),
    satisfaction: root.querySelector('[data-stat-satisfaction]'),
    satisfactionStars: root.querySelector('[data-satisfaction-stars]'),
    newOrder: root.querySelector('[data-new-order]'),
    resetSave: root.querySelector('[data-reset-save]'),
    logList: root.querySelector('[data-log-list]'),
    completionPopup: root.querySelector('[data-completion-popup]'),
    completionPopupMessage: root.querySelector('[data-completion-popup-message]'),
    completionNewOrder: root.querySelector('[data-completion-new-order]'),
    weekPopup: root.querySelector('[data-week-popup]'),
    weekPopupSummary: root.querySelector('[data-week-popup-summary]'),
    weekRevenue: root.querySelector('[data-week-revenue]'),
    weekBonus: root.querySelector('[data-week-bonus]'),
    weekRent: root.querySelector('[data-week-rent]'),
    weekNet: root.querySelector('[data-week-net]'),
    weekQueuePenalty: root.querySelector('[data-week-queue-penalty]'),
    weekCash: root.querySelector('[data-week-cash]'),
    weekHoursUsed: root.querySelector('[data-week-hours-used]'),
    weekUpgrades: root.querySelector('[data-week-upgrades]'),
    weekNext: root.querySelector('[data-week-next]'),
    waitNextDay: root.querySelector('[data-wait-next-day]'),
    openSupply: root.querySelector('[data-open-supply]'),
    supplyPopup: root.querySelector('[data-supply-popup]'),
    supplyPopupSummary: root.querySelector('[data-supply-popup-summary]'),
    supplyList: root.querySelector('[data-supply-list]'),
    supplyClose: root.querySelector('[data-supply-close]')
  };

  if (
    !elements.langToggle ||
    !elements.orderClient ||
    !elements.orderDifficulty ||
    !elements.orderTimer ||
    !elements.issuesList ||
    !elements.incomingSummary ||
    !elements.incomingList ||
    !elements.queueSummary ||
    !elements.queueList ||
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
    !elements.sceneImage ||
    !elements.mainAction ||
    !elements.shelveOrder ||
    !elements.date ||
    !elements.score ||
    !elements.money ||
    !elements.week ||
    !elements.hoursLeft ||
    !elements.marketing ||
    !elements.servicesUnlocked ||
    !elements.inventoryList ||
    !elements.best ||
    !elements.completed ||
    !elements.reputation ||
    !elements.level ||
    !elements.satisfaction ||
    !elements.satisfactionStars ||
    !elements.newOrder ||
    !elements.resetSave ||
    !elements.logList ||
    !elements.completionPopup ||
    !elements.completionPopupMessage ||
    !elements.completionNewOrder ||
    !elements.weekPopup ||
    !elements.weekPopupSummary ||
    !elements.weekRevenue ||
    !elements.weekBonus ||
    !elements.weekRent ||
    !elements.weekNet ||
    !elements.weekQueuePenalty ||
    !elements.weekCash ||
    !elements.weekHoursUsed ||
    !elements.weekUpgrades ||
    !elements.weekNext ||
    !elements.waitNextDay ||
    !elements.openSupply ||
    !elements.supplyPopup ||
    !elements.supplyPopupSummary ||
    !elements.supplyList ||
    !elements.supplyClose
  ) {
    return;
  }

  var state = {
    lang: root.getAttribute('data-lang') === 'en' ? 'en' : 'fr',
    score: 0,
    money: STARTING_CASH,
    week: 1,
    weekHoursLeft: WEEK_HOURS_LIMIT,
    dayHoursLeft: DAY_HOURS_LIMIT,
    currentDate: START_DATE_ISO,
    ownedUpgrades: [],
    incomingLeads: [],
    selectedQueueId: '',
    clientQueue: [],
    stock: Object.assign({}, STARTING_STOCK),
    pendingSupplies: [],
    hoursSinceSupplyOrder: SUPPLY_COOLDOWN_HOURS,
    marketingDaysLeft: 0,
    weeklyRevenue: 0,
    weeklyExcellentBonus: 0,
    weeklyOrders: 0,
    weekSummary: null,
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
    completionSummary: null,
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
  var actionErrorElement = null;
  var actionErrorTimeoutId = 0;

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

  function formatMoney(value) {
    var rounded = Math.round(value || 0);
    var abs = Math.abs(rounded);
    var locale = state.lang === 'fr' ? 'fr-CA' : 'en-US';
    var formatted = new Intl.NumberFormat(locale).format(abs);
    return (rounded < 0 ? '-' : '') + '$' + formatted;
  }

  function formatHours(value) {
    var rounded = Math.round((value || 0) * 10) / 10;
    var text = String(rounded);
    if (state.lang === 'fr') {
      text = text.replace('.', ',');
    }
    return text + 'h';
  }

  function parseIsoDate(iso) {
    var parts = String(iso || '').split('-');
    if (parts.length !== 3) {
      return new Date(Date.UTC(2026, 0, 5));
    }

    var y = Number(parts[0]);
    var m = Number(parts[1]) - 1;
    var d = Number(parts[2]);

    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
      return new Date(Date.UTC(2026, 0, 5));
    }

    return new Date(Date.UTC(y, m, d));
  }

  function dateToIso(dateObj) {
    return (
      String(dateObj.getUTCFullYear()) + '-' +
      pad2(dateObj.getUTCMonth() + 1) + '-' +
      pad2(dateObj.getUTCDate())
    );
  }

  function currentDateObj() {
    return parseIsoDate(state.currentDate);
  }

  function setCurrentDateFromObj(dateObj) {
    state.currentDate = dateToIso(dateObj);
  }

  function isWeekendDate(dateObj) {
    var day = dateObj.getUTCDay();
    return day === 0 || day === 6;
  }

  function isWeekendCurrentDay() {
    return isWeekendDate(currentDateObj());
  }

  function formatCalendarDate(dateIso) {
    var locale = state.lang === 'fr' ? 'fr-CA' : 'en-US';
    var dateObj = parseIsoDate(dateIso);

    return new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(dateObj);
  }

  function addCooldownHours(hours) {
    state.hoursSinceSupplyOrder = clamp(
      state.hoursSinceSupplyOrder + Math.max(0, Number(hours) || 0),
      0,
      SUPPLY_COOLDOWN_HOURS
    );
  }

  function supplyDeliveryEntry(packId, qty, arrivalIso) {
    return {
      id: 'DLV-' + Date.now().toString(36).toUpperCase() + '-' + String(Math.floor(Math.random() * 1000)),
      packId: packId,
      qty: qty,
      arrivalDate: arrivalIso
    };
  }

  function queueEntryById(entryId) {
    for (var i = 0; i < state.clientQueue.length; i += 1) {
      if (state.clientQueue[i].id === entryId) {
        return state.clientQueue[i];
      }
    }
    return null;
  }

  function cloneData(value) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      return null;
    }
  }

  function queueEntryHours(entry) {
    if (!entry) {
      return 0;
    }

    var saved = Number(entry.estimatedHours);
    if (Number.isFinite(saved) && saved > 0) {
      return saved;
    }

    return serviceHours(entry.issueKey);
  }

  function queueEntryServiceKey(entry) {
    if (!entry) {
      return '';
    }

    if (entry.savedOrder && Array.isArray(entry.savedOrder.issues) && entry.savedOrder.issues.length > 0) {
      var savedIssue = entry.savedOrder.issues[0];
      if (savedIssue && ISSUE_MAP[savedIssue.key]) {
        return savedIssue.key;
      }
    }

    return entry.issueKey;
  }

  function incomingTargetCount() {
    var repBonus = Math.floor(Math.max(0, state.reputation) / 120);
    var marketingBonus = state.marketingDaysLeft > 0 ? 2 : 0;
    return clamp(1 + repBonus + marketingBonus, 1, 10);
  }

  function applySupplyDeliveriesForDate(dateIso) {
    if (!state.pendingSupplies.length) {
      return;
    }

    var remaining = [];
    for (var i = 0; i < state.pendingSupplies.length; i += 1) {
      var delivery = state.pendingSupplies[i];
      if (delivery.arrivalDate <= dateIso) {
        var pack = supplyPackById(delivery.packId);
        if (!pack) {
          continue;
        }

        var keys = Object.keys(pack.stock);
        for (var stockIndex = 0; stockIndex < keys.length; stockIndex += 1) {
          addMaterialStock(keys[stockIndex], pack.stock[keys[stockIndex]] * delivery.qty);
        }

        addLog(interpolate(langPack().logs.supplyDelivered, {
          pack: supplyPackText(pack).label,
          qty: String(delivery.qty)
        }));
      } else {
        remaining.push(delivery);
      }
    }

    state.pendingSupplies = remaining;
  }

  function handleDayTransition(previousDateObj, nextDateObj, addCooldown) {
    var previousMonthKey = previousDateObj.getUTCFullYear() + '-' + pad2(previousDateObj.getUTCMonth() + 1);
    var nextMonthKey = nextDateObj.getUTCFullYear() + '-' + pad2(nextDateObj.getUTCMonth() + 1);

    if (addCooldown) {
      addCooldownHours(8);
    }

    if (state.marketingDaysLeft > 0) {
      state.marketingDaysLeft = Math.max(0, state.marketingDaysLeft - 1);
    }

    if (previousMonthKey !== nextMonthKey) {
      state.money -= MONTHLY_RENT;
      addLog(interpolate(langPack().logs.monthRentPaid, {
        amount: formatMoney(MONTHLY_RENT)
      }));
    }

    setCurrentDateFromObj(nextDateObj);
    state.dayHoursLeft = isWeekendDate(nextDateObj) ? 0 : DAY_HOURS_LIMIT;
    applySupplyDeliveriesForDate(state.currentDate);
    refillIncomingLeads();
  }

  function advanceOneDay(options) {
    var opts = options || {};
    var previous = currentDateObj();
    var next = new Date(previous.getTime());
    next.setUTCDate(next.getUTCDate() + 1);

    handleDayTransition(previous, next, opts.addCooldown !== false);

    if (opts.log !== false) {
      addLog(interpolate(langPack().logs.dayAdvanced, {
        date: formatCalendarDate(state.currentDate)
      }));
    }
  }

  function ensureWorkdayForWorkProgress() {
    var safety = 0;
    while (isWeekendCurrentDay()) {
      advanceOneDay({ log: false, addCooldown: false });
      safety += 1;
      if (safety > 7) {
        break;
      }
    }
  }

  function consumeWorkHours(hours) {
    var remaining = Math.max(0, Number(hours) || 0);
    ensureWorkdayForWorkProgress();

    while (remaining > 0.001) {
      if (isWeekendCurrentDay()) {
        advanceOneDay({ log: false, addCooldown: false });
        continue;
      }

      if (state.dayHoursLeft <= 0) {
        advanceOneDay({ log: false, addCooldown: false });
        continue;
      }

      var spent = Math.min(remaining, state.dayHoursLeft);
      state.dayHoursLeft = Math.max(0, state.dayHoursLeft - spent);
      remaining -= spent;

      if (remaining > 0.001 && state.dayHoursLeft <= 0) {
        advanceOneDay({ log: false, addCooldown: false });
      }
    }
  }

  function serviceEconomy(issueKey) {
    return SERVICE_ECONOMY[issueKey] || { fee: 70, hours: 3, excellenceBonus: 15, unlock: '' };
  }

  function serviceFee(issueKey) {
    return serviceEconomy(issueKey).fee;
  }

  function serviceHours(issueKey) {
    return serviceEconomy(issueKey).hours;
  }

  function serviceExcellenceBonus(issueKey) {
    return serviceEconomy(issueKey).excellenceBonus;
  }

  function hasUpgrade(upgradeId) {
    if (!upgradeId) {
      return true;
    }
    return state.ownedUpgrades.indexOf(upgradeId) !== -1;
  }

  function isServiceUnlocked(issueKey) {
    var upgradeId = serviceEconomy(issueKey).unlock;
    return hasUpgrade(upgradeId);
  }

  function unlockedServiceCount() {
    var count = 0;
    for (var i = 0; i < ISSUE_LIBRARY.length; i += 1) {
      if (isServiceUnlocked(ISSUE_LIBRARY[i].key)) {
        count += 1;
      }
    }
    return count;
  }

  function availableServiceKeysForHours(maxHours) {
    var keys = [];
    for (var i = 0; i < ISSUE_LIBRARY.length; i += 1) {
      var key = ISSUE_LIBRARY[i].key;
      if (!isServiceUnlocked(key)) {
        continue;
      }
      if (serviceHours(key) <= maxHours) {
        keys.push(key);
      }
    }
    return keys;
  }

  function materialStock(materialKey) {
    return Math.max(0, Number(state.stock[materialKey]) || 0);
  }

  function materialWearForIssue(issueKey, selectedMaterial) {
    var base = SERVICE_MATERIAL_WEAR[issueKey] || {};
    var usage = {};
    var keys = Object.keys(base);

    for (var i = 0; i < keys.length; i += 1) {
      if (langPack().materials[keys[i]]) {
        usage[keys[i]] = Math.max(0, Math.round(base[keys[i]] || 0));
      }
    }

    if (selectedMaterial && langPack().materials[selectedMaterial]) {
      usage[selectedMaterial] = (usage[selectedMaterial] || 0) + 1;
    }

    return usage;
  }

  function materialUsageMissingList(usage) {
    var missing = [];
    var keys = Object.keys(usage || {});

    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      var required = Math.max(0, Math.round(usage[key] || 0));
      if (required <= 0) {
        continue;
      }
      if (!hasStockForMaterial(key, required)) {
        missing.push(materialLabel(key) + ' x' + String(required));
      }
    }

    return missing;
  }

  function consumeMaterialUsage(usage) {
    var lines = [];
    var keys = Object.keys(usage || {});

    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      var qty = Math.max(0, Math.round(usage[key] || 0));
      if (qty <= 0) {
        continue;
      }
      consumeMaterial(key, qty);
      lines.push(materialLabel(key) + ' -' + String(qty) + ' (' + formatStockCount(materialStock(key)) + ')');
    }

    return lines;
  }

  function formatHoursRemaining(value) {
    var safe = Math.max(0, Math.ceil(value));
    return formatHours(safe);
  }

  function formatStockCount(value) {
    return 'x' + String(Math.max(0, Math.round(value || 0)));
  }

  function supplyPackText(pack) {
    return pack.text[state.lang] || pack.text.fr;
  }

  function cloneStartingStock() {
    return Object.assign({}, STARTING_STOCK);
  }

  function supplyHoursRemaining() {
    return Math.max(0, SUPPLY_COOLDOWN_HOURS - state.hoursSinceSupplyOrder);
  }

  function canOrderSupplyNow() {
    return supplyHoursRemaining() <= 0;
  }

  function serviceDefinition(issueKey) {
    return ISSUE_MAP[issueKey] || null;
  }

  function queueHoursPlanned() {
    var hours = 0;

    for (var i = 0; i < state.clientQueue.length; i += 1) {
      hours += queueEntryHours(state.clientQueue[i]);
    }

    return hours;
  }

  function queuePenaltyForEntry(entry) {
    return Math.max(20, Math.round(serviceFee(entry.issueKey) * QUEUE_WEEK_PENALTY_RATE));
  }

  function totalQueuePenalty(queueList) {
    var list = Array.isArray(queueList) ? queueList : [];
    var penalty = 0;

    for (var i = 0; i < list.length; i += 1) {
      penalty += queuePenaltyForEntry(list[i]);
    }

    return penalty;
  }

  function createIncomingLead() {
    var candidates = availableServiceKeysForHours(state.weekHoursLeft);
    if (candidates.length === 0) {
      return null;
    }

    return {
      id: 'L-' + Date.now().toString(36).toUpperCase() + '-' + String(Math.floor(Math.random() * 1000)),
      client: randomItem(CLIENT_NAMES[state.lang]),
      issueKey: randomItem(candidates),
      weekAdded: state.week
    };
  }

  function refillIncomingLeads() {
    if (state.weekSummary) {
      return;
    }

    var target = incomingTargetCount();

    while (state.incomingLeads.length < target) {
      var lead = createIncomingLead();
      if (!lead) {
        break;
      }
      state.incomingLeads.push(lead);
    }

    if (state.incomingLeads.length > target) {
      state.incomingLeads.length = target;
    }
  }

  function removeIncomingLeadById(leadId) {
    for (var i = 0; i < state.incomingLeads.length; i += 1) {
      if (state.incomingLeads[i].id === leadId) {
        return state.incomingLeads.splice(i, 1)[0];
      }
    }
    return null;
  }

  function hasStockForMaterial(materialKey, amount) {
    var qty = typeof amount === 'number' ? amount : 1;
    return materialStock(materialKey) >= qty;
  }

  function consumeMaterial(materialKey, amount) {
    var qty = typeof amount === 'number' ? amount : 1;
    var current = materialStock(materialKey);
    state.stock[materialKey] = Math.max(0, current - qty);
  }

  function addMaterialStock(materialKey, amount) {
    var qty = typeof amount === 'number' ? amount : 0;
    state.stock[materialKey] = materialStock(materialKey) + Math.max(0, qty);
  }

  function supplyPackStatus(pack) {
    if (pack.requires && !hasUpgrade(pack.requires)) {
      return 'locked';
    }
    if (!canOrderSupplyNow()) {
      return 'cooldown';
    }
    if (state.money < pack.cost) {
      return 'needCash';
    }
    return 'buy';
  }

  function queuedOrderFitIndex() {
    for (var i = 0; i < state.clientQueue.length; i += 1) {
      if (queueEntryHours(state.clientQueue[i]) <= state.weekHoursLeft) {
        return i;
      }
    }
    return -1;
  }

  function weeklyRentAmount(weekNumber) {
    void weekNumber;
    return 0;
  }

  function upgradeText(upgrade) {
    return upgrade.text[state.lang] || upgrade.text.fr;
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

  function setupActionErrorBanner() {
    var existing = root.querySelector('[data-action-error]');

    if (existing) {
      actionErrorElement = existing;
      return;
    }

    var banner = document.createElement('p');
    banner.className = 'cg-action-error';
    banner.hidden = true;
    banner.setAttribute('data-action-error', '');
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'assertive');

    var topbar = root.querySelector('.cg-topbar');
    if (topbar && topbar.parentNode === root) {
      topbar.insertAdjacentElement('afterend', banner);
    } else {
      root.insertBefore(banner, root.firstChild);
    }

    actionErrorElement = banner;
  }

  function showActionError(message) {
    if (!actionErrorElement || !message) {
      return;
    }

    if (actionErrorTimeoutId) {
      window.clearTimeout(actionErrorTimeoutId);
      actionErrorTimeoutId = 0;
    }

    actionErrorElement.textContent = message;
    actionErrorElement.hidden = false;
    actionErrorElement.classList.remove('is-visible');
    void actionErrorElement.offsetWidth;
    actionErrorElement.classList.add('is-visible');

    actionErrorTimeoutId = window.setTimeout(function () {
      if (!actionErrorElement) {
        return;
      }

      actionErrorElement.classList.remove('is-visible');
      actionErrorElement.hidden = true;
      actionErrorTimeoutId = 0;
    }, 3400);
  }

  function notifyActionError(message) {
    addLog(message);
    showActionError(message);
  }

  function clearLogs() {
    elements.logList.innerHTML = '';
  }

  function sceneBasePath() {
    var base = root.getAttribute('data-scene-base') || '';

    if (!base) {
      return '';
    }

    return base.charAt(base.length - 1) === '/' ? base : (base + '/');
  }

  function sceneEntryForIssue(issueKey) {
    var entry = ISSUE_SCENE_IMAGE_MAP[issueKey];

    if (!entry) {
      return {
        active: 'scene-worn.png',
        result: 'scene-restored.png',
        failed: 'scene-worn.png'
      };
    }

    if (typeof entry === 'string') {
      return {
        active: entry,
        result: 'scene-restored.png',
        failed: 'scene-worn.png'
      };
    }

    return entry;
  }

  function sceneFileForIssue(issueKey, variant) {
    var entry = sceneEntryForIssue(issueKey);
    var safeVariant = variant || 'active';
    return entry[safeVariant] || entry.active || 'scene-worn.png';
  }

  function sceneFileForStage(stageKey, issueKey, outcomeKey) {
    if (issueKey) {
      if (stageKey === 'finishing') {
        return sceneFileForIssue(issueKey, 'result');
      }

      if (stageKey === 'done') {
        if (outcomeKey === 'failed') {
          return sceneFileForIssue(issueKey, 'failed');
        }
        return sceneFileForIssue(issueKey, 'result');
      }

      return sceneFileForIssue(issueKey, 'active');
    }

    return 'mission-premium-shine.png';
  }

  function sceneAltForStage(stageKey, issueKey) {
    var ui = langPack().ui;

    if (stageKey === 'finishing') {
      return ui.sceneAltFinishing;
    }

    if (stageKey === 'done') {
      return ui.sceneAltDone;
    }

    if (issueKey) {
      return interpolate(ui.sceneAltIssue, {
        issue: issueLabel(issueKey)
      });
    }

    return ui.sceneAltIdle;
  }

  function updateSceneImage(stageKey, issueKey, outcomeKey) {
    var src = sceneBasePath() + sceneFileForStage(stageKey, issueKey, outcomeKey);
    var alt = sceneAltForStage(stageKey, issueKey);

    if (src && elements.sceneImage.getAttribute('src') !== src) {
      elements.sceneImage.setAttribute('src', src);
    }
    elements.sceneImage.setAttribute('alt', alt);
  }

  function setIssueVisual(issueKey) {
    root.setAttribute('data-issue', ISSUE_VISUAL_MAP[issueKey] || issueKey || 'none');
  }

  function setStageVisual(stageKey) {
    root.setAttribute('data-stage', stageKey || 'idle');
  }

  function setMiniVisual(isActive) {
    root.setAttribute('data-mini-active', isActive ? 'true' : 'false');
  }

  function saveProgress() {
    var payload = {
      score: state.score,
      bestScore: state.bestScore,
      completedOrders: state.completedOrders,
      reputation: state.reputation,
      money: state.money,
      week: state.week,
      weekHoursLeft: state.weekHoursLeft,
      dayHoursLeft: state.dayHoursLeft,
      currentDate: state.currentDate,
      ownedUpgrades: state.ownedUpgrades,
      incomingLeads: state.incomingLeads,
      selectedQueueId: state.selectedQueueId,
      clientQueue: state.clientQueue,
      stock: state.stock,
      pendingSupplies: state.pendingSupplies,
      hoursSinceSupplyOrder: state.hoursSinceSupplyOrder,
      marketingDaysLeft: state.marketingDaysLeft,
      weeklyRevenue: state.weeklyRevenue,
      weeklyExcellentBonus: state.weeklyExcellentBonus,
      weeklyOrders: state.weeklyOrders,
      weekSummary: state.weekSummary
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
      state.money = Number(parsed.money);
      if (!Number.isFinite(state.money)) {
        state.money = STARTING_CASH;
      }
      state.week = clamp(Number(parsed.week) || 1, 1, 999);
      state.weekHoursLeft = clamp(Number(parsed.weekHoursLeft), 0, WEEK_HOURS_LIMIT);
      if (!Number.isFinite(state.weekHoursLeft)) {
        state.weekHoursLeft = WEEK_HOURS_LIMIT;
      }
      state.dayHoursLeft = clamp(Number(parsed.dayHoursLeft), 0, DAY_HOURS_LIMIT);
      if (!Number.isFinite(state.dayHoursLeft)) {
        state.dayHoursLeft = DAY_HOURS_LIMIT;
      }
      if (typeof parsed.currentDate === 'string' && parsed.currentDate) {
        state.currentDate = parsed.currentDate;
      } else {
        state.currentDate = START_DATE_ISO;
      }
      state.weeklyRevenue = Math.max(0, Number(parsed.weeklyRevenue) || 0);
      state.weeklyExcellentBonus = Math.max(0, Number(parsed.weeklyExcellentBonus) || 0);
      state.weeklyOrders = Math.max(0, Number(parsed.weeklyOrders) || 0);
      state.marketingDaysLeft = Math.max(0, Number(parsed.marketingDaysLeft) || 0);

      state.ownedUpgrades = [];
      if (Array.isArray(parsed.ownedUpgrades)) {
        for (var upgradeIndex = 0; upgradeIndex < parsed.ownedUpgrades.length; upgradeIndex += 1) {
          if (
            UPGRADE_MAP[parsed.ownedUpgrades[upgradeIndex]] &&
            state.ownedUpgrades.indexOf(parsed.ownedUpgrades[upgradeIndex]) === -1
          ) {
            state.ownedUpgrades.push(parsed.ownedUpgrades[upgradeIndex]);
          }
        }
      }

      state.incomingLeads = [];
      if (Array.isArray(parsed.incomingLeads)) {
        for (var leadIndex = 0; leadIndex < parsed.incomingLeads.length; leadIndex += 1) {
          var lead = parsed.incomingLeads[leadIndex];
          if (
            lead &&
            typeof lead.client === 'string' &&
            ISSUE_MAP[lead.issueKey] &&
            state.incomingLeads.length < 12
          ) {
            state.incomingLeads.push({
              id: lead.id || ('L-' + Date.now().toString(36) + '-' + leadIndex),
              client: lead.client,
              issueKey: lead.issueKey,
              weekAdded: clamp(Number(lead.weekAdded) || state.week, 1, 999)
            });
          }
        }
      }

      state.clientQueue = [];
      if (Array.isArray(parsed.clientQueue)) {
        for (var queueIndex = 0; queueIndex < parsed.clientQueue.length; queueIndex += 1) {
          var queued = parsed.clientQueue[queueIndex];
          if (
            queued &&
            typeof queued.client === 'string' &&
            ISSUE_MAP[queued.issueKey] &&
            state.clientQueue.length < QUEUE_MAX_ITEMS
          ) {
            var loadedEntry = {
              id: queued.id || ('Q-' + Date.now().toString(36) + '-' + queueIndex),
              client: queued.client,
              issueKey: queued.issueKey,
              weekAdded: clamp(Number(queued.weekAdded) || state.week, 1, 999),
              estimatedHours: Math.max(0.5, Number(queued.estimatedHours) || serviceHours(queued.issueKey))
            };

            if (
              queued.savedOrder &&
              typeof queued.savedOrder === 'object' &&
              Array.isArray(queued.savedOrder.issues) &&
              queued.savedOrder.issues.length > 0
            ) {
              loadedEntry.savedOrder = cloneData(queued.savedOrder);

              if (
                queued.savedStage === 'diagnosis' ||
                queued.savedStage === 'repair' ||
                queued.savedStage === 'finishing'
              ) {
                loadedEntry.savedStage = queued.savedStage;
              } else {
                loadedEntry.savedStage = 'diagnosis';
              }

              loadedEntry.savedDiagnosed = !!queued.savedDiagnosed;
              loadedEntry.savedRepairIndex = Math.max(0, Math.floor(Number(queued.savedRepairIndex) || 0));
              loadedEntry.savedSatisfaction = clamp(Number(queued.savedSatisfaction) || 5, 1, 5);
              loadedEntry.savedOrderSecondsLeft = Math.max(
                0,
                Math.floor(Number(queued.savedOrderSecondsLeft) || 0)
              );
              loadedEntry.savedOrderSecondsTotal = Math.max(
                1,
                Math.floor(Number(queued.savedOrderSecondsTotal) || 1)
              );
              loadedEntry.savedTimerPenaltyApplied = !!queued.savedTimerPenaltyApplied;
            }

            state.clientQueue.push(loadedEntry);
          }
        }
      }

      state.selectedQueueId = '';
      if (typeof parsed.selectedQueueId === 'string') {
        state.selectedQueueId = parsed.selectedQueueId;
      }

      state.stock = cloneStartingStock();
      if (parsed.stock && typeof parsed.stock === 'object') {
        var stockKeys = Object.keys(state.stock);
        for (var stockIndex = 0; stockIndex < stockKeys.length; stockIndex += 1) {
          var stockKey = stockKeys[stockIndex];
          var qty = Number(parsed.stock[stockKey]);
          if (Number.isFinite(qty)) {
            state.stock[stockKey] = Math.max(0, Math.floor(qty));
          }
        }
      }

      state.hoursSinceSupplyOrder = clamp(
        Number(parsed.hoursSinceSupplyOrder),
        0,
        SUPPLY_COOLDOWN_HOURS
      );
      if (!Number.isFinite(state.hoursSinceSupplyOrder)) {
        state.hoursSinceSupplyOrder = SUPPLY_COOLDOWN_HOURS;
      }

      state.pendingSupplies = [];
      if (Array.isArray(parsed.pendingSupplies)) {
        for (var pendingIndex = 0; pendingIndex < parsed.pendingSupplies.length; pendingIndex += 1) {
          var pending = parsed.pendingSupplies[pendingIndex];
          if (
            pending &&
            typeof pending.packId === 'string' &&
            supplyPackById(pending.packId) &&
            Number(pending.qty) > 0 &&
            typeof pending.arrivalDate === 'string'
          ) {
            state.pendingSupplies.push({
              id: pending.id || ('DLV-' + Date.now().toString(36) + '-' + pendingIndex),
              packId: pending.packId,
              qty: Math.max(1, Math.floor(Number(pending.qty) || 1)),
              arrivalDate: pending.arrivalDate
            });
          }
        }
      }

      if (parsed.weekSummary && typeof parsed.weekSummary === 'object') {
        state.weekSummary = {
          week: clamp(Number(parsed.weekSummary.week) || state.week, 1, 999),
          orders: Math.max(0, Number(parsed.weekSummary.orders) || 0),
          revenue: Number(parsed.weekSummary.revenue) || 0,
          bonus: Number(parsed.weekSummary.bonus) || 0,
          rent: Number(parsed.weekSummary.rent) || 0,
          queuePenalty: Number(parsed.weekSummary.queuePenalty) || 0,
          net: Number(parsed.weekSummary.net) || 0,
          hoursUsed: clamp(Number(parsed.weekSummary.hoursUsed) || 0, 0, WEEK_HOURS_LIMIT)
        };
      } else {
        state.weekSummary = null;
      }

      state.level = levelFromReputation(state.reputation);
      if (!queueEntryById(state.selectedQueueId)) {
        state.selectedQueueId = '';
      }
      if (isWeekendCurrentDay()) {
        state.dayHoursLeft = 0;
      }
      applySupplyDeliveriesForDate(state.currentDate);
      refillIncomingLeads();
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
    setMiniVisual(false);
  }

  function hideCompletionPopup() {
    elements.completionPopup.hidden = true;
  }

  function updateCompletionPopupContent() {
    var ui = langPack().ui;

    if (!state.completionSummary) {
      elements.completionPopupMessage.textContent = ui.completionPopupDefault;
      return;
    }

    elements.completionPopupMessage.textContent = interpolate(ui.completionPopupSummary, {
      stars: String(state.completionSummary.stars),
      fixed: String(state.completionSummary.fixed),
      total: String(state.completionSummary.total)
    });
  }

  function showCompletionPopup(summary) {
    hideSupplyPopup();
    state.completionSummary = summary || null;
    updateCompletionPopupContent();
    elements.completionPopup.hidden = false;
    elements.completionNewOrder.focus();
  }

  function focusAndScrollMiniPanel(panelElement, actionButton, autoClick) {
    if (!panelElement || panelElement.hidden) {
      return;
    }

    window.setTimeout(function () {
      if (actionButton) {
        actionButton.focus();
      }

      if (autoClick && actionButton && !actionButton.disabled) {
        actionButton.click();
      }
    }, 80);
  }

  function hideWeekPopup() {
    elements.weekPopup.hidden = true;
  }

  function hideSupplyPopup() {
    elements.supplyPopup.hidden = true;
  }

  function shouldEndWeek() {
    if (state.weekHoursLeft <= 0) {
      return true;
    }

    return availableServiceKeysForHours(state.weekHoursLeft).length === 0;
  }

  function upgradeStatus(upgrade) {
    if (hasUpgrade(upgrade.id)) {
      return 'owned';
    }
    if (upgrade.requires && !hasUpgrade(upgrade.requires)) {
      return 'locked';
    }
    if (state.money < upgrade.cost) {
      return 'needCash';
    }
    return 'buy';
  }

  function upgradeUnlockedServicesLabel(upgrade) {
    var labels = [];
    for (var i = 0; i < upgrade.unlocks.length; i += 1) {
      labels.push(issueLabel(upgrade.unlocks[i]));
    }
    return labels.join(', ');
  }

  function renderWeekUpgrades() {
    var ui = langPack().ui;
    elements.weekUpgrades.innerHTML = '';

    var allOwned = true;

    for (var i = 0; i < TOOL_UPGRADES.length; i += 1) {
      var upgrade = TOOL_UPGRADES[i];
      var status = upgradeStatus(upgrade);
      if (status !== 'owned') {
        allOwned = false;
      }

      var item = document.createElement('li');
      item.className = 'cg-week-upgrade';

      var title = document.createElement('h4');
      title.textContent = upgradeText(upgrade).label;
      item.appendChild(title);

      var desc = document.createElement('p');
      desc.textContent = upgradeText(upgrade).desc;
      item.appendChild(desc);

      var meta = document.createElement('p');
      meta.className = 'cg-upgrade-meta';
      meta.textContent =
        formatMoney(upgrade.cost) + ' | ' + upgradeUnlockedServicesLabel(upgrade);
      item.appendChild(meta);

      var row = document.createElement('div');
      row.className = 'cg-upgrade-row';

      var statusEl = document.createElement('span');
      statusEl.className = 'cg-upgrade-status';
      if (status === 'owned') {
        statusEl.classList.add('is-owned');
        statusEl.textContent = ui.upgradeOwnedStatus;
      } else if (status === 'needCash') {
        statusEl.classList.add('is-blocked');
        statusEl.textContent = ui.upgradeNeedCashStatus;
      } else if (status === 'locked') {
        statusEl.classList.add('is-blocked');
        statusEl.textContent = ui.upgradeLockedStatus;
      } else {
        statusEl.textContent = '';
      }
      row.appendChild(statusEl);

      var buyBtn = document.createElement('button');
      buyBtn.type = 'button';
      buyBtn.className = 'btn cg-upgrade-buy';
      buyBtn.textContent = ui.upgradeBuyBtn;
      buyBtn.setAttribute('data-upgrade-buy', upgrade.id);
      buyBtn.disabled = status !== 'buy';
      row.appendChild(buyBtn);

      item.appendChild(row);
      elements.weekUpgrades.appendChild(item);
    }

    if (allOwned) {
      var empty = document.createElement('li');
      empty.className = 'cg-week-empty';
      empty.textContent = ui.noUpgradeLeft;
      elements.weekUpgrades.appendChild(empty);
    }
  }

  function renderQueuePanel() {
    var ui = langPack().ui;
    refillIncomingLeads();
    if (!queueEntryById(state.selectedQueueId)) {
      state.selectedQueueId = '';
    }

    elements.incomingList.innerHTML = '';
    if (state.incomingLeads.length === 0) {
      var incomingEmpty = document.createElement('li');
      incomingEmpty.textContent = ui.incomingEmpty;
      elements.incomingList.appendChild(incomingEmpty);
      elements.incomingSummary.textContent = ui.incomingSummaryDefault;
    } else {
      for (var incomingIndex = 0; incomingIndex < state.incomingLeads.length; incomingIndex += 1) {
        var lead = state.incomingLeads[incomingIndex];
        var incomingItem = document.createElement('li');
        incomingItem.className = 'cg-queue-item';

        var incomingMain = document.createElement('span');
        incomingMain.className = 'cg-queue-item-main';
        incomingMain.textContent = interpolate(ui.incomingItemTemplate, {
          client: lead.client,
          service: issueLabel(lead.issueKey),
          hours: formatHours(serviceHours(lead.issueKey)),
          price: formatMoney(serviceFee(lead.issueKey))
        });
        incomingItem.appendChild(incomingMain);

        var incomingActions = document.createElement('div');
        incomingActions.className = 'cg-queue-actions';

        var acceptBtn = document.createElement('button');
        acceptBtn.type = 'button';
        acceptBtn.className = 'btn';
        acceptBtn.setAttribute('data-incoming-accept', lead.id);
        acceptBtn.textContent = ui.acceptJobBtn;
        acceptBtn.disabled = state.clientQueue.length >= QUEUE_MAX_ITEMS;
        incomingActions.appendChild(acceptBtn);

        var declineBtn = document.createElement('button');
        declineBtn.type = 'button';
        declineBtn.className = 'btn btn-outline';
        declineBtn.setAttribute('data-incoming-decline', lead.id);
        declineBtn.textContent = ui.declineJobBtn;
        incomingActions.appendChild(declineBtn);

        incomingItem.appendChild(incomingActions);
        elements.incomingList.appendChild(incomingItem);
      }

      elements.incomingSummary.textContent = interpolate(ui.incomingSummaryTemplate, {
        count: String(state.incomingLeads.length)
      });
    }

    elements.queueList.innerHTML = '';

    if (state.clientQueue.length === 0) {
      var empty = document.createElement('li');
      empty.textContent = ui.queueEmpty;
      elements.queueList.appendChild(empty);
      elements.queueSummary.textContent = ui.queueSummaryDefault;
      state.selectedQueueId = '';
    } else {
      for (var queueIndex = 0; queueIndex < state.clientQueue.length; queueIndex += 1) {
        var entry = state.clientQueue[queueIndex];
        var item = document.createElement('li');
        item.className = 'cg-queue-item';
        if (state.selectedQueueId === entry.id) {
          item.classList.add('is-selected');
        }

        var main = document.createElement('span');
        main.className = 'cg-queue-item-main';
        var queueIssueKey = queueEntryServiceKey(entry);
        main.textContent = interpolate(ui.queueItemTemplate, {
          client: entry.client,
          service: issueLabel(queueIssueKey),
          hours: formatHours(queueEntryHours(entry))
        });
        item.appendChild(main);

        var queueActions = document.createElement('div');
        queueActions.className = 'cg-queue-actions';

        var selectBtn = document.createElement('button');
        selectBtn.type = 'button';
        selectBtn.className = 'btn';
        selectBtn.setAttribute('data-queue-select', entry.id);
        selectBtn.textContent = ui.queueSelectBtn;
        if (state.selectedQueueId === entry.id) {
          selectBtn.disabled = true;
        }
        queueActions.appendChild(selectBtn);

        var holdBtn = document.createElement('button');
        holdBtn.type = 'button';
        holdBtn.className = 'btn btn-outline';
        holdBtn.setAttribute('data-queue-hold', entry.id);
        holdBtn.textContent = ui.queueHoldBtn;
        holdBtn.disabled = state.selectedQueueId !== entry.id;
        queueActions.appendChild(holdBtn);

        item.appendChild(queueActions);

        if (state.selectedQueueId === entry.id) {
          var badge = document.createElement('span');
          badge.className = 'cg-queue-selected';
          badge.textContent = ui.queueSelectedBadge;
          item.appendChild(badge);
        }

        elements.queueList.appendChild(item);
      }

      elements.queueSummary.textContent = interpolate(ui.queueSummaryTemplate, {
        count: String(state.clientQueue.length),
        hours: formatHours(queueHoursPlanned())
      });
    }
  }

  function supplyPackById(packId) {
    for (var i = 0; i < SUPPLY_CATALOG.length; i += 1) {
      if (SUPPLY_CATALOG[i].id === packId) {
        return SUPPLY_CATALOG[i];
      }
    }

    return null;
  }

  function supplyPackAddedItemsText(pack) {
    var segments = [];
    var keys = Object.keys(pack.stock);

    for (var i = 0; i < keys.length; i += 1) {
      segments.push(materialLabel(keys[i]) + ' ' + formatStockCount(pack.stock[keys[i]]));
    }

    return segments.join(', ');
  }

  function supplyPackCurrentStockText(pack) {
    var segments = [];
    var keys = Object.keys(pack.stock);

    for (var i = 0; i < keys.length; i += 1) {
      segments.push(materialLabel(keys[i]) + ' ' + formatStockCount(materialStock(keys[i])));
    }

    return segments.join(', ');
  }

  function supplyStatusText(statusKey) {
    var ui = langPack().ui;

    if (statusKey === 'needCash') {
      return ui.supplyNeedCashStatus;
    }

    if (statusKey === 'locked') {
      return ui.supplyLockedStatus;
    }

    if (statusKey === 'cooldown') {
      return interpolate(ui.supplyCooldownStatus, {
        hours: formatHoursRemaining(supplyHoursRemaining())
      });
    }

    return ui.supplyReadyStatus;
  }

  function renderSupplyList() {
    var ui = langPack().ui;
    elements.supplyList.innerHTML = '';

    for (var i = 0; i < SUPPLY_CATALOG.length; i += 1) {
      var pack = SUPPLY_CATALOG[i];
      var item = document.createElement('li');
      item.className = 'cg-week-upgrade';

      var title = document.createElement('h4');
      title.textContent = supplyPackText(pack).label;
      item.appendChild(title);

      var desc = document.createElement('p');
      desc.textContent = supplyPackText(pack).desc;
      item.appendChild(desc);

      var meta = document.createElement('p');
      meta.className = 'cg-upgrade-meta';
      meta.textContent = interpolate(ui.supplyMetaTemplate, {
        cost: formatMoney(pack.cost),
        items: supplyPackAddedItemsText(pack)
      });
      item.appendChild(meta);

      var stockLine = document.createElement('p');
      stockLine.className = 'cg-upgrade-meta';
      stockLine.textContent = ui.supplyOwnedStockLabel + ': ' + supplyPackCurrentStockText(pack);
      item.appendChild(stockLine);

      var row = document.createElement('div');
      row.className = 'cg-upgrade-row';

      var status = supplyPackStatus(pack);
      var statusEl = document.createElement('span');
      statusEl.className = 'cg-upgrade-status';
      if (status === 'buy') {
        statusEl.classList.add('is-owned');
      } else {
        statusEl.classList.add('is-blocked');
      }
      statusEl.textContent = supplyStatusText(status);
      row.appendChild(statusEl);

      var buyBtn = document.createElement('button');
      buyBtn.type = 'button';
      buyBtn.className = 'btn cg-upgrade-buy';
      buyBtn.textContent = ui.supplyBuyBtn;
      buyBtn.setAttribute('data-supply-buy', pack.id);
      buyBtn.disabled = status !== 'buy';
      row.appendChild(buyBtn);

      item.appendChild(row);
      elements.supplyList.appendChild(item);
    }

    var marketingItem = document.createElement('li');
    marketingItem.className = 'cg-week-upgrade';

    var marketingTitle = document.createElement('h4');
    marketingTitle.textContent = ui.supplyMarketingLabel;
    marketingItem.appendChild(marketingTitle);

    var marketingDesc = document.createElement('p');
    marketingDesc.textContent = ui.supplyMarketingDesc;
    marketingItem.appendChild(marketingDesc);

    var marketingMeta = document.createElement('p');
    marketingMeta.className = 'cg-upgrade-meta';
    marketingMeta.textContent = interpolate(ui.supplyMarketingMetaTemplate, {
      cost: formatMoney(MARKETING_COST),
      days: String(MARKETING_DURATION_DAYS)
    });
    marketingItem.appendChild(marketingMeta);

    var marketingState = document.createElement('p');
    marketingState.className = 'cg-upgrade-meta';
    marketingState.textContent = ui.marketingLabel + ': ' + (
      state.marketingDaysLeft > 0
        ? interpolate(ui.marketingActive, { days: String(state.marketingDaysLeft) })
        : ui.marketingNone
    );
    marketingItem.appendChild(marketingState);

    var marketingRow = document.createElement('div');
    marketingRow.className = 'cg-upgrade-row';

    var canBuyMarketing = state.money >= MARKETING_COST;
    var marketingStatus = document.createElement('span');
    marketingStatus.className = 'cg-upgrade-status';
    if (canBuyMarketing) {
      marketingStatus.classList.add('is-owned');
      marketingStatus.textContent = ui.supplyReadyStatus;
    } else {
      marketingStatus.classList.add('is-blocked');
      marketingStatus.textContent = ui.supplyNeedCashStatus;
    }
    marketingRow.appendChild(marketingStatus);

    var marketingBtn = document.createElement('button');
    marketingBtn.type = 'button';
    marketingBtn.className = 'btn cg-upgrade-buy';
    marketingBtn.textContent = ui.buyMarketingBtn;
    marketingBtn.setAttribute('data-supply-marketing', '1');
    marketingBtn.disabled = !canBuyMarketing;
    marketingRow.appendChild(marketingBtn);

    marketingItem.appendChild(marketingRow);
    elements.supplyList.appendChild(marketingItem);
  }

  function updateSupplyPopupContent() {
    var ui = langPack().ui;
    var pendingText = '';
    if (state.pendingSupplies.length > 0) {
      var deliveries = [];
      for (var i = 0; i < state.pendingSupplies.length; i += 1) {
        var delivery = state.pendingSupplies[i];
        var deliveryPack = supplyPackById(delivery.packId);
        if (!deliveryPack) {
          continue;
        }
        deliveries.push(
          supplyPackText(deliveryPack).label +
          ' x' + String(delivery.qty) +
          ' (' + formatCalendarDate(delivery.arrivalDate) + ')'
        );
      }
      if (deliveries.length > 0) {
        pendingText = ' ' + ui.supplyIncomingLabel + ': ' + deliveries.join(', ');
      }
    }

    if (canOrderSupplyNow()) {
      elements.supplyPopupSummary.textContent = ui.supplyCooldownReady + pendingText;
    } else {
      elements.supplyPopupSummary.textContent = interpolate(ui.supplyCooldownWait, {
        hours: formatHoursRemaining(supplyHoursRemaining())
      }) + pendingText;
    }
    renderSupplyList();
  }

  function showSupplyPopup() {
    hideCompletionPopup();
    hideWeekPopup();
    updateSupplyPopupContent();
    elements.supplyPopup.hidden = false;
    elements.supplyClose.focus();
  }

  function updateWeekPopupContent() {
    var ui = langPack().ui;

    if (!state.weekSummary) {
      elements.weekPopupSummary.textContent = ui.weekPopupDefault;
      elements.weekRevenue.textContent = formatMoney(0);
      elements.weekBonus.textContent = formatMoney(0);
      elements.weekRent.textContent = formatMoney(0);
      elements.weekNet.textContent = formatMoney(0);
      elements.weekQueuePenalty.textContent = formatMoney(0);
      elements.weekCash.textContent = formatMoney(state.money);
      elements.weekHoursUsed.textContent = formatHours(0) + ' / ' + formatHours(WEEK_HOURS_LIMIT);
      renderWeekUpgrades();
      return;
    }

    elements.weekPopupSummary.textContent = interpolate(ui.weekPopupSummary, {
      week: String(state.weekSummary.week),
      orders: String(state.weekSummary.orders),
      hoursUsed: formatHours(state.weekSummary.hoursUsed)
    });
    elements.weekRevenue.textContent = formatMoney(state.weekSummary.revenue);
    elements.weekBonus.textContent = formatMoney(state.weekSummary.bonus);
    elements.weekRent.textContent = formatMoney(state.weekSummary.rent);
    elements.weekNet.textContent = formatMoney(state.weekSummary.net);
    elements.weekQueuePenalty.textContent = formatMoney(state.weekSummary.queuePenalty || 0);
    elements.weekCash.textContent = formatMoney(state.money);
    elements.weekHoursUsed.textContent =
      formatHours(state.weekSummary.hoursUsed) + ' / ' + formatHours(WEEK_HOURS_LIMIT);
    renderWeekUpgrades();
  }

  function showWeekPopup() {
    hideCompletionPopup();
    hideSupplyPopup();
    updateWeekPopupContent();
    elements.weekPopup.hidden = false;
    elements.weekNext.focus();
  }

  function closeActiveOrder() {
    state.currentOrder = null;
    state.stage = 'idle';
    state.diagnosed = false;
    state.repairIndex = 0;
    state.satisfaction = 5;
    state.orderSecondsLeft = 0;
    state.orderSecondsTotal = 0;
    state.timerPenaltyApplied = false;
    stopOrderTimer();
    clearMini();
  }

  function endCurrentWeek() {
    if (state.weekSummary) {
      showWeekPopup();
      return;
    }

    closeActiveOrder();

    var missedQueue = state.clientQueue.slice();
    var queuePenalty = totalQueuePenalty(missedQueue);
    var rent = weeklyRentAmount(state.week);
    state.incomingLeads = [];
    state.selectedQueueId = '';
    state.clientQueue = [];
    state.money -= (rent + queuePenalty);

    state.weekSummary = {
      week: state.week,
      orders: state.weeklyOrders,
      revenue: state.weeklyRevenue,
      bonus: state.weeklyExcellentBonus,
      rent: rent,
      queuePenalty: queuePenalty,
      net: state.weeklyRevenue + state.weeklyExcellentBonus - rent - queuePenalty,
      hoursUsed: WEEK_HOURS_LIMIT - state.weekHoursLeft
    };

    if (rent > 0) {
      addLog(interpolate(langPack().logs.weekRentPaid, {
        rent: formatMoney(rent)
      }));
    }

    if (queuePenalty > 0) {
      addLog(interpolate(langPack().logs.weekQueuePenalty, {
        count: String(missedQueue.length),
        penalty: formatMoney(queuePenalty)
      }));
    }

    addLog(interpolate(langPack().logs.weekClosed, {
      week: String(state.weekSummary.week),
      net: formatMoney(state.weekSummary.net),
      revenue: formatMoney(state.weekSummary.revenue),
      bonus: formatMoney(state.weekSummary.bonus),
      rent: formatMoney(state.weekSummary.rent),
      queue: formatMoney(state.weekSummary.queuePenalty || 0)
    }));

    saveProgress();
    renderAll();
    showWeekPopup();
  }

  function startNextWeek() {
    if (!state.weekSummary) {
      return;
    }

    state.week += 1;
    state.weekHoursLeft = WEEK_HOURS_LIMIT;
    state.weeklyRevenue = 0;
    state.weeklyExcellentBonus = 0;
    state.weeklyOrders = 0;
    state.weekSummary = null;
    state.completionSummary = null;
    state.incomingLeads = [];
    state.selectedQueueId = '';
    state.clientQueue = [];

    var guard = 0;
    while (currentDateObj().getUTCDay() !== 1 && guard < 10) {
      advanceOneDay({ log: false, addCooldown: false });
      guard += 1;
    }
    if (!isWeekendCurrentDay()) {
      state.dayHoursLeft = DAY_HOURS_LIMIT;
    }
    hideWeekPopup();
    hideCompletionPopup();
    hideSupplyPopup();

    addLog(interpolate(langPack().logs.weekStarted, {
      week: String(state.week),
      hours: formatHours(WEEK_HOURS_LIMIT)
    }));

    saveProgress();
    renderAll();
  }

  function buyUpgrade(upgradeId) {
    if (!upgradeId || !UPGRADE_MAP[upgradeId]) {
      return;
    }

    var upgrade = UPGRADE_MAP[upgradeId];
    var status = upgradeStatus(upgrade);

    if (status === 'owned') {
      updateWeekPopupContent();
      return;
    }

    if (status === 'locked') {
      notifyActionError(interpolate(langPack().logs.upgradeLocked, {
        upgrade: upgradeText(upgrade).label
      }));
      updateWeekPopupContent();
      return;
    }

    if (status === 'needCash') {
      notifyActionError(interpolate(langPack().logs.upgradeNeedCash, {
        upgrade: upgradeText(upgrade).label
      }));
      updateWeekPopupContent();
      return;
    }

    state.money -= upgrade.cost;
    state.ownedUpgrades.push(upgrade.id);

    addLog(interpolate(langPack().logs.upgradeBought, {
      upgrade: upgradeText(upgrade).label,
      services: upgradeUnlockedServicesLabel(upgrade)
    }));

    saveProgress();
    renderAll();
    updateWeekPopupContent();
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
    var isMainActionDisabled = !activeOrder || state.actionLock;
    var actionLabel = mainActionLabel();
    setMiniVisual(state.mini.type !== 'none');
    elements.mainAction.disabled = isMainActionDisabled;
    elements.mainAction.textContent = actionLabel;
    if (elements.mainActionHeader) {
      elements.mainActionHeader.disabled = isMainActionDisabled;
      elements.mainActionHeader.textContent = actionLabel;
    }

    elements.actionTiming.disabled = !(state.mini.type === 'timing' && state.mini.context === 'repair');
    elements.actionClicks.disabled = !(state.mini.type === 'clicks');
    elements.actionFinish.disabled = !(state.mini.type === 'timing' && state.mini.context === 'finish');

    var inRepairStage = activeOrder && state.stage === 'repair' && !state.actionLock;
    elements.repairMaterial.disabled = !inRepairStage;
    elements.repairTool.disabled = !inRepairStage;
    elements.shelveOrder.disabled = !activeOrder || state.actionLock;
    elements.waitNextDay.disabled = false;
  }

  function applyPenalty(scorePenalty, starPenalty, message) {
    state.score = Math.max(0, state.score - scorePenalty);
    state.satisfaction = clamp(state.satisfaction - starPenalty, 1, 5);
    if (message) {
      addLog(message);
    }
    renderStats();
  }

  function applyPenaltyAndError(scorePenalty, starPenalty, message) {
    applyPenalty(scorePenalty, starPenalty, message);
    if (message) {
      showActionError(message);
    }
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
      missionMeta.className = 'cg-issue-solution';
      missionMeta.textContent = interpolate(langPack().ui.serviceMetaTemplate, {
        stars: starsDifficulty(issue.difficulty || 1),
        hours: formatHours(issue.serviceHours || serviceHours(issue.key)),
        price: formatMoney(issue.serviceFee || serviceFee(issue.key)),
        risk: riskLabel(issue.risk || 'medium')
      });
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
      setStageVisual('idle');
      updateSceneImage('idle', null, 'success');
      return;
    }

    if (state.stage === 'diagnosis') {
      elements.stageName.textContent = pack.stage.diagnosisTitle;
      elements.stageDesc.textContent = pack.stage.diagnosisDesc;
      setIssueVisual(state.currentOrder.issues[0].key);
      setStageVisual('diagnosis');
      updateSceneImage('diagnosis', state.currentOrder.issues[0].key, 'success');
      return;
    }

    if (state.stage === 'repair') {
      var issue = getCurrentIssue();

      if (!issue) {
        elements.stageName.textContent = pack.stage.repairTitle;
        elements.stageDesc.textContent = pack.stage.finishDesc;
        setIssueVisual('none');
        setStageVisual('repair');
        updateSceneImage('repair', null, 'success');
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
      setStageVisual('repair');
      updateSceneImage('repair', issue.key, 'success');
      return;
    }

    if (state.stage === 'finishing') {
      var previewIssue = null;
      if (state.currentOrder.issues.length > 0) {
        var previewIndex = clamp(state.repairIndex - 1, 0, state.currentOrder.issues.length - 1);
        previewIssue = state.currentOrder.issues[previewIndex].key;
      }
      elements.stageName.textContent = pack.stage.finishTitle;
      elements.stageDesc.textContent = pack.stage.finishDesc;
      setIssueVisual('none');
      setStageVisual('finishing');
      updateSceneImage('finishing', previewIssue, 'success');
      return;
    }

    var fixedCount = 0;
    for (var doneIndex = 0; doneIndex < state.currentOrder.issues.length; doneIndex += 1) {
      if (state.currentOrder.issues[doneIndex].status === 'fixed') {
        fixedCount += 1;
      }
    }
    var doneIssue = state.currentOrder.issues.length > 0
      ? state.currentOrder.issues[state.currentOrder.issues.length - 1].key
      : null;
    var doneOutcome = fixedCount >= state.currentOrder.issues.length ? 'success' : 'failed';

    elements.stageName.textContent = pack.stage.doneTitle;
    elements.stageDesc.textContent = pack.stage.doneDesc;
    setIssueVisual('none');
    setStageVisual('done');
    updateSceneImage('done', doneIssue, doneOutcome);
  }

  function renderStats() {
    elements.date.textContent = formatCalendarDate(state.currentDate);
    elements.score.textContent = String(Math.round(state.score));
    elements.money.textContent = formatMoney(state.money);
    elements.week.textContent = String(state.week);
    elements.hoursLeft.textContent = formatHours(state.weekHoursLeft) + ' / ' + formatHours(WEEK_HOURS_LIMIT);
    elements.marketing.textContent = state.marketingDaysLeft > 0
      ? interpolate(langPack().ui.marketingActive, { days: String(state.marketingDaysLeft) })
      : langPack().ui.marketingNone;
    elements.servicesUnlocked.textContent = String(unlockedServiceCount());
    elements.best.textContent = String(Math.round(state.bestScore));
    elements.completed.textContent = String(Math.round(state.completedOrders));
    elements.reputation.textContent = String(Math.round(state.reputation));
    elements.level.textContent = String(Math.round(state.level));
    elements.satisfaction.textContent = state.satisfaction + '/5';
    elements.satisfactionStars.textContent = starsString(state.satisfaction);
    elements.satisfactionStars.setAttribute('aria-label', state.satisfaction + '/5');
  }

  function renderInventoryPanel() {
    elements.inventoryList.innerHTML = '';

    var materialMap = langPack().materials;
    var keys = Object.keys(materialMap);

    keys.sort(function (a, b) {
      return materialLabel(a).localeCompare(materialLabel(b), state.lang === 'fr' ? 'fr' : 'en');
    });

    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      var qty = materialStock(key);
      var line = document.createElement('li');

      if (qty <= 1) {
        line.classList.add('is-low');
      }

      var nameEl = document.createElement('span');
      nameEl.className = 'cg-inventory-name';
      nameEl.textContent = materialLabel(key);
      line.appendChild(nameEl);

      var qtyEl = document.createElement('strong');
      qtyEl.className = 'cg-inventory-qty';
      qtyEl.textContent = formatStockCount(qty) + (qty <= 1 ? ' (' + langPack().ui.inventoryLowTag + ')' : '');
      line.appendChild(qtyEl);

      elements.inventoryList.appendChild(line);
    }
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
      function (materialKey) {
        return materialLabel(materialKey) + ' (' + formatStockCount(materialStock(materialKey)) + ')';
      }
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
    var expectedSetup = interpolate(langPack().ui.repairExpectedSetup, {
      material: materialLabel(typeDef.best.material),
      tool: toolLabel(typeDef.best.tool)
    });
    var expectedResult = interpolate(langPack().ui.repairExpectedResult, {
      result: issueSolution(issue.key)
    });

    setFeedbackText(elements.materialFeedback, materialFeedback.text, materialFeedback.rating);
    setFeedbackText(elements.toolFeedback, toolFeedback.text, toolFeedback.rating);

    elements.repairHint.textContent =
      repairTypeDesc(issue.selectedRepairType) + ' ' + expectedSetup + ' ' + expectedResult;
  }

  function renderWorkshopPanels() {
    renderDiagnosisPanel();
    renderRepairPlan();
  }

  function renderAll() {
    renderOrderPanel();
    renderQueuePanel();
    renderWorkshopPanels();
    renderStage();
    renderStats();
    renderInventoryPanel();
    updateWeekPopupContent();
    updateSupplyPopupContent();
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

    updateCompletionPopupContent();
    updateWeekPopupContent();
    renderQueuePanel();
    updateSupplyPopupContent();

    if (state.mini.type === 'clicks') {
      updateClicksCounter();
    }
  }

  function pickIssueSet() {
    var pool = ISSUE_LIBRARY.filter(function (definition) {
      return (
        isServiceUnlocked(definition.key) &&
        serviceHours(definition.key) <= state.weekHoursLeft
      );
    });

    if (pool.length === 0) {
      return [];
    }

    var issueCount = 1;
    if (state.level >= 4 && state.weekHoursLeft >= 6) {
      var chance = Math.min(0.18 + (state.level - 3) * 0.12, 0.72);
      if (Math.random() < chance) {
        issueCount = 2;
      }
    }

    var selected = [];
    var remainingHours = state.weekHoursLeft;

    while (selected.length < issueCount) {
      var options = pool.filter(function (definition) {
        if (selected.indexOf(definition) !== -1) {
          return false;
        }
        return serviceHours(definition.key) <= remainingHours;
      });

      if (options.length === 0) {
        break;
      }

      var index = Math.floor(Math.random() * options.length);
      selected.push(options[index]);
      remainingHours -= serviceHours(options[index].key);
    }

    return selected;
  }

  function buildIssueTask(definition, level, issueCount) {
    var missionDifficulty = definition.difficulty || 1;
    var hardness = missionDifficulty * 1.8 + level * 0.85 + (issueCount - 1) * 1.7;
    var economy = serviceEconomy(definition.key);

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
      serviceFee: economy.fee,
      serviceHours: economy.hours,
      serviceExcellenceBonus: economy.excellenceBonus,
      selectedRepairType: '',
      selectedMaterial: '',
      selectedTool: ''
    };
  }

  function generateOrder() {
    var selected = pickIssueSet();

    if (selected.length === 0) {
      return null;
    }

    var issues = [];
    var totalSeconds = 0;
    var totalHours = 0;

    for (var i = 0; i < selected.length; i += 1) {
      var task = buildIssueTask(selected[i], state.level, selected.length);
      totalSeconds += task.baseSeconds;
      totalHours += task.serviceHours;
      issues.push(task);
    }

    var pressureCut = Math.round((state.level - 1) * 3.2);
    var multiRepairCut = Math.round((issues.length - 1) * 14);
    var limit = clamp(totalSeconds - pressureCut - multiRepairCut, 55, 420);

    return {
      id: 'CMD-' + Date.now().toString(36).slice(-6).toUpperCase(),
      client: randomItem(CLIENT_NAMES[state.lang]),
      issues: issues,
      timeLimit: Math.round(limit),
      estimatedHours: totalHours
    };
  }

  function buildOrderFromQueueEntry(queueEntry) {
    if (!queueEntry || !queueEntry.issueKey) {
      return null;
    }

    if (queueEntry.savedOrder && typeof queueEntry.savedOrder === 'object') {
      var savedOrder = cloneData(queueEntry.savedOrder);
      if (savedOrder && Array.isArray(savedOrder.issues) && savedOrder.issues.length > 0) {
        if (!savedOrder.id) {
          savedOrder.id = 'CMD-' + Date.now().toString(36).slice(-6).toUpperCase();
        }
        if (!savedOrder.client) {
          savedOrder.client = queueEntry.client;
        }
        savedOrder.estimatedHours = Math.max(0.5, Number(savedOrder.estimatedHours) || queueEntryHours(queueEntry));
        savedOrder.timeLimit = Math.max(45, Math.round(Number(savedOrder.timeLimit) || 90));
        return savedOrder;
      }
    }

    var definition = serviceDefinition(queueEntry.issueKey);

    if (!definition) {
      return null;
    }

    var issueTask = buildIssueTask(definition, state.level, 1);
    var pressureCut = Math.round((state.level - 1) * 3.2);
    var limit = clamp(issueTask.baseSeconds - pressureCut, 50, 360);

    return {
      id: 'CMD-' + Date.now().toString(36).slice(-6).toUpperCase(),
      client: queueEntry.client,
      issues: [issueTask],
      timeLimit: Math.round(limit),
      estimatedHours: issueTask.serviceHours
    };
  }

  function applyQueueEntryRuntime(queueEntry) {
    if (
      queueEntry &&
      queueEntry.savedOrder &&
      (
        queueEntry.savedStage === 'diagnosis' ||
        queueEntry.savedStage === 'repair' ||
        queueEntry.savedStage === 'finishing'
      )
    ) {
      var issueCount = state.currentOrder && Array.isArray(state.currentOrder.issues)
        ? state.currentOrder.issues.length
        : 1;
      var maxRepairIndex = Math.max(0, issueCount);

      state.stage = queueEntry.savedStage;
      state.diagnosed = !!queueEntry.savedDiagnosed;
      state.repairIndex = clamp(
        Math.floor(Number(queueEntry.savedRepairIndex) || 0),
        0,
        maxRepairIndex
      );
      state.satisfaction = clamp(Number(queueEntry.savedSatisfaction) || 5, 1, 5);
      state.orderSecondsTotal = Math.max(1, Math.round(Number(queueEntry.savedOrderSecondsTotal) || state.currentOrder.timeLimit));
      state.orderSecondsLeft = clamp(
        Math.round(Number(queueEntry.savedOrderSecondsLeft) || state.orderSecondsTotal),
        0,
        state.orderSecondsTotal
      );
      state.timerPenaltyApplied = !!queueEntry.savedTimerPenaltyApplied;
      return true;
    }

    state.stage = 'diagnosis';
    state.diagnosed = false;
    state.repairIndex = 0;
    state.satisfaction = 5;
    state.orderSecondsTotal = state.currentOrder.timeLimit;
    state.orderSecondsLeft = state.currentOrder.timeLimit;
    state.timerPenaltyApplied = false;
    return false;
  }

  function shelveCurrentOrder() {
    if (state.weekSummary) {
      notifyActionError(langPack().logs.weekNeedsSummary);
      showWeekPopup();
      return;
    }

    if (!state.currentOrder || state.stage === 'done') {
      notifyActionError(langPack().logs.noOrder);
      return;
    }

    if (state.actionLock) {
      notifyActionError(langPack().logs.miniLocked);
      return;
    }

    if (state.clientQueue.length >= QUEUE_MAX_ITEMS) {
      notifyActionError(langPack().logs.queueCapacityReached);
      return;
    }

    var serviceKey = '';
    if (state.currentOrder.issues && state.currentOrder.issues.length > 0) {
      serviceKey = state.currentOrder.issues[0].key || '';
    }

    if (!serviceKey || !ISSUE_MAP[serviceKey]) {
      notifyActionError(langPack().logs.noOrder);
      return;
    }

    var shelvedEntry = {
      id: 'Q-' + Date.now().toString(36).toUpperCase() + '-' + String(state.clientQueue.length + 1),
      client: state.currentOrder.client,
      issueKey: serviceKey,
      weekAdded: state.week,
      estimatedHours: Math.max(0.5, Number(state.currentOrder.estimatedHours) || serviceHours(serviceKey)),
      savedOrder: cloneData(state.currentOrder),
      savedStage: state.stage,
      savedDiagnosed: !!state.diagnosed,
      savedRepairIndex: Math.max(0, Math.floor(state.repairIndex)),
      savedSatisfaction: clamp(Number(state.satisfaction) || 5, 1, 5),
      savedOrderSecondsLeft: Math.max(0, Math.floor(state.orderSecondsLeft)),
      savedOrderSecondsTotal: Math.max(1, Math.floor(state.orderSecondsTotal || state.currentOrder.timeLimit || 1)),
      savedTimerPenaltyApplied: !!state.timerPenaltyApplied
    };

    state.clientQueue.push(shelvedEntry);
    state.selectedQueueId = '';

    addLog(interpolate(langPack().logs.orderShelved, {
      client: shelvedEntry.client,
      service: issueLabel(shelvedEntry.issueKey)
    }));

    closeActiveOrder();
    saveProgress();
    renderAll();
  }

  function startOrderTimer(preservePenaltyFlag) {
    stopOrderTimer();
    if (!preservePenaltyFlag) {
      state.timerPenaltyApplied = false;
    }

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
    hideCompletionPopup();
    hideSupplyPopup();
    state.completionSummary = null;

    if (state.weekSummary) {
      notifyActionError(langPack().logs.weekNeedsSummary);
      showWeekPopup();
      return;
    }

    if (shouldEndWeek()) {
      endCurrentWeek();
      return;
    }

    clearMini();
    stopOrderTimer();

    if (isWeekendCurrentDay()) {
      notifyActionError(langPack().logs.weekendClosed);
      renderAll();
      return;
    }

    if (state.dayHoursLeft <= 0) {
      notifyActionError(langPack().logs.dayNoHoursLeft);
      renderAll();
      return;
    }

    if (state.clientQueue.length === 0) {
      if (shouldEndWeek()) {
        endCurrentWeek();
        return;
      }
      notifyActionError(langPack().logs.noQueueOrder);
      renderAll();
      return;
    }

    var queueIndex = -1;
    if (state.selectedQueueId) {
      for (var selectedIndex = 0; selectedIndex < state.clientQueue.length; selectedIndex += 1) {
        if (state.clientQueue[selectedIndex].id === state.selectedQueueId) {
          if (queueEntryHours(state.clientQueue[selectedIndex]) <= state.weekHoursLeft) {
            queueIndex = selectedIndex;
          }
          break;
        }
      }
    }

    if (queueIndex === -1) {
      queueIndex = queuedOrderFitIndex();
    }

    if (queueIndex === -1) {
      if (shouldEndWeek()) {
        endCurrentWeek();
      } else {
        notifyActionError(langPack().logs.noQueueOrder);
        renderAll();
      }
      return;
    }

    var queuedEntry = state.clientQueue.splice(queueIndex, 1)[0];
    if (state.selectedQueueId === queuedEntry.id) {
      state.selectedQueueId = '';
    }
    state.currentOrder = buildOrderFromQueueEntry(queuedEntry);

    if (!state.currentOrder || state.currentOrder.estimatedHours > state.weekHoursLeft) {
      endCurrentWeek();
      return;
    }

    var resumed = applyQueueEntryRuntime(queuedEntry);

    var issueNames = state.currentOrder.issues.map(function (issue) {
      return issueLabel(issue.key);
    }).join(', ');

    if (resumed) {
      addLog(interpolate(langPack().logs.orderResumed, {
        client: queuedEntry.client,
        service: issueLabel(queueEntryServiceKey(queuedEntry))
      }));
    } else {
      addLog(interpolate(langPack().logs.queueStarted, {
        client: queuedEntry.client,
        service: issueLabel(queuedEntry.issueKey)
      }));

      addLog(interpolate(langPack().logs.newOrder, {
        client: state.currentOrder.client,
        issues: issueNames
      }));
    }

    hideAllMiniPanels();
    saveProgress();
    startOrderTimer(resumed);
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
      applyPenaltyAndError(
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
      focusAndScrollMiniPanel(elements.miniPanels.finish, elements.actionFinish, false);
    } else {
      elements.miniTimingText.textContent = interpolate(langPack().miniText.timing, {
        issue: issueLabel(issue.key)
      });
      elements.miniPanels.timing.hidden = false;
      focusAndScrollMiniPanel(elements.miniPanels.timing, elements.actionTiming, false);
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
    focusAndScrollMiniPanel(elements.miniPanels.clicks, elements.actionClicks, true);

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

    var baseRevenue = 0;
    var excellenceBonus = 0;
    var orderHoursSpent = state.currentOrder.estimatedHours || 0;

    for (var billingIndex = 0; billingIndex < state.currentOrder.issues.length; billingIndex += 1) {
      var billedIssue = state.currentOrder.issues[billingIndex];
      var issuePrice = billedIssue.serviceFee || serviceFee(billedIssue.key);
      if (billedIssue.status === 'fixed') {
        baseRevenue += issuePrice;
      } else {
        baseRevenue += Math.round(issuePrice * 0.55);
      }
    }

    if (finishSuccess && rough === 0 && state.satisfaction >= 4) {
      for (var bonusIndex = 0; bonusIndex < state.currentOrder.issues.length; bonusIndex += 1) {
        excellenceBonus += state.currentOrder.issues[bonusIndex].serviceExcellenceBonus ||
          serviceExcellenceBonus(state.currentOrder.issues[bonusIndex].key);
      }
    }

    var payout = Math.max(0, Math.round(baseRevenue + excellenceBonus));

    state.money += payout;
    state.weeklyRevenue += Math.round(baseRevenue);
    state.weeklyExcellentBonus += Math.round(excellenceBonus);
    state.weeklyOrders += 1;
    state.weekHoursLeft = clamp(state.weekHoursLeft - orderHoursSpent, 0, WEEK_HOURS_LIMIT);
    addCooldownHours(orderHoursSpent);
    consumeWorkHours(orderHoursSpent);

    addLog(interpolate(langPack().logs.servicePayout, {
      amount: formatMoney(payout),
      hours: formatHours(orderHoursSpent)
    }));

    if (excellenceBonus > 0) {
      addLog(interpolate(langPack().logs.serviceExcellentBonus, {
        amount: formatMoney(excellenceBonus)
      }));
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

    if (shouldEndWeek()) {
      endCurrentWeek();
      return;
    }

    showCompletionPopup({
      stars: state.satisfaction,
      fixed: fixed,
      total: state.currentOrder.issues.length
    });
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
      applyPenaltyAndError(
        7,
        0,
        interpolate(langPack().logs.repairTypeMissing, {
          issue: issueLabel(issue.key)
        })
      );
      return;
    }

    if (!issue.selectedMaterial || !issue.selectedTool) {
      applyPenaltyAndError(7, 0, langPack().logs.repairSetupMissing);
      return;
    }

    var typeDef = repairTypeDefinition(issue.key, issue.selectedRepairType);

    if (!typeDef) {
      applyPenaltyAndError(7, 0, langPack().logs.repairSetupMissing);
      return;
    }

    var materialUsage = materialWearForIssue(issue.key, issue.selectedMaterial);
    var missingMaterials = materialUsageMissingList(materialUsage);

    if (missingMaterials.length > 0) {
      applyPenaltyAndError(6, 1, interpolate(langPack().logs.repairMissingMaterials, {
        materials: missingMaterials.join(', ')
      }));
      renderAll();
      return;
    }

    addLog(interpolate(langPack().logs.repairExpected, {
      issue: issueLabel(issue.key),
      material: materialLabel(typeDef.best.material),
      tool: toolLabel(typeDef.best.tool),
      result: issueSolution(issue.key)
    }));

    var setupProfile = evaluateRepairSetup(issue);

    if (!setupProfile) {
      applyPenaltyAndError(7, 0, langPack().logs.repairSetupMissing);
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

    var consumedLines = consumeMaterialUsage(materialUsage);
    if (consumedLines.length > 0) {
      addLog(interpolate(langPack().logs.repairMaterialsConsumedBatch, {
        materials: consumedLines.join(', ')
      }));
    }
    renderRepairPlan();

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
    if (state.weekSummary) {
      notifyActionError(langPack().logs.weekNeedsSummary);
      showWeekPopup();
      return;
    }

    if (!state.currentOrder || state.stage === 'done') {
      notifyActionError(langPack().logs.noOrder);
      return;
    }

    if (state.actionLock) {
      notifyActionError(langPack().logs.miniLocked);
      return;
    }

    if (state.stage === 'diagnosis') {
      completeDiagnosis();
      return;
    }

    if (state.stage === 'repair') {
      if (!state.diagnosed) {
        applyPenaltyAndError(10, 1, langPack().logs.needDiagnosis);
        return;
      }
      startRepairFromTool();
      return;
    }

    if (state.stage === 'finishing') {
      if (!state.diagnosed) {
        applyPenaltyAndError(10, 1, langPack().logs.needDiagnosis);
        return;
      }
      startFinishFromTool();
      return;
    }

    applyPenaltyAndError(8, 1, langPack().logs.wrongDuringFinish);
  }

  function switchLanguage() {
    state.lang = state.lang === 'fr' ? 'en' : 'fr';
    root.setAttribute('data-lang', state.lang);
    applyStaticTranslations();
    renderAll();
  }

  function scrollViewportToTop() {
    if (typeof window === 'undefined' || typeof window.scrollTo !== 'function') {
      return;
    }

    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      window.scrollTo(0, 0);
    }
  }

  function resetProgress() {
    if (!window.confirm(langPack().prompts.reset)) {
      return;
    }

    stopOrderTimer();
    clearMini();

    state.score = 0;
    state.money = STARTING_CASH;
    state.week = 1;
    state.weekHoursLeft = WEEK_HOURS_LIMIT;
    state.dayHoursLeft = DAY_HOURS_LIMIT;
    state.currentDate = START_DATE_ISO;
    state.ownedUpgrades = [];
    state.incomingLeads = [];
    state.selectedQueueId = '';
    state.clientQueue = [];
    state.stock = cloneStartingStock();
    state.pendingSupplies = [];
    state.hoursSinceSupplyOrder = SUPPLY_COOLDOWN_HOURS;
    state.marketingDaysLeft = 0;
    state.weeklyRevenue = 0;
    state.weeklyExcellentBonus = 0;
    state.weeklyOrders = 0;
    state.weekSummary = null;
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
    state.completionSummary = null;
    hideCompletionPopup();
    hideWeekPopup();
    hideSupplyPopup();

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

  function handleWeekUpgradeClick(event) {
    var target = event.target;

    if (!target || !target.hasAttribute('data-upgrade-buy')) {
      return;
    }

    buyUpgrade(target.getAttribute('data-upgrade-buy'));
  }

  function acceptIncomingLead(leadId) {
    if (state.weekSummary) {
      notifyActionError(langPack().logs.weekNeedsSummary);
      showWeekPopup();
      return;
    }

    if (state.clientQueue.length >= QUEUE_MAX_ITEMS) {
      notifyActionError(langPack().logs.queueCapacityReached);
      return;
    }

    var lead = removeIncomingLeadById(leadId);
    if (!lead) {
      return;
    }

    var newQueueId = 'Q-' + Date.now().toString(36).toUpperCase() + '-' + String(state.clientQueue.length + 1);
    state.clientQueue.push({
      id: newQueueId,
      client: lead.client,
      issueKey: lead.issueKey,
      weekAdded: state.week
    });
    if (!state.selectedQueueId) {
      state.selectedQueueId = newQueueId;
    }

    addLog(interpolate(langPack().logs.incomingAccepted, {
      client: lead.client,
      service: issueLabel(lead.issueKey)
    }));

    refillIncomingLeads();
    saveProgress();
    renderAll();
  }

  function declineIncomingLead(leadId) {
    var lead = removeIncomingLeadById(leadId);
    if (!lead) {
      return;
    }

    addLog(interpolate(langPack().logs.incomingDeclined, {
      client: lead.client,
      service: issueLabel(lead.issueKey)
    }));

    refillIncomingLeads();
    saveProgress();
    renderAll();
  }

  function handleIncomingLeadAction(event) {
    var target = event.target;

    if (!target) {
      return;
    }

    if (target.hasAttribute('data-incoming-accept')) {
      acceptIncomingLead(target.getAttribute('data-incoming-accept'));
      return;
    }

    if (target.hasAttribute('data-incoming-decline')) {
      declineIncomingLead(target.getAttribute('data-incoming-decline'));
    }
  }

  function selectQueueOrder(orderId) {
    var entry = queueEntryById(orderId);
    if (!entry) {
      return;
    }

    state.selectedQueueId = entry.id;
    addLog(interpolate(langPack().logs.queueSelected, {
      client: entry.client,
      service: issueLabel(entry.issueKey)
    }));
    saveProgress();
    renderAll();
  }

  function holdQueueOrder(orderId) {
    var entry = queueEntryById(orderId);
    if (!entry) {
      return;
    }

    if (state.selectedQueueId === entry.id) {
      state.selectedQueueId = '';
      addLog(interpolate(langPack().logs.queueBackToWaiting, {
        client: entry.client,
        service: issueLabel(entry.issueKey)
      }));
      saveProgress();
      renderAll();
    }
  }

  function handleQueueAction(event) {
    var target = event.target;

    if (!target) {
      return;
    }

    if (target.hasAttribute('data-queue-select')) {
      selectQueueOrder(target.getAttribute('data-queue-select'));
      return;
    }

    if (target.hasAttribute('data-queue-hold')) {
      holdQueueOrder(target.getAttribute('data-queue-hold'));
    }
  }

  function placeSupplyOrder(packId) {
    var pack = supplyPackById(packId);

    if (!pack) {
      return;
    }

    var status = supplyPackStatus(pack);

    if (status === 'locked') {
      notifyActionError(interpolate(langPack().logs.supplyLocked, {
        pack: supplyPackText(pack).label
      }));
      updateSupplyPopupContent();
      return;
    }

    if (status === 'cooldown') {
      notifyActionError(interpolate(langPack().logs.supplyCooldown, {
        hours: formatHoursRemaining(supplyHoursRemaining())
      }));
      updateSupplyPopupContent();
      return;
    }

    var rawQty = window.prompt(langPack().prompts.supplyQuantity, '1');
    if (rawQty === null) {
      return;
    }

    var qty = Math.floor(Number(rawQty));
    if (!Number.isFinite(qty) || qty < 1) {
      qty = 1;
    }
    qty = clamp(qty, 1, 20);

    var totalCost = pack.cost * qty;
    if (state.money < totalCost) {
      notifyActionError(interpolate(langPack().logs.supplyNeedCash, {
        pack: supplyPackText(pack).label
      }));
      updateSupplyPopupContent();
      return;
    }

    var arrivalDateObj = currentDateObj();
    arrivalDateObj.setUTCDate(arrivalDateObj.getUTCDate() + 1);
    var arrivalIso = dateToIso(arrivalDateObj);

    state.money -= totalCost;
    state.pendingSupplies.push(supplyDeliveryEntry(pack.id, qty, arrivalIso));

    state.hoursSinceSupplyOrder = 0;

    addLog(interpolate(langPack().logs.supplyOrderedDelivery, {
      pack: supplyPackText(pack).label,
      qty: String(qty),
      date: formatCalendarDate(arrivalIso)
    }));

    saveProgress();
    renderAll();
  }

  function waitNextDay() {
    hideSupplyPopup();

    if (!isWeekendCurrentDay() && state.dayHoursLeft > 0) {
      var burnedHours = Math.min(state.dayHoursLeft, state.weekHoursLeft);
      state.weekHoursLeft = clamp(state.weekHoursLeft - burnedHours, 0, WEEK_HOURS_LIMIT);
      state.dayHoursLeft = 0;
    }

    advanceOneDay({ log: true, addCooldown: true });
    saveProgress();
    renderAll();
  }

  function buyMarketingBoost() {
    if (state.money < MARKETING_COST) {
      notifyActionError(langPack().logs.marketingNeedCash);
      return;
    }

    state.money -= MARKETING_COST;
    state.marketingDaysLeft = Math.max(0, state.marketingDaysLeft) + MARKETING_DURATION_DAYS;
    refillIncomingLeads();

    addLog(interpolate(langPack().logs.marketingBought, {
      days: String(MARKETING_DURATION_DAYS)
    }));

    saveProgress();
    renderAll();
  }

  function handleSupplyOpen() {
    showSupplyPopup();
  }

  function handleSupplyClose() {
    hideSupplyPopup();
    renderAll();
  }

  function handleSupplyBuyClick(event) {
    var target = event.target;

    if (!target) {
      return;
    }

    if (target.hasAttribute('data-supply-marketing')) {
      buyMarketingBoost();
      return;
    }

    if (target.hasAttribute('data-supply-buy')) {
      placeSupplyOrder(target.getAttribute('data-supply-buy'));
    }
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
  elements.shelveOrder.addEventListener('click', shelveCurrentOrder);
  elements.incomingList.addEventListener('click', handleIncomingLeadAction);
  elements.queueList.addEventListener('click', handleQueueAction);
  elements.waitNextDay.addEventListener('click', waitNextDay);
  elements.openSupply.addEventListener('click', handleSupplyOpen);
  elements.supplyClose.addEventListener('click', handleSupplyClose);
  elements.resetSave.addEventListener('click', resetProgress);
  elements.mainAction.addEventListener('click', function () {
    handleMainAction();
    scrollViewportToTop();
  });
  if (elements.mainActionHeader) {
    elements.mainActionHeader.addEventListener('click', function () {
      handleMainAction();
      scrollViewportToTop();
    });
  }
  elements.completionNewOrder.addEventListener('click', function () {
    startNewOrder();
    scrollViewportToTop();
  });
  elements.weekNext.addEventListener('click', startNextWeek);

  elements.actionTiming.addEventListener('click', handleTimingHit);
  elements.actionClicks.addEventListener('click', handleClicksHit);
  elements.actionFinish.addEventListener('click', handleTimingHit);

  elements.diagnosisList.addEventListener('change', handleDiagnosisSelectionChange);
  elements.repairMaterial.addEventListener('change', handleRepairMaterialChange);
  elements.repairTool.addEventListener('change', handleRepairToolChange);
  elements.weekUpgrades.addEventListener('click', handleWeekUpgradeClick);
  elements.supplyList.addEventListener('click', handleSupplyBuyClick);

  document.addEventListener('keydown', handleShortcuts);

  setupActionErrorBanner();
  loadProgress();
  clearMini();
  hideCompletionPopup();
  hideWeekPopup();
  hideSupplyPopup();
  applyStaticTranslations();
  clearLogs();
  addLog(langPack().logs.workshopReady);
  renderAll();

  if (state.weekSummary) {
    showWeekPopup();
  }
})();
