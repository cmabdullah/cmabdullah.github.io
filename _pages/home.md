---
layout: splash
title: "Engineering Solutions That Work"
permalink: /
classes: wide
header:
  overlay_color: "#2c3e50"
  overlay_filter: "0.5"
excerpt: >
  Dive into practical projects, code, and solutions that push boundaries.<br><br>
  **Related topics:** [Engineering](#) • [DevOps](#) • [Machine Learning](#)
---

<div class="recent-posts" style="width: 50%; float: left; padding-right: 1rem;">
  <h2>Recently published</h2>
  <div class="entries-list" style="text-align: left;">
    {% for post in site.posts limit:5 %}
      <article class="recent-post archive__item" style="margin-bottom: 2rem; padding-bottom: 1.5rem;">
        <h3 style="margin-bottom: 0.2em;"><a href="{{ post.url }}" style="text-decoration: none; color: white; font-weight: bold; font-size: 1.2em;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">{{ post.title }}</a></h3>
        <p class="post-meta" style="color: #888; font-size: 0.9em; margin: 0.2em 0;">{{ post.date | date: "%b %-d, %Y" }}{% if site.words_per_minute %} • {% assign words = post.content | number_of_words %}{% assign reading_time = words | divided_by: site.words_per_minute %}{% if reading_time == 0 %}{% assign reading_time = 1 %}{% endif %} {{ reading_time }} min read{% endif %}</p>
        <p style="margin: 0.3em 0;">{{ post.excerpt | strip_html | truncatewords: 25 }}</p>
        {% if post.header.teaser %}
          <div class="archive__item-teaser" style="margin-top: 1rem;">
            <a href="{{ post.url }}" class="post-thumbnail">
              <img src="{{ post.header.teaser | relative_url }}" alt="{{ post.title }}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px;">
            </a>
          </div>
        {% endif %}
      </article>
    {% endfor %}
  </div>
</div>
<div style="clear: both;"></div>