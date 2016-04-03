!function (global, document, $, bowser, HEROES, PATCH) {
  var heroes = new HeroList(HEROES.concat().sort());

  var loader = new HeroLoader({
    heroes: heroes,
    patch: PATCH,
    $el: $('#tipcontainer'),
    urlFor: function (hero) {
      return 'tips/' + hero.toLowerCase().replace(/ /ig, '_') + '.html';
    }
  });

  var input = new HeroInput({
    $el: $('#heroinput').find('.typeahead'),
    $container: $('#inputline'),
    $arrow: $('#heroinput').find('.arrow'),
    heroes: heroes,
    anticipationDelay: 400
  });

  var state = new HeroState({
    title: document.title
  });

  input.onAnticipate(function (e, hero) {
    loader.preload(hero.name);
  });

  input.onSelect(function (e, hero) {
    loader
      .load(hero.name)
      .fail(function () {
        input.setVal('');
      });
  });

  loader.onLoad(function (e, hero) {
    state.setHero(hero.name);
    input.collapse();
    loader.preload(heroes.prev(hero.name));
    loader.preload(heroes.next(hero.name));
    input.setVal(hero.name);

    if (bowser.mobile || bowser.tablet) {
      input.blur();
    }
  });

  input.onClear(function () {
    state.setHero('');
    loader.collapse();
    input.expand();
  });

  new HeroMini({
    $el: $('.herolist'),
    $typeahead: $('#heroinput').find('.typeahead'),
    loader: loader
  });

  var deepLinkedHero = state.getHero();

  if (deepLinkedHero) {
    loader.load(deepLinkedHero, true);
    input.collapse(true);
    input.setVal(deepLinkedHero);
  }

  $("#randomhero").click(function (e) {
    e.preventDefault();
    $(this).velocity({ rotateZ: '+=360' });
    var randomHero = heroes.random();
    loader.load(randomHero);
    input.setVal(randomHero);
  });

  var anticipationTimer = null;

  $('.herolist').on('mouseenter', '.herolist__hero__link', function (e) {
    clearTimeout(anticipationTimer);

    anticipationTimer = setTimeout(function () {
        loader.preload($(e.currentTarget).find('.herolist__hero__name').html())
    }, 600);
  });

  $('.herolist').on('mouseleave', '.herolist__hero__link', function (e) {
      clearTimeout(anticipationTimer);
  });

  $('.herolist').on('click', '.herolist__hero__link', function (e) {
    e.preventDefault();
    clearTimeout(anticipationTimer);
    loader.load($(e.currentTarget).find('.herolist__hero__name').html());
    $('body, html').scrollTop(0);
  });

  input.focus();
}(this, this.document, this.jQuery, this.bowser, this.HEROES, this.PATCH);
