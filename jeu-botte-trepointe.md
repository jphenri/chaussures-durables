---
layout: page
title: "Jeu cordonnier : atelier de réparation"
description: "Simulation jouable de cordonnerie: diagnostic, réparation, finition, réputation et clients satisfaits."
lang: fr
lang_ref: boot-game
permalink: /jeu-botte-trepointe/
extra_css:
  - /assets/css/cobbler-game.css
extra_js:
  - /assets/js/cobbler-game.js
keywords:
  - jeu cordonnier
  - atelier réparation
  - chaussures durables
  - simulation bottier
  - trépointe
---

<div class="cobbler-game" data-cobbler-game data-lang="fr" data-issue="none">
  <div class="cg-topbar">
    <p class="cg-intro" data-i18n="introText">Gère ton atelier: diagnostique, répare, finalise, puis fais grimper ta réputation.</p>
    <button class="btn cg-lang-toggle" type="button" data-lang-toggle aria-label="Passer en anglais">EN</button>
  </div>

  <div class="cg-layout">
    <aside class="cg-panel cg-order" aria-live="polite">
      <h2 data-i18n="orderTitle">Commande</h2>
      <p><span data-i18n="clientLabel">Client</span>: <strong data-order-client>-</strong></p>
      <p><span data-i18n="difficultyLabel">Difficulté</span>: <strong data-order-difficulty>-</strong></p>
      <p><span data-i18n="timerLabel">Temps restant</span>: <strong data-order-timer>--:--</strong></p>

      <h3 data-i18n="issuesTitle">Problèmes</h3>
      <ul class="cg-issues" data-order-issues>
        <li data-i18n="noOrderYet">Aucune commande en cours.</li>
      </ul>

      <h3 data-i18n="stepsTitle">Étapes</h3>
      <ol class="cg-steps">
        <li data-step-item="diagnosis">Diagnostiquer</li>
        <li data-step-item="repair">Réparer</li>
        <li data-step-item="finish">Finition</li>
      </ol>
    </aside>

    <section class="cg-panel cg-workshop" aria-live="polite">
      <h2 data-i18n="workshopTitle">Atelier</h2>
      <p class="cg-stage-name" data-stage-name>Atelier prêt</p>
      <p class="cg-stage-desc" data-stage-desc>Clique sur “Nouveau client” pour commencer une commande.</p>

      <div class="cg-shoe-scene" aria-hidden="true">
        <div class="cg-shoe-upper"></div>
        <div class="cg-shoe-stitch"></div>
        <div class="cg-shoe-sole"></div>
        <div class="cg-shoe-heel"></div>
      </div>

      <div class="cg-mini-wrap">
        <section class="cg-mini" data-mini="timing" hidden>
          <h3 data-i18n="miniTimingTitle">Mini-jeu précision</h3>
          <p data-mini-timing-text>Clique au bon moment dans la zone verte.</p>
          <div class="cg-track" role="img" aria-label="Barre de timing">
            <div class="cg-zone" data-timing-zone></div>
            <div class="cg-cursor" data-timing-cursor></div>
          </div>
          <button class="btn cg-mini-action" type="button" data-action-timing data-i18n="miniTimingAction">Valider le geste</button>
        </section>

        <section class="cg-mini" data-mini="clicks" hidden>
          <h3 data-i18n="miniClicksTitle">Mini-jeu cadence</h3>
          <p data-mini-clicks-text>Clique rapidement pour atteindre le seuil avant la fin du chrono.</p>
          <div class="cg-fill-track" role="img" aria-label="Progression de réparation">
            <div class="cg-fill" data-clicks-fill></div>
          </div>
          <p class="cg-mini-counter" data-clicks-counter>0 / 0</p>
          <button class="btn cg-mini-action" type="button" data-action-clicks data-i18n="miniClicksAction">Action répétée</button>
        </section>

        <section class="cg-mini" data-mini="finish" hidden>
          <h3 data-i18n="miniFinishTitle">Mini-jeu finition</h3>
          <p data-mini-finish-text>Stoppe au bon moment pour une finition nette.</p>
          <div class="cg-track" role="img" aria-label="Barre de finition">
            <div class="cg-zone" data-finish-zone></div>
            <div class="cg-cursor" data-finish-cursor></div>
          </div>
          <button class="btn cg-mini-action" type="button" data-action-finish data-i18n="miniFinishAction">Finaliser</button>
        </section>
      </div>
    </section>

    <aside class="cg-panel cg-tools">
      <h2 data-i18n="toolsTitle">Outils</h2>
      <div class="cg-tools-grid">
        <button class="btn cg-tool-btn" type="button" data-tool="diagnostic" data-i18n="toolDiagnostic">Diagnostic</button>
        <button class="btn cg-tool-btn" type="button" data-tool="repair" data-i18n="toolRepair">Réparation</button>
        <button class="btn cg-tool-btn" type="button" data-tool="finish" data-i18n="toolFinish">Finition</button>
      </div>

      <div class="cg-stats">
        <p><span data-i18n="scoreLabel">Score</span>: <strong data-stat-score>0</strong></p>
        <p><span data-i18n="bestScoreLabel">Meilleur score</span>: <strong data-stat-best>0</strong></p>
        <p><span data-i18n="completedLabel">Commandes complétées</span>: <strong data-stat-completed>0</strong></p>
        <p><span data-i18n="reputationLabel">Réputation</span>: <strong data-stat-reputation>0</strong></p>
        <p><span data-i18n="levelLabel">Niveau</span>: <strong data-stat-level>1</strong></p>
        <p><span data-i18n="satisfactionLabel">Satisfaction client</span>: <strong data-stat-satisfaction>5/5</strong></p>
        <p class="cg-stars" data-satisfaction-stars aria-live="polite">★★★★★</p>
      </div>

      <div class="cg-actions">
        <button class="btn btn-primary" type="button" data-new-order data-i18n="newOrderBtn">Nouveau client</button>
        <button class="btn btn-outline" type="button" data-reset-save data-i18n="resetProgressBtn">Réinitialiser progression</button>
      </div>

      <p class="cg-shortcuts" data-i18n="shortcutsText">Raccourcis clavier: N (nouveau client), D (diagnostic), R (réparation), F (finition).</p>
    </aside>
  </div>

  <section class="cg-panel cg-log">
    <h2 data-i18n="logTitle">Journal d'atelier</h2>
    <ul data-log-list>
      <li>Atelier prêt.</li>
    </ul>
  </section>
</div>
