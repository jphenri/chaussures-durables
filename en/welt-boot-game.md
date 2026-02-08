---
layout: page
title: "Workshop game: build your welted boot"
description: "Pick materials, then stitch, glue, and assemble to build a durable boot."
lang: en
lang_ref: boot-game
permalink: /en/welt-boot-game/
keywords:
  - shoe game
  - welted boot
  - shoe workshop
  - cobbler game
  - durable footwear
---

<div class="boot-game" data-boot-game data-lang="en">
  <p class="boot-game-intro">
    Build a welted boot step by step. Final quality depends on your material choices and workshop actions.
  </p>

  <div class="boot-game-grid">
    <form class="boot-game-panel boot-game-setup" data-game-form>
      <h2>1. Pick materials</h2>

      <label for="game-upper-en">Upper leather</label>
      <select id="game-upper-en" name="upper" required>
        <option value="calfskin">Full-grain calfskin (city balance)</option>
        <option value="waxed">Waxed leather (rain resistance)</option>
        <option value="roughout">Oiled roughout (heavy duty)</option>
      </select>

      <label for="game-welt-en">Welt type</label>
      <select id="game-welt-en" name="welt" required>
        <option value="goodyear270">Goodyear 270 (versatile)</option>
        <option value="storm360">Storm welt 360 (wet weather)</option>
        <option value="norwegian">Norwegian stitch (very robust)</option>
      </select>

      <label for="game-outsole-en">Outsole</label>
      <select id="game-outsole-en" name="outsole" required>
        <option value="leather">Leather outsole (elegance)</option>
        <option value="dainite">Dainite rubber (all-round use)</option>
        <option value="commando">Commando lug (max traction)</option>
      </select>

      <label for="game-thread-en">Main thread</label>
      <select id="game-thread-en" name="thread" required>
        <option value="linen">Waxed linen (traditional)</option>
        <option value="polyester">Reinforced polyester (easy)</option>
        <option value="aramid">Aramid (ultra strong)</option>
      </select>

      <label for="game-glue-en">Glue type</label>
      <select id="game-glue-en" name="glue" required>
        <option value="neoprene">Neoprene (fast grip)</option>
        <option value="waterbased">Water-based (clean and flexible)</option>
        <option value="resin">Technical resin (high hold)</option>
      </select>

      <button class="btn btn-primary boot-game-start" type="submit" data-game-start>Start build</button>
      <p class="boot-game-meta">Game actions: <strong>stitch</strong>, <strong>glue</strong>, <strong>assemble</strong>.</p>
    </form>

    <section class="boot-game-panel boot-game-workshop" aria-live="polite">
      <h2>2. Workshop</h2>
      <p class="boot-game-status"><strong data-game-progress-text>Step 0/6</strong></p>
      <div class="boot-game-progress-track" aria-hidden="true">
        <div class="boot-game-progress-fill" data-game-progress></div>
      </div>

      <article class="boot-game-stage">
        <h3 data-game-step-title>Pick materials to begin.</h3>
        <p data-game-step-desc>The boot goes through 6 steps: lasting, upper stitching, welt positioning, outsole stitching, sole bonding, and finishing.</p>
        <p class="boot-game-hint" data-game-step-hint>Choose the right action at each stage to maximize quality.</p>
      </article>

      <div class="boot-game-actions">
        <button class="btn boot-game-action" type="button" data-game-action="coudre" disabled>Stitch</button>
        <button class="btn boot-game-action" type="button" data-game-action="coller" disabled>Glue</button>
        <button class="btn boot-game-action" type="button" data-game-action="assembler" disabled>Assemble</button>
      </div>

      <div class="boot-game-scoreboard">
        <p>Quality: <strong data-game-quality>--</strong></p>
        <p>Score: <strong data-game-score>--</strong></p>
      </div>

      <div class="boot-game-result" data-game-result></div>

      <button class="btn btn-outline boot-game-restart" type="button" data-game-restart>Reset</button>
    </section>
  </div>

  <section class="boot-game-panel boot-game-log-panel">
    <h2>Workshop log</h2>
    <ul class="boot-game-log" data-game-log>
      <li>Ready for a new boot build.</li>
    </ul>
  </section>
</div>
