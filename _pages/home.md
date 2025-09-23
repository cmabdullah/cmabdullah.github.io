---
layout: splash
title: "Engineering Solutions That Work"
subtitle: "The personal website and blog of Abdullah"
hidden: true
permalink: /
classes: wide
header:
#  overlay_color: "#2c3e50"
#  overlay_filter: "0.5"      # transparency level
  overlay_image: "assets/images/mm-home-page-feature.jpg"
  caption: "Photo credit: [Unsplash](https://unsplash.com/)"
#  actions:
#    - label: "Download"
#      url: "https://github.com/mmistakes/minimal-mistakes/"
#    - label: "Download"
#      url: "https://github.com/mmistakes/minimal-mistakes/"
#    - label: "Email"
#      icon: "fas fa-fw fa-envelope-square"
#      url: "mailto:billyrick@rick.com"
#excerpt: >
#  A flexible two-column Jekyll theme. Perfect for building personal sites, blogs, and portfolios.<br />
#  <small><a href="https://github.com/mmistakes/minimal-mistakes/releases/tag/4.27.3">Latest release v4.27.3</a></small>
excerpt: >
  Dive into practical projects, code, and solutions that push boundaries.<br><br>
  **Related topics:** [Engineering](#) • [DevOps](#) • [Machine Learning](#)

feature_row:
  - image_path: /assets/images/mm-customizable-feature.png
    alt: "customizable"
    title: "Tech Writing"
    excerpt: "Articles on Java, Cloud, and IoT. Everything from the menus, sidebars, comments, and more can be configured or set with YAML Front Matter."
    url: "/articles/"
    btn_class: "btn--primary"
    btn_label: "Learn more"
  - image_path: /assets/images/mm-responsive-feature.png
    alt: "fully responsive"
    title: "Projects"
    excerpt: "See what I'm building and experimenting with. Built with HTML5 + CSS3. All layouts are fully responsive with helpers to augment your content."
    url: "/projects/"
    btn_class: "btn--primary"
    btn_label: "Explore"
  - image_path: /assets/images/mm-free-feature.png
    alt: "100% free"
    title: "Study Log"
    excerpt: "See what I'm building and experimenting with. Free to use however you want under the MIT License. Clone it, fork it, customize it... whatever!"
    url: "/docs/license/"
    btn_class: "btn--primary"
    btn_label: "Learn more"
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