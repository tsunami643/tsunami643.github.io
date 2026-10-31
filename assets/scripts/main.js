!function (global, document, HEROES, PATCH) {
  let analyticsScheduled = false;

  function loadAnalyticsWhenReady() {
    if (analyticsScheduled || document.readyState !== 'complete' ||
        document.documentElement.classList.contains('hero-loading')) {
      return;
    }

    analyticsScheduled = true;

    // Let the loaded sprite and initial hero content paint before analytics starts.
    global.requestAnimationFrame(function () {
      global.requestAnimationFrame(function () {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-W8W0GX01LX';
        document.head.appendChild(script);
      });
    });
  }

  function isTouchDevice() {
    return (global.matchMedia && global.matchMedia('(pointer: coarse)').matches) ||
      (global.navigator && global.navigator.maxTouchPoints > 0);
  }

  function mod(a, b) {
    return ((a % b) + b) % b;
  }

  function HeroList(heroes) {
    this.heroes = heroes;
  }

  HeroList.prototype = {
    find: function (hero) {
      for (let i = 0; i < this.heroes.length; i++) {
        if (this.heroes[i].toLowerCase() === hero.toLowerCase()) {
          return this.heroes[i];
        }
      }
      return false;
    },

    all: function () {
      return this.heroes;
    },

    next: function (hero) {
      return this.heroes[mod(this.heroes.indexOf(hero) + 1, this.heroes.length)];
    },

    prev: function (hero) {
      return this.heroes[mod(this.heroes.indexOf(hero) - 1, this.heroes.length)];
    },

    random: function () {
      return this.heroes[Math.floor(Math.random() * this.heroes.length)];
    }
  };

  function restartClass(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

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

  function initHeroGrid(el, input, loader) {
    let anticipationTimer = null;

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

      if (!link || event.defaultPrevented || event.button !== 0 ||
          event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
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

  function finishInitialHeroLoad() {
    document.documentElement.classList.remove('hero-loading');
    loadAnalyticsWhenReady();
  }

  function trackPageView(path) {
    if (typeof global.gtag === 'function') {
      global.gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title,
        page_location: global.location.href
      });
      return;
    }

    if (typeof global.ga === 'function') {
      global.ga('send', 'pageview', path);
    }
  }

  function getHeroFromLocation() {
    try {
      return heroes.find(decodeURIComponent(global.location.search.slice(1).replace(/\+/g, ' '))) || '';
    } catch {
      return '';
    }
  }

  function setHeroState(hero, baseTitle, replaceHistory) {
    const heroUrl = hero ? encodeURIComponent(hero).replace(/%20/g, '+') : '';
    const metadata = hero ? {
      title: hero + ` - Tsunami's Dota Hero Tips and Counters`,
      description: hero + ' spell interactions and counters from howdoiplay.com',
      url: homeUrl + '?' + heroUrl
    } : null;

    document.title = hero ? metadata.title : baseTitle;
    metadataTags.forEach(function (tag) {
      tag.element.setAttribute('content', hero ? metadata[tag.field] : tag.homeContent);
    });

    const search = hero ? '?' + heroUrl : '';

    if (global.location.search !== search) {
      // Restores already have the target hero in the URL; only new selections push.
      const method = replaceHistory || hero === getHeroFromLocation() ? 'replaceState' : 'pushState';
      global.history[method](null, document.title, hero ? search : global.location.pathname);
    }

    if (hero) {
      trackPageView('/' + heroUrl);
    }
  }

  const heroes = new HeroList(HEROES.concat().sort());
  const baseTitle = document.title;
  const homeUrl = document.querySelector('meta[property="og:url"]').getAttribute('content');
  const metadataTags = [
    { selector: 'meta[name="description"]', field: 'description' },
    { selector: 'meta[property="og:title"]', field: 'title' },
    { selector: 'meta[property="og:description"]', field: 'description' },
    { selector: 'meta[property="og:url"]', field: 'url' },
    { selector: 'meta[name="twitter:title"]', field: 'title' },
    { selector: 'meta[name="twitter:description"]', field: 'description' }
  ].map(function (tag) {
    const element = document.querySelector(tag.selector);
    return { element: element, field: tag.field, homeContent: element.getAttribute('content') };
  });
  const tipContainer = document.getElementById('tipcontainer');
  const heroInputShell = document.getElementById('heroinput');
  const heroInput = heroInputShell.querySelector('.hero-search-input');
  const heroList = document.querySelector('.herolist');
  const randomHero = document.getElementById('randomhero');

  const loader = new HeroLoader({
    heroes: heroes,
    patch: PATCH,
    el: tipContainer,
    urlFor: function (hero) {
      const fileName = hero.toLowerCase().replace(/ /ig, '_') + '.html';
      return global.JOKEMODE === true ? 'tips/joketips/' + fileName : 'tips/' + fileName;
    }
  });

  const input = new HeroInput({
    el: heroInput,
    container: document.getElementById('inputline'),
    heroes: heroes
  });

  input.onSelect(function (hero) {
    loader.load(hero.name).catch(function () {});
  });

  loader.onError(function () {
    input.setVal('');
    setHeroState('', baseTitle, true);
    finishInitialHeroLoad();
  });

  loader.onLoad(function (hero) {
    setHeroState(hero.name, baseTitle);
    input.collapse();
    loader.preload(heroes.prev(hero.name));
    loader.preload(heroes.next(hero.name));
    input.setVal(hero.name);

    if (isTouchDevice()) {
      input.blur();
    }

    finishInitialHeroLoad();
  });

  input.onClear(function () {
    setHeroState('', baseTitle);
    loader.collapse();
    input.expand();
    finishInitialHeroLoad();
  });

  initHeroGrid(heroList, input, loader);

  function restoreHeroFromLocation() {
    const hero = getHeroFromLocation();

    if (hero) {
      loader.load(hero, true).catch(function () {});
      input.collapse(true);
      input.setVal(hero);
      return;
    }

    loader.collapse(true);
    input.setVal('');
    input.expand(true);
    setHeroState('', baseTitle, true);
    finishInitialHeroLoad();
  }

  global.addEventListener('popstate', restoreHeroFromLocation);

  if (global.location.search) {
    restoreHeroFromLocation();
  }

  randomHero.addEventListener('click', function (event) {
    event.preventDefault();
    restartClass(randomHero, 'randomhero--spinning');

    const randomHeroName = heroes.random();
    loader.load(randomHeroName).catch(function () {});
    input.setVal(randomHeroName);
  });

  input.focus();

  global.addEventListener('load', loadAnalyticsWhenReady, { once: true });
  loadAnalyticsWhenReady();
}(this, this.document, this.HEROES, this.PATCH);
