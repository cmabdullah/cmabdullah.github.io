---
layout: splash
title: 'Engineering Solutions That Work'
permalink: /
classes: wide
header:
  overlay_color: "theme"
  eyebrow: "!i"
  actions_label: "Related topics:"
  actions:
    - label: "Java"
      url: "/categories/#java"
    - label: "Reactive Spring"
      url: "/categories/#reactive-spring"
    - label: "AI"
      url: "/categories/#ai"
    - label: "DevOps"
      url: "/categories/#devops"
    - label: "Design Pattern"
      url: "/categories/#design-pattern"
    - label: "Machine Learning"
      url: "/categories/#machine-learning"
excerpt: >
  Dive into practical projects, code, and solutions that push boundaries.
# Categories shown in the "Recently Published" grid below.
# Remove/reorder to control what appears. Leave empty to show all categories.
home_categories:
  - DevOps
  - AI
  - Machine Learning
  - Design Pattern
  - Java
  - Reactive Spring
home_post_limit: 6
---

## Recently Published

<div class="entries-grid">
  {% assign limit = page.home_post_limit | default: 6 %}
  {% assign count = 0 %}

  {%- comment -%} 1) Pinned posts first (bypass category filter — an explicit feature). {%- endcomment -%}
  {% assign pinned = site.posts | where: "pinned", true %}
  {% for post in pinned %}
    {% if count >= limit %}{% break %}{% endif %}
    {% include archive-single.html type="grid" %}
    {% assign count = count | plus: 1 %}
  {% endfor %}

  {%- comment -%} 2) Fill the rest with recent posts from home_categories, skipping pinned. {%- endcomment -%}
  {% for post in site.posts %}
    {% if count >= limit %}{% break %}{% endif %}
    {% unless post.pinned %}
      {% if page.home_categories and page.home_categories != empty %}
        {% assign show = false %}
        {% for cat in page.home_categories %}
          {% if post.categories contains cat %}{% assign show = true %}{% break %}{% endif %}
        {% endfor %}
      {% else %}
        {% assign show = true %}
      {% endif %}
      {% if show %}
        {% include archive-single.html type="grid" %}
        {% assign count = count | plus: 1 %}
      {% endif %}
    {% endunless %}
  {% endfor %}
</div>

[View all posts »](/articles/){: .btn .btn--primary}