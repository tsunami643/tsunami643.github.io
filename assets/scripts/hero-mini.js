!function (global, $) {
  /**
   * @param {{}} options
   * @param {jQuery} options.$el
   * @param {jQuery} options.$typeahead
   * @param {HeroLoader} options.loader
   * @constructor
   */
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
      $.Velocity.animate($('body, html'), 'scroll', {duration: 300});
    });
  }

  global.HeroMini = HeroMini;
}(this, this.jQuery);