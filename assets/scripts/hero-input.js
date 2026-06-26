!function (global, document) {
  const EVENTS = {
    SELECT: 'select',
    CLEAR: 'clear'
  };

  const SECRET_PHRASES = ['dank memes', 'memes', 'shitpost', 'april fool'];
  const MAX_SUGGESTIONS = 5;

  function prefersReducedMotion() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/['\u2019]/g, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getTokens(value) {
    const normalized = normalize(value);
    return normalized ? normalized.split(' ') : [];
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightMatch(hero, query) {
    const trimmed = String(query || '').trim();

    if (!trimmed) {
      return escapeHtml(hero);
    }

    const match = hero.match(new RegExp(escapeRegExp(trimmed), 'i'));

    if (!match) {
      return escapeHtml(hero);
    }

    const start = match.index;
    const end = start + match[0].length;

    return [
      escapeHtml(hero.slice(0, start)),
      '<strong class="tt-highlight">',
      escapeHtml(hero.slice(start, end)),
      '</strong>',
      escapeHtml(hero.slice(end))
    ].join('');
  }

  function waitForTransition(element, propertyName, skipAnimation, fallbackMs) {
    return new Promise(function (resolve) {
      let done = false;

      function finish() {
        if (done) {
          return;
        }

        done = true;
        element.removeEventListener('transitionend', onTransitionEnd);
        resolve({ finished: true });
      }

      function onTransitionEnd(event) {
        if (event.target === element && event.propertyName === propertyName) {
          finish();
        }
      }

      if (skipAnimation || prefersReducedMotion()) {
        finish();
        return;
      }

      element.addEventListener('transitionend', onTransitionEnd);
      global.setTimeout(finish, fallbackMs);
    });
  }

  function restartClass(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  function HeroInput(options) {
    const _this = this;

    this.el = options.el;
    this.container = options.container;
    this.arrow = options.arrow;
    this.heroes = options.heroes;
    this.callbacks = {};
    this.callbacks[EVENTS.SELECT] = [];
    this.callbacks[EVENTS.CLEAR] = [];
    this.suggestions = [];
    this.activeIndex = -1;

    this.inputShell = this.el.closest('#heroinput') || this.el.parentNode;
    this.wrapper = document.createElement('span');
    this.wrapper.className = 'hero-autocomplete';
    this.menu = document.createElement('div');
    this.menu.id = this.el.id ? this.el.id + '-listbox' : 'hero-search-listbox';
    this.menu.className = 'tt-menu tt-empty';
    this.menu.setAttribute('role', 'listbox');

    this.el.classList.add('tt-input');
    this.el.setAttribute('role', 'combobox');
    this.el.setAttribute('aria-autocomplete', 'list');
    this.el.setAttribute('aria-controls', this.menu.id);
    this.el.setAttribute('aria-expanded', 'false');
    this.el.setAttribute('aria-haspopup', 'listbox');
    this.el.setAttribute('spellcheck', 'false');
    this.el.setAttribute('autocorrect', 'off');
    this.el.setAttribute('autocapitalize', 'none');

    this.el.parentNode.insertBefore(this.wrapper, this.el);
    this.wrapper.appendChild(this.el);
    this.wrapper.appendChild(this.menu);

    this.el.addEventListener('input', function () {
      _this.handleInput();
    });

    this.el.addEventListener('keydown', function (event) {
      _this.handleKeydown(event);
    });

    this.el.addEventListener('focus', function () {
      if (_this.el.value && !_this.heroes.find(_this.el.value)) {
        _this.renderSuggestions(_this.el.value);
      }
    });

    this.el.addEventListener('blur', function () {
      global.setTimeout(function () {
        _this.closeMenu();
      }, 100);
    });

    this.menu.addEventListener('mousedown', function (event) {
      event.preventDefault();
    });

    this.menu.addEventListener('click', function (event) {
      const item = event.target.closest('.tt-selectable');

      if (item && _this.menu.contains(item)) {
        _this.select(item.getAttribute('data-hero'));
      }
    });

    const form = this.el.closest('form');

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        _this.selectFirstSuggestion();
      });
    }
  }

  HeroInput.prototype = {
    emit: function (eventName, payload) {
      this.callbacks[eventName].forEach(function (callback) {
        callback(payload);
      });
    },

    scoreHero: function (hero, query, originalIndex) {
      const normalizedHero = normalize(hero);
      const normalizedQuery = normalize(query);
      const tokens = getTokens(hero);
      let score = Infinity;

      if (!normalizedQuery) {
        return null;
      }

      if (normalizedHero === normalizedQuery) {
        score = 0;
      } else if (normalizedHero.indexOf(normalizedQuery) === 0) {
        score = 1;
      } else if (tokens.some(function (token) { return token.indexOf(normalizedQuery) === 0; })) {
        score = 2;
      } else if (normalizedHero.indexOf(normalizedQuery) !== -1) {
        score = 3;
      }

      if (score === Infinity) {
        return null;
      }

      return {
        hero: hero,
        score: score,
        originalIndex: originalIndex
      };
    },

    search: function (query) {
      const _this = this;

      return this.heroes.all()
        .map(function (hero, index) {
          return _this.scoreHero(hero, query, index);
        })
        .filter(Boolean)
        .sort(function (a, b) {
          return a.score - b.score || a.originalIndex - b.originalIndex;
        })
        .slice(0, MAX_SUGGESTIONS)
        .map(function (result) {
          return result.hero;
        });
    },

    handleInput: function () {
      const value = this.el.value;
      const normalizedValue = normalize(value);
      const exactHero = this.heroes.find(value);

      if (SECRET_PHRASES.indexOf(normalizedValue) !== -1) {
        this.triggerJokeMode();
        return;
      }

      if (!value) {
        this.closeMenu();
        this.emit(EVENTS.CLEAR);
        return;
      }

      this.renderSuggestions(value);

      if (exactHero) {
        this.setVal(exactHero);
        this.closeMenu();
        this.emit(EVENTS.SELECT, { name: exactHero });
      }
    },

    handleKeydown: function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.openOrMove(1);
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.openOrMove(-1);
        return;
      }

      if (event.key === 'Enter') {
        if (this.selectActiveOrFirst()) {
          event.preventDefault();
        }
        return;
      }

      if (event.key === 'Tab' && this.isOpen() && this.suggestions.length) {
        event.preventDefault();
        this.select(this.suggestions[0]);
        return;
      }

      if (event.key === 'Escape') {
        this.closeMenu();
      }
    },

    triggerJokeMode: function () {
      const multicast = new Audio('./assets/media/Multicast_x3.mp3');

      multicast.volume = 0.2;
      const playPromise = multicast.play();

      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }

      if (typeof global.setJokeModeManually === 'function') {
        global.setJokeModeManually(!global.JOKEMODE);
      } else {
        global.JOKEMODE = !global.JOKEMODE;
      }

      restartClass(this.inputShell, 'hero-input--shake');
      this.setVal('');
      this.closeMenu();
      this.emit(EVENTS.CLEAR);
    },

    renderSuggestions: function (query) {
      const _this = this;

      this.suggestions = this.search(query);
      this.activeIndex = -1;
      this.menu.innerHTML = '';

      if (!this.suggestions.length) {
        this.closeMenu();
        return;
      }

      this.suggestions.forEach(function (hero, index) {
        const suggestion = document.createElement('div');
        suggestion.className = 'tt-suggestion tt-selectable';
        suggestion.setAttribute('role', 'option');
        suggestion.setAttribute('aria-selected', 'false');
        suggestion.setAttribute('data-hero', hero);
        suggestion.id = 'hero-suggestion-' + index;
        suggestion.innerHTML = '<p>' + highlightMatch(hero, query) + '</p>';
        _this.menu.appendChild(suggestion);
      });

      this.openMenu();
    },

    openMenu: function () {
      this.menu.classList.remove('tt-empty');
      this.menu.classList.add('tt-open');
      this.el.setAttribute('aria-expanded', 'true');
    },

    closeMenu: function () {
      this.menu.querySelectorAll('.tt-selectable').forEach(function (item) {
        item.classList.remove('tt-cursor');
        item.setAttribute('aria-selected', 'false');
      });

      this.menu.classList.remove('tt-open');
      this.menu.classList.add('tt-empty');
      this.el.setAttribute('aria-expanded', 'false');
      this.el.removeAttribute('aria-activedescendant');
      this.activeIndex = -1;
    },

    isOpen: function () {
      return this.menu.classList.contains('tt-open');
    },

    updateActiveSuggestion: function () {
      const items = this.menu.querySelectorAll('.tt-selectable');

      items.forEach(function (item, index) {
        const active = index === this.activeIndex;
        item.classList.toggle('tt-cursor', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
      }, this);

      if (this.activeIndex >= 0 && items[this.activeIndex]) {
        this.el.setAttribute('aria-activedescendant', items[this.activeIndex].id);
      } else {
        this.el.removeAttribute('aria-activedescendant');
      }
    },

    openOrMove: function (direction) {
      if (!this.isOpen()) {
        this.renderSuggestions(this.el.value);
      }

      if (!this.suggestions.length) {
        return;
      }

      this.activeIndex = (this.activeIndex + direction + this.suggestions.length) % this.suggestions.length;
      this.updateActiveSuggestion();
      this.el.value = this.suggestions[this.activeIndex];
    },

    selectActiveOrFirst: function () {
      let hero = this.activeIndex >= 0 ? this.suggestions[this.activeIndex] : this.suggestions[0];

      if (!hero && this.el.value) {
        hero = this.heroes.find(this.el.value);
      }

      if (!hero) {
        return false;
      }

      this.select(hero);
      return true;
    },

    select: function (hero) {
      const found = this.heroes.find(hero);

      if (!found) {
        return;
      }

      this.setVal(found);
      this.closeMenu();
      this.emit(EVENTS.SELECT, { name: found });
    },

    selectFirstSuggestion: function () {
      if (!this.suggestions.length) {
        this.renderSuggestions(this.el.value);
      }

      return this.selectActiveOrFirst();
    },

    expand: function (skipAnimation) {
      this.container.style.setProperty('--inputline-transition-duration', skipAnimation ? '0s' : '0.3s');
      this.container.classList.remove('inputline--collapsed');
      return waitForTransition(this.container, 'padding-top', skipAnimation, 350);
    },

    collapse: function (skipAnimation) {
      this.container.style.setProperty('--inputline-transition-duration', skipAnimation ? '0s' : '0.8s');
      this.container.classList.add('inputline--collapsed');
      return waitForTransition(this.container, 'padding-top', skipAnimation, 850);
    },

    setVal: function (value) {
      this.el.value = value;

      if (value === '') {
        this.expand();
      }

      this.closeMenu();
    },

    onSelect: function (callback) {
      this.callbacks[EVENTS.SELECT].push(callback);
    },

    onClear: function (callback) {
      this.callbacks[EVENTS.CLEAR].push(callback);
    },

    focus: function () {
      this.el.focus();
    },

    blur: function () {
      this.el.blur();
    }
  };

  global.HeroInput = HeroInput;
}(this, this.document);
