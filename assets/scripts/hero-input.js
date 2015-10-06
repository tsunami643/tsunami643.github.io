!function (global, $, Bloodhound) {
  var EVENTS = {
    ANTICPATE: 'heroinput:anticpate',
    SELECT: 'heroinput:select',
    CLEAR: 'heroinput:clear'
  };

  /**
   * @param {{}} options
   * @param {JQuery} options.$el
   * @param {JQuery} options.$container
   * @param {string[]} options.heroes
   * @param {number} options.anticipationDelay
   * @constructor
   */
  function HeroInput(options) {
    var _this = this;

    this.$el = options.$el;
    this.$container = options.$container;
    this.originalPadding = {
      paddingTop: options.$container.css('padding-top'),
      paddingRight: options.$container.css('padding-right'),
      paddingBottom: options.$container.css('padding-bottom'),
      paddingLeft: options.$container.css('padding-left')
    };

    var engine = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: options.heroes.all()
    });

    this.$el.typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    }, {
      source: engine
    });

    this.$el.on('keydown keyup', function () {
      var value = _this.$el.typeahead('val');

      if (value === '') {
        _this.$el.trigger(EVENTS.CLEAR);
        return;
      }
    });

    var anticipationTimer = null;
    var anticipateEvents = ['keypress', 'keyup', 'typeahead:cursorchange'].join(' ');
    var previousValue = '';

    this.$el.on(anticipateEvents, function (e, data) {
      var value = data || _this.$el.typeahead('val');
      clearTimeout(anticipationTimer);

      if (value === '') {
        _this.$el.trigger(EVENTS.CLEAR);
        return;
      }

      var found = options.heroes.find(value);

      // Todo: this is kinda jankey
      if (previousValue && previousValue !== value && found) {
	previousValue = value;
	_this.setVal(found);
	_this.$el.trigger(EVENTS.SELECT, {name: found});
	return;
      }

      anticipationTimer = setTimeout(function () {
        engine.search(value, function (datums) {
          if (datums[0]) {
            _this.$el.trigger(EVENTS.ANTICPATE, {name: datums[0]});
          }
        });
      }, options.anticipationDelay);

      previousValue = value;
    });

    var changeEvents = ['typeahead:select', 'typeahead:autocomplete', 'typeahead:change'].join(' ');
    this.$el.on(changeEvents, function (e, data) {
      var value = data || _this.$el.typeahead('val');

      if (value === '') {
        _this.$el.trigger(EVENTS.CLEAR);
        return;
      }

      engine.search(value, function (datums) {
        if (datums[0]) {
          _this.$el.trigger(EVENTS.SELECT, {name: datums[0]});
        }
      });
    });

    this.$el.parents('form:first').on('submit', function (e) {
      if (!_this.$el.is(':focus')) {
        return true;
      }

      e.preventDefault();
      _this.selectFirstSuggestion();
    });
  }

  HeroInput.prototype = {
    expand: function (skipAnimation) {
      this.$container.removeClass('show-arrow');
      return $.Velocity.animate(this.$container, this.originalPadding, {duration: skipAnimation ? 0 : 300});
    },

    collapse: function (skipAnimation) {
      this.$container.addClass('show-arrow');
      return $.Velocity.animate(this.$container, {paddingTop: '30px', paddingRight: '10px', paddingBottom: '30px', paddingLeft: '10px'}, {duration: skipAnimation ? 0 : 800});
    },

    setVal: function (value) {
      this.$el.typeahead('val', value);

      if (value === '') {
        this.expand();
      }

      this.$el.typeahead('close');
    },

    selectFirstSuggestion: function () {
      var $menu = this.$el.parent().find('.tt-menu:first');

      if (!$menu.is('.tt-empty')) {
        $menu.find('.tt-selectable:first').click();
      }
    },

    onAnticipate: function (callback) {
      this.$el.on(EVENTS.ANTICPATE, callback);
    },

    onSelect: function (callback) {
      this.$el.on(EVENTS.SELECT, callback);
    },

    onClear: function (callback) {
      this.$el.on(EVENTS.CLEAR, callback);
    }
  };

  global.HeroInput = HeroInput;
}(this, this.jQuery, this.Bloodhound);