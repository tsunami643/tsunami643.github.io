!function (global, $) {
  /**
   * @param {{}} options
   * @param {jQuery} options.$el
   * @param {HeroLoader} options.loader
   * @constructor
   */
  function HeroMini (options) {
    var anticipationTimer = null;

    options.$el.on('mouseenter', '.herolist__hero__link', function (e) {
      clearTimeout(anticipationTimer);

      anticipationTimer = setTimeout(function () {
        options.loader.preload($(e.currentTarget).find('.herolist__hero__name').html());
      }, 600);
    });

    options.$el.on('mouseleave', '.herolist__hero__link', function (e) {
        clearTimeout(anticipationTimer);
    });

    options.$el.on('click touchstart', '.herolist__hero__link', function (e) {
      e.preventDefault();
      clearTimeout(anticipationTimer);
      options.loader.load($(e.currentTarget).find('.herolist__hero__name').html());
      $.Velocity.animate($('body, html'), 'scroll', {duration: 300});
    });
  }

  global.HeroMini = HeroMini;
}(this, this.jQuery);