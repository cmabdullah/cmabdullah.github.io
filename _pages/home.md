---
layout: splash
title: 'Engineering Solutions That Work'
permalink: /
classes: wide
header:
  overlay_color: "theme"
  eyebrow: "!i"
  actions_label: "Browse by section:"
  actions:
    - label: "Articles"
      url: "/articles/"
    - label: "About"
      url: "/about/"
excerpt: >
  Dive into practical projects, code, and solutions that push boundaries.<br><br>
  **Related topics:** [Engineering](/articles/) • [DevOps](/articles/) • [Machine Learning](/articles/)
---

## Recently Published

<div class="entries-grid">
  {% for post in site.posts limit:4 %}
    {% include archive-single.html type="grid" %}
  {% endfor %}
</div>

[View all posts »](/articles/){: .btn .btn--primary}