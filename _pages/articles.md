---
layout: splash
title: "Progress over perfection"
permalink: /articles/
classes: wide
header:
  overlay_color: "theme"
  eyebrow: "Articles"
  eyebrow_count: true
excerpt: >
  Build projects that matter, with insights drawn from **real-world experience**.
---

<!-- Articles Grid Section -->
<div class="entries-grid">
  {% for post in site.posts %}
    {% include archive-single.html type="grid" %}
  {% endfor %}
</div>