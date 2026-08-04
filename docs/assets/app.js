/* db-ops site — i18n + dynamic rendering. No dependencies. */
(function () {
  'use strict';

  var LANG_KEY = 'dbops-lang';
  var dicts = { en: {}, zh: {} };
  var lang = localStorage.getItem(LANG_KEY);
  if (lang !== 'zh' && lang !== 'en') {
    lang = (navigator.language || '').toLowerCase().indexOf('zh') === 0 ? 'zh' : 'en';
  }

  var recipesData = [];
  var skillsData = [];

  function t(key) {
    var v = dicts[lang];
    var parts = String(key).split('.');
    for (var i = 0; i < parts.length && v != null; i++) v = v[parts[i]];
    return (v == null || typeof v === 'object') ? key : v;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pageName() {
    var p = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
    return p === 'index' ? 'home' : p;
  }

  function renderFeatures() {
    var grid = document.getElementById('features-grid');
    if (!grid) return;
    var items = (dicts[lang].features || {}).items;
    if (!items) return;
    grid.innerHTML = items.map(function (f) {
      return '<div class="card"><h3>' + esc(f.t) + '</h3><p>' + esc(f.d) + '</p></div>';
    }).join('');
  }

  function renderFaqs() {
    var list = document.getElementById('faq-list');
    if (!list) return;
    var items = (dicts[lang].faqs || {}).items;
    if (!items) return;
    list.innerHTML = items.map(function (f, i) {
      return '<div class="faq-row">' +
        '<h3 class="faq-q"><span class="faq-num">' + (i + 1) + '.</span>' + esc(f.q) + '</h3>' +
        '<p class="faq-a">' + esc(f.a) + '</p>' +
        '</div>';
    }).join('');
  }

  function recipeCard(r, idx) {
    var meta = r._meta || {};
    var dbs = (meta.databases || []).join(' / ') || 'any';
    var json = JSON.stringify(r, null, 2);
    return '<div class="recipe-block">' +
      '<h3 class="recipe-title">' + esc(r.name) + '</h3>' +
      '<p class="recipe-desc">' + esc(r.description || '-') + '</p>' +
      '<div class="recipe-json"><pre>' + esc(json) + '</pre>' +
      '<button class="copy-btn" data-idx="' + idx + '">' + esc(t('recipes.copy')) + '</button></div>' +
      '<div class="recipe-meta">' + esc(dbs) + ' · ' + esc(meta.author || 'community') + '</div>' +
      '</div>';
  }

  function renderRecipes() {
    var grid = document.getElementById('recipes-grid');
    var preview = document.getElementById('recipes-preview');
    var count = document.getElementById('recipes-count');
    var container = grid || preview;
    if (!container) return;
    if (count && grid) count.textContent = t('recipes.count').replace('{n}', recipesData.length);
    var list = grid ? recipesData : recipesData.slice(0, 4);
    if (!list.length) {
      container.innerHTML = '<p class="empty">' + esc(t('recipes.empty')) + '</p>';
      return;
    }
    container.innerHTML = list.map(recipeCard).join('');
  }

  function renderSkillList() {
    var list = document.getElementById('skill-list');
    if (!list) return;
    if (!skillsData.length) {
      list.innerHTML = '<p class="empty">' + esc(t('skills.empty')) + '</p>';
      return;
    }
    list.innerHTML = skillsData.map(function (s, i) {
      return '<a class="skill-row" href="' + esc(s.file) + '">' +
        '<span class="skill-num">' + (i + 1) + '.</span>' +
        '<span class="skill-name">' + esc(s.name) + '</span>' +
        '<span class="skill-desc">' + esc(s.description) + '</span>' +
        '<span class="skill-arrow">→</span>' +
        '</a>';
    }).join('');
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var val = t(key);
      if (val !== key) el.textContent = val; // keep static fallback when the key is missing
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      var val = t(key);
      if (val !== key) el.innerHTML = val;
    });
    var page = pageName();
    var title = t('meta.' + page);
    if (title !== 'meta.' + page) document.title = title;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    var toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.textContent = t('nav.lang');
    document.querySelectorAll('.nav .links a').forEach(function (a) {
      var href = (a.getAttribute('href') || '').replace('.html', '');
      if (href === 'index') href = 'home';
      a.classList.toggle('active', href.replace(/[^a-z0-9]/g, '') === page.replace(/[^a-z0-9]/g, ''));
    });
    renderFeatures();
    renderFaqs();
    renderRecipes();
    renderSkillList();
  }

  /* copy buttons: hero command + recipe JSON */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.copy-btn') : null;
    if (!btn) return;
    var text = btn.getAttribute('data-copy-command');
    if (!text) {
      var idx = Number(btn.getAttribute('data-idx'));
      var r = recipesData[idx];
      if (!r) return;
      text = JSON.stringify(r, null, 2);
    }
    var label = btn;
    var old = label.textContent;
    function done(ok) {
      label.textContent = ok ? t('recipes.copied') : t('hero.copy');
      setTimeout(function () { label.textContent = old; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    }
  });

  /* sticky nav: solid background once scrolled (transparent over the hero) */
  function onScroll() {
    var nav = document.querySelector('.nav');
    if (nav) nav.classList.toggle('scrolled', (window.scrollY || 0) > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById('lang-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      lang = lang === 'zh' ? 'en' : 'zh';
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode */ }
      apply();
    });
  }

  Promise.all([
    fetch('i18n/en.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }),
    fetch('i18n/zh.json').then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; })
  ]).then(function (res) {
    dicts.en = res[0];
    dicts.zh = res[1];
    apply();
  });

  fetch('data/recipes.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
    .then(function (data) {
      recipesData = data;
      renderRecipes();
    });

  fetch('data/skills.json').then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; })
    .then(function (data) {
      skillsData = data;
      renderSkillList();
    });
})();
