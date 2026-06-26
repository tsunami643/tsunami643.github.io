!function (global) {
  function smoothScrollToTop(duration) {
    const start = global.scrollY;
    const startTime = 'now' in global.performance ? performance.now() : new Date().getTime();

    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    function scrollToTop(currentTime) {
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, start, -start, duration);
      global.scrollTo(0, run);

      if (timeElapsed < duration) {
        global.requestAnimationFrame(scrollToTop);
      }
    }

    if (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      global.scrollTo(0, 0);
      return;
    }

    global.requestAnimationFrame(scrollToTop);
  }

  function heroClassName(hero) {
    return hero.toLowerCase()
      .replace(/['\u2019-]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function heroHref(hero) {
    return '/?' + encodeURIComponent(hero).replace(/%20/g, '+');
  }

  function renderHeroGrid(el, heroes) {
    const fragment = document.createDocumentFragment();

    heroes.forEach(function (hero) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const name = document.createElement('span');

      item.className = 'herolist__hero ' + heroClassName(hero);
      link.className = 'herolist__hero__link';
      link.title = hero;
      link.href = heroHref(hero);
      name.className = 'herolist__hero__name';
      name.textContent = hero;

      link.appendChild(name);
      item.appendChild(link);
      fragment.appendChild(item);
    });

    el.textContent = '';
    el.appendChild(fragment);
  }

  function getHeroLink(target, container) {
    const link = target.closest('.herolist__hero__link');
    return link && container.contains(link) ? link : null;
  }

  function getHeroName(link) {
    const name = link.querySelector('.herolist__hero__name');
    return name ? name.textContent : '';
  }

  function isTrueMouseEnter(event, link) {
    return !event.relatedTarget || !link.contains(event.relatedTarget);
  }

  function HeroMini(options) {
    let anticipationTimer = null;
    const el = options.el;
    const heroes = options.heroes;
    const input = options.input;
    const loader = options.loader;

    renderHeroGrid(el, heroes.all());

    el.addEventListener('mouseover', function (event) {
      const link = getHeroLink(event.target, el);

      if (!link || !isTrueMouseEnter(event, link)) {
        return;
      }

      clearTimeout(anticipationTimer);
      anticipationTimer = global.setTimeout(function () {
        loader.preload(getHeroName(link));
      }, 200);
    });

    el.addEventListener('mouseout', function (event) {
      const link = getHeroLink(event.target, el);

      if (!link || !isTrueMouseEnter(event, link)) {
        return;
      }

      clearTimeout(anticipationTimer);
    });

    el.addEventListener('click', function (event) {
      const link = getHeroLink(event.target, el);

      if (!link) {
        return;
      }

      event.preventDefault();
      clearTimeout(anticipationTimer);

      const hero = getHeroName(link);
      input.setVal(hero);
      loader.load(hero).catch(function () {});
      smoothScrollToTop(300);
    });
  }

  global.HeroMini = HeroMini;
}(this);
