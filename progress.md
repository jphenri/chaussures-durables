Original prompt: Contexte : Je veux creer une nouvelle page web independante appelee "Simulation de Cordonnerie". Elle ne doit PAS modifier le jeu existant "Botte Trepointe". Creer un nouveau dossier : /simulation-cordonnerie/ avec une architecture modulaire vanilla JS, responsive, compatible GitHub Pages, incluant interface atelier, client entrant, diagnostic interactif, reparation, score et reputation.

## 2026-03-03 - Initialisation
- Arborescence `simulation-cordonnerie` creee avec les fichiers imposes.
- Base UI `index.html` + `css/style.css` posees pour une interface atelier responsive.
- Donnees clients ajoutees dans `simulation-cordonnerie/data/clients.json`.
- Architecture modulaire implementee:
  - `simulation-cordonnerie/js/levels.js` pour les niveaux, pannes, questions, reparations.
  - `simulation-cordonnerie/js/score.js` pour score/reputation.
  - `simulation-cordonnerie/js/game.js` pour orchestration, UI, boucle de temps.
- Hooks de test exposes:
  - `window.render_game_to_text`
  - `window.advanceTime(ms)`

## TODO / Suite
- Executer verification syntaxique JS.
- Verifier la simulation en local (serveur + capture) et ajuster si besoin.
- Confirmer l'absence de regression hors dossier `simulation-cordonnerie`.

## 2026-03-03 - Verification
- Verification ASCII: correction des occurrences `laçage` -> `lacage`.
- Verification syntaxique OK:
  - `node --check simulation-cordonnerie/js/levels.js`
  - `node --check simulation-cordonnerie/js/score.js`
  - `node --check simulation-cordonnerie/js/game.js`
- Boucle Playwright du skill tentee mais bloquee: package `playwright` absent et installation `npx playwright` non aboutie dans cet environnement.

## TODO / Suite (mise a jour)
- Si validation navigateur automatisee requise, installer `playwright` puis executer:
  - `node $HOME/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js ...`
- Ajouter eventuellement de nouveaux clients/pannes dans `clients.json` et `levels.js` pour plus de variete.
- Smoke test HTTP local OK (serveur temporaire):
  - `index.html`, `data/clients.json`, `js/game.js` accessibles.

## 2026-03-03 - Mecaniques avancees
- Migration de la simulation vers 5 mecaniques avancees:
  - Diagnostic interactif par zones cliquables (`diagnostic-canvas`).
  - Mini-jeu couture precision souris (`stitch-canvas`) pour la reparation `restitch`.
  - Gestion inventaire (semelles, fil, cuir, colle) avec blocage si stock insuffisant.
  - Timer optionnel via toggle (`timer-toggle`) et logique de timeout conditionnelle.
  - Systeme reputation borne 0-100, avec regle metier explicite: mauvais diagnostic = -10 reputation.
- Refonte modulaire:
  - `js/levels.js`: zones diagnostic, ressources par reparation, scenarios.
  - `js/score.js`: classes `ReputationMeter` et `WorkshopScoreSystem`.
  - `js/game.js`: classes `InventoryManager`, `DiagnosticZoneBoard`, `StitchPrecisionMiniGame`.
- Hooks de test conserves et enrichis: `window.render_game_to_text`, `window.advanceTime(ms)`.

## 2026-03-03 - Verification (mecaniques avancees)
- Verification ASCII: OK.
- Verification syntaxique JS: OK (`node --check` sur `levels.js`, `score.js`, `game.js`).
- Smoke test HTTP local: OK (`index.html`, CSS, JS, JSON accessibles).
- Tentative boucle Playwright du skill: bloquee, dependance `playwright` absente (`ERR_MODULE_NOT_FOUND`).

## TODO / Suite (mecaniques avancees)
- Installer `playwright` si validation e2e automatisee requise.
- Ajouter des paliers d'inventaire par niveau pour renforcer la difficulte.

## 2026-03-03 - Systeme de progression (3 niveaux)
- Ajout architecture demandee:
  - `Level` dans `simulation-cordonnerie/js/levels.js`
  - `Player` dans `simulation-cordonnerie/js/score.js`
  - `Game` dans `simulation-cordonnerie/js/game.js`
- Niveaux implementes:
  - Niveau 1 `Apprenti`: 1 client simultane, timer OFF, tutoriel guide.
  - Niveau 2 `Atelier Local`: 2 clients simultanes, timer ON, inventaire actif.
  - Niveau 3 `Maitre Cordonnerie`: clients exigeants, reparations plus complexes, penalite reputation elevee.
- Progression implementee:
  - XP + barre de progression + seuils de niveau.
  - Passage automatique de niveau selon XP.
  - Fonction reset globale (`reset-game-btn` + `window.resetCobblerSimulation`).
- UI adaptee:
  - Bandeau progression XP, nom du niveau, onglets clients actifs, tutoriel, bouton reset.
- Verification:
  - `node --check` OK sur `levels.js`, `score.js`, `game.js`.
  - Smoke test HTTP local OK.

## TODO / Suite
- Executer validation Playwright si `playwright` devient disponible dans l'environnement.

## 2026-03-03 - Immersion clients
- `data/clients.json` remplace par 10 clients avec mini-histoires, exigence, dialogue pre-mission et impact reputation.
- Ajout UI de briefing mission:
  - `mission-dialogue-box`
  - `mission-dialogue-text`
  - `accept-mission-btn`
- Flux gameplay mis a jour:
  - Nouveau phase `briefing` avant diagnostic.
  - Demarrage diagnostic uniquement apres `Accepter la mission`.
- Generation aleatoire client conservee et journalisee au lancement de jour.
- Impact personnalite sur score/reputation:
  - `levels.js`: helper `getClientPersonalityImpact`.
  - `score.js`: multiplicateur score succes/echec + delta reputation par personnalite.
  - Regle metier preservee: mauvais diagnostic = au moins -10 reputation.
- Validation:
  - `node --check` OK (`levels.js`, `score.js`, `game.js`).
  - Smoke test HTTP local OK.

## 2026-03-03 - Refonte design immersive atelier
- Refonte HTML du haut de page:
  - Barre de reputation visuelle (`reputation-meter`) avec ARIA `progressbar`.
  - Switch CSS mode contraste eleve (`contrast-toggle`).
  - Tooltips educatifs sur sections (`.edu-tip`, attribut `data-tip`).
- Refonte CSS complete (`simulation-cordonnerie/css/style.css`):
  - Palette atelier demandee: brun cuir, beige, vert durable, rouge alerte.
  - Timer renforce visuellement (`timer-badge`).
  - Inventaire plus lisible (etats low/empty visibles).
  - Animations legeres reparation: success/fail + alert pulse.
  - Responsive mobile/tablette/desktop.
  - Mode contraste eleve via CSS pur (`body:has(#contrast-toggle:checked)`).
- Accessibilite:
  - ARIA progressbar reputation et `aria-valuetext` mises a jour en JS.
  - Timer en `role=status` + `aria-live=polite`.
  - Tooltips clavier/souris (buttons focusables).
- Verification:
  - `node --check` OK sur `js/game.js`.
  - Smoke test HTTP local OK (`index.html`, `style.css`, `game.js`).

## 2026-03-03 - Ajustement visuel apres retour utilisateur
- Rework visuel oriente atelier premium (moins plat):
  - Canvas atelier redessine avec profondeur (lumiere, etablis, etageres, HUD canvas plus propre).
  - Canvas diagnostic redessine avec grille technique et overlay attente plus lisible.
- CSS retouche pour un rendu plus contraste et moins "fade":
  - Cartes/textures plus marquees.
  - Boutons et panneaux renforces.
  - Outiltips mieux alignes.
- Mode contraste eleve rendu robuste:
  - classe `body.high-contrast` pilotee en JS.
  - persistance via `localStorage`.
- Accessibilite:
  - `prefers-reduced-motion` coupe les animations/transition.
- Validation:
  - `node --check` OK sur `js/game.js`.
  - Smoke test HTTP local OK.

## 2026-03-03 - Diagnostic sur fichier Chaussure_icone.svg
- UI diagnostic migree pour utiliser le fichier source `assets/img/sora/Chaussure_icone.svg` dans le panneau Chaussure.
- Le SVG interactif garde 4 zones cliquables (`semelle`, `talon`, `couture`, `empeigne`) via hitboxes superposees dans `simulation-cordonnerie/index.html`.
- CSS ajuste pour rendre l'icone source lisible + overlays discrets (`shoe-illustration`, `part-shape`).
- Logique metier preservee (selection piece, diagnostic, actions, historique, reset) sans changement de `game.js`.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.
  - Presence des zones/chemin SVG confirmee dans `index.html`.
- Test Playwright du skill re-tente mais bloque: package `playwright` absent (`ERR_MODULE_NOT_FOUND`).

## 2026-03-03 - Correction mecanique apres integration Chaussure_icone.svg
- `simulation-cordonnerie/js/game.js` remplace par une orchestration gameplay reconnectee aux modules metier existants:
  - imports `levels.js` (`createDayQueue`, `resolveZoneInspection`, `getLevelByXp`, `REPAIR_OPTIONS`).
  - import `Player` depuis `score.js`.
  - gestion client courant, file d'attente par jour, progression niveau/XP, timer, inventaire, score/reputation.
- Regles metier restaurees:
  - mauvais diagnostic => penalite reputation via `applyWrongDiagnostic` (>= -10).
  - reparation validee => score/XP/reputation via `applySuccessfulRepair`.
  - stock insuffisant => blocage reparation + penalite inventaire.
- UI premium conservee (SVG interactif 4 zones) + actions/historique fonctionnels.
- Ajustements robustesse UI:
  - `diagnostic-text` passe en `white-space: pre-line`.
  - `<image>` SVG avec `pointer-events="none"` pour ne pas bloquer les clics des hitboxes.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.
  - Selecteurs/IDs requis toujours presents.
- Limite de test: Playwright indisponible localement (package `playwright` absent).

## 2026-03-03 - Ajustement geometrique SVG botte
- Refonte geometrique du SVG inline dans `simulation-cordonnerie/index.html` pour supprimer la distorsion visuelle.
- Contraintes appliquees:
  - semelle avec base horizontale (meme Y aux extremites),
  - talon aligne sur l'extremite arriere de la semelle,
  - empeigne positionnee au-dessus de la semelle sans chevauchement incoherent,
  - coutures tracees en paths fins et alignes au-dessus de l'empeigne.
- Zones interactives `semelle`, `talon`, `couture`, `empeigne` conservees avec `data-part`.
- CSS SVG mis a jour (classes `upper-main`, `sole-base`, `heel-block`, `stitch-line`, `part-shape-line`).

## 2026-03-03 - Rework silhouette botte (lisibilite)
- Refonte du dessin SVG de la botte pour une silhouette plus credible (tige haute, quartier, bout, laçage, semelle montee).
- Labels repositionnes a l'interieur du viewBox pour eviter les textes tronques.
- Geometrie preservee:
  - semelle base horizontale,
  - talon aligne a l'arriere de la semelle,
  - couture au-dessus de l'empeigne avec hitbox elargie.
- Classes CSS remplacees/ajoutees: `boot-upper`, `boot-shaft`, `boot-quarter`, `boot-toecap`, `heel-cap`, `sole-tread`, `lace-seg`.
- Mecanique JS inchangee (`node --check` OK).

## 2026-03-03 - Randomisation type chaussure + reparations metier
- `simulation-cordonnerie/js/game.js` recree completement avec un state central + `render()`.
- Ajout des catalogues metier demandes:
  - `SHOE_TYPES` (4 familles): trepointe plate, trepointe modulaire, talons hauts, sandale.
  - `REPAIRS` avec metadonnees reelles: difficulte (1-5), temps estime, impact reputation, prix simule, cout de stock.
- Ajout du moteur pannes/reparations:
  - `PROBLEM_LIBRARY` par type, piece ciblee (`semelle`, `talon`, `couture`, `empeigne`) et reparations compatibles.
  - `generateClient()` genere un type de chaussure aleatoire et 1 a 3 problemes compatibles.
  - `applyRepair(repairId)` valide compatibilite type/piece, bloque si stock vide, applique score/reputation/XP, et penalise les erreurs.
- Regles metier couvertes:
  - mauvais diagnostic/reparation -> penalite reputation via `Player.applyWrongDiagnostic` (minimum -10).
  - reparation parfaite -> bonus score.
  - difficulte elevee -> gain reputation superieur.
  - incompatibilites bloquees (sandale vs ressemelage trepointe, talon aiguille vs Dainite, etc.).
- UI branchee sur la logique:
  - mise a jour diagnostic, severite, actions filtrees, historique, chips header.
  - icone chaussure dynamique (`shoe-type-image`) selon type client.
- Hooks exposes:
  - `window.generateClient`, `window.applyRepair`, `window.SHOE_TYPES`, `window.REPAIRS`, `window.render_game_to_text`, `window.advanceTime`.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.
  - Test Playwright du skill tente mais bloque dans l'environnement: package `playwright` manquant (`ERR_MODULE_NOT_FOUND`).

## 2026-03-03 - Fix affichage type chaussure
- Correction du bug de rendu multi-icone dans `simulation-cordonnerie/js/game.js`:
  - `setShoeVisual()` passe `shoe-type-image` en `display: block` (au lieu de `""`) pour contourner la classe CSS `display: none`.
- Ajustement de la generation client:
  - ajout `lastShoeTypeId` dans le state pour eviter deux types identiques consecutifs.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Maj fichiers image utilisateur
- `simulation-cordonnerie/js/game.js` mis a jour pour utiliser:
  - `assets/img/sora/birkenstock.png`
  - `assets/img/sora/louboutin.png`
- Ajout d'un fallback de nom pour talons hauts: `loubloutin.png` si present en production.
- Verification syntaxique: `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Mapping metier trepointe modulaire (jaune/bleu/rose)
- Adaptation logique metier pour `trepointe_modulaire` dans `simulation-cordonnerie/js/game.js`:
  - jaune (`semelle`) -> changement semelle modulaire (avant/talon).
  - bleu (`couture`) -> changement couture trepointe.
  - rose (`empeigne`) -> cirage et nettoyage.
- Ajustements de pannes/reparations:
  - `module_talon_use` remappe sur `part: semelle`.
  - labels reparation alignes metier (semelle modulaire, couture trepointe, cirage/nettoyage).
  - clic `talon` normalise vers `semelle` pour ce type.
- Ajustement UX:
  - diagnostic ajoute un repere couleur explicite (jaune/bleu/rose).
  - tooltip et libelles dynamiques selon type de chaussure.
- Ajustement CSS dans `simulation-cordonnerie/css/style.css`:
  - guide couleur visuel pour les zones modulaire via `data-shoe-type="trepointe_modulaire"`.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Mapping talons hauts (jaune/blanc/rose)
- `simulation-cordonnerie/js/game.js` etendu pour `talons_hauts`:
  - jaune (`talon`) -> "Changement talon caoutchouc".
  - blanc (`semelle`) -> "Changement semelle".
  - rose (`empeigne`/`couture`) -> "Cirage et nettoyage".
- Ajouts metier:
  - nouvelle reparation `cirage_nettoyage_talons_hauts` (part `empeigne`).
  - nouvelle panne `cuir_talon_haut_terni` liee a cette reparation.
  - ajout de cette panne au `problemPool` des talons hauts.
- UX dynamique:
  - label de piece + repere couleur adaptes par type (`getPartGuide`).
  - `couture` remappe vers `empeigne` sur talons hauts.
- CSS:
  - nouvelles couleurs de zones pour `data-shoe-type="talons_hauts"` dans `simulation-cordonnerie/css/style.css`.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Mapping sandales (rouge/jaune)
- Ajout du guide `SANDAL_PART_GUIDE` dans `simulation-cordonnerie/js/game.js`:
  - rouge (`semelle`/`talon`) -> "Changement de semelle".
  - jaune (`empeigne`/`couture`) -> "Changement de lit de pied".
- Ajustements metier sandales:
  - `remplacement_semelle_liege` renomme en "Changement de semelle".
  - `refection_lit_plantaire` renomme en "Changement de lit de pied" et remappe sur `part: empeigne`.
  - `lit_plantaire_affaisse` remappe sur `part: empeigne`.
  - `problemPool` sandales recentre sur semelle/lit de pied.
- Normalisation clics:
  - `talon -> semelle`, `couture -> empeigne` pour le type `sandale`.
- Filtrage d'actions par guide couleur:
  - `getActionsForSelectedPart()` utilise `allowedRepairIds` du guide de type.
- CSS:
  - ajout des couleurs de zones pour `data-shoe-type="sandale"` dans `simulation-cordonnerie/css/style.css`.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Boutons d'action aligns aux couleurs
- `renderActions()` met maintenant les boutons en couleur selon la zone active de la picture (`jaune`, `bleu`, `rose`, `rouge`, `blanc`).
- Ajout d'un rappel au-dessus des boutons: `Couleur active: ... -> ...`.
- `style.css` enrichi avec variantes de boutons `.action-color-*` (border/texte/hover coherents).
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Fix bug hitboxes par photo
- Correction du bug principal signale (zones cliquables non alignees aux photos):
  - ajout `INTERACTIVE_LAYOUTS` dans `simulation-cordonnerie/js/game.js` avec geomettries par type:
    - `trepointe_plate`
    - `trepointe_modulaire`
    - `talons_hauts`
    - `sandale`
- `setShoeVisual()` applique maintenant dynamiquement:
  - cadrage image (`x/y/width/height/preserveAspectRatio`) par type,
  - paths des zones interactives (`semelle`, `talon`, `empeigne`, `couture`) par photo,
  - masquage du trait de couture source (`src-stitch`) hors `trepointe_plate`.
- Impact attendu:
  - les clics correspondent visuellement a la photo active,
  - les actions proposees restent filtrees par type + couleur metier de la photo.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Ajustement ciblé talons hauts
- Recalage du layout interactif `talons_hauts` dans `INTERACTIVE_LAYOUTS` (`simulation-cordonnerie/js/game.js`):
  - `imageFrame` remis en base 188.76117x127.00133.
  - nouveaux paths pour `semelle`, `talon`, `empeigne`, `couture` afin d'eviter les zones trop basses/oversize.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Sandale: suppression couture, collage semelle uniquement
- `simulation-cordonnerie/js/game.js` adapte pour la regle metier utilisateur:
  - sandale = uniquement collage de semelle.
- Changements:
  - `SANDAL_PART_GUIDE` limite a `semelle`/`talon` avec action `Collage de semelle`.
  - actions autorisees limitees a `recollage_semelle`.
  - `problemPool` sandale limite a `decollement_semelle_sandale`.
  - remap `sandale`: `talon`, `couture`, `empeigne` -> `semelle` (robustesse).
  - ajout `applyPartVisibility()` pour masquer `couture` et `empeigne` quand type = sandale.
- `simulation-cordonnerie/css/style.css`:
  - styles sandale simplifies en rouge (semelle/talon) uniquement.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Modulaire sans talon
- `simulation-cordonnerie/js/game.js` ajuste pour masquer la zone `talon` sur `trepointe_modulaire`.
- `applyPartVisibility()` gere maintenant explicitement les pieces visibles par type:
  - modulaire: `semelle`, `empeigne`, `couture`.
  - sandale: `semelle`, `talon`.
- Retrait de l'entree `talon` de `MODULAR_PART_GUIDE`.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Sandale sans talon
- Ajustement final demande utilisateur:
  - type `sandale` affiche uniquement la zone `semelle` (plus de `talon`, `empeigne`, `couture`).
- Fichiers:
  - `simulation-cordonnerie/js/game.js`: `applyPartVisibility()` pour `sandale` -> `new Set(["semelle"])`, `SANDAL_PART_GUIDE` reduit a `semelle`.
  - `simulation-cordonnerie/css/style.css`: style sandale applique uniquement a `semelle`.
- Verification:
  - `node --check simulation-cordonnerie/js/game.js` OK.

## 2026-03-03 - Mini-jeu par reparation (nouvelle mecanique)
- Ajout d'un mini-jeu obligatoire avant validation de chaque reparation dans `simulation-cordonnerie/js/game.js`.
- Nouveau state central `miniGame` (active, repairId, part, targets, progression, misses).
- Nouveau flux:
  - clic bouton action -> lancement mini-jeu par piece (`semelle`, `talon`, `couture`, `empeigne`),
  - validation des cibles (ordre impose pour couture/semelle),
  - succes mini-jeu -> `applyRepair(..., { fromMiniGame: true, miniGameResult })`,
  - bonus score/reputation selon precision/perfect run.
- Ajouts UI/UX:
  - panel mini-jeu deja present dans `index.html` maintenant pilote en JS,
  - bouton `Annuler mini-jeu`,
  - verrouillage de changement de piece pendant mini-jeu,
  - actions desactivees pendant mini-jeu en cours.
- Accessibilite:
  - cibles mini-jeu focusables clavier (`tab`, `enter`, `space`) avec labels ARIA.
- Hook test enrichi:
  - `window.render_game_to_text` inclut maintenant l'etat `miniGame`.
- Styles ajoutes dans `simulation-cordonnerie/css/style.css`:
  - `.mini-game-panel`, `.mini-game-svg`, `.mini-game-track`, `.mini-target`, etats `is-next`/`is-hit`.

## Verification 2026-03-03
- `node --check simulation-cordonnerie/js/game.js` OK
- `node --check simulation-cordonnerie/js/levels.js` OK
- `node --check simulation-cordonnerie/js/score.js` OK
- Boucle Playwright du skill re-tentee mais bloquee: package `playwright` absent (`ERR_MODULE_NOT_FOUND`).

## 2026-03-03 - Mini-jeux specialises par type de reparation
- Evolution du systeme mini-jeu dans `simulation-cordonnerie/js/game.js` avec 4 modes:
  - `points` (par defaut, ex couture trepointe),
  - `scrub` pour reparations de type cirage/nettoyage,
  - `timing` pour reparations de type collage/recollage (clic precis sur barre),
  - `multi_click` pour interventions talon (clics repetes).
- Regles de mapping mini-jeu:
  - nom/id contenant `cirage` ou `nettoyage` -> `scrub`,
  - nom/id contenant `collage` / `recollage` -> `timing`,
  - piece `talon` -> `multi_click`,
  - sinon -> `points`.
- Ajout cycle de vie robuste:
  - ticker interne pour la barre de timing,
  - arret du ticker sur cancel/fail/timeout/reset/nouveau client,
  - verrouillage des actions tant que mini-jeu actif conserve.
- Accessibilite et controle:
  - mini-game SVG focusable,
  - clavier `Enter`/`Space` supporte pour timing, multi-click et scrub (fallback clavier),
  - pointeur supporte pour scrub (frotter maintenu + mouvement).
- `render_game_to_text` enrichi avec `miniGame.mode` et metriques de progression (`scrubProgress`, `timingPos`, `requiredClicks`).
- CSS ajoute dans `simulation-cordonnerie/css/style.css` pour les 3 nouveaux visuels mini-jeu:
  - zone de frottage + barre de progression,
  - barre timing + fenetre cible + marqueur,
  - zone talon multi-clic.

## Verification 2026-03-03 (mini-jeux specialises)
- `node --check simulation-cordonnerie/js/game.js` OK
- `node --check simulation-cordonnerie/js/levels.js` OK
- `node --check simulation-cordonnerie/js/score.js` OK
- Playwright du skill non executable localement: package `playwright` absent (`ERR_MODULE_NOT_FOUND`).
