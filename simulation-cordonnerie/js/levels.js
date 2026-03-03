// Gameplay data and pure helpers for the shoe repair simulation.

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
    fallbackHint: "Les oeillets testees semblent tenir la traction.",
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
  },
  {
    id: "heel_replace",
    label: "Remplacer patin et talon",
    description: "Depose talon use puis pose d'un patin neuf.",
    timeCost: 18,
    resources: { semelles: 1, colle: 1, fil: 0, cuir: 0 },
    requiresMiniGame: false,
  },
  {
    id: "restitch",
    label: "Refaire les coutures de maintien",
    description: "Reprise des points avec fil cire adapte.",
    timeCost: 14,
    resources: { semelles: 0, colle: 0, fil: 2, cuir: 1 },
    requiresMiniGame: true,
  },
  {
    id: "dehumidify",
    label: "Assainir et secher la doublure",
    description: "Traitement antibacterien + sechage maitrise.",
    timeCost: 15,
    resources: { semelles: 0, colle: 1, fil: 0, cuir: 1 },
    requiresMiniGame: false,
  },
  {
    id: "eyelet_swap",
    label: "Changer l'oeillet defectueux",
    description: "Extraction de l'oeillet puis rivetage neuf.",
    timeCost: 12,
    resources: { semelles: 0, colle: 0, fil: 1, cuir: 1 },
    requiresMiniGame: false,
  },
  {
    id: "condition_leather",
    label: "Nourrir et assouplir le cuir",
    description: "Brossage, creme nourrissante, repos du cuir.",
    timeCost: 10,
    resources: { semelles: 0, colle: 0, fil: 0, cuir: 2 },
    requiresMiniGame: false,
  },
];

export const PROBLEM_LIBRARY = {
  sole_loose: {
    title: "Semelle decollee",
    symptom: "Bruit sec et decollement en bordure.",
    correctZoneId: "sole_zone",
    correctRepair: "resole",
    baseTimeLimit: 78,
    minDay: 1,
    baseScore: 125,
    requiredClues: 2,
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
    baseTimeLimit: 74,
    minDay: 1,
    baseScore: 115,
    requiredClues: 2,
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
    baseTimeLimit: 70,
    minDay: 1,
    baseScore: 110,
    requiredClues: 2,
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
    baseTimeLimit: 68,
    minDay: 2,
    baseScore: 118,
    requiredClues: 2,
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
    baseTimeLimit: 66,
    minDay: 2,
    baseScore: 105,
    requiredClues: 1,
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
    baseTimeLimit: 72,
    minDay: 3,
    baseScore: 130,
    requiredClues: 2,
    clueByZoneId: {
      leather_zone: "Micro-craquelures visibles sur la zone de flexion du cuir.",
      lining_zone: "Doublure intacte: la degradation est surtout externe.",
      sole_zone: "Pas de decollement notable de la semelle.",
    },
    tip: "Hydrater en couches fines pour eviter de saturer la matiere.",
  },
};

const LEVELS = [
  {
    dayMin: 1,
    dayMax: 2,
    queueLength: 3,
    timeMultiplier: 1,
    difficultyMax: 2,
  },
  {
    dayMin: 3,
    dayMax: 4,
    queueLength: 4,
    timeMultiplier: 0.92,
    difficultyMax: 3,
  },
  {
    dayMin: 5,
    dayMax: 99,
    queueLength: 5,
    timeMultiplier: 0.86,
    difficultyMax: 4,
  },
];

function pickRandom(list, randomFn) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  const idx = Math.floor(randomFn() * list.length);
  return list[idx];
}

function estimateDifficulty(problemCode) {
  const problem = PROBLEM_LIBRARY[problemCode];
  if (!problem) {
    return 1;
  }
  return Math.max(1, Math.ceil(problem.minDay / 1.2));
}

export function getLevelConfig(day) {
  return (
    LEVELS.find((level) => day >= level.dayMin && day <= level.dayMax) ||
    LEVELS[LEVELS.length - 1]
  );
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

export function buildClientScenario(baseClient, day, randomFn = Math.random) {
  const level = getLevelConfig(day);
  const allowedProblemCodes = (baseClient.problemPool || []).filter((code) => {
    const problem = getProblem(code);
    return problem && estimateDifficulty(code) <= level.difficultyMax;
  });

  const candidatePool =
    allowedProblemCodes.length > 0 ? allowedProblemCodes : baseClient.problemPool || [];

  const problemCode = pickRandom(candidatePool, randomFn);
  const problem = getProblem(problemCode);
  if (!problem) {
    return null;
  }

  const timeLimit = Math.max(42, Math.round(problem.baseTimeLimit * level.timeMultiplier));

  return {
    id: `${baseClient.id}-${problemCode}-${day}-${Math.round(randomFn() * 10000)}`,
    client: baseClient,
    problemCode,
    problem,
    timeLimit,
    inspectedZoneIds: [],
    discoveredClues: [],
    selectedZoneId: null,
    selectedRepairId: null,
    stitchResult: null,
    elapsedMs: 0,
  };
}

export function createDayQueue(clients, day, randomFn = Math.random) {
  const level = getLevelConfig(day);
  const queue = [];

  if (!Array.isArray(clients) || clients.length === 0) {
    return queue;
  }

  for (let i = 0; i < level.queueLength; i += 1) {
    const client = clients[Math.floor(randomFn() * clients.length)];
    const scenario = buildClientScenario(client, day, randomFn);
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
