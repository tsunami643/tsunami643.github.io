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

    return decodeURIComponent(search.slice(1)).replace(/\+/g, ' ');
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
    if (hero) {
      const heroUrl = encodeURIComponent(hero).replace(/%20/g, '+');
      document.title = hero + ' - ' + baseTitle;
      global.history.replaceState(null, document.title, '?' + heroUrl);
      trackPageView('/' + heroUrl);
      return;
    }

    document.title = baseTitle;
    global.history.replaceState(null, baseTitle, '?');
  }

  const heroes = new HeroList(HEROES.concat().sort());
  const baseTitle = document.title;
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
    arrow: heroInputShell.querySelector('.arrow'),
    heroes: heroes
  });

  input.onSelect(function (hero) {
    loader.load(hero.name).catch(function (error) {
      if (error.name === 'AbortError') {
        return;
      }

      input.setVal('');
      setHeroState('', baseTitle);
    });
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
    loader.load(matchedDeepLinkedHero, true).catch(function () {
      input.setVal('');
      setHeroState('', baseTitle);
    });
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
