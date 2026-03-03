// Player progression and scoring domain logic.

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class Player {
  constructor(initialState = {}) {
    this.score = initialState.score ?? 0;
    this.reputation = clamp(initialState.reputation ?? 50, 0, 100);
    this.xp = Math.max(0, initialState.xp ?? 0);
    this.streak = Math.max(0, initialState.streak ?? 0);
    this.resolvedClients = initialState.resolvedClients ?? 0;
    this.failedClients = initialState.failedClients ?? 0;
  }

  applySuccessfulRepair({
    baseScore,
    timeSpent,
    timeLimit,
    cluesFound,
    cluesRequired,
    perfectRepair,
    demandingClient,
    scoreMultiplier = 1,
    reputationSuccessDelta = 6,
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

    const demandingBonus = demandingClient ? 30 : 0;
    const perfectBonus = perfectRepair ? 65 : 0;

    this.streak += 1;
    const streakBonus = this.streak * 5;

    const rawScore =
      safeBase + speedBonus + diagnosticBonus + demandingBonus + perfectBonus + streakBonus;
    const deltaScore = Math.round(rawScore * Math.max(0.75, scoreMultiplier));

    this.score = Math.max(0, this.score + deltaScore);

    const xpGained =
      20 +
      Math.round(diagnosticBonus * 0.3) +
      (demandingClient ? 6 : 0) +
      (perfectRepair ? 10 : 0);

    this.xp += xpGained;
    const reputationDelta =
      Math.round(reputationSuccessDelta) + (perfectRepair ? 1 : 0);
    this.reputation = clamp(this.reputation + reputationDelta, 0, 100);
    this.resolvedClients += 1;

    return {
      success: true,
      deltaScore,
      xpGained,
      speedBonus,
      diagnosticBonus,
      demandingBonus,
      perfectBonus,
      streakBonus,
      reputationDelta,
      score: this.score,
      reputation: this.reputation,
      xp: this.xp,
      streak: this.streak,
      perfectRepair,
    };
  }

  applyWrongDiagnostic({
    baseScore,
    penaltyMultiplier = 1,
    scorePenaltyMultiplier = 1,
    reputationFailureDelta = -10,
  }) {
    const safeBase = Number.isFinite(baseScore) ? baseScore : 100;

    this.streak = 0;
    this.failedClients += 1;

    const safeScorePenaltyMultiplier = Math.max(0.8, scorePenaltyMultiplier);
    const deltaScore = -Math.round(safeBase * 0.35 * safeScorePenaltyMultiplier);
    this.score = Math.max(0, this.score + deltaScore);

    // Explicit rule preserved: wrong diagnostic is at least -10 reputation.
    const basePenalty = Math.max(10, Math.abs(Math.round(reputationFailureDelta)));
    const reputationPenalty = -Math.round(basePenalty * penaltyMultiplier);
    this.reputation = clamp(this.reputation + reputationPenalty, 0, 100);

    return {
      success: false,
      wrongDiagnostic: true,
      deltaScore,
      xpGained: 0,
      reputationDelta: reputationPenalty,
      score: this.score,
      reputation: this.reputation,
      xp: this.xp,
      streak: this.streak,
    };
  }

  applyTimeoutPenalty({ penaltyMultiplier = 1 }) {
    this.streak = 0;
    this.failedClients += 1;

    const deltaScore = -22;
    this.score = Math.max(0, this.score + deltaScore);

    const reputationPenalty = -Math.round(8 * penaltyMultiplier);
    this.reputation = clamp(this.reputation + reputationPenalty, 0, 100);

    return {
      success: false,
      timeout: true,
      deltaScore,
      xpGained: 0,
      reputationDelta: reputationPenalty,
      score: this.score,
      reputation: this.reputation,
      xp: this.xp,
      streak: this.streak,
    };
  }

  applyInventoryBlockPenalty() {
    this.reputation = clamp(this.reputation - 2, 0, 100);

    return {
      reputationDelta: -2,
      reputation: this.reputation,
    };
  }

  reset(initialState = {}) {
    this.score = initialState.score ?? 0;
    this.reputation = clamp(initialState.reputation ?? 50, 0, 100);
    this.xp = Math.max(0, initialState.xp ?? 0);
    this.streak = Math.max(0, initialState.streak ?? 0);
    this.resolvedClients = initialState.resolvedClients ?? 0;
    this.failedClients = initialState.failedClients ?? 0;

    return this.getState();
  }

  getState() {
    return {
      score: this.score,
      reputation: this.reputation,
      xp: this.xp,
      streak: this.streak,
      resolvedClients: this.resolvedClients,
      failedClients: this.failedClients,
    };
  }
}
