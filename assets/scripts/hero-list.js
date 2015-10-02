!function (global) {
  function mod(a, b) {
    return ((a % b) + b) % b;
  }

  function HeroList(heroes) {
    this.heroes = heroes;
  }

  HeroList.prototype = {
    contains: function (hero) {
      return this.heroes.indexOf(hero) > -1;
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

  global.HeroList = HeroList;
}(this);