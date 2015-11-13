!function (global, History) {
  function HeroState(options) {
    this.title = options.title;
  }

  HeroState.prototype = {
    getHero: function () {
      var state = History.getState();

      return state.cleanUrl && state.cleanUrl.split('?')[1] && decodeURIComponent(state.cleanUrl.split('?')[1]).replace(/\+/ig, ' ');
    },

    setHero: function (hero) {
      if (hero) {
        document.title = hero + ' - ' + this.title;
        var heroUrl = encodeURIComponent(hero).replace(/%20/ig, '+');
        History.replaceState(null, hero + ' - ' + this.title, '?' + heroUrl);
        window.ga('send', 'pageview', '/' + heroUrl);
      } else {
        document.title = this.title;
        History.replaceState(null, this.title, '?');
      }
    }
  };

  global.HeroState = HeroState;
}(this, this.History);