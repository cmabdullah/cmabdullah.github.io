---
layout: splash
title: "Progress over perfection"
permalink: /articles/
classes: wide
header:
  overlay_color: "#2c3e50"
  overlay_filter: "0.5"
#excerpt: "A collection of long form writing and tutorials — mostly about web development and design.<br><br>For shorter, more regular tidbits — peruse the **notes section**.<br><br>**Related topics:** [Time-lapse](#) • [Drawing](#) • [Tutorials](#) • [Static Sites](#)"
excerpt: >
  Build projects that matter, with insights drawn from **real-world experience**.<br><br>
  **Related topics:** [Engineering](#) • [DevOps](#) • [Machine Learning](#)
---

<!-- Articles Grid Section -->
<div class="entries-grid">
  {% for post in site.posts %}
    {% include archive-single.html type="grid" %}
  {% endfor %}
</div>