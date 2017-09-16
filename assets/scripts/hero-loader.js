!function (global, $) {
  function cachedImage(src) {
    var imgEle = document.createElement('img');
    imgEle.src = src;
    return imgEle.complete || (imgEle.width + imgEle.height) > 0;
  }

  function preloadImage(src) {
    var d = $.Deferred();
    var cached = cachedImage(src);

    function resolve() {
      d.resolve({src: src, cached: cached});
    }

    if (cached) {
      resolve();
    } else {
      var img = new Image();
      img.onload = function () {
        resolve();
      };
      img.src = src;
    }

    return d.promise(src);
  }

  /**
   *
   * @param options
   * @constructor
   */
  function HeroLoader(options) {
    var _this = this;
    this.emitter = $({});

    this.heroes = options.heroes;
    this.patch = options.patch;
    this.loading = null;
    this.cache = {};
    this.currentHero = null;
    this.urlFor = options.urlFor;
    this.$el = options.$el;

    this.$el.on('click', '.prevhero', function () {
      _this.prev();
    });
    this.$el.on('click', '.nexthero', function () {
      _this.next();
    });
  }

  HeroLoader.prototype = {
    preload: function (hero) {
      var _this = this;

      if (!this.cache[hero]) {
        this.cache[hero] = true;
        $.get(this.urlFor(hero)).fail(function () {
          _this.cache[hero] = false;
        });
      }
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

    collapse: function (skipAnimation) {
      this.currentHero = null;
      this.$el.removeClass('tip-container--expanded');
      return $.Velocity.animate(this.$el, 'slideUp', {duration: skipAnimation ? 0 : 300});
    },

    expand: function (skipAnimation) {
      this.$el.addClass('tip-container--expanded');
      return $.Velocity.animate(this.$el, 'slideDown', {duration: skipAnimation ? 0 : 500});
    },

    load: function (hero, skipAnimation) {
      var _this = this;
      var d = $.Deferred();

      if (this.loading) {
        this.loading.abort();
      }

      if (this.currentHero === hero) {
        return d.promise();
      }

      var collapse = this.collapse(skipAnimation);

      var request = $.get(this.urlFor(hero));
      this.loading = request;

      request.done(function (data) {
        _this.cache[hero] = true;

        collapse.then(function () {
          _this.$el.html(data);

          var $portrait = _this.$el.find('.portrait-img');

          _this.$el.find('.portrait').prepend('<span class="prevhero">&lt;</span>').append('<span class="nexthero">&gt;</span>');

          var $frame = _this.$el.find('.portrait-frame');
          var src = $portrait.data('src');

          //var heroPatch = parseFloat(_this.$el.find('.hero').data('patch'));

          var gamePatch = parseFloat(_this.patch).toFixed(2);

          if (gamePatch != _this.patch) {
            $frame.prepend('<span class="patch patch-outdated"><img class="patch-img" src="./assets/media/patches/patchbetablank.png"><div class="patch-text">not yet ' + gamePatch + '\'d</div></span>');
          } else {
            $frame.prepend('<span class="patch patch"><a id="joketoggle" title="Click for joke tips" href="#" onclick="JOKEMODE = true; return;"><svg height="54" width="54" viewBox="0 0 54 54" style="position: absolute; right: -16px; top: -16px; "><defs><filter id="shadow" x="0" y="0" width="100%" height="100%"><feOffset result="offOut" in="SourceAlpha" dx="-1.5" dy="1.5"></feOffset><feGaussianBlur result="blurOut" in="offOut" stdDeviation="1"></feGaussianBlur><feColorMatrix result="shadowOut" in="blurOut" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .1 0"></feColorMatrix><feBlend in="SourceGraphic" in2="shadowOut" mode="normal"></feBlend></filter></defs><path d="M29.118 53.517L30.754 50.705 33.303 53.254 34.416 49.825 37.332 51.945 37.896 48.384 41.107 50.021 41.107 46.416 44.535 47.531 43.971 43.971 47.531 44.535 46.416 41.107 50.021 41.107 48.384 37.896 51.945 37.332 49.825 34.416 53.254 33.303 50.705 30.754 53.917 29.118 51 27 53.917 24.882 50.705 23.246 53.254 20.697 49.825 19.584 51.945 16.668 48.384 16.104 50.021 12.893 46.416 12.893 47.531 9.465 43.971 10.029 44.535 6.469 41.107 7.584 41.107 3.979 37.896 5.616 37.332 2.055 34.416 4.175 33.303 0.746 30.754 3.295 29.118 0.083 27 3 24.882 0.083 23.246 3.295 20.697 0.746 19.584 4.175 16.668 2.055 16.104 5.616 12.893 3.979 12.893 7.584 9.465 6.469 10.029 10.029 6.469 9.465 7.584 12.893 3.979 12.893 5.616 16.104 2.055 16.668 4.175 19.584 0.746 20.697 3.295 23.246 0.083 24.882 3 27 0.083 29.118 3.295 30.754 0.746 32.303z" fill="#eb2424" filter="url(#shadow)"></path></svg><svg height="23" width="54" style="position: absolute; right: 6px; top: 14px"><path d="M50.705 23.246L53.254 20.697 49.825 19.584 51.945 16.668 48.384 16.104 50.021 12.893 46.416 12.893 47.531 9.465 43.971 10.029 44.535 6.469 41.107 7.584 41.107 3.979 37.896 5.616 37.332 2.055 34.416 4.175 33.303 0.746 30.754 3.295 29.118 0.083 27 3 24.882 0.083 23.246 2.7z" fill="#f4f4f4"/></svg></a><div class="patch-text">' + gamePatch + '\'d</div></span>');
          }

          if (JOKEMODE == true) {
            _this.$el.find('.patch').replaceWith('<span class="patch patch-joke"><a id="joketoggle" title="👌👌 REAL TIP HOURS 👌" href="#" onclick="JOKEMODE=false; return;"><img class="patch-img" src="./assets/media/joke/emoji.png"></a>')
          }

          if (src) {
            var $frameInner = $frame.find('.portrait-frame-inner');

            preloadImage(src).done(function (data) {

              if (data.cached) {
                $frameInner.find('.portrait-img').addClass('from-cache');
              }

              $frameInner.prepend('<img class="portrait-img portrait-image-loaded" width="256" height="144" src="' + data.src + '">');
              $frame.addClass('portrait-frame-loaded');
            });
          }

          _this.expand(skipAnimation);
          _this.currentHero = hero;

	        _this.emitter.trigger('load', { name: hero });

          d.resolve();
        });
      });

      request.fail(function () {
        _this.cache[hero] = false;
        _this.collapse();

        d.reject();
      });

      request.always(function () {
        _this.loading = null;
      });

      return d.promise();
    },

    onLoad: function (callback) {
      this.emitter.on('load', callback);
    }
  };

  global.HeroLoader = HeroLoader;
}(this, this.jQuery);
