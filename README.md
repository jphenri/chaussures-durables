# Basic GH Page Template

Template Jekyll pour GitHub Pages avec:

- accueil moderne + sections prêtes a personnaliser
- blog bilingue FR/EN
- navigation responsive (desktop + mobile)
- base SEO (jekyll-seo-tag, flux feed, donnees structurees)
- deploiement automatique via GitHub Actions

## Demarrage rapide

1. Clone le depot

```bash
git clone https://github.com/jphenri/basic-gh-page-template.git
cd basic-gh-page-template
```

2. Installe les dependances Ruby/Jekyll

```bash
bundle install
```

3. Lance le serveur local

```bash
bundle exec jekyll serve
```

4. Ouvre le site local

```text
http://127.0.0.1:4000/basic-gh-page-template/
```

Le fichier `Gemfile` est inclus pour garder un environnement local proche de GitHub Pages.

## Personnalisation

Modifie `/_config.yml`:

- `title`, `description`
- `url`, `baseurl`
- `repository_url`
- `author`, `author_title`, `author_country`, `author_locality`

Note: pour un nouveau repo GitHub Pages, adapte `baseurl` avec le nom du repo (ou laisse vide pour un domaine custom).

Pages principales:

- FR: `/index.md`, `/blog.md`, `/projects.md`, `/contact.md`
- EN: `/en/index.md`, `/en/blog.md`, `/en/projects.md`, `/en/contact.md`

Articles:

- dossier `/_posts/`
- ajoute `lang: fr|en`
- ajoute `lang_ref:` identique sur les versions FR/EN d'un meme article pour activer le switch de langue

## Structure

```text
.
├── _config.yml
├── _includes/
├── _layouts/
├── _posts/
├── assets/
│   ├── css/main.css
│   └── js/main.js
├── en/
└── .github/workflows/jekyll-gh-pages.yml
```

## Publication GitHub Pages

Le workflow `/.github/workflows/jekyll-gh-pages.yml` deploie automatiquement sur la branche `main`.

Pense a activer GitHub Pages dans les parametres du depot:

- Source: GitHub Actions
