$(document).ready(function() {

   var littleJungle = new LittleJungle();
   littleJungle.init();

});

function LittleJungle() {
	
	// SELECT ONCE
	var els = {
        window: $(window),
		document: $(document),
		page: $('html, body'),
		body: $('body'),
		logos: $('#logos li'),
		fixed: $('#fixed'),
		navLink: $('#nav a, #logos img'),
		nav: $('#nav'),
		showLink: $('a.showall'),
		hideLink: $('a.hideall'),
		bigger: $('.bigger_items'),
		smaller: $('.smaller_items'),
		sides: $('.sides_items'),
		container: $('.container'),
		loader: $('#loader'),
		sections: $('.section'),
		fadeIn: $('.section, #fixed'),
		newsSlider: $('.news_slider'),
    }

	var sections = {};
	
	function init() {
		
		// ON LOAD
		els.window.load(function(){
			setTimeout(function() {
				els.loader.hide();
				els.fadeIn.removeClass('invisible').addClass('fadeIn');
			}, 5000);
			els.window.trigger('resize');
		});
			
		// SCROLL INTERVAL
		var scrolled = false;
		els.window.bind('scroll', function() {
	        scrolled = true;
	    });
		setInterval(function() {
			if(scrolled) {
				scrolled = false;
				scrollChange();
			}
		}, 100);
		
		// FLEX SLIDER PLUGIN
		els.newsSlider.flexslider({
			animation: "slide",
			slideshow: false,
			keyboardNav: false,
			controlsContainer: "#news"
		});
		
		// VERTICAL CENTERING
		els.window.on('resize',function(){
			//CONTAINER
			els.container.each(function(){
				$container = $(this);
				$section = $container.parent();
				var margin_top = ($section.height() - $container.height())/2;
				$container.css('margin-top',margin_top);
			});
			// SLIDERS
			$('.slide_container').each(function() {
				$slide_containers = $(this);
				var margintop = (els.sections.height() - $slide_containers.height())/2;
				$slide_containers.css('margin-top',margintop);
			});
		});
		
		// NEWS LINKOUTS
		$('#news a').attr('target','_blank');

		// KEYBOARD NAV
		els.document.keydown(function(event) {
			var navCur = $('#nav li.current');
			if (event.keyCode == 38) { // up arrow
				navCur.prev().find('a').click();
				event.preventDefault();
			} else if (event.keyCode == 40) { // down arrow
				navCur.next().find('a').click();
				event.preventDefault();
			} else if (event.keyCode == 37) { // left arrow
				if (els.body.hasClass("news")) {
					$('#news .flex-direction-nav a.prev').click();
				} else {
					return false;
				}
				event.preventDefault();
			}
			else if (event.keyCode == 39) { // right arrow
				if (els.body.hasClass("news")) {
					$('#news .flex-direction-nav a.next').click();
				} else {
					return false;
				}
				event.preventDefault();
			}
		});
		
		// NAV CLICK HANDLERS
		els.navLink.click(function(){
			var $this = $(this);
			if ($this.hasClass('home') || $this.hasClass('up')) {
				els.page.animate({scrollTop:0}, 500);
			} else if ($this.hasClass('about')) {
				els.page.animate({scrollTop:$('#about').offset().top}, 500);
			} else if ($this.hasClass('news')) {
				els.page.animate({scrollTop:$('#news').offset().top}, 500);
			} else if ($this.hasClass('findus')) {
				els.page.animate({scrollTop:$('#findus').offset().top}, 500);
			}
			return false;
		});

	};

  function adjustNav($nav, $el, $logos, $els, pos, curClass) {
		$nav.find('.'+curClass).removeClass(curClass);
		$el.addClass(curClass);
		$logos.removeClass();
	    $els.addClass(curClass);
		els.body.removeClass().addClass(pos);
	};

	function getPositions() {
		els.nav.find('a').each(function() {
			var linkHref = $(this).attr('href');
			var divPos = $(linkHref).offset().top;
			sections[linkHref.substr(1)] = Math.round(divPos);
		});
    };
	
	function getSection(windowPos) {			
		var returnValue = ''
		var windowHeight = Math.round(els.window.height() / 32);
		for(var section in sections) {
			if((sections[section] - windowHeight) < windowPos) {
				returnValue = section;
			}
		}
		return returnValue;
    };

	function scrollChange() {	      
		getPositions();	
		var windowTop = els.window.scrollTop();
		var winHeight = els.window.height()/32;
        var position = getSection(windowTop);
		if(position !== '') {
			adjustNav(
				els.nav,
				els.nav.find('a[href=#'+position+']').parent(),
				els.logos, 
				els.logos.find('a[href=#'+position+']').parent(),
				position, 
				'current'
			);
		}
		if (windowTop >= els.sections.height()-(winHeight)) {
			els.fixed.css('z-index','8');
		} else {
			els.fixed.css('z-index','5');
		}
    };

	// FADE ON LOGO CHANGE
	$("#logos li:not(:first-child)").css({
		'-webkit-transition':'opacity .3s ease-in-out',
		'-moz-transition': 'opacity .3s ease-in-out',
		'-o-transition': 'opacity .3s ease-in-out',
		'-ms-transition': 'opacity .3s ease-in-out',
		'transition': 'opacity .3s ease-in-out',
	});

	// RETURN
	return {
		init: init
	}
	
};

// GOOGLE MAPS
function initialize() {
	var latlng = new google.maps.LatLng(10.874864, 123.342462);
	var stylez = [{
	      featureType: "all",
	      elementType: "all",
	      stylers: [
	        { saturation: -100 }
	      ]
	}];
	var settings = {
		zoom: 15,
		center: latlng,
		mapTypeControl: false,
		//draggable: false,
		mapTypeControlOptions: {
	         mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'grayscale']
	    },
		navigationControl: false,
		navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
		zoomControl: false,
		scrollwheel: false
	};
	var map = new google.maps.Map(document.getElementById("map_canvas"), settings);
	var mapType = new google.maps.StyledMapType(stylez, { name:"Grayscale" });    
	map.mapTypes.set('grayscale', mapType);
	map.setMapTypeId('grayscale');

	var companyImage = new google.maps.MarkerImage('images/map_marker.png',
		new google.maps.Size(65,97),
		new google.maps.Point(0,0),
		new google.maps.Point(35,98)
	);

	var companyShadow = new google.maps.MarkerImage('images/marker_shadow.png',
		new google.maps.Size(65,97),
		new google.maps.Point(0,0),
		new google.maps.Point(35,98));

	var companyPos = new google.maps.LatLng(40.727897, -73.984399);

	var companyMarker = new google.maps.Marker({
		position: companyPos,
		map: map,
		icon: companyImage,
		shadow: companyShadow,
		title:"Little Jungle Resort",
		zIndex: 3});
}

// RESPONSIVE IMAGES
(function( win ){
	var	sw = win.screen.width,
	doc = win.document,
	def = win.responsive_imgs || {},
	cookieName = def.cookieName || "rwd-screensize",
	cookieValue = def.cookieValue || sw > 500 ?  ( sw > 1000 ? "large" : "medium" ) : "small",
	cookieAge = def.cookieAge || 30000,
	cookieDomain = def.cookieDomain,
	cookiePath = def.cookiePath || "/",
	recordRes = (function(){
		var date = new Date();
		date.setTime( date.getTime() + cookieAge );
		doc.cookie = cookieName + "=" + cookieValue + ";" +
			"expires=" + date.toGMTString() + ";" +
			(cookiePath ? "path=" + cookiePath + ";" : "" ) +
			( cookieDomain ? "domain=" + cookieDomain + ";" : "");
	})();
})(this);





