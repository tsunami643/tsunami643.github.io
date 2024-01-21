!function (global, $) {
  /**
   * @param {{}} options
   * @param {jQuery} options.$el
   * @param {jQuery} options.$typeahead
   * @param {HeroLoader} options.loader
   * @constructor
   */

  //GSAP ScrollSmoother plugin was required, so here's a vanillajs solution
  function smoothScrollToTop(duration) {
    const start = window.scrollY;
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
  
    function scrollToTop(currentTime) {
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, start, -start, duration);
      window.scrollTo(0, run);
  
      if (timeElapsed < duration) {
        requestAnimationFrame(scrollToTop);
      }
    }
  
    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }
  
    requestAnimationFrame(scrollToTop);
  }

  function HeroMini (options) {
    var anticipationTimer = null;

    options.$el.on('mouseenter', '.herolist__hero__link', function (e) {
      clearTimeout(anticipationTimer);

      anticipationTimer = setTimeout(function () {
        options.loader.preload($(e.currentTarget).find('.herolist__hero__name').html());
      }, 200);
    });

    options.$el.on('mouseleave', '.herolist__hero__link', function (e) {
        clearTimeout(anticipationTimer);
    });

    options.$el.on('click', '.herolist__hero__link', function (e) {
      e.preventDefault();
      clearTimeout(anticipationTimer);
      var hero = $(e.currentTarget).find('.herolist__hero__name').html();
      options.$typeahead.typeahead('val', hero);
      options.loader.load(hero);
      smoothScrollToTop(300);
    });
  }

  global.HeroMini = HeroMini;
}(this, this.jQuery);