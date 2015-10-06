!function (global) {
  function mod(a, b) {
    return ((a % b) + b) % b;
  }

  function HeroList(heroes) {
    this.heroes = heroes;
  }

  HeroList.prototype = {
    find: function (hero) {
      for (var i = 0; i < this.heroes.length; i++) {
        if (this.heroes[i].toLowerCase() === hero.toLowerCase()) {
          return this.heroes[i];
        }
      }
      return false;
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