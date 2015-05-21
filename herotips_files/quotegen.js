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
 "Did I pull you out of the trench?  Let me know ",
 "Found a mistake?  Let me know ",
 "Have a suggestion? Let me know ",
 "Got a tip to add? Let me know ",
 "Discover a new counter? Let me know "
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
  'Techies', 'Oracle', 'Winter Wyvern'
];

function QuoteGen() {
  var quotenum= Math.floor(Math.random()*startquotearray.length);
  var currenthero;
  var heroindex;
  $('#StartQuote').text( startquotearray[quotenum] );
  $('#EndQuote').text( endquotearray[quotenum] );
  $('#FooterQuote').text( footerquotearray[Math.floor(Math.random()*footerquotearray.length)] );
  
  var alphasort = heroes.concat().sort(); //Alphabetized copy of hero array
  
  var angle = 0; //Starting angle for random button
  
  var rect = heroinput.getBoundingClientRect().left;
  var zoom = document.documentElement.clientWidth / window.innerWidth;
  
  //Wait for webfont to load before positioning arrow
  $( window ).load(function()  {
	$("#heroinput .typeahead").focus();
	
	rect = heroinput.getBoundingClientRect().left;
	$('head').append("<style>.arrow_box:before{left: "+(rect+144)+"px;}</style>");
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
	
	(function(a){(jQuery.browser=jQuery.browser||{}).mobile=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);
	
	function loadHero(hero){
		$('#inputline').animate({padding: "30px 10px 30px"}, 800);
			$( "#tipcontainer" ).slideUp(300, function()
			{
				$( ".arrow_box" ).hide();
				$( "#tipcontainer" ).load( "http://tsunami643.github.io/herotips_files/tips.html #"+hero, function() {
                    $(this).slideDown(500);
					
					var sortedhero = $.inArray( heroes[hero], alphasort );
					
					if (sortedhero > 0){
						$( "#herotitle" ).prepend('<span id="prevhero" style="width: 55px;"><a style="color: #BEBEBE; text-decoration: none; cursor:pointer; position: relative; font-size: 110px; padding-right: 10px;"><</a></span>');
					}
					else {
						$( "#herotitle" ).css("padding-left", "55px");
					}

					if (sortedhero < heroes.length-1){
						$( "#herotitle" ).append('<span id="nexthero" style="width: 55px;"><a style="width: 55px; color: #BEBEBE; text-decoration: none; cursor:pointer; position: relative; font-size: 110px; padding-left: 10px;">></a></span>');
					}
					else {
						$( "#herotitle" ).css("padding-right", "55px");
					}
					
					if(jQuery.browser.mobile == false){
						$('#prevhero').fadeTo(1200, 0);
						$('#nexthero').fadeTo(1200, 0);
					}
					
					$('#herotitle').hover(function() { 
						$('#prevhero').fadeTo(100, 1);
						$('#nexthero').fadeTo(100, 1); 
					}, function() { 
						$('#prevhero').fadeTo(100, 0); 
						$('#nexthero').fadeTo(100, 0); 
					});
					
					$( "#tipcontainer" ).css({display: "inline-block"});
					$( ".arrow_box" ).css({display: "block"});
					currenthero = hero;
					
					$( "#prevhero" ).click(function() {
						var alphaprevhero = sortedhero-1;
						var prevhero = $.inArray( alphasort[alphaprevhero], heroes );
						$('#heroinput .typeahead').val(heroes[prevhero]);
						loadHero(prevhero);
					});
					$( "#nexthero" ).click(function() {
						var alphanexthero = sortedhero+1;
						var nexthero = $.inArray( alphasort[alphanexthero], heroes );
						$('#heroinput .typeahead').val(heroes[nexthero]);
						loadHero(nexthero);
					});
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
			if(jQuery.browser.mobile == true){
						$( "#heroinput .typeahead" ).blur();
					}
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