---
layout: splash
title: "Thoughts"
permalink: /thoughts/
classes: wide
header:
  overlay_color: "theme"
  eyebrow: "Thoughts"
excerpt: >
  Half-formed ideas, notes, and opinions I'm still thinking through, kept separate from the polished articles.
---

<div class="entries-media">
  {% assign thoughts = site.thoughts | sort: "date" | reverse %}
  {% for post in thoughts %}
    {% include archive-single-media.html %}
  {% endfor %}
  {% if thoughts.size == 0 %}
    <p>Nothing here yet.</p>
  {% endif %}
</div>
