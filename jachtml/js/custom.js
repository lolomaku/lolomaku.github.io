/*-----------------------------------------------------------------------------------*/
/*	FULL SCREEN FIRST SECTION
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';
	
	$(window).resize(function(){
		$('section.full').css({ 'height' : $(window).height() });
	});
	
	$(window).trigger('resize');

});
/*-----------------------------------------------------------------------------------*/
/*	ISOTOPE
/*-----------------------------------------------------------------------------------*/
jQuery(window).load(function($){
'use strict';

	jQuery('#loadmoremain.portfolio').isotope({
		itemSelector : 'li'
	});
	
	jQuery('#filters a').click(function(){
			var filter = jQuery(this).attr('href');
			var text = jQuery(this).html();
				jQuery('#filters a').removeClass('active');
				jQuery(this).addClass('active');
				jQuery('#loadmoremain.portfolio').isotope({ filter: filter });
				jQuery(window).trigger('resize');
				jQuery('small.portfolio-filter').html(text);
		return false;
	});
	
	jQuery(window).smartresize(function(){
		jQuery('.portfolio').isotope('reLayout');
		setTimeout(function(){
			jQuery('.portfolio').isotope('reLayout');
		}, 501);
	});
	
	jQuery('#load-more').click(function(){
		var url = jQuery(this).attr('href');
		jQuery(this).html('<img src="img/loader.gif" />');
		
		jQuery.get(url, function(data){
			var filtered = jQuery(data);
			filtered.imagesLoaded(function(){
				filtered.find('.isotope-alt-image').each(function(){
					jQuery(this).hoverdir();
				});
				jQuery('#loadmoremain.portfolio').isotope('insert', filtered).isotope('reLayout');
				jQuery('#load-more').fadeOut();
			});
		});
		return false;
	});
	
	
	jQuery(window).trigger('resize');
	
});
/*-----------------------------------------------------------------------------------*/
/*	ISOTOPE - TEAM ALTERATION
/*-----------------------------------------------------------------------------------*/
jQuery(window).load(function($){
'use strict';

	jQuery('#loadmoreteam.team').isotope({
		itemSelector : 'li'
	});
	
	jQuery('#filters a').click(function(){
			var filter = jQuery(this).attr('href');
			var text = jQuery(this).html();
				jQuery('#filters a').removeClass('active');
				jQuery(this).addClass('active');
				jQuery('#loadmoreteam.team').isotope({ filter: filter });
				jQuery(window).trigger('resize');
				jQuery('small.portfolio-filter').html(text);
		return false;
	});
	
	jQuery(window).smartresize(function(){
		jQuery('.team').isotope('reLayout');
		setTimeout(function(){
			jQuery('.team').isotope('reLayout');
		}, 501);
	});
	
	jQuery('#load-more-team').click(function(){
		var url = jQuery(this).attr('href');
		jQuery(this).html('<img src="img/loader.gif" />');
		jQuery.get(url, function(data){
			var filtered = jQuery(data);
			filtered.imagesLoaded(function(){
				filtered.find('.isotope-alt-image').each(function(){
					jQuery(this).hoverdir();
				});
				jQuery('#loadmoreteam.team').isotope('insert', filtered).isotope('reLayout');
				jQuery('#load-more-team').fadeOut();
			});
		});
		return false;
	});
	
	
	jQuery(window).trigger('resize');
	
});
/*-----------------------------------------------------------------------------------*/
/*	HOVER DIR
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';

	$(function(){
		$('.isotope-alt-image').each( function() { $(this).hoverdir(); } );
	});
	
	$('.member a').click(function(){
		return false;
	});

});
/*-----------------------------------------------------------------------------------*/
/*	SCROLL TO TOP OF PAGE
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';

	$('.scroller').click(function(){
		var url = $(this).attr('href');
		$("html, body").animate({ scrollTop: $(url).offset().top - 64 }, 500);
		return false;
	});
	
	$('#selectnav .scroller').click(function(){
		$('#selectnav .scroller').removeClass('active');
		$(this).addClass('active');
		return false;
	});
	
	$(window).scroll(function(){
		
		var scrollTop = $(window).scrollTop() / 12;
		
		if( scrollTop < 20 ){
			$('header').css({
				'padding-top' : 25 - scrollTop, 
				'padding-bottom' : 25 - scrollTop
			});
		} else {
			$('header').css({
				'padding-top' : 5, 
				'padding-bottom' : 5
			});
		}
		
		$('#selectnav .scroller').each(function(){
			var scrollHref = $(this).attr('href');
			if( $(window).scrollTop() > $(scrollHref).offset().top - 240 ) {
				$('#selectnav .scroller').removeClass('active');
				$(this).addClass('active');
			}
		});
		
	});

});
/*-----------------------------------------------------------------------------------*/
/*	MOBILE NAV
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';

	selectnav('selectnav');
	
});
/*-----------------------------------------------------------------------------------*/
/*	PORTFOLIO
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';

	$('body').on('click', '.portfolio a', function(){
	
		var url = $(this).attr('href');
		
		$("html, body").animate({ scrollTop: $('#portfolio').offset().top + 60 }, 500);
	
		$('.portfolio, #load-more').animate({ 'left' : '-1215px', 'opacity' : '0' }, function(){
			$.get(url, function(data){
				var filtered = jQuery(data);
				$(".rslides", filtered).responsiveSlides({
				  speed: 500,
				  timeout: 4000,
				  pager: true
				});
				filtered.imagesLoaded(function(){
					$('.portfolio').css('max-height', '0');
					$('#loader').html(filtered).animate({ 'opacity' : '1', 'bottom' : '0' });
				});
			});
			
		});
		return false;
	});
	
	$('body').on('click', '.portfolio-close', function(){
	
		$('#loader').animate({ 'opacity' : '0', 'bottom' : '-50px' }, function(){
			$(this).html(' ');
			$('.portfolio, #load-more').css('max-height', '').animate({ 'left' : '0', 'opacity' : '1' });
		});
		
		return false;
	});
	
});
/*-----------------------------------------------------------------------------------*/
/*	PORTFOLIO-TEAM ALTERATION
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';

	$('body').on('click', '.team a', function(){
	
		var url = $(this).attr('href');
		
		$("html, body").animate({ scrollTop: $('#team').offset().top + 60 }, 500);
	
		$('.team, #load-more-team').animate({ 'left' : '-1215px', 'opacity' : '0' }, function(){
			$.get(url, function(data){
				var filtered = jQuery(data);
				$(".rslides", filtered).responsiveSlides({
				  speed: 500,
				  timeout: 4000,
				  pager: true
				});
				filtered.imagesLoaded(function(){
					$('.team').css('max-height', '0');
					$('#loader').html(filtered).animate({ 'opacity' : '1', 'bottom' : '0' });
				});
			});
			
		});
		return false;
	});
	
	$('body').on('click', '.portfolio-close', function(){
	
		$('#loader').animate({ 'opacity' : '0', 'bottom' : '-50px' }, function(){
			$(this).html(' ');
			$('.team, #load-more-team').css('max-height', '').animate({ 'left' : '0', 'opacity' : '1' });
		});
		
		return false;
	});
	
});
/*-----------------------------------------------------------------------------------*/
/*	FANCY SCROLL EFFECTS
/*-----------------------------------------------------------------------------------*/
jQuery(window).load(function($){
'use strict';
	
	jQuery('.scroll-animate').espy(function (entered, state) {
	    if (entered && jQuery(this).hasClass('left') ) {
	        jQuery(this).delay(200).animate({ 'opacity' : '1', 'left' : '0' });
	    }
	    if (entered && jQuery(this).hasClass('right') ) {
	        jQuery(this).delay(200).animate({ 'opacity' : '1', 'right' : '0' });
	    }
	    if (entered && jQuery(this).hasClass('bottom') ) {
	        jQuery(this).delay(200).animate({ 'opacity' : '1', 'bottom' : '0' });
	    }
	    if (entered && jQuery(this).hasClass('top') ) {
	        jQuery(this).delay(200).animate({ 'opacity' : '1', 'top' : '0' });
	    }
	});

});
/*-----------------------------------------------------------------------------------*/
/*	SLIDER
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';

	$(".rslides").responsiveSlides({
	  speed: 500,
	  timeout: 6000,
	  pager: true
	});
	
});
/*-----------------------------------------------------------------------------------*/
/*	ALERTS
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';

		$('.alert i').click(function(){
			$(this).parent().slideUp();
		});

});
/*-----------------------------------------------------------------------------------*/
/*	ACCORDION
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';

		$('.accordion > dd.active').show();
		  
		$('.accordion > dt > a').click(function() {
			if( $(this).parent().hasClass('active') ){
				$(this).parents('.accordion').find('dt').removeClass('active');
				$(this).parents('.accordion').find('dd').removeClass('active').slideUp();
				return false;
			} else {
				$(this).parents('.accordion').find('dt').removeClass('active');
				$(this).parents('.accordion').find('dd').removeClass('active').slideUp();
				$(this).parent().addClass('active').next().addClass('active').slideDown();
				return false;
			}
		});

});
/*-----------------------------------------------------------------------------------*/
/*	CONTACT FORM
/*-----------------------------------------------------------------------------------*/
jQuery(document).ready(function($){
'use strict';

	//CONTACT FORM
	$('#contactform').submit(function(){

		var action = $(this).attr('action');

		$("#message").slideUp(750,function() {
		$('#message').hide();

 		$('#submit').attr('disabled','disabled');

		$.post(action, {
			name: $('#name').val(),
			email: $('#email').val(),
			website: $('#website').val(),
			comments: $('#comments').val()
		},
			function(data){
				document.getElementById('message').innerHTML = data;
				$('#message').slideDown('slow');
				$('#submit').removeAttr('disabled');
				if(data.match('success') != null) $('#contactform').slideUp('slow');
				$(window).trigger('resize');
			}
		);

		});

		return false;

	});
	
});
