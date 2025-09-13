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


{% include feature_row id="feature_row" %}

<div class="recent-posts">
  <h2>Recently published</h2>
  {% for post in site.posts limit:5 %}
    <article class="recent-post">
      <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
      <p class="post-meta">{{ post.date | date: "%b %-d, %Y" }} • Read in {{ post.read_time }} mins</p>
      <p>{{ post.excerpt | strip_html | truncatewords: 25 }}</p>
    </article>
  {% endfor %}
</div>