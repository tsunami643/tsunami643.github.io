!function (global, document) {
  function prefersReducedMotion() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function cachedImage(src) {
    const imgEle = document.createElement('img');
    imgEle.src = src;
    return imgEle.complete || (imgEle.width + imgEle.height) > 0;
  }

  function preloadImage(src) {
    const cached = cachedImage(src);

    if (cached) {
      return Promise.resolve({ src: src, cached: cached });
    }

    return new Promise(function (resolve, reject) {
      const img = new Image();

      img.onload = function () {
        resolve({ src: src, cached: cached });
      };

      img.onerror = reject;
      img.src = src;
    });
  }

  function cssValue(element, name, fallback) {
    const value = global.getComputedStyle(element).getPropertyValue(name).trim();
    return value || fallback;
  }

  function toMilliseconds(value, fallback) {
    const parsed = parseFloat(value);

    if (!isFinite(parsed)) {
      return fallback;
    }

    return value.indexOf('ms') === -1 && value.indexOf('s') !== -1 ? parsed * 1000 : parsed;
  }

  function ensureContentElement(element) {
    let content = element.firstElementChild;

    if (content && content.classList.contains('tip-container__content')) {
      return content;
    }

    content = document.createElement('div');
    content.className = 'tip-container__content';

    while (element.firstChild) {
      content.appendChild(element.firstChild);
    }

    element.appendChild(content);
    return content;
  }

  function transitionHeight(element, expand, skipAnimation) {
    if (element._heightTransitionCancel) {
      element._heightTransitionCancel();
      element._heightTransitionCancel = null;
    }

    return new Promise(function (resolve) {
      let done = false;
      const durationName = expand ? '--hero-slide-expand-duration' : '--hero-slide-collapse-duration';
      const directionClass = expand ? 'tip-container--expanding' : 'tip-container--collapsing';
      const fallbackDuration = expand ? 500 : 250;
      const duration = toMilliseconds(cssValue(element, durationName, fallbackDuration + 'ms'), fallbackDuration);
      const startHeight = expand ? 0 : element.getBoundingClientRect().height;
      let endHeight = 0;
      let timeoutId = null;
      let frameId = null;
      let nextFrameId = null;

      function cleanup() {
        element.removeEventListener('transitionend', onTransitionEnd);
        element.classList.remove('tip-container--sliding');
        element.classList.remove('tip-container--transitioning');
        element.classList.remove('tip-container--expanding');
        element.classList.remove('tip-container--collapsing');
        global.clearTimeout(timeoutId);

        if (frameId !== null) {
          global.cancelAnimationFrame(frameId);
        }

        if (nextFrameId !== null) {
          global.cancelAnimationFrame(nextFrameId);
        }

        if (element._heightTransitionCancel === cancel) {
          element._heightTransitionCancel = null;
        }
      }

      function finish(finished) {
        if (done) {
          return;
        }

        done = true;
        cleanup();
        element.classList.toggle('tip-container--expanded', expand);
        element.style.height = '';
        resolve({ finished: finished !== false });
      }

      function cancel() {
        if (done) {
          return;
        }

        const currentHeight = element.getBoundingClientRect().height;

        done = true;
        cleanup();

        if (currentHeight > 0) {
          element.classList.add('tip-container--expanded');
          element.style.height = currentHeight + 'px';
        } else {
          element.classList.remove('tip-container--expanded');
          element.style.height = '';
        }

        resolve({ finished: false });
      }

      function onTransitionEnd(event) {
        if (event.target === element && event.propertyName === 'height') {
          finish(true);
        }
      }

      element._heightTransitionCancel = cancel;

      if (expand) {
        element.classList.remove('tip-container--expanded');
        element.classList.add('tip-container--sliding');
        element.style.height = '0px';
        endHeight = element.scrollHeight;
      } else {
        element.style.height = startHeight + 'px';
        element.classList.add('tip-container--sliding');
        element.classList.remove('tip-container--expanded');
      }

      if (skipAnimation || prefersReducedMotion() || duration <= 0 || Math.abs(startHeight - endHeight) < 1) {
        finish(true);
        return;
      }

      frameId = global.requestAnimationFrame(function () {
        frameId = null;
        element.addEventListener('transitionend', onTransitionEnd);
        element.classList.add(directionClass);
        element.classList.add('tip-container--transitioning');

        nextFrameId = global.requestAnimationFrame(function () {
          nextFrameId = null;
          element.style.height = endHeight + 'px';

          timeoutId = global.setTimeout(function () {
            finish(true);
          }, duration + 120);
        });
      });
    });
  }

  function createNavButton(className, text, label) {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.title = label;
    button.setAttribute('aria-label', label);
    button.textContent = text;
    return button;
  }

  function patchHtml(gamePatch) {
    return [
      '<span class="patch patch">',
      '<a id="joketoggle" class="patch-badge" title="Click for joke tips" href="#">',
      '<img class="patch-img" src="./assets/media/patches/patchblank.png" alt="">',
      `<span class="patch-text">${gamePatch}</span>`,
      '</a>',
      '</span>'
    ].join('');
  }

  function outdatedPatchHtml(gamePatch) {
    return [
      '<span class="patch patch-outdated">',
      '<span class="patch-badge">',
      '<img class="patch-img" src="./assets/media/patches/patchbetablank.png" alt="">',
      `<span class="patch-text">not yet ${gamePatch}</span>`,
      '</span>',
      '</span>'
    ].join('');
  }

  function jokePatchHtml() {
    return [
      '<span class="patch patch-joke">',
      '<a id="joketoggle" class="patch-badge" title="👌👌 REAL TIP HOURS 👌" href="#">',
      '<img class="patch-img" src="./assets/media/joke/emoji.png" alt="">',
      '</a>',
      '</span>'
    ].join('');
  }

  function HeroLoader(options) {
    const _this = this;

    this.heroes = options.heroes;
    this.patch = options.patch;
    this.currentController = null;
    this.cache = new Map();
    this.currentHero = null;
    this.urlFor = options.urlFor;
    this.el = options.el;
    this.content = ensureContentElement(this.el);
    this.loadId = 0;
    this.loadCallbacks = [];

    this.el.addEventListener('click', function (event) {
      const jokeToggle = event.target.closest('#joketoggle');

      if (jokeToggle && _this.el.contains(jokeToggle)) {
        event.preventDefault();
        _this.toggleJokeMode().catch(function () {});
        return;
      }

      if (event.target.closest('.prevhero')) {
        _this.prev();
      }

      if (event.target.closest('.nexthero')) {
        _this.next();
      }
    });
  }

  HeroLoader.prototype = {
    fetchHtml: function (url, signal) {
      const cached = this.cache.get(url);
      const _this = this;

      if (typeof cached === 'string') {
        return Promise.resolve(cached);
      }

      if (cached) {
        return cached;
      }

      const request = fetch(url, { signal: signal })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('Unable to load ' + url + ': ' + response.status);
          }

          return response.text();
        })
        .then(function (html) {
          _this.cache.set(url, html);
          return html;
        })
        .catch(function (error) {
          _this.cache.delete(url);
          throw error;
        });

      this.cache.set(url, request);
      return request;
    },

    preload: function (hero) {
      if (!hero) {
        return;
      }

      this.fetchHtml(this.urlFor(hero)).catch(function () {});
    },

    next: function () {
      if (!this.currentHero) {
        return;
      }

      this.load(this.heroes.next(this.currentHero));
    },

    prev: function () {
      if (!this.currentHero) {
        return;
      }

      this.load(this.heroes.prev(this.currentHero));
    },

    reloadCurrent: function () {
      if (!this.currentHero) {
        return Promise.resolve();
      }

      return this.load(this.currentHero, false, true);
    },

    toggleJokeMode: function () {
      if (typeof global.setJokeModeManually === 'function') {
        global.setJokeModeManually(!global.JOKEMODE);
      } else {
        global.JOKEMODE = !global.JOKEMODE;
      }

      return this.reloadCurrent();
    },

    clearContent: function () {
      this.content.innerHTML = '';
    },

    collapse: function (skipAnimation, clearAfter) {
      const _this = this;

      this.currentHero = null;
      return transitionHeight(this.el, false, skipAnimation).then(function (result) {
        if (clearAfter !== false && result.finished) {
          _this.clearContent();
        }

        return result;
      });
    },

    expand: function (skipAnimation) {
      return transitionHeight(this.el, true, skipAnimation);
    },

    load: function (hero, skipAnimation, forceReload) {
      const _this = this;
      const url = this.urlFor(hero);
      const loadId = ++this.loadId;
      const controller = new AbortController();

      if (this.currentHero === hero && !forceReload) {
        return Promise.resolve({ name: hero });
      }

      if (this.currentController) {
        this.currentController.abort();
      }

      this.currentController = controller;

      const collapse = this.collapse(skipAnimation, false);

      return this.fetchHtml(url, controller.signal)
        .then(function (data) {
          return collapse.then(function () {
            if (loadId !== _this.loadId) {
              const staleError = new Error('Stale hero load');
              staleError.name = 'AbortError';
              throw staleError;
            }

            _this.clearContent();
            _this.render(hero, data, skipAnimation);
            _this.currentHero = hero;
            _this.loadCallbacks.forEach(function (callback) {
              callback({ name: hero });
            });

            return { name: hero };
          });
        })
        .catch(function (error) {
          if (error.name !== 'AbortError') {
            _this.cache.delete(url);
            _this.collapse();
          }

          throw error;
        })
        .finally(function () {
          if (_this.currentController === controller) {
            _this.currentController = null;
          }
        });
    },

    render: function (hero, data, skipAnimation) {
      const _this = this;
      this.content.innerHTML = data;

      const portrait = this.content.querySelector('.portrait-img');
      const portraitContainer = this.content.querySelector('.portrait');
      const frame = this.content.querySelector('.portrait-frame');

      if (portraitContainer) {
        portraitContainer.insertBefore(createNavButton('prevhero', '<', 'Previous Hero'), portraitContainer.firstChild);
        portraitContainer.appendChild(createNavButton('nexthero', '>', 'Next Hero'));
      }

      if (frame) {
        const gamePatch = parseFloat(this.patch).toFixed(2);

        if (gamePatch !== this.patch) {
          frame.insertAdjacentHTML('afterbegin', outdatedPatchHtml(gamePatch));
        } else {
          frame.insertAdjacentHTML('afterbegin', patchHtml(gamePatch));
        }

        if (global.JOKEMODE === true) {
          const patch = this.content.querySelector('.patch');
          if (patch) {
            patch.outerHTML = jokePatchHtml();
          }

          // Allow loading for twitter/reddit/tumblr embed scripts
          const activatedSources = new Set();

          this.content.querySelectorAll('script[src]').forEach(function (oldScript) {
            const source = oldScript.src;

            if (activatedSources.has(source)) {
              oldScript.remove();
              return;
            }

            const newScript = document.createElement('script');

            Array.from(oldScript.attributes).forEach(function (attribute) {
              newScript.setAttribute(attribute.name, attribute.value);
            });

            activatedSources.add(source);
            oldScript.replaceWith(newScript);
          });
        }
      }

      if (portrait) {
        const src = portrait.getAttribute('data-src');
        const alt = portrait.getAttribute('alt') || hero;

        if (src) {
          const frameInner = this.content.querySelector('.portrait-frame-inner');

          preloadImage(src).then(function (data) {
            if (!frameInner || !frame || !_this.content.contains(frameInner)) {
              return;
            }

            if (data.cached) {
              frameInner.querySelectorAll('.portrait-img').forEach(function (img) {
                img.classList.add('from-cache');
              });
            }

            const loadedImage = document.createElement('img');
            loadedImage.className = 'portrait-img portrait-image-loaded';
            loadedImage.width = 256;
            loadedImage.height = 144;
            loadedImage.src = data.src;
            loadedImage.alt = alt;
            frameInner.insertBefore(loadedImage, frameInner.firstChild);
            frame.classList.add('portrait-frame-loaded');
          }).catch(function () {});
        }
      }

      _this.expand(skipAnimation);
    },

    onLoad: function (callback) {
      this.loadCallbacks.push(callback);
    }
  };

  global.HeroLoader = HeroLoader;
}(this, this.document);
