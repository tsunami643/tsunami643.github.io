!function (global, document, HEROES, PATCH) {
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

  function getHeroFromLocation() {
    const search = global.location.search;

    if (!search || search === '?') {
      return '';
    }

    try {
      return decodeURIComponent(search.slice(1).replace(/\+/g, ' '));
    } catch {
      // Let the normal unknown-hero handling reset malformed links.
      return search.slice(1);
    }
  }

  function trackPageView(path) {
    if (typeof global.gtag === 'function') {
      global.gtag('event', 'page_view', {
        page_path: path,
        page_title: document.title
      });
      return;
    }

    if (typeof global.ga === 'function') {
      global.ga('send', 'pageview', path);
    }
  }

  function setHeroState(hero, baseTitle) {
    const heroUrl = hero ? encodeURIComponent(hero).replace(/%20/g, '+') : '';
    const metadata = hero ? {
      title: hero + ' Tips and Counters — Dota 2 | howdoiplay',
      description: hero + ' spell interactions and counters.',
      url: homeUrl + '?' + heroUrl
    } : null;

    document.title = hero ? metadata.title : baseTitle;
    metadataTags.forEach(function (tag) {
      tag.element.setAttribute('content', hero ? metadata[tag.field] : tag.homeContent);
    });

    if (hero) {
      global.history.replaceState(null, document.title, '?' + heroUrl);
      trackPageView('/' + heroUrl);
      return;
    }

    global.history.replaceState(null, baseTitle, '?');
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
    setHeroState('', baseTitle);
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
  });

  input.onClear(function () {
    setHeroState('', baseTitle);
    loader.collapse();
    input.expand();
  });

  new HeroMini({
    el: heroList,
    heroes: heroes,
    input: input,
    loader: loader
  });

  const deepLinkedHero = getHeroFromLocation();
  const matchedDeepLinkedHero = deepLinkedHero && heroes.find(deepLinkedHero);

  if (matchedDeepLinkedHero) {
    loader.load(matchedDeepLinkedHero, true).catch(function () {});
    input.collapse(true);
    input.setVal(matchedDeepLinkedHero);
  } else if (deepLinkedHero) {
    setHeroState('', baseTitle);
  }

  randomHero.addEventListener('click', function (event) {
    event.preventDefault();
    restartClass(randomHero, 'randomhero--spinning');

    const randomHeroName = heroes.random();
    loader.load(randomHeroName).catch(function () {});
    input.setVal(randomHeroName);
  });

  input.focus();
}(this, this.document, this.HEROES, this.PATCH);
