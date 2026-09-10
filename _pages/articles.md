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

<!-- Topic filter bar -->
<div class="filter-bar" role="group" aria-label="Filter articles by topic">
  <button type="button" class="filter-bar__button is-active" data-filter="all">All</button>
  {% for category in site.categories %}
    <button type="button" class="filter-bar__button" data-filter="{{ category[0] | slugify }}">{{ category[0] }}</button>
  {% endfor %}
</div>

<!-- Articles Grid Section -->
<div class="entries-grid" id="articles-grid">
  {% for post in site.posts %}
    {% include archive-single.html type="grid" %}
  {% endfor %}
</div>

<script>
(function () {
  var bar = document.querySelector('.filter-bar');
  var grid = document.getElementById('articles-grid');
  if (!bar || !grid) return;
  var cards = grid.querySelectorAll('.grid__item');
  bar.addEventListener('click', function (e) {
    var btn = e.target.closest('.filter-bar__button');
    if (!btn) return;
    var filter = btn.getAttribute('data-filter');
    bar.querySelectorAll('.filter-bar__button').forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
    });
    cards.forEach(function (card) {
      var cats = (card.getAttribute('data-cats') || '').split(' ');
      var show = filter === 'all' || cats.indexOf(filter) !== -1;
      card.classList.toggle('is-hidden', !show);
    });
  });
})();
</script>