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

<div class="cobbler-game" data-cobbler-game data-lang="fr" data-issue="none" data-scene-base="{{ '/assets/img/sora/' | relative_url }}">
  <div class="cg-topbar">
    <p class="cg-intro" data-i18n="introText">Gère ton atelier: diagnostique, répare, finalise, puis fais grimper ta réputation.</p>
    <button class="btn cg-lang-toggle" type="button" data-lang-toggle aria-label="Passer en anglais">EN</button>
    <div class="cg-stats">
      <p><span data-i18n="dateLabel">Date</span>: <strong data-stat-date>2026-01-05</strong></p>
      <p><span data-i18n="scoreLabel">Score</span>: <strong data-stat-score>0</strong></p>
      <p><span data-i18n="cashLabel">Caisse</span>: <strong data-stat-money>$0</strong></p>
      <p><span data-i18n="weekLabel">Semaine</span>: <strong data-stat-week>1</strong></p>
      <p><span data-i18n="hoursLeftLabel">Heures restantes</span>: <strong data-stat-hours-left>40h / 40h</strong></p>
      <p><span data-i18n="marketingLabel">Marketing</span>: <strong data-stat-marketing>Aucun</strong></p>
      <p><span data-i18n="servicesUnlockedLabel">Services debloques</span>: <strong data-stat-services>2</strong></p>
      <p><span data-i18n="bestScoreLabel">Meilleur score</span>: <strong data-stat-best>0</strong></p>
      <p><span data-i18n="completedLabel">Commandes complétées</span>: <strong data-stat-completed>0</strong></p>
      <p><span data-i18n="reputationLabel">Réputation</span>: <strong data-stat-reputation>0</strong></p>
      <p><span data-i18n="levelLabel">Niveau</span>: <strong data-stat-level>1</strong></p>
      <p><span data-i18n="satisfactionLabel">Satisfaction client</span>: <strong data-stat-satisfaction>5/5</strong></p>
      <p class="cg-stars" data-satisfaction-stars aria-live="polite">★★★★★</p>
    </div>
  </div>

  <div class="cg-layout">
    <aside class="cg-panel cg-order" aria-live="polite">
      <div class="cg-order-cta">
        <button class="btn btn-primary" type="button" data-new-order data-i18n="newOrderBtn">Demarrer une commande</button>
      </div>

      <section class="cg-queue-builder">
        <h3 data-i18n="incomingTitle">Demandes entrantes</h3>
        <p class="cg-queue-summary" data-incoming-summary data-i18n="incomingSummaryDefault">Nouvelles demandes en attente.</p>
        <ul class="cg-queue-list" data-incoming-list>
          <li data-i18n="incomingEmpty">Aucune demande entrante.</li>
        </ul>
        <h3 data-i18n="queueTitle">File clients</h3>
        <p class="cg-queue-summary" data-queue-summary data-i18n="queueSummaryDefault">Aucun client en file.</p>
        <ul class="cg-queue-list" data-queue-list>
          <li data-i18n="queueEmpty">Aucun client en file.</li>
        </ul>
      </section>

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

      <section class="cg-mini cg-diagnosis-panel" data-diagnosis-panel hidden>
        <h3 data-i18n="diagnosisPanelTitle">Diagnostic détaillé</h3>
        <p data-i18n="diagnosisPanelHelp">Observe ce qui est brisé puis choisis un type de réparation pour chaque problème.</p>
        <div class="cg-diagnosis-list" data-diagnosis-list></div>
      </section>

      <section class="cg-mini cg-repair-plan" data-repair-plan hidden>
        <h3 data-i18n="repairPlanTitle">Plan de réparation</h3>
        <p class="cg-repair-line"><span data-i18n="repairIssueLabel">Problème ciblé</span>: <strong data-repair-issue>-</strong></p>
        <p class="cg-repair-line"><span data-i18n="repairTypeLabel">Type choisi</span>: <strong data-repair-type>-</strong></p>

        <label class="cg-field-label" for="repair-material" data-i18n="repairMaterialLabel">Matériel</label>
        <select id="repair-material" data-repair-material>
          <option value="">Choisir un matériel</option>
        </select>
        <p class="cg-repair-feedback is-empty" data-material-feedback>Choisis un matériel pour voir pourquoi c'est un bon ou mauvais choix.</p>

        <label class="cg-field-label" for="repair-tool" data-i18n="repairToolLabel">Outil</label>
        <select id="repair-tool" data-repair-tool>
          <option value="">Choisir un outil</option>
        </select>
        <p class="cg-repair-feedback is-empty" data-tool-feedback>Choisis un outil pour voir pourquoi c'est un bon ou mauvais choix.</p>

        <p class="cg-repair-hint" data-repair-hint>Le bon combo matériel + outil facilite le mini-jeu de réparation.</p>
      </section>

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

      <div class="cg-shoe-scene" aria-hidden="true">
        <img src="{{ '/assets/img/sora/mission-premium-shine.png' | relative_url }}" alt="" loading="lazy" decoding="async" data-shoe-scene-image>
      </div>
    </section>

    <aside class="cg-panel cg-tools">
      <h2 data-i18n="toolsTitle">Action</h2>
      <div class="cg-tools-grid">
        <button class="btn cg-tool-btn" type="button" data-main-action>Valider diagnostic</button>
      </div>

      <section class="cg-inventory">
        <h3 data-i18n="inventoryTitle">Inventaire</h3>
        <ul class="cg-inventory-list" data-inventory-list>
          <li>Colle contact: x0</li>
        </ul>
      </section>

      <div class="cg-actions">
        <button class="btn" type="button" data-wait-next-day data-i18n="waitNextDayBtn">Attendre demain</button>
        <button class="btn" type="button" data-buy-marketing data-i18n="buyMarketingBtn">Lancer marketing</button>
        <button class="btn" type="button" data-open-supply data-i18n="openSupplyBtn">Commander materiaux</button>
        <button class="btn btn-outline" type="button" data-reset-save data-i18n="resetProgressBtn">Réinitialiser progression</button>
      </div>

      <p class="cg-shortcuts" data-i18n="shortcutsText">Raccourcis clavier: N (nouveau client), A (action principale), Espace/Entrée (mini-jeu).</p>
    </aside>
  </div>

  <section class="cg-panel cg-log">
    <h2 data-i18n="logTitle">Journal d'atelier</h2>
    <ul data-log-list>
      <li>Atelier prêt.</li>
    </ul>
  </section>

  <section class="cg-panel cg-gallery">
    <h2>Missions illustrees (Sora)</h2>
    <div class="cg-gallery-grid">
      <figure>
        <img src="{{ '/assets/img/sora/mission-premium-shine.png' | relative_url }}" alt="Mission cirage premium" loading="lazy" decoding="async">
        <figcaption>Cirage premium</figcaption>
      </figure>
      <figure>
        <img src="{{ '/assets/img/sora/mission-deep-cleaning.png' | relative_url }}" alt="Mission nettoyage profond" loading="lazy" decoding="async">
        <figcaption>Nettoyage profond</figcaption>
      </figure>
      <figure>
        <img src="{{ '/assets/img/sora/mission-leather-hydration.png' | relative_url }}" alt="Mission rehydratation cuir" loading="lazy" decoding="async">
        <figcaption>Rehydratation cuir</figcaption>
      </figure>
    </div>
    <p class="cg-gallery-note">Ces visuels correspondent aux 3 premieres missions. On peut ajouter les autres au fur et a mesure.</p>
  </section>

  <div class="cg-popup-overlay" data-completion-popup hidden>
    <section class="cg-popup" role="dialog" aria-modal="true" aria-labelledby="cg-popup-title">
      <h2 id="cg-popup-title" data-i18n="completionPopupTitle">Commande terminee</h2>
      <p data-completion-popup-message data-i18n="completionPopupDefault">Pret pour un nouveau client ?</p>
      <button class="btn btn-primary" type="button" data-completion-new-order data-i18n="completionPopupAction">Demarrer une commande</button>
    </section>
  </div>

  <div class="cg-popup-overlay" data-week-popup hidden>
    <section class="cg-popup cg-week-popup" role="dialog" aria-modal="true" aria-labelledby="cg-week-popup-title">
      <h2 id="cg-week-popup-title" data-i18n="weekPopupTitle">Resume de semaine</h2>
      <p class="cg-week-summary" data-week-popup-summary data-i18n="weekPopupDefault">Fin de semaine. Analyse tes resultats puis ameliore ton atelier.</p>

      <div class="cg-week-metrics">
        <p><span data-i18n="weekRevenueLabel">Revenus services</span>: <strong data-week-revenue>$0</strong></p>
        <p><span data-i18n="weekBonusLabel">Bonus excellence</span>: <strong data-week-bonus>$0</strong></p>
        <p><span data-i18n="weekRentLabel">Loyer</span>: <strong data-week-rent>$0</strong></p>
        <p><span data-i18n="weekNetLabel">Net de semaine</span>: <strong data-week-net>$0</strong></p>
        <p><span data-i18n="weekQueuePenaltyLabel">Penalite file</span>: <strong data-week-queue-penalty>$0</strong></p>
        <p><span data-i18n="weekCashAfterLabel">Caisse finale</span>: <strong data-week-cash>$0</strong></p>
        <p><span data-i18n="weekHoursUsedLabel">Heures utilisees</span>: <strong data-week-hours-used>0h / 40h</strong></p>
      </div>

      <h3 data-i18n="weekUpgradeTitle">Ameliorer les outils</h3>
      <ul class="cg-week-upgrades" data-week-upgrades></ul>

      <button class="btn btn-primary" type="button" data-week-next data-i18n="weekNextBtn">Lancer la semaine suivante</button>
    </section>
  </div>

  <div class="cg-popup-overlay" data-supply-popup hidden>
    <section class="cg-popup cg-supply-popup" role="dialog" aria-modal="true" aria-labelledby="cg-supply-popup-title">
      <h2 id="cg-supply-popup-title" data-i18n="supplyPopupTitle">Commander materiaux</h2>
      <p class="cg-week-summary" data-supply-popup-summary data-i18n="supplyPopupDefault">Commande possible toutes les 8h. Livraison le lendemain.</p>
      <ul class="cg-week-upgrades cg-supply-list" data-supply-list></ul>
      <button class="btn btn-outline" type="button" data-supply-close data-i18n="closeSupplyBtn">Fermer</button>
    </section>
  </div>
</div>
