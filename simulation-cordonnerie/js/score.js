// Score and reputation system isolated from UI.

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function createScoreSystem(initialState = {}) {
  const state = {
    score: initialState.score ?? 0,
    reputation: initialState.reputation ?? 50,
    streak: initialState.streak ?? 0,
    resolvedClients: initialState.resolvedClients ?? 0,
    failedClients: initialState.failedClients ?? 0,
  };

  function applyRepairOutcome({
    success,
    baseScore,
    timeSpent,
    timeLimit,
    cluesFound,
    cluesRequired,
    reputationImpact,
  }) {
    const safeBase = Number.isFinite(baseScore) ? baseScore : 100;
    const safeTimeLimit = Math.max(1, Number.isFinite(timeLimit) ? timeLimit : 60);
    const safeTimeSpent = Math.max(0, Number.isFinite(timeSpent) ? timeSpent : 0);

    let deltaScore = 0;
    let speedBonus = 0;
    let diagnosticBonus = 0;

    if (success) {
      const speedRatio = clamp(1 - safeTimeSpent / safeTimeLimit, 0, 1);
      speedBonus = Math.round(55 * speedRatio);
      diagnosticBonus = Math.round(
        35 * clamp((cluesFound || 0) / Math.max(1, cluesRequired || 1), 0, 1)
      );

      state.streak += 1;
      deltaScore = safeBase + speedBonus + diagnosticBonus + state.streak * 5;
      state.resolvedClients += 1;
    } else {
      state.streak = 0;
      deltaScore = -Math.round(safeBase * 0.35);
      state.failedClients += 1;
    }

    state.score = Math.max(0, state.score + deltaScore);

    const reputationDelta = success
      ? reputationImpact?.success ?? 5
      : reputationImpact?.fail ?? -6;

    state.reputation = clamp(state.reputation + reputationDelta, 0, 100);

    return {
      success,
      deltaScore,
      speedBonus,
      diagnosticBonus,
      reputationDelta,
      score: state.score,
      reputation: state.reputation,
      streak: state.streak,
    };
  }

  function applyTimeoutPenalty() {
    state.streak = 0;
    state.score = Math.max(0, state.score - 22);
    state.reputation = clamp(state.reputation - 8, 0, 100);
    state.failedClients += 1;

    return {
      success: false,
      deltaScore: -22,
      reputationDelta: -8,
      score: state.score,
      reputation: state.reputation,
      streak: state.streak,
      timeout: true,
    };
  }

  function addEducationalBonus(points = 10) {
    const bonus = Math.max(0, Math.round(points));
    state.score += bonus;

    return {
      deltaScore: bonus,
      score: state.score,
    };
  }

  function getState() {
    return {
      score: state.score,
      reputation: state.reputation,
      streak: state.streak,
      resolvedClients: state.resolvedClients,
      failedClients: state.failedClients,
    };
  }

  function reset(nextState = {}) {
    state.score = nextState.score ?? 0;
    state.reputation = nextState.reputation ?? 50;
    state.streak = nextState.streak ?? 0;
    state.resolvedClients = nextState.resolvedClients ?? 0;
    state.failedClients = nextState.failedClients ?? 0;
    return getState();
  }

  return {
    applyRepairOutcome,
    applyTimeoutPenalty,
    addEducationalBonus,
    getState,
    reset,
  };
}
