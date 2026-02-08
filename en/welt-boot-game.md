---
layout: page
title: "Cobbler game: repair workshop simulator"
description: "Playable cobbler simulation: diagnose, repair, finish jobs, and build your workshop reputation."
lang: en
lang_ref: boot-game
permalink: /en/welt-boot-game/
extra_css:
  - /assets/css/cobbler-game.css
extra_js:
  - /assets/js/cobbler-game.js
keywords:
  - cobbler game
  - repair workshop
  - shoe simulator
  - durable shoes
  - browser game
---

<div class="cobbler-game" data-cobbler-game data-lang="en" data-issue="none">
  <div class="cg-topbar">
    <p class="cg-intro" data-i18n="introText">Run your workshop: diagnose, repair, finish, and grow your reputation.</p>
    <button class="btn cg-lang-toggle" type="button" data-lang-toggle aria-label="Switch to French">FR</button>
  </div>

  <div class="cg-layout">
    <aside class="cg-panel cg-order" aria-live="polite">
      <h2 data-i18n="orderTitle">Order</h2>
      <p><span data-i18n="clientLabel">Client</span>: <strong data-order-client>-</strong></p>
      <p><span data-i18n="difficultyLabel">Difficulty</span>: <strong data-order-difficulty>-</strong></p>
      <p><span data-i18n="timerLabel">Time left</span>: <strong data-order-timer>--:--</strong></p>

      <h3 data-i18n="issuesTitle">Issues</h3>
      <ul class="cg-issues" data-order-issues>
        <li data-i18n="noOrderYet">No active order yet.</li>
      </ul>

      <h3 data-i18n="stepsTitle">Steps</h3>
      <ol class="cg-steps">
        <li data-step-item="diagnosis">Diagnose</li>
        <li data-step-item="repair">Repair</li>
        <li data-step-item="finish">Finish</li>
      </ol>
    </aside>

    <section class="cg-panel cg-workshop" aria-live="polite">
      <h2 data-i18n="workshopTitle">Workshop</h2>
      <p class="cg-stage-name" data-stage-name>Workshop ready</p>
      <p class="cg-stage-desc" data-stage-desc>Press “New client” to start an order.</p>

      <div class="cg-shoe-scene" aria-hidden="true">
        <div class="cg-shoe-upper"></div>
        <div class="cg-shoe-stitch"></div>
        <div class="cg-shoe-sole"></div>
        <div class="cg-shoe-heel"></div>
      </div>

      <div class="cg-mini-wrap">
        <section class="cg-mini" data-mini="timing" hidden>
          <h3 data-i18n="miniTimingTitle">Precision mini-game</h3>
          <p data-mini-timing-text>Click at the right moment in the green zone.</p>
          <div class="cg-track" role="img" aria-label="Timing bar">
            <div class="cg-zone" data-timing-zone></div>
            <div class="cg-cursor" data-timing-cursor></div>
          </div>
          <button class="btn cg-mini-action" type="button" data-action-timing data-i18n="miniTimingAction">Apply move</button>
        </section>

        <section class="cg-mini" data-mini="clicks" hidden>
          <h3 data-i18n="miniClicksTitle">Rhythm mini-game</h3>
          <p data-mini-clicks-text>Click fast to reach the threshold before time runs out.</p>
          <div class="cg-fill-track" role="img" aria-label="Repair progress">
            <div class="cg-fill" data-clicks-fill></div>
          </div>
          <p class="cg-mini-counter" data-clicks-counter>0 / 0</p>
          <button class="btn cg-mini-action" type="button" data-action-clicks data-i18n="miniClicksAction">Repeat action</button>
        </section>

        <section class="cg-mini" data-mini="finish" hidden>
          <h3 data-i18n="miniFinishTitle">Finishing mini-game</h3>
          <p data-mini-finish-text>Stop at the right moment for a clean finish.</p>
          <div class="cg-track" role="img" aria-label="Finishing bar">
            <div class="cg-zone" data-finish-zone></div>
            <div class="cg-cursor" data-finish-cursor></div>
          </div>
          <button class="btn cg-mini-action" type="button" data-action-finish data-i18n="miniFinishAction">Finalize</button>
        </section>
      </div>
    </section>

    <aside class="cg-panel cg-tools">
      <h2 data-i18n="toolsTitle">Tools</h2>
      <div class="cg-tools-grid">
        <button class="btn cg-tool-btn" type="button" data-tool="diagnostic" data-i18n="toolDiagnostic">Diagnose</button>
        <button class="btn cg-tool-btn" type="button" data-tool="repair" data-i18n="toolRepair">Repair</button>
        <button class="btn cg-tool-btn" type="button" data-tool="finish" data-i18n="toolFinish">Finish</button>
      </div>

      <div class="cg-stats">
        <p><span data-i18n="scoreLabel">Score</span>: <strong data-stat-score>0</strong></p>
        <p><span data-i18n="bestScoreLabel">Best score</span>: <strong data-stat-best>0</strong></p>
        <p><span data-i18n="completedLabel">Completed orders</span>: <strong data-stat-completed>0</strong></p>
        <p><span data-i18n="reputationLabel">Reputation</span>: <strong data-stat-reputation>0</strong></p>
        <p><span data-i18n="levelLabel">Level</span>: <strong data-stat-level>1</strong></p>
        <p><span data-i18n="satisfactionLabel">Client satisfaction</span>: <strong data-stat-satisfaction>5/5</strong></p>
        <p class="cg-stars" data-satisfaction-stars aria-live="polite">★★★★★</p>
      </div>

      <div class="cg-actions">
        <button class="btn btn-primary" type="button" data-new-order data-i18n="newOrderBtn">New client</button>
        <button class="btn btn-outline" type="button" data-reset-save data-i18n="resetProgressBtn">Reset progress</button>
      </div>

      <p class="cg-shortcuts" data-i18n="shortcutsText">Keyboard shortcuts: N (new client), D (diagnose), R (repair), F (finish).</p>
    </aside>
  </div>

  <section class="cg-panel cg-log">
    <h2 data-i18n="logTitle">Workshop log</h2>
    <ul data-log-list>
      <li>Workshop ready.</li>
    </ul>
  </section>
</div>
