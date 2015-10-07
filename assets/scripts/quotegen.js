!function (document, $, UNSORTED_HEROES, History, Bloodhound) {
  var HEROES = UNSORTED_HEROES.concat().sort(); //Alphabetized copy of hero array
  var HEROES_LOWERCASE = $.map(HEROES, function (h) {
    return h.toLowerCase();
  });
  var originalTitle = document.title;
  var originalPadding = $('#inputline').css('padding');
  var restored = true;

  // jquery browser polyfill
  (function (a) {
    (jQuery.browser = jQuery.browser || {}).mobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
  })(navigator.userAgent || navigator.vendor || window.opera);

  var currenthero;

  function updateState(hero) {
    document.title = hero + ' - ' + originalTitle;
    History.replaceState(null, hero + ' - ' + originalTitle, '?' + encodeURIComponent(hero));
  }

  var timer = null;

  var cached = {};

  function preload(heroName) {
    clearTimeout(timer);

    if (!cached[heroName]) {
      setTimeout(function () {
        cached[heroName] = true;
        $.get(heroUrlFromHeroName(heroName));
      }, 200);
    }
  }

  function heroUrlFromHeroName(heroName) {
    return 'tips/' + heroName.toLowerCase().replace(/ /ig, '_') + '.html';
  }

  function isCached(src) {
    var imgEle = document.createElement("img");
    imgEle.src = src;
    return imgEle.complete || (imgEle.width + imgEle.height) > 0;
  }

  function preloadImage(src) {
    var d = $.Deferred();
    var cached = isCached(src);

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

  function loadHero(heroIndex, skipAnimation) {
    restored = false;

    $('#inputline').animate({padding: "30px 10px 30px"}, skipAnimation ? 0 : 800);

    $("#tipcontainer").slideUp(skipAnimation ? 0 : 300, function () {
      var heroName = HEROES[heroIndex];

      updateState(heroName);

      $("#heroinput").removeClass('show-arrow');

      $("#tipcontainer").load(heroUrlFromHeroName(heroName), function () {
        var $hero = $("#tipcontainer").find('.hero');
        $(this).slideDown(skipAnimation ? 0 : 500);

        $hero.find(".herotitle").prepend('<span class="prevhero">&lt;</span>').append('<span class="nexthero">&gt;</span>');
        $("#tipcontainer").css({display: "block"});
        $("#heroinput").addClass('show-arrow');

        var $portrait = $hero.find('.portrait-img');

        var src = $portrait.data('src');

        if (src) {
          preloadImage(src).done(function (data) {
            var $frame = $hero.find('.portrait-frame');

            if (data.cached) {
              $frame.find('.portrait-img').addClass('from-cache');
            }

            $frame.prepend('<img class="portrait-img portrait-image-loaded" width="256" height="144" src="' + data.src + '">');
            $frame.addClass('portrait-frame-loaded');
          });
        }

        currenthero = heroIndex;

        preload(HEROES[mod(currenthero - 1, HEROES.length)]);
        preload(HEROES[mod(currenthero + 1, HEROES.length)]);
      });
    });
  }

  function setupRandomButton() {
    var angle = 0; //Starting angle for random button

    $("#randomhero").click(function (e) {
      e.preventDefault();

      angle += 360;

      $(this).css({
        '-webkit-transform': 'rotate(' + angle + 'deg)',
        '-moz-transform': 'rotate(' + angle + 'deg)',
        '-o-transform': 'rotate(' + angle + 'deg)',
        '-ms-transform': 'rotate(' + angle + 'deg)'
      });

      var randhero = Math.floor(Math.random() * HEROES.length);

      $('#heroinput .typeahead').val(HEROES[randhero]);
      loadHero(randhero);
    });
  }

  function setupTypeAheadInput() {
    var heroindex = -1;

    var $heroinput = $('#heroinput .typeahead');

    var heroes = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.whitespace,
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: HEROES
    });

    $heroinput.typeahead({
      hint: true,
      highlight: true,
      minLength: 1
    }, {
      name: 'HEROES',
      source: heroes
    });

    $heroinput.on("keyup typeahead:change typeahead:select typeahead:autocomplete typeahead:cursorchange", function (e, data) {
      var herotext = $heroinput.typeahead('val');

      if (herotext) {
        heroindex = $.inArray(herotext.toLowerCase(), HEROES_LOWERCASE);

        heroes.search(data || herotext, function (datums) {
          if (datums[0]) {
            preload(datums[0]);
          }
        });
      }

      if (heroindex > -1) {
        $heroinput.typeahead('close');

        if (heroindex > -1 && heroindex != currenthero) {
          loadHero(heroindex);
          if (jQuery.browser.mobile == true) {
            $heroinput.typeahead.blur();
          }
        }
      }

      if (herotext === '') {
        restoreBlankState();
      }
    });

    $('#heroinput-form').on('submit', function (e) {
      e.preventDefault();

      var $menu = $('.tt-menu:first');

      if (!$menu.is('.tt-empty')) {
        $menu.find('.tt-selectable:first').click();
      }
    });

    $heroinput.typeahead.focus();
  }

  function manuallyInputHero(heroIndex, skipAnimation) {
    loadHero(heroIndex, !!skipAnimation);
    $("#heroinput .typeahead").typeahead('val', HEROES[heroIndex]);
    $("#heroinput .typeahead").typeahead('close');
  }

  function loadHeroFromHash() {
    var state = History.getState();
    var hero = state.cleanUrl && state.cleanUrl.split('#')[1];

    if (hero) {
      var index = $.inArray(decodeURIComponent(hero).toLowerCase(), HEROES_LOWERCASE);

      if (index !== -1) {
        manuallyInputHero(index, true);
      }
    }
  }

  function setupPrevNext() {
    var $tipcontainer = $('#tipcontainer');

    $tipcontainer
        .on('click', '.prevhero', function (e) {
          e.preventDefault();
          manuallyInputHero(mod(currenthero - 1, HEROES.length));
        })
        .on('click', '.nexthero', function (e) {
          e.preventDefault();
          manuallyInputHero(mod(currenthero + 1, HEROES.length));
        });
  }

  function restoreBlankState() {
    if (restored) {
      return;
    }

    currenthero = null;
    document.title = originalTitle;
    History.replaceState(null, originalTitle, '');
    $('#inputline').animate({padding: originalPadding}, 800);
    $("#tipcontainer").slideUp();
    $("#heroinput").removeClass('show-arrow');

    restored = true;
  }

  function mod(a, b) {
    return ((a % b) + b) % b;
  }

  setupTypeAheadInput();
  loadHeroFromHash();
  setupRandomButton();
  setupPrevNext();

}(this.document, this.jQuery, this.HEROES, this.History, this.Bloodhound);
