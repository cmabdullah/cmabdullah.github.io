---
layout: splash
title: "HIIII, I'm Abdullah"
permalink: /articles
classes: wide
header:
  overlay_color: "#2c3e50"
  overlay_filter: "0.5"
#excerpt: "A collection of long form writing and tutorials — mostly about web development and design.<br><br>For shorter, more regular tidbits — peruse the **notes section**.<br><br>**Related topics:** [Time-lapse](#) • [Drawing](#) • [Tutorials](#) • [Static Sites](#)"
excerpt: >
  A collection of long form writing and tutorials — mostly about web development and design.<br><br>
  For shorter, more regular tidbits — peruse the **notes section**.<br><br>
  **Related topics:** [Time-lapse](#) • [Drawing](#) • [Tutorials](#) • [Static Sites](#)"
  <small><a href="https://github.com/mmistakes/minimal-mistakes/releases/tag/4.27.3">Latest release v4.27.3</a></small>
---

<!-- Articles Grid Section -->
<div class="entries-grid">
  {% for post in site.posts %}
    {% include archive-single.html type="grid" %}
  {% endfor %}
</div>