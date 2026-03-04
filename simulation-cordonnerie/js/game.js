import { getLevelByXp } from "./levels.js";
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
  shoeTypeImage: document.getElementById("shoe-type-image"),
  shoeBaseShape: document.getElementById("shoe-base-shape"),
  sourceStitch: document.querySelector(".src-stitch"),
  parts: Array.from(document.querySelectorAll(".shoe-part[data-part]")),
  miniGamePanel: document.getElementById("mini-game-panel"),
  miniGameTitle: document.getElementById("mini-game-title"),
  miniGameProgress: document.getElementById("mini-game-progress"),
  miniGameInstruction: document.getElementById("mini-game-instruction"),
  miniGameSvg: document.getElementById("mini-game-svg"),
  miniGameTrack: document.getElementById("mini-game-track"),
  miniGameTargets: document.getElementById("mini-game-targets"),
  miniGameCancelBtn: document.getElementById("mini-game-cancel-btn"),
};

const PART_LABELS = {
  semelle: "Semelle",
  talon: "Talon",
  couture: "Couture trepointe",
  empeigne: "Empeigne",
};

const MODULAR_PART_GUIDE = {
  semelle: {
    color: "jaune",
    actionLabel: "Changement de semelle modulaire",
    allowedRepairIds: [
      "remplacement_module_avant",
      "remplacement_module_talon",
      "remplacement_insert_caoutchouc",
    ],
  },
  couture: {
    color: "bleu",
    actionLabel: "Changement de couture trepointe",
    allowedRepairIds: ["reglage_systeme_modulaire"],
  },
  empeigne: {
    color: "rose",
    actionLabel: "Cirage et nettoyage",
    allowedRepairIds: ["nettoyage_technique"],
  },
};

const HIGH_HEEL_PART_GUIDE = {
  talon: {
    color: "jaune",
    actionLabel: "Changement de talon en caoutchouc",
    allowedRepairIds: [
      "remplacement_bonbout_aiguille",
      "renfort_talon",
      "reparation_talon_casse",
    ],
  },
  semelle: {
    color: "blanc",
    actionLabel: "Changement semelle",
    allowedRepairIds: ["pose_patin_rouge", "recoloration_semelle"],
  },
  couture: {
    color: "rose",
    actionLabel: "Cirage et nettoyage",
    allowedRepairIds: ["cirage_nettoyage_talons_hauts"],
  },
  empeigne: {
    color: "rose",
    actionLabel: "Cirage et nettoyage",
    allowedRepairIds: ["cirage_nettoyage_talons_hauts"],
  },
};

const SANDAL_PART_GUIDE = {
  semelle: {
    color: "rouge",
    actionLabel: "Collage de semelle",
    allowedRepairIds: ["recollage_semelle"],
  },
};

const SEVERITY_LABELS = {
  neutral: "Aucun",
  good: "Bon",
  medium: "Moyen",
  critical: "Critique",
};

const ASSET_BASE = "../assets/img/sora";

const INTERACTIVE_LAYOUTS = {
  trepointe_plate: {
    imageFrame: {
      x: 0,
      y: 0,
      width: 188.76117,
      height: 127.00133,
      preserveAspectRatio: "xMidYMid meet",
    },
    parts: {
      semelle: "M 4 97 C 18 104 37 109 56 111 C 70 113 84 114 96 114 C 97 117 97 121 95 124 C 73 124 48 121 26 115 C 14 111 6 104 4 97 Z",
      talon: "M 121 108 L 151 107 L 149 119 L 120 120 Z",
      empeigne: "M 66 79 C 84 65 108 57 136 58 C 153 59 165 66 168 81 L 164 102 C 142 100 118 100 96 103 C 82 105 71 102 66 94 Z",
      couture: "M 8 100 C 26 108 52 109 79 108 C 101 107 124 105 146 103",
    },
  },
  trepointe_modulaire: {
    imageFrame: {
      x: 0,
      y: 0,
      width: 188.76117,
      height: 127.00133,
      preserveAspectRatio: "xMidYMid meet",
    },
    parts: {
      semelle: "M 10 96 C 34 101 73 104 114 104 C 145 103 170 100 183 96 L 182 106 C 160 111 126 114 91 114 C 52 113 24 109 10 103 Z",
      talon: "M 147 92 L 182 91 L 181 108 L 146 110 Z",
      empeigne: "M 11 48 C 27 34 53 25 80 23 C 111 21 145 30 174 46 L 177 78 C 153 87 120 91 83 91 C 51 91 28 86 15 78 Z",
      couture: "M 16 88 C 52 96 98 96 154 91",
    },
  },
  talons_hauts: {
    imageFrame: {
      x: 0,
      y: 0,
      width: 188.76117,
      height: 127.00133,
      preserveAspectRatio: "xMidYMid meet",
    },
    parts: {
      semelle: "M 18 94 C 38 99 66 101 98 100 C 126 99 148 97 164 94 L 162 103 C 139 108 106 110 72 109 C 46 108 27 105 19 100 Z",
      talon: "M 144 97 L 158 96 L 157 104 L 143 105 Z",
      empeigne: "M 45 78 C 61 60 84 34 111 18 C 124 10 138 8 151 14 C 160 19 167 30 168 43 C 168 50 166 56 164 61 C 151 67 138 77 125 91 C 113 103 105 112 101 118 C 84 119 65 116 50 109 C 45 97 43 88 45 78 Z",
      couture: "M 47 78 C 68 55 93 33 122 18 C 133 13 144 13 153 18",
    },
  },
  sandale: {
    imageFrame: {
      x: -3,
      y: -2,
      width: 196,
      height: 132,
      preserveAspectRatio: "xMidYMid meet",
    },
    parts: {
      semelle: "M 10 98 C 34 103 74 106 116 105 C 149 104 173 101 184 97 L 183 108 C 160 113 126 116 91 116 C 52 115 24 111 10 105 Z",
      talon: "M 148 94 L 186 92 L 184 109 L 146 111 Z",
      empeigne: "M 17 52 C 42 45 74 42 110 43 C 140 44 164 50 178 60 L 175 86 C 152 94 118 98 84 98 C 52 97 30 92 17 83 Z",
      couture: "M 14 89 C 44 95 88 95 164 86",
    },
  },
};

// Catalogue metier: types de chaussures servis par l'atelier.
export const SHOE_TYPES = {
  trepointe_plate: {
    id: "trepointe_plate",
    name: "Trepointe plate",
    icon: "Chaussure_icone.svg",
    iconPath: `${ASSET_BASE}/Chaussure_icone.svg`,
    construction: "Montage Goodyear welt traditionnel",
    problemPool: [
      "usure_semelle_cuir",
      "decollement_trepointe",
      "bonbout_use",
      "couture_welt_ouverte",
      "cuir_deshydrate",
      "usure_semelle_hiver",
    ],
  },
  trepointe_modulaire: {
    id: "trepointe_modulaire",
    name: "Trepointe modulaire",
    icon: "Chaussure_modulaire.svg",
    iconPath: `${ASSET_BASE}/Chaussure_modulaire.svg`,
    construction: "Montage modulaire a semelles interchangeables",
    problemPool: [
      "module_avant_use",
      "module_talon_use",
      "jeu_systeme_modulaire",
      "insert_caoutchouc_arrache",
      "encrassement_technique",
      "interface_desalignee",
    ],
  },
  talons_hauts: {
    id: "talons_hauts",
    name: "Talons hauts",
    icon: "louboutin.png",
    iconPath: `${ASSET_BASE}/louboutin.png`,
    fallbackIconPath: `${ASSET_BASE}/loubloutin.png`,
    construction: "Talon aiguille avec semelle fine de ville",
    problemPool: [
      "bonbout_aiguille_use",
      "talon_fissure",
      "patin_rouge_decolle",
      "semelle_rouge_fanee",
      "instabilite_talon",
      "cuir_talon_haut_terni",
    ],
  },
  sandale: {
    id: "sandale",
    name: "Sandale",
    icon: "birkenstock.png",
    iconPath: `${ASSET_BASE}/birkenstock.png`,
    construction: "Sandale anatomique liege et cuir",
    problemPool: [
      "decollement_semelle_sandale",
    ],
  },
};

// Catalogue metier: forfaits reparation haut de gamme (prix en CAD simules).
export const REPAIRS = {
  ressemelage_cuir: {
    id: "ressemelage_cuir",
    name: "Ressemelage cuir",
    shoeTypes: ["trepointe_plate"],
    parts: ["semelle"],
    difficulty: 4,
    timeMinutes: 130,
    reputationImpact: 8,
    price: 340,
    stockCost: { semelles: 1, fil: 1, cuir: 1, colle: 1 },
  },
  ressemelage_dainite: {
    id: "ressemelage_dainite",
    name: "Ressemelage Dainite",
    shoeTypes: ["trepointe_plate"],
    parts: ["semelle"],
    difficulty: 4,
    timeMinutes: 120,
    reputationImpact: 7,
    price: 360,
    stockCost: { semelles: 1, fil: 1, cuir: 0, colle: 1 },
  },
  ressemelage_vibram: {
    id: "ressemelage_vibram",
    name: "Ressemelage Vibram",
    shoeTypes: ["trepointe_plate"],
    parts: ["semelle"],
    difficulty: 5,
    timeMinutes: 140,
    reputationImpact: 9,
    price: 395,
    stockCost: { semelles: 1, fil: 1, cuir: 0, colle: 1 },
  },
  remplacement_bonbout: {
    id: "remplacement_bonbout",
    name: "Remplacement bonbout",
    shoeTypes: ["trepointe_plate"],
    parts: ["talon"],
    difficulty: 2,
    timeMinutes: 45,
    reputationImpact: 4,
    price: 85,
    stockCost: { semelles: 0, fil: 0, cuir: 0, colle: 1 },
  },
  couture_trepointe: {
    id: "couture_trepointe",
    name: "Couture trepointe",
    shoeTypes: ["trepointe_plate"],
    parts: ["couture"],
    difficulty: 5,
    timeMinutes: 150,
    reputationImpact: 10,
    price: 420,
    stockCost: { semelles: 0, fil: 2, cuir: 1, colle: 0 },
  },
  recoloration_cuir: {
    id: "recoloration_cuir",
    name: "Recoloration cuir",
    shoeTypes: ["trepointe_plate"],
    parts: ["empeigne"],
    difficulty: 3,
    timeMinutes: 70,
    reputationImpact: 5,
    price: 165,
    stockCost: { semelles: 0, fil: 0, cuir: 1, colle: 0 },
  },
  nourrissage_cirage_premium: {
    id: "nourrissage_cirage_premium",
    name: "Nourrissage + cirage premium",
    shoeTypes: ["trepointe_plate"],
    parts: ["empeigne"],
    difficulty: 2,
    timeMinutes: 35,
    reputationImpact: 3,
    price: 75,
    stockCost: { semelles: 0, fil: 0, cuir: 1, colle: 0 },
  },
  remplacement_module_avant: {
    id: "remplacement_module_avant",
    name: "Changement semelle modulaire (avant)",
    shoeTypes: ["trepointe_modulaire"],
    parts: ["semelle"],
    difficulty: 3,
    timeMinutes: 55,
    reputationImpact: 5,
    price: 155,
    stockCost: { semelles: 1, fil: 0, cuir: 0, colle: 0 },
  },
  remplacement_module_talon: {
    id: "remplacement_module_talon",
    name: "Changement semelle modulaire (talon)",
    shoeTypes: ["trepointe_modulaire"],
    parts: ["semelle"],
    difficulty: 3,
    timeMinutes: 50,
    reputationImpact: 5,
    price: 145,
    stockCost: { semelles: 1, fil: 0, cuir: 0, colle: 0 },
  },
  reglage_systeme_modulaire: {
    id: "reglage_systeme_modulaire",
    name: "Changement couture trepointe",
    shoeTypes: ["trepointe_modulaire"],
    parts: ["couture"],
    difficulty: 4,
    timeMinutes: 65,
    reputationImpact: 7,
    price: 190,
    stockCost: { semelles: 0, fil: 1, cuir: 0, colle: 0 },
  },
  remplacement_insert_caoutchouc: {
    id: "remplacement_insert_caoutchouc",
    name: "Remplacement insert caoutchouc",
    shoeTypes: ["trepointe_modulaire"],
    parts: ["semelle"],
    difficulty: 3,
    timeMinutes: 45,
    reputationImpact: 4,
    price: 120,
    stockCost: { semelles: 1, fil: 0, cuir: 0, colle: 0 },
  },
  nettoyage_technique: {
    id: "nettoyage_technique",
    name: "Cirage et nettoyage",
    shoeTypes: ["trepointe_modulaire"],
    parts: ["empeigne"],
    difficulty: 2,
    timeMinutes: 30,
    reputationImpact: 3,
    price: 68,
    stockCost: { semelles: 0, fil: 0, cuir: 1, colle: 0 },
  },
  remplacement_bonbout_aiguille: {
    id: "remplacement_bonbout_aiguille",
    name: "Changement talon caoutchouc",
    shoeTypes: ["talons_hauts"],
    parts: ["talon"],
    difficulty: 3,
    timeMinutes: 35,
    reputationImpact: 5,
    price: 98,
    stockCost: { semelles: 0, fil: 0, cuir: 0, colle: 1 },
  },
  renfort_talon: {
    id: "renfort_talon",
    name: "Renfort talon",
    shoeTypes: ["talons_hauts"],
    parts: ["talon"],
    difficulty: 4,
    timeMinutes: 60,
    reputationImpact: 6,
    price: 178,
    stockCost: { semelles: 0, fil: 1, cuir: 1, colle: 1 },
  },
  pose_patin_rouge: {
    id: "pose_patin_rouge",
    name: "Changement semelle",
    shoeTypes: ["talons_hauts"],
    parts: ["semelle"],
    difficulty: 3,
    timeMinutes: 45,
    reputationImpact: 5,
    price: 130,
    stockCost: { semelles: 1, fil: 0, cuir: 0, colle: 1 },
  },
  recoloration_semelle: {
    id: "recoloration_semelle",
    name: "Recoloration semelle",
    shoeTypes: ["talons_hauts"],
    parts: ["semelle"],
    difficulty: 3,
    timeMinutes: 40,
    reputationImpact: 4,
    price: 115,
    stockCost: { semelles: 0, fil: 0, cuir: 1, colle: 0 },
  },
  reparation_talon_casse: {
    id: "reparation_talon_casse",
    name: "Reparation talon casse",
    shoeTypes: ["talons_hauts"],
    parts: ["talon"],
    difficulty: 5,
    timeMinutes: 85,
    reputationImpact: 9,
    price: 240,
    stockCost: { semelles: 0, fil: 1, cuir: 1, colle: 1 },
  },
  cirage_nettoyage_talons_hauts: {
    id: "cirage_nettoyage_talons_hauts",
    name: "Cirage et nettoyage",
    shoeTypes: ["talons_hauts"],
    parts: ["empeigne"],
    difficulty: 2,
    timeMinutes: 28,
    reputationImpact: 3,
    price: 70,
    stockCost: { semelles: 0, fil: 0, cuir: 1, colle: 0 },
  },
  remplacement_semelle_liege: {
    id: "remplacement_semelle_liege",
    name: "Changement de semelle",
    shoeTypes: ["sandale"],
    parts: ["semelle"],
    difficulty: 4,
    timeMinutes: 90,
    reputationImpact: 7,
    price: 210,
    stockCost: { semelles: 1, fil: 0, cuir: 1, colle: 1 },
  },
  changement_bride: {
    id: "changement_bride",
    name: "Changement bride",
    shoeTypes: ["sandale"],
    parts: ["empeigne"],
    difficulty: 3,
    timeMinutes: 55,
    reputationImpact: 5,
    price: 125,
    stockCost: { semelles: 0, fil: 1, cuir: 1, colle: 0 },
  },
  recollage_semelle: {
    id: "recollage_semelle",
    name: "Recollage semelle",
    shoeTypes: ["sandale"],
    parts: ["semelle", "talon"],
    difficulty: 2,
    timeMinutes: 35,
    reputationImpact: 3,
    price: 78,
    stockCost: { semelles: 0, fil: 0, cuir: 0, colle: 1 },
  },
  refection_lit_plantaire: {
    id: "refection_lit_plantaire",
    name: "Changement de lit de pied",
    shoeTypes: ["sandale"],
    parts: ["empeigne"],
    difficulty: 3,
    timeMinutes: 70,
    reputationImpact: 6,
    price: 145,
    stockCost: { semelles: 1, fil: 0, cuir: 1, colle: 1 },
  },
  nettoyage_traitement_cuir: {
    id: "nettoyage_traitement_cuir",
    name: "Nettoyage + traitement cuir",
    shoeTypes: ["sandale"],
    parts: ["empeigne"],
    difficulty: 2,
    timeMinutes: 30,
    reputationImpact: 3,
    price: 65,
    stockCost: { semelles: 0, fil: 0, cuir: 1, colle: 0 },
  },
};

const PROBLEM_LIBRARY = {
  usure_semelle_cuir: {
    id: "usure_semelle_cuir",
    label: "Semelle cuir usee",
    part: "semelle",
    severity: "medium",
    idealRepairId: "ressemelage_cuir",
    acceptedRepairs: ["ressemelage_cuir", "ressemelage_dainite", "ressemelage_vibram"],
  },
  decollement_trepointe: {
    id: "decollement_trepointe",
    label: "Decollement de trepointe",
    part: "couture",
    severity: "critical",
    idealRepairId: "couture_trepointe",
    acceptedRepairs: ["couture_trepointe"],
  },
  bonbout_use: {
    id: "bonbout_use",
    label: "Bonbout use",
    part: "talon",
    severity: "medium",
    idealRepairId: "remplacement_bonbout",
    acceptedRepairs: ["remplacement_bonbout"],
  },
  couture_welt_ouverte: {
    id: "couture_welt_ouverte",
    label: "Couture welt ouverte",
    part: "couture",
    severity: "critical",
    idealRepairId: "couture_trepointe",
    acceptedRepairs: ["couture_trepointe"],
  },
  cuir_deshydrate: {
    id: "cuir_deshydrate",
    label: "Cuir deshydrate",
    part: "empeigne",
    severity: "medium",
    idealRepairId: "nourrissage_cirage_premium",
    acceptedRepairs: ["nourrissage_cirage_premium", "recoloration_cuir"],
  },
  usure_semelle_hiver: {
    id: "usure_semelle_hiver",
    label: "Semelle glissante en conditions humides",
    part: "semelle",
    severity: "critical",
    idealRepairId: "ressemelage_vibram",
    acceptedRepairs: ["ressemelage_vibram", "ressemelage_dainite"],
  },
  module_avant_use: {
    id: "module_avant_use",
    label: "Module avant use",
    part: "semelle",
    severity: "medium",
    idealRepairId: "remplacement_module_avant",
    acceptedRepairs: ["remplacement_module_avant"],
  },
  module_talon_use: {
    id: "module_talon_use",
    label: "Module talon use",
    part: "semelle",
    severity: "medium",
    idealRepairId: "remplacement_module_talon",
    acceptedRepairs: ["remplacement_module_talon"],
  },
  jeu_systeme_modulaire: {
    id: "jeu_systeme_modulaire",
    label: "Jeu dans le systeme modulaire",
    part: "couture",
    severity: "critical",
    idealRepairId: "reglage_systeme_modulaire",
    acceptedRepairs: ["reglage_systeme_modulaire"],
  },
  insert_caoutchouc_arrache: {
    id: "insert_caoutchouc_arrache",
    label: "Insert caoutchouc arrache",
    part: "semelle",
    severity: "medium",
    idealRepairId: "remplacement_insert_caoutchouc",
    acceptedRepairs: ["remplacement_insert_caoutchouc", "remplacement_module_avant"],
  },
  encrassement_technique: {
    id: "encrassement_technique",
    label: "Encrassement technique",
    part: "empeigne",
    severity: "good",
    idealRepairId: "nettoyage_technique",
    acceptedRepairs: ["nettoyage_technique"],
  },
  interface_desalignee: {
    id: "interface_desalignee",
    label: "Interface modulaire desalignee",
    part: "couture",
    severity: "medium",
    idealRepairId: "reglage_systeme_modulaire",
    acceptedRepairs: ["reglage_systeme_modulaire"],
  },
  bonbout_aiguille_use: {
    id: "bonbout_aiguille_use",
    label: "Bonbout aiguille use",
    part: "talon",
    severity: "critical",
    idealRepairId: "remplacement_bonbout_aiguille",
    acceptedRepairs: ["remplacement_bonbout_aiguille"],
  },
  talon_fissure: {
    id: "talon_fissure",
    label: "Talon fissure",
    part: "talon",
    severity: "critical",
    idealRepairId: "reparation_talon_casse",
    acceptedRepairs: ["reparation_talon_casse", "renfort_talon"],
  },
  patin_rouge_decolle: {
    id: "patin_rouge_decolle",
    label: "Patin rouge decolle",
    part: "semelle",
    severity: "medium",
    idealRepairId: "pose_patin_rouge",
    acceptedRepairs: ["pose_patin_rouge"],
  },
  semelle_rouge_fanee: {
    id: "semelle_rouge_fanee",
    label: "Semelle rouge fanee",
    part: "semelle",
    severity: "good",
    idealRepairId: "recoloration_semelle",
    acceptedRepairs: ["recoloration_semelle"],
  },
  instabilite_talon: {
    id: "instabilite_talon",
    label: "Instabilite du bloc talon",
    part: "talon",
    severity: "medium",
    idealRepairId: "renfort_talon",
    acceptedRepairs: ["renfort_talon"],
  },
  cuir_talon_haut_terni: {
    id: "cuir_talon_haut_terni",
    label: "Cuir terni et traces de surface",
    part: "empeigne",
    severity: "good",
    idealRepairId: "cirage_nettoyage_talons_hauts",
    acceptedRepairs: ["cirage_nettoyage_talons_hauts"],
  },
  liege_tasse: {
    id: "liege_tasse",
    label: "Semelle liege tassee",
    part: "semelle",
    severity: "critical",
    idealRepairId: "remplacement_semelle_liege",
    acceptedRepairs: ["remplacement_semelle_liege", "refection_lit_plantaire"],
  },
  bride_cassee: {
    id: "bride_cassee",
    label: "Bride cassee",
    part: "empeigne",
    severity: "critical",
    idealRepairId: "changement_bride",
    acceptedRepairs: ["changement_bride"],
  },
  decollement_semelle_sandale: {
    id: "decollement_semelle_sandale",
    label: "Decollement semelle",
    part: "semelle",
    severity: "medium",
    idealRepairId: "recollage_semelle",
    acceptedRepairs: ["recollage_semelle"],
  },
  lit_plantaire_affaisse: {
    id: "lit_plantaire_affaisse",
    label: "Lit plantaire affaisse",
    part: "empeigne",
    severity: "medium",
    idealRepairId: "refection_lit_plantaire",
    acceptedRepairs: ["refection_lit_plantaire"],
  },
  cuir_bride_sec: {
    id: "cuir_bride_sec",
    label: "Bride cuir dessechee",
    part: "empeigne",
    severity: "good",
    idealRepairId: "nettoyage_traitement_cuir",
    acceptedRepairs: ["nettoyage_traitement_cuir"],
  },
};

const DEFAULT_STOCK = {
  semelles: 7,
  fil: 12,
  cuir: 10,
  colle: 9,
};

const MINI_GAME_BY_PART = {
  couture: {
    title: "Mini-jeu: couture trepointe",
    instruction: "Cliquez chaque point de couture dans l'ordre.",
    trackPath: "M 22 86 C 86 58 168 50 298 72",
    ordered: true,
    basePoints: 5,
    maxMisses: 2,
    radius: 6.5,
  },
  semelle: {
    title: "Mini-jeu: collage semelle",
    instruction: "Suivez la ligne de semelle en validant les points.",
    trackPath: "M 18 88 C 90 102 182 102 304 86",
    ordered: true,
    basePoints: 4,
    maxMisses: 2,
    radius: 7.5,
  },
  talon: {
    title: "Mini-jeu: fixation talon",
    instruction: "Fixez les points d'ancrage du talon.",
    trackPath: "M 228 34 C 253 38 266 56 260 82 C 253 100 232 103 212 94",
    ordered: false,
    basePoints: 4,
    maxMisses: 3,
    radius: 8,
  },
  empeigne: {
    title: "Mini-jeu: soin empeigne",
    instruction: "Traitez les zones de l'empeigne avec precision.",
    trackPath: "M 34 92 C 102 34 188 30 292 74",
    ordered: false,
    basePoints: 4,
    maxMisses: 3,
    radius: 8,
  },
};

function createMiniGameState() {
  return {
    active: false,
    repairId: null,
    repairName: "",
    part: null,
    title: "Mini-jeu",
    baseInstruction: "",
    trackPath: "",
    ordered: false,
    maxMisses: 0,
    misses: 0,
    hits: 0,
    nextIndex: 0,
    targets: [],
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pickRandom(items, randomFn = Math.random) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  const index = Math.floor(randomFn() * items.length);
  return items[index];
}

function sampleUnique(items, count, randomFn = Math.random) {
  const clone = [...items];
  const picked = [];
  const target = Math.min(clone.length, Math.max(0, count));

  for (let i = 0; i < target; i += 1) {
    const index = Math.floor(randomFn() * clone.length);
    picked.push(clone.splice(index, 1)[0]);
  }

  return picked;
}

function sanitize(text) {
  return String(text || "").replace(/[<>]/g, "");
}

function formatNow() {
  return new Date().toLocaleTimeString("fr-CA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(value) {
  return `${Math.round(value)} $`;
}

function toColorKey(colorName) {
  const safe = String(colorName || "").toLowerCase().trim();
  const allowed = new Set(["jaune", "bleu", "rose", "rouge", "blanc"]);
  return allowed.has(safe) ? safe : "gold";
}

function callLegacyHook(name, payload) {
  const fn = window[name];
  if (typeof fn === "function") {
    try {
      fn(payload);
    } catch (_error) {
      // Les hooks anciens ne doivent jamais casser la nouvelle UI.
    }
  }
}

function getSeverityRank(severity) {
  if (severity === "critical") return 3;
  if (severity === "medium") return 2;
  if (severity === "good") return 1;
  return 0;
}

class Game {
  constructor(dom) {
    this.ui = dom;

    this.player = new Player({ score: 0, reputation: 50, xp: 0, streak: 0 });

    this.state = {
      day: 1,
      level: getLevelByXp(0),
      score: 0,
      reputation: 50,
      xp: 0,
      progressPercent: 0,
      selectedPart: null,
      selectedSeverity: "neutral",
      diagnosticText: "Selectionnez une partie de la chaussure pour analyser son etat.",
      inventory: { ...DEFAULT_STOCK },
      currentClient: null,
      history: [],
      transitionLock: false,
      lastShoeTypeId: null,
      miniGame: createMiniGameState(),
    };

    this.clients = [];
    this.timerId = null;
  }

  async init() {
    this.bindEvents();
    this.installHooksForTesting();
    await this.loadClientProfiles();
    this.generateClient();
    this.render();
  }

  async loadClientProfiles() {
    try {
      const response = await fetch("./data/clients.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const payload = await response.json();
      this.clients = Array.isArray(payload?.clients) ? payload.clients : [];
    } catch (_error) {
      this.clients = [];
      this.appendHistory("Mode local: profils clients indisponibles, generation de secours active.");
    }
  }

  getPersonalityMultiplier(exigence) {
    const value = String(exigence || "moyenne").toLowerCase();

    if (value === "elevee") {
      return {
        label: "Elevee",
        scoreMultiplier: 1.18,
        failureMultiplier: 1.25,
      };
    }

    if (value === "faible") {
      return {
        label: "Faible",
        scoreMultiplier: 0.95,
        failureMultiplier: 0.9,
      };
    }

    return {
      label: "Moyenne",
      scoreMultiplier: 1.05,
      failureMultiplier: 1.0,
    };
  }

  syncPlayerState() {
    const snapshot = this.player.getState();
    const level = getLevelByXp(snapshot.xp);

    this.state.score = snapshot.score;
    this.state.reputation = snapshot.reputation;
    this.state.xp = snapshot.xp;
    this.state.level = level;

    if (level.xpToNext) {
      this.state.progressPercent = clamp(
        Math.round(((snapshot.xp - level.minXp) / (level.xpToNext - level.minXp)) * 100),
        0,
        100
      );
    } else {
      this.state.progressPercent = 100;
    }
  }

  getEffectivePart(part) {
    const shoeTypeId = this.state.currentClient?.shoeType?.id;

    if (shoeTypeId === "trepointe_modulaire" && part === "talon") {
      return "semelle";
    }
    if (shoeTypeId === "talons_hauts" && part === "couture") {
      return "empeigne";
    }
    if (shoeTypeId === "sandale" && part === "talon") {
      return "semelle";
    }
    if (shoeTypeId === "sandale" && (part === "couture" || part === "empeigne")) {
      return "semelle";
    }

    return part;
  }

  getPartGuide(part) {
    const shoeTypeId = this.state.currentClient?.shoeType?.id;

    if (shoeTypeId === "trepointe_modulaire") {
      return MODULAR_PART_GUIDE[part] || null;
    }
    if (shoeTypeId === "talons_hauts") {
      return HIGH_HEEL_PART_GUIDE[part] || null;
    }
    if (shoeTypeId === "sandale") {
      return SANDAL_PART_GUIDE[part] || null;
    }

    return null;
  }

  getPartLabel(part) {
    const guide = this.getPartGuide(part);
    if (guide) {
      return `${PART_LABELS[part]} (${guide.color})`;
    }

    return PART_LABELS[part] || part;
  }

  getInteractivePartNode(part) {
    return this.ui.parts.find((node) => node.dataset.part === part) || null;
  }

  applyInteractiveLayout(shoeTypeId) {
    const layout = INTERACTIVE_LAYOUTS[shoeTypeId] || INTERACTIVE_LAYOUTS.trepointe_plate;
    const imageFrame = layout.imageFrame;
    const parts = layout.parts || {};

    if (this.ui.shoeTypeImage && imageFrame) {
      this.ui.shoeTypeImage.setAttribute("x", String(imageFrame.x));
      this.ui.shoeTypeImage.setAttribute("y", String(imageFrame.y));
      this.ui.shoeTypeImage.setAttribute("width", String(imageFrame.width));
      this.ui.shoeTypeImage.setAttribute("height", String(imageFrame.height));
      this.ui.shoeTypeImage.setAttribute(
        "preserveAspectRatio",
        imageFrame.preserveAspectRatio || "xMidYMid meet"
      );
    }

    ["semelle", "talon", "empeigne"].forEach((part) => {
      const d = parts[part];
      const node = this.getInteractivePartNode(part);
      const shape = node?.querySelector(".part-shape");

      if (d && shape) {
        shape.setAttribute("d", d);
      }
    });

    const coutureD = parts.couture;
    const coutureNode = this.getInteractivePartNode("couture");
    const coutureHitline = coutureNode?.querySelector(".part-hitline");
    const coutureShape = coutureNode?.querySelector(".part-shape");

    if (coutureD && coutureHitline && coutureShape) {
      coutureHitline.setAttribute("d", coutureD);
      coutureShape.setAttribute("d", coutureD);
    }

    if (this.ui.sourceStitch) {
      this.ui.sourceStitch.setAttribute(
        "d",
        parts.couture || INTERACTIVE_LAYOUTS.trepointe_plate.parts.couture
      );
    }
  }

  applyPartVisibility(shoeTypeId) {
    let visibleParts = new Set(["semelle", "talon", "empeigne", "couture"]);

    if (shoeTypeId === "sandale") {
      visibleParts = new Set(["semelle"]);
    }

    if (shoeTypeId === "trepointe_modulaire") {
      // Le modulaire ne presente pas de talon separe dans cette simulation.
      visibleParts = new Set(["semelle", "empeigne", "couture"]);
    }

    this.ui.parts.forEach((partNode) => {
      const part = partNode.dataset.part;
      const isVisible = visibleParts.has(part);

      partNode.style.display = isVisible ? "" : "none";
      partNode.setAttribute("aria-hidden", isVisible ? "false" : "true");
      partNode.setAttribute("tabindex", isVisible ? "0" : "-1");
    });
  }

  samplePointsOnPath(pathData, count) {
    if (!pathData || count <= 0 || !this.ui.miniGameSvg) {
      return [];
    }

    const ns = "http://www.w3.org/2000/svg";
    const probePath = document.createElementNS(ns, "path");
    probePath.setAttribute("d", pathData);
    probePath.setAttribute("fill", "none");
    probePath.setAttribute("stroke", "none");

    const mountTarget = this.ui.miniGameTargets || this.ui.miniGameSvg;
    mountTarget.appendChild(probePath);

    const points = [];
    try {
      const total = probePath.getTotalLength();
      for (let index = 0; index < count; index += 1) {
        const ratio = count === 1 ? 0.5 : index / (count - 1);
        const point = probePath.getPointAtLength(total * ratio);
        points.push({
          x: Number(point.x.toFixed(2)),
          y: Number(point.y.toFixed(2)),
        });
      }
    } catch (_error) {
      for (let index = 0; index < count; index += 1) {
        points.push({
          x: 24 + index * 24,
          y: 60,
        });
      }
    } finally {
      probePath.remove();
    }

    return points;
  }

  buildMiniGameFromRepair(repair) {
    const part = this.state.selectedPart || repair.parts[0] || "semelle";
    const profile = MINI_GAME_BY_PART[part] || MINI_GAME_BY_PART.semelle;
    const extraPoints = clamp(repair.difficulty - 2, 0, 3);
    const pointCount = profile.basePoints + extraPoints;
    const sampledPoints = this.samplePointsOnPath(profile.trackPath, pointCount);
    const targets = sampledPoints.map((point, index) => ({
      id: index,
      x: point.x,
      y: point.y,
      r: profile.radius,
      hit: false,
    }));

    return {
      repairId: repair.id,
      repairName: repair.name,
      part,
      title: profile.title,
      baseInstruction: profile.instruction,
      trackPath: profile.trackPath,
      ordered: profile.ordered,
      maxMisses: profile.maxMisses,
      misses: 0,
      hits: 0,
      nextIndex: 0,
      targets,
      active: targets.length > 0,
    };
  }

  getMiniGameInstructionText(miniGame) {
    if (!miniGame?.active) {
      return "";
    }

    const attempts = miniGame.hits + miniGame.misses;
    const precision = attempts > 0 ? Math.round((miniGame.hits / attempts) * 100) : 100;
    const orderText = miniGame.ordered ? " Ordre obligatoire." : "";
    const remainingErrors = Math.max(0, miniGame.maxMisses - miniGame.misses);

    return (
      `${miniGame.baseInstruction}${orderText}`
      + ` Erreurs restantes: ${remainingErrors}.`
      + ` Precision: ${precision}%.`
    );
  }

  startRepairMiniGame(repairId) {
    if (this.state.transitionLock || this.state.miniGame.active) {
      return false;
    }

    const client = this.state.currentClient;
    const selectedPart = this.state.selectedPart;
    const repair = REPAIRS[repairId];

    if (!client || !selectedPart || !repair) {
      return false;
    }

    if (!repair.shoeTypes.includes(client.shoeType.id)) {
      return false;
    }

    if (!repair.parts.includes(selectedPart)) {
      return false;
    }

    if (!this.hasStock(repair.stockCost)) {
      return false;
    }

    const miniGame = this.buildMiniGameFromRepair(repair);
    if (!miniGame.active) {
      return false;
    }

    this.state.miniGame = miniGame;
    this.state.selectedSeverity = "medium";
    this.state.diagnosticText =
      `Mini-jeu lance: ${repair.name}.\n`
      + this.getMiniGameInstructionText(miniGame);
    this.appendHistory(`Mini-jeu lance: ${repair.name} (${this.getPartLabel(selectedPart)}).`);
    this.render();
    return true;
  }

  cancelMiniGame() {
    if (!this.state.miniGame.active) {
      return;
    }

    const repairName = this.state.miniGame.repairName;
    this.state.miniGame = createMiniGameState();
    this.state.selectedSeverity = "neutral";
    this.state.diagnosticText =
      `Mini-jeu annule pour ${repairName}.\n`
      + "Relancez une action pour recommencer la reparation.";
    this.appendHistory(`Mini-jeu annule: ${repairName}.`);
    this.render();
  }

  failMiniGame(reason) {
    const repairName = this.state.miniGame.repairName;
    this.state.miniGame = createMiniGameState();
    this.state.selectedSeverity = "critical";
    this.state.diagnosticText =
      `Mini-jeu echoue pour ${repairName}.\n`
      + `${reason} Relancez l'action pour reessayer.`;
    this.appendHistory(`Mini-jeu echoue: ${repairName} (${reason}).`);
    this.render();
  }

  completeMiniGame() {
    const miniGame = this.state.miniGame;
    const repair = REPAIRS[miniGame.repairId];

    if (!miniGame.active || !repair) {
      return;
    }

    const attempts = miniGame.hits + miniGame.misses;
    const precision = attempts > 0 ? miniGame.hits / attempts : 1;
    const perfectRun = miniGame.misses === 0;
    const scoreBonus = Math.max(
      0,
      Math.round(repair.difficulty * 6 * precision) + (perfectRun ? 12 : 0)
    );
    const reputationBonus = perfectRun ? Math.max(1, Math.ceil(repair.difficulty / 2)) : 0;

    this.appendHistory(
      `Mini-jeu valide: ${repair.name} (precision ${Math.round(precision * 100)}%).`
    );

    this.state.miniGame = createMiniGameState();
    this.applyRepair(repair.id, {
      fromMiniGame: true,
      miniGameResult: {
        precision,
        perfectRun,
        scoreBonus,
        reputationBonus,
      },
    });
  }

  handleMiniTargetInput(targetIndex) {
    const miniGame = this.state.miniGame;
    if (!miniGame.active) {
      return;
    }

    const target = miniGame.targets[targetIndex];
    if (!target || target.hit) {
      return;
    }

    if (miniGame.ordered && targetIndex !== miniGame.nextIndex) {
      miniGame.misses += 1;
      if (miniGame.misses > miniGame.maxMisses) {
        this.failMiniGame("Trop d'erreurs de precision.");
        return;
      }

      this.state.selectedSeverity = "medium";
      this.state.diagnosticText =
        `Mini-jeu ${miniGame.repairName}: point hors ordre.\n`
        + this.getMiniGameInstructionText(miniGame);
      this.render();
      return;
    }

    target.hit = true;
    miniGame.hits += 1;
    if (miniGame.ordered) {
      miniGame.nextIndex += 1;
    }

    if (miniGame.hits >= miniGame.targets.length) {
      this.completeMiniGame();
      return;
    }

    this.state.selectedSeverity = "good";
    this.state.diagnosticText =
      `Mini-jeu ${miniGame.repairName}: ${miniGame.hits}/${miniGame.targets.length} points valides.\n`
      + this.getMiniGameInstructionText(miniGame);
    this.render();
  }

  startTimer() {
    this.stopTimer();

    if (!this.state.level.timerEnabled || !this.state.currentClient) {
      return;
    }

    this.timerId = window.setInterval(() => {
      if (!this.state.currentClient || this.state.transitionLock) {
        return;
      }

      this.state.currentClient.remainingSeconds = Math.max(
        0,
        this.state.currentClient.remainingSeconds - 1
      );

      if (this.state.currentClient.remainingSeconds <= 0) {
        this.handleTimeout();
        return;
      }

      this.renderDiagnostic();
    }, 1000);
  }

  stopTimer() {
    if (this.timerId) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  setShoeVisual(shoeType) {
    if (!this.ui.shoeTypeImage || !this.ui.shoeBaseShape) {
      return;
    }
    if (this.ui.svgShell) {
      this.ui.svgShell.setAttribute("data-shoe-type", shoeType.id);
    }
    this.applyInteractiveLayout(shoeType.id);
    this.applyPartVisibility(shoeType.id);

    this.ui.shoeTypeImage.style.pointerEvents = "none";
    this.ui.shoeTypeImage.dataset.fallbackTried = "false";
    this.ui.shoeTypeImage.onerror = () => {
      if (shoeType.fallbackIconPath && this.ui.shoeTypeImage.dataset.fallbackTried !== "true") {
        this.ui.shoeTypeImage.dataset.fallbackTried = "true";
        this.ui.shoeTypeImage.setAttribute("href", shoeType.fallbackIconPath);
        this.ui.shoeTypeImage.setAttributeNS(
          "http://www.w3.org/1999/xlink",
          "href",
          shoeType.fallbackIconPath
        );
      }
    };
    this.ui.shoeTypeImage.setAttribute("href", shoeType.iconPath);
    this.ui.shoeTypeImage.setAttributeNS("http://www.w3.org/1999/xlink", "href", shoeType.iconPath);

    const useSourceShape = shoeType.id === "trepointe_plate";
    this.ui.shoeBaseShape.style.display = useSourceShape ? "" : "none";
    if (this.ui.sourceStitch) {
      this.ui.sourceStitch.style.display = useSourceShape ? "" : "none";
    }
    // Important: ne pas remettre a "" car la classe CSS a "display: none".
    this.ui.shoeTypeImage.style.display = useSourceShape ? "none" : "block";
  }

  // Genere un client complet: type de chaussure aleatoire + 1 a 3 pannes compatibles.
  generateClient() {
    this.state.transitionLock = false;
    const availableTypes = Object.values(SHOE_TYPES);
    let shoeType = pickRandom(availableTypes);

    // Evite de servir le meme type 2 fois de suite pour garder une rotation visible.
    if (
      availableTypes.length > 1
      && shoeType
      && shoeType.id === this.state.lastShoeTypeId
    ) {
      const withoutLast = availableTypes.filter((item) => item.id !== this.state.lastShoeTypeId);
      shoeType = pickRandom(withoutLast) || shoeType;
    }

    if (!shoeType) {
      return null;
    }
    this.state.lastShoeTypeId = shoeType.id;

    const profile = pickRandom(this.clients) || {
      id: "local-client",
      name: "Client atelier",
      exigence: "moyenne",
      dialogueBeforeRepair: "Je cherche une reparation fiable et durable.",
      reputationImpact: { success: 6, failure: -10 },
      story: "Passage spontanee a l'atelier.",
    };

    const problemCount = Math.floor(Math.random() * 3) + 1;
    const problemIds = sampleUnique(shoeType.problemPool, problemCount);

    const problems = problemIds
      .map((id) => PROBLEM_LIBRARY[id])
      .filter(Boolean)
      .map((problem) => ({
        ...problem,
        resolved: false,
        chosenRepairId: null,
      }));

    const personality = this.getPersonalityMultiplier(profile.exigence);
    const estimatedRepairMinutes = problems.reduce((total, problem) => {
      const repair = REPAIRS[problem.idealRepairId];
      return total + (repair?.timeMinutes || 25);
    }, 0);

    const remainingSeconds = this.state.level.timerEnabled
      ? Math.max(90, Math.round(estimatedRepairMinutes * 60 * 0.7))
      : 0;

    const client = {
      id: `${profile.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      profile,
      personality,
      shoeType,
      problems,
      completedRepairs: 0,
      remainingSeconds,
      openedAt: Date.now(),
    };

    this.state.currentClient = client;
    this.state.selectedPart = null;
    this.state.selectedSeverity = "neutral";
    this.state.miniGame = createMiniGameState();
    this.state.diagnosticText =
      `Client: ${sanitize(profile.name)}\n`
      + `Type: ${shoeType.name} (${shoeType.construction})\n`
      + `Demande: ${sanitize(profile.dialogueBeforeRepair)}`;

    this.setShoeVisual(shoeType);
    this.startTimer();

    this.appendHistory(
      `Nouveau client: ${sanitize(profile.name)} (${shoeType.name}) avec ${problems.length} intervention(s).`
    );

    callLegacyHook("nextCustomer", {
      day: this.state.day,
      clientId: client.id,
      shoeType: shoeType.name,
      level: this.state.level.name,
    });

    this.render();
    return client;
  }

  appendHistory(text) {
    this.state.history.unshift({
      at: formatNow(),
      text,
    });

    if (this.state.history.length > 20) {
      this.state.history.length = 20;
    }
  }

  getPendingProblemsForPart(part) {
    if (!this.state.currentClient) {
      return [];
    }

    return this.state.currentClient.problems.filter((problem) => {
      return problem.part === part && !problem.resolved;
    });
  }

  selectPart(part) {
    if (!this.state.currentClient || this.state.transitionLock) {
      return;
    }

    if (this.state.miniGame.active) {
      this.state.diagnosticText =
        `Mini-jeu en cours: ${this.state.miniGame.repairName}.\n`
        + "Terminez ou annulez le mini-jeu avant de changer de piece.";
      this.render();
      return;
    }

    const effectivePart = this.getEffectivePart(part);
    const partLabel = this.getPartLabel(effectivePart);
    this.state.selectedPart = effectivePart;
    const pending = this.getPendingProblemsForPart(effectivePart);

    if (pending.length === 0) {
      this.state.selectedSeverity = "good";
      this.state.diagnosticText =
        `Zone ${partLabel} controlee.\n`
        + "Aucun defaut critique detecte sur cette zone pour ce client.";
    } else {
      const strongestSeverity = pending.reduce((acc, problem) => {
        return getSeverityRank(problem.severity) > getSeverityRank(acc) ? problem.severity : acc;
      }, "good");

      const listed = pending.map((problem) => `- ${problem.label}`).join("\n");
      this.state.selectedSeverity = strongestSeverity;
      this.state.diagnosticText =
        `Diagnostic ${partLabel}:\n${listed}\n`
        + `Niveau de gravite: ${SEVERITY_LABELS[strongestSeverity]}.`;
    }

    const guide = this.getPartGuide(effectivePart);
    if (guide) {
      this.state.diagnosticText += `\nRepere ${guide.color}: ${guide.actionLabel}.`;
    }

    this.appendHistory(`Zone inspectee: ${partLabel}.`);

    callLegacyHook("updateStats", {
      selectedPart: effectivePart,
      severity: this.state.selectedSeverity,
      pendingProblems: pending.length,
    });

    this.render();
  }

  hasStock(stockCost) {
    return Object.entries(stockCost || {}).every(([key, needed]) => {
      return (this.state.inventory[key] || 0) >= Number(needed || 0);
    });
  }

  consumeStock(stockCost) {
    Object.entries(stockCost || {}).forEach(([key, needed]) => {
      const next = (this.state.inventory[key] || 0) - Number(needed || 0);
      this.state.inventory[key] = Math.max(0, next);
    });
  }

  getActionsForSelectedPart() {
    if (!this.state.currentClient || !this.state.selectedPart) {
      return [];
    }

    const shoeTypeId = this.state.currentClient.shoeType.id;
    const partGuide = this.getPartGuide(this.state.selectedPart);
    const allowedRepairIds = partGuide?.allowedRepairIds || null;

    return Object.values(REPAIRS).filter((repair) => {
      const basicMatch =
        repair.shoeTypes.includes(shoeTypeId) && repair.parts.includes(this.state.selectedPart);

      if (!basicMatch) {
        return false;
      }

      if (!allowedRepairIds) {
        return true;
      }

      return allowedRepairIds.includes(repair.id);
    });
  }

  handleWrongRepair(reason, repair) {
    const profilePenalty = Number(this.state.currentClient?.profile?.reputationImpact?.failure ?? -10);
    const outcome = this.player.applyWrongDiagnostic({
      baseScore: Math.max(100, Number(repair?.price || 120)),
      penaltyMultiplier: this.state.level.reputationPenaltyMultiplier,
      scorePenaltyMultiplier: this.state.currentClient?.personality?.failureMultiplier || 1,
      reputationFailureDelta: profilePenalty,
    });

    this.syncPlayerState();
    this.state.selectedSeverity = "critical";
    this.state.diagnosticText = reason;
    this.appendHistory(`Erreur: ${reason} (reputation ${outcome.reputationDelta}).`);

    callLegacyHook("applyRepair", {
      success: false,
      reason,
      repairId: repair?.id || null,
      score: this.state.score,
      reputation: this.state.reputation,
      xp: this.state.xp,
    });
  }

  finishClientIfResolved() {
    const client = this.state.currentClient;
    if (!client) {
      return;
    }

    const unresolved = client.problems.filter((problem) => !problem.resolved);
    if (unresolved.length > 0) {
      return;
    }

    const personalityBonus =
      client.personality.label === "Elevee"
        ? 45
        : client.personality.label === "Faible"
          ? 18
          : 28;

    this.player.score += personalityBonus;
    const successRep = Number(client.profile?.reputationImpact?.success ?? 6);
    this.player.reputation = clamp(this.player.reputation + Math.round(successRep / 2), 0, 100);

    this.syncPlayerState();
    this.stopTimer();

    this.appendHistory(
      `Commande terminee: ${sanitize(client.profile.name)}. Bonus personnalite +${personalityBonus} score.`
    );

    this.state.diagnosticText =
      `Mission terminee pour ${sanitize(client.profile.name)}.\n`
      + `Toutes les reparations ont ete validees sur ${client.shoeType.name}.`;

    this.state.day += 1;
    this.state.transitionLock = true;

    window.setTimeout(() => {
      this.generateClient();
    }, 800);
  }

  applyRepair(repairId, options = {}) {
    const fromMiniGame = Boolean(options?.fromMiniGame);
    const miniGameResult = options?.miniGameResult || null;
    const client = this.state.currentClient;
    const selectedPart = this.state.selectedPart;
    const repair = REPAIRS[repairId];

    if (!client || !selectedPart || !repair || this.state.transitionLock) {
      return null;
    }

    if (!fromMiniGame && this.state.miniGame.active) {
      return { success: false, reason: "mini_game_active" };
    }

    if (!fromMiniGame) {
      const started = this.startRepairMiniGame(repairId);
      if (started) {
        return { success: false, reason: "mini_game_started" };
      }
    }

    if (!repair.shoeTypes.includes(client.shoeType.id)) {
      this.handleWrongRepair(
        `${repair.name} n'est pas compatible avec ${client.shoeType.name}.`,
        repair
      );
      this.render();
      return { success: false, reason: "shoe_type_mismatch" };
    }

    if (!repair.parts.includes(selectedPart)) {
      this.handleWrongRepair(
        `${repair.name} n'est pas une action valable sur ${this.getPartLabel(selectedPart)}.`,
        repair
      );
      this.render();
      return { success: false, reason: "part_mismatch" };
    }

    if (!this.hasStock(repair.stockCost)) {
      this.state.selectedSeverity = "critical";
      this.state.diagnosticText =
        `Stock insuffisant pour ${repair.name}.\n`
        + "Rechargez l'inventaire avant de poursuivre cette reparation.";
      this.appendHistory(`Stock vide: reparation impossible (${repair.name}).`);
      this.render();
      return { success: false, reason: "stock_empty" };
    }

    const matchingProblem = client.problems.find((problem) => {
      return (
        !problem.resolved
        && problem.part === selectedPart
        && problem.acceptedRepairs.includes(repairId)
      );
    });

    if (!matchingProblem) {
      this.consumeStock(repair.stockCost);
      this.handleWrongRepair(
        `Mauvais diagnostic sur ${this.getPartLabel(selectedPart)}: cette action ne traite pas la panne active.`,
        repair
      );
      this.render();
      return { success: false, reason: "wrong_repair" };
    }

    this.consumeStock(repair.stockCost);

    const perfectRepair = matchingProblem.idealRepairId === repair.id;
    const difficultyBonus = repair.difficulty * 10;
    const priceBaseScore = Math.round(repair.price * 0.45);
    const multiplier = perfectRepair
      ? client.personality.scoreMultiplier + 0.08
      : client.personality.scoreMultiplier;

    const outcome = this.player.applySuccessfulRepair({
      baseScore: priceBaseScore + difficultyBonus,
      timeSpent: repair.timeMinutes * 60,
      timeLimit: Math.max(60, repair.timeMinutes * 60 + 120),
      cluesFound: perfectRepair ? 2 : 1,
      cluesRequired: 2,
      perfectRepair,
      demandingClient: client.personality.label === "Elevee",
      scoreMultiplier: multiplier,
      reputationSuccessDelta: repair.reputationImpact + Math.ceil(repair.difficulty / 2),
    });

    const miniScoreBonus = Math.max(0, Math.round(miniGameResult?.scoreBonus || 0));
    const miniReputationBonus = Math.max(0, Math.round(miniGameResult?.reputationBonus || 0));
    if (miniScoreBonus > 0) {
      this.player.score += miniScoreBonus;
    }
    if (miniReputationBonus > 0) {
      this.player.reputation = clamp(this.player.reputation + miniReputationBonus, 0, 100);
    }

    if (this.state.level.timerEnabled) {
      client.remainingSeconds = Math.max(0, client.remainingSeconds - Math.round(repair.timeMinutes * 60 * 0.35));
      if (client.remainingSeconds <= 0) {
        this.handleTimeout();
        return { success: false, reason: "timeout" };
      }
    }

    matchingProblem.resolved = true;
    matchingProblem.chosenRepairId = repair.id;
    client.completedRepairs += 1;

    this.syncPlayerState();

    this.state.selectedSeverity = perfectRepair ? "good" : "medium";
    const miniBonusSummary =
      miniScoreBonus > 0 || miniReputationBonus > 0
        ? ` Bonus mini-jeu: +${miniScoreBonus} score${miniReputationBonus > 0 ? `, rep +${miniReputationBonus}` : ""}.`
        : "";
    this.state.diagnosticText =
      `${repair.name} appliquee avec succes.\n`
      + `${matchingProblem.label} resolu.${perfectRepair ? " Reparation parfaite: bonus score." : ""}`
      + miniBonusSummary;

    this.appendHistory(
      `${repair.name}: ${matchingProblem.label} resolu `
      + `(+${outcome.deltaScore + miniScoreBonus} score, rep +${outcome.reputationDelta + miniReputationBonus}).`
    );

    callLegacyHook("applyRepair", {
      success: true,
      repairId: repair.id,
      perfectRepair,
      score: this.state.score,
      reputation: this.state.reputation,
      xp: this.state.xp,
    });

    this.finishClientIfResolved();
    this.render();

    return {
      success: true,
      repair,
      problem: matchingProblem,
      outcome,
    };
  }

  handleTimeout() {
    if (!this.state.currentClient || this.state.transitionLock) {
      return;
    }

    const penalty = this.player.applyTimeoutPenalty({
      penaltyMultiplier: this.state.level.reputationPenaltyMultiplier,
    });

    this.syncPlayerState();
    this.stopTimer();
    this.state.miniGame = createMiniGameState();

    this.state.selectedSeverity = "critical";
    this.state.diagnosticText =
      `Temps ecoule pour ${sanitize(this.state.currentClient.profile.name)}.\n`
      + "Mission echee, le client quitte l'atelier.";

    this.appendHistory(`Timeout mission (reputation ${penalty.reputationDelta}).`);

    this.state.day += 1;
    this.state.transitionLock = true;
    window.setTimeout(() => this.generateClient(), 800);
    this.render();
  }

  reset() {
    this.stopTimer();
    this.player.reset({ score: 0, reputation: 50, xp: 0, streak: 0 });

    this.state = {
      day: 1,
      level: getLevelByXp(0),
      score: 0,
      reputation: 50,
      xp: 0,
      progressPercent: 0,
      selectedPart: null,
      selectedSeverity: "neutral",
      diagnosticText: "Selectionnez une partie de la chaussure pour analyser son etat.",
      inventory: { ...DEFAULT_STOCK },
      currentClient: null,
      history: [],
      transitionLock: false,
      lastShoeTypeId: null,
      miniGame: createMiniGameState(),
    };

    this.generateClient();
    this.render();
  }

  setSeverityBadge(severity) {
    this.ui.severity.classList.remove(
      "severity-neutral",
      "severity-good",
      "severity-medium",
      "severity-critical"
    );

    this.ui.severity.classList.add(`severity-${severity}`);
    this.ui.severity.textContent = SEVERITY_LABELS[severity] || SEVERITY_LABELS.neutral;
  }

  renderHeader() {
    this.ui.dayChip.textContent = String(this.state.day);
    this.ui.reputationChip.textContent = String(this.state.reputation);
    this.ui.levelChip.textContent = `${this.state.level.name} (${this.state.progressPercent}%)`;
    this.ui.scoreChip.textContent = String(this.state.score);
  }

  renderDiagnostic() {
    const client = this.state.currentClient;

    if (!client) {
      this.ui.selectedPartLabel.textContent = "-";
      this.ui.diagnosticText.textContent = "Aucun client actif.";
      this.setSeverityBadge("neutral");
      return;
    }

    const pendingCount = client.problems.filter((problem) => !problem.resolved).length;
    const timerText = this.state.level.timerEnabled
      ? `Timer: ${client.remainingSeconds}s`
      : "Timer: OFF";

    const inventoryText =
      `Stock: semelles ${this.state.inventory.semelles}, `
      + `fil ${this.state.inventory.fil}, `
      + `cuir ${this.state.inventory.cuir}, `
      + `colle ${this.state.inventory.colle}`;

    if (!this.state.selectedPart) {
      this.ui.selectedPartLabel.textContent = "-";
      this.ui.diagnosticText.textContent =
        `${this.state.diagnosticText}\n`
        + `Pannes restantes: ${pendingCount} | ${timerText}\n${inventoryText}`;
      this.setSeverityBadge("neutral");
      return;
    }

    this.ui.selectedPartLabel.textContent = this.getPartLabel(this.state.selectedPart);
    this.ui.diagnosticText.textContent =
      `${this.state.diagnosticText}\n`
      + `Pannes restantes: ${pendingCount} | ${timerText}\n${inventoryText}`;
    this.setSeverityBadge(this.state.selectedSeverity);
  }

  renderActions() {
    this.ui.actionsList.innerHTML = "";
    const miniGameActive = this.state.miniGame.active;

    if (!this.state.currentClient) {
      const note = document.createElement("p");
      note.className = "empty-note";
      note.textContent = "Aucune mission active.";
      this.ui.actionsList.appendChild(note);
      return;
    }

    if (!this.state.selectedPart) {
      const note = document.createElement("p");
      note.className = "empty-note";
      note.textContent = "Selectionnez une piece (semelle, talon, couture ou empeigne).";
      this.ui.actionsList.appendChild(note);
      return;
    }

    const actions = this.getActionsForSelectedPart();
    const guide = this.getPartGuide(this.state.selectedPart);
    const colorKey = toColorKey(guide?.color);

    if (miniGameActive) {
      const running = document.createElement("p");
      running.className = "action-guide";
      running.textContent =
        `Mini-jeu en cours: ${this.state.miniGame.repairName}. `
        + "Terminez-le ou annulez-le.";
      this.ui.actionsList.appendChild(running);
    }

    if (guide) {
      const guideNote = document.createElement("p");
      guideNote.className = "action-guide";
      guideNote.textContent = `Couleur active: ${guide.color} -> ${guide.actionLabel}`;
      this.ui.actionsList.appendChild(guideNote);
    }

    if (actions.length === 0) {
      const note = document.createElement("p");
      note.className = "empty-note";
      note.textContent = "Aucune action disponible pour cette piece et ce type de chaussure.";
      this.ui.actionsList.appendChild(note);
      return;
    }

    actions.forEach((action) => {
      const button = document.createElement("button");
      const stockAvailable = this.hasStock(action.stockCost);
      button.type = "button";
      button.className = `action-btn action-color-${colorKey}`;
      button.disabled = this.state.transitionLock || miniGameActive || !stockAvailable;

      const difficultyLabel = `Difficulte ${action.difficulty}/5`;
      button.textContent =
        `${action.name} - ${formatMoney(action.price)} - ${difficultyLabel}`
        + (stockAvailable ? "" : " (Stock insuffisant)");

      button.addEventListener("click", () => {
        this.applyRepair(action.id);
      });

      this.ui.actionsList.appendChild(button);
    });
  }

  renderHistory() {
    this.ui.historyList.innerHTML = "";

    if (!this.state.history.length) {
      const item = document.createElement("li");
      item.className = "empty-note";
      item.textContent = "Aucune interaction pour l'instant.";
      this.ui.historyList.appendChild(item);
      return;
    }

    this.state.history.forEach((entry) => {
      const item = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = entry.at;
      item.appendChild(strong);
      item.appendChild(document.createTextNode(` - ${entry.text}`));
      this.ui.historyList.appendChild(item);
    });
  }

  renderMiniGame() {
    const panel = this.ui.miniGamePanel;
    const track = this.ui.miniGameTrack;
    const targetsContainer = this.ui.miniGameTargets;
    const miniGame = this.state.miniGame;

    if (!panel || !track || !targetsContainer) {
      return;
    }

    if (!miniGame.active) {
      panel.hidden = true;
      track.setAttribute("d", "");
      targetsContainer.innerHTML = "";
      if (this.ui.miniGameCancelBtn) {
        this.ui.miniGameCancelBtn.disabled = true;
      }
      return;
    }

    panel.hidden = false;
    if (this.ui.miniGameTitle) {
      this.ui.miniGameTitle.textContent = miniGame.title;
    }
    if (this.ui.miniGameProgress) {
      this.ui.miniGameProgress.textContent = `${miniGame.hits} / ${miniGame.targets.length}`;
    }
    if (this.ui.miniGameInstruction) {
      this.ui.miniGameInstruction.textContent = this.getMiniGameInstructionText(miniGame);
    }
    if (this.ui.miniGameCancelBtn) {
      this.ui.miniGameCancelBtn.disabled = false;
    }

    track.setAttribute("d", miniGame.trackPath);
    targetsContainer.innerHTML = "";

    miniGame.targets.forEach((target, index) => {
      const node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      node.setAttribute("cx", String(target.x));
      node.setAttribute("cy", String(target.y));
      node.setAttribute("r", String(target.r));
      node.setAttribute("role", "button");
      node.setAttribute("aria-label", `Point ${index + 1} sur ${miniGame.targets.length}`);
      node.classList.add("mini-target");

      if (target.hit) {
        node.classList.add("is-hit");
        node.setAttribute("tabindex", "-1");
        node.setAttribute("aria-pressed", "true");
      } else {
        node.setAttribute("tabindex", "0");
        node.setAttribute("aria-pressed", "false");
        if (miniGame.ordered && miniGame.nextIndex === index) {
          node.classList.add("is-next");
        }
        node.addEventListener("click", () => this.handleMiniTargetInput(index));
        node.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.handleMiniTargetInput(index);
          }
        });
      }

      targetsContainer.appendChild(node);
    });
  }

  renderSvgState() {
    this.ui.parts.forEach((partNode) => {
      const isActive = partNode.dataset.part === this.state.selectedPart;
      partNode.classList.toggle("is-active", isActive);
      partNode.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  render() {
    this.renderHeader();
    this.renderDiagnostic();
    this.renderActions();
    this.renderMiniGame();
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

  bindEvents() {
    this.ui.parts.forEach((partNode) => {
      const part = partNode.dataset.part;

      partNode.addEventListener("click", () => this.selectPart(part));

      partNode.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.selectPart(part);
        }
      });

      partNode.addEventListener("mouseenter", (event) => {
        this.showTooltip(event, this.getPartLabel(this.getEffectivePart(part)));
      });
      partNode.addEventListener("mousemove", (event) => {
        this.showTooltip(event, this.getPartLabel(this.getEffectivePart(part)));
      });
      partNode.addEventListener("mouseleave", () => this.hideTooltip());
      partNode.addEventListener("focus", (event) => {
        this.showTooltip(event, this.getPartLabel(this.getEffectivePart(part)));
      });
      partNode.addEventListener("blur", () => this.hideTooltip());
    });

    this.ui.resetBtn?.addEventListener("click", () => this.reset());
    this.ui.miniGameCancelBtn?.addEventListener("click", () => this.cancelMiniGame());
  }

  installHooksForTesting() {
    window.render_game_to_text = () => {
      const client = this.state.currentClient;

      return JSON.stringify({
        mode: this.state.miniGame.active
          ? "mini_game"
          : this.state.selectedPart
            ? "repair"
            : "diagnostic",
        day: this.state.day,
        selectedPart: this.state.selectedPart,
        level: {
          id: this.state.level.id,
          name: this.state.level.name,
          progressPercent: this.state.progressPercent,
          timerEnabled: this.state.level.timerEnabled,
        },
        player: {
          score: this.state.score,
          reputation: this.state.reputation,
          xp: this.state.xp,
        },
        inventory: { ...this.state.inventory },
        miniGame: {
          active: this.state.miniGame.active,
          repairId: this.state.miniGame.repairId,
          repairName: this.state.miniGame.repairName,
          part: this.state.miniGame.part,
          ordered: this.state.miniGame.ordered,
          hits: this.state.miniGame.hits,
          misses: this.state.miniGame.misses,
          maxMisses: this.state.miniGame.maxMisses,
          totalTargets: this.state.miniGame.targets.length,
        },
        currentClient: client
          ? {
              id: client.id,
              name: client.profile.name,
              shoeType: client.shoeType.name,
              remainingSeconds: client.remainingSeconds,
              pendingProblems: client.problems
                .filter((problem) => !problem.resolved)
                .map((problem) => ({
                  id: problem.id,
                  label: problem.label,
                  part: problem.part,
                  severity: problem.severity,
                })),
            }
          : null,
      });
    };

    window.advanceTime = (ms) => {
      if (!this.state.level.timerEnabled || !this.state.currentClient) {
        return;
      }

      const safeMs = Math.max(0, Number(ms) || 0);
      const deltaSeconds = Math.floor(safeMs / 1000);
      if (deltaSeconds <= 0) {
        return;
      }

      this.state.currentClient.remainingSeconds = Math.max(
        0,
        this.state.currentClient.remainingSeconds - deltaSeconds
      );

      if (this.state.currentClient.remainingSeconds <= 0) {
        this.handleTimeout();
      } else {
        this.renderDiagnostic();
      }
    };

    window.resetCobblerSimulation = () => this.reset();
    window.generateClient = () => this.generateClient();
    window.applyRepair = (repairId) => this.applyRepair(repairId);
    window.SHOE_TYPES = SHOE_TYPES;
    window.REPAIRS = REPAIRS;
  }
}

const game = new Game(ui);

export function generateClient() {
  return game.generateClient();
}

export function applyRepair(repairId) {
  return game.applyRepair(repairId);
}

game.init();
