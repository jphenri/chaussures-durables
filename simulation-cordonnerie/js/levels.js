// Gameplay data and level progression helpers.

export const DIAGNOSTIC_ZONES = [
  {
    id: "sole_zone",
    label: "Semelle",
    x: 58,
    y: 126,
    w: 278,
    h: 28,
    fallbackHint: "Aucun decollement marque dans cette zone.",
  },
  {
    id: "heel_zone",
    label: "Talon",
    x: 38,
    y: 95,
    w: 82,
    h: 40,
    fallbackHint: "Le talon parait stable, sans usure critique.",
  },
  {
    id: "stitch_zone",
    label: "Coutures",
    x: 143,
    y: 84,
    w: 212,
    h: 26,
    fallbackHint: "Couture reguliere sur cette ligne.",
  },
  {
    id: "lining_zone",
    label: "Doublure",
    x: 244,
    y: 50,
    w: 166,
    h: 58,
    fallbackHint: "La doublure semble saine a cet endroit.",
  },
  {
    id: "eyelet_zone",
    label: "Oeillets",
    x: 330,
    y: 60,
    w: 132,
    h: 36,
    fallbackHint: "Les oeillets testes semblent tenir la traction.",
  },
  {
    id: "leather_zone",
    label: "Cuir externe",
    x: 120,
    y: 38,
    w: 260,
    h: 48,
    fallbackHint: "Le cuir ne montre pas de fragilite evidente ici.",
  },
];

export const REPAIR_OPTIONS = [
  {
    id: "resole",
    label: "Recoller et presser la semelle",
    description: "Nettoyage, collage neoprene, pressage controle.",
    timeCost: 16,
    resources: { semelles: 1, colle: 1, fil: 0, cuir: 0 },
    requiresMiniGame: false,
    complexity: 1,
  },
  {
    id: "heel_replace",
    label: "Remplacer patin et talon",
    description: "Depose talon use puis pose d'un patin neuf.",
    timeCost: 18,
    resources: { semelles: 1, colle: 1, fil: 0, cuir: 0 },
    requiresMiniGame: false,
    complexity: 2,
  },
  {
    id: "restitch",
    label: "Refaire les coutures de maintien",
    description: "Reprise des points avec fil cire adapte.",
    timeCost: 14,
    resources: { semelles: 0, colle: 0, fil: 2, cuir: 1 },
    requiresMiniGame: true,
    complexity: 3,
  },
  {
    id: "dehumidify",
    label: "Assainir et secher la doublure",
    description: "Traitement antibacterien + sechage maitrise.",
    timeCost: 15,
    resources: { semelles: 0, colle: 1, fil: 0, cuir: 1 },
    requiresMiniGame: false,
    complexity: 2,
  },
  {
    id: "eyelet_swap",
    label: "Changer l'oeillet defectueux",
    description: "Extraction de l'oeillet puis rivetage neuf.",
    timeCost: 12,
    resources: { semelles: 0, colle: 0, fil: 1, cuir: 1 },
    requiresMiniGame: false,
    complexity: 2,
  },
  {
    id: "condition_leather",
    label: "Nourrir et assouplir le cuir",
    description: "Brossage, creme nourrissante, repos du cuir.",
    timeCost: 10,
    resources: { semelles: 0, colle: 0, fil: 0, cuir: 2 },
    requiresMiniGame: false,
    complexity: 1,
  },
];

export const PROBLEM_LIBRARY = {
  sole_loose: {
    title: "Semelle decollee",
    symptom: "Bruit sec et decollement en bordure.",
    correctZoneId: "sole_zone",
    correctRepair: "resole",
    baseTimeLimit: 84,
    minLevel: 1,
    baseScore: 120,
    requiredClues: 2,
    demandingHint: "Client inquiet de perdre de l'adherence en marchant vite.",
    complexity: 1,
    clueByZoneId: {
      sole_zone: "Un jour apparait entre la tige et la semelle.",
      stitch_zone: "La couture est stable: le probleme vient surtout du collage.",
      heel_zone: "Le talon est sain, la panne est a l'avant et sur le flanc.",
    },
    tip: "Toujours degraisser avant collage pour eviter un nouveau decollement.",
  },
  heel_worn: {
    title: "Talon use",
    symptom: "Instabilite et glissade a l'arriere.",
    correctZoneId: "heel_zone",
    correctRepair: "heel_replace",
    baseTimeLimit: 80,
    minLevel: 1,
    baseScore: 128,
    requiredClues: 2,
    demandingHint: "Client exige une correction immediate de l'appui.",
    complexity: 2,
    clueByZoneId: {
      heel_zone: "Le patin est tasse et l'accroche est asymetrique.",
      sole_zone: "L'usure principale est localisee a l'arriere.",
      lining_zone: "La doublure est correcte, pas de souci interne majeur.",
    },
    tip: "Verifier l'axe du talon pour eviter une usure prematuree.",
  },
  stitch_open: {
    title: "Couture ouverte",
    symptom: "Ouverture progressive sur le quartier lateral.",
    correctZoneId: "stitch_zone",
    correctRepair: "restitch",
    baseTimeLimit: 78,
    minLevel: 1,
    baseScore: 140,
    requiredClues: 2,
    demandingHint: "Client craint une ouverture complete pendant le trajet.",
    complexity: 3,
    clueByZoneId: {
      stitch_zone: "Fil relache detecte: la couture n'est plus continue.",
      eyelet_zone: "Les oeillets tiennent, le souci est bien la couture.",
      sole_zone: "La semelle suit correctement, pas de decollement ici.",
    },
    tip: "Repartir les points pour equilibrer la tension de couture.",
  },
  liner_wet: {
    title: "Doublure humide",
    symptom: "Humidite interieure et odeur persistante.",
    correctZoneId: "lining_zone",
    correctRepair: "dehumidify",
    baseTimeLimit: 74,
    minLevel: 2,
    baseScore: 134,
    requiredClues: 2,
    demandingHint: "Client demande un resultat propre et durable sans odeur.",
    complexity: 2,
    clueByZoneId: {
      lining_zone: "Humidite nette et odeur forte en zone talonniere.",
      leather_zone: "Le cuir externe est correct: la panne est interne.",
      heel_zone: "Le talon n'est pas la source du probleme.",
    },
    tip: "Un sechage progressif preserve la forme de la chaussure.",
  },
  eyelet_broken: {
    title: "Oeillet casse",
    symptom: "Le lacage ne tient pas sous tension.",
    correctZoneId: "eyelet_zone",
    correctRepair: "eyelet_swap",
    baseTimeLimit: 72,
    minLevel: 2,
    baseScore: 132,
    requiredClues: 1,
    demandingHint: "Client veut retrouver un serrage parfaitement stable.",
    complexity: 2,
    clueByZoneId: {
      eyelet_zone: "Un oeillet se deforme immediatement a la traction.",
      stitch_zone: "La couture voisine est saine, seul l'oeillet est defectueux.",
    },
    tip: "Respecter le diametre de l'oeillet d'origine pour un bon maintien.",
  },
  leather_dry: {
    title: "Cuir desseche",
    symptom: "Craquements et rigidite au pli de marche.",
    correctZoneId: "leather_zone",
    correctRepair: "condition_leather",
    baseTimeLimit: 76,
    minLevel: 3,
    baseScore: 158,
    requiredClues: 2,
    demandingHint: "Client haut de gamme: refus de toute alteraton visuelle.",
    complexity: 3,
    clueByZoneId: {
      leather_zone: "Micro-craquelures visibles sur la zone de flexion du cuir.",
      lining_zone: "Doublure intacte: la degradation est surtout externe.",
      sole_zone: "Pas de decollement notable de la semelle.",
    },
    tip: "Hydrater en couches fines pour eviter de saturer la matiere.",
  },
};

export class Level {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.minXp = config.minXp;
    this.maxConcurrentClients = config.maxConcurrentClients;
    this.timerEnabled = config.timerEnabled;
    this.guidedTutorial = config.guidedTutorial;
    this.inventoryEnabled = config.inventoryEnabled;
    this.demandingClients = config.demandingClients;
    this.complexRepairs = config.complexRepairs;
    this.reputationPenaltyMultiplier = config.reputationPenaltyMultiplier;
    this.baseQueueSize = config.baseQueueSize;
    this.xpToNext = config.xpToNext;
  }

  computeQueueSize(day) {
    const dayBoost = Math.floor(Math.max(0, day - 1) / 3);
    return this.baseQueueSize + dayBoost;
  }

  computeTimeLimit(problem) {
    const base = problem.baseTimeLimit;

    if (!this.timerEnabled) {
      return base;
    }

    const timerFactor = this.id === 2 ? 0.92 : 0.84;
    return Math.max(44, Math.round(base * timerFactor));
  }

  shouldUseComplexRepair(repair, problem) {
    if (!this.complexRepairs) {
      return repair.requiresMiniGame;
    }

    return repair.requiresMiniGame || repair.complexity >= 2 || problem.complexity >= 3;
  }

  getTutorialText(scenario) {
    if (!this.guidedTutorial || !scenario) {
      return "";
    }

    if (!scenario.selectedZoneId) {
      return "Tutoriel: inspectez d'abord la zone qui semble la plus liee au symptome client.";
    }

    if (!scenario.selectedRepairId) {
      return "Tutoriel: choisissez ensuite la reparation la plus logique selon la zone validee.";
    }

    return "Tutoriel: validez la reparation pour finaliser la commande client.";
  }
}

export const LEVELS = [
  new Level({
    id: 1,
    name: "Apprenti",
    minXp: 0,
    xpToNext: 120,
    maxConcurrentClients: 1,
    timerEnabled: false,
    guidedTutorial: true,
    inventoryEnabled: false,
    demandingClients: false,
    complexRepairs: false,
    reputationPenaltyMultiplier: 1,
    baseQueueSize: 3,
  }),
  new Level({
    id: 2,
    name: "Atelier Local",
    minXp: 120,
    xpToNext: 320,
    maxConcurrentClients: 2,
    timerEnabled: true,
    guidedTutorial: false,
    inventoryEnabled: true,
    demandingClients: false,
    complexRepairs: false,
    reputationPenaltyMultiplier: 1,
    baseQueueSize: 4,
  }),
  new Level({
    id: 3,
    name: "Maitre Cordonnerie",
    minXp: 320,
    xpToNext: null,
    maxConcurrentClients: 2,
    timerEnabled: true,
    guidedTutorial: false,
    inventoryEnabled: true,
    demandingClients: true,
    complexRepairs: true,
    reputationPenaltyMultiplier: 1.7,
    baseQueueSize: 5,
  }),
];

function pickRandom(list, randomFn) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }

  const idx = Math.floor(randomFn() * list.length);
  return list[idx];
}

export function getLevelByXp(xp) {
  const sorted = [...LEVELS].sort((a, b) => a.minXp - b.minXp);
  let chosen = sorted[0];

  sorted.forEach((level) => {
    if (xp >= level.minXp) {
      chosen = level;
    }
  });

  return chosen;
}

export function getLevelById(levelId) {
  return LEVELS.find((level) => level.id === levelId) || LEVELS[0];
}

export function getProblem(problemCode) {
  return PROBLEM_LIBRARY[problemCode] || null;
}

export function getRepairById(repairId) {
  return REPAIR_OPTIONS.find((repair) => repair.id === repairId) || null;
}

export function getDiagnosticZones() {
  return DIAGNOSTIC_ZONES.map((zone) => ({ ...zone }));
}

export function getDiagnosticZoneById(zoneId) {
  return DIAGNOSTIC_ZONES.find((zone) => zone.id === zoneId) || null;
}

export function buildClientScenario(baseClient, day, level, randomFn = Math.random) {
  const candidateCodes = (baseClient.problemPool || []).filter((code) => {
    const problem = getProblem(code);
    return problem && problem.minLevel <= level.id;
  });

  const pool = candidateCodes.length > 0 ? candidateCodes : baseClient.problemPool || [];
  const problemCode = pickRandom(pool, randomFn);
  const problem = getProblem(problemCode);

  if (!problem) {
    return null;
  }

  const timeLimit = level.computeTimeLimit(problem);
  const demanding = level.demandingClients || randomFn() > 0.7;

  return {
    id: `${baseClient.id}-${problemCode}-${day}-${Math.round(randomFn() * 10000)}`,
    client: baseClient,
    problemCode,
    problem,
    timeLimit,
    demanding,
    inspectedZoneIds: [],
    discoveredClues: [],
    selectedZoneId: null,
    selectedRepairId: null,
    stitchResult: null,
    elapsedMs: 0,
    finished: false,
  };
}

export function createDayQueue(clients, day, level, randomFn = Math.random) {
  const queue = [];

  if (!Array.isArray(clients) || clients.length === 0) {
    return queue;
  }

  const queueSize = level.computeQueueSize(day);

  for (let i = 0; i < queueSize; i += 1) {
    const client = clients[Math.floor(randomFn() * clients.length)];
    const scenario = buildClientScenario(client, day, level, randomFn);
    if (scenario) {
      queue.push(scenario);
    }
  }

  return queue;
}

export function resolveZoneInspection(problem, zoneId) {
  const zone = getDiagnosticZoneById(zoneId);
  if (!problem || !zone) {
    return {
      useful: false,
      primaryMatch: false,
      text: "Zone indisponible pour ce diagnostic.",
    };
  }

  const clue = problem.clueByZoneId?.[zoneId];
  if (clue) {
    return {
      useful: true,
      primaryMatch: zoneId === problem.correctZoneId,
      text: clue,
    };
  }

  return {
    useful: false,
    primaryMatch: false,
    text: `${zone.label}: ${zone.fallbackHint}`,
  };
}
