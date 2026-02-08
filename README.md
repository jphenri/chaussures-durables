# Chaussures Durables

Site Jekyll bilingue (FR/EN) dédié à l'éducation autour des chaussures et bottes durables:

- culture de la chaussure réparable
- histoire de la chaussure et de la trépointe
- comparaison fast fashion vs durable
- conseils d'entretien et astuces de longévité

## Démarrage local

1. Cloner le dépôt

```bash
git clone https://github.com/jphenri/chaussures-durables.git
cd chaussures-durables
```

2. Installer les dépendances

```bash
bundle install
```

3. Lancer Jekyll

```bash
bundle exec jekyll serve
```

4. Ouvrir le site

```text
http://127.0.0.1:4000/chaussures-durables/
```

## Pages principales

### Français

- `/` Accueil
- `/chaussures-durables/` Guide durable (types de trépointe + marques)
- `/histoire-chaussures-durables/` Histoire + fast fashion vs durable
- `/blog/` Articles
- `/projects/` Modèles et services
- `/contact/` Contact

### English

- `/en/` Home
- `/en/durable-shoes/` Durable guide
- `/en/shoe-history-and-welted-shoes/` History + fast fashion vs durable
- `/en/blog/` Posts
- `/en/projects/` Models and services
- `/en/contact/` Contact

## Articles de blog

Les articles sont dans `/_posts/`.

Pour publier un article bilingue:

1. Créer un post FR et un post EN.
2. Utiliser le même `lang_ref` pour les deux.
3. Définir `lang: fr` et `lang: en` selon le fichier.
4. Ajouter des `tags` utiles pour la lecture et le SEO.

Exemple minimal:

```yaml
---
title: "Titre"
lang: fr
lang_ref: mon-article
tags:
  - chaussures durables
---
```

## Images et identité

Les visuels sont stockés dans `assets/img/`:

- logos: `logo-chaussures-durables.svg`, `logo-chaussures-durables-mark.svg`
- illustrations: `atelier-cordonnerie.svg`, `chaussures-durables-hero.svg`
- schémas techniques trépointe: `assets/img/trepointes/`

## SEO

Le site utilise:

- `jekyll-seo-tag`
- pages FR/EN liées via `lang_ref`
- métadonnées (`title`, `description`, `keywords`)
- JSON-LD (WebPage, Person, etc.)

## Déploiement GitHub Pages

Le workflow `/.github/workflows/jekyll-gh-pages.yml` déploie automatiquement depuis `main`.

Dans GitHub > Settings > Pages:

- Source: **GitHub Actions**

## Contact

Nous n'avons pas encore de façon de nous contacter.

Désolé.
