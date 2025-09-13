---
layout: splash
title: "Hello, I'm Abdullah"
subtitle: "The personal website and blog of Abdullah"
hidden: true
permalink: /articles
header:
  overlay_color: "#000"
  overlay_filter: "0.2"      # transparency level
  overlay_image: /assets/images/mm-home-page-feature.jpg
  #  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
  actions:
    - label: "Download"
      url: "https://github.com/mmistakes/minimal-mistakes/"
excerpt: >
  A flexible two-column Jekyll theme. Perfect for building personal sites, blogs, and portfolios.<br />
  <small><a href="https://github.com/mmistakes/minimal-mistakes/releases/tag/4.27.3">Latest release v4.27.3</a></small>
intro:
  - excerpt: 'Nullam suscipit et nam, tellus velit pellentesque at malesuada, enim eaque. Quis nulla, netus tempor in diam gravida tincidunt, *proin faucibus* voluptate felis id sollicitudin. Centered with `type="center"`'

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
