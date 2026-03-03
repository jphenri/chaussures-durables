// Score and reputation logic isolated from UI/game orchestration.

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class ReputationMeter {
  constructor(initialValue = 50) {
    this.value = clamp(initialValue, 0, 100);
  }

  adjust(delta) {
    const previous = this.value;
    this.value = clamp(this.value + delta, 0, 100);
    return this.value - previous;
  }

  rewardService(points = 6) {
    return this.adjust(Math.max(0, Math.round(points)));
  }

  penalizeWrongDiagnostic() {
    // Explicit business rule from the specification.
    return this.adjust(-10);
  }

  penalizeTimeout() {
    return this.adjust(-8);
  }

  getValue() {
    return this.value;
  }

  reset(nextValue = 50) {
    this.value = clamp(nextValue, 0, 100);
    return this.value;
  }
}

export class WorkshopScoreSystem {
  constructor(initialState = {}) {
    this.score = initialState.score ?? 0;
    this.streak = initialState.streak ?? 0;
    this.resolvedClients = initialState.resolvedClients ?? 0;
    this.failedClients = initialState.failedClients ?? 0;
    this.reputation = new ReputationMeter(initialState.reputation ?? 50);
  }

  applySuccessfulRepair({
    baseScore,
    timeSpent,
    timeLimit,
    cluesFound,
    cluesRequired,
    perfectRepair = false,
    reputationGain = 6,
  }) {
    const safeBase = Number.isFinite(baseScore) ? baseScore : 100;
    const safeTimeLimit = Math.max(1, Number.isFinite(timeLimit) ? timeLimit : 60);
    const safeTimeSpent = Math.max(0, Number.isFinite(timeSpent) ? timeSpent : 0);

    const speedRatio = clamp(1 - safeTimeSpent / safeTimeLimit, 0, 1);
    const speedBonus = Math.round(45 * speedRatio);

    const clueRatio = clamp(
      (cluesFound || 0) / Math.max(1, cluesRequired || 1),
      0,
      1
    );
    const diagnosticBonus = Math.round(30 * clueRatio);

    const perfectBonus = perfectRepair ? 60 : 0;

    this.streak += 1;
    const streakBonus = this.streak * 5;

    const deltaScore = safeBase + speedBonus + diagnosticBonus + perfectBonus + streakBonus;
    this.score = Math.max(0, this.score + deltaScore);
    this.resolvedClients += 1;

    const reputationDelta = this.reputation.rewardService(
      perfectRepair ? reputationGain + 1 : reputationGain
    );

    return {
      success: true,
      deltaScore,
      speedBonus,
      diagnosticBonus,
      perfectBonus,
      streakBonus,
      reputationDelta,
      score: this.score,
      reputation: this.reputation.getValue(),
      streak: this.streak,
      perfectRepair,
    };
  }

  applyWrongDiagnostic({ baseScore }) {
    const safeBase = Number.isFinite(baseScore) ? baseScore : 100;

    this.streak = 0;
    const deltaScore = -Math.round(safeBase * 0.35);
    this.score = Math.max(0, this.score + deltaScore);
    this.failedClients += 1;

    const reputationDelta = this.reputation.penalizeWrongDiagnostic();

    return {
      success: false,
      wrongDiagnostic: true,
      deltaScore,
      reputationDelta,
      score: this.score,
      reputation: this.reputation.getValue(),
      streak: this.streak,
    };
  }

  applyTimeoutPenalty() {
    this.streak = 0;
    const deltaScore = -22;
    this.score = Math.max(0, this.score + deltaScore);
    this.failedClients += 1;

    const reputationDelta = this.reputation.penalizeTimeout();

    return {
      success: false,
      timeout: true,
      deltaScore,
      reputationDelta,
      score: this.score,
      reputation: this.reputation.getValue(),
      streak: this.streak,
    };
  }

  addEducationalBonus(points = 10) {
    const bonus = Math.max(0, Math.round(points));
    this.score += bonus;
    return {
      deltaScore: bonus,
      score: this.score,
    };
  }

  getState() {
    return {
      score: this.score,
      reputation: this.reputation.getValue(),
      streak: this.streak,
      resolvedClients: this.resolvedClients,
      failedClients: this.failedClients,
    };
  }

  reset(nextState = {}) {
    this.score = nextState.score ?? 0;
    this.streak = nextState.streak ?? 0;
    this.resolvedClients = nextState.resolvedClients ?? 0;
    this.failedClients = nextState.failedClients ?? 0;
    this.reputation.reset(nextState.reputation ?? 50);
    return this.getState();
  }
}

export function createScoreSystem(initialState = {}) {
  return new WorkshopScoreSystem(initialState);
}
