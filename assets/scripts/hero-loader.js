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
            $frame.prepend('<span class="patch patch"><a id="joketoggle" title="Click for joke tips" href="#" onclick="JOKEMODE = true; return;"><svg height="54" width="54" viewBox="0 0 54 54" style="position: absolute; right: -16px; top: -16px; overflow: visible;"><defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%"><feOffset result="offOut" in="SourceAlpha" dx="-1.5" dy="1.5"></feOffset><feGaussianBlur result="blurOut" in="offOut" stdDeviation="1"></feGaussianBlur><feColorMatrix result="shadowOut" in="blurOut" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .1 0"></feColorMatrix><feBlend in="SourceGraphic" in2="shadowOut" mode="normal"></feBlend></filter></defs><path d="M29.118 53.517L30.754 50.705 33.303 53.254 34.416 49.825 37.332 51.945 37.896 48.384 41.107 50.021 41.107 46.416 44.535 47.531 43.971 43.971 47.531 44.535 46.416 41.107 50.021 41.107 48.384 37.896 51.945 37.332 49.825 34.416 53.254 33.303 50.705 30.754 53.917 29.118 51 27 53.917 24.882 50.705 23.246 53.254 20.697 49.825 19.584 51.945 16.668 48.384 16.104 50.021 12.893 46.416 12.893 47.531 9.465 43.971 10.029 44.535 6.469 41.107 7.584 41.107 3.979 37.896 5.616 37.332 2.055 34.416 4.175 33.303 0.746 30.754 3.295 29.118 0.083 27 3 24.882 0.083 23.246 3.295 20.697 0.746 19.584 4.175 16.668 2.055 16.104 5.616 12.893 3.979 12.893 7.584 9.465 6.469 10.029 10.029 6.469 9.465 7.584 12.893 3.979 12.893 5.616 16.104 2.055 16.668 4.175 19.584 0.746 20.697 3.295 23.246 0.083 24.882 3 27 0.083 29.118 3.295 30.754 0.746 32.303 2.539 33.102 27.664 51.909z" fill="#eb2424" filter="url(#shadow)"></path></svg><svg height="23.16" width="30" style="position: absolute; right: 0.28em; top: 0.59em"><path d="M27.545 23.246L30.094 20.697L26.665 19.584L28.785 16.668L25.224 16.104L26.861 12.893L23.256 12.893L24.371 9.465L20.811 10.029L21.375 6.469L17.947 7.584L17.947 3.979L14.736 5.616L14.172 2.055L11.256 4.175L10.143 0.746L7.594 3.295L5.958 0.083L3.84 3L1.722 0.083L0.086 2.7z" fill="#f4f4f4"/></svg></a><div class="patch-text">' + gamePatch + '\'d</div></span>');
          }

          if (JOKEMODE == true) {
            _this.$el.find('.patch').replaceWith('<span class="patch patch-joke"><a id="joketoggle" title="👌👌 REAL TIP HOURS 👌" href="#" onclick="JOKEMODE=false; return;"><svg viewBox="0 0 47.5 47.5" style="width: 55px;position: absolute;right: -11px;top: -19px;transform: rotate(35deg);-webkit-transform: rotate(35deg);"><defs id="defs6"><clipPath id="clipPath16" clipPathUnits="userSpaceOnUse"><path id="path18" d="M 0,38 38,38 38,0 0,0 0,38 Z"></path></clipPath></defs><g transform="matrix(1.25,0,0,-1.25,0,47.5)" id="g10"><g id="g12"><g clip-path="url(#clipPath16)" id="g14"><g transform="translate(36,19)" id="g20"><path id="path22" style="fill:#ffcc4d;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c 0,-9.389 -7.611,-17 -17,-17 -9.388,0 -17,7.611 -17,17 0,9.388 7.612,17 17,17 C -7.611,17 0,9.388 0,0"></path></g><g transform="translate(29.457,19.2031)" id="g24"><path id="path26" style="fill:#664500;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -0.059,0.135 -1.499,3.297 -4.457,3.297 -2.957,0 -4.397,-3.162 -4.457,-3.297 -0.092,-0.207 -0.032,-0.449 0.144,-0.591 0.175,-0.142 0.426,-0.147 0.611,-0.014 0.012,0.009 1.262,0.902 3.702,0.902 2.426,0 3.674,-0.881 3.702,-0.901 0.088,-0.066 0.194,-0.099 0.298,-0.099 0.11,0 0.221,0.037 0.312,0.109 C 0.032,-0.452 0.093,-0.208 0,0"></path></g><g transform="translate(17.457,19.2031)" id="g28"><path id="path30" style="fill:#664500;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -0.06,0.135 -1.499,3.297 -4.457,3.297 -2.957,0 -4.397,-3.162 -4.457,-3.297 -0.092,-0.207 -0.032,-0.449 0.144,-0.591 0.176,-0.142 0.427,-0.147 0.61,-0.014 0.013,0.009 1.262,0.902 3.703,0.902 2.426,0 3.674,-0.881 3.702,-0.901 0.088,-0.066 0.194,-0.099 0.298,-0.099 0.11,0 0.221,0.037 0.312,0.109 C 0.033,-0.452 0.092,-0.208 0,0"></path></g><g transform="translate(32,20.9995)" id="g32"><path id="path34" style="fill:#664500;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 C -0.396,0 -0.772,0.238 -0.929,0.629 -2.707,5.074 -7.151,6.01 -7.196,6.02 -7.737,6.128 -8.089,6.655 -7.98,7.196 -7.872,7.738 -7.346,8.087 -6.804,7.98 -6.578,7.936 -1.248,6.812 0.929,1.372 1.134,0.859 0.884,0.277 0.371,0.072 0.25,0.023 0.124,0 0,0"></path></g><g transform="translate(5.9995,20.9995)" id="g36"><path id="path38" style="fill:#664500;fill-opacity:1;fill-rule:nonzero;stroke:none" d="M 0,0 C -0.124,0 -0.249,0.023 -0.371,0.072 -0.884,0.277 -1.133,0.859 -0.928,1.372 1.248,6.812 6.579,7.936 6.804,7.98 7.348,8.087 7.873,7.738 7.981,7.196 8.089,6.656 7.739,6.13 7.2,6.02 7.015,5.982 2.693,5.04 0.929,0.629 0.772,0.238 0.397,0.001 0,0"></path></g><g transform="translate(19,15)" id="g40"><path id="path42" style="fill:#664500;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -3.623,0 -6.027,0.422 -9,1 -0.679,0.131 -2,0 -2,-2 0,-4 4.595,-9 11,-9 6.404,0 11,5 11,9 C 11,1 9.679,1.132 9,1 6.027,0.422 3.623,0 0,0"></path></g><g transform="translate(10,14)" id="g44"><path id="path46" style="fill:#ffffff;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c 0,0 3,-1 9,-1 6,0 9,1 9,1 0,0 -2,-4 -9,-4 -7,0 -9,4 -9,4"></path></g><g transform="translate(11.8472,8.7705)" id="g48"><path id="path50" style="fill:#5dadec;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c -0.68,-2.677 -3.4,-4.295 -6.077,-3.615 -2.676,0.678 -4.295,3.399 -3.615,6.076 0.679,2.677 6.337,8.708 7.307,8.462 C -1.417,10.677 0.679,2.677 0,0"></path></g><g transform="translate(26.1328,8.7705)" id="g52"><path id="path54" style="fill:#5dadec;fill-opacity:1;fill-rule:nonzero;stroke:none" d="m 0,0 c 0.68,-2.677 3.4,-4.295 6.077,-3.615 2.677,0.678 4.296,3.399 3.616,6.076 C 9.014,5.138 3.355,11.169 2.386,10.923 1.417,10.677 -0.679,2.677 0,0"></path></g></g></g></g></svg></a>')
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
