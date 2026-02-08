---
layout: page
title: "Jeu atelier : fabrique ta botte trépointe"
description: "Choisis les matériaux puis couds, colles et assembles pour créer une botte durable."
lang: fr
lang_ref: boot-game
permalink: /jeu-botte-trepointe/
keywords:
  - jeu chaussure
  - botte trépointe
  - goodyear welt
  - cordonnerie
  - chaussure durable
---

<div class="boot-game" data-boot-game data-lang="fr">
  <p class="boot-game-intro">
    Monte une botte étape par étape. La qualité finale dépend de tes matériaux et de tes gestes à l’atelier.
  </p>

  <div class="boot-game-grid">
    <form class="boot-game-panel boot-game-setup" data-game-form>
      <h2>1. Choisis tes matériaux</h2>

      <label for="game-upper">Cuir de tige</label>
      <select id="game-upper" name="upper" required>
        <option value="calfskin">Box calf pleine fleur (équilibre ville)</option>
        <option value="waxed">Cuir gras ciré (résistant pluie)</option>
        <option value="roughout">Roughout huilé (usage intensif)</option>
      </select>

      <label for="game-welt">Type de trépointe</label>
      <select id="game-welt" name="welt" required>
        <option value="goodyear270">Goodyear 270° (polyvalent)</option>
        <option value="storm360">Storm welt 360° (mauvais temps)</option>
        <option value="norwegian">Cousu norvégien (très robuste)</option>
      </select>

      <label for="game-outsole">Semelle extérieure</label>
      <select id="game-outsole" name="outsole" required>
        <option value="leather">Cuir naturel (élégance)</option>
        <option value="dainite">Gomme Dainite (polyvalence)</option>
        <option value="commando">Commando crantée (adhérence max)</option>
      </select>

      <label for="game-thread">Fil principal</label>
      <select id="game-thread" name="thread" required>
        <option value="linen">Lin poissé (tradition)</option>
        <option value="polyester">Polyester renforcé (facile)</option>
        <option value="aramid">Aramide (ultra-résistant)</option>
      </select>

      <label for="game-glue">Type de colle</label>
      <select id="game-glue" name="glue" required>
        <option value="neoprene">Néoprène (prise rapide)</option>
        <option value="waterbased">Aqueuse (propre et souple)</option>
        <option value="resin">Résine technique (tenue forte)</option>
      </select>

      <button class="btn btn-primary boot-game-start" type="submit" data-game-start>Lancer la fabrication</button>
      <p class="boot-game-meta">Actions de jeu: <strong>coudre</strong>, <strong>coller</strong>, <strong>assembler</strong>.</p>
    </form>

    <section class="boot-game-panel boot-game-workshop" aria-live="polite">
      <h2>2. Atelier</h2>
      <p class="boot-game-status"><strong data-game-progress-text>Étape 0/6</strong></p>
      <div class="boot-game-progress-track" aria-hidden="true">
        <div class="boot-game-progress-fill" data-game-progress></div>
      </div>

      <article class="boot-game-stage">
        <h3 data-game-step-title>Sélectionne des matériaux pour commencer.</h3>
        <p data-game-step-desc>La botte passera par 6 étapes: forme, couture de tige, pose de trépointe, piqûre, collage semelle, finitions.</p>
        <p class="boot-game-hint" data-game-step-hint>Choisis la bonne action à chaque étape pour maximiser la qualité.</p>
      </article>

      <div class="boot-game-actions">
        <button class="btn boot-game-action" type="button" data-game-action="coudre" disabled>Coudre</button>
        <button class="btn boot-game-action" type="button" data-game-action="coller" disabled>Coller</button>
        <button class="btn boot-game-action" type="button" data-game-action="assembler" disabled>Assembler</button>
      </div>

      <div class="boot-game-scoreboard">
        <p>Qualité: <strong data-game-quality>--</strong></p>
        <p>Score: <strong data-game-score>--</strong></p>
      </div>

      <div class="boot-game-result" data-game-result></div>

      <button class="btn btn-outline boot-game-restart" type="button" data-game-restart>Recommencer</button>
    </section>
  </div>

  <section class="boot-game-panel boot-game-log-panel">
    <h2>Journal d’atelier</h2>
    <ul class="boot-game-log" data-game-log>
      <li>Prêt pour une nouvelle fabrication.</li>
    </ul>
  </section>
</div>
