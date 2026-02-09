---
layout: default
title: "Cobbler game: repair workshop simulator"
description: "Playable cobbler simulation: diagnose, repair, finish jobs, and build your workshop reputation."
lang: en
lang_ref: boot-game
permalink: /en/welt-boot-game/
hide_site_header: true
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

<div class="cobbler-game" data-cobbler-game data-lang="en" data-issue="none" data-scene-base="{{ '/assets/img/sora/' | relative_url }}">
  <div class="cg-topbar">
    <div class="cg-topbar-actions">
      <div class="cg-topbar-actions-main">
        <button class="btn cg-head-main-action" type="button" data-main-action data-i18n="mainActionIdle">Action unavailable</button>
        <button class="btn btn-primary cg-head-new-order" type="button" data-new-order data-i18n="newOrderBtn">Start order</button>
        <button class="btn btn-outline cg-head-action" type="button" data-call-clients data-i18n="callClientsBtn">Call clients</button>
        <button class="btn btn-outline cg-head-action" type="button" data-wait-next-day data-i18n="waitNextDayBtn">Close for the day</button>
        <button class="btn btn-outline cg-head-action" type="button" data-open-supply data-i18n="openSupplyBtn">Purchases</button>
        <a class="btn btn-outline cg-exit-link" href="{{ '/en/' | relative_url }}" data-i18n="exitGameBtn">Exit game</a>
        <button class="btn cg-lang-toggle" type="button" data-lang-toggle aria-label="Switch to French">FR</button>
      </div>
      <div class="cg-topbar-quick-stats">
        <p class="cg-quick-stat"><span data-i18n="cycleLabel">Cycle</span>: <strong data-stat-week>Day 1/5 | Week 1/4 | Month 1/12</strong></p>
        <p class="cg-quick-stat"><span data-i18n="hoursLeftLabel">Hours left</span>: <strong data-stat-hours-left>40h / 40h</strong></p>
      </div>
    </div>
    <div class="cg-stats">
      <p><span data-i18n="scoreLabel">Score</span>: <strong data-stat-score>0</strong></p>
      <p><span data-i18n="cashLabel">Cash</span>: <strong data-stat-money>$0</strong></p>
      <p><span data-i18n="marketingLabel">Marketing</span>: <strong data-stat-marketing>None</strong></p>
      <p><span data-i18n="servicesUnlockedLabel">Unlocked services</span>: <strong data-stat-services>2</strong></p>
      <p><span data-i18n="storageLabel">Finished stock</span>: <strong data-stat-storage>0/12</strong></p>
      <p><span data-i18n="bestScoreLabel">Best score</span>: <strong data-stat-best>0</strong></p>
      <p><span data-i18n="completedLabel">Completed orders</span>: <strong data-stat-completed>0</strong></p>
      <p><span data-i18n="reputationLabel">Reputation</span>: <strong data-stat-reputation>0</strong></p>
      <p><span data-i18n="levelLabel">Level</span>: <strong data-stat-level>1</strong></p>
      <p><span data-i18n="satisfactionLabel">Client satisfaction</span>: <strong data-stat-satisfaction>5/5</strong></p>
      <p class="cg-stars" data-satisfaction-stars aria-live="polite">★★★★★</p>
    </div>
  </div>

  <section class="cg-topbar-order" aria-live="polite">
    <div class="cg-topbar-order-grid">
      <div class="cg-topbar-order-main">
        <div class="cg-topbar-order-head">
          <h2 data-i18n="orderTitle">Order</h2>
          <button class="btn btn-outline cg-shelve-btn" type="button" data-shelve-order data-i18n="shelveOrderBtn">Set aside</button>
        </div>
        <div class="cg-order-meta">
          <p class="cg-order-meta-item">
            <span data-i18n="clientLabel">Client</span>
            <strong data-order-client>-</strong>
          </p>
          <p class="cg-order-meta-item">
            <span data-i18n="difficultyLabel">Difficulty</span>
            <strong data-order-difficulty>-</strong>
          </p>
          <p class="cg-order-meta-item">
            <span data-i18n="timerLabel">Time left</span>
            <strong data-order-timer>--:--</strong>
          </p>
        </div>
      </div>

      <div class="cg-topbar-order-details">
        <section class="cg-order-detail-block cg-order-issues-block">
          <h3 data-i18n="issuesTitle">Issues</h3>
          <ul class="cg-issues" data-order-issues>
            <li data-i18n="noOrderYet">No active order yet.</li>
          </ul>
        </section>

        <section class="cg-order-detail-block cg-order-steps-block">
          <h3 data-i18n="stepsTitle">Steps</h3>
          <ol class="cg-steps">
            <li data-step-item="diagnosis">Diagnose</li>
            <li data-step-item="repair">Repair</li>
            <li data-step-item="finish">Finish</li>
          </ol>
        </section>
      </div>
    </div>
  </section>

  <div class="cg-layout">
    <aside class="cg-panel cg-order" aria-live="polite">
      <div class="cg-order-media" aria-hidden="true">
        <div class="cg-shoe-scene cg-order-scene">
          <img src="{{ '/assets/img/sora/mission-premium-shine.png' | relative_url }}" alt="" loading="lazy" decoding="async" data-shoe-scene-image>
        </div>
      </div>

      <section class="cg-queue-builder">
        <h3 data-i18n="incomingTitle">Incoming requests</h3>
        <div class="cg-queue-summaries">
          <p class="cg-queue-summary" data-incoming-summary data-i18n="incomingSummaryDefault">New requests waiting for your decision.</p>
          <p class="cg-queue-summary" data-queue-summary data-i18n="queueSummaryDefault">No queued client.</p>
        </div>
        <ul class="cg-queue-list" data-incoming-list>
          <li data-i18n="incomingEmpty">No incoming request.</li>
        </ul>
        <h3 data-i18n="queueTitle">Client queue</h3>
        <ul class="cg-queue-list" data-queue-list>
          <li data-i18n="queueEmpty">No queued client.</li>
        </ul>
      </section>

    </aside>

    <section class="cg-panel cg-workshop" aria-live="polite">
      <h2 data-i18n="workshopTitle">Workshop</h2>
      <p class="cg-stage-name" data-stage-name>Workshop ready</p>
      <p class="cg-stage-desc" data-stage-desc>Press “New client” to start an order.</p>

      <section class="cg-mini cg-diagnosis-panel" data-diagnosis-panel hidden>
        <h3 data-i18n="diagnosisPanelTitle">Detailed diagnosis</h3>
        <p data-i18n="diagnosisPanelHelp">Inspect what is broken and choose a repair type for each issue.</p>
        <div class="cg-diagnosis-list" data-diagnosis-list></div>
      </section>

      <section class="cg-mini cg-repair-plan" data-repair-plan hidden>
        <h3 data-i18n="repairPlanTitle">Repair setup</h3>
        <p class="cg-repair-line"><span data-i18n="repairIssueLabel">Target issue</span>: <strong data-repair-issue>-</strong></p>
        <p class="cg-repair-line"><span data-i18n="repairTypeLabel">Chosen type</span>: <strong data-repair-type>-</strong></p>

        <div class="cg-repair-choices-grid">
          <section class="cg-repair-choice-block">
            <p class="cg-field-label" data-i18n="repairMaterialLabel">Material</p>
            <div class="cg-choice-list" data-repair-material-list aria-live="polite"></div>
            <p class="cg-repair-feedback is-empty" data-material-feedback>Select one or more materials to see why this choice fits (or not).</p>
          </section>

          <section class="cg-repair-choice-block">
            <p class="cg-field-label" data-i18n="repairToolLabel">Tool</p>
            <div class="cg-choice-list" data-repair-tool-list aria-live="polite"></div>
            <p class="cg-repair-feedback is-empty" data-tool-feedback>Select one or more tools to see why this choice fits (or not).</p>
          </section>
        </div>

        <p class="cg-repair-hint" data-repair-hint>The right material + tool combo makes the repair mini-game easier.</p>
      </section>

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
  </div>

  <section class="cg-panel cg-log">
    <h2 data-i18n="logTitle">Workshop log</h2>
    <section class="cg-inventory">
      <h3 data-i18n="inventoryTitle">Inventory</h3>
      <ul class="cg-inventory-list" data-inventory-list>
        <li>Contact cement: x0</li>
      </ul>
    </section>
    <div class="cg-actions">
      <button class="btn btn-outline" type="button" data-reset-save data-i18n="resetProgressBtn">Reset progress</button>
    </div>
    <p class="cg-shortcuts" data-i18n="shortcutsText">Keyboard shortcuts: N (new client), A (main action), Space/Enter (mini-game).</p>
    <ul data-log-list>
      <li>Workshop ready.</li>
    </ul>
  </section>

  <section class="cg-panel cg-gallery">
    <h2>Mission visuals (Sora)</h2>
    <div class="cg-gallery-grid">
      <figure>
        <img src="{{ '/assets/img/sora/mission-premium-shine.png' | relative_url }}" alt="Premium shine mission" loading="lazy" decoding="async">
        <figcaption>Premium shine</figcaption>
      </figure>
      <figure>
        <img src="{{ '/assets/img/sora/mission-deep-cleaning.png' | relative_url }}" alt="Deep cleaning mission" loading="lazy" decoding="async">
        <figcaption>Deep cleaning</figcaption>
      </figure>
      <figure>
        <img src="{{ '/assets/img/sora/mission-leather-hydration.png' | relative_url }}" alt="Leather rehydration mission" loading="lazy" decoding="async">
        <figcaption>Leather rehydration</figcaption>
      </figure>
    </div>
    <p class="cg-gallery-note">These visuals are mapped to the first 3 missions. We can add the remaining missions incrementally.</p>
  </section>

  <div class="cg-popup-overlay" data-completion-popup hidden>
    <section class="cg-popup" role="dialog" aria-modal="true" aria-labelledby="cg-popup-title-en">
      <h2 id="cg-popup-title-en" data-i18n="completionPopupTitle">Order completed</h2>
      <p data-completion-popup-message data-i18n="completionPopupDefault">Ready for a new client?</p>
      <button class="btn btn-primary" type="button" data-completion-new-order data-i18n="completionPopupAction">Start order</button>
    </section>
  </div>

  <div class="cg-popup-overlay" data-week-popup hidden>
    <section class="cg-popup cg-week-popup" role="dialog" aria-modal="true" aria-labelledby="cg-week-popup-title-en">
      <h2 id="cg-week-popup-title-en" data-i18n="weekPopupTitle">Weekly summary</h2>
      <p class="cg-week-summary" data-week-popup-summary data-i18n="weekPopupDefault">Week completed. Review performance and improve your workshop.</p>

      <div class="cg-week-metrics">
        <p><span data-i18n="weekRevenueLabel">Service revenue</span>: <strong data-week-revenue>$0</strong></p>
        <p><span data-i18n="weekBonusLabel">Excellence bonus</span>: <strong data-week-bonus>$0</strong></p>
        <p><span data-i18n="weekTotalRevenueLabel">Total revenue</span>: <strong data-week-total-revenue>$0</strong></p>
        <p><span data-i18n="weekRentLabel">Weekly payroll</span>: <strong data-week-rent>$0</strong></p>
        <p><span data-i18n="weekQueuePenaltyLabel">Queue penalty</span>: <strong data-week-queue-penalty>$0</strong></p>
        <p><span data-i18n="weekSupplyExpenseLabel">Material purchases</span>: <strong data-week-supply-expense>$0</strong></p>
        <p><span data-i18n="weekMarketingExpenseLabel">Marketing</span>: <strong data-week-marketing-expense>$0</strong></p>
        <p><span data-i18n="weekUpgradeExpenseLabel">Tool upgrades</span>: <strong data-week-upgrade-expense>$0</strong></p>
        <p><span data-i18n="weekMonthlyChargesLabel">Monthly charges</span>: <strong data-week-monthly-charges>$0</strong></p>
        <p><span data-i18n="weekTotalExpenseLabel">Total expenses</span>: <strong data-week-total-expense>$0</strong></p>
        <p><span data-i18n="weekNetLabel">Revenue - expenses</span>: <strong data-week-net>$0</strong></p>
        <p><span data-i18n="weekReputationLabel">Reputation</span>: <strong data-week-reputation>0</strong></p>
        <p><span data-i18n="weekUnclaimedStockLabel">Unclaimed stock</span>: <strong data-week-unclaimed-stock>0 pair(s)</strong></p>
        <p><span data-i18n="weekCashAfterLabel">Closing cash</span>: <strong data-week-cash>$0</strong></p>
        <p><span data-i18n="weekHoursUsedLabel">Hours used</span>: <strong data-week-hours-used>0h / 40h</strong></p>
      </div>

      <h3 data-i18n="weekUpgradeTitle">Upgrade tools</h3>
      <ul class="cg-week-upgrades" data-week-upgrades></ul>

      <button class="btn btn-primary" type="button" data-week-next data-i18n="weekNextBtn">Start next week</button>
    </section>
  </div>

  <div class="cg-popup-overlay" data-supply-popup hidden>
    <section class="cg-popup cg-supply-popup" role="dialog" aria-modal="true" aria-labelledby="cg-supply-popup-title-en">
      <h2 id="cg-supply-popup-title-en" data-i18n="supplyPopupTitle">Order materials</h2>
      <p class="cg-week-summary" data-supply-popup-summary data-i18n="supplyPopupDefault">You can order every 8 hours. Delivery arrives the next day.</p>
      <ul class="cg-week-upgrades cg-supply-list" data-supply-list></ul>
      <button class="btn btn-outline" type="button" data-supply-close data-i18n="closeSupplyBtn">Close</button>
    </section>
  </div>
</div>
