jQuery(document).ready(function($){
	var $windowsize = $(window);
	$windowsize.resize(function() {
		 if ($windowsize.width() < 1040) {
		    $('#nav').hide();
		  }
		else {
		    $('#nav').show();
		}
	});
	$('#trigger').on('click', function(e) {
		e.preventDefault();
	    $('#nav').slideToggle('slow');
	});
});