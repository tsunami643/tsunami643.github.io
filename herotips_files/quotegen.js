var startquotearray = [
 "I JUST RANDOMED",
 "MY CAPTAIN PICKED ME",
 "I TOLD MY TEAM I KNOW HOW TO PLAY",
 "I'M GETTING OWNED BY",
 "CREEPS ARE SPAWNING. QUICK, TELL ME HOW TO",
 "I'VE GOT 40 SECONDS TO LEARN HOW TO",
 "WHAT THE HELL IS A",
 "GOD DAMN IT, I'M SICK OF LOSING TO",
 "I'VE NEVER PLAYED",
 "OF COURSE I KNOW HOW TO PLAY",
 "HOW DO I COUNTER",
 "HOW DO I COUNTER",
 "HOW DO I COUNTER",
 "ICEFROG PLS NERF",
 "ICEFROG PLS BUFF",
 "NO MORE 0% DOTABUFF WIN RATE ON",
 "WHY DOES",
 "WHY I ALWAYS LOSE WITH",
 "THEY CALL ME THE ADMIRALBULLDOG OF",
 "OH BOY, MY FIRST DRAFT!",
 "BLESSED BE THY",
 "MY STACK BANNED ME FROM PLAYING",
 "ANYONE WANT",
 "GIVE ME THE SPARKNOTES ON PLAYING",
 "I NEVER WIN WITH",
 "BET ALL MY RARES AND GOT SOME DOPE",
 "TO REPICK IS TO ADMIT WEAKNESS."
];

var endquotearray = [
 ". NOW WHAT?",
 "AND NOW I'M PANICKING.",
 "BUT I REALLY DON'T.",
 ". WHAT DO?",
 ".",
 "LIKE DENDI.",
 "?",
 ".",
 "BEFORE. GUESS I'LL LEARN IN THIS RANKED MATCH.",
 ". I'M JUST REFRESHING MY MEMORY.",
 "? DAGON 5, RIGHT?",
 "? STACK RAPIERS, RIGHT?",
 "? WARD THEIR JUNGLE, RIGHT?",
 ".",
 ".",
 "FROM NOW ON.",
 "EVEN EXIST? GARBAGE HERO IMO.",
 "? I COPY SING'S BUILDERINO PERFECT.",
 ".",
 "IS WEAK AGAINST GRASS TYPE, RIGHT?",
 ". GUIDE ME ON THIS RIGHTEOUS PATH TO 4K.",
 "BUT I'LL SHOW 'EM.",
 "? NO? THEN YOU BROUGHT THIS UPON YOURSELF.",
 ".",
 ". I BLAME BAD TEAMMATES.",
 "HATS. TIME TO USE 'EM.",
 "TRIAL BY FIRE."
];

var footerquotearray = [
 "Did I pull you out of the trench?",
 "Found a mistake?",
 "Have a suggestion?",
 "Got a tip to add?",
 "Discover a new counter?"
];

var substringMatcher = function(strs) {
  return function findMatches(q, cb) {
    var matches, substrRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        // the typeahead jQuery plugin expects suggestions to a
        // JavaScript object, refer to typeahead docs for more info
        matches.push({ value: str });
      }
    });

    cb(matches);
  };
};

var heroes = ['Abaddon', 'Alchemist', 'Ancient Apparition', 'Anti-Mage', 'Axe',
  'Bane', 'Batrider', 'Beastmaster', 'Bloodseeker', 'Bounty Hunter', 'Brewmaster',
  'Bristleback', 'Broodmother', 'Centaur Warrunner', 'Chaos Knight', 'Chen', 'Clinkz', 'Clockwerk',
  'Crystal Maiden', 'Dark Seer', 'Dazzle', 'Death Prophet', 'Disruptor',
  'Doom', 'Dragon Knight', 'Drow Ranger', 'Earth Spirit', 'Earthshaker', 'Elder Titan',
  'Ember Spirit', 'Enchantress', 'Enigma', 'Faceless Void', 'Gyrocopter',
  'Huskar', 'Invoker', 'Io', 'Jakiro', 'Juggernaut',
  'Keeper of the Light', 'Kunkka', 'Legion Commander', 'Leshrac', 'Lich', 'Lifestealer',
  'Lina', 'Lion', 'Lone Druid', 'Luna', 'Lycan', 'Magnus',
  'Medusa', 'Meepo', 'Mirana', 'Morphling', 'Naga Siren', 'Nature\'s Prophet',
  'Necrophos', 'Night Stalker', 'Nyx Assassin', 'Ogre Magi', 'Omniknight',
  'Outworld Devourer', 'Phantom Assassin', 'Phantom Lancer', 'Phoenix',
  'Puck', 'Pudge', 'Pugna', 'Queen of Pain', 'Razor', 'Riki', 'Rubick',
  'Sand King', 'Shadow Demon', 'Shadow Fiend', 'Shadow Shaman', 'Silencer',
  'Skywrath Mage', 'Slardar', 'Slark', 'Sniper', 'Spectre', 'Spirit Breaker',
  'Storm Spirit', 'Sven', 'Templar Assassin', 'Terrorblade', 'Tidehunter',
  'Timbersaw', 'Tinker', 'Tiny', 'Treant Protector', 'Troll Warlord', 'Tusk',
  'Undying', 'Ursa', 'Vengeful Spirit', 'Venomancer', 'Viper', 'Visage',
  'Warlock', 'Weaver', 'Windranger', 'Witch Doctor', 'Wraith King', 'Zeus',
  'Techies'
];

function QuoteGen() {
  var quotenum= Math.floor(Math.random()*startquotearray.length);
  var currenthero;
  var heroindex;
  $('#StartQuote').text( startquotearray[quotenum] );
  $('#EndQuote').text( endquotearray[quotenum] );
  $('#FooterQuote').text( footerquotearray[Math.floor(Math.random()*footerquotearray.length)] );
  
  var angle = 0;
  
  var rect = heroinput.getBoundingClientRect().left;
  var zoom = document.documentElement.clientWidth / window.innerWidth;
  
  //Wait for webfont to load before positioning arrow
  $( window ).load(function()  {
	$("#heroinput .typeahead").focus();
	
	rect = heroinput.getBoundingClientRect().left;
	$('head').append("<style>.arrow_box:before{left: "+(rect+130)+";}</style>");
  });
  
  //Move arrow if window is resized/zoom is changed
  /*$( window ).resize(function() {
	if (rect != heroinput.getBoundingClientRect().left){
		rect = heroinput.getBoundingClientRect().left;
		$('head').append("<style>.arrow_box:before{left: "+(rect+130)+";}</style>");
		}
		
	var zoomNew = document.documentElement.clientWidth / window.innerWidth;
	
    if (zoom != zoomNew) {
        rect = heroinput.getBoundingClientRect().left;
		$('head').append("<style>.arrow_box:before{left: "+(rect+130)+";}</style>");
        zoom = zoomNew;
		}
	});*/
	
	function loadHero(hero){
		$('#inputline').animate({padding: "30px 10px 30px"}, 800);
			$( "#tipcontainer" ).slideUp(300, function()
			{
				$( ".arrow_box" ).hide();
				$( "#tipcontainer" ).load( "https://tsunami643.github.com/tips.html #"+hero, function() {
                    $(this).slideDown(500);
					$( "#tipcontainer" ).css({display: "inline-block"});
					$( ".arrow_box" ).css({display: "block"});
					currenthero = hero;
                });
			});
	}
	
  $( "#randomhero" ).click(function() {
		angle+=360;
		$(this).css ({
			'-webkit-transform': 'rotate(' + angle + 'deg)',
			'-moz-transform': 'rotate(' + angle + 'deg)',
			'-o-transform': 'rotate(' + angle + 'deg)',
            '-ms-transform': 'rotate(' + angle + 'deg)'
		});
	
		var randhero = Math.floor(Math.random()*heroes.length)
		$('#heroinput .typeahead').val(heroes[randhero]);
		loadHero(randhero);
	});
  
  $('#heroinput .typeahead').on("keyup typeahead:selected typeahead:autocompleted", function() {
	var heroeslower = $.map( heroes, function (h) { return h.toLowerCase(); } );
	var herotext = $('#heroinput .typeahead').typeahead('val');
	heroindex = $.inArray( herotext.toLowerCase(), heroeslower );
	
	if (heroindex > -1) {
		$('#heroinput .typeahead').typeahead('close');
		
		if (heroindex > -1 && heroindex != currenthero){
			loadHero(heroindex);
			//$( "#heroinput .typeahead" ).blur();
			console.log(currenthero);
			}
		}
	});
  
  $('#heroinput .typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 2
},

{
  name: 'heroes',
  displayKey: 'value',
  source: substringMatcher(heroes)
});
}

$( function() { QuoteGen(); } );