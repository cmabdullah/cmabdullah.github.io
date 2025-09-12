---
layout: splash
title: "Hello, I'm Abdullah"
subtitle: "The personal website and blog of Abdullah"
hidden: true
permalink: /
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


{% include feature_row id="feature_row" %}

<div class="recent-posts">
  <h2>Recently published</h2>
  <div class="entries-grid">
    {% for post in site.posts limit:5 %}
      <article class="recent-post archive__item">
        {% if post.header.teaser %}
          <div class="archive__item-teaser">
            <a href="{{ post.url }}" class="post-thumbnail">
              <img src="{{ post.header.teaser | relative_url }}" alt="{{ post.title }}">
            </a>
          </div>
      {% endif %}
      <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
      <p class="post-meta">{{ post.date | date: "%b %-d, %Y" }} • Read in {{ post.read_time }} mins</p>
        <p>{{ post.excerpt | strip_html | truncatewords: 25 }}</p>
      </article>
  {% endfor %}
  </div>
</div>