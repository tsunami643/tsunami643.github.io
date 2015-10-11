!function (global, document, $, HEROES, bowser) {
  var heroes = new HeroList(HEROES.concat().sort());

  var loader = new HeroLoader({
    heroes: heroes,
    $el: $('#tipcontainer'),
    urlFor: function (hero) {
      return 'tips/' + hero.toLowerCase().replace(/ /ig, '_') + '.html';
    }
  });

  var input = new HeroInput({
    $el: $('#heroinput').find('.typeahead'),
    $container: $('#inputline'),
    heroes: heroes,
    anticipationDelay: 400
  });

  var state = new HeroState({
    title: document.title
  });

  loader.onLoad(function (e, hero) {
    state.setHero(hero);
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

  input.focus();
}(this, this.document, this.jQuery, this.HEROES, this.bowser);