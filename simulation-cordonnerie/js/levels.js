// Gameplay data and pure helpers for the shoe repair simulation.

export const DIAGNOSTIC_QUESTIONS = [
  {
    id: "visual_gap",
    label: "Observer la semelle et la jonction",
    fallbackAnswer:
      "Aucun indice decisif ici, mais l'observation visuelle reste utile.",
  },
  {
    id: "flex_test",
    label: "Tester la flexion de l'avant-pied",
    fallbackAnswer:
      "La flexion semble correcte, sans symptome majeur apparent.",
  },
  {
    id: "heel_press",
    label: "Presser le talon et verifier l'accroche",
    fallbackAnswer: "Le talon parait stable, sans ancrage casse.",
  },
  {
    id: "lining_check",
    label: "Verifier la doublure interieure",
    fallbackAnswer:
      "La doublure est propre, sans deterioration evidente.",
  },
  {
    id: "stitch_trace",
    label: "Inspecter les coutures laterales",
    fallbackAnswer: "Les coutures sont regulieres sur cette zone.",
  },
  {
    id: "eyelet_pull",
    label: "Tester les oeillets de lacage",
    fallbackAnswer: "Les oeillets resistent bien a la traction.",
  },
  {
    id: "odor_check",
    label: "Controle hygiene et humidite",
    fallbackAnswer: "Aucune humidite anormale detectee.",
  },
];

export const REPAIR_OPTIONS = [
  {
    id: "resole",
    label: "Recoller et presser la semelle",
    description: "Nettoyage, collage neoprene, pressage controle.",
    timeCost: 16,
  },
  {
    id: "heel_replace",
    label: "Remplacer patin et talon",
    description: "Depose talon use puis pose d'un patin neuf.",
    timeCost: 18,
  },
  {
    id: "restitch",
    label: "Refaire les coutures de maintien",
    description: "Reprise des points avec fil cire adapte.",
    timeCost: 14,
  },
  {
    id: "dehumidify",
    label: "Assainir et secher la doublure",
    description: "Traitement antibacterien + sechage maitrise.",
    timeCost: 15,
  },
  {
    id: "eyelet_swap",
    label: "Changer l'oeillet defectueux",
    description: "Extraction de l'oeillet puis rivetage neuf.",
    timeCost: 12,
  },
  {
    id: "condition_leather",
    label: "Nourrir et assouplir le cuir",
    description: "Brossage, creme nourrissante, repos du cuir.",
    timeCost: 10,
  },
];

export const PROBLEM_LIBRARY = {
  sole_loose: {
    title: "Semelle decollee",
    symptom: "Bruit sec et decollement en bordure.",
    correctRepair: "resole",
    baseTimeLimit: 78,
    minDay: 1,
    baseScore: 125,
    reputation: { success: 7, fail: -6 },
    requiredClues: 2,
    clueByQuestion: {
      visual_gap: "Un jour apparait entre la tige et la semelle.",
      flex_test: "La semelle plie independamment de la chaussure.",
      stitch_trace: "Les coutures sont stables: le souci est surtout le collage.",
    },
    tip: "Toujours degraisser avant collage pour eviter un decollement rapide.",
  },
  heel_worn: {
    title: "Talon use",
    symptom: "Instabilite et glissade a l'arriere.",
    correctRepair: "heel_replace",
    baseTimeLimit: 74,
    minDay: 1,
    baseScore: 115,
    reputation: { success: 6, fail: -6 },
    requiredClues: 2,
    clueByQuestion: {
      heel_press: "Le talon est tasse et l'accroche est asymetrique.",
      visual_gap: "Le patin est use sur un seul bord.",
      flex_test: "L'avant-pied est correct, le probleme est concentre au talon.",
    },
    tip: "Verifier l'axe du talon pour eviter une usure prematuree.",
  },
  stitch_open: {
    title: "Couture ouverte",
    symptom: "Ouverture progressive sur le quartier lateral.",
    correctRepair: "restitch",
    baseTimeLimit: 70,
    minDay: 1,
    baseScore: 110,
    reputation: { success: 6, fail: -5 },
    requiredClues: 2,
    clueByQuestion: {
      stitch_trace: "Fil relache detecte, la couture n'est plus continue.",
      visual_gap: "L'ouverture suit la ligne de couture.",
      eyelet_pull: "Les oeillets tiennent, la panne est bien textile.",
    },
    tip: "Repartir les points de couture pour equilibrer la tension.",
  },
  liner_wet: {
    title: "Doublure humide",
    symptom: "Humidite interieure et odeur persistante.",
    correctRepair: "dehumidify",
    baseTimeLimit: 68,
    minDay: 2,
    baseScore: 118,
    reputation: { success: 7, fail: -7 },
    requiredClues: 2,
    clueByQuestion: {
      odor_check: "Humidite nette et odeur forte en zone talonniere.",
      lining_check: "La doublure retient l'humidite, risque de moisissure.",
      heel_press: "La structure externe est correcte: le probleme est interne.",
    },
    tip: "Un sechage lent preserve la forme de la chaussure.",
  },
  eyelet_broken: {
    title: "Oeillet casse",
    symptom: "Le lacage ne tient pas sous tension.",
    correctRepair: "eyelet_swap",
    baseTimeLimit: 66,
    minDay: 2,
    baseScore: 105,
    reputation: { success: 5, fail: -5 },
    requiredClues: 1,
    clueByQuestion: {
      eyelet_pull: "Un oeillet se deforme immediatement a la traction.",
      stitch_trace: "La couture voisine est saine, seul l'oeillet est defectueux.",
    },
    tip: "Verifier le diametre de l'oeillet pour respecter le lacage d'origine.",
  },
  leather_dry: {
    title: "Cuir desseche",
    symptom: "Craquements et rigidite au pli de marche.",
    correctRepair: "condition_leather",
    baseTimeLimit: 72,
    minDay: 3,
    baseScore: 130,
    reputation: { success: 8, fail: -8 },
    requiredClues: 2,
    clueByQuestion: {
      flex_test: "Des micro-craquelures apparaissent lors de la flexion.",
      visual_gap: "Pas de decollement: c'est la matiere qui manque de souplesse.",
      lining_check: "Doublure intacte, le probleme concerne bien le cuir externe.",
    },
    tip: "Hydrater en couches fines pour eviter de saturer le cuir.",
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

function estimateDifficulty(problemCode) {
  const problem = PROBLEM_LIBRARY[problemCode];
  if (!problem) {
    return 1;
  }
  return Math.max(1, Math.ceil(problem.minDay / 1.2));
}

function pickRandom(list, randomFn) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  const idx = Math.floor(randomFn() * list.length);
  return list[idx];
}

function cloneQuestion(question) {
  return {
    id: question.id,
    label: question.label,
    fallbackAnswer: question.fallbackAnswer,
  };
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
    askedQuestionIds: [],
    discoveredClues: [],
    selectedRepairId: null,
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

export function getDiagnosticQuestions() {
  return DIAGNOSTIC_QUESTIONS.map(cloneQuestion);
}

export function resolveQuestion(problem, questionId) {
  if (!problem) {
    return {
      useful: false,
      text: "La chaussure n'est pas en atelier pour le moment.",
    };
  }

  const clue = problem.clueByQuestion[questionId];
  if (clue) {
    return {
      useful: true,
      text: clue,
    };
  }

  const fallback =
    DIAGNOSTIC_QUESTIONS.find((question) => question.id === questionId)?.fallbackAnswer ||
    "Cet angle d'analyse n'apporte pas d'indice supplementaire.";

  return {
    useful: false,
    text: fallback,
  };
}
