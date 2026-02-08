---
layout: page
title: "Blog"
description: "Tous les articles publiés avec ce template."
lang: fr
lang_ref: blog
permalink: /blog/
---

{% assign lang_posts = site.posts | where: "lang", page.lang %}

{% if lang_posts.size > 0 %}
<div class="post-list">
  {% for post in lang_posts %}
    <article class="post-card">
      <p class="post-meta">{{ post.date | date: "%Y-%m-%d" }}</p>
      <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
      <p class="post-excerpt">{{ post.excerpt | strip_html | truncate: 170 }}</p>
    </article>
  {% endfor %}
</div>
{% else %}
<p class="empty-state">Aucun article pour le moment. Ajoute un fichier dans <code>_posts/</code>.</p>
{% endif %}
